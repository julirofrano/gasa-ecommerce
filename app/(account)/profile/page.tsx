import type { Metadata } from "next";
import { getRequiredSession } from "@/lib/auth/session";
import {
  getPartner,
  getPartnerAddresses,
  getCompanyContacts,
} from "@/lib/odoo/partners";
import { getBranchNamesByWarehouseIds } from "@/lib/odoo/warehouses";
import { ProfileForm } from "@/components/account/profile-form";
import { ContactsSection } from "@/components/account/contacts-section";
import { AddressSection } from "@/components/account/address-section";
import { AddressMapWrapper } from "@/components/account/address-map-wrapper";
import { PasswordSection } from "@/components/account/password-section";

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

  // Fetch the commercial partner (top-level company) for company info
  const commercialPartnerId =
    session.user.commercialPartnerId ?? partner.commercial_partner_id[0];
  const company =
    partner.id === commercialPartnerId
      ? partner
      : await getPartner(commercialPartnerId);

  const companyId = commercialPartnerId;
  const [deliveryAddresses, invoiceAddresses, companyContacts] =
    await Promise.all([
      getPartnerAddresses(companyId, "delivery"),
      getPartnerAddresses(companyId, "invoice"),
      getCompanyContacts(companyId),
    ]);

  // Resolve branch names for delivery addresses that have a default warehouse
  const warehouseIds = deliveryAddresses
    .map((a) => (a.default_warehouse_id ? a.default_warehouse_id[0] : null))
    .filter((id): id is number => id !== null);
  const uniqueWarehouseIds = [...new Set(warehouseIds)];
  const branchNamesMap = await getBranchNamesByWarehouseIds(uniqueWarehouseIds);
  const branchNames: Record<number, string> =
    Object.fromEntries(branchNamesMap);

  // Detect particular accounts (no parent company)
  const isParticular =
    partner.id === commercialPartnerId && !partner.is_company;

  // Separate the logged-in user from other contacts
  const otherContacts = companyContacts.filter((c) => c.id !== partner.id);

  // Section counter — adjusts when "Contactos de la Empresa" is hidden
  let sectionNum = 0;
  const nextSection = () => String(++sectionNum).padStart(2, "0");

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
        Mi Perfil
      </h1>

      {/* ── Datos de la Empresa / Mis Datos ────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            {nextSection()}
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent">
            {isParticular ? "Mis Datos" : "Datos de la Empresa"}
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {isParticular ? "Nombre" : "Razón Social"}
            </dt>
            <dd className="text-sm font-bold">
              {company?.name ?? partner.name}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {isParticular ? "CUIT / CUIL" : "CUIT"}
            </dt>
            <dd className="font-mono text-sm font-bold">
              {company?.vat || partner.vat || "—"}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Condición ante ARCA
            </dt>
            <dd className="text-sm font-bold">
              {(company?.l10n_ar_afip_responsibility_type_id &&
                company.l10n_ar_afip_responsibility_type_id[1]) ||
                (partner.l10n_ar_afip_responsibility_type_id &&
                  partner.l10n_ar_afip_responsibility_type_id[1]) ||
                "—"}
            </dd>
          </div>
        </dl>
      </section>

      {/* ── Mi Contacto ──────────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            {nextSection()}
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent">
            Mi Contacto
          </h2>
        </div>
        <ProfileForm partner={partner} isParticular={isParticular} />
      </section>

      {/* ── Contactos de la Empresa (hidden for particular) ── */}
      {!isParticular && (
        <ContactsSection number={nextSection()} contacts={otherContacts} />
      )}

      {/* ── Dirección Principal ────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            {nextSection()}
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent">
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

      {/* ── Direcciones de Envío ───────────────────── */}
      <AddressSection
        number={nextSection()}
        title="Direcciones de Envio"
        type="delivery"
        addresses={deliveryAddresses}
        emptyMessage="No hay direcciones de envio registradas."
        parentAddress={{
          street: company?.street,
          city: company?.city,
          zip: company?.zip,
        }}
        branchNames={branchNames}
      />

      {/* ── Direcciones de Facturación ──────────────── */}
      <AddressSection
        number={nextSection()}
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

      {/* ── Contraseña ──────────────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            {nextSection()}
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent">
            Contraseña
          </h2>
        </div>
        <PasswordSection hasPassword={false} />
      </section>
    </div>
  );
}
