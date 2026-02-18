import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ROUTES } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "404 — Página no encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <MobileNav />
      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-background">
        {/* ── Grid texture background ────────────────────── */}
        <div className="pattern-grid pointer-events-none absolute inset-0 text-foreground" />

        <div className="container relative mx-auto px-4">
          {/* ── Hero: massive 404 ────────────────────────── */}
          <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center py-20 md:py-32">
            {/* Section label */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Error
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-accent">
              Página No Encontrada
            </p>

            {/* Giant 404 */}
            <div className="relative mt-6 md:mt-8">
              <h1 className="text-[clamp(8rem,25vw,20rem)] font-black leading-[0.85] tracking-tighter text-foreground">
                404
              </h1>

              {/* Accent stripe cutting through the number */}
              <div className="absolute bottom-[38%] left-0 h-2 w-full bg-accent md:h-3" />
            </div>

            {/* ── Divider ────────────────────────────────── */}
            <div className="mt-8 border-t-2 border-foreground md:mt-12 md:border-t-4" />

            {/* ── Message & Actions ──────────────────────── */}
            <div className="mt-8 flex flex-col gap-12 md:mt-12 md:flex-row md:items-end md:justify-between">
              {/* Left: copy */}
              <div className="max-w-lg">
                <h2 className="text-2xl font-black uppercase tracking-tighter md:text-3xl">
                  La página que buscás
                  <br />
                  no existe.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Es posible que la dirección esté mal escrita, que la página
                  haya sido movida, o que simplemente no exista. Verificá la URL
                  o navegá a una de las secciones principales.
                </p>
              </div>

              {/* Right: navigation links */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={ROUTES.HOME}
                  className="border-2 border-foreground bg-foreground px-8 py-4 text-center text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent"
                >
                  Ir al Inicio
                </Link>
                <Link
                  href={ROUTES.PRODUCTS}
                  className="border-2 border-foreground bg-background px-8 py-4 text-center text-sm font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                >
                  Ver Productos
                </Link>
              </div>
            </div>

            {/* ── Quick links row ────────────────────────── */}
            <div className="mt-16 grid grid-cols-2 gap-px border-2 border-foreground bg-foreground md:mt-20 md:grid-cols-4 md:border-4">
              {[
                {
                  number: "01",
                  label: "Productos",
                  href: ROUTES.PRODUCTS,
                },
                {
                  number: "02",
                  label: "Servicios",
                  href: ROUTES.SERVICES,
                },
                {
                  number: "03",
                  label: "Contacto",
                  href: ROUTES.CONTACT,
                },
                {
                  number: "04",
                  label: "Mi Cuenta",
                  href: ROUTES.ACCOUNT_PROFILE,
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-background p-5 transition-colors duration-200 hover:bg-accent hover:text-background md:p-6"
                >
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors duration-200 group-hover:text-background/50">
                    {item.number}
                  </span>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-widest transition-colors duration-200">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
