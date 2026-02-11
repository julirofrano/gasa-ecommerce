import type { Metadata } from "next";
import { getRequiredSession } from "@/lib/auth/session";
import { getPartner, getPartnerAddresses } from "@/lib/odoo/partners";
import { ProfileForm } from "@/components/account/profile-form";
import { AddressSection } from "@/components/account/address-section";
import { AddressMapWrapper } from "@/components/account/address-map-wrapper";

export const metadata: Metadata = {
  title: "Mi Perfil",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await getRequiredSession();
  const partner = await getPartner(session.user.partnerId);

  if (!partner) {
    return (
      <p className="text-sm text-muted-foreground">
        No se encontraron datos del perfil.
      </p>
    );
  }

  // If partner is a contact under a company, fetch the parent for company info
  const company =
    partner.is_company || !partner.parent_id
      ? partner
      : await getPartner(partner.parent_id[0]);

  // Fetch addresses from the company (or the partner itself)
  const companyId = company?.id ?? partner.id;
  const [deliveryAddresses, invoiceAddresses] = await Promise.all([
    getPartnerAddresses(companyId, "delivery"),
    getPartnerAddresses(companyId, "invoice"),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
        Mi Perfil
      </h1>

      {/* ── 01 Datos de la Empresa ────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            01
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
            Datos de la Empresa
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Razón Social
            </dt>
            <dd className="text-sm font-bold">
              {company?.name ?? partner.name}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              CUIT
            </dt>
            <dd className="font-mono text-sm font-bold">
              {company?.vat || partner.vat || "—"}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Lista de Precios
            </dt>
            <dd className="text-sm font-bold">
              {company?.property_product_pricelist?.[1] ||
                partner.property_product_pricelist?.[1] ||
                "—"}
            </dd>
          </div>
        </dl>
      </section>

      {/* ── 02 Datos de Contacto ──────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            02
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
            Datos de Contacto
          </h2>
        </div>
        <ProfileForm partner={partner} />
      </section>

      {/* ── 03 Dirección Principal ────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            03
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
            Dirección Principal
          </h2>
        </div>
        <div className="text-sm">
          <p className="font-bold">{partner.street}</p>
          {partner.street2 && <p>{partner.street2}</p>}
          <p>
            {partner.city}
            {partner.state_id && `, ${partner.state_id[1]}`}
            {partner.zip && ` (${partner.zip})`}
          </p>
          {partner.country_id && (
            <p className="text-muted-foreground">{partner.country_id[1]}</p>
          )}
          <div className="mt-3">
            <AddressMapWrapper
              partnerId={partner.id}
              street={partner.street}
              city={partner.city}
              state={partner.state_id?.[1]}
              zip={partner.zip}
              country={partner.country_id?.[1]}
              savedLat={partner.partner_latitude}
              savedLng={partner.partner_longitude}
            />
          </div>
        </div>
      </section>

      {/* ── 04 Direcciones de Envío ───────────────────── */}
      <AddressSection
        number="04"
        title="Direcciones de Envio"
        type="delivery"
        addresses={deliveryAddresses}
        emptyMessage="No hay direcciones de envio registradas."
        parentAddress={{
          street: company?.street,
          city: company?.city,
          zip: company?.zip,
        }}
      />

      {/* ── 05 Direcciones de Facturación ──────────────── */}
      <AddressSection
        number="05"
        title="Direcciones de Facturacion"
        type="invoice"
        addresses={invoiceAddresses}
        emptyMessage="No hay direcciones de facturacion registradas."
        parentAddress={{
          street: company?.street,
          city: company?.city,
          zip: company?.zip,
        }}
      />
    </div>
  );
}
