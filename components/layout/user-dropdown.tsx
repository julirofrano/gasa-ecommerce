"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  User,
  ChevronDown,
  Package,
  Cylinder,
  FileText,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useCartStore } from "@/stores/cart-store";
import { ROUTES } from "@/lib/utils/constants";

interface UserDropdownProps {
  userName: string;
  companyName?: string | null;
}

const accountLinks = [
  { href: ROUTES.ACCOUNT_PROFILE, label: "Mi Cuenta", icon: User },
  { href: ROUTES.ACCOUNT_ORDERS, label: "Mis Pedidos", icon: Package },
  { href: ROUTES.ACCOUNT_CONTAINERS, label: "Mis Envases", icon: Cylinder },
  { href: ROUTES.ACCOUNT_INVOICES, label: "Facturas", icon: FileText },
];

export function UserDropdown({ userName, companyName }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const clearCart = useCartStore((s) => s.clearCart);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const firstName = userName.split(" ")[0] || "Mi Cuenta";

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-2 text-xs font-bold uppercase tracking-widest transition-colors duration-200 hover:text-[#0094BB]"
        aria-label="Mi cuenta"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <User className="h-5 w-5" />
        <span className="max-w-24 truncate">{firstName}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full pt-3">
          <div className="min-w-56 border-2 border-foreground bg-background md:border-4">
            {/* User info header */}
            <div className="border-b-2 border-foreground px-5 py-4">
              <p className="text-sm font-bold">{userName}</p>
              {companyName && (
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {companyName}
                </p>
              )}
            </div>

            {/* Account links */}
            <div>
              {accountLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 border-b border-foreground/10 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors duration-200 hover:bg-[#0094BB] hover:text-background"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                clearCart();
                signOut({ callbackUrl: "/login" });
              }}
              className="flex w-full items-center gap-3 px-5 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors duration-200 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
