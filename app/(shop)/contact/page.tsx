import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from './contact-form';
import { LocalBusinessJsonLd } from '@/components/seo/local-business-json-ld';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Contactanos para consultas sobre gases industriales, medicinales y servicios. Mendoza, Argentina.',
  alternates: { canonical: '/contact' },
};

const contactChannels = [
  {
    number: '01',
    label: 'Email',
    value: 'consultas@gasesaconcagua.com.ar',
    description: 'Consultas generales y cotizaciones',
    href: 'mailto:consultas@gasesaconcagua.com.ar',
  },
  {
    number: '02',
    label: 'Teléfono',
    value: '+54 9 261 369-1623',
    description: 'Lunes a Viernes, 8:00 a 17:00',
    href: 'tel:+5492613691623',
  },
  {
    number: '03',
    label: 'WhatsApp',
    value: '+54 9 261 369-1623',
    description: 'Respuesta inmediata en horario comercial',
    href: 'https://wa.me/5492613691623',
  },
  {
    number: '04',
    label: 'Dirección',
    value: 'Parque Industrial Municipal, Luján de Cuyo, Mendoza, Argentina',
    description: 'Visitas con cita previa',
    href: '#mapa',
  },
];

const hours = [
  { day: 'Lunes', time: '8:00 — 17:00' },
  { day: 'Martes', time: '8:00 — 17:00' },
  { day: 'Miércoles', time: '8:00 — 17:00' },
  { day: 'Jueves', time: '8:00 — 17:00' },
  { day: 'Viernes', time: '8:00 — 17:00' },
  { day: 'Sábado', time: 'Cerrado' },
  { day: 'Domingo', time: 'Cerrado' },
];

