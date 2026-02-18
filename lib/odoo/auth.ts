import { odooClient } from "./client";
import type { OdooPartner, OdooRPCResponse, OdooAuthResponse } from "./types";
import {
  verifyPartnerPassword,
  isPortalActive,
  setPartnerPassword,
  setPortalActive,
} from "./portal";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  partnerId: number;
  commercialPartnerId: number;
  companyName: string;
  pricelistId: number | null;
  warehouseId: number | null;
}

/**
 * Authenticate a portal user using bcrypt password verification
 * against x_portal_password_hash on res.partner.
 *
 * Lazy migration: if no x_portal_password_hash exists but the partner has an
 * active res.users (granted via Odoo UI), falls back to Odoo's native
 * /web/session/authenticate. On success, writes the bcrypt hash and
 * sets x_portal_active = true so future logins use bcrypt directly.
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  try {
    const partners = await odooClient.searchRead<
      OdooPartner & {
        x_portal_active: boolean;
        x_portal_password_hash: string | false;
      }
    >(
      "res.partner",
      [["email", "=ilike", email]],
      [
        "name",
        "email",
        "is_company",
        "parent_id",
        "commercial_partner_id",
        "property_product_pricelist",
        "x_portal_active",
        "x_portal_password_hash",
        "user_ids",
      ],
      10,
    );

    // Pass 1: try bcrypt-based auth on migrated partners
    for (const partner of partners) {
      if (!partner.x_portal_active) continue;

      const passwordValid = await verifyPartnerPassword(partner.id, password);
      if (!passwordValid) continue;

      return buildAuthenticatedUser(partner);
    }

    // Pass 2: lazy migration — try Odoo native auth for partners that have
    // a res.users but no x_portal_password_hash yet (granted access via Odoo UI)
    for (const partner of partners) {
      if (partner.x_portal_password_hash) continue; // already has hash, password just didn't match
      if (!partner.user_ids || partner.user_ids.length === 0) continue;

      const migrated = await tryOdooAuthAndMigrate(partner, email, password);
      if (migrated) return migrated;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Build an AuthenticatedUser from a partner ID (no password needed).
 * Used after magic link token validation.
 *
 * Lazy migration: if x_portal_active is false but the partner has an
 * active res.users, migrates and proceeds.
 */
export async function authenticateWithMagicLink(
  partnerId: number,
): Promise<AuthenticatedUser | null> {
  try {
    const active = await isPortalActive(partnerId);

    if (!active) {
      // Check for legacy res.users — migrate if found
      const migrated = await tryMigrateLegacyUser(partnerId);
      if (!migrated) return null;
    }

    const partners = await odooClient.read<OdooPartner>(
      "res.partner",
      [partnerId],
      [
        "name",
        "email",
        "is_company",
        "parent_id",
        "commercial_partner_id",
        "property_product_pricelist",
      ],
    );

    const partner = partners[0];
    if (!partner?.email) return null;

    return buildAuthenticatedUser(partner);
  } catch {
    return null;
  }
}

// ── Lazy migration helpers ─────────────────────────────────────

/**
 * Attempt Odoo native /web/session/authenticate for a partner that
 * was granted portal access via Odoo's UI. On success, writes the
 * bcrypt hash and sets x_portal_active = true.
 */
async function tryOdooAuthAndMigrate(
  partner: OdooPartner,
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  try {
    const url = process.env.ODOO_URL || "";
    const db = process.env.ODOO_DB || "";

    const response = await fetch(`${url}/web/session/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: { db, login: email, password },
        id: 1,
      }),
    });

    if (!response.ok) return null;

    const data: OdooRPCResponse<OdooAuthResponse> = await response.json();
    if (data.error || !data.result?.uid) return null;

    // Verify this Odoo user corresponds to the partner we're migrating
    if (data.result.partner_id !== partner.id) return null;

    // Migrate: write bcrypt hash + activate portal flag
    await setPartnerPassword(partner.id, password);
    await setPortalActive(partner.id, true);

    console.log(
      `[auth] Lazy-migrated partner ${partner.id} (${email}) from res.users to bcrypt`,
    );

    return buildAuthenticatedUser(partner);
  } catch {
    return null;
  }
}

/**
 * Check if a partner has an active res.users record (legacy portal user).
 * If so, set x_portal_active = true to migrate them.
 */
async function tryMigrateLegacyUser(partnerId: number): Promise<boolean> {
  try {
    const partners = await odooClient.read<OdooPartner>(
      "res.partner",
      [partnerId],
      ["user_ids"],
    );
    const userIds = partners[0]?.user_ids;
    if (!userIds || userIds.length === 0) return false;

    // Check if any of the linked users are active
    const activeUsers = await odooClient.searchRead<{ id: number }>(
      "res.users",
      [
        ["id", "in", userIds],
        ["active", "=", true],
      ],
      ["id"],
      1,
    );
    if (activeUsers.length === 0) return false;

    // Migrate: set x_portal_active
    await setPortalActive(partnerId, true);

    console.log(
      `[auth] Lazy-migrated partner ${partnerId} x_portal_active from legacy res.users`,
    );

    return true;
  } catch {
    return false;
  }
}

// ── Shared helper ──────────────────────────────────────────────

/**
 * Build AuthenticatedUser from an OdooPartner record.
 * Resolves pricelist and warehouse from parent/commercial partner.
 */
async function buildAuthenticatedUser(
  partner: OdooPartner,
): Promise<AuthenticatedUser> {
  const commercialPartnerId = partner.commercial_partner_id[0];

  const companyName = partner.is_company
    ? partner.name
    : (partner.commercial_partner_id[1] ?? "");

  // Pricelist: check partner first, then commercial partner
  let pricelistId: number | null = partner.property_product_pricelist
    ? partner.property_product_pricelist[0]
    : null;

  if (!pricelistId && commercialPartnerId !== partner.id) {
    const parents = await odooClient.read<OdooPartner>(
      "res.partner",
      [commercialPartnerId],
      ["property_product_pricelist"],
    );
    const parent = parents[0];
    if (parent?.property_product_pricelist) {
      pricelistId = parent.property_product_pricelist[0];
    }
  }

  // Warehouse: resolve from parent branch
  let warehouseId: number | null = null;

  if (partner.parent_id && !partner.is_company) {
    const branches = await odooClient.read<OdooPartner>(
      "res.partner",
      [partner.parent_id[0]],
      ["default_warehouse_id"],
    );
    const branch = branches[0];
    if (branch?.default_warehouse_id) {
      warehouseId = branch.default_warehouse_id[0];
    }
  }

  // Fallback: check the partner's own default_warehouse_id
  if (!warehouseId) {
    const selfPartners = await odooClient.read<OdooPartner>(
      "res.partner",
      [partner.id],
      ["default_warehouse_id"],
    );
    const self = selfPartners[0];
    if (self?.default_warehouse_id) {
      warehouseId = self.default_warehouse_id[0];
    }
  }

  return {
    id: String(partner.id),
    name: partner.name,
    email: partner.email || "",
    partnerId: partner.id,
    commercialPartnerId,
    companyName,
    pricelistId,
    warehouseId,
  };
}
