"use client";

import { useState, useTransition } from "react";
import { Minus, Plus, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { formatCurrency, formatTaxLabel } from "@/lib/utils/formatting";
import {
  calculateGasFillPrice,
  calculateContainerTotal,
} from "@/lib/data/products";
import { cn } from "@/lib/utils";
import { getCustomerContainersForProduct } from "@/app/(shop)/products/actions";
import type { CustomerContainerInfo } from "@/app/(shop)/products/actions";
import type { GasProduct, ContainerOwnership, ContainerSize } from "@/types";

type Mode = "preset" | "custom";

interface GasProductActionsProps {
  product: GasProduct;
}

export function GasProductActions({ product }: GasProductActionsProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useUIStore((s) => s.toggleCart);
  const [mode, setMode] = useState<Mode>("preset");
  const [selectedSize, setSelectedSize] = useState<ContainerSize>(
    product.containerSizes[0],
  );
  const [ownership, setOwnership] = useState<ContainerOwnership>("own");
  const [quantity, setQuantity] = useState(1);

  // Custom mode state
  const [customQty, setCustomQty] = useState(0);
  const [customerContainers, setCustomerContainers] = useState<
    CustomerContainerInfo[]
  >([]);
  const [containersLoaded, setContainersLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Preset mode calculations
  const fillPrice = calculateGasFillPrice(product, selectedSize);
  const totalPerContainer = calculateContainerTotal(
    product,
    selectedSize,
    ownership,
  );

  // Custom mode calculations
  const customFillPrice = product.pricePerUnit * customQty;
  const customTotal = customFillPrice;

  // Active values based on mode
  const activeTotalPerContainer =
    mode === "custom" ? customTotal : totalPerContainer;

  // Tax multiplier for IVA-inclusive display
  const taxMultiplier = 1 + product.taxRate / 100;

  function handleSelectPreset(size: ContainerSize) {
    setSelectedSize(size);
    setMode("preset");
  }

  function handleSelectCustom() {
    setMode("custom");
    if (!containersLoaded) {
      startTransition(async () => {
        const containers = await getCustomerContainersForProduct(product.id);
        setCustomerContainers(containers);
        setContainersLoaded(true);
      });
    }
  }

  function handleCustomQtyChange(value: string) {
    const parsed = parseFloat(value);
    setCustomQty(isNaN(parsed) || parsed < 0 ? 0 : parsed);
  }

  function handleAddToCart() {
    if (mode === "custom") {
      if (customQty <= 0) return;
      addItem({
        cartKey: `${product.id}-custom-${customQty}`,
        id: product.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: customFillPrice,
        quantity,
        taxRate: product.taxRate,
        productType: "gas",
        containerOwnership: "own",
        containerCapacity: customQty,
        attributes: {
          Envase: `Personalizado (${customQty} ${product.unitOfMeasure})`,
          Modalidad: "Envase propio",
        },
      });
    } else {
      addItem({
        cartKey: `${selectedSize.id}-${ownership}`,
        id: selectedSize.id,
        productId: product.id,
        variantId: selectedSize.id,
        name: product.name,
        slug: product.slug,
        price: fillPrice,
        quantity,
        taxRate: product.taxRate,
        productType: "gas",
        containerOwnership: ownership,
        containerCapacity: selectedSize.capacity,
        rentalPrice:
          ownership === "rent" ? selectedSize.rentalPricePerFill : undefined,
        attributes: {
          Envase: selectedSize.label,
          Modalidad: ownership === "own" ? "Envase propio" : "Alquiler",
        },
      });
    }
    setQuantity(1);
    toggleCart();
  }

  const isAddDisabled = mode === "custom" && customQty <= 0;

  return (
    <div>
      {/* Unit price (IVA inclusive) */}
      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
        {formatCurrency(product.pricePerUnit * taxMultiplier)} /{" "}
        {product.unitOfMeasure}{" "}
        <span className="text-[10px] tracking-widest">
          {formatTaxLabel(product.taxRate)}
        </span>
      </p>

      {/* Container ownership toggle */}
      <div className="mt-6">
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest">
          Envase
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setOwnership("own")}
            className={cn(
              "flex-1 border-2 px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors duration-200",
              ownership === "own"
                ? "border-foreground bg-foreground text-background"
                : "border-foreground bg-background text-foreground hover:border-[#0094BB] hover:text-[#0094BB]",
            )}
          >
            Tengo envase
          </button>
          <button
            onClick={() => {
              setOwnership("rent");
              setMode("preset");
            }}
            className={cn(
              "flex-1 border-2 px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors duration-200",
              ownership === "rent"
                ? "border-foreground bg-foreground text-background"
                : "border-foreground bg-background text-foreground hover:border-[#0094BB] hover:text-[#0094BB]",
            )}
          >
            Alquilar envase
          </button>
        </div>
      </div>

      {/* Container size selector */}
      <div className="mt-6">
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest">
          Tamaño de envase
        </label>
        <div className="flex flex-wrap gap-2">
          {product.containerSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => handleSelectPreset(size)}
              className={cn(
                "border-2 px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors duration-200",
                mode === "preset" && selectedSize.id === size.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground bg-background text-foreground hover:border-[#0094BB] hover:text-[#0094BB]",
              )}
            >
              {size.label}
            </button>
          ))}
          {ownership === "own" && (
            <button
              onClick={handleSelectCustom}
              className={cn(
                "border-2 px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors duration-200",
                mode === "custom"
                  ? "border-[#0094BB] bg-[#0094BB] text-white"
                  : "border-[#0094BB] bg-background text-[#0094BB] hover:bg-[#0094BB] hover:text-white",
              )}
            >
              Personalizado
            </button>
          )}
        </div>
      </div>

      {/* Custom mode UI */}
      {mode === "custom" && (
        <div className="mt-6 space-y-4">
          {/* Customer containers quick-fill */}
          {isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando envases...
            </div>
          )}
          {containersLoaded && customerContainers.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#0094BB]">
                Mis envases
              </label>
              <div className="flex flex-wrap gap-2">
                {customerContainers.map((container) => (
                  <button
                    key={container.id}
                    onClick={() => setCustomQty(container.container_capacity)}
                    className={cn(
                      "border-2 border-foreground px-3 py-1.5 text-xs font-bold tracking-wide transition-colors duration-200",
                      customQty === container.container_capacity
                        ? "bg-foreground text-background"
                        : "bg-background text-foreground hover:border-[#0094BB] hover:text-[#0094BB]",
                    )}
                  >
                    {container.serial_number} · {container.container_capacity}{" "}
                    {product.unitOfMeasure}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom quantity input */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest">
              Cantidad personalizada
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.5"
                value={customQty || ""}
                onChange={(e) => handleCustomQtyChange(e.target.value)}
                placeholder="0"
                className="w-32 border-b-2 border-foreground bg-transparent px-1 py-2 text-lg font-bold focus:border-[#0094BB] focus:outline-none"
              />
              <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {product.unitOfMeasure}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Price breakdown (IVA inclusive) */}
      <div className="mt-6 border-t-2 border-foreground pt-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Carga de gas (
              {mode === "custom"
                ? `${customQty} ${product.unitOfMeasure}`
                : selectedSize.label}
              )
            </span>
            <span className="font-bold">
              {formatCurrency(
                (mode === "custom" ? customFillPrice : fillPrice) *
                  taxMultiplier,
              )}
            </span>
          </div>
          {mode === "preset" && ownership === "rent" && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Alquiler de envase por día (cobrado mensualmente){" "}
              </span>
              <span className="font-bold">
                {formatCurrency(selectedSize.rentalPricePerFill)}
              </span>
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-between border-t border-muted pt-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest">
              Total por envase
            </span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {formatTaxLabel(product.taxRate)}
            </span>
          </div>
          <span className="text-2xl font-black">
            {formatCurrency(activeTotalPerContainer * taxMultiplier)}
          </span>
        </div>
      </div>

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
          disabled={isAddDisabled}
          className={cn(
            "flex-1 border-2 border-foreground bg-foreground px-6 py-2 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200",
            isAddDisabled
              ? "cursor-not-allowed opacity-50"
              : "hover:border-[#0094BB] hover:bg-[#0094BB]",
          )}
        >
          Agregar al Carrito
        </button>
      </div>

      {/* Quantity > 1 total (IVA inclusive) */}
      {quantity > 1 && (
        <p className="mt-2 text-right text-sm text-muted-foreground">
          {quantity} envases ×{" "}
          {formatCurrency(activeTotalPerContainer * taxMultiplier)} ={" "}
          <span className="font-bold text-foreground">
            {formatCurrency(activeTotalPerContainer * taxMultiplier * quantity)}
          </span>
        </p>
      )}
    </div>
  );
}
