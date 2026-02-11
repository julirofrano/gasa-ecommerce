import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <MobileNav />
      <main className="flex flex-1">
        {/* ── Left Branding Panel (desktop only) ─────────── */}
        <div className="hidden border-r-4 border-foreground bg-foreground text-background lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div>
            <Link
              href={ROUTES.HOME}
              className="text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB] transition-colors duration-200 hover:text-background"
            >
              Gases Aconcagua S.A.
            </Link>
          </div>

          <div>
            <h2 className="text-6xl font-black uppercase leading-[0.88] tracking-tighter xl:text-7xl">
              Portal
              <br />
              de <span className="text-[#0094BB]">clientes</span>
            </h2>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-background/50">
              Acceda a su cuenta para gestionar pedidos, consultar precios y
              coordinar entregas de gases industriales e insumos.
            </p>
          </div>

          <div className="flex gap-8">
            {["Gases Industriales", "Insumos", "Envases"].map((label) => (
              <span
                key={label}
                className="text-[10px] font-bold uppercase tracking-widest text-background/30"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right Form Panel ───────────────────────────── */}
        <div className="flex flex-1 items-center justify-center px-4 py-16 lg:w-1/2 lg:px-16">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
