"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { formatCurrency, formatTaxLabel } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils";

interface Variant {
  id: number;
  label: string;
  price: number;
}

interface ProductActionsProps {
  productId: number;
  productName: string;
  productSlug: string;
  basePrice: number;
  imageUrl?: string;
  variants?: Variant[];
  taxRate?: number;
}

export function ProductActions({
  productId,
  productName,
  productSlug,
  basePrice,
  imageUrl,
  variants,
  taxRate,
}: ProductActionsProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useUIStore((s) => s.toggleCart);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants?.[0] ?? null,
  );
  const [quantity, setQuantity] = useState(1);

  const currentPrice = selectedVariant?.price ?? basePrice;

  function handleAddToCart() {
    const itemId = selectedVariant ? selectedVariant.id : productId;
    addItem({
      cartKey: String(itemId),
      id: itemId,
      productId,
      variantId: selectedVariant?.id,
      name: productName,
      slug: productSlug,
      price: currentPrice,
      quantity,
      imageUrl,
      taxRate,
      productType: "supply",
      attributes: selectedVariant
        ? { variante: selectedVariant.label }
        : undefined,
    });
    setQuantity(1);
    toggleCart();
  }

  return (
    <div>
      {/* Price (IVA inclusive) */}
      <p className="text-2xl font-black">
        {formatCurrency(currentPrice * (1 + (taxRate ?? 21) / 100))}
        <span className="ml-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {formatTaxLabel(taxRate ?? 21)}
        </span>
      </p>

      {/* Variant selector */}
      {variants && variants.length > 0 && (
        <div className="mt-6">
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest">
            Tamaño de envase
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={cn(
                  "border-2 px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors duration-200",
                  selectedVariant?.id === v.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground bg-background text-foreground hover:border-[#0094BB] hover:text-[#0094BB]",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity + Add to cart */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center border-2 border-foreground">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 transition-colors duration-200 hover:bg-[#0094BB] hover:text-background"
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="border-x-2 border-foreground px-4 py-2 text-sm font-bold">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-2 transition-colors duration-200 hover:bg-[#0094BB] hover:text-background"
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          className="flex-1 border-2 border-foreground bg-foreground px-6 py-2 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]"
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
}
