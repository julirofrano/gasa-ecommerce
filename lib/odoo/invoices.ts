import { odooClient } from "./client";
import type { OdooInvoice, OdooInvoiceLine } from "./types";

/**
 * Resolve the top-level company partner ID.
 * Invoices may be linked to the parent company or any of its child contacts.
 */
async function resolveParentPartnerId(partnerId: number): Promise<number> {
  const partners = await odooClient.read<{
    parent_id: [number, string] | false;
  }>("res.partner", [partnerId], ["parent_id"]);
  const partner = partners[0];
  if (partner?.parent_id) {
    return partner.parent_id[0];
  }
  return partnerId;
}

export async function getInvoices(
  partnerId: number,
  limit = 50,
  offset = 0,
): Promise<OdooInvoice[]> {
  const parentId = await resolveParentPartnerId(partnerId);

  return odooClient.searchRead<OdooInvoice>(
    "account.move",
    [
      ["partner_id", "child_of", parentId],
      ["move_type", "in", ["out_invoice", "out_refund"]],
      ["state", "=", "posted"],
    ],
    [
      "name",
      "partner_id",
      "move_type",
      "invoice_date",
      "invoice_date_due",
      "state",
      "payment_state",
      "amount_total",
      "amount_residual",
      "currency_id",
    ],
    limit,
    offset,
    "invoice_date DESC",
  );
}

export async function getInvoiceById(
  invoiceId: number,
): Promise<OdooInvoice | null> {
  const invoices = await odooClient.read<OdooInvoice>(
    "account.move",
    [invoiceId],
    [
      "name",
      "partner_id",
      "move_type",
      "invoice_date",
      "invoice_date_due",
      "state",
      "payment_state",
      "amount_untaxed",
      "amount_tax",
      "amount_total",
      "amount_residual",
      "currency_id",
      "invoice_line_ids",
    ],
  );
  return invoices[0] || null;
}

export async function getInvoiceLines(
  lineIds: number[],
): Promise<OdooInvoiceLine[]> {
  if (lineIds.length === 0) return [];

  const lines = await odooClient.read<OdooInvoiceLine>(
    "account.move.line",
    lineIds,
    [
      "move_id",
      "product_id",
      "name",
      "quantity",
      "price_unit",
      "discount",
      "price_subtotal",
      "price_total",
      "tax_ids",
    ],
  );

  // Filter out tax/rounding lines — keep only lines with a product
  return lines.filter((line) => line.product_id !== false);
}

export async function getInvoiceNames(
  invoiceIds: number[],
): Promise<Array<{ id: number; name: string }>> {
  if (invoiceIds.length === 0) return [];
  return odooClient.read<{ id: number; name: string }>(
    "account.move",
    invoiceIds,
    ["name"],
  );
}
