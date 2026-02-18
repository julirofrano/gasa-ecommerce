import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";
import { CartContent } from "@/components/cart/cart-content";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revise los productos en su carrito de compras.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div>
      {/* ── Breadcrumb ──────────────────────────────────── */}
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
            <span>Carrito</span>
          </nav>
        </div>
      </div>

      {/* ── Header ──────────────────────────────────────── */}
      <div className="border-b-4 border-foreground">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Su Pedido
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
            Carrito de Compras
          </h1>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-10 md:py-14">
        <CartContent />
      </div>
    </div>
  );
}
