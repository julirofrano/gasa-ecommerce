"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils/formatting";
import { ROUTES } from "@/lib/utils/constants";
import { CartItem } from "./cart-item";

export function CartContent() {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const clearCart = useCartStore((s) => s.clearCart);

  const getTaxBreakdown = useCartStore((s) => s.getTaxBreakdown);

  const subtotal = getTotal();
  const itemCount = getItemCount();
  const taxBreakdown = getTaxBreakdown();
  const totalIva = taxBreakdown.reduce((sum, t) => sum + t.amount, 0);
  const grandTotal = subtotal + totalIva;

  if (items.length === 0) {
    return (
      <div className="border-2 border-foreground p-12 text-center md:border-4 md:p-16">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-6 text-lg font-black uppercase tracking-tight">
          Su carrito está vacío
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Agregue productos para comenzar su pedido.
        </p>
        <Link
          href={ROUTES.PRODUCTS}
          className="mt-8 inline-flex items-center justify-center border-2 border-foreground bg-foreground px-8 py-3 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent"
        >
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
      {/* ── Items List ────────────────────────────────── */}
      <div className="lg:col-span-2">
        {/* Column header */}
        <div className="hidden border-b-2 border-foreground pb-3 sm:flex">
          <p className="flex-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Producto
          </p>
          <p className="w-24 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Total
          </p>
        </div>

        {/* Items */}
        <div className="divide-y-2 divide-foreground border-b-2 border-foreground">
          {items.map((item) => (
            <CartItem key={item.cartKey} item={item} variant="full" />
          ))}
        </div>

        {/* Actions row */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={clearCart}
            className="text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Vaciar Carrito
          </button>
          <Link
            href={ROUTES.PRODUCTS}
            className="text-xs font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:text-foreground"
          >
            Seguir Comprando
          </Link>
        </div>
      </div>

      {/* ── Summary ──────────────────────────────────── */}
      <div className="h-fit border-2 border-foreground md:border-4">
        <div className="border-b-2 border-foreground bg-foreground px-6 py-4 text-background">
          <p className="text-[10px] font-bold uppercase tracking-widest text-background/50">
            Resumen
          </p>
          <p className="mt-1 text-sm font-bold uppercase tracking-wide">
            {itemCount} {itemCount === 1 ? "producto" : "productos"}
          </p>
        </div>

        <div className="px-6 py-6">
          <dl className="space-y-3">
            <div className="flex items-center justify-between">
              <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Subtotal
              </dt>
              <dd className="text-sm font-bold">{formatCurrency(subtotal)}</dd>
            </div>
            {taxBreakdown.map((tax) => (
              <div key={tax.rate} className="flex items-center justify-between">
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {tax.label}
                </dt>
                <dd className="text-sm font-bold">
                  {formatCurrency(tax.amount)}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between border-t-2 border-foreground pt-3">
              <dt className="text-sm font-black uppercase tracking-wide">
                Total
              </dt>
              <dd className="text-lg font-black">
                {formatCurrency(grandTotal)}
              </dd>
            </div>
          </dl>

          <Link
            href={ROUTES.CHECKOUT}
            className="mt-6 flex w-full items-center justify-center border-2 border-foreground bg-foreground px-6 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent"
          >
            Proceder al Pago
          </Link>

          <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
            Envío calculado en el checkout
          </p>
        </div>
      </div>
    </div>
  );
}
