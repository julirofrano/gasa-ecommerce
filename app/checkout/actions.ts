"use server";

import type { CheckoutData, CartItem, Address, DeliveryMethod } from "@/types";
import { auth } from "@/auth";
import {
  validateCUIT,
  validateEmail,
  validatePhone,
} from "@/lib/utils/validation";
import {
  createPartner,
  createPartnerAddress,
  updatePartner,
  getPartner,
  getPartnerAddresses,
  getArgentinaCountryId,
  getStateId,
  CONDICION_IVA_MAP,
} from "@/lib/odoo/partners";
import { createOrder } from "@/lib/odoo/orders";
import { createPreference } from "@/lib/mercadopago/preferences";
import { getDeliveryMethodLabel, classifyCartItems } from "@/lib/data/delivery";
import { getBranchById } from "@/lib/odoo/branches";
import { refreshCartPrices } from "@/app/(shop)/cart/actions";
import {
  getWarehouseByCompanyId,
  findNearestWarehouseId,
} from "@/lib/odoo/warehouses";
import { geocodeAddress } from "@/lib/geocoding/nominatim";
import {
  setPartnerPassword,
  setPortalActive,
  generateSignupToken,
} from "@/lib/odoo/portal";
import { sendWelcomeEmail } from "@/lib/email/send";

/** Convert cart items to Odoo order lines. Gas items with containerCapacity
 *  send total gas quantity (capacity × containers) and price per unit of measure.
 *  Uses server-verified prices when available. */
function toOrderLines(
  items: CartItem[],
  serverPrices?: Record<string, number>,
) {
  return items.map((item) => {
    const price = serverPrices?.[item.cartKey] ?? item.price;
    if (item.containerCapacity && item.containerCapacity > 0) {
      return {
        productId: item.productId,
        quantity: item.containerCapacity * item.quantity,
        priceUnit: price / item.containerCapacity,
      };
    }
    return {
      productId: item.productId,
      quantity: item.quantity,
      priceUnit: price,
    };
  });
}

interface SubmitResult {
  redirectUrl?: string;
  errors?: Record<string, string>;
}

function validateCheckoutData(data: CheckoutData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.email || !validateEmail(data.email)) {
    errors.email = "Ingrese un email válido";
  }
  if (!data.phone || !validatePhone(data.phone)) {
    errors.phone = "Ingrese un teléfono válido";
  }
  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Ingrese su nombre o razón social";
  }
  if (!data.vat || !validateCUIT(data.vat)) {
    errors.vat = "Ingrese un CUIT/CUIL válido (11 dígitos)";
  }
  if (!data.condicionIva) {
    errors.condicionIva = "Seleccione su condición ante el IVA";
  }

  // Shipping address — skip validation when using a saved address
  if (!data.shippingAddressId) {
    const sa = data.shippingAddress;
    if (!sa.street || sa.street.trim().length < 3) {
      errors["shippingAddress.street"] = "Ingrese la dirección de envío";
    }
    if (!sa.city || sa.city.trim().length < 2) {
      errors["shippingAddress.city"] = "Ingrese la ciudad";
    }
    if (!sa.state) {
      errors["shippingAddress.state"] = "Seleccione la provincia";
    }
    if (!sa.zipCode || sa.zipCode.trim().length < 4) {
      errors["shippingAddress.zipCode"] = "Ingrese el código postal";
    }
  }

  // Delivery method
  if (!data.deliveryMethod) {
    errors.deliveryMethod = "Seleccione un método de entrega";
  }
  if (data.deliveryMethod === "branch_pickup" && !data.deliveryBranchId) {
    errors.deliveryBranchId = "Seleccione una sucursal";
  }
  if (
    data.carrierDeliveryMethod === "branch_pickup" &&
    !data.carrierDeliveryBranchId
  ) {
    errors.carrierDeliveryBranchId = "Seleccione una sucursal";
  }

  // Billing address — skip when using saved address or "same as shipping"
  if (data.billingAddress && !data.billingAddressId) {
    const ba = data.billingAddress;
    if (!ba.street || ba.street.trim().length < 3) {
      errors["billingAddress.street"] = "Ingrese la dirección de facturación";
    }
    if (!ba.city || ba.city.trim().length < 2) {
      errors["billingAddress.city"] = "Ingrese la ciudad";
    }
    if (!ba.state) {
      errors["billingAddress.state"] = "Seleccione la provincia";
    }
    if (!ba.zipCode || ba.zipCode.trim().length < 4) {
      errors["billingAddress.zipCode"] = "Ingrese el código postal";
    }
  }

  return errors;
}

