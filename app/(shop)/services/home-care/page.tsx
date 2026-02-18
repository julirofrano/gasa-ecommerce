import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Oxígeno en Casa",
  description:
    "Servicio integral de oxigenoterapia domiciliaria: concentradores portátiles, estacionarios y generadores con soporte 24/7.",
  alternates: { canonical: "/services/home-care" },
};

const stats = [
  { value: "500+", label: "Familias Atendidas" },
  { value: "24/7", label: "Soporte Técnico" },
  { value: "10+", label: "Años de Servicio" },
];

const products = [
  {
    number: "01",
    title: "Concentradores Portátiles",
    description:
      "Equipos livianos y compactos para uso en movimiento, con autonomía de batería para máxima libertad.",
    features: [
      "Peso desde 2,5 kg",
      "Batería de larga duración",
      "Flujo continuo y pulso",
      "Aprobados por ANMAT",
    ],
  },
  {
    number: "02",
    title: "Concentradores Estacionarios",
    description:
      "Equipos de uso domiciliario permanente con flujo continuo de oxígeno de alta pureza.",
    features: [
      "Flujo de 1 a 10 LPM",
      "Funcionamiento silencioso",
      "Bajo consumo eléctrico",
      "Alarmas de seguridad",
    ],
  },
  {
    number: "03",
    title: "Generadores de Oxígeno",
    description:
      "Sistemas de generación in-situ para centros de salud, clínicas y uso domiciliario de alta demanda.",
    features: [
      "Producción continua",
      "Alta pureza (93-95%)",
      "Mínimo mantenimiento",
      "Monitoreo remoto",
    ],
  },
];

const benefits = [
  {
    number: "01",
    title: "Entrega Rápida",
    description:
      "Instalación en domicilio dentro de las 24 horas de la prescripción médica.",
  },
  {
    number: "02",
    title: "Soporte Médico",
    description:
      "Equipo de profesionales de salud disponible para consultas y seguimiento.",
  },
  {
    number: "03",
    title: "Equipos Certificados",
    description:
      "Todos nuestros equipos cuentan con aprobación de ANMAT y certificaciones vigentes.",
  },
  {
    number: "04",
    title: "Asistencia 24/7",
    description:
      "Línea de atención y soporte técnico disponible las 24 horas, los 7 días.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Prescripción Médica",
    description:
      "El médico tratante indica la oxigenoterapia domiciliaria con parámetros de flujo y horas de uso.",
  },
  {
    number: "02",
    title: "Evaluación Técnica",
    description:
      "Nuestro equipo evalúa las condiciones del domicilio y selecciona el equipo más adecuado.",
  },
  {
    number: "03",
    title: "Entrega e Instalación",
    description:
      "Entrega del equipo en domicilio con instalación, pruebas de funcionamiento y capacitación.",
  },
  {
    number: "04",
    title: "Seguimiento Continuo",
    description:
      "Visitas periódicas de mantenimiento, recambio de insumos y monitoreo de uso del equipo.",
  },
];

export default function HomeCareServicePage() {
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
            <Link
              href={ROUTES.SERVICES}
              className="text-muted-foreground transition-colors duration-200 hover:text-accent"
            >
              Servicios
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span>Oxígeno en Casa</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground">
        <div className="container mx-auto flex min-h-[55vh] flex-col justify-end px-4 pb-16 pt-24">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Oxigenoterapia Domiciliaria — Gases Aconcagua S.A.
          </p>
          <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-tighter sm:text-7xl md:text-8xl lg:text-[8rem]">
            Oxígeno
            <br />
            en <span className="text-accent">casa</span>
          </h1>
          <p className="mt-12 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Servicio integral de oxigenoterapia domiciliaria para pacientes que
            requieren oxígeno suplementario. Equipos de última generación con
            soporte técnico y médico permanente.
          </p>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 divide-x-2 divide-background/20">
            {stats.map((stat) => (
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

      {/* ── Products ─────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              01 — Equipamiento
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Nuestros Equipos
            </h2>
          </div>

          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.title}
                className="flex flex-col gap-6 border-2 border-foreground bg-background p-6 md:flex-row md:items-start md:gap-10 md:border-4 md:p-8"
              >
                <div className="shrink-0 md:w-72 lg:w-80">
                  <span className="text-4xl font-black tracking-tighter text-foreground/10 md:text-5xl">
                    {product.number}
                  </span>
                  <h3 className="mt-2 text-sm font-bold uppercase tracking-wide md:text-base">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
                    {product.description}
                  </p>
                </div>
                <div className="flex-1 border-t border-foreground/20 pt-4 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                  {product.features.map((feature, i) => (
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

      {/* ── Benefits ─────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-muted py-20 pattern-dots">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              02 — Beneficios
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              ¿Por Qué Elegirnos?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px bg-foreground sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-5 bg-background p-8 md:p-10"
              >
                <span className="text-4xl font-black tracking-tighter text-foreground/10 md:text-5xl">
                  {benefit.number}
                </span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground md:text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row md:gap-16">
            <div className="shrink-0 md:w-80 lg:w-96">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                03 — Proceso
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Cómo
                <br />
                Funciona
              </h2>
            </div>
            <div className="flex-1 border-t-2 border-foreground md:border-t-0">
              {processSteps.map((step) => (
                <div
                  key={step.number}
                  className="flex gap-4 border-b-2 border-foreground py-5 md:py-6"
                >
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground md:text-xs">
                    {step.number}
                  </span>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide md:text-base">
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-accent py-20 text-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-background/50">
                Oxigenoterapia Domiciliaria
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl lg:text-6xl">
                ¿Necesita oxígeno
                <br />
                en casa?
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-background/70 md:text-base">
                Contáctenos para coordinar la evaluación y entrega de equipos de
                oxigenoterapia domiciliaria. Atención personalizada y soporte
                técnico las 24 horas.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row">
              <a
                href="https://wa.me/5492613691623"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border-2 border-background bg-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                WhatsApp
              </a>
              <Link
                href={ROUTES.CONTACT}
                className="inline-flex items-center justify-center border-2 border-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:bg-background hover:text-accent"
              >
                Contactar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
