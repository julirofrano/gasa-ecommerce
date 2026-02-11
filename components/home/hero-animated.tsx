'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';

const heroLines = [
  { text: 'Gases', accent: false },
  { text: 'y materiales para', accent: false },
  { text: 'la industria', accent: false },
  { text: 'que mueve', accent: true },
  { text: 'el país', accent: false },
];

export function HeroAnimated() {
  return (
    <section className="relative border-b-4 border-foreground">
      <div className="container mx-auto flex min-h-[90vh] flex-col justify-end px-4 pb-16 pt-24">
        <p className="animate-hero-line mb-6 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
          Gases Aconcagua S.A. — Mendoza, Argentina
        </p>
        <h1 className="max-w-6xl text-4xl font-black uppercase leading-[0.88] tracking-tighter sm:text-7xl md:text-8xl lg:text-[8rem]">
          {heroLines.map((line, i) => (
            <span
              key={i}
              className={`animate-hero-line block ${line.accent ? 'text-[#0094BB]' : ''}`}
              style={{ animationDelay: `${0.2 + i * 0.15}s` }}
            >
              {line.text}
            </span>
          ))}
        </h1>
        <div
          className="animate-hero-line mt-12 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between"
          style={{ animationDelay: '1.0s' }}
        >
          <div className="max-w-md">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Proveedor líder de gases industriales, medicinales y especiales
              para bodegas e industria en Mendoza.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href={ROUTES.PRODUCTS}
                className="inline-flex items-center justify-center border-2 border-foreground bg-foreground px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]"
              >
                Ver Catálogo
              </Link>
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex items-center justify-center border-2 border-foreground bg-background px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                Portal de Cliente
              </Link>
            </div>
          </div>
          <p className="hidden text-right text-xs font-bold uppercase tracking-widest text-muted-foreground md:block">
            Scroll ↓
          </p>
        </div>
      </div>
    </section>
  );
}
