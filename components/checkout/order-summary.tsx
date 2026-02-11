"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { formatCurrency } from "@/lib/utils/formatting";
import { ROUTES } from "@/lib/utils/constants";
import {
  classifyCartItems,
  getDeliveryCostLabel,
  getDeliveryCost,
  getDeliveryMethodLabel,
} from "@/lib/data/delivery";

export function OrderSummary() {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getTaxBreakdown = useCartStore((s) => s.getTaxBreakdown);
  const deliverySelection = useUIStore((s) => s.deliverySelection);

  const subtotal = getTotal();
  const itemCount = getItemCount();

  const { ownDelivery, carrierDelivery } = classifyCartItems(items);
  const isMixedCart = ownDelivery.length > 0 && carrierDelivery.length > 0;

  // Calculate delivery cost
  let deliveryCostTotal = 0;
  if (deliverySelection?.deliveryMethod) {
    deliveryCostTotal += getDeliveryCost(deliverySelection.deliveryMethod);
  }
  if (isMixedCart && deliverySelection?.carrierDeliveryMethod) {
    deliveryCostTotal += getDeliveryCost(
      deliverySelection.carrierDeliveryMethod,
    );
  }

  // Dynamic per-line tax breakdown from products
  const taxBreakdown = getTaxBreakdown();
  const productIva = taxBreakdown.reduce((sum, t) => sum + t.amount, 0);
  // Delivery is always taxed at 21% in Argentina
  const deliveryIva = deliveryCostTotal * 0.21;
  const totalIva = productIva + deliveryIva;
  const grandTotal = subtotal + deliveryCostTotal + totalIva;

  return (
    <div className="h-fit border-2 border-foreground md:border-4">
      {/* Dark header */}
      <div className="border-b-2 border-foreground bg-foreground px-6 py-4 text-background">
        <p className="text-[10px] font-bold uppercase tracking-widest text-background/50">
          Resumen
        </p>
        <p className="mt-1 text-sm font-bold uppercase tracking-wide">
          {itemCount} {itemCount === 1 ? "producto" : "productos"}
        </p>
      </div>

      {/* Item list */}
      {items.length > 0 && (
        <div className="divide-y divide-foreground/10 border-b-2 border-foreground px-6">
          {items.map((item) => {
            const taxMultiplier = 1 + (item.taxRate ?? 21) / 100;
            const unitPriceWithTax = item.price * taxMultiplier;
            return (
              <div
                key={item.cartKey}
                className="flex items-start justify-between gap-3 py-4 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{item.name}</p>
                  {item.attributes &&
                    Object.entries(item.attributes).map(([key, value]) => (
                      <p
                        key={key}
                        className="text-[10px] uppercase tracking-widest text-muted-foreground"
                      >
                        {key}: {value}
                      </p>
                    ))}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.quantity} x {formatCurrency(unitPriceWithTax)}
                  </p>
                </div>
                <span className="shrink-0 font-bold">
                  {formatCurrency(unitPriceWithTax * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Totals */}
      <div className="px-6 py-6">
        <dl className="space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Subtotal
            </dt>
            <dd className="text-sm font-bold">{formatCurrency(subtotal)}</dd>
          </div>

          {/* Delivery cost lines */}
          {deliverySelection?.deliveryMethod && !isMixedCart && (
            <div className="flex items-center justify-between">
              <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Envío (
                {getDeliveryMethodLabel(deliverySelection.deliveryMethod)})
              </dt>
              <dd className="text-sm font-bold">
                {getDeliveryCostLabel(deliverySelection.deliveryMethod)}
              </dd>
            </div>
          )}

          {isMixedCart && deliverySelection?.deliveryMethod && (
            <div className="flex items-center justify-between">
              <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Envío 1 — Gases (
                {getDeliveryMethodLabel(deliverySelection.deliveryMethod)})
              </dt>
              <dd className="text-sm font-bold">
                {getDeliveryCostLabel(deliverySelection.deliveryMethod)}
              </dd>
            </div>
          )}

          {isMixedCart && deliverySelection?.carrierDeliveryMethod && (
            <div className="flex items-center justify-between">
              <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Envío 2 — Insumos (
                {getDeliveryMethodLabel(
                  deliverySelection.carrierDeliveryMethod,
                )}
                )
              </dt>
              <dd className="text-sm font-bold">
                {getDeliveryCostLabel(deliverySelection.carrierDeliveryMethod)}
              </dd>
            </div>
          )}

          {!deliverySelection?.deliveryMethod && (
            <div className="flex items-center justify-between">
              <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Envío
              </dt>
              <dd className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Seleccione método
              </dd>
            </div>
          )}

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
          {deliveryCostTotal > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                IVA Envío (21%)
              </dt>
              <dd className="text-sm font-bold">
                {formatCurrency(deliveryIva)}
              </dd>
            </div>
          )}

          <div className="flex items-center justify-between border-t-2 border-foreground pt-3">
            <dt className="text-sm font-black uppercase tracking-wide">
              Total
            </dt>
            <dd className="text-lg font-black">{formatCurrency(grandTotal)}</dd>
          </div>
        </dl>

        <Link
          href={ROUTES.CART}
          className="mt-6 block text-center text-xs font-bold uppercase tracking-wide text-[#0094BB] transition-colors duration-200 hover:text-foreground"
        >
          Volver al Carrito
        </Link>
      </div>
    </div>
  );
}
