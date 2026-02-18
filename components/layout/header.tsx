"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Menu, Search, User, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { AUTH_ENABLED, ODOO_ENABLED, ROUTES } from "@/lib/utils/constants";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartPriceRefresher } from "@/components/cart/cart-price-refresher";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { SearchOverlay } from "@/components/layout/search-overlay";

interface NavItem {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

const navItems: NavItem[] = [
  { href: ROUTES.HOME, label: "Inicio" },
  { href: ROUTES.PRODUCTS, label: "Productos" },
  {
    href: "",
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

export function Header() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const { toggleMobileMenu, toggleCart, toggleSearch } = useUIStore();
  const { data: session } = useSession();

  return (
    <>
      {/* ── Top Info Bar (desktop only) ──────────────────── */}
      <div className="hidden border-b border-foreground/10 bg-foreground text-background md:block">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center divide-x divide-background/20">
            <a
              href="tel:+5492613691623"
              className="pr-4 text-[10px] font-bold uppercase tracking-widest text-background/50 transition-colors duration-200 hover:text-accent"
            >
              +54 9 261 369-1623
            </a>
            <a
              href="mailto:consultas@gasesaconcagua.com.ar"
              className="px-4 text-[10px] font-bold uppercase tracking-widest text-background/50 transition-colors duration-200 hover:text-accent"
            >
              consultas@gasesaconcagua.com.ar
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-background/30">
              Lun — Vie 8:00 a 17:00
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ── Main Navigation ──────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-foreground bg-background md:border-b-4">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobileMenu}
              className="p-2 transition-colors duration-200 hover:text-accent md:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href={ROUTES.HOME}>
              <Image
                src="/logo.png"
                alt="GASA"
                width={120}
                height={60}
                priority
              />
            </Link>
          </div>

          {/* Center: desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors duration-200 hover:text-accent"
                  >
                    {item.label}
                    <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="min-w-56 border-2 border-foreground bg-background md:border-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block border-b border-foreground/10 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors duration-200 last:border-b-0 hover:bg-accent hover:text-background"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs font-bold uppercase tracking-widest transition-colors duration-200 hover:text-accent"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {/* Right: action icons */}
          <div className="flex items-center gap-1">
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            <button
              onClick={toggleSearch}
              className="p-2 transition-colors duration-200 hover:text-accent"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>
            {session?.user ? (
              <UserDropdown
                userName={session.user.name || "Mi Cuenta"}
                companyName={session.user.companyName}
              />
            ) : AUTH_ENABLED ? (
              <Link
                href={ROUTES.LOGIN}
                className="hidden items-center gap-2 p-2 text-xs font-bold uppercase tracking-widest transition-colors duration-200 hover:text-accent md:flex"
              >
                <User className="h-5 w-5" />
                <span>Ingresar</span>
              </Link>
            ) : null}
            {ODOO_ENABLED && (
              <button
                onClick={toggleCart}
                className="relative p-2 transition-colors duration-200 hover:text-accent"
                aria-label="Carrito"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-accent text-[10px] font-bold text-background">
                    {itemCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>
      {ODOO_ENABLED && (
        <>
          <CartDrawer />
          <CartPriceRefresher />
        </>
      )}
      <SearchOverlay />
    </>
  );
}
