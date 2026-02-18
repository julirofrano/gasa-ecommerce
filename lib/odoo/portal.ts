import bcrypt from "bcryptjs";
import { odooClient } from "./client";
import type { OdooPartner } from "./types";

// ── Field provisioning ─────────────────────────────────────────
// Ensures x_portal_password_hash and x_portal_active exist on res.partner.
// Runs once per process.

let fieldsProvisioned = false;

async function ensurePortalFields(): Promise<void> {
  if (fieldsProvisioned) return;

  const existing = await odooClient.searchRead<{ name: string }>(
    "ir.model.fields",
    [
      ["model", "=", "res.partner"],
      ["name", "in", ["x_portal_password_hash", "x_portal_active"]],
    ],
    ["name"],
  );

  const existingNames = new Set(existing.map((f) => f.name));

  if (!existingNames.has("x_portal_password_hash")) {
    await odooClient.create("ir.model.fields", {
      model_id: await getModelId("res.partner"),
      name: "x_portal_password_hash",
      field_description: "Portal Password Hash",
      ttype: "char",
      store: true,
    });
  }

  if (!existingNames.has("x_portal_active")) {
    await odooClient.create("ir.model.fields", {
      model_id: await getModelId("res.partner"),
      name: "x_portal_active",
      field_description: "Portal Active",
      ttype: "boolean",
      store: true,
    });
  }

  fieldsProvisioned = true;
}

let cachedPartnerModelId: number | null = null;

async function getModelId(model: string): Promise<number> {
  if (cachedPartnerModelId) return cachedPartnerModelId;
  const records = await odooClient.searchRead<{ id: number }>(
    "ir.model",
    [["model", "=", model]],
    ["id"],
    1,
  );
  if (!records[0]) throw new Error(`Model ${model} not found`);
  cachedPartnerModelId = records[0].id;
  return cachedPartnerModelId;
}

// ── Password management ────────────────────────────────────────

/**
 * Hash and store a password on a partner's x_portal_password_hash field.
 */
export async function setPartnerPassword(
  partnerId: number,
  password: string,
): Promise<void> {
  await ensurePortalFields();
  const hash = await bcrypt.hash(password, 12);
  await odooClient.write("res.partner", [partnerId], {
    x_portal_password_hash: hash,
  });
}

/**
 * Verify a password against a partner's stored bcrypt hash.
 */
export async function verifyPartnerPassword(
  partnerId: number,
  password: string,
): Promise<boolean> {
  await ensurePortalFields();
  const partners = await odooClient.read<{
    x_portal_password_hash: string | false;
  }>("res.partner", [partnerId], ["x_portal_password_hash"]);
  const hash = partners[0]?.x_portal_password_hash;
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

// ── Portal access control ──────────────────────────────────────

/**
 * Set the portal active flag on a partner.
 */
export async function setPortalActive(
  partnerId: number,
  active: boolean,
): Promise<void> {
  await ensurePortalFields();
  await odooClient.write("res.partner", [partnerId], {
    x_portal_active: active,
  });
}

/**
 * Check if a partner has portal access enabled.
 */
export async function isPortalActive(partnerId: number): Promise<boolean> {
  await ensurePortalFields();
  const partners = await odooClient.read<{ x_portal_active: boolean }>(
    "res.partner",
    [partnerId],
    ["x_portal_active"],
  );
  return partners[0]?.x_portal_active === true;
}

/**
 * Check if a partner has a portal account (has a password hash set).
 * Replaces the old getExistingPortalUser check.
 */
export async function hasPortalAccount(partnerId: number): Promise<boolean> {
  await ensurePortalFields();
  const partners = await odooClient.read<{
    x_portal_password_hash: string | false;
  }>("res.partner", [partnerId], ["x_portal_password_hash"]);
  return !!partners[0]?.x_portal_password_hash;
}

// ── HMAC-signed magic link tokens ──────────────────────────────
// Self-contained tokens: payload (partnerId + expiration) is signed with
// AUTH_SECRET via HMAC-SHA256. No Odoo storage required.

function getTokenSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret)
    throw new Error("AUTH_SECRET env var is required for magic link tokens");
  return secret;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hmacVerify(
  data: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const expected = await hmacSign(data, secret);
  return expected === signature;
}

