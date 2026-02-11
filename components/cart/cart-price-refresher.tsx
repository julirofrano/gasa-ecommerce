"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cart-store";
import { refreshCartPrices } from "@/app/(shop)/cart/actions";

/**
 * Watches for session changes (login/logout) and recalculates cart prices
 * using the current user's pricelist (or public prices when logged out).
 */
export function CartPriceRefresher() {
  const { data: session, status } = useSession();
  const prevPricelistId = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    if (status === "loading") return;

    const currentPricelistId = session?.user?.pricelistId ?? null;

    // Skip the initial mount — only react to actual changes
    if (prevPricelistId.current === undefined) {
      prevPricelistId.current = currentPricelistId;
      return;
    }

    // No change in pricelist
    if (prevPricelistId.current === currentPricelistId) return;

    prevPricelistId.current = currentPricelistId;

    const items = useCartStore.getState().items;
    if (items.length === 0) return;

    const cartItemsInfo = items.map((item) => ({
      cartKey: item.cartKey,
      productId: item.productId,
      productType: item.productType,
      variantId: item.variantId,
    }));

    refreshCartPrices(cartItemsInfo).then(({ prices, taxRates }) => {
      const store = useCartStore.getState();
      if (Object.keys(prices).length > 0) {
        store.updatePrices(prices);
      }
      if (Object.keys(taxRates).length > 0) {
        store.updateTaxRates(taxRates);
      }
    });
  }, [session, status]);

  return null;
}
