import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { ROUTES } from "@/lib/utils/constants";
import { getShopProductBySlug } from "@/lib/odoo/product-service";
import { GasProductActions } from "@/components/products/gas-product-actions";
import { ProductActions } from "@/components/products/product-actions";
import type { Product } from "@/types";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getShopProductBySlug(slug);
    if (!product) return { title: "Producto no encontrado" };

    const title = product.metaTitle || product.name;
    const description = product.metaDescription || product.description;
    const path = `/products/${product.slug}`;

    return {
      title,
      description,
      ...(product.metaKeywords && { keywords: product.metaKeywords }),
      alternates: { canonical: path },
      openGraph: {
        title,
        description,
        type: "article",
        url: path,
        ...(product.imageUrl && { images: [{ url: product.imageUrl }] }),
      },
    };
  } catch {
    return { title: "Producto" };
  }
}

function ProductJsonLd({ product }: { product: Product }) {
  const netPrice =
    product.type === "gas" ? product.pricePerUnit : product.price;
  const priceWithTax = netPrice * (1 + product.taxRate / 100);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    ...(product.imageUrl && { image: product.imageUrl }),
    brand: { "@type": "Brand", name: "GASA" },
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: Math.round(priceWithTax * 100) / 100,
      priceValidUntil: new Date(new Date().getFullYear(), 11, 31).toISOString(),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const pricelistId = session?.user?.pricelistId ?? undefined;
  const product = await getShopProductBySlug(slug, pricelistId);

  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", href: "/" },
          { name: "Productos", href: "/products" },
          { name: product.name, href: `/products/${product.slug}` },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs font-bold uppercase tracking-widest">
          <Link
            href={ROUTES.PRODUCTS}
            className="text-muted-foreground transition-colors duration-200 hover:text-[#0094BB]"
          >
            Productos
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Product image */}
          <div className="relative aspect-square border-4 border-foreground bg-muted">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                unoptimized
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-6xl text-muted-foreground">
                  {product.type === "gas" ? "\u2689" : "\u2692"}
                </span>
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
              {product.categoryName}
            </span>
            <h1 className="mt-1 text-4xl font-black uppercase tracking-tighter md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-muted-foreground">{product.description}</p>

            {product.type === "gas" && product.purity && (
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Pureza: {product.purity}
              </p>
            )}

            {product.type === "supply" && product.brand && (
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Marca: {product.brand}
              </p>
            )}

            <div className="mt-6">
              {product.type === "gas" && product.containerSizes.length > 0 ? (
                <GasProductActions product={product} />
              ) : (
                <ProductActions
                  productId={product.id}
                  productName={product.name}
                  productSlug={product.slug}
                  basePrice={
                    product.type === "gas"
                      ? product.pricePerUnit
                      : product.price
                  }
                  taxRate={product.taxRate}
                />
              )}
            </div>

            {/* Stock status */}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span
                className={`dot-indicator h-2 w-2 ${product.inStock ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-muted-foreground">
                {product.inStock ? "En stock" : "Sin stock"}
              </span>
            </div>

            {/* SKU */}
            <p className="mt-2 text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
