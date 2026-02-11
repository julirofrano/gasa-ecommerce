import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";
import type { Product, ProductCategory } from "@/types";
import {
  getShopCategories,
  getShopProducts,
  getGasFormula,
} from "@/lib/odoo/product-service";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Catálogo completo de gases industriales, medicinales, suministros de soldadura y equipamiento de seguridad.",
  alternates: { canonical: "/products" },
};

const PREVIEW_LIMIT = 4;

export default async function ProductsPage() {
  let categories: ProductCategory[] = [];
  let allProducts: Product[] = [];

  try {
    [categories, allProducts] = await Promise.all([
      getShopCategories(),
      getShopProducts({ limit: 500 }),
    ]);
  } catch (error) {
    console.error("[GASA] Error al conectar con Odoo:", error);
  }

  // Group products by categoryId
  const productsByCategory = new Map<number, typeof allProducts>();
  for (const product of allProducts) {
    const list = productsByCategory.get(product.categoryId) ?? [];
    list.push(product);
    productsByCategory.set(product.categoryId, list);
  }

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", href: "/" },
          { name: "Productos", href: "/products" },
        ]}
      />
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <div className="border-b-2 border-foreground">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-xs font-bold uppercase tracking-widest">
            <Link
              href={ROUTES.HOME}
              className="text-muted-foreground transition-colors duration-200 hover:text-[#0094BB]"
            >
              Inicio
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span>Productos</span>
          </nav>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:gap-12">
          {/* ── Sidebar ───────────────────────────────────────── */}
          <aside className="w-full shrink-0 md:sticky md:top-24 md:w-64 md:self-start lg:w-72">
            <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Catálogo
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {allProducts.length} productos en {categories.length} categorías
            </p>

            <nav className="mt-8 hidden border-t-2 border-foreground pt-6 md:block">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Categorías
              </p>
              <ul>
                {categories.map((cat) => {
                  const count = productsByCategory.get(cat.id)?.length ?? 0;
                  return (
                    <li key={cat.slug}>
                      <a
                        href={`#${cat.slug}`}
                        className="flex items-center justify-between border-b border-foreground/20 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-foreground/30">
                          {String(count).padStart(2, "0")}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* ── Mobile Category Nav ───────────────────────────── */}
          <div className="-mx-4 overflow-x-auto border-b-2 border-foreground md:hidden">
            <div className="flex">
              {categories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`#${cat.slug}`}
                  className="shrink-0 border-r border-foreground/20 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors duration-200 last:border-r-0"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>

          {/* ── Product Sections by Category ───────────────────── */}
          <div className="flex-1 space-y-16">
            {categories.map((cat, catIndex) => {
              const allCatProducts = productsByCategory.get(cat.id) ?? [];
              if (allCatProducts.length === 0) return null;
              const products = allCatProducts.slice(0, PREVIEW_LIMIT);
              const remaining = allCatProducts.length - products.length;

              return (
                <section key={cat.slug} id={cat.slug}>
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
                        {String(catIndex + 1).padStart(2, "0")}
                      </p>
                      <h2 className="text-2xl font-black uppercase tracking-tighter md:text-3xl">
                        {cat.name}
                      </h2>
                    </div>
                    <Link
                      href={`${ROUTES.CATEGORIES}/${cat.slug}`}
                      className="mt-1 hidden text-xs font-bold uppercase tracking-widest text-[#0094BB] transition-colors duration-200 hover:text-foreground md:block"
                    >
                      Ver Categoría →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {products.map((product) => (
                      <Link
                        key={product.id}
                        href={`${ROUTES.PRODUCTS}/${product.slug}`}
                        className="group overflow-hidden border-2 border-foreground bg-background transition-colors duration-300 hover:bg-[#0094BB] hover:text-background md:border-4"
                      >
                        {product.type === "gas" ? (
                          <>
                            <div className="flex aspect-[2/1] items-center justify-center bg-muted transition-colors duration-300 group-hover:bg-transparent">
                              <span className="text-4xl font-black tracking-tighter text-[#0094BB] transition-colors duration-300 group-hover:text-background/30 md:text-5xl">
                                {getGasFormula(product.id)}
                              </span>
                            </div>
                            <div className="p-5 md:p-6">
                              <h3 className="text-sm font-bold uppercase tracking-wide">
                                {product.name}
                              </h3>
                              {product.purity && (
                                <p className="mt-1 text-xs text-muted-foreground transition-colors duration-300 group-hover:text-background/60">
                                  Pureza {product.purity}
                                </p>
                              )}
                              <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-widest text-[#0094BB] transition-colors duration-300 group-hover:text-background md:text-xs">
                                Ver Producto →
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="relative aspect-[4/3] bg-muted transition-colors duration-300 group-hover:bg-transparent">
                              {product.imageUrl ? (
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  unoptimized
                                  className="object-contain p-4"
                                  sizes="(max-width: 640px) 100vw, 50vw"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <span className="text-xs font-bold uppercase tracking-widest text-foreground/20 transition-colors duration-300 group-hover:text-background/20 md:text-sm">
                                    {product.sku}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-5 md:p-6">
                              {product.brand && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-background/40 md:text-xs">
                                  {product.brand}
                                </span>
                              )}
                              <h3 className="mt-1 text-sm font-bold uppercase tracking-wide">
                                {product.name}
                              </h3>
                              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-background/60">
                                {product.description}
                              </p>
                              <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-widest text-[#0094BB] transition-colors duration-300 group-hover:text-background md:text-xs">
                                Ver Producto →
                              </span>
                            </div>
                          </>
                        )}
                      </Link>
                    ))}
                  </div>

                  {remaining > 0 && (
                    <Link
                      href={`${ROUTES.CATEGORIES}/${cat.slug}`}
                      className="mt-6 inline-flex items-center justify-center border-2 border-foreground px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors duration-200 hover:bg-foreground hover:text-background"
                    >
                      Ver {remaining}{" "}
                      {remaining === 1 ? "producto" : "productos"} más →
                    </Link>
                  )}

                  <Link
                    href={`${ROUTES.CATEGORIES}/${cat.slug}`}
                    className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-[#0094BB] transition-colors duration-200 hover:text-foreground md:hidden"
                  >
                    Ver Categoría →
                  </Link>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
