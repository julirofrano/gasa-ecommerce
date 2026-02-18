import { odooClient } from "./client";
import type { OdooInvoice, OdooInvoiceLine } from "./types";

export async function getInvoices(
  commercialPartnerId: number,
  limit = 50,
  offset = 0,
): Promise<OdooInvoice[]> {
  const parentId = commercialPartnerId;

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
