import { odooClient } from "./client";
import type { OdooTax } from "./types";

let cachedTaxMap: Map<number, OdooTax> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetch all sale taxes of type 'percent' from Odoo (all companies).
 * Cached in-memory with 1-hour TTL.
 */
export async function getSaleTaxes(): Promise<Map<number, OdooTax>> {
  const now = Date.now();
  if (cachedTaxMap && now - cacheTimestamp < CACHE_TTL) {
    return cachedTaxMap;
  }

  const taxes = await odooClient.searchRead<OdooTax>(
    "account.tax",
    [
      ["type_tax_use", "=", "sale"],
      ["amount_type", "=", "percent"],
    ],
    ["name", "amount", "amount_type", "type_tax_use", "company_id"],
  );

  const map = new Map<number, OdooTax>();
  for (const tax of taxes) {
    map.set(tax.id, tax);
  }

  cachedTaxMap = map;
  cacheTimestamp = now;
  return map;
}

/**
 * Compute the tax rate for a product's tax IDs, aware of multi-company.
 *
 * Groups matched taxes by company_id, then:
 * 1. If preferredCompanyId matches a group → sum that group's amounts
 * 2. Otherwise → pick the first available company group and sum its amounts
 *
 * This prevents cross-company summing (e.g. 21% + 10.5% = 31.5%)
 * and prevents 0% when taxes exist under a different company.
 */
export function computeTaxRate(
  taxIds: number[],
  taxMap: Map<number, OdooTax>,
  preferredCompanyId?: number,
): number {
  const matched: OdooTax[] = [];
  for (const id of taxIds) {
    const tax = taxMap.get(id);
    if (tax) matched.push(tax);
  }

  if (matched.length === 0) return 0;

  // Group by company
  const byCompany = new Map<number, OdooTax[]>();
  for (const tax of matched) {
    const compId = tax.company_id[0];
    const group = byCompany.get(compId);
    if (group) {
      group.push(tax);
    } else {
      byCompany.set(compId, [tax]);
    }
  }

  // Pick the preferred company's group, or fall back to first available
  const taxes =
    (preferredCompanyId && byCompany.get(preferredCompanyId)) ||
    byCompany.values().next().value;

  let total = 0;
  for (const tax of taxes!) {
    total += tax.amount;
  }
  return total;
}