async function resolveWarehouseId(
  deliveryMethod: DeliveryMethod,
  branchId: number | undefined,
  shippingAddress: Address,
): Promise<number | undefined> {
  try {
    if (deliveryMethod === "branch_pickup" && branchId) {
      const whId = await getWarehouseByCompanyId(branchId);
      return whId ?? undefined;
    }

    // For own_delivery / carrier_delivery: find nearest warehouse to shipping address
    let lat = shippingAddress.lat;
    let lng = shippingAddress.lng;

    if (!lat || !lng) {
      const geo = await geocodeAddress({
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zipCode,
        country: "Argentina",
      });
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
      }
    }

    if (lat && lng) {
      const whId = await findNearestWarehouseId(lat, lng);
      return whId ?? undefined;
    }

    return undefined;
  } catch (error) {
    console.error("Warehouse resolution failed, using Odoo default:", error);
    return undefined;
  }
}

export async function submitCheckout(
  data: CheckoutData,
  cartItems: CartItem[],
): Promise<SubmitResult> {
  // 1. Server-side validation
  const errors = validateCheckoutData(data);
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  if (cartItems.length === 0) {
    return { errors: { general: "El carrito está vacío" } };
  }

  try {
    let partnerId: number;
    let shippingAddressId: number;
    let invoiceAddressId: number | undefined;

    if (data.existingPartnerId) {
      // ── Logged-in path: use existing partner, skip partner creation ──
      partnerId = data.existingCompanyId ?? data.existingPartnerId;

      // Save fiscal data to commercial partner if newly entered at checkout
      const fiscalUpdate: Record<string, unknown> = {};
      if (data.saveVat && data.vat) {
        fiscalUpdate.vat = data.vat.replace(/\D/g, "");
      }
      if (data.saveCondicionIva && data.condicionIva) {
        const afipTypeId = CONDICION_IVA_MAP[data.condicionIva];
        if (afipTypeId) {
          fiscalUpdate.l10n_ar_afip_responsibility_type_id = afipTypeId;
        }
      }
      if (Object.keys(fiscalUpdate).length > 0) {
        await updatePartner(partnerId, fiscalUpdate);
      }

      // Shipping address
      if (data.shippingAddressId) {
        shippingAddressId = data.shippingAddressId;
      } else {
        // Create new delivery address under the company
        const countryId = await getArgentinaCountryId();
        const shippingStateId = countryId
          ? await getStateId(data.shippingAddress.state, countryId)
          : null;

        shippingAddressId = await createPartnerAddress(partnerId, "delivery", {
          name: data.name,
          street: data.shippingAddress.street,
          street2: data.shippingAddress.street2,
          city: data.shippingAddress.city,
          stateId: shippingStateId ?? undefined,
          countryId: countryId ?? undefined,
          zip: data.shippingAddress.zipCode,
          phone: data.phone,
        });

        if (data.shippingAddress.lat && data.shippingAddress.lng) {
          await updatePartner(shippingAddressId, {
            partner_latitude: data.shippingAddress.lat,
            partner_longitude: data.shippingAddress.lng,
          });
        }
      }

      // Billing address
      if (data.billingAddressId) {
        invoiceAddressId = data.billingAddressId;
      } else if (data.billingAddress) {
        // Create new invoice address under the company
        const countryId = await getArgentinaCountryId();
        const billingStateId = countryId
          ? await getStateId(data.billingAddress.state, countryId)
          : null;

        invoiceAddressId = await createPartnerAddress(partnerId, "invoice", {
          name: data.name,
          street: data.billingAddress.street,
          street2: data.billingAddress.street2,
          city: data.billingAddress.city,
          stateId: billingStateId ?? undefined,
          countryId: countryId ?? undefined,
          zip: data.billingAddress.zipCode,
          phone: data.phone,
        });

        if (data.billingAddress.lat && data.billingAddress.lng) {
          await updatePartner(invoiceAddressId, {
            partner_latitude: data.billingAddress.lat,
            partner_longitude: data.billingAddress.lng,
          });
        }
      }
      // "Same as shipping" — create/reuse an invoice-type address so it
      // appears on the profile and is available for future checkouts.
      if (!invoiceAddressId) {
        const existingInvoice = await getPartnerAddresses(partnerId, "invoice");

        if (data.shippingAddressId) {
          // Saved shipping address — read it for matching / copying
          const shipAddr = await getPartner(data.shippingAddressId);
          const match = shipAddr
            ? existingInvoice.find(
                (a) => a.street === shipAddr.street && a.city === shipAddr.city,
              )
            : undefined;

          if (match) {
            invoiceAddressId = match.id;
          } else if (shipAddr) {
            invoiceAddressId = await createPartnerAddress(
              partnerId,
              "invoice",
              {
                name: shipAddr.name,
                street: shipAddr.street || "",
                street2: shipAddr.street2 || undefined,
                city: shipAddr.city || "",
                stateId: shipAddr.state_id ? shipAddr.state_id[0] : undefined,
                countryId: shipAddr.country_id
                  ? shipAddr.country_id[0]
                  : undefined,
                zip: shipAddr.zip || "",
                phone: shipAddr.phone || undefined,
              },
            );
          } else {
            // Fallback if the address read fails
            invoiceAddressId = shippingAddressId;
          }
        } else {
          // New shipping address — use the form data
          const match = existingInvoice.find(
            (a) =>
              a.street === data.shippingAddress.street &&
              a.city === data.shippingAddress.city,
          );

          if (match) {
            invoiceAddressId = match.id;
          } else {
            const countryId = await getArgentinaCountryId();
            const stateId = countryId
              ? await getStateId(data.shippingAddress.state, countryId)
              : null;
            invoiceAddressId = await createPartnerAddress(
              partnerId,
              "invoice",
              {
                name: data.name,
                street: data.shippingAddress.street,
                street2: data.shippingAddress.street2,
                city: data.shippingAddress.city,
                stateId: stateId ?? undefined,
                countryId: countryId ?? undefined,
                zip: data.shippingAddress.zipCode,
                phone: data.phone,
              },
            );
          }
        }
      }
    } else {
      // ── Guest path: create new partner (existing logic) ──
      const countryId = await getArgentinaCountryId();
      const shippingStateId = countryId
        ? await getStateId(data.shippingAddress.state, countryId)
        : null;

      const billingAddr = data.billingAddress ?? data.shippingAddress;
      const billingStateId = data.billingAddress
        ? countryId
          ? await getStateId(data.billingAddress.state, countryId)
          : null
        : shippingStateId;

      const afipTypeId = CONDICION_IVA_MAP[data.condicionIva];

      partnerId = await createPartner({
        name: data.name,
        email: data.email,
        phone: data.phone,
        vat: data.vat,
        street: billingAddr.street,
        street2: billingAddr.street2,
        city: billingAddr.city,
        stateId: billingStateId ?? undefined,
        countryId: countryId ?? undefined,
        zip: billingAddr.zipCode,
        isCompany: !!data.companyName,
        afipResponsibilityTypeId: afipTypeId,
      });

      shippingAddressId = partnerId;

      // Save coords on the partner itself when no separate billing address
      if (
        data.shippingAddress.lat &&
        data.shippingAddress.lng &&
        !data.billingAddress
      ) {
        await updatePartner(partnerId, {
          partner_latitude: data.shippingAddress.lat,
          partner_longitude: data.shippingAddress.lng,
        });
      }

      if (data.billingAddress) {
        shippingAddressId = await createPartnerAddress(partnerId, "delivery", {
          name: data.name,
          street: data.shippingAddress.street,
          street2: data.shippingAddress.street2,
          city: data.shippingAddress.city,
          stateId: shippingStateId ?? undefined,
          countryId: countryId ?? undefined,
          zip: data.shippingAddress.zipCode,
          phone: data.phone,
        });

        if (data.shippingAddress.lat && data.shippingAddress.lng) {
          await updatePartner(shippingAddressId, {
            partner_latitude: data.shippingAddress.lat,
            partner_longitude: data.shippingAddress.lng,
          });
        }
      }
    }

    // 5. Re-fetch prices server-side — never trust client-provided prices
    const session = await auth();
    const pricelistId = session?.user?.pricelistId ?? undefined;
    const sessionWarehouseId = session?.user?.warehouseId ?? undefined;

    const serverPrices = await refreshCartPrices(
      cartItems.map((item) => ({
        cartKey: item.cartKey,
        productId: item.productId,
        productType: item.productType,
        variantId: item.variantId,
        containerCapacity: item.containerCapacity,
      })),
    );

    // 6. Determine if we need to split into 2 orders
    const { ownDelivery, carrierDelivery } = classifyCartItems(cartItems);
    const isMixedCart = ownDelivery.length > 0 && carrierDelivery.length > 0;
    const shouldSplit =
      isMixedCart && data.deliveryMethod !== data.carrierDeliveryMethod;

    let externalReference: string;

    if (shouldSplit) {
      // ── Split into 2 separate Odoo orders ──
      const gasWarehouseId =
        sessionWarehouseId ??
        (await resolveWarehouseId(
          data.deliveryMethod,
          data.deliveryBranchId,
          data.shippingAddress,
        ));
      const gasNotes = await buildDeliveryNotes(data, ownDelivery, "gas");
      const gasFullNotes = [data.notes, gasNotes].filter(Boolean).join("\n\n");
      const gasLines = toOrderLines(ownDelivery, serverPrices.prices);
      const gasOrderId = await createOrder(
        partnerId,
        gasLines,
        shippingAddressId,
        gasFullNotes || undefined,
        pricelistId,
        invoiceAddressId,
        gasWarehouseId,
      );

      const supplyMethod = data.carrierDeliveryMethod ?? data.deliveryMethod;
      const supplyBranchId =
        data.carrierDeliveryBranchId ?? data.deliveryBranchId;
      const supplyWarehouseId =
        sessionWarehouseId ??
        (await resolveWarehouseId(
          supplyMethod,
          supplyBranchId,
          data.shippingAddress,
        ));
      const supplyNotes = await buildDeliveryNotes(
        data,
        carrierDelivery,
        "supply",
      );
      const supplyFullNotes = [data.notes, supplyNotes]
        .filter(Boolean)
        .join("\n\n");
      const supplyLines = toOrderLines(carrierDelivery, serverPrices.prices);
      const supplyOrderId = await createOrder(
        partnerId,
        supplyLines,
        shippingAddressId,
        supplyFullNotes || undefined,
        pricelistId,
        invoiceAddressId,
        supplyWarehouseId,
      );

      externalReference = `orders_${gasOrderId}_${supplyOrderId}`;
    } else {
      // ── Single order (pure cart or both use same delivery) ──
      const warehouseId =
        sessionWarehouseId ??
        (await resolveWarehouseId(
          data.deliveryMethod,
          data.deliveryBranchId,
          data.shippingAddress,
        ));
      const orderLines = toOrderLines(cartItems, serverPrices.prices);
      const deliveryNotes = await buildDeliveryNotes(data, cartItems);
      const fullNotes = [data.notes, deliveryNotes]
        .filter(Boolean)
        .join("\n\n");

      const orderId = await createOrder(
        partnerId,
        orderLines,
        shippingAddressId,
        fullNotes || undefined,
        pricelistId,
        invoiceAddressId,
        warehouseId,
      );

      externalReference = `order_${orderId}`;
    }

    // 7. Create MercadoPago preference (unit_price includes tax)
    const mpItems = cartItems.map((item) => {
      const price = serverPrices.prices[item.cartKey] ?? item.price;
      const rate = serverPrices.taxRates[item.cartKey] ?? 21;
      return {
        title: item.name,
        quantity: item.quantity,
        unit_price: Math.round(price * (1 + rate / 100) * 100) / 100,
      };
    });

    // Add delivery cost as a line item if > 0 (delivery taxed at 21%)
    if (data.deliveryCost > 0) {
      mpItems.push({
        title: "Costo de envío",
        quantity: 1,
        unit_price: Math.round(data.deliveryCost * 1.21 * 100) / 100,
      });
    }

    const preference = await createPreference({
      items: mpItems,
      payerEmail: data.email,
      externalReference,
    });

    // Fire-and-forget: create portal account for guest checkouts
    if (!data.existingPartnerId) {
      createPortalAccountAsync(partnerId, data.email, data.name).catch((err) =>
        console.error("Portal creation failed (non-fatal):", err),
      );
    }

    return { redirectUrl: preference.init_point };
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      errors: {
        general:
          "Ocurrió un error al procesar su pedido. Por favor intente nuevamente.",
      },
    };
  }
}

