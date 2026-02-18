import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ROUTES } from "@/lib/utils/constants";
import { industries } from "@/lib/data/industries";
import type { GasProduct, ProductCategory } from "@/types";
import {
  getFeaturedGasProducts,
  getShopCategories,
  getGasFormula,
} from "@/lib/odoo/product-service";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Counter } from "@/components/ui/counter";
import { HeroAnimated } from "@/components/home/hero-animated";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";

const tickerItems = [
  "Oxígeno",
  "CO₂",
  "Argón",
  "Nitrógeno",
  "Acetileno",
  "Helio",
  "Oxígeno Medicinal",
  "Ar/CO₂",
  "Hielo Seco",
];

const stats = [
  { value: "100%", label: "Empresa Argentina" },
  { value: "24hs", label: "Tiempo de Respuesta" },
  { value: "500+", label: "Clientes Activos" },
  { value: "9+", label: "Industrias Servidas" },
];

const services = [
  {
    number: "01",
    title: "Instalaciones de Gases",
    description:
      "Diseño, ingeniería e instalación de sistemas centralizados de gases industriales y medicinales.",
    href: ROUTES.SERVICES_GAS_SYSTEMS,
  },
  {
    number: "02",
    title: "Oxígeno en Casa",
    description:
      "Servicio integral de oxigenoterapia domiciliaria con soporte técnico 24 horas.",
    href: ROUTES.SERVICES_HOME_CARE,
  },
  {
    number: "03",
    title: "Hielo en Pellets",
    description:
      "Producción y distribución de hielo seco para conservación y limpieza criogénica.",
    href: ROUTES.SERVICES_ICE_PELLETS,
  },
];

