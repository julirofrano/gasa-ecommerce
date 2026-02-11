"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";

export function ClearCart() {
  useEffect(() => {
    useCartStore.getState().clearCart();
  }, []);

  return null;
}
