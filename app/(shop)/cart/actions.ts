"use server";

import { auth } from "@/auth";
import { odooClient } from "@/lib/odoo/client";
import { getPricelistItems, computePriceFromRules } from "@/lib/odoo/products";
import { getSaleTaxes, computeTaxRate } from "@/lib/odoo/taxes";
import { GAS_PRODUCT_DATA } from "@/lib/data/products";
import type { OdooProduct } from "@/lib/odoo/types";

interface CartItemInfo {
  cartKey: string;
  productId: number;
  productType?: string;
  variantId?: number;
  containerCapacity?: number;
}

interface RefreshResult {
  prices: Record<string, number>;
  taxRates: Record<string, number>;
}

/**
 * Recalculate prices and tax rates for cart items using the current user's
 * pricelist (or public list prices when logged out).
 */
export async function refreshCartPrices(
  items: CartItemInfo[],
): Promise<RefreshResult> {
  if (items.length === 0) return { prices: {}, taxRates: {} };

  try {
    const session = await auth();
    const pricelistId = session?.user?.pricelistId ?? undefined;

    // Fetch only the products we need + tax map + company ID in parallel
    const productIds = [...new Set(items.map((i) => i.productId))];
    const [products, taxMap, companyId] = await Promise.all([
      odooClient.read<OdooProduct>("product.template", productIds, [
        "id",
        "list_price",
        "categ_id",
        "is_gas",
        "taxes_id",
      ]),
      getSaleTaxes(),
      odooClient.getCompanyId(),
    ]);
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Fetch pricelist rules if user has a pricelist
    const pricelistItems = pricelistId
      ? await getPricelistItems(pricelistId)
      : [];

    const prices: Record<string, number> = {};
    const taxRates: Record<string, number> = {};

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      // Compute tax rate for this product
      taxRates[item.cartKey] = computeTaxRate(
        product.taxes_id ?? [],
        taxMap,
        companyId,
      );

      // Compute unit price (pricelist-adjusted or public list_price)
      let unitPrice = product.list_price;
      if (pricelistItems.length > 0) {
        const plPrice = computePriceFromRules(
          pricelistItems,
          product.id,
          product.list_price,
          product.categ_id[0],
        );
        if (plPrice !== null) unitPrice = plPrice;
      }

      if (item.productType === "gas") {
        // Gas container: use containerCapacity directly
        if (item.containerCapacity && item.cartKey.includes("-container-")) {
          prices[item.cartKey] = unitPrice * item.containerCapacity;
          continue;
        }
        // Gas preset: find capacity from GAS_PRODUCT_DATA
        const gasData = GAS_PRODUCT_DATA[item.productId];
        if (gasData && item.variantId) {
          const containerSize = gasData.containerSizes.find(
            (s) => s.id === item.variantId,
          );
          if (containerSize) {
            prices[item.cartKey] = unitPrice * containerSize.capacity;
            continue;
          }
        }
        // Gas custom: parse capacity from cartKey (e.g. "273-custom-5")
        const customMatch = item.cartKey.match(/-custom-(.+)$/);
        if (customMatch) {
          const capacity = parseFloat(customMatch[1]);
          if (!isNaN(capacity)) {
            prices[item.cartKey] = unitPrice * capacity;
            continue;
          }
        }
      } else {
        // Supply product: unit price is the direct price
        prices[item.cartKey] = unitPrice;
      }
    }

    return { prices, taxRates };
  } catch {
    return { prices: {}, taxRates: {} };
  }
}
