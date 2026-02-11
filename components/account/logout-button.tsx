"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useCartStore } from "@/stores/cart-store";

export function LogoutButton() {
  const clearCart = useCartStore((s) => s.clearCart);

  return (
    <button
      onClick={() => {
        clearCart();
        signOut({ callbackUrl: "/login" });
      }}
      className="flex w-full items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors duration-200 hover:text-red-600"
    >
      <LogOut className="h-4 w-4" />
      Cerrar Sesión
    </button>
  );
}
