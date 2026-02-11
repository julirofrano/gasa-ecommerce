"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { ROUTES } from "@/lib/utils/constants";
import {
  validateCUIT,
  validateEmail,
  validatePhone,
} from "@/lib/utils/validation";
import { submitCheckout } from "@/app/checkout/actions";
import type {
  Branch,
  CheckoutData,
  CheckoutPrefillData,
  CondicionIva,
  Address,
} from "@/types";
import {
  DeliverySelector,
  type DeliverySelection,
} from "@/components/checkout/delivery-selector";
import { AddressSelector } from "@/components/checkout/address-selector";
import { AddressMapWrapper } from "@/components/account/address-map-wrapper";
import { classifyCartItems, getDeliveryCost } from "@/lib/data/delivery";

const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
] as const;

const CONDICION_IVA_OPTIONS: { value: CondicionIva; label: string }[] = [
  { value: "responsable_inscripto", label: "Responsable Inscripto" },
  { value: "monotributo", label: "Monotributo" },
  { value: "exento", label: "Exento" },
  { value: "consumidor_final", label: "Consumidor Final" },
];

const CONDICION_IVA_LABELS: Record<string, string> = {
  responsable_inscripto: "Responsable Inscripto",
  monotributo: "Monotributo",
  exento: "Exento",
  consumidor_final: "Consumidor Final",
};

const inputClass =
  "w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm focus:border-[#0094BB] focus:outline-none";
const labelClass = "mb-2 block text-xs font-bold uppercase tracking-widest";
const errorClass = "mt-1 text-xs text-red-600";

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-6 border-b-2 border-foreground pb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#0094BB]">
        {number}
      </p>
      <h2 className="mt-1 text-lg font-black uppercase tracking-tight">
        {title}
      </h2>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className="border-b-2 border-foreground/20 py-3 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

interface CheckoutFormProps {
  prefill: CheckoutPrefillData | null;
  branches: Branch[];
}

