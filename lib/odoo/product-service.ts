import type { Product, GasProduct, ProductCategory } from "@/types";
import { GAS_PRODUCT_IDS } from "@/lib/data/products";
import {
  getProducts,
  getProductCount,
  getWebCategories,
  getPricelistItems,
  computePriceFromRules,
  searchProducts,
} from "./products";
import { getSaleTaxes, computeTaxRate } from "./taxes";
import { mapOdooCategory, mapOdooProduct } from "./mappers";
import { slugify } from "@/lib/utils/slugify";
import { odooClient } from "./client";

export async function getShopCategories(): Promise<ProductCategory[]> {
  const odooCategories = await getWebCategories();
  return odooCategories.map(mapOdooCategory);
}

export async function getShopCategoryBySlug(
  slug: string,
): Promise<ProductCategory | null> {
  const categories = await getShopCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getShopProducts(opts?: {
  limit?: number;
  offset?: number;
  categoryId?: number;
  pricelistId?: number;
}): Promise<Product[]> {
  const [products, taxMap, companyId] = await Promise.all([
    getProducts(opts?.limit, opts?.offset, opts?.categoryId),
    getSaleTaxes(),
    odooClient.getCompanyId(),
  ]);

  if (opts?.pricelistId) {
    const items = await getPricelistItems(opts.pricelistId);
    return products.map((p) => {
      const plPrice = computePriceFromRules(
        items,
        p.id,
        p.list_price,
        p.categ_id[0],
      );
      const rate = computeTaxRate(p.taxes_id ?? [], taxMap, companyId);
      return mapOdooProduct(p, plPrice ?? undefined, rate);
    });
  }

  return products.map((p) => {
    const rate = computeTaxRate(p.taxes_id ?? [], taxMap, companyId);
    return mapOdooProduct(p, undefined, rate);
  });
}

export async function getShopProductBySlug(
  slug: string,
  pricelistId?: number,
): Promise<Product | null> {
  // Fetch all published products and find by generated slug
  const [products, taxMap, companyId] = await Promise.all([
    getProducts(500),
    getSaleTaxes(),
    odooClient.getCompanyId(),
  ]);
  const target = products.find((p) => slugify(p.name) === slug);
  if (!target) return null;

  const rate = computeTaxRate(target.taxes_id ?? [], taxMap, companyId);

  if (pricelistId) {
    const items = await getPricelistItems(pricelistId);
    const plPrice = computePriceFromRules(
      items,
      target.id,
      target.list_price,
      target.categ_id[0],
    );
    return mapOdooProduct(target, plPrice ?? undefined, rate);
  }

  return mapOdooProduct(target, undefined, rate);
}

export async function getShopProductCount(
  categoryId?: number,
): Promise<number> {
  return getProductCount(categoryId);
}

export async function searchShopProducts(
  query: string,
  opts?: { limit?: number; pricelistId?: number },
): Promise<Product[]> {
  const [products, taxMap, companyId] = await Promise.all([
    searchProducts(query, opts?.limit),
    getSaleTaxes(),
    odooClient.getCompanyId(),
  ]);

  if (opts?.pricelistId) {
    const items = await getPricelistItems(opts.pricelistId);
    return products.map((p) => {
      const plPrice = computePriceFromRules(
        items,
        p.id,
        p.list_price,
        p.categ_id[0],
      );
      const rate = computeTaxRate(p.taxes_id ?? [], taxMap, companyId);
      return mapOdooProduct(p, plPrice ?? undefined, rate);
    });
  }

  return products.map((p) => {
    const rate = computeTaxRate(p.taxes_id ?? [], taxMap, companyId);
    return mapOdooProduct(p, undefined, rate);
  });
}

export async function getFeaturedGasProducts(limit = 6): Promise<GasProduct[]> {
  const [products, taxMap, companyId] = await Promise.all([
    getProducts(100),
    getSaleTaxes(),
    odooClient.getCompanyId(),
  ]);
  const gasProducts = products
    .filter((p) => p.is_gas)
    .map((p) => {
      const rate = computeTaxRate(p.taxes_id ?? [], taxMap, companyId);
      return mapOdooProduct(p, undefined, rate);
    })
    .filter((p): p is GasProduct => p.type === "gas");
  return gasProducts.slice(0, limit);
}

/** Map of Odoo product template ID → chemical formula for display purposes */
export const GAS_FORMULAS: Record<number, string> = {
  [GAS_PRODUCT_IDS.OXIGENO_INDUSTRIAL]: "O₂",
  [GAS_PRODUCT_IDS.CO2_INDUSTRIAL]: "CO₂",
  [GAS_PRODUCT_IDS.ACETILENO_INDUSTRIAL]: "C₂H₂",
  [GAS_PRODUCT_IDS.ARGON_INDUSTRIAL]: "Ar",
  [GAS_PRODUCT_IDS.NITROGENO_INDUSTRIAL]: "N₂",
  [GAS_PRODUCT_IDS.OXIGENO_MEDICINAL]: "O₂",
  [GAS_PRODUCT_IDS.MEZCLA_AR_CO2]: "Ar/CO₂",
  [GAS_PRODUCT_IDS.HELIO]: "He",
  [GAS_PRODUCT_IDS.PROPANO]: "C₃H₈",
};

/** Get chemical formula by Odoo product template ID */
export function getGasFormula(id: number): string {
  return GAS_FORMULAS[id] || "";
}
