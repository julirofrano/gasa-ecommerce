"use client";

import Link from "next/link";
import { X, ShoppingCart } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils/formatting";
import { ROUTES } from "@/lib/utils/constants";
import { CartItem } from "./cart-item";

export function CartDrawer() {
  const { isCartOpen, closeCart } = useUIStore();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getTaxBreakdown = useCartStore((s) => s.getTaxBreakdown);

  if (!isCartOpen) return null;

  const itemCount = getItemCount();
  const subtotal = getTotal();
  const totalIva = getTaxBreakdown().reduce((sum, t) => sum + t.amount, 0);
  const total = subtotal + totalIva;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/50"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col border-l-4 border-foreground bg-background">
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between border-b-2 border-foreground px-6 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0094BB]">
              Su Carrito
            </p>
            <p className="mt-0.5 text-sm font-black uppercase tracking-tight">
              {itemCount} {itemCount === 1 ? "producto" : "productos"}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="p-2 transition-colors duration-200 hover:text-[#0094BB]"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Items ──────────────────────────────────── */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-black uppercase tracking-tight">
              Su carrito está vacío
            </p>
            <Link
              href={ROUTES.PRODUCTS}
              onClick={closeCart}
              className="border-2 border-foreground bg-foreground px-8 py-3 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]"
            >
              Ver Productos
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y-2 divide-foreground overflow-y-auto px-6">
              {items.map((item) => (
                <CartItem key={item.cartKey} item={item} variant="compact" />
              ))}
            </div>

            {/* ── Footer ───────────────────────────────── */}
            <div className="border-t-2 border-foreground px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Total
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                    IVA inc.
                  </p>
                </div>
                <p className="text-lg font-black">{formatCurrency(total)}</p>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={ROUTES.CHECKOUT}
                  onClick={closeCart}
                  className="flex w-full items-center justify-center border-2 border-foreground bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]"
                >
                  Proceder al Pago
                </Link>
                <Link
                  href={ROUTES.CART}
                  onClick={closeCart}
                  className="flex w-full items-center justify-center border-2 border-foreground bg-background px-6 py-3 text-sm font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                >
                  Ver Carrito
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
