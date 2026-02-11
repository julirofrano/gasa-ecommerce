import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Instalaciones de Gases Medicinales",
  description:
    "Diseño, instalación y certificación de sistemas de gases medicinales para hospitales, clínicas y centros de salud. Cumplimiento normativo ANMAT.",
  alternates: { canonical: "/services/gas-systems/medical" },
};

const services = [
  {
    number: "01",
    title: "Diseño de Sistemas Médicos",
    description:
      "Planificación integral de sistemas de gases medicinales según normativas hospitalarias y requerimientos de cada área clínica.",
    features: [
      "Análisis de necesidades por especialidad",
      "Planos técnicos según NFPA 99",
      "Cálculos de flujo para áreas críticas",
      "Documentación para habilitación sanitaria",
    ],
  },
  {
    number: "02",
    title: "Instalación Hospitalaria",
    description:
      "Instalación especializada de redes en quirófanos, UTI, neonatología y áreas de cuidados intensivos.",
    features: [
      "Tuberías de cobre desoxidado certificado",
      "Centrales con respaldo automático",
      "Puntos de consumo en cabeceras de cama",
      "Sistemas de vacío y aire comprimido",
    ],
  },
  {
    number: "03",
    title: "Certificación Sanitaria",
    description:
      "Validación y certificación que cumplen con todas las normativas sanitarias y estándares de calidad médica.",
    features: [
      "Ensayos de pureza farmacéutica",
      "Pruebas de hermeticidad del sistema",
      "Certificación ANMAT y ministerial",
      "Validación IQ/OQ/PQ",
    ],
  },
  {
    number: "04",
    title: "Mantenimiento Médico",
    description:
      "Mantenimiento preventivo y correctivo especializado para garantizar la continuidad operativa hospitalaria.",
    features: [
      "Mantenimiento preventivo programado",
      "Respuesta 24/7 para emergencias",
      "Calibración de equipos de monitoreo",
      "Recertificación periódica del sistema",
    ],
  },
];

const applications = [
  {
    name: "Quirófanos",
    description:
      "Oxígeno, óxido nitroso y aire comprimido médico para cirugías.",
  },
  {
    name: "Cuidados Intensivos",
    description: "Sistemas de soporte vital y monitoreo continuo de gases.",
  },
  {
    name: "Diagnóstico por Imágenes",
    description: "Gases especiales para resonancia magnética y equipamiento.",
  },
  {
    name: "Áreas de Aislamiento",
    description: "Sistemas de presión negativa y filtración de aire.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Evaluación Médica",
    description:
      "Análisis de necesidades clínicas y requerimientos normativos ANMAT para cada área del centro de salud.",
  },
  {
    number: "02",
    title: "Diseño Sanitario",
    description:
      "Desarrollo de planos según normativas NFPA 99 y especificaciones médicas para cada especialidad.",
  },
  {
    number: "03",
    title: "Instalación Certificada",
    description:
      "Ejecución por personal especializado en instalaciones hospitalarias con materiales trazables.",
  },
  {
    number: "04",
    title: "Validación y Entrega",
    description:
      "Certificación ANMAT, validación IQ/OQ/PQ farmacéutica y capacitación del personal.",
  },
];

export default function MedicalGasSystemsPage() {
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
            <span>Medicinal</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground">
        <div className="container mx-auto flex min-h-[50vh] flex-col justify-end px-4 pb-16 pt-24">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
            Gases Medicinales — Certificación ANMAT
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl lg:text-7xl">
            Sistemas para
            <br />
            <span className="text-[#0094BB]">Centros de Salud</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Diseño, instalación y certificación de sistemas de gases medicinales
            para hospitales, clínicas y centros de salud. Cumplimiento normativo
            ANMAT garantizado.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            {["Certificación ANMAT", "Normas NFPA 99", "Soporte 24/7"].map(
              (tag) => (
                <span
                  key={tag}
                  className="border-2 border-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-widest md:text-xs"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
              01 — Servicios Médicos
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Soluciones Hospitalarias
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
              02 — Áreas Hospitalarias
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

      {/* ── Process ──────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row md:gap-16">
            <div className="shrink-0 md:w-80 lg:w-96">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
                03 — Proceso
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Metodología
                <br />
                Hospitalaria
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
                instalación médica?
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-background/70 md:text-base">
                Nuestro equipo de especialistas en gases medicinales está listo
                para diseñar e instalar el sistema que su institución necesita.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row">
              <Link
                href={ROUTES.CONTACT}
                className="inline-flex items-center justify-center border-2 border-background bg-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-[#0094BB] transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                Consultar Instalación
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
