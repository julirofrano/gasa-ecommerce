import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";

const footerColumns = [
  {
    number: "01",
    title: "Empresa",
    links: [
      { href: ROUTES.ABOUT, label: "Acerca de" },
      { href: ROUTES.INDUSTRIES, label: "Industrias" },
      { href: ROUTES.CERTIFICATES, label: "Certificados" },
      { href: ROUTES.ETHICS, label: "Ética y Cumplimiento" },
    ],
  },
  {
    number: "02",
    title: "Tienda",
    links: [
      { href: ROUTES.PRODUCTS, label: "Productos" },
      { href: ROUTES.ACCOUNT_PROFILE, label: "Mi Cuenta" },
      { href: ROUTES.ACCOUNT_ORDERS, label: "Mis Pedidos" },
      { href: ROUTES.ACCOUNT_CONTAINERS, label: "Mis Envases" },
    ],
  },
  {
    number: "03",
    title: "Servicios",
    links: [
      { href: ROUTES.SERVICES, label: "Todos los Servicios" },
      { href: ROUTES.SERVICES_GAS_SYSTEMS, label: "Instalaciones de Gases" },
      { href: ROUTES.SERVICES_HOME_CARE, label: "Oxígeno en Casa" },
      { href: ROUTES.SERVICES_ICE_PELLETS, label: "Hielo en Pellets" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t-4 border-foreground bg-foreground text-background">
      {/* ── Main Footer ──────────────────────────────────── */}
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="flex flex-col gap-16 lg:flex-row lg:gap-20">
          {/* Left: company branding */}
          <div className="shrink-0 lg:w-80 xl:w-96">
            <h2 className="text-4xl font-black uppercase leading-[0.88] tracking-tighter md:text-5xl lg:text-6xl">
              Gases
              <br />
              Aconcagua
              <br />
              <span className="text-[#0094BB]">S.A.</span>
            </h2>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-background/50">
              Fabricación y distribución de gases industriales y medicinales
              para todas las industrias de la región de Cuyo.
            </p>
          </div>

          {/* Right: link columns */}
          <div className="grid flex-1 grid-cols-1 gap-10 sm:grid-cols-3">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-background/30">
                  {col.number}
                </p>
                <h3 className="mt-1 text-xs font-bold uppercase tracking-widest text-[#0094BB]">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-0">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block border-b border-background/10 py-2.5 text-sm text-background/60 transition-colors duration-200 hover:text-[#0094BB]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contact Row ──────────────────────────────────── */}
      <div className="border-t border-background/10">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-3">
          <div className="px-4 py-6 sm:py-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-background/30">
              Teléfono
            </p>
            <a
              href="tel:+5492613691623"
              className="mt-1 block text-sm text-background/60 transition-colors duration-200 hover:text-[#0094BB]"
            >
              +54 9 261 369-1623
            </a>
          </div>
          <div className="border-t border-background/10 px-4 py-6 sm:border-l sm:border-t-0 sm:py-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-background/30">
              Email
            </p>
            <a
              href="mailto:consultas@gasesaconcagua.com.ar"
              className="mt-1 block text-sm text-background/60 transition-colors duration-200 hover:text-[#0094BB]"
            >
              consultas@gasesaconcagua.com.ar
            </a>
          </div>
          <div className="border-t border-background/10 px-4 py-6 sm:border-l sm:border-t-0 sm:py-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-background/30">
              Dirección
            </p>
            <p className="mt-1 text-sm text-background/60">
              Mendoza, Argentina
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-background/30">
              Lun — Vie 8:00 a 17:00
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ───────────────────────────────────── */}
      <div className="border-t border-background/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row">
          <p className="text-[10px] font-bold uppercase tracking-widest text-background/30">
            &copy; {new Date().getFullYear()} Gases Aconcagua S.A.
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-background/20">
            Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
