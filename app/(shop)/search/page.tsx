import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { auth } from "@/auth";
import { ROUTES } from "@/lib/utils/constants";
import { searchShopProducts, getGasFormula } from "@/lib/odoo/product-service";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { q } = await searchParams;
  if (!q)
    return {
      title: "Buscar",
      robots: { index: false, follow: true },
    };
  return {
    title: `"${q}" — Búsqueda`,
    description: `Resultados de búsqueda para "${q}" en Gases Aconcagua S.A.`,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  // No query — prompt the user
  if (!query) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Search className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-6 text-4xl font-black uppercase tracking-tighter md:text-5xl">
          Buscar Productos
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Ingresá un término de búsqueda para encontrar productos.
        </p>
      </div>
    );
  }

  let products: Awaited<ReturnType<typeof searchShopProducts>> = [];

  try {
    const session = await auth();
    const pricelistId = session?.user?.pricelistId ?? undefined;
    products = await searchShopProducts(query, { pricelistId });
  } catch (error) {
    console.error("[GASA] Error al conectar con Odoo:", error);
  }

  return (
    <div>
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
            <span>Búsqueda</span>
          </nav>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-10 md:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
          Resultados de Búsqueda
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase tracking-tighter md:text-5xl">
          &ldquo;{query}&rdquo;
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {products.length === 0
            ? "No se encontraron productos"
            : `${products.length} ${products.length === 1 ? "producto encontrado" : "productos encontrados"}`}
        </p>

        {products.length === 0 ? (
          <div className="mt-10 border-2 border-foreground p-12 text-center md:border-4">
            <p className="text-lg font-bold uppercase tracking-wide">
              Sin resultados
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              No encontramos productos que coincidan con tu búsqueda.
            </p>
            <Link
              href={ROUTES.PRODUCTS}
              className="mt-6 inline-flex items-center justify-center border-2 border-foreground bg-foreground px-8 py-3 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]"
            >
              Ver Todos los Productos
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        )}
      </div>
    </div>
  );
}
