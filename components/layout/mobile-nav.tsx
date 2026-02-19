"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronDown, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { AUTH_ENABLED, ODOO_ENABLED, ROUTES } from "@/lib/utils/constants";

interface MobileNavItem {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

const mainItems: MobileNavItem[] = [
  { href: ROUTES.HOME, label: "Inicio" },
  { href: ROUTES.PRODUCTS, label: "Productos" },
  {
    href: ROUTES.SERVICES,
    label: "Servicios",
    children: [
      { href: ROUTES.SERVICES_GAS_SYSTEMS, label: "Instalaciones de Gases" },
      { href: ROUTES.SERVICES_HOME_CARE, label: "Oxígeno en Casa" },
      { href: ROUTES.SERVICES_ICE_PELLETS, label: "Hielo en Pellets" },
    ],
  },
  {
    href: ROUTES.ABOUT,
    label: "Empresa",
    children: [
      { href: ROUTES.ABOUT, label: "Acerca de Nosotros" },
      { href: ROUTES.INDUSTRIES, label: "Industrias" },
      { href: ROUTES.ETHICS, label: "Ética y Cumplimiento" },
    ],
  },
  { href: ROUTES.CONTACT, label: "Contacto" },
];

const accountItems = [
  { href: ROUTES.ACCOUNT_PROFILE, label: "Mi Cuenta", requiresAuth: true },
  { href: ROUTES.ACCOUNT_ORDERS, label: "Mis Pedidos", requiresAuth: true },
  { href: ROUTES.ACCOUNT_CONTAINERS, label: "Mis Envases", requiresAuth: true },
  { href: ROUTES.CART, label: "Carrito", requiresAuth: false },
];

function MobileNavGroup({
  item,
  onNavigate,
}: {
  item: MobileNavItem;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="block border-b border-background/10 py-4 text-2xl font-black uppercase tracking-tight transition-colors duration-200 hover:text-accent"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-background/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-2xl font-black uppercase tracking-tight transition-colors duration-200 hover:text-accent"
      >
        {item.label}
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mb-4 ml-4 border-l-2 border-accent pl-4">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className="block py-2 text-sm font-bold uppercase tracking-wide text-background/70 transition-colors duration-200 hover:text-accent"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function MobileNav() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const clearCart = useCartStore((s) => s.clearCart);
  const { data: session } = useSession();

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-foreground text-background md:hidden">
      {/* ── Top Bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-background/10 px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
          Menú
        </p>
        <button
          onClick={closeMobileMenu}
          className="p-2 transition-colors duration-200 hover:text-accent"
          aria-label="Cerrar menú"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="px-4 py-8">
        <div>
          {mainItems.map((item) => (
            <MobileNavGroup
              key={item.label}
              item={item}
              onNavigate={closeMobileMenu}
            />
          ))}
        </div>

        {/* ── Account Section ────────────────────────────── */}
        {ODOO_ENABLED && (
          <div className="mt-8 border-t border-background/10 pt-8">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-background/30">
              Mi Cuenta
            </p>
            {session?.user && (
              <div className="mb-4 border-b border-background/10 pb-4">
                <p className="text-sm font-bold text-background">
                  {session.user.name}
                </p>
                {session.user.companyName && (
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-background/30">
                    {session.user.companyName}
                  </p>
                )}
              </div>
            )}
            {accountItems
              .filter((item) => !item.requiresAuth || AUTH_ENABLED)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="block border-b border-background/10 py-3 text-sm font-bold uppercase tracking-wide text-background/70 transition-colors duration-200 hover:text-accent"
                >
                  {item.label}
                </Link>
              ))}
            {session?.user && (
              <button
                onClick={() => {
                  closeMobileMenu();
                  clearCart();
                  signOut({ callbackUrl: "/login" });
                }}
                className="mt-4 flex items-center gap-2 py-3 text-sm font-bold uppercase tracking-wide text-red-400 transition-colors duration-200 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesion
              </button>
            )}
          </div>
        )}
      </nav>

      {/* ── Bottom Contact ───────────────────────────────── */}
      <div className="border-t border-background/10 px-4 py-6">
        <div className="flex flex-col gap-2">
          <a
            href="tel:+5492613691623"
            className="text-sm text-background/50 transition-colors duration-200 hover:text-accent"
          >
            +54 9 261 369-1623
          </a>
          <a
            href="mailto:consultas@gasesaconcagua.com.ar"
            className="text-sm text-background/50 transition-colors duration-200 hover:text-accent"
          >
            consultas@gasesaconcagua.com.ar
          </a>
        </div>
      </div>
    </div>
  );
}