export function CheckoutForm({ prefill, branches }: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const setDeliverySelectionStore = useUIStore((s) => s.setDeliverySelection);
  const [isPending, startTransition] = useTransition();

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.push(ROUTES.CART);
    }
  }, [items.length, router]);

  // Determine which billing fields are locked (have data from Odoo)
  const nameIsLocked = !!prefill?.name;
  const vatIsLocked = !!prefill?.vat;
  const condicionIvaIsLocked = !!prefill?.condicionIva;
  const companyNameIsLocked = !!prefill?.companyName;

  // Whether we have saved addresses to show selectors
  const hasShippingAddresses =
    (prefill?.deliveryAddresses?.length ?? 0) > 0 || !!prefill?.mainAddress;
  const hasInvoiceAddresses = (prefill?.invoiceAddresses?.length ?? 0) > 0;

  // Compute default shipping address ID
  const defaultShippingId: number | "new" =
    prefill?.deliveryAddresses?.[0]?.id ?? prefill?.mainAddress?.id ?? "new";

  // Form state — initialized from prefill
  const [email, setEmail] = useState(prefill?.email || "");
  const [phone, setPhone] = useState(prefill?.phone || "");
  const [name, setName] = useState(prefill?.name || "");
  const [vat, setVat] = useState(prefill?.vat || "");
  const [condicionIva, setCondicionIva] = useState<CondicionIva | "">(
    prefill?.condicionIva || "",
  );
  const [companyName, setCompanyName] = useState(prefill?.companyName || "");

  // Shipping address: saved address selection or manual
  const [selectedShippingId, setSelectedShippingId] = useState<number | "new">(
    hasShippingAddresses ? defaultShippingId : "new",
  );
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingStreet2, setShippingStreet2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingLat, setShippingLat] = useState<number | undefined>();
  const [shippingLng, setShippingLng] = useState<number | undefined>();

  // Billing address
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [selectedBillingId, setSelectedBillingId] = useState<number | "new">(
    hasInvoiceAddresses ? (prefill?.invoiceAddresses[0]?.id ?? "new") : "new",
  );
  const [billingStreet, setBillingStreet] = useState("");
  const [billingStreet2, setBillingStreet2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [billingLat, setBillingLat] = useState<number | undefined>();
  const [billingLng, setBillingLng] = useState<number | undefined>();

  const [notes, setNotes] = useState("");

  // Delivery state
  const [deliverySelection, setDeliverySelectionLocal] =
    useState<DeliverySelection | null>(null);

  function setDeliverySelection(selection: DeliverySelection | null) {
    setDeliverySelectionLocal(selection);
    setDeliverySelectionStore(selection);
  }

  // Resolve the zip code for the delivery selector:
  // If a saved address is selected, use its zip; otherwise use manual input
  const resolvedShippingZip = (() => {
    if (selectedShippingId === "new") return shippingZip;
    const allAddresses = [
      ...(prefill?.mainAddress ? [prefill.mainAddress] : []),
      ...(prefill?.deliveryAddresses ?? []),
    ];
    const selected = allAddresses.find((a) => a.id === selectedShippingId);
    return selected?.zipCode || shippingZip;
  })();

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const usingSavedShipping =
    hasShippingAddresses && selectedShippingId !== "new";
  const usingSavedBilling = hasInvoiceAddresses && selectedBillingId !== "new";

  function validateField(field: string, value: string): string | null {
    switch (field) {
      case "email":
        return !value || !validateEmail(value)
          ? "Ingrese un email válido"
          : null;
      case "phone":
        return !value || !validatePhone(value)
          ? "Ingrese un teléfono válido"
          : null;
      case "name":
        return !value || value.trim().length < 2
          ? "Ingrese su nombre o razón social"
          : null;
      case "vat":
        return !value || !validateCUIT(value)
          ? "Ingrese un CUIT/CUIL válido (11 dígitos)"
          : null;
      case "condicionIva":
        return !value ? "Seleccione su condición ante el IVA" : null;
      case "shippingAddress.street":
        return !usingSavedShipping && (!value || value.trim().length < 3)
          ? "Ingrese la dirección"
          : null;
      case "shippingAddress.city":
        return !usingSavedShipping && (!value || value.trim().length < 2)
          ? "Ingrese la ciudad"
          : null;
      case "shippingAddress.state":
        return !usingSavedShipping && !value ? "Seleccione la provincia" : null;
      case "shippingAddress.zipCode":
        return !usingSavedShipping && (!value || value.trim().length < 4)
          ? "Ingrese el código postal"
          : null;
      case "billingAddress.street":
        return !sameBillingAddress &&
          !usingSavedBilling &&
          (!value || value.trim().length < 3)
          ? "Ingrese la dirección"
          : null;
      case "billingAddress.city":
        return !sameBillingAddress &&
          !usingSavedBilling &&
          (!value || value.trim().length < 2)
          ? "Ingrese la ciudad"
          : null;
      case "billingAddress.state":
        return !sameBillingAddress && !usingSavedBilling && !value
          ? "Seleccione la provincia"
          : null;
      case "billingAddress.zipCode":
        return !sameBillingAddress &&
          !usingSavedBilling &&
          (!value || value.trim().length < 4)
          ? "Ingrese el código postal"
          : null;
      case "deliveryMethod":
        return !value ? "Seleccione un método de entrega" : null;
      case "deliveryBranchId":
        return !value ? "Seleccione una sucursal" : null;
      case "carrierDeliveryMethod":
        return !value ? "Seleccione un método de entrega" : null;
      case "carrierDeliveryBranchId":
        return !value ? "Seleccione una sucursal" : null;
      default:
        return null;
    }
  }

  function handleBlur(field: string, value: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[field] = error;
      } else {
        delete next[field];
      }
      return next;
    });
  }

  function validateAll(): Record<string, string> {
    const allErrors: Record<string, string> = {};

    const fields: [string, string][] = [
      ["email", email],
      ["phone", phone],
      ["name", name],
      ["vat", vat],
      ["condicionIva", condicionIva],
    ];

    // Only validate manual shipping fields when not using a saved address
    if (!usingSavedShipping) {
      fields.push(
        ["shippingAddress.street", shippingStreet],
        ["shippingAddress.city", shippingCity],
        ["shippingAddress.state", shippingState],
        ["shippingAddress.zipCode", shippingZip],
      );
    }

    if (!sameBillingAddress && !usingSavedBilling) {
      fields.push(
        ["billingAddress.street", billingStreet],
        ["billingAddress.city", billingCity],
        ["billingAddress.state", billingState],
        ["billingAddress.zipCode", billingZip],
      );
    }

    for (const [field, value] of fields) {
      const error = validateField(field, value);
      if (error) allErrors[field] = error;
    }

    // Delivery validation
    if (!deliverySelection?.deliveryMethod) {
      allErrors.deliveryMethod = "Seleccione un método de entrega";
    }
    if (
      deliverySelection?.deliveryMethod === "branch_pickup" &&
      !deliverySelection.deliveryBranchId
    ) {
      allErrors.deliveryBranchId = "Seleccione una sucursal";
    }

    // Mixed cart: validate carrier delivery
    const { ownDelivery, carrierDelivery } = classifyCartItems(items);
    if (ownDelivery.length > 0 && carrierDelivery.length > 0) {
      if (!deliverySelection?.carrierDeliveryMethod) {
        allErrors.carrierDeliveryMethod = "Seleccione un método de entrega";
      }
      if (
        deliverySelection?.carrierDeliveryMethod === "branch_pickup" &&
        !deliverySelection.carrierDeliveryBranchId
      ) {
        allErrors.carrierDeliveryBranchId = "Seleccione una sucursal";
      }
    }

    return allErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validateAll();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const allTouched: Record<string, boolean> = {};
      for (const key of Object.keys(validationErrors)) {
        allTouched[key] = true;
      }
      setTouched((prev) => ({ ...prev, ...allTouched }));
      return;
    }

    // Build shipping address (for manual entry or as fallback)
    const shippingAddress: Address = usingSavedShipping
      ? {
          name,
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "Argentina",
        }
      : {
          name,
          street: shippingStreet,
          street2: shippingStreet2 || undefined,
          city: shippingCity,
          state: shippingState,
          zipCode: shippingZip,
          country: "Argentina",
          lat: shippingLat,
          lng: shippingLng,
        };

    const deliveryMethod = deliverySelection!.deliveryMethod;
    const deliveryCost = getDeliveryCost(deliveryMethod);

    // Build billing address
    let billingAddress: Address | undefined;
    if (!sameBillingAddress && !usingSavedBilling) {
      billingAddress = {
        name,
        street: billingStreet,
        street2: billingStreet2 || undefined,
        city: billingCity,
        state: billingState,
        zipCode: billingZip,
        country: "Argentina",
        lat: billingLat,
        lng: billingLng,
      };
    }

    const checkoutData: CheckoutData = {
      email,
      phone,
      name,
      vat,
      condicionIva: condicionIva as CondicionIva,
      companyName: companyName || undefined,
      shippingAddress,
      billingAddress,
      notes: notes || undefined,
      deliveryMethod,
      deliveryBranchId: deliverySelection!.deliveryBranchId,
      deliveryCost,
      carrierDeliveryMethod: deliverySelection!.carrierDeliveryMethod,
      carrierDeliveryBranchId: deliverySelection!.carrierDeliveryBranchId,
      // Prefill-specific fields
      existingPartnerId: prefill?.partnerId,
      existingCompanyId: prefill?.companyId,
      shippingAddressId: usingSavedShipping
        ? (selectedShippingId as number)
        : undefined,
      billingAddressId:
        !sameBillingAddress && usingSavedBilling
          ? (selectedBillingId as number)
          : undefined,
    };

    startTransition(async () => {
      const result = await submitCheckout(checkoutData, items);

      if (result.errors) {
        setErrors(result.errors);
        return;
      }

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    });
  }

  const fieldError = (field: string) =>
    touched[field] && errors[field] ? (
      <p className={errorClass}>{errors[field]}</p>
    ) : null;

  if (items.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {errors.general && (
        <div className="border-l-4 border-red-600 bg-red-50 p-4 text-sm font-bold text-red-600 dark:bg-red-950">
          {errors.general}
        </div>
      )}

      {/* 01. Contacto */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <SectionHeading number="01" title="Contacto" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email", email)}
              placeholder="nombre@empresa.com"
              className={inputClass}
              required
            />
            {fieldError("email")}
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => handleBlur("phone", phone)}
              placeholder="+54 261 1234567"
              className={inputClass}
              required
            />
            {fieldError("phone")}
          </div>
        </div>
      </section>

      {/* 02. Datos de Facturación */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <SectionHeading number="02" title="Datos de Facturación" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Name: read-only if prefilled */}
          <div className="md:col-span-2">
            {nameIsLocked ? (
              <ReadOnlyField label="Nombre / Razón Social" value={name} />
            ) : (
              <>
                <label htmlFor="name" className={labelClass}>
                  Nombre / Razón Social
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur("name", name)}
                  placeholder="Juan Pérez / Mi Empresa S.A."
                  className={inputClass}
                  required
                />
                {fieldError("name")}
              </>
            )}
          </div>

          {/* VAT: read-only if prefilled */}
          <div>
            {vatIsLocked ? (
              <ReadOnlyField label="CUIT / CUIL" value={vat} />
            ) : (
              <>
                <label htmlFor="vat" className={labelClass}>
                  CUIT / CUIL
                </label>
                <input
                  id="vat"
                  type="text"
                  value={vat}
                  onChange={(e) => setVat(e.target.value)}
                  onBlur={() => handleBlur("vat", vat)}
                  placeholder="XX-XXXXXXXX-X"
                  className={inputClass}
                  required
                />
                {fieldError("vat")}
              </>
            )}
          </div>

          {/* Condicion IVA: read-only if prefilled */}
          <div>
            {condicionIvaIsLocked ? (
              <ReadOnlyField
                label="Condición ante el IVA"
                value={CONDICION_IVA_LABELS[condicionIva] || condicionIva}
              />
            ) : (
              <>
                <label htmlFor="condicionIva" className={labelClass}>
                  Condición ante el IVA
                </label>
                <select
                  id="condicionIva"
                  value={condicionIva}
                  onChange={(e) =>
                    setCondicionIva(e.target.value as CondicionIva | "")
                  }
                  onBlur={() => handleBlur("condicionIva", condicionIva)}
                  className={inputClass}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {CONDICION_IVA_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {fieldError("condicionIva")}
              </>
            )}
          </div>

          {/* Company name: read-only if prefilled */}
          <div className="md:col-span-2">
            {companyNameIsLocked ? (
              <ReadOnlyField label="Empresa" value={companyName} />
            ) : (
              <>
                <label htmlFor="companyName" className={labelClass}>
                  Empresa{" "}
                  <span className="font-normal normal-case tracking-normal text-muted-foreground">
                    (opcional)
                  </span>
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nombre de la empresa"
                  className={inputClass}
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* 03. Dirección de Envío */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <SectionHeading number="03" title="Dirección de Envío" />

        {hasShippingAddresses ? (
          <>
            <AddressSelector
              addresses={prefill!.deliveryAddresses}
              mainAddress={prefill!.mainAddress}
              selectedId={selectedShippingId}
              onChange={setSelectedShippingId}
              name="shipping-address"
            />
            {selectedShippingId === "new" && (
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                {renderShippingFields()}
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {renderShippingFields()}
          </div>
        )}
      </section>

      {/* 04. Método de Entrega */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <SectionHeading number="04" title="Método de Entrega" />
        <DeliverySelector
          items={items}
          branches={branches}
          zipCode={resolvedShippingZip}
          selection={deliverySelection}
          onChange={setDeliverySelection}
          errors={errors}
        />
      </section>

      {/* 05. Dirección de Facturación */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <SectionHeading number="05" title="Dirección de Facturación" />
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={sameBillingAddress}
            onChange={(e) => setSameBillingAddress(e.target.checked)}
            className="h-4 w-4 accent-[#0094BB]"
          />
          <span className="text-sm font-bold">
            Usar misma dirección para facturación
          </span>
        </label>

        {!sameBillingAddress && (
          <div className="mt-6">
            {hasInvoiceAddresses ? (
              <>
                <AddressSelector
                  addresses={prefill!.invoiceAddresses}
                  mainAddress={null}
                  selectedId={selectedBillingId}
                  onChange={setSelectedBillingId}
                  name="billing-address"
                />
                {selectedBillingId === "new" && (
                  <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    {renderBillingFields()}
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {renderBillingFields()}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 06. Notas */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <SectionHeading number="06" title="Notas del Pedido" />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Instrucciones especiales de entrega (opcional)"
          rows={3}
          className={inputClass}
        />
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full border-2 border-[#009ee3] bg-[#009ee3] px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-[#007bbd] disabled:opacity-50"
      >
        {isPending ? "Procesando..." : "Pagar con MercadoPago"}
      </button>
    </form>
  );

  // ── Render helpers ──────────────────────────────────────────────────────

  function renderShippingFields() {
    return (
      <>
        <div className="md:col-span-2">
          <label htmlFor="shippingStreet" className={labelClass}>
            Dirección
          </label>
          <input
            id="shippingStreet"
            type="text"
            value={shippingStreet}
            onChange={(e) => setShippingStreet(e.target.value)}
            onBlur={() => handleBlur("shippingAddress.street", shippingStreet)}
            placeholder="Calle 123"
            className={inputClass}
            required
          />
          {fieldError("shippingAddress.street")}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="shippingStreet2" className={labelClass}>
            Piso / Depto{" "}
            <span className="font-normal normal-case tracking-normal text-muted-foreground">
              (opcional)
            </span>
          </label>
          <input
            id="shippingStreet2"
            type="text"
            value={shippingStreet2}
            onChange={(e) => setShippingStreet2(e.target.value)}
            placeholder="Piso 3, Depto B"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="shippingCity" className={labelClass}>
            Ciudad
          </label>
          <input
            id="shippingCity"
            type="text"
            value={shippingCity}
            onChange={(e) => setShippingCity(e.target.value)}
            onBlur={() => handleBlur("shippingAddress.city", shippingCity)}
            placeholder="Mendoza"
            className={inputClass}
            required
          />
          {fieldError("shippingAddress.city")}
        </div>
        <div>
          <label htmlFor="shippingState" className={labelClass}>
            Provincia
          </label>
          <select
            id="shippingState"
            value={shippingState}
            onChange={(e) => setShippingState(e.target.value)}
            onBlur={() => handleBlur("shippingAddress.state", shippingState)}
            className={inputClass}
            required
          >
            <option value="">Seleccionar...</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {fieldError("shippingAddress.state")}
        </div>
        <div>
          <label htmlFor="shippingZip" className={labelClass}>
            Código Postal
          </label>
          <input
            id="shippingZip"
            type="text"
            value={shippingZip}
            onChange={(e) => setShippingZip(e.target.value)}
            onBlur={() => handleBlur("shippingAddress.zipCode", shippingZip)}
            placeholder="5500"
            className={inputClass}
            required
          />
          {fieldError("shippingAddress.zipCode")}
        </div>
        {shippingStreet && shippingCity && (
          <div className="md:col-span-2">
            <AddressMapWrapper
              street={shippingStreet}
              city={shippingCity}
              state={shippingState}
              zip={shippingZip}
              country="Argentina"
              onCoordsCapture={(lat, lng) => {
                setShippingLat(lat);
                setShippingLng(lng);
              }}
            />
          </div>
        )}
      </>
    );
  }

  function renderBillingFields() {
    return (
      <>
        <div className="md:col-span-2">
          <label htmlFor="billingStreet" className={labelClass}>
            Dirección
          </label>
          <input
            id="billingStreet"
            type="text"
            value={billingStreet}
            onChange={(e) => setBillingStreet(e.target.value)}
            onBlur={() => handleBlur("billingAddress.street", billingStreet)}
            placeholder="Calle 456"
            className={inputClass}
            required
          />
          {fieldError("billingAddress.street")}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="billingStreet2" className={labelClass}>
            Piso / Depto{" "}
            <span className="font-normal normal-case tracking-normal text-muted-foreground">
              (opcional)
            </span>
          </label>
          <input
            id="billingStreet2"
            type="text"
            value={billingStreet2}
            onChange={(e) => setBillingStreet2(e.target.value)}
            placeholder="Piso 3, Depto B"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="billingCity" className={labelClass}>
            Ciudad
          </label>
          <input
            id="billingCity"
            type="text"
            value={billingCity}
            onChange={(e) => setBillingCity(e.target.value)}
            onBlur={() => handleBlur("billingAddress.city", billingCity)}
            placeholder="Buenos Aires"
            className={inputClass}
            required
          />
          {fieldError("billingAddress.city")}
        </div>
        <div>
          <label htmlFor="billingState" className={labelClass}>
            Provincia
          </label>
          <select
            id="billingState"
            value={billingState}
            onChange={(e) => setBillingState(e.target.value)}
            onBlur={() => handleBlur("billingAddress.state", billingState)}
            className={inputClass}
            required
          >
            <option value="">Seleccionar...</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {fieldError("billingAddress.state")}
        </div>
        <div>
          <label htmlFor="billingZip" className={labelClass}>
            Código Postal
          </label>
          <input
            id="billingZip"
            type="text"
            value={billingZip}
            onChange={(e) => setBillingZip(e.target.value)}
            onBlur={() => handleBlur("billingAddress.zipCode", billingZip)}
            placeholder="1000"
            className={inputClass}
            required
          />
          {fieldError("billingAddress.zipCode")}
        </div>
        {billingStreet && billingCity && (
          <div className="md:col-span-2">
            <AddressMapWrapper
              street={billingStreet}
              city={billingCity}
              state={billingState}
              zip={billingZip}
              country="Argentina"
              onCoordsCapture={(lat, lng) => {
                setBillingLat(lat);
                setBillingLng(lng);
              }}
            />
          </div>
        )}
      </>
    );
  }
}
