import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";

const navLinks = [
  { href: ROUTES.PRODUCTS, label: "Productos" },
  { href: ROUTES.CATEGORIES, label: "Categorías" },
];

export function Nav() {
  return (
    <nav className="hidden items-center gap-6 md:flex">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-xs font-bold uppercase tracking-widest transition-colors duration-200 hover:text-accent"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
