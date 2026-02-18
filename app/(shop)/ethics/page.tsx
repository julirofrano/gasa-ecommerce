import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";
import { AnonymousReportForm } from "./anonymous-report-form";

export const metadata: Metadata = {
  title: "Ética y Cumplimiento",
  description:
    "Programa de ética y cumplimiento normativo de Gases Aconcagua S.A. Canal de denuncias anónimo, principios éticos y áreas de cumplimiento.",
  alternates: { canonical: "/ethics" },
};

const principles = [
  {
    number: "01",
    title: "Integridad",
    description:
      "Actuamos con honestidad y coherencia entre lo que decimos y hacemos. Nuestras decisiones se basan en valores éticos inquebrantables.",
  },
  {
    number: "02",
    title: "Respeto",
    description:
      "Valoramos la dignidad de todas las personas. Promovemos un ambiente de trabajo inclusivo y libre de discriminación.",
  },
  {
    number: "03",
    title: "Transparencia",
    description:
      "Comunicamos de manera clara y oportuna. Nuestros procesos son auditables y nuestras decisiones fundamentadas.",
  },
  {
    number: "04",
    title: "Responsabilidad",
    description:
      "Asumimos las consecuencias de nuestras acciones. Operamos de manera segura, cuidando el medio ambiente y la comunidad.",
  },
];

const complianceAreas = [
  {
    title: "Cumplimiento Legal",
    items: [
      "Legislación laboral y de seguridad e higiene",
      "Regulaciones ENARGAS y ANMAT",
      "Normas ambientales provinciales y nacionales",
      "Legislación tributaria y fiscal",
    ],
  },
  {
    title: "Políticas Internas",
    items: [
      "Código de conducta empresarial",
      "Políticas anti-corrupción y soborno",
      "Prevención de lavado de activos",
      "Gestión de conflictos de interés",
    ],
  },
  {
    title: "Gestión de Riesgos",
    items: [
      "Identificación y evaluación de riesgos éticos",
      "Auditorías internas periódicas",
      "Planes de acción correctiva",
      "Capacitación continua del personal",
    ],
  },
];

const commitments = [
  {
    number: "01",
    text: "Tolerancia cero con el fraude, la corrupción y cualquier forma de soborno.",
  },
  {
    number: "02",
    text: "Protección absoluta para quienes denuncian irregularidades de buena fe.",
  },
  {
    number: "03",
    text: "Confidencialidad garantizada en todos los procesos de investigación interna.",
  },
  {
    number: "04",
    text: "Tratamiento imparcial de cada reporte recibido, sin excepciones.",
  },
  {
    number: "05",
    text: "Cumplimiento estricto de todas las leyes y regulaciones aplicables.",
  },
  {
    number: "06",
    text: "Revisión y actualización periódica de políticas y procedimientos éticos.",
  },
];

const channels = [
  {
    label: "Formulario Anónimo",
    value: "En esta página",
    description: "Canal digital 100% anónimo",
  },
  {
    label: "Línea Ética",
    value: "+54 9 261 369-1623",
    description: "Lunes a viernes, 8 a 18hs",
  },
  {
    label: "Email Confidencial",
    value: "etica@gasesaconcagua.com.ar",
    description: "Recepción las 24hs",
  },
];