/**
 * Generate an HMAC-signed magic link token for a partner.
 * Token format: base64url(payload).signature
 */
export async function generateSignupToken(
  partnerId: number,
  days: number = 7,
): Promise<string> {
  const exp = Date.now() + days * 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({ pid: partnerId, exp });
  const encoded = btoa(payload)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const signature = await hmacSign(encoded, getTokenSecret());
  return `${encoded}.${signature}`;
}

/**
 * Validate a magic link token. Returns the partner record with
 * session-building fields, or null if invalid/expired.
 */
export async function validateSignupToken(
  token: string,
): Promise<OdooPartner | null> {
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return null;

  const encoded = token.slice(0, dotIdx);
  const signature = token.slice(dotIdx + 1);

  const valid = await hmacVerify(encoded, signature, getTokenSecret());
  if (!valid) return null;

  let payload: { pid: number; exp: number };
  try {
    payload = JSON.parse(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }

  if (Date.now() > payload.exp) return null;

  const partners = await odooClient.read<OdooPartner>(
    "res.partner",
    [payload.pid],
    [
      "name",
      "email",
      "commercial_partner_id",
      "parent_id",
      "is_company",
      "property_product_pricelist",
      "default_warehouse_id",
    ],
  );

  return partners[0] ?? null;
}

/**
 * Find all partners matching an email (case-insensitive).
 * Returns every match so callers can pick the one with a portal account.
 */
export async function findPartnersByEmail(
  email: string,
): Promise<OdooPartner[]> {
  return odooClient.searchRead<OdooPartner>(
    "res.partner",
    [["email", "=ilike", email]],
    ["name", "email", "commercial_partner_id", "parent_id", "is_company"],
  );
}

// ── Admin approval tokens ────────────────────────────────────

/**
 * Generate an HMAC-signed admin approval token containing the
 * contact (partner) ID. Expires in 30 days.
 */
export async function generateAdminApprovalToken(
  contactId: number,
): Promise<string> {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({ cid: contactId, exp });
  const encoded = btoa(payload)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const signature = await hmacSign(encoded, getTokenSecret());
  return `${encoded}.${signature}`;
}

/**
 * Validate an admin approval token. Returns the embedded contactId or null
 * if the token is invalid or expired.
 */
export async function validateAdminApprovalToken(
  token: string,
): Promise<{ contactId: number } | null> {
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return null;

  const encoded = token.slice(0, dotIdx);
  const signature = token.slice(dotIdx + 1);

  const valid = await hmacVerify(encoded, signature, getTokenSecret());
  if (!valid) return null;

  let payload: { cid: number; exp: number };
  try {
    payload = JSON.parse(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }

  if (Date.now() > payload.exp) return null;

  return { contactId: payload.cid };
}

// ── Email confirmation tokens ─────────────────────────────────

/**
 * Generate an HMAC-signed email confirmation token containing the
 * contact (partner) ID. Expires in 7 days.
 */
export async function generateEmailConfirmationToken(
  contactId: number,
): Promise<string> {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({ cid: contactId, t: "ec", exp });
  const encoded = btoa(payload)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const signature = await hmacSign(encoded, getTokenSecret());
  return `${encoded}.${signature}`;
}

/**
 * Validate an email confirmation token. Returns the embedded contactId or null
 * if the token is invalid or expired.
 */
export async function validateEmailConfirmationToken(
  token: string,
): Promise<{ contactId: number } | null> {
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return null;

  const encoded = token.slice(0, dotIdx);
  const signature = token.slice(dotIdx + 1);

  const valid = await hmacVerify(encoded, signature, getTokenSecret());
  if (!valid) return null;

  let payload: { cid: number; t: string; exp: number };
  try {
    payload = JSON.parse(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }

  if (payload.t !== "ec") return null;
  if (Date.now() > payload.exp) return null;

  return { contactId: payload.cid };
}

/**
 * Find a company partner by CUIT (VAT number).
 * Returns the first matching company or null.
 */
export async function findCompanyByCuit(
  cuit: string,
): Promise<OdooPartner | null> {
  const results = await odooClient.searchRead<OdooPartner>(
    "res.partner",
    [
      ["vat", "=", cuit],
      ["is_company", "=", true],
    ],
    ["id", "name", "vat", "email"],
    1,
  );
  return results[0] ?? null;
}
