import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { odooClient } from "@/lib/odoo/client";
import type { OdooPartner } from "@/lib/odoo/types";

/**
 * Get the current session or redirect to login.
 * Use in server components and server actions that require auth.
 */
export async function getRequiredSession() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Get the commercial partner ID for the current session.
 * Falls back to an Odoo lookup if the JWT predates the commercialPartnerId field.
 */
export async function getCommercialPartnerId(
  session: {
    user?: {
      partnerId?: number;
      commercialPartnerId?: number;
    };
  } | null,
): Promise<number> {
  if (session?.user?.commercialPartnerId) {
    return session.user.commercialPartnerId;
  }

  // Fallback for JWTs minted before commercialPartnerId was added
  const partnerId = session?.user?.partnerId;
  if (!partnerId) throw new Error("No partner ID in session");

  const partners = await odooClient.read<{
    commercial_partner_id: [number, string];
  }>("res.partner", [partnerId], ["commercial_partner_id"]);

  return partners[0]?.commercial_partner_id[0] ?? partnerId;
}

/**
 * Get the warehouse ID for the current session.
 * Falls back to an Odoo lookup if the JWT predates the warehouseId field.
 * Returns null if no warehouse is assigned (guest or unassigned).
 */
export async function getWarehouseId(
  session: {
    user?: {
      partnerId?: number;
      warehouseId?: number | null;
    };
  } | null,
): Promise<number | null> {
  if (session?.user?.warehouseId) {
    return session.user.warehouseId;
  }

  // Fallback for JWTs minted before warehouseId was added
  const partnerId = session?.user?.partnerId;
  if (!partnerId) return null;

  // Read partner's parent (the branch) to get default_warehouse_id
  const partners = await odooClient.read<OdooPartner>(
    "res.partner",
    [partnerId],
    ["parent_id", "is_company", "default_warehouse_id"],
  );
  const partner = partners[0];
  if (!partner) return null;

  // Check the branch (parent) first
  if (partner.parent_id && !partner.is_company) {
    const branches = await odooClient.read<OdooPartner>(
      "res.partner",
      [partner.parent_id[0]],
      ["default_warehouse_id"],
    );
    if (branches[0]?.default_warehouse_id) {
      return branches[0].default_warehouse_id[0];
    }
  }

  // Fallback to the partner's own warehouse
  if (partner.default_warehouse_id) {
    return partner.default_warehouse_id[0];
  }

  return null;
}
