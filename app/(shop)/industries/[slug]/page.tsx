import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { industries } from "@/lib/data/industries";
import { ROUTES } from "@/lib/utils/constants";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) return { title: "Industria no encontrada" };

  const title = industry.name;
  const description = industry.shortDescription;

  return {
    title,
    description,
    alternates: { canonical: `/industries/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/industries/${slug}`,
    },
  };
}

export default async function IndustryDetailPage({ params }: Props) {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);

  if (!industry) notFound();

  const industryIndex = industries.findIndex((i) => i.slug === slug);
  const otherIndustries = industries.filter((i) => i.slug !== slug);

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", href: "/" },
          { name: "Industrias", href: "/industries" },
          { name: industry.name, href: `/industries/${slug}` },
        ]}
      />
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <div className="border-b-2 border-foreground">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-xs font-bold uppercase tracking-widest">
            <Link
              href={ROUTES.HOME}
              className="text-muted-foreground transition-colors duration-200 hover:text-accent"
            >
              Inicio
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link
              href={ROUTES.INDUSTRIES}
              className="text-muted-foreground transition-colors duration-200 hover:text-accent"
            >
              Industrias
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span>{industry.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground">
        <div className="container mx-auto flex min-h-[50vh] flex-col justify-end px-4 pb-16 pt-24">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            {String(industryIndex + 1).padStart(2, "0")} — Soluciones para
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl lg:text-7xl">
            {industry.name}
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {industry.description}
          </p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              01 — Nuestras Soluciones
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Productos y Servicios
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px bg-foreground sm:grid-cols-2">
            {industry.features.map((feature, i) => (
              <div
                key={feature.title}
                className="flex gap-5 bg-background p-8 md:p-10"
              >
                <span className="text-4xl font-black tracking-tighter text-foreground/10 md:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground md:text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other Industries ─────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-muted py-20 pattern-dots">
        <div className="container mx-auto px-4">
          <div className="mb-14 flex items-start justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                02 — Más Sectores
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Otras Industrias
              </h2>
            </div>
            <Link
              href={ROUTES.INDUSTRIES}
              className="mt-2 hidden text-xs font-bold uppercase tracking-widest text-accent transition-colors duration-200 hover:text-foreground md:block"
            >
              Ver Todas →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-px bg-foreground sm:grid-cols-2 lg:grid-cols-4">
            {otherIndustries.slice(0, 4).map((ind, i) => (
              <Link
                key={ind.slug}
                href={`${ROUTES.INDUSTRIES}/${ind.slug}`}
                className="group flex items-start gap-4 bg-background p-6 transition-colors duration-300 hover:bg-accent hover:text-background md:p-8"
              >
                <span className="text-2xl font-black tracking-tighter text-foreground/15 transition-colors duration-300 group-hover:text-background/20 md:text-3xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide md:text-sm">
                    {ind.name}
                  </h3>
                  <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest text-accent transition-colors duration-300 group-hover:text-background md:text-xs">
                    Explorar →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href={ROUTES.INDUSTRIES}
            className="mt-8 inline-block text-xs font-bold uppercase tracking-widest text-accent transition-colors duration-200 hover:text-foreground md:hidden"
          >
            Ver Todas las Industrias →
          </Link>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-accent py-20 text-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-background/50">
                Asesoramiento Técnico
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl lg:text-6xl">
                ¿Necesita soluciones
                <br />
                para {industry.name.toLowerCase()}?
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-background/70 md:text-base">
                Contáctenos para recibir asesoramiento técnico personalizado
                sobre gases industriales y servicios para su sector.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row">
              <Link
                href={ROUTES.CONTACT}
                className="inline-flex items-center justify-center border-2 border-background bg-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                Contactar
              </Link>
              <Link
                href={ROUTES.PRODUCTS}
                className="inline-flex items-center justify-center border-2 border-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:bg-background hover:text-accent"
              >
                Ver Catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
