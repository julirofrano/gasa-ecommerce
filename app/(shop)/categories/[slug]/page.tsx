import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ROUTES } from "@/lib/utils/constants";
import {
  getShopCategories,
  getShopCategoryBySlug,
  getShopProducts,
  getShopProductCount,
  getGasFormula,
} from "@/lib/odoo/product-service";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";

const PRODUCTS_PER_PAGE = 4;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const category = await getShopCategoryBySlug(slug);
    if (!category) return { title: "Categoría no encontrada" };

    const title = category.name;
    const description = `Catálogo de ${category.name.toLowerCase()} de Gases Aconcagua S.A.`;

    return {
      title,
      description,
      alternates: { canonical: `/categories/${slug}` },
      openGraph: {
        title,
        description,
        type: "website",
        url: `/categories/${slug}`,
      },
    };
  } catch {
    return { title: "Categoría" };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;

  let category;
  let categories;
  let totalProducts;
  try {
    [category, categories] = await Promise.all([
      getShopCategoryBySlug(slug),
      getShopCategories(),
    ]);
    if (!category) notFound();
    totalProducts = await getShopProductCount(category.id);
  } catch {
    notFound();
  }

  const currentPage = Math.max(1, Number(page) || 1);
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const products = await getShopProducts({
    limit: PRODUCTS_PER_PAGE,
    offset: (safePage - 1) * PRODUCTS_PER_PAGE,
    categoryId: category.id,
  });

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", href: "/" },
          { name: "Productos", href: "/products" },
          { name: category.name, href: `/categories/${slug}` },
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
            <Link
              href={ROUTES.PRODUCTS}
              className="text-muted-foreground transition-colors duration-200 hover:text-[#0094BB]"
            >
              Productos
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span>{category.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:gap-12">
          {/* ── Sidebar ─────────────────────────────────────── */}
          <aside className="w-full shrink-0 md:sticky md:top-24 md:w-64 md:self-start lg:w-72">
            <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              {category.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {totalProducts}{" "}
              {totalProducts === 1
                ? "producto disponible"
                : "productos disponibles"}
            </p>

            {/* Category navigation */}
            <nav className="mt-8 hidden border-t-2 border-foreground pt-6 md:block">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Categorías
              </p>
              <ul>
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`${ROUTES.CATEGORIES}/${cat.slug}`}
                      className={`block border-b border-foreground/20 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${
                        cat.slug === slug
                          ? "text-[#0094BB]"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Link
              href={ROUTES.PRODUCTS}
              className="mt-6 hidden text-xs font-bold uppercase tracking-widest text-[#0094BB] transition-colors duration-200 hover:text-foreground md:inline-block"
            >
              ← Ver Todos los Productos
            </Link>
          </aside>

          {/* ── Mobile Category Nav ─────────────────────────── */}
          <div className="-mx-4 overflow-x-auto border-b-2 border-foreground md:hidden">
            <div className="flex">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`${ROUTES.CATEGORIES}/${cat.slug}`}
                  className={`shrink-0 border-r border-foreground/20 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 last:border-r-0 ${
                    cat.slug === slug
                      ? "bg-[#0094BB] text-background"
                      : "text-muted-foreground"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Product Grid ────────────────────────────────── */}
          <div className="flex-1">
            {totalProducts === 0 ? (
              <div className="border-2 border-foreground p-12 text-center md:border-4">
                <p className="text-lg font-bold uppercase tracking-wide">
                  Sin productos
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay productos disponibles en esta categoría.
                </p>
                <Link
                  href={ROUTES.PRODUCTS}
                  className="mt-6 inline-flex items-center justify-center border-2 border-foreground bg-foreground px-8 py-3 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]"
                >
                  Ver Todos los Productos
                </Link>
              </div>
            ) : (
              <>
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
                            <h2 className="text-sm font-bold uppercase tracking-wide">
                              {product.name}
                            </h2>
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
                            <h2 className="mt-1 text-sm font-bold uppercase tracking-wide">
                              {product.name}
                            </h2>
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

                {/* ── Pagination ───────────────────────────────── */}
                {totalPages > 1 && (
                  <nav className="mt-10 flex items-center justify-between border-t-2 border-foreground pt-6">
                    {safePage > 1 ? (
                      <Link
                        href={`${ROUTES.CATEGORIES}/${slug}?page=${safePage - 1}`}
                        className="border-2 border-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors duration-200 hover:bg-foreground hover:text-background"
                      >
                        ← Anterior
                      </Link>
                    ) : (
                      <span className="border-2 border-foreground/20 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        ← Anterior
                      </span>
                    )}

                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {safePage} / {totalPages}
                    </span>

                    {safePage < totalPages ? (
                      <Link
                        href={`${ROUTES.CATEGORIES}/${slug}?page=${safePage + 1}`}
                        className="border-2 border-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors duration-200 hover:bg-foreground hover:text-background"
                      >
                        Siguiente →
                      </Link>
                    ) : (
                      <span className="border-2 border-foreground/20 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Siguiente →
                      </span>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Other Categories ────────────────────────────────── */}
      <div className="border-t-4 border-foreground bg-muted py-12 pattern-dots md:py-16">
        <div className="container mx-auto px-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
            Más Categorías
          </p>
          <h2 className="mb-8 text-3xl font-black uppercase tracking-tighter md:text-4xl">
            Explorar Otras
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories
              .filter((cat) => cat.slug !== slug)
              .map((cat, i) => (
                <Link
                  key={cat.slug}
                  href={`${ROUTES.CATEGORIES}/${cat.slug}`}
                  className="group flex items-start gap-5 border-2 border-foreground bg-background p-6 transition-colors duration-300 hover:bg-[#0094BB] hover:text-background md:border-4 md:p-8"
                >
                  <span className="text-2xl font-black tracking-tighter text-foreground/15 transition-colors duration-300 group-hover:text-background/20 md:text-3xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide md:text-sm">
                      {cat.name}
                    </h3>
                    <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest text-[#0094BB] transition-colors duration-300 group-hover:text-background md:text-xs">
                      Explorar →
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
