import type { Metadata } from "next";
import Link from "next/link";
import { industries } from "@/lib/data/industries";
import { ROUTES } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Industrias",
  description:
    "Soluciones especializadas de gases industriales para vitivinicultura, petróleo, minería, salud, alimentación y más.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <div>
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
            <span>Industrias</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground">
        <div className="container mx-auto flex min-h-[55vh] flex-col justify-end px-4 pb-16 pt-24">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Soluciones Especializadas — Gases Aconcagua S.A.
          </p>
          <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-tighter sm:text-7xl md:text-8xl lg:text-[8rem]">
            Industrias
            <br />
            que <span className="text-accent">movemos</span>
          </h1>
          <p className="mt-12 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Proveemos gases industriales y medicinales a más de 9 sectores
            productivos, con soluciones adaptadas a las necesidades específicas
            de cada industria.
          </p>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 divide-x-2 divide-background/20">
            {[
              { value: String(industries.length), label: "Sectores" },
              { value: "500+", label: "Clientes Activos" },
              { value: "4", label: "Provincias" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="px-4 py-10 text-center md:px-8 md:py-14"
              >
                <p className="text-3xl font-black tracking-tighter text-accent md:text-5xl lg:text-6xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-background/50 md:mt-3 md:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industry Directory ───────────────────────────────── */}
      <section className="border-b-4 border-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14 flex items-start justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                01 — Directorio
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Todos los Sectores
              </h2>
            </div>
            <p className="mt-2 hidden text-xs font-bold uppercase tracking-widest text-muted-foreground md:block">
              {industries.length} industrias
            </p>
          </div>

          <div className="grid grid-cols-1 border-t-2 border-foreground sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry, i) => (
              <Link
                key={industry.slug}
                href={`${ROUTES.INDUSTRIES}/${industry.slug}`}
                className="group flex gap-4 border-b-2 border-foreground p-5 transition-colors duration-300 hover:bg-accent hover:text-background md:p-6"
              >
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-background/40 md:text-xs">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wide md:text-sm">
                    {industry.name}
                  </h3>
                  <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-background/60 md:text-xs">
                    {industry.shortDescription}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-accent opacity-0 transition-all duration-300 group-hover:text-background group-hover:opacity-100">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Industries (expanded cards) ─────────────── */}
      <section className="border-b-4 border-foreground bg-muted py-20 pattern-dots">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              02 — Industrias Destacadas
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Soluciones por Sector
            </h2>
          </div>

          <div className="space-y-4">
            {industries.slice(0, 6).map((industry, i) => (
              <Link
                key={industry.slug}
                href={`${ROUTES.INDUSTRIES}/${industry.slug}`}
                className="group flex flex-col gap-6 border-2 border-foreground bg-background p-6 transition-colors duration-300 hover:bg-accent hover:text-background md:flex-row md:items-start md:gap-10 md:border-4 md:p-8"
              >
                <div className="shrink-0 md:w-72 lg:w-80">
                  <span className="text-4xl font-black tracking-tighter text-foreground/10 transition-colors duration-300 group-hover:text-background/15 md:text-5xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-sm font-bold uppercase tracking-wide md:text-base">
                    {industry.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-background/60 md:text-sm">
                    {industry.shortDescription}
                  </p>
                </div>

                <div className="flex-1 border-t border-foreground/20 pt-4 transition-colors duration-300 group-hover:border-background/20 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {industry.features.map((feature) => (
                      <div key={feature.title}>
                        <p className="text-[10px] font-bold uppercase tracking-widest md:text-xs">
                          {feature.title}
                        </p>
                      </div>
                    ))}
                  </div>
                  <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-widest text-accent transition-colors duration-300 group-hover:text-background md:text-xs">
                    Ver Soluciones →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {industries.length > 6 && (
            <div className="mt-8 grid grid-cols-1 gap-px bg-foreground sm:grid-cols-3">
              {industries.slice(6).map((industry, i) => (
                <Link
                  key={industry.slug}
                  href={`${ROUTES.INDUSTRIES}/${industry.slug}`}
                  className="group flex items-start gap-5 bg-background p-6 transition-colors duration-300 hover:bg-accent hover:text-background md:p-8"
                >
                  <span className="text-2xl font-black tracking-tighter text-foreground/15 transition-colors duration-300 group-hover:text-background/20 md:text-3xl">
                    {String(i + 7).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide md:text-sm">
                      {industry.name}
                    </h3>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-background/60 md:text-xs">
                      {industry.shortDescription}
                    </p>
                    <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest text-accent transition-colors duration-300 group-hover:text-background md:text-xs">
                      Explorar →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
                ¿No encuentra
                <br />
                su industria?
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-background/70 md:text-base">
                Trabajamos con múltiples sectores productivos. Contáctenos para
                recibir asesoramiento técnico personalizado sobre soluciones de
                gases para su industria específica.
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