export default async function HomePage() {
  let featuredGases: GasProduct[] = [];
  let categories: ProductCategory[] = [];

  try {
    [featuredGases, categories] = await Promise.all([
      getFeaturedGasProducts(6),
      getShopCategories(),
    ]);
  } catch (error) {
    console.error("[GASA] Error al conectar con Odoo:", error);
  }

  return (
    <>
      <OrganizationJsonLd />
      <Header />
      <MobileNav />
      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <HeroAnimated />

        {/* ── Ticker ───────────────────────────────────────────── */}
        <div className="overflow-hidden border-b-4 border-foreground bg-accent">
          <div className="animate-marquee flex w-max py-3.5">
            {[0, 1].map((copy) =>
              tickerItems.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex items-center px-6 text-xs font-bold uppercase tracking-[0.2em] text-background"
                >
                  {item}
                  <span className="ml-6 text-background/30">◆</span>
                </span>
              )),
            )}
          </div>
        </div>

        {/* ── Featured Gases ───────────────────────────────────── */}
        {featuredGases.length > 0 && (
          <section className="border-b-4 border-foreground py-20">
            <AnimateOnScroll>
              <div className="container mx-auto px-4">
                <div className="mb-14 flex items-start justify-between">
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                      01 — Gases
                    </p>
                    <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                      Nuestra Línea
                      <br className="hidden md:block" /> de Gases
                    </h2>
                  </div>
                  <Link
                    href={ROUTES.PRODUCTS}
                    className="mt-2 hidden text-xs font-bold uppercase tracking-widest text-accent transition-colors duration-200 hover:text-foreground md:block"
                  >
                    Ver Todos →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-px bg-foreground md:grid-cols-3">
                  {featuredGases.map((gas) => (
                    <Link
                      key={gas.slug}
                      href={`${ROUTES.PRODUCTS}/${gas.slug}`}
                      className="group overflow-hidden bg-background transition-colors duration-300 hover:bg-accent hover:text-background"
                    >
                      <div className="flex aspect-[2/1] items-center justify-center bg-muted transition-colors duration-300 group-hover:bg-transparent">
                        <span className="text-4xl font-black tracking-tighter text-accent transition-colors duration-300 group-hover:text-background/30 md:text-5xl lg:text-6xl">
                          {getGasFormula(gas.id)}
                        </span>
                      </div>
                      <div className="p-4 md:p-6">
                        <h3 className="text-xs font-bold uppercase tracking-wide md:text-sm">
                          {gas.name}
                        </h3>
                        <p className="mt-1 text-[10px] text-muted-foreground transition-colors duration-300 group-hover:text-background/60 md:text-xs">
                          Pureza {gas.purity}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link
                  href={ROUTES.PRODUCTS}
                  className="mt-8 inline-block text-xs font-bold uppercase tracking-widest text-accent transition-colors duration-200 hover:text-foreground md:hidden"
                >
                  Ver Todos los Gases →
                </Link>
              </div>
            </AnimateOnScroll>
          </section>
        )}

        {/* ── Categories ───────────────────────────────────────── */}
        {categories.length > 0 && (
          <section className="border-b-4 border-foreground bg-muted py-20 pattern-dots">
            <AnimateOnScroll>
              <div className="container mx-auto px-4">
                <div className="mb-14">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                    02 — Categorías
                  </p>
                  <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                    Todo lo que Necesitás
                  </h2>
                </div>

                <div
                  className={`grid grid-cols-1 gap-px bg-foreground sm:grid-cols-2 ${categories.length > 2 ? "lg:grid-cols-3" : ""}`}
                >
                  {categories.map((cat, i) => (
                    <Link
                      key={cat.slug}
                      href={`${ROUTES.CATEGORIES}/${cat.slug}`}
                      className="group flex items-start gap-5 bg-background p-6 transition-colors duration-300 hover:bg-accent hover:text-background md:p-8"
                    >
                      <span className="text-2xl font-black tracking-tighter text-foreground/15 transition-colors duration-300 group-hover:text-background/20 md:text-3xl">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wide md:text-sm">
                          {cat.name}
                        </h3>
                        <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest text-accent transition-colors duration-300 group-hover:text-background md:text-xs">
                          Explorar →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          </section>
        )}

        {/* ── Industries ───────────────────────────────────────── */}
        <section className="border-b-4 border-foreground py-20">
          <AnimateOnScroll>
            <div className="container mx-auto px-4">
              <div className="mb-14 flex items-start justify-between">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                    03 — Sectores
                  </p>
                  <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                    Industrias que
                    <br className="hidden md:block" /> Acompañamos
                  </h2>
                </div>
                <Link
                  href={ROUTES.INDUSTRIES}
                  className="mt-2 hidden text-xs font-bold uppercase tracking-widest text-accent transition-colors duration-200 hover:text-foreground md:block"
                >
                  Ver Todas →
                </Link>
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
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide md:text-sm">
                        {industry.name}
                      </h3>
                      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-background/60 md:text-xs">
                        {industry.shortDescription}
                      </p>
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
          </AnimateOnScroll>
        </section>

        {/* ── Stats ────────────────────────────────────────────── */}
        <section className="border-b-4 border-foreground bg-foreground text-background">
          <AnimateOnScroll>
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 divide-x-2 divide-background/20 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="px-4 py-14 text-center md:px-8"
                  >
                    <p className="text-4xl font-black tracking-tighter text-accent md:text-5xl lg:text-6xl">
                      <Counter value={stat.value} />
                    </p>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-background/50 md:text-xs">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </section>

        {/* ── Services ─────────────────────────────────────────── */}
        <section className="border-b-4 border-foreground py-20">
          <AnimateOnScroll>
            <div className="container mx-auto px-4">
              <div className="mb-14">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                  04 — Servicios
                </p>
                <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                  Más que Gases
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-px bg-foreground lg:grid-cols-3">
                {services.map((service) => (
                  <Link
                    key={service.href}
                    href={service.href}
                    className="group flex flex-col justify-between bg-background p-8 transition-colors duration-300 hover:bg-accent hover:text-background md:p-10"
                  >
                    <div>
                      <span className="text-4xl font-black tracking-tighter text-foreground/10 transition-colors duration-300 group-hover:text-background/15 md:text-5xl">
                        {service.number}
                      </span>
                      <h3 className="mt-4 text-sm font-bold uppercase tracking-wide">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-background/60 md:text-sm">
                        {service.description}
                      </p>
                    </div>
                    <span className="mt-8 text-[10px] font-bold uppercase tracking-widest text-accent transition-colors duration-300 group-hover:text-background md:text-xs">
                      Conocer Más →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        {process.env.NEXT_PUBLIC_ODOO_ENABLED !== "false" && (
          <section className="bg-accent py-20 text-background">
            <AnimateOnScroll>
              <div className="container mx-auto px-4">
                <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-background/50">
                      Portal de Clientes
                    </p>
                    <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl lg:text-6xl">
                      ¿Necesita una
                      <br />
                      recarga de envase?
                    </h2>
                    <p className="mt-6 max-w-lg text-sm leading-relaxed text-background/70 md:text-base">
                      Acceda a su portal de cliente para solicitar recargas,
                      consultar el estado de sus envases y gestionar sus pedidos
                      en línea.
                    </p>
                  </div>
                  <Link
                    href={ROUTES.LOGIN}
                    className="inline-flex shrink-0 items-center justify-center border-2 border-background bg-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:bg-foreground hover:text-background"
                  >
                    Acceder al Portal
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
