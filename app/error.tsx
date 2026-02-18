"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ROUTES } from "@/lib/utils/constants";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GASA Error]", error);
  }, [error]);

  return (
    <>
      <Header />
      <MobileNav />
      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-background">
        {/* ── Diagonal texture background ────────────────── */}
        <div className="pattern-diagonal pointer-events-none absolute inset-0 text-foreground" />

        <div className="container relative mx-auto px-4">
          <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center py-20 md:py-32">
            {/* Section label */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Error del Sistema
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-accent">
              Algo Salió Mal
            </p>

            {/* Giant "ERROR" */}
            <div className="relative mt-6 md:mt-8">
              <h1 className="text-[clamp(5rem,18vw,14rem)] font-black uppercase leading-[0.85] tracking-tighter text-foreground">
                Error
              </h1>

              {/* Accent stripe */}
              <div className="absolute bottom-[38%] left-0 h-2 w-full bg-accent md:h-3" />
            </div>

            {/* ── Divider ────────────────────────────────── */}
            <div className="mt-8 border-t-2 border-foreground md:mt-12 md:border-t-4" />

            {/* ── Message & Actions ──────────────────────── */}
            <div className="mt-8 flex flex-col gap-12 md:mt-12 md:flex-row md:items-end md:justify-between">
              {/* Left: copy */}
              <div className="max-w-lg">
                <h2 className="text-2xl font-black uppercase tracking-tighter md:text-3xl">
                  Ocurrió un error
                  <br />
                  inesperado.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Nuestro equipo técnico fue notificado automáticamente. Intentá
                  recargar la página o volvé al inicio. Si el problema persiste,
                  contactanos.
                </p>

                {/* Error digest for support */}
                {error.digest && (
                  <p className="mt-4 border-l-2 border-accent pl-3 font-mono text-xs text-muted-foreground">
                    Ref: {error.digest}
                  </p>
                )}
              </div>

              {/* Right: actions */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={reset}
                  className="border-2 border-foreground bg-foreground px-8 py-4 text-center text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent"
                >
                  Reintentar
                </button>
                <Link
                  href={ROUTES.HOME}
                  className="border-2 border-foreground bg-background px-8 py-4 text-center text-sm font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                >
                  Ir al Inicio
                </Link>
              </div>
            </div>

            {/* ── Help row ───────────────────────────────── */}
            <div className="mt-16 grid grid-cols-1 gap-px border-2 border-foreground bg-foreground sm:grid-cols-3 md:mt-20 md:border-4">
              <div className="bg-background p-5 md:p-6">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  01
                </span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-widest">
                  Recargar
                </span>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Intentá recargar la página. A veces un error temporal se
                  resuelve solo.
                </p>
              </div>
              <div className="bg-background p-5 md:p-6">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  02
                </span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-widest">
                  Navegación
                </span>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Si el error persiste, intentá navegar a otra sección desde el
                  menú principal.
                </p>
              </div>
              <div className="bg-background p-5 md:p-6">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  03
                </span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-widest">
                  Soporte
                </span>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Contactanos a{" "}
                  <a
                    href="mailto:consultas@gasesaconcagua.com.ar"
                    className="font-bold text-accent transition-colors duration-200 hover:text-foreground"
                  >
                    consultas@gasesaconcagua.com.ar
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