export default function EthicsPage() {
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
            <span>Ética y Cumplimiento</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground">
        <div className="container mx-auto flex min-h-[55vh] flex-col justify-end px-4 pb-16 pt-24">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Gobierno Corporativo — Gases Aconcagua S.A.
          </p>
          <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-tighter sm:text-7xl md:text-8xl lg:text-[8rem]">
            Ética y
            <br />
            <span className="text-accent">cumplimiento</span>
            <br />
            normativo
          </h1>
          <p className="mt-12 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            La ética y el cumplimiento normativo son pilares fundamentales de
            nuestra cultura empresarial. Operamos con transparencia, integridad
            y responsabilidad en cada aspecto de nuestro negocio.
          </p>
        </div>
      </section>

      {/* ── Channels Bar ─────────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-px bg-background/20 sm:grid-cols-3">
            {channels.map((channel) => (
              <div key={channel.label} className="bg-foreground p-6 md:p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent md:text-xs">
                  {channel.label}
                </p>
                <p className="mt-2 text-sm font-bold md:text-base">
                  {channel.value}
                </p>
                <p className="mt-1 text-[10px] text-background/40 md:text-xs">
                  {channel.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Principles ───────────────────────────────────────── */}
      <section className="border-b-4 border-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              01 — Principios Éticos
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Nuestros Valores
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px bg-foreground sm:grid-cols-2">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="flex gap-5 bg-background p-8 md:p-10"
              >
                <span className="text-4xl font-black tracking-tighter text-foreground/10 md:text-5xl">
                  {principle.number}
                </span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide">
                    {principle.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground md:text-sm">
                    {principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance Areas ─────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-muted py-20 pattern-dots">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              02 — Programa de Cumplimiento
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Áreas de Cumplimiento
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px bg-foreground lg:grid-cols-3">
            {complianceAreas.map((area) => (
              <div
                key={area.title}
                className="flex flex-col bg-background p-8 md:p-10"
              >
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  {area.title}
                </h3>
                <ul className="mt-6 flex-1 space-y-0">
                  {area.items.map((item, i) => (
                    <li
                      key={item}
                      className="flex gap-3 border-b border-foreground/20 py-3 last:border-b-0"
                    >
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs leading-relaxed text-muted-foreground md:text-sm">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Commitments ──────────────────────────────────────── */}
      <section className="border-b-4 border-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row md:gap-16">
            <div className="shrink-0 md:w-80 lg:w-96">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                03 — Compromisos
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Nuestro
                <br />
                Compromiso
              </h2>
            </div>
            <div className="flex-1 border-t-2 border-foreground md:border-t-0">
              {commitments.map((item) => (
                <div
                  key={item.number}
                  className="flex gap-4 border-b-2 border-foreground py-5 md:py-6"
                >
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground md:text-xs">
                    {item.number}
                  </span>
                  <p className="text-sm leading-relaxed md:text-base">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Anonymous Report Form ────────────────────────────── */}
      <section
        id="canal-de-denuncias"
        className="border-b-4 border-foreground bg-muted py-20 pattern-dots"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row md:gap-16">
            <div className="shrink-0 md:sticky md:top-24 md:w-80 md:self-start lg:w-96">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                04 — Canal de Denuncias
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Reporte
                <br />
                Anónimo
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Ponemos a disposición este canal confidencial para que
                empleados, proveedores y clientes puedan reportar de forma
                anónima cualquier irregularidad o conducta contraria a nuestros
                valores y código de ética.
              </p>

              <div className="mt-8 hidden space-y-4 border-t-2 border-foreground pt-6 md:block">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Garantías
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Confidencialidad absoluta. No se recopilan datos de
                  identificación. Protección contra represalias para denuncias
                  de buena fe.
                </p>
              </div>
            </div>

            <div className="flex-1">
              <div className="border-2 border-foreground bg-background p-6 md:border-4 md:p-10">
                <AnonymousReportForm />
              </div>
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
                ¿Tiene Preguntas?
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl lg:text-6xl">
                Contáctenos
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-background/70 md:text-base">
                Para consultas generales sobre nuestro programa de ética y
                cumplimiento, no dude en comunicarse con nuestro equipo.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row">
              <Link
                href={ROUTES.CONTACT}
                className="inline-flex items-center justify-center border-2 border-background bg-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                Contacto General
              </Link>
              <a
                href="#canal-de-denuncias"
                className="inline-flex items-center justify-center border-2 border-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:bg-background hover:text-accent"
              >
                Canal de Denuncias
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
