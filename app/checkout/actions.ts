"use server";

import type { CheckoutData, CartItem } from "@/types";
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
  getArgentinaCountryId,
  getStateId,
  CONDICION_IVA_MAP,
} from "@/lib/odoo/partners";
import { createOrder } from "@/lib/odoo/orders";
import { createPreference } from "@/lib/mercadopago/preferences";
import { getDeliveryMethodLabel, classifyCartItems } from "@/lib/data/delivery";
import { getBranchById } from "@/lib/odoo/branches";

/** Convert cart items to Odoo order lines. Gas items with containerCapacity
 *  send total gas quantity (capacity × containers) and price per unit of measure. */
function toOrderLines(items: CartItem[]) {
  return items.map((item) => {
    if (item.containerCapacity && item.containerCapacity > 0) {
      return {
        productId: item.productId,
        quantity: item.containerCapacity * item.quantity,
        priceUnit: item.price / item.containerCapacity,
      };
    }
    return {
      productId: item.productId,
      quantity: item.quantity,
      priceUnit: item.price,
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
      // If no billingAddressId and no billingAddress, invoiceAddressId stays
      // undefined and Odoo defaults to the partner itself.
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

    // 5. Determine if we need to split into 2 orders
    const session = await auth();
    const pricelistId = session?.user?.pricelistId ?? undefined;
    const { ownDelivery, carrierDelivery } = classifyCartItems(cartItems);
    const isMixedCart = ownDelivery.length > 0 && carrierDelivery.length > 0;
    const shouldSplit =
      isMixedCart && data.deliveryMethod !== data.carrierDeliveryMethod;

    let externalReference: string;

    if (shouldSplit) {
      // ── Split into 2 separate Odoo orders ──
      const gasNotes = await buildDeliveryNotes(data, ownDelivery, "gas");
      const gasFullNotes = [data.notes, gasNotes].filter(Boolean).join("\n\n");
      const gasLines = toOrderLines(ownDelivery);
      const gasOrderId = await createOrder(
        partnerId,
        gasLines,
        shippingAddressId,
        gasFullNotes || undefined,
        pricelistId,
        invoiceAddressId,
      );

      const supplyNotes = await buildDeliveryNotes(
        data,
        carrierDelivery,
        "supply",
      );
      const supplyFullNotes = [data.notes, supplyNotes]
        .filter(Boolean)
        .join("\n\n");
      const supplyLines = toOrderLines(carrierDelivery);
      const supplyOrderId = await createOrder(
        partnerId,
        supplyLines,
        shippingAddressId,
        supplyFullNotes || undefined,
        pricelistId,
        invoiceAddressId,
      );

      externalReference = `orders_${gasOrderId}_${supplyOrderId}`;
    } else {
      // ── Single order (pure cart or both use same delivery) ──
      const orderLines = toOrderLines(cartItems);
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
      );

      externalReference = `order_${orderId}`;
    }

    // 6. Create MercadoPago preference (unit_price includes tax)
    const mpItems = cartItems.map((item) => {
      const rate = item.taxRate ?? 21;
      return {
        title: item.name,
        quantity: item.quantity,
        unit_price: Math.round(item.price * (1 + rate / 100) * 100) / 100,
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
