import { odooClient } from "./client";
import type { OdooPartner } from "./types";

export async function getPartner(
  partnerId: number,
): Promise<OdooPartner | null> {
  const partners = await odooClient.read<OdooPartner>(
    "res.partner",
    [partnerId],
    [
      "name",
      "function",
      "email",
      "phone",
      "vat",
      "street",
      "street2",
      "city",
      "state_id",
      "zip",
      "country_id",
      "is_company",
      "parent_id",
      "commercial_partner_id",
      "child_ids",
      "property_product_pricelist",
      "l10n_ar_afip_responsibility_type_id",
      "default_warehouse_id",
      "partner_latitude",
      "partner_longitude",
    ],
  );
  return partners[0] || null;
}

export async function createPartner(data: {
  name: string;
  email: string;
  phone?: string;
  vat?: string;
  street?: string;
  street2?: string;
  city?: string;
  stateId?: number;
  countryId?: number;
  zip?: string;
  isCompany?: boolean;
  afipResponsibilityTypeId?: number;
}): Promise<number> {
  const values: Record<string, unknown> = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    vat: data.vat,
    street: data.street,
    street2: data.street2,
    city: data.city,
    zip: data.zip,
    is_company: data.isCompany || false,
  };

  if (data.stateId) values.state_id = data.stateId;
  if (data.countryId) values.country_id = data.countryId;
  if (data.afipResponsibilityTypeId) {
    values.l10n_ar_afip_responsibility_type_id = data.afipResponsibilityTypeId;
  }

  return odooClient.create("res.partner", values);
}

export async function createPartnerAddress(
  parentId: number,
  type: "delivery" | "invoice",
  data: {
    name: string;
    street: string;
    street2?: string;
    city: string;
    stateId?: number;
    countryId?: number;
    zip: string;
    phone?: string;
  },
): Promise<number> {
  const values: Record<string, unknown> = {
    parent_id: parentId,
    type,
    name: data.name,
    street: data.street,
    street2: data.street2,
    city: data.city,
    zip: data.zip,
    phone: data.phone,
  };

  if (data.stateId) values.state_id = data.stateId;
  if (data.countryId) values.country_id = data.countryId;

  return odooClient.create("res.partner", values);
}

/** Resolve the Odoo ID for Argentina (country code AR) */
export async function getArgentinaCountryId(): Promise<number | null> {
  const results = await odooClient.searchRead<{ id: number }>(
    "res.country",
    [["code", "=", "AR"]],
    ["id"],
    1,
  );
  return results[0]?.id ?? null;
}

/** Resolve an Argentine province ID by name */
export async function getStateId(
  stateName: string,
  countryId: number,
): Promise<number | null> {
  const results = await odooClient.searchRead<{ id: number }>(
    "res.country.state",
    [
      ["country_id", "=", countryId],
      ["name", "ilike", stateName],
    ],
    ["id"],
    1,
  );
  return results[0]?.id ?? null;
}

/** Map Condicion IVA values to Odoo AFIP responsibility type IDs */
export const CONDICION_IVA_MAP: Record<string, number> = {
  responsable_inscripto: 1,
  monotributo: 6,
  exento: 4,
  consumidor_final: 5,
};

/** Reverse map: Odoo AFIP responsibility type ID → CondicionIva value */
export const CONDICION_IVA_REVERSE_MAP: Record<number, string> = {
  1: "responsable_inscripto",
  6: "monotributo",
  4: "exento",
  5: "consumidor_final",
};

export async function updatePartner(
  partnerId: number,
  data: Partial<{
    name: string;
    function: string;
    email: string;
    phone: string;
    vat: string;
    street: string;
    street2: string;
    city: string;
    zip: string;
    type: string;
    state_id: number | false;
    country_id: number | false;
    partner_latitude: number;
    partner_longitude: number;
    l10n_ar_afip_responsibility_type_id: number | false;
  }>,
): Promise<boolean> {
  return odooClient.write("res.partner", [partnerId], data);
}

/**
 * Create a contact-type child of a company.
 */
export async function createCompanyContact(
  companyId: number,
  data: { name: string; function?: string; email?: string; phone?: string },
): Promise<number> {
  return odooClient.create("res.partner", {
    parent_id: companyId,
    type: "contact",
    name: data.name,
    function: data.function,
    email: data.email,
    phone: data.phone,
  });
}

/**
 * Fetch contact-type children of a company (people, not delivery/invoice addresses).
 */
export async function getCompanyContacts(
  companyId: number,
): Promise<OdooPartner[]> {
  return odooClient.searchRead<OdooPartner>(
    "res.partner",
    [
      ["parent_id", "=", companyId],
      ["type", "=", "contact"],
    ],
    ["name", "function", "email", "phone", "user_ids"],
  );
}

export async function getPartnerAddresses(
  partnerId: number,
  type: "delivery" | "invoice" = "delivery",
): Promise<OdooPartner[]> {
  return odooClient.searchRead<OdooPartner>(
    "res.partner",
    [
      ["parent_id", "=", partnerId],
      ["type", "=", type],
    ],
    [
      "name",
      "street",
      "street2",
      "city",
      "state_id",
      "zip",
      "country_id",
      "phone",
      "type",
      "partner_latitude",
      "partner_longitude",
      "default_warehouse_id",
    ],
  );
}

/**
 * Delete a partner address. Tries unlink first; falls back to archiving
 * (active: false) if the record is referenced by existing orders.
 */
export async function deletePartnerAddress(
  addressId: number,
): Promise<boolean> {
  try {
    return await odooClient.unlink("res.partner", [addressId]);
  } catch {
    // Address may be referenced by orders — archive instead
    return odooClient.write("res.partner", [addressId], { active: false });
  }
}
