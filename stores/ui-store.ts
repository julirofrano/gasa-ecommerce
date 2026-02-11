"use client";

import { create } from "zustand";
import type { DeliveryMethod } from "@/types";

interface DeliverySelection {
  deliveryMethod: DeliveryMethod;
  deliveryBranchId?: number;
  carrierDeliveryMethod?: DeliveryMethod;
  carrierDeliveryBranchId?: number;
}

interface UIStore {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  deliverySelection: DeliverySelection | null;
  toggleMobileMenu: () => void;
  toggleCart: () => void;
  toggleSearch: () => void;
  closeMobileMenu: () => void;
  closeCart: () => void;
  closeSearch: () => void;
  setDeliverySelection: (selection: DeliverySelection | null) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
  deliverySelection: null,

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  closeCart: () => set({ isCartOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
  setDeliverySelection: (selection) => set({ deliverySelection: selection }),
}));
