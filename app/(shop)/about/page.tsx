import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';

export const metadata: Metadata = {
  title: 'Acerca de Nosotros',
  description:
    'Gases Aconcagua S.A. — Más de 20 años proveyendo gases industriales y medicinales en Mendoza, Argentina.',
  alternates: { canonical: '/about' },
};

const values = [
  {
    number: '01',
    title: 'Calidad Garantizada',
    description:
      'Productos certificados bajo normas ISO 9001 y ANMAT, asegurando la máxima pureza y confiabilidad en cada entrega.',
  },
  {
    number: '02',
    title: 'Atención Personalizada',
    description:
      'Asesoramiento técnico especializado para cada industria, adaptando soluciones a las necesidades de cada cliente.',
  },
  {
    number: '03',
    title: 'Respuesta Rápida',
    description:
      'Logística propia con cobertura regional que garantiza entregas en tiempo y forma en toda la región de Cuyo.',
  },
  {
    number: '04',
    title: 'Innovación Continua',
    description:
      'Incorporación constante de nuevas tecnologías y procesos para ofrecer las mejores soluciones del mercado.',
  },
];

const stats = [
  { value: '100%', label: 'Empresa Argentina' },
  { value: '24hs', label: 'Tiempo de Respuesta' },
  { value: '500+', label: 'Clientes Activos' },
  { value: '9', label: 'Industrias Servidas' },
];

const capabilities = [
  'Fabricación de acetileno disuelto',
  'Fraccionamiento de oxígeno, nitrógeno, argón y CO₂',
  'Distribución de gases especiales y mezclas certificadas',
  'Instalaciones centralizadas de gases industriales y medicinales',
  'Oxigenoterapia domiciliaria con soporte técnico 24hs',
  'Producción y distribución de hielo seco',
];

const coverage = [
  { province: 'Mendoza', role: 'Sede Central' },
  { province: 'Malargüe', role: 'Sucursal' },
];

export default function AboutPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: 'Inicio', href: '/' },
          { name: 'Acerca de Nosotros', href: '/about' },
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
            <span>Acerca de Nosotros</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground">
        <div className="container mx-auto flex min-h-[60vh] flex-col justify-end px-4 pb-16 pt-24">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Gases Aconcagua S.A. — Mendoza, Argentina
          </p>
          <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-tighter sm:text-7xl md:text-8xl lg:text-[9rem]">
            Más de 20
            <br />
            años junto
            <br />
            <span className="text-accent">a la</span>
            <br />
            industria
          </h1>
          <p className="mt-12 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Referentes en la provisión de gases industriales y medicinales para
            las principales industrias de la región de Cuyo.
          </p>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 divide-x-2 divide-background/20 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-14 text-center md:px-8">
                <p className="text-4xl font-black tracking-tighter text-accent md:text-5xl lg:text-6xl">
                  {stat.value}
                </p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-background/50 md:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Story ────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row md:gap-16">
            <div className="shrink-0 md:w-80 lg:w-96">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                01 — Nuestra Historia
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                De planta
                <br />
                de acetileno
                <br />
                a referentes
                <br />
                regionales
              </h2>
            </div>
            <div className="flex-1 space-y-8 border-t-2 border-foreground pt-8 md:border-t-0 md:pt-0">
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                Gases Aconcagua S.A. nació como una planta fabricante de
                acetileno disuelto y, con el tiempo, se consolidó como
                distribuidora autorizada de los principales productores de gases
                industriales y medicinales del país.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                Hoy abastecemos a más de 500 clientes en Mendoza, San Luis y
                todo el país. Nuestra operación incluye la fabricación de
                acetileno, el fraccionamiento de oxígeno, nitrógeno, argón y
                CO₂, y la distribución de gases especiales y mezclas
                certificadas.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                Contamos con flota propia, depósitos estratégicos y un equipo
                técnico capacitado para brindar asesoramiento integral a cada
                uno de nuestros clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-muted py-20 pattern-dots">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              02 — Valores
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Lo Que Nos Define
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px bg-foreground sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="flex gap-5 bg-background p-8 md:p-10"
              >
                <span className="text-4xl font-black tracking-tighter text-foreground/10 md:text-5xl">
                  {value.number}
                </span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground md:text-sm">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ─────────────────────────────────────── */}
      <section className="border-b-4 border-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row md:gap-16">
            <div className="shrink-0 md:w-80 lg:w-96">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                03 — Capacidades
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Qué Hacemos
              </h2>
            </div>
            <div className="flex-1 border-t-2 border-foreground md:border-t-0">
              {capabilities.map((cap, i) => (
                <div
                  key={cap}
                  className="flex gap-4 border-b-2 border-foreground py-5 md:py-6"
                >
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground md:text-xs">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm font-bold uppercase tracking-wide md:text-base">
                    {cap}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Coverage ─────────────────────────────────────────── */}
      {/* <section className="border-b-4 border-foreground bg-muted py-20 pattern-dots">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              04 — Cobertura
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Presencia Regional
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-px bg-foreground lg:grid-cols-4">
            {coverage.map((loc) => (
              <div key={loc.province} className="bg-background p-6 md:p-8">
                <p className="text-2xl font-black uppercase tracking-tighter md:text-3xl">
                  {loc.province}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:text-xs">
                  {loc.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── Vision ───────────────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-foreground py-20 text-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row md:items-start md:gap-16">
            <div className="shrink-0 md:w-80 lg:w-96">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                04 — Visión
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Hacia el
                <br />
                Futuro
              </h2>
            </div>
            <div className="flex-1 border-t-2 border-background/20 pt-8 md:border-t-0 md:pt-0">
              <p className="text-base leading-relaxed text-background/70 md:text-lg">
                Aspiramos a ser la empresa de gases industriales y medicinales
                más confiable del oeste argentino, expandiendo nuestra cobertura
                geográfica, incorporando nuevas tecnologías de producción y
                distribución, y fortaleciendo nuestro compromiso con la calidad,
                la seguridad y el medio ambiente.
              </p>
              <p className="mt-8 text-base leading-relaxed text-background/70 md:text-lg">
                Nuestro objetivo es crecer junto a nuestros clientes, ofreciendo
                un servicio cada vez más integral, eficiente y cercano —
                manteniendo siempre los estándares de excelencia que nos
                caracterizan desde el primer día.
              </p>
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
                Trabaje con Nosotros
              </p>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl lg:text-6xl">
                ¿Necesita gases
                <br />
                para su industria?
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-background/70 md:text-base">
                Acceda a nuestro catálogo completo de gases industriales,
                medicinales y suministros de soldadura. Regístrese en el portal
                de clientes para gestionar pedidos en línea.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row">
              <Link
                href={ROUTES.PRODUCTS}
                className="inline-flex items-center justify-center border-2 border-background bg-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                Ver Catálogo
              </Link>
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex items-center justify-center border-2 border-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:bg-background hover:text-accent"
              >
                Portal de Cliente
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
