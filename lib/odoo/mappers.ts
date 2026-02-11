import type { OdooProduct, OdooCategory } from "./types";
import type {
  Product,
  GasProduct,
  SupplyProduct,
  ProductCategory,
} from "@/types";
import { GAS_PRODUCT_DATA } from "@/lib/data/products";
import { slugify } from "@/lib/utils/slugify";

/** Construct a public Odoo image URL for a product template. */
function getOdooImageUrl(productId: number): string {
  const baseUrl = process.env.ODOO_URL || "";
  return `${baseUrl}/web/image/product.template/${productId}/image_1920`;
}

export function mapOdooCategory(cat: OdooCategory): ProductCategory {
  return {
    id: cat.id,
    slug: slugify(cat.name),
    name: cat.name,
    parentId: cat.parent_id ? cat.parent_id[0] : undefined,
  };
}

export function mapOdooProduct(
  p: OdooProduct,
  pricelistPrice?: number,
  taxRate?: number,
): Product {
  const sku = p.default_code || `PROD-${p.id}`;
  const slug = slugify(p.name);
  const categoryName = p.categ_id[1];
  const categoryId = p.categ_id[0];

  const imageUrl = getOdooImageUrl(p.id);

  if (p.is_gas) {
    const gasData = GAS_PRODUCT_DATA[p.id];

    if (gasData) {
      // Gas product with full hardcoded data
      return {
        id: p.id,
        slug,
        name: p.name,
        description: p.description_sale || "",
        type: "gas",
        categoryId,
        categoryName,
        imageUrl,
        inStock: p.qty_available > 0,
        sku,
        pricePerUnit: pricelistPrice ?? p.list_price,
        unitOfMeasure: gasData.unitOfMeasure,
        containerSizes: gasData.containerSizes,
        purity: gasData.purity,
        taxRate: taxRate ?? 21,
        metaTitle: p.website_meta_title || undefined,
        metaDescription: p.website_meta_description || undefined,
        metaKeywords: p.website_meta_keywords || undefined,
      } satisfies GasProduct;
    }

    // Gas product without hardcoded data — fallback with list_price
    const uom = p.uom_id ? p.uom_id[1] : "u";
    return {
      id: p.id,
      slug,
      name: p.name,
      description: p.description_sale || "",
      type: "gas",
      categoryId,
      categoryName,
      imageUrl,
      inStock: p.qty_available > 0,
      sku,
      pricePerUnit: pricelistPrice ?? p.list_price,
      unitOfMeasure: uom,
      containerSizes: [],
      taxRate: taxRate ?? 21,
      metaTitle: p.website_meta_title || undefined,
      metaDescription: p.website_meta_description || undefined,
      metaKeywords: p.website_meta_keywords || undefined,
    } satisfies GasProduct;
  }

  // Supply product
  return {
    id: p.id,
    slug,
    name: p.name,
    description: p.description_sale || "",
    type: "supply",
    categoryId,
    categoryName,
    imageUrl,
    inStock: p.qty_available > 0,
    sku,
    price: pricelistPrice ?? p.list_price,
    taxRate: taxRate ?? 21,
    metaTitle: p.website_meta_title || undefined,
    metaDescription: p.website_meta_description || undefined,
    metaKeywords: p.website_meta_keywords || undefined,
  } satisfies SupplyProduct;
}
