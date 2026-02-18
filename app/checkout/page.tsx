import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { ROUTES } from "@/lib/utils/constants";
import { auth } from "@/auth";
import {
  getPartner,
  getPartnerAddresses,
  CONDICION_IVA_REVERSE_MAP,
} from "@/lib/odoo/partners";
import type {
  CheckoutPrefillData,
  CheckoutAddress,
  CondicionIva,
} from "@/types";
import type { OdooPartner } from "@/lib/odoo/types";
import { getBranches } from "@/lib/odoo/branches";
import type { Branch } from "@/types";

export const metadata: Metadata = {
  title: "Finalizar Compra",
  description: "Complete su pedido y proceda al pago.",
  robots: { index: false, follow: false },
};

function odooPartnerToCheckoutAddress(p: OdooPartner): CheckoutAddress | null {
  if (!p.street) return null;
  return {
    id: p.id,
    name: p.name,
    street: p.street,
    street2: p.street2 || undefined,
    city: p.city || "",
    state: p.state_id ? p.state_id[1] : "",
    stateId: p.state_id ? p.state_id[0] : undefined,
    zipCode: p.zip || "",
    country: p.country_id ? p.country_id[1] : "Argentina",
    countryId: p.country_id ? p.country_id[0] : undefined,
    phone: p.phone || undefined,
    lat: p.partner_latitude || undefined,
    lng: p.partner_longitude || undefined,
  };
}

export default async function CheckoutPage() {
  // Fetch branches and prefill data in parallel
  let prefill: CheckoutPrefillData | null = null;
  let branches: Branch[] = [];

  const [branchesResult, session] = await Promise.all([getBranches(), auth()]);
  branches = branchesResult;
  if (session?.user?.partnerId) {
    const partner = await getPartner(session.user.partnerId);
    if (partner) {
      // Resolve commercial partner (top-level company)
      const commercialPartnerId =
        session.user.commercialPartnerId ?? partner.commercial_partner_id[0];
      const company =
        partner.id === commercialPartnerId
          ? partner
          : await getPartner(commercialPartnerId);

      const companyId = commercialPartnerId;

      // Fetch saved addresses in parallel
      const [deliveryAddresses, invoiceAddresses] = await Promise.all([
        getPartnerAddresses(companyId, "delivery"),
        getPartnerAddresses(companyId, "invoice"),
      ]);

      // Reverse-map AFIP responsibility type to condicionIva
      const afipId = company?.l10n_ar_afip_responsibility_type_id;
      const condicionIva = afipId
        ? ((CONDICION_IVA_REVERSE_MAP[afipId[0]] || "") as CondicionIva | "")
        : "";

      // Build main address from company record
      const mainAddress = company
        ? odooPartnerToCheckoutAddress(company)
        : null;

      prefill = {
        partnerId: partner.id,
        companyId,
        email: partner.email || "",
        phone: partner.phone || "",
        name: company?.name || partner.name,
        vat: company?.vat || partner.vat || "",
        condicionIva,
        companyName: company?.is_company ? company.name : "",
        mainAddress,
        deliveryAddresses: deliveryAddresses
          .map(odooPartnerToCheckoutAddress)
          .filter((a): a is CheckoutAddress => a !== null),
        invoiceAddresses: invoiceAddresses
          .map(odooPartnerToCheckoutAddress)
          .filter((a): a is CheckoutAddress => a !== null),
      };
    }
  }

  return (
    <>
      <Header />
      <MobileNav />
      <main>
        {/* ── Breadcrumb ──────────────────────────────────── */}
        <div className="border-b-2 border-foreground">
          <div className="container mx-auto px-4 py-4">
            <nav className="text-xs font-bold uppercase tracking-widest">
              <Link
                href={ROUTES.HOME}
                className="text-muted-foreground transition-colors duration-200 hover:text-accent"
              >
                Inicio
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link
                href={ROUTES.CART}
                className="text-muted-foreground transition-colors duration-200 hover:text-accent"
              >
                Carrito
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span>Checkout</span>
            </nav>
          </div>
        </div>

        {/* ── Header ──────────────────────────────────────── */}
        <div className="border-b-4 border-foreground">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              Paso Final
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Finalizar Compra
            </h1>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────── */}
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
            <div className="lg:col-span-2">
              <CheckoutForm prefill={prefill} branches={branches} />
            </div>
            <div>
              <OrderSummary />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
