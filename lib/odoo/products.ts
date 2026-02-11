import { odooClient } from "./client";
import type { OdooProduct, OdooProductVariant, OdooCategory } from "./types";

const PRODUCT_FIELDS = [
  "name",
  "display_name",
  "default_code",
  "description_sale",
  "list_price",
  "categ_id",
  "qty_available",
  "website_published",
  "is_gas",
  "uom_id",
  "taxes_id",
  "website_meta_title",
  "website_meta_description",
  "website_meta_keywords",
  "seo_name",
];

const PUBLISHED_DOMAIN: unknown[] = [
  ["website_published", "=", true],
  ["active", "=", true],
];

export async function getProducts(
  limit = 20,
  offset = 0,
  categoryId?: number,
): Promise<OdooProduct[]> {
  const domain: unknown[] = [...PUBLISHED_DOMAIN];

  if (categoryId) {
    domain.push(["categ_id", "=", categoryId]);
  }

  return odooClient.searchRead<OdooProduct>(
    "product.template",
    domain,
    PRODUCT_FIELDS,
    limit,
    offset,
    "name ASC",
  );
}

export async function getProductBySlug(
  slug: string,
): Promise<OdooProduct | null> {
  const products = await odooClient.searchRead<OdooProduct>(
    "product.template",
    [
      ["default_code", "=", slug],
      ["active", "=", true],
    ],
    PRODUCT_FIELDS,
    1,
  );
  return products[0] || null;
}

export async function getProductVariants(
  templateId: number,
): Promise<OdooProductVariant[]> {
  return odooClient.searchRead<OdooProductVariant>(
    "product.product",
    [
      ["product_tmpl_id", "=", templateId],
      ["active", "=", true],
    ],
    [
      "name",
      "display_name",
      "default_code",
      "list_price",
      "qty_available",
      "image_variant_1920",
      "product_template_attribute_value_ids",
    ],
  );
}

export async function getCategories(): Promise<OdooCategory[]> {
  return odooClient.searchRead<OdooCategory>(
    "product.category",
    [],
    ["name", "display_name", "complete_name", "parent_id", "product_count"],
    undefined,
    undefined,
    "complete_name ASC",
  );
}

export async function getCategoryById(
  id: number,
): Promise<OdooCategory | null> {
  const categories = await odooClient.read<OdooCategory>(
    "product.category",
    [id],
    [
      "name",
      "display_name",
      "complete_name",
      "parent_id",
      "child_id",
      "product_count",
    ],
  );
  return categories[0] || null;
}

export async function searchProducts(
  query: string,
  limit = 20,
): Promise<OdooProduct[]> {
  return odooClient.searchRead<OdooProduct>(
    "product.template",
    [
      ...PUBLISHED_DOMAIN,
      "|",
      ["name", "ilike", query],
      "|",
      ["description_sale", "ilike", query],
      ["default_code", "ilike", query],
    ],
    PRODUCT_FIELDS,
    limit,
  );
}

interface OdooPricelistItem {
  id: number;
  applied_on: string;
  product_tmpl_id: [number, string] | false;
  categ_id: [number, string] | false;
  compute_price: string;
  fixed_price: number;
  percent_price: number;
  min_quantity: number;
  date_start: string | false;
  date_end: string | false;
}

/**
 * Fetch all pricelist items for a given pricelist, ordered by specificity.
 */
export async function getPricelistItems(
  pricelistId: number,
): Promise<OdooPricelistItem[]> {
  return odooClient.searchRead<OdooPricelistItem>(
    "product.pricelist.item",
    [["pricelist_id", "=", pricelistId]],
    [
      "applied_on",
      "product_tmpl_id",
      "categ_id",
      "compute_price",
      "fixed_price",
      "percent_price",
      "min_quantity",
      "date_start",
      "date_end",
    ],
    undefined,
    undefined,
    "applied_on ASC, min_quantity ASC",
  );
}

/**
 * Compute pricelist-adjusted price from pre-fetched rules.
 * Evaluates rules in specificity order (product → category → global)
 * and returns the first matching rule's computed price.
 */
export function computePriceFromRules(
  items: OdooPricelistItem[],
  templateId: number,
  listPrice: number,
  categoryId: number,
): number | null {
  const today = new Date().toISOString().split("T")[0];

  for (const item of items) {
    if (item.date_start && item.date_start > today) continue;
    if (item.date_end && item.date_end < today) continue;
    if (item.min_quantity > 1) continue;

    switch (item.applied_on) {
      case "0_product_variant":
        continue;
      case "1_product":
        if (!item.product_tmpl_id || item.product_tmpl_id[0] !== templateId)
          continue;
        break;
      case "2_product_category":
        if (!item.categ_id || item.categ_id[0] !== categoryId) continue;
        break;
      case "3_global":
        break;
      default:
        continue;
    }

    if (item.compute_price === "fixed") {
      return item.fixed_price;
    }
    if (item.compute_price === "percentage") {
      return listPrice * (1 - item.percent_price / 100);
    }
    // formula — can't compute client-side, fall back
    return null;
  }

  return null;
}

export async function getProductCount(categoryId?: number): Promise<number> {
  const domain: unknown[] = [...PUBLISHED_DOMAIN];
  if (categoryId) {
    domain.push(["categ_id", "=", categoryId]);
  }
  return odooClient.call<number>("product.template", "search_count", [domain]);
}

export async function getWebCategories(): Promise<OdooCategory[]> {
  // Get all category IDs that have at least one published product
  const products = await odooClient.searchRead<Pick<OdooProduct, "categ_id">>(
    "product.template",
    PUBLISHED_DOMAIN,
    ["categ_id"],
    undefined,
    undefined,
    undefined,
  );

  const categoryIds = [...new Set(products.map((p) => p.categ_id[0]))];
  if (categoryIds.length === 0) return [];

  return odooClient.read<OdooCategory>("product.category", categoryIds, [
    "name",
    "display_name",
    "complete_name",
    "parent_id",
    "product_count",
  ]);
}
