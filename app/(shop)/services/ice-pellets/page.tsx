import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';

export const metadata: Metadata = {
  title: 'Hielo en Pellets',
  description:
    'Producción y distribución de hielo seco en pellets para aplicaciones industriales, alimentarias, médicas y enológicas.',
  alternates: { canonical: '/services/ice-pellets' },
};

const stats = [
  { value: '−78.5°C', label: 'Temperatura' },
  { value: 'CO₂', label: 'Composición' },
  { value: '4', label: 'Provincias' },
];

const serviceChain = [
  {
    number: '01',
    title: 'Producción',
    description:
      'Planta propia de fabricación de hielo seco en pellets con capacidad para abastecer toda la región de Cuyo.',
  },
  {
    number: '02',
    title: 'Almacenamiento',
    description:
      'Contenedores isotérmicos de alta performance que minimizan la sublimación durante el almacenaje.',
  },
  {
    number: '03',
    title: 'Logística',
    description:
      'Flota refrigerada con entrega programada y urgente en Mendoza.',
  },
  {
    number: '04',
    title: 'Asesoramiento',
    description:
      'Soporte técnico para el uso eficiente del hielo seco en cada aplicación específica.',
  },
];

const applications = [
  {
    number: '01',
    title: 'Vitivinicultura',
    description:
      'Control de temperatura en vendimia, fermentación en frío y conservación de uvas en bodega.',
  },
  {
    number: '02',
    title: 'Sector Médico',
    description:
      'Transporte de muestras biológicas, vacunas, hemoderivados y medicamentos termosensibles.',
  },
  {
    number: '03',
    title: 'Alimentación',
    description:
      'Conservación y transporte de alimentos perecederos, congelación rápida IQF.',
  },
  {
    number: '04',
    title: 'Laboratorios',
    description:
      'Mantenimiento de cadena de frío para reactivos, muestras y aplicaciones criogénicas.',
  },
  {
    number: '05',
    title: 'Pesca',
    description:
      'Conservación de productos pesqueros durante captura, transporte y distribución.',
  },
  {
    number: '06',
    title: 'Limpieza Criogénica',
    description:
      'Limpieza industrial no abrasiva mediante proyección de pellets de CO₂ sólido.',
  },
];

const specs = [
  { label: 'Forma', value: 'Pellets cilíndricos de 3mm y 16mm de diámetro' },
  {
    label: 'Temperatura',
    value: '−78.5°C (sublimación directa, sin residuo líquido)',
  },
  {
    label: 'Pureza',
    value: 'CO₂ grado alimentario, apto para contacto con alimentos',
  },
  {
    label: 'Presentación',
    value: 'Contenedores isotérmicos de 10, 25 y 50 kg',
  },
];

export default function IcePelletsServicePage() {
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
            <span>Hielo en Pellets</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground">
        <div className="container mx-auto flex min-h-[55vh] flex-col justify-end px-4 pb-16 pt-24">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Hielo Seco — CO₂ Sólido
          </p>
          <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-tighter sm:text-7xl md:text-8xl lg:text-[8rem]">
            Hielo en
            <br />
            <span className="text-accent">pellets</span>
          </h1>
          <p className="mt-12 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Producción, almacenamiento y distribución de hielo seco en pellets
            (CO₂ sólido) para aplicaciones industriales, alimentarias, médicas y
            enológicas.
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

      {/* ── Service Chain ────────────────────────────────────── */}
      <section className="border-b-4 border-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              01 — Cadena de Servicio
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              De la Planta a su Puerta
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px bg-foreground sm:grid-cols-2">
            {serviceChain.map((item) => (
              <div
                key={item.title}
                className="flex gap-5 bg-background p-8 md:p-10"
              >
                <span className="text-4xl font-black tracking-tighter text-foreground/10 md:text-5xl">
                  {item.number}
                </span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground md:text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Applications ─────────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-muted py-20 pattern-dots">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row md:gap-16">
            <div className="shrink-0 md:w-80 lg:w-96">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                02 — Aplicaciones
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                ¿Dónde se
                <br />
                Utiliza?
              </h2>
            </div>
            <div className="flex-1 border-t-2 border-foreground md:border-t-0">
              {applications.map((app) => (
                <div
                  key={app.number}
                  className="flex gap-4 border-b-2 border-foreground py-5 md:py-6"
                >
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground md:text-xs">
                    {app.number}
                  </span>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide md:text-base">
                      {app.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
                      {app.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Technical Specs ──────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-foreground py-20 text-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row md:gap-16">
            <div className="shrink-0 md:w-80 lg:w-96">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                03 — Especificaciones
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Ficha
                <br />
                Técnica
              </h2>
            </div>
            <div className="flex-1 border-t-2 border-background/20 pt-8 md:border-t-0 md:pt-0">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="border-b-2 border-background/20 py-5 md:py-6"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent md:text-xs">
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
      <section className="bg-accent py-20 text-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-background/50">
                Hielo Seco — CO₂ Sólido
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl lg:text-6xl">
                ¿Necesita hielo
                <br />
                en pellets?
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-background/70 md:text-base">
                Contáctenos para consultar disponibilidad, presentaciones y
                coordinar entregas en toda la región de Cuyo.
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
