import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ROUTES } from "@/lib/utils/constants";
import { ClearCart } from "./clear-cart";
import { PaymentVerifier } from "./payment-verifier";

export const metadata: Metadata = {
  title: "Pago Exitoso",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const paymentId =
    typeof params.payment_id === "string" ? params.payment_id : undefined;
  const externalReference =
    typeof params.external_reference === "string"
      ? params.external_reference
      : undefined;

  return (
    <>
      <Header />
      <MobileNav />
      <main>
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16 md:py-24">
          <ClearCart />
          <div className="max-w-lg text-center">
            {/* Icon */}
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center border-4 border-foreground bg-foreground text-background">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
              Pedido Confirmado
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Pago Exitoso
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Su pedido ha sido procesado correctamente. Recibirá una
              confirmación por correo electrónico con los detalles de su compra.
            </p>

            {paymentId && externalReference && (
              <PaymentVerifier
                paymentId={paymentId}
                externalReference={externalReference}
              />
            )}

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
