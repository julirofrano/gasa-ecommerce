"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface TaxBreakdownEntry {
  rate: number;
  label: string;
  amount: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number, cartKey?: string) => void;
  updateQuantity: (id: number, quantity: number, cartKey?: string) => void;
  clearCart: () => void;
  updatePrices: (priceMap: Record<string, number>) => void;
  updateTaxRates: (taxMap: Record<string, number>) => void;
  getTotal: () => number;
  getItemCount: () => number;
  getTaxBreakdown: () => TaxBreakdownEntry[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.cartKey === item.cartKey);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cartKey === item.cartKey
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (id, cartKey) =>
        set((state) => ({
          items: state.items.filter((i) =>
            cartKey ? i.cartKey !== cartKey : i.id !== id,
          ),
        })),

      updateQuantity: (id, quantity, cartKey) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) =>
                  cartKey ? i.cartKey !== cartKey : i.id !== id,
                )
              : state.items.map((i) =>
                  (cartKey ? i.cartKey === cartKey : i.id === id)
                    ? { ...i, quantity }
                    : i,
                ),
        })),

      clearCart: () => set({ items: [] }),

      updatePrices: (priceMap) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.cartKey in priceMap
              ? { ...item, price: priceMap[item.cartKey] }
              : item,
          ),
        })),

      updateTaxRates: (taxMap) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.cartKey in taxMap
              ? { ...item, taxRate: taxMap[item.cartKey] }
              : item,
          ),
        })),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTaxBreakdown: () => {
        const byRate = new Map<number, number>();
        for (const item of get().items) {
          const rate = item.taxRate ?? 21;
          const lineTotal = item.price * item.quantity;
          const taxAmount = lineTotal * (rate / 100);
          byRate.set(rate, (byRate.get(rate) ?? 0) + taxAmount);
        }
        return Array.from(byRate.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([rate, amount]) => ({
            rate,
            label: `IVA (${rate % 1 === 0 ? rate : rate.toFixed(1)}%)`,
            amount,
          }));
      },
    }),
    { name: "gasa-cart" },
  ),
);
