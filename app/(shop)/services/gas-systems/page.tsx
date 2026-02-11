import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Instalaciones de Gases",
  description:
    "Diseño e instalación de sistemas de gases industriales y medicinales. Redes de cañerías, centrales y automatización.",
  alternates: { canonical: "/services/gas-systems" },
};

const capabilities = [
  {
    number: "01",
    title: "Ingeniería",
    description:
      "Relevamiento, diseño y cálculo de redes de distribución de gases con documentación técnica completa.",
  },
  {
    number: "02",
    title: "Instalación",
    description:
      "Montaje de cañerías, soldadura certificada, pruebas hidráulicas y puesta en marcha del sistema.",
  },
  {
    number: "03",
    title: "Certificación",
    description:
      "Habilitación ante organismos regulatorios: ENARGAS, ANMAT, ART y autoridades sanitarias.",
  },
  {
    number: "04",
    title: "Mantenimiento",
    description:
      "Servicio de mantenimiento preventivo y correctivo con respuesta de emergencia 24/7.",
  },
];

const industrialFeatures = [
  "Redes de distribución de O₂, N₂, Ar y CO₂",
  "Centrales con manifolds y paneles de regulación",
  "Almacenamiento criogénico",
  "Automatización y monitoreo remoto",
];

const medicalFeatures = [
  "Centrales de gases según norma IRAM 2566",
  "Redes de oxígeno, aire medicinal y vacío",
  "Alarmas y monitoreo de presión",
  "Habilitación ANMAT y sanitaria",
];

const processSteps = [
  {
    number: "01",
    title: "Relevamiento",
    description:
      "Análisis de necesidades, consumo y condiciones del sitio para diseñar la solución óptima.",
  },
  {
    number: "02",
    title: "Diseño",
    description:
      "Ingeniería de detalle con planos, cálculos de flujo, presión y especificaciones de materiales.",
  },
  {
    number: "03",
    title: "Instalación",
    description:
      "Montaje por personal certificado con soldadura calificada y materiales trazables.",
  },
  {
    number: "04",
    title: "Certificación",
    description:
      "Pruebas de hermeticidad, pureza y habilitación ante los organismos regulatorios correspondientes.",
  },
  {
    number: "05",
    title: "Puesta en Marcha",
    description:
      "Verificación operativa completa, capacitación del personal y entrega de documentación.",
  },
  {
    number: "06",
    title: "Mantenimiento",
    description:
      "Plan de mantenimiento preventivo programado con soporte técnico continuo.",
  },
];

export default function GasSystemsPage() {
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
            <span>Instalaciones de Gases</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground">
        <div className="container mx-auto flex min-h-[55vh] flex-col justify-end px-4 pb-16 pt-24">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
            Ingeniería & Instalación — Gases Aconcagua S.A.
          </p>
          <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-tighter sm:text-7xl md:text-8xl lg:text-[8rem]">
            Instalaciones
            <br />
            de <span className="text-[#0094BB]">gases</span>
          </h1>
          <p className="mt-12 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Diseñamos e instalamos sistemas completos de distribución de gases
            para plantas industriales e instituciones de salud, cumpliendo las
            normas más exigentes.
          </p>
        </div>
      </section>

      {/* ── Two Lines: Industrial & Medical ───────────────────── */}
      <section className="border-b-4 border-foreground">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <Link
            href={ROUTES.SERVICES_GAS_SYSTEMS_INDUSTRIAL}
            className="group border-b-4 border-foreground transition-colors duration-300 hover:bg-[#0094BB] hover:text-background md:border-b-0 md:border-r-4"
          >
            <div className="container mx-auto px-4 py-14 md:py-20">
              <div className="mx-auto max-w-lg">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB] transition-colors duration-300 group-hover:text-background">
                  01 — Industrial
                </p>
                <h2 className="text-3xl font-black uppercase tracking-tighter md:text-4xl">
                  Sistemas Industriales
                </h2>
                <ul className="mt-6 space-y-0">
                  {industrialFeatures.map((feature, i) => (
                    <li
                      key={feature}
                      className="flex gap-3 border-b border-foreground/20 py-3 transition-colors duration-300 last:border-b-0 group-hover:border-background/20"
                    >
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-background/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-background/70 md:text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-block text-[10px] font-bold uppercase tracking-widest text-[#0094BB] transition-colors duration-300 group-hover:text-background md:text-xs">
                  Ver Soluciones Industriales →
                </span>
              </div>
            </div>
          </Link>

          <Link
            href={ROUTES.SERVICES_GAS_SYSTEMS_MEDICAL}
            className="group transition-colors duration-300 hover:bg-[#0094BB] hover:text-background"
          >
            <div className="container mx-auto px-4 py-14 md:py-20">
              <div className="mx-auto max-w-lg">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB] transition-colors duration-300 group-hover:text-background">
                  02 — Medicinal
                </p>
                <h2 className="text-3xl font-black uppercase tracking-tighter md:text-4xl">
                  Sistemas Medicinales
                </h2>
                <ul className="mt-6 space-y-0">
                  {medicalFeatures.map((feature, i) => (
                    <li
                      key={feature}
                      className="flex gap-3 border-b border-foreground/20 py-3 transition-colors duration-300 last:border-b-0 group-hover:border-background/20"
                    >
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-background/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-background/70 md:text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-block text-[10px] font-bold uppercase tracking-widest text-[#0094BB] transition-colors duration-300 group-hover:text-background md:text-xs">
                  Ver Soluciones Medicinales →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Capabilities ─────────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-muted py-20 pattern-dots">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
              03 — Capacidades
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Servicio Integral
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px bg-foreground sm:grid-cols-2">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="flex gap-5 bg-background p-8 md:p-10"
              >
                <span className="text-4xl font-black tracking-tighter text-foreground/10 md:text-5xl">
                  {cap.number}
                </span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide">
                    {cap.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground md:text-sm">
                    {cap.description}
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
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
                04 — Proceso
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Metodología
                <br />
                de Trabajo
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
                instalación de gases?
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-background/70 md:text-base">
                Contacte a nuestro departamento de ingeniería para recibir un
                presupuesto personalizado para su planta industrial o
                institución de salud.
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
