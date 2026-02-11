import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Instalaciones Industriales de Gases",
  description:
    "Ingeniería, diseño e instalación de sistemas completos de gases industriales. Soluciones para manufactura, soldadura y aplicaciones especializadas.",
  alternates: { canonical: "/services/gas-systems/industrial" },
};

const services = [
  {
    number: "01",
    title: "Diseño e Ingeniería",
    description:
      "Planificación integral de sistemas de gases industriales con análisis de procesos, cálculos de flujo y diseño de redes de distribución optimizadas.",
    features: [
      "Análisis de consumo y demanda industrial",
      "Diseño de manifolds y estaciones de regulación",
      "Cálculos de presión y caudal",
      "Documentación técnica especializada",
    ],
  },
  {
    number: "02",
    title: "Instalación de Sistemas",
    description:
      "Instalación profesional de redes de gases con tuberías de acero, cobre y acero inoxidable según las exigencias de cada proceso.",
    features: [
      "Tuberías industriales certificadas",
      "Manifolds y centrales de suministro",
      "Conexión de equipos y maquinaria",
      "Regulación y control automático",
    ],
  },
  {
    number: "03",
    title: "Seguridad y Normativas",
    description:
      "Cumplimiento estricto de normativas industriales y estándares de seguridad para instalaciones en entornos de producción.",
    features: [
      "Cumplimiento ASME y API",
      "Detección de gases",
      "Válvulas de seguridad y alivio",
      "Certificaciones de instalación",
    ],
  },
  {
    number: "04",
    title: "Monitoreo y Control",
    description:
      "Sistemas avanzados de monitoreo y control para optimizar el consumo y garantizar la continuidad operativa.",
    features: [
      "Telemetría industrial",
      "Control automático de presión",
      "Alarmas y sistemas de emergencia",
      "Monitoreo remoto 24/7",
    ],
  },
];

const applications = [
  {
    name: "Soldadura y Corte",
    description:
      "Sistemas de oxígeno, acetileno y gases inertes para líneas de producción.",
  },
  {
    name: "Procesos Químicos",
    description:
      "Nitrógeno, hidrógeno y gases especializados para procesos continuos.",
  },
  {
    name: "Metalurgia",
    description:
      "Gases protectores y atmósferas controladas para tratamientos térmicos.",
  },
  {
    name: "Manufactura",
    description:
      "Aire comprimido y gases de proceso para líneas automatizadas.",
  },
];

const specs = [
  {
    label: "Materiales",
    value: "Acero inoxidable, cobre, acero al carbono — normas ASME",
  },
  { label: "Presiones", value: "Desde 1 bar hasta 300 bar según aplicación" },
  { label: "Normativas", value: "ASME, API, ENARGAS, normas provinciales" },
];

export default function IndustrialGasSystemsPage() {
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
            <Link
              href={ROUTES.SERVICES}
              className="text-muted-foreground transition-colors duration-200 hover:text-[#0094BB]"
            >
              Servicios
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link
              href={ROUTES.SERVICES_GAS_SYSTEMS}
              className="text-muted-foreground transition-colors duration-200 hover:text-[#0094BB]"
            >
              Instalaciones
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span>Industrial</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground">
        <div className="container mx-auto flex min-h-[50vh] flex-col justify-end px-4 pb-16 pt-24">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
            Instalaciones Industriales
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl lg:text-7xl">
            Sistemas de Gases
            <br />
            <span className="text-[#0094BB]">Industriales</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Ingeniería, diseño e instalación de sistemas completos de gases
            industriales. Soluciones robustas para procesos de manufactura,
            soldadura y aplicaciones especializadas.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            {[
              "Diseño Personalizado",
              "Instalación Certificada",
              "Soporte 24/7",
            ].map((tag) => (
              <span
                key={tag}
                className="border-2 border-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-widest md:text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
              01 — Servicios
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Soluciones Completas
            </h2>
          </div>

          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.title}
                className="flex flex-col gap-6 border-2 border-foreground bg-background p-6 md:flex-row md:items-start md:gap-10 md:border-4 md:p-8"
              >
                <div className="shrink-0 md:w-72 lg:w-80">
                  <span className="text-4xl font-black tracking-tighter text-foreground/10 md:text-5xl">
                    {service.number}
                  </span>
                  <h3 className="mt-2 text-sm font-bold uppercase tracking-wide md:text-base">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
                    {service.description}
                  </p>
                </div>
                <div className="flex-1 border-t border-foreground/20 pt-4 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                  {service.features.map((feature, i) => (
                    <div
                      key={feature}
                      className="flex gap-3 border-b border-foreground/20 py-3 last:border-b-0"
                    >
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs leading-relaxed text-muted-foreground md:text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Applications ─────────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-muted py-20 pattern-dots">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
              02 — Aplicaciones
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Sectores de Aplicación
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px bg-foreground sm:grid-cols-2 lg:grid-cols-4">
            {applications.map((app, i) => (
              <div key={app.name} className="bg-background p-6 md:p-8">
                <span className="text-2xl font-black tracking-tighter text-foreground/10 md:text-3xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-xs font-bold uppercase tracking-wide md:text-sm">
                  {app.name}
                </h3>
                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground md:text-xs">
                  {app.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technical Specs ──────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-foreground py-20 text-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row md:gap-16">
            <div className="shrink-0 md:w-80 lg:w-96">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
                03 — Especificaciones
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Estándares
                <br />
                Técnicos
              </h2>
            </div>
            <div className="flex-1 border-t-2 border-background/20 pt-8 md:border-t-0 md:pt-0">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="border-b-2 border-background/20 py-5 md:py-6"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#0094BB] md:text-xs">
                    {spec.label}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-background/70 md:text-base">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-[#0094BB] py-20 text-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-background/50">
                Departamento de Ingeniería
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl lg:text-6xl">
                ¿Necesita una
                <br />
                instalación industrial?
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-background/70 md:text-base">
                Nuestro equipo de ingenieros especializados está listo para
                diseñar e instalar la solución de gases que su planta necesita.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row">
              <Link
                href={ROUTES.CONTACT}
                className="inline-flex items-center justify-center border-2 border-background bg-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-[#0094BB] transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                Solicitar Cotización
              </Link>
              <a
                href="mailto:ingenieria@gasesaconcagua.com.ar"
                className="inline-flex items-center justify-center border-2 border-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:bg-background hover:text-[#0094BB]"
              >
                Email Ingeniería
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
