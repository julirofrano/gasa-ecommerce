import type { OdooRPCResponse, OdooAuthResponse } from "./types";
import { odooClient } from "./client";
import type { OdooPartner } from "./types";

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  partnerId: number;
  companyName: string;
  pricelistId: number | null;
}

/**
 * Authenticate a portal user against Odoo using their credentials.
 * Returns user data for NextAuth or null if credentials are invalid.
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  const url = process.env.ODOO_URL || "";
  const db = process.env.ODOO_DB || "";

  const response = await fetch(`${url}/web/session/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        db,
        login: email,
        password,
      },
      id: 1,
    }),
  });

  if (!response.ok) return null;

  const data: OdooRPCResponse<OdooAuthResponse> = await response.json();

  if (data.error || !data.result?.uid) return null;

  const { uid, partner_id } = data.result;

  // Read the partner record to get name and company info
  const partners = await odooClient.read<OdooPartner>(
    "res.partner",
    [partner_id],
    [
      "name",
      "is_company",
      "parent_id",
      "company_name",
      "property_product_pricelist",
    ],
  );

  const partner = partners[0];
  if (!partner) return null;

  // Company name: if partner is a company use its name,
  // otherwise use the parent company name
  const companyName = partner.is_company
    ? partner.name
    : (partner.parent_id?.[1] ?? "");

  // Pricelist: check the logged-in partner first, then fall back to the
  // parent company. In Odoo, portal users are child contacts — commercial
  // properties like pricelist live on the parent partner.
  let pricelistId: number | null = partner.property_product_pricelist
    ? partner.property_product_pricelist[0]
    : null;

  if (!pricelistId && partner.parent_id) {
    const parents = await odooClient.read<OdooPartner>(
      "res.partner",
      [partner.parent_id[0]],
      ["property_product_pricelist"],
    );
    const parent = parents[0];
    if (parent?.property_product_pricelist) {
      pricelistId = parent.property_product_pricelist[0];
    }
  }

  return {
    id: String(uid),
    name: partner.name,
    email,
    partnerId: partner_id,
    companyName,
    pricelistId,
  };
}