async function createPortalAccountAsync(
  partnerId: number,
  email: string,
  name: string,
): Promise<void> {
  await setPartnerPassword(partnerId, crypto.randomUUID());
  await setPortalActive(partnerId, true);
  const token = await generateSignupToken(partnerId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLinkUrl = `${appUrl}/magic-link?token=${token}`;
  await sendWelcomeEmail(email, name, magicLinkUrl);
}

async function buildDeliveryNotes(
  data: CheckoutData,
  cartItems: CartItem[],
  splitType?: "gas" | "supply",
): Promise<string> {
  const lines: string[] = [];

  if (splitType === "gas") {
    // Notes for the gas/hazmat-only order
    const label = getDeliveryMethodLabel(data.deliveryMethod);
    lines.push(`Método de entrega: ${label}`);
    if (data.deliveryMethod === "branch_pickup" && data.deliveryBranchId) {
      const branch = await getBranchById(data.deliveryBranchId);
      if (branch) lines.push(`Sucursal: ${branch.name} — ${branch.address}`);
    }
  } else if (splitType === "supply") {
    // Notes for the supply-only order
    const method = data.carrierDeliveryMethod ?? data.deliveryMethod;
    const label = getDeliveryMethodLabel(method);
    lines.push(`Método de entrega: ${label}`);
    const branchId = data.carrierDeliveryBranchId ?? data.deliveryBranchId;
    if (method === "branch_pickup" && branchId) {
      const branch = await getBranchById(branchId);
      if (branch) lines.push(`Sucursal: ${branch.name} — ${branch.address}`);
    }
  } else {
    // Single order (pure cart or combined delivery)
    const { ownDelivery, carrierDelivery } = classifyCartItems(cartItems);
    const isMixedCart = ownDelivery.length > 0 && carrierDelivery.length > 0;

    if (isMixedCart) {
      // Combined delivery (e.g. both own_delivery)
      const gasMethodLabel = getDeliveryMethodLabel(data.deliveryMethod);
      lines.push(`Envío (Gases): ${gasMethodLabel}`);
      if (data.deliveryMethod === "branch_pickup" && data.deliveryBranchId) {
        const branch = await getBranchById(data.deliveryBranchId);
        if (branch)
          lines.push(`  Sucursal: ${branch.name} — ${branch.address}`);
      }
      if (data.carrierDeliveryMethod) {
        const supplyMethodLabel = getDeliveryMethodLabel(
          data.carrierDeliveryMethod,
        );
        lines.push(`Envío (Insumos): ${supplyMethodLabel}`);
        if (
          data.carrierDeliveryMethod === "branch_pickup" &&
          data.carrierDeliveryBranchId
        ) {
          const branch = await getBranchById(data.carrierDeliveryBranchId);
          if (branch)
            lines.push(`  Sucursal: ${branch.name} — ${branch.address}`);
        }
      }
    } else {
      const methodLabel = getDeliveryMethodLabel(data.deliveryMethod);
      lines.push(`Método de entrega: ${methodLabel}`);
      if (data.deliveryMethod === "branch_pickup" && data.deliveryBranchId) {
        const branch = await getBranchById(data.deliveryBranchId);
        if (branch) lines.push(`Sucursal: ${branch.name} — ${branch.address}`);
      }
    }
  }

  return lines.join("\n");
}
