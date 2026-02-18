"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency, formatTaxLabel } from "@/lib/utils/formatting";
import type { CartItem as CartItemType } from "@/types";

/** Map gas product names to their chemical formula for the image placeholder */
const GAS_CODES: Record<string, string> = {
  "oxígeno industrial": "O₂",
  "oxígeno medicinal": "O₂",
  "dióxido de carbono (co₂)": "CO₂",
  argón: "Ar",
  "nitrógeno industrial": "N₂",
  acetileno: "C₂H₂",
  helio: "He",
  "mezcla ar/co₂ 80/20": "Ar/CO₂",
};

function getGasCode(name: string): string | null {
  const key = name.toLowerCase();
  for (const [gasName, code] of Object.entries(GAS_CODES)) {
    if (key.includes(gasName)) return code;
  }
  return null;
}

interface CartItemProps {
  item: CartItemType;
  variant: "compact" | "full";
}

export function CartItem({ item, variant }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const isCompact = variant === "compact";
  const taxMultiplier = 1 + (item.taxRate ?? 21) / 100;
  const unitPriceWithTax = item.price * taxMultiplier;
  const lineTotalWithTax = unitPriceWithTax * item.quantity;
  const gasCode =
    !item.imageUrl && item.productType === "gas" ? getGasCode(item.name) : null;

  return (
    <div
      className={`flex gap-4 py-5 ${isCompact ? "items-center" : "items-start md:gap-6 md:py-6"}`}
    >
      {/* Image */}
      <div
        className={`flex shrink-0 items-center justify-center border-2 border-foreground ${gasCode ? "bg-foreground" : "bg-muted"} ${isCompact ? "h-14 w-14" : "h-20 w-20 md:h-24 md:w-24"}`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={isCompact ? 56 : 96}
            height={isCompact ? 56 : 96}
            className="h-full w-full object-cover"
          />
        ) : gasCode ? (
          <span
            className={`font-black tracking-tight text-accent ${isCompact ? "text-sm" : "text-lg md:text-xl"}`}
          >
            {gasCode}
          </span>
        ) : (
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            IMG
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${item.slug}`}
          className="line-clamp-1 text-sm font-bold uppercase tracking-wide transition-colors duration-200 hover:text-accent"
        >
          {item.name}
        </Link>

        {item.attributes && Object.keys(item.attributes).length > 0 && (
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            {Object.values(item.attributes).join(" · ")}
          </p>
        )}

        <p className="mt-1 text-sm font-bold">
          {formatCurrency(unitPriceWithTax)}
          <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {item.rentalPrice
              ? "(alquiler de envase)"
              : formatTaxLabel(item.taxRate ?? 21)}
          </span>
        </p>

        {/* Quantity controls */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center border-2 border-foreground">
            <button
              onClick={() =>
                updateQuantity(item.id, item.quantity - 1, item.cartKey)
              }
              className="px-2 py-1 transition-colors duration-200 hover:bg-accent hover:text-background"
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="border-x-2 border-foreground px-3 py-1 text-xs font-bold">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                updateQuantity(item.id, item.quantity + 1, item.cartKey)
              }
              className="px-2 py-1 transition-colors duration-200 hover:bg-accent hover:text-background"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={() => removeItem(item.id, item.cartKey)}
            className="p-1 text-muted-foreground transition-colors duration-200 hover:text-foreground"
            aria-label="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Line total (full mode only, IVA inclusive) */}
      {!isCompact && (
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Total
          </p>
          <p className="mt-1 text-base font-black">
            {formatCurrency(lineTotalWithTax)}
          </p>
        </div>
      )}
    </div>
  );
}