export default function ContactPage() {
  return (
    <div>
      <LocalBusinessJsonLd />
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative border-b-4 border-foreground">
        <div className="container mx-auto flex min-h-[60vh] flex-col justify-end px-4 pb-16 pt-24 md:min-h-[50vh]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                Gases Aconcagua S.A. — Hablemos
              </p>
              <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.88] tracking-tighter sm:text-7xl md:text-8xl lg:text-[9rem]">
                Contacto
              </h1>
            </div>
            <p className="max-w-md pb-2 text-base leading-relaxed text-muted-foreground lg:text-right lg:text-lg">
              Estamos para ayudarte. Escribinos por cualquier consulta sobre
              gases industriales, medicinales, insumos o servicios.
            </p>
          </div>
        </div>
        {/* Decorative formula */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-20 select-none text-[12rem] font-black leading-none tracking-tighter text-foreground/3 sm:text-[16rem] md:right-12 md:top-16 md:text-[22rem]"
        >
          O₂
        </span>
      </section>

      {/* ── Contact Channels ─────────────────────────────────── */}
      <section className="border-b-4 border-foreground">
        {contactChannels.map((channel) => {
          const inner = (
            <>
              <span className="text-2xl font-black tracking-tighter text-foreground/10 transition-colors duration-300 group-hover:text-background/20 md:text-3xl">
                {channel.number}
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-accent transition-colors duration-300 group-hover:text-background">
                  {channel.label}
                </p>
                <p className="mt-1 text-sm font-bold md:text-base">
                  {channel.value}
                </p>
              </div>
              <p className="hidden text-xs text-muted-foreground transition-colors duration-300 group-hover:text-background/60 md:block">
                {channel.description}
              </p>
              {channel.href && (
                <span className="text-xs font-bold uppercase tracking-widest text-accent transition-colors duration-300 group-hover:text-background">
                  →
                </span>
              )}
            </>
          );

          if (channel.href) {
            return (
              <a
                key={channel.number}
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel={
                  channel.href.startsWith('http')
                    ? 'noopener noreferrer'
                    : undefined
                }
                className="group flex items-center gap-5 border-b border-foreground/10 px-4 py-6 transition-colors duration-300 last:border-b-0 hover:bg-accent hover:text-background md:px-8 md:py-8"
              >
                <div className="container mx-auto flex items-center gap-5">
                  {inner}
                </div>
              </a>
            );
          }

          return (
            <div
              key={channel.number}
              className="group flex items-center gap-5 border-b border-foreground/10 px-4 py-6 last:border-b-0 md:px-8 md:py-8"
            >
              <div className="container mx-auto flex items-center gap-5">
                {inner}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── WhatsApp CTA ─────────────────────────────────────── */}
      <section className="border-b-4 border-foreground bg-accent text-background">
        <div className="container mx-auto flex flex-col items-start gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:py-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-background/50">
              Canal Directo
            </p>
            <p className="mt-2 text-2xl font-black uppercase tracking-tighter md:text-3xl">
              Respuesta inmediata por WhatsApp
            </p>
          </div>
          <a
            href="https://wa.me/5492613691623"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center border-2 border-background bg-background px-10 py-4 text-sm font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:bg-foreground hover:text-background"
          >
            Escribinos por WhatsApp
          </a>
        </div>
      </section>

      {/* ── Form + Hours ─────────────────────────────────────── */}
      <section className="border-b-4 border-foreground py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              05 — Formulario
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Envianos un Mensaje
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-8">
              {/* Hours */}
              <div className="border-2 border-foreground bg-muted p-6 md:border-4 md:p-8">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">
                  Horarios de Atención
                </p>
                <div className="divide-y divide-foreground/10">
                  {hours.map((h) => (
                    <div
                      key={h.day}
                      className="flex items-center justify-between py-2.5"
                    >
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {h.day}
                      </span>
                      <span
                        className={`text-xs ${h.time === 'Cerrado' ? 'text-muted-foreground' : 'tabular-nums'}`}
                      >
                        {h.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick contact */}
              <div className="border-2 border-foreground bg-foreground p-6 text-background md:border-4 md:p-8">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">
                  Contacto Rápido
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+5492613691623"
                    className="block text-sm transition-colors duration-200 hover:text-accent"
                  >
                    <span className="text-background/50">Tel</span>{' '}
                    <span className="font-bold">+54 9 261 369-1623</span>
                  </a>
                  <a
                    href="mailto:consultas@gasesaconcagua.com.ar"
                    className="block text-sm transition-colors duration-200 hover:text-accent"
                  >
                    <span className="text-background/50">Email</span>{' '}
                    <span className="font-bold">
                      consultas@gasesaconcagua.com.ar
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map ──────────────────────────────────────────────── */}
      <section id="mapa" className="relative scroll-mt-20">
        <div className="border-b-4 border-foreground">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3343.1558319780747!2d-68.97497102281254!3d-33.078684678572245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967ddef5db10d5a3%3A0x1dc3ad89f2f72e28!2sGases%20Aconcagua%20S.A!5e0!3m2!1ses-419!2sar!4v1732904170835!5m2!1ses-419!2sar"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de Gases Aconcagua S.A. en Mendoza, Argentina"
            className="block"
          />
        </div>
        {/* Overlay card */}
        <div className="absolute bottom-6 left-4 z-10 border-2 border-foreground bg-background p-5 md:bottom-8 md:left-8 md:border-4 md:p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            Ubicación
          </p>
          <p className="mt-2 text-sm font-bold uppercase tracking-wide">
            Mendoza, Argentina
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Visitas con cita previa
          </p>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      {process.env.NEXT_PUBLIC_ODOO_ENABLED !== 'false' && (
        <section className="border-b-4 border-foreground bg-muted pattern-grid py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              Portal de Clientes
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tighter md:text-4xl">
              ¿Ya sos cliente?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
              Accedé a tu portal para gestionar pedidos, recargas de envases y
              consultar tu cuenta corriente.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center justify-center border-2 border-foreground bg-foreground px-10 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent"
            >
              Acceder al Portal
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
