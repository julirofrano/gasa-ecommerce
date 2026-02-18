"use client";

import { useState, useEffect, useTransition } from "react";
import { Minus, Plus, Loader2, Check } from "lucide-react";
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
import { CONTAINER_STATUS_LABELS } from "@/lib/utils/constants";
import type { GasProduct, ContainerOwnership, ContainerSize } from "@/types";

interface GasProductActionsProps {
  product: GasProduct;
  isLoggedIn?: boolean;
}

export function GasProductActions({
  product,
  isLoggedIn,
}: GasProductActionsProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useUIStore((s) => s.toggleCart);
  const [selectedSize, setSelectedSize] = useState<ContainerSize>(
    product.containerSizes[0],
  );
  const [ownership, setOwnership] = useState<ContainerOwnership>("own");
  const [quantity, setQuantity] = useState(1);

  // Container selection state (logged-in users only)
  const [selectedContainerIds, setSelectedContainerIds] = useState<Set<number>>(
    new Set(),
  );
  const [customerContainers, setCustomerContainers] = useState<
    CustomerContainerInfo[]
  >([]);
  const [containersLoaded, setContainersLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isContainerMode = selectedContainerIds.size > 0;

  // Load containers when ownership is "own" and user is logged in
  useEffect(() => {
    if (ownership === "own" && isLoggedIn && !containersLoaded) {
      startTransition(async () => {
        const containers = await getCustomerContainersForProduct(product.id);
        setCustomerContainers(containers);
        setContainersLoaded(true);
      });
    }
  }, [ownership, isLoggedIn, containersLoaded, product.id]);

  // Preset mode calculations
  const fillPrice = calculateGasFillPrice(product, selectedSize);
  const totalPerContainer = calculateContainerTotal(
    product,
    selectedSize,
    ownership,
  );

  // Tax multiplier for IVA-inclusive display
  const taxMultiplier = 1 + product.taxRate / 100;

  // Selected containers for price calculations
  const selectedContainers = customerContainers.filter((c) =>
    selectedContainerIds.has(c.id),
  );
  const containersTotalNet = selectedContainers.reduce(
    (sum, c) => sum + product.pricePerUnit * c.container_capacity,
    0,
  );

  function handleSelectPreset(size: ContainerSize) {
    setSelectedSize(size);
    setSelectedContainerIds(new Set());
  }

  function handleToggleContainer(containerId: number) {
    setSelectedContainerIds((prev) => {
      const next = new Set(prev);
      if (next.has(containerId)) {
        next.delete(containerId);
      } else {
        next.add(containerId);
      }
      return next;
    });
  }

  function handleAddToCart() {
    if (isContainerMode) {
      for (const container of selectedContainers) {
        const containerFillPrice =
          product.pricePerUnit * container.container_capacity;
        addItem({
          cartKey: `${product.id}-container-${container.id}`,
          id: product.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: containerFillPrice,
          quantity: 1,
          taxRate: product.taxRate,
          productType: "gas",
          containerOwnership: "own",
          containerCapacity: container.container_capacity,
          containerId: container.id,
          attributes: {
            Envase: `${container.serial_number} (${container.container_capacity} ${product.unitOfMeasure})`,
            Modalidad: "Envase propio",
          },
        });
      }
      setSelectedContainerIds(new Set());
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

  const hasPrice = product.pricePerUnit > 0;
  const isAddDisabled =
    !hasPrice || (isContainerMode ? selectedContainerIds.size === 0 : false);

  return (
    <div>
      {/* Unit price (IVA inclusive) */}
      {hasPrice ? (
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {formatCurrency(product.pricePerUnit * taxMultiplier)} /{" "}
          {product.unitOfMeasure}{" "}
          <span className="text-[10px] tracking-widest">
            {formatTaxLabel(product.taxRate)}
          </span>
        </p>
      ) : (
        <p className="text-sm font-bold uppercase tracking-widest text-accent">
          Consultar precio
        </p>
      )}

      {/* Container ownership toggle, size selector, my containers — only when price available */}
      {hasPrice && (
        <>
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
                    : "border-foreground bg-background text-foreground hover:border-accent hover:text-accent",
                )}
              >
                Tengo envase
              </button>
              <button
                onClick={() => {
                  setOwnership("rent");
                  setSelectedContainerIds(new Set());
                }}
                className={cn(
                  "flex-1 border-2 px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors duration-200",
                  ownership === "rent"
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground bg-background text-foreground hover:border-accent hover:text-accent",
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
                    !isContainerMode && selectedSize.id === size.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground bg-background text-foreground hover:border-accent hover:text-accent",
                  )}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* My containers list (logged-in + "own" mode) */}
      {hasPrice && ownership === "own" && isLoggedIn && (
        <div className="mt-6">
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-accent">
            Mis envases
          </label>
          {isPending && !containersLoaded && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando envases...
            </div>
          )}
          {containersLoaded && customerContainers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No tenés envases registrados para este producto.
            </p>
          )}
          {containersLoaded && customerContainers.length > 0 && (
            <div className="space-y-2">
              {customerContainers.map((container) => {
                const isEmpty = container.status === "empty";
                const isSelected = selectedContainerIds.has(container.id);
                const statusLabel =
                  CONTAINER_STATUS_LABELS[container.status] ?? container.status;

                return (
                  <button
                    key={container.id}
                    type="button"
                    disabled={!isEmpty}
                    onClick={() => handleToggleContainer(container.id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-2 px-3 py-2 text-left transition-colors duration-200",
                      isEmpty && isSelected
                        ? "border-accent bg-accent/5"
                        : isEmpty
                          ? "border-foreground bg-background hover:border-accent"
                          : "cursor-not-allowed border-muted bg-muted/50 opacity-60",
                    )}
                  >
                    {/* Checkbox */}
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors duration-200",
                        isEmpty && isSelected
                          ? "border-accent bg-accent text-white"
                          : isEmpty
                            ? "border-foreground bg-background"
                            : "border-muted bg-muted",
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </span>

                    {/* Container info */}
                    <span className="flex flex-1 items-center gap-2">
                      <span className="font-mono text-sm font-bold">
                        {container.serial_number}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {container.container_capacity} {product.unitOfMeasure}
                      </span>
                    </span>

                    {/* Status badge for non-empty containers */}
                    {!isEmpty && (
                      <span className="bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-background">
                        {statusLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Price breakdown (IVA inclusive) — hidden when no price */}
      {hasPrice && (
        <div className="mt-6 border-t-2 border-foreground pt-4">
          {isContainerMode ? (
            <>
              <div className="space-y-1 text-sm">
                {selectedContainers.map((container) => {
                  const cFillPrice =
                    product.pricePerUnit * container.container_capacity;
                  return (
                    <div key={container.id} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {container.serial_number} (
                        {container.container_capacity} {product.unitOfMeasure})
                      </span>
                      <span className="font-bold">
                        {formatCurrency(cFillPrice * taxMultiplier)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between border-t border-muted pt-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Total ({selectedContainers.length}{" "}
                    {selectedContainers.length === 1 ? "envase" : "envases"})
                  </span>
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {formatTaxLabel(product.taxRate)}
                  </span>
                </div>
                <span className="text-2xl font-black">
                  {formatCurrency(containersTotalNet * taxMultiplier)}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Carga de gas ({selectedSize.label})
                  </span>
                  <span className="font-bold">
                    {formatCurrency(fillPrice * taxMultiplier)}
                  </span>
                </div>
                {ownership === "rent" && (
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
                  {formatCurrency(totalPerContainer * taxMultiplier)}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Quantity + Add to cart — hidden when no price */}
      {hasPrice ? (
        <>
          <div className="mt-6 flex items-center gap-4">
            {!isContainerMode && (
              <div className="flex items-center border-2 border-foreground">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 transition-colors duration-200 hover:bg-accent hover:text-background"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="border-x-2 border-foreground px-4 py-2 text-sm font-bold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 transition-colors duration-200 hover:bg-accent hover:text-background"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={isAddDisabled}
              className={cn(
                "flex-1 border-2 border-foreground bg-foreground px-6 py-2 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200",
                isAddDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:border-accent hover:bg-accent",
              )}
            >
              {isContainerMode
                ? `Agregar ${selectedContainerIds.size} ${selectedContainerIds.size === 1 ? "envase" : "envases"}`
                : "Agregar al Carrito"}
            </button>
          </div>

          {/* Quantity > 1 total (IVA inclusive) — preset mode only */}
          {!isContainerMode && quantity > 1 && (
            <p className="mt-2 text-right text-sm text-muted-foreground">
              {quantity} envases ×{" "}
              {formatCurrency(totalPerContainer * taxMultiplier)} ={" "}
              <span className="font-bold text-foreground">
                {formatCurrency(totalPerContainer * taxMultiplier * quantity)}
              </span>
            </p>
          )}
        </>
      ) : (
        <div className="mt-6">
          <a
            href={`https://wa.me/5492613691623?text=${encodeURIComponent(`Hola, quiero consultar el precio de ${product.name}. Gracias.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 border-2 border-foreground bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent"
          >
            Consultar Precio por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
