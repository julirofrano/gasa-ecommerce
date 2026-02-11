import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ROUTES } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Pago Pendiente",
  robots: { index: false, follow: false },
};

export default function CheckoutPendingPage() {
  return (
    <>
      <Header />
      <MobileNav />
      <main>
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16 md:py-24">
          <div className="max-w-lg text-center">
            {/* Icon */}
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center border-4 border-foreground bg-background text-foreground">
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={3}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
              Procesando Pago
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Pago Pendiente
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Su pago está siendo procesado. Le notificaremos por correo
              electrónico cuando se confirme.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={ROUTES.ACCOUNT_ORDERS}
                className="border-2 border-foreground bg-foreground px-8 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]"
              >
                Ver Mis Pedidos
              </Link>
              <Link
                href={ROUTES.HOME}
                className="border-2 border-foreground bg-background px-8 py-4 text-sm font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
