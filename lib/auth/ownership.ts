"use server";

import { auth } from "@/auth";
import { odooClient } from "@/lib/odoo/client";
import { getCommercialPartnerId } from "@/lib/auth/session";

/**
 * Get the set of partner IDs that belong to a commercial partner.
 * Returns the commercial partner ID + all descendant contact IDs.
 */
async function getCompanyPartnerIds(
  commercialPartnerId: number,
): Promise<Set<number>> {
  const childIds = await odooClient.search("res.partner", [
    ["commercial_partner_id", "=", commercialPartnerId],
    ["id", "!=", commercialPartnerId],
  ]);

  return new Set([commercialPartnerId, ...childIds]);
}

/**
 * Verify that a partner_id (from an order, invoice, etc.) belongs to the
 * authenticated user's company. Returns true if authorized.
 */
export async function verifyResourceOwnership(
  resourcePartnerId: number,
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.partnerId) return false;

  const commercialPartnerId = await getCommercialPartnerId(session);
  const allIds = await getCompanyPartnerIds(commercialPartnerId);
  return allIds.has(resourcePartnerId);
}

/**
 * Get the current authenticated user's company partner IDs.
 * Returns null if not authenticated.
 */
export async function getSessionCompanyIds(): Promise<Set<number> | null> {
  const session = await auth();
  if (!session?.user?.partnerId) return null;

  const commercialPartnerId = await getCommercialPartnerId(session);
  return getCompanyPartnerIds(commercialPartnerId);
}
