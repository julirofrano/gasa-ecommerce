"use server";

import { auth } from "@/auth";
import { odooClient } from "@/lib/odoo/client";

/**
 * Resolve the set of partner IDs that belong to the current user's company.
 * Returns the parent company ID + all child contact IDs.
 * Used for ownership verification in document downloads and detail pages.
 */
async function resolveCompanyPartnerIds(
  partnerId: number,
): Promise<{ parentId: number; allIds: Set<number> }> {
  const partners = await odooClient.read<{
    parent_id: [number, string] | false;
  }>("res.partner", [partnerId], ["parent_id"]);
  const partner = partners[0];
  const parentId = partner?.parent_id ? partner.parent_id[0] : partnerId;

  const childIds = await odooClient.search("res.partner", [
    ["parent_id", "=", parentId],
  ]);

  const allIds = new Set([parentId, ...childIds]);
  return { parentId, allIds };
}

/**
 * Verify that a partner_id (from an order, invoice, etc.) belongs to the
 * authenticated user's company. Returns the session if authorized, or null.
 */
export async function verifyResourceOwnership(
  resourcePartnerId: number,
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.partnerId) return false;

  const { allIds } = await resolveCompanyPartnerIds(session.user.partnerId);
  return allIds.has(resourcePartnerId);
}

/**
 * Get the current authenticated user's company partner IDs.
 * Returns null if not authenticated.
 */
export async function getSessionCompanyIds(): Promise<Set<number> | null> {
  const session = await auth();
  if (!session?.user?.partnerId) return null;

  const { allIds } = await resolveCompanyPartnerIds(session.user.partnerId);
  return allIds;
}
