import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description:
    "Registre su empresa en el portal de Gases Aconcagua S.A. para acceder a precios, realizar pedidos y gestionar entregas.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
        Registro — Nueva Cuenta
      </p>
      <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
        Crear
        <br />
        Cuenta
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Complete el formulario para registrar su empresa en nuestro portal.
      </p>

      {/* ── Form ─────────────────────────────────────────── */}
      <form className="mt-10 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-xs font-bold uppercase tracking-widest"
            >
              Nombre
            </label>
            <input
              id="name"
              type="text"
              placeholder="Juan"
              className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-[#0094BB] focus:outline-none"
              required
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="mb-2 block text-xs font-bold uppercase tracking-widest"
            >
              Apellido
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Pérez"
              className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-[#0094BB] focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="company"
            className="mb-2 block text-xs font-bold uppercase tracking-widest"
          >
            Empresa / Razón Social
          </label>
          <input
            id="company"
            type="text"
            placeholder="Nombre de su empresa"
            className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-[#0094BB] focus:outline-none"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-bold uppercase tracking-widest"
          >
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            placeholder="correo@empresa.com"
            className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-[#0094BB] focus:outline-none"
            required
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-xs font-bold uppercase tracking-widest"
          >
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+54 9 261 000-0000"
            className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-[#0094BB] focus:outline-none"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-xs font-bold uppercase tracking-widest"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-[#0094BB] focus:outline-none"
            required
          />
          <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            Mínimo 8 caracteres
          </p>
        </div>

        <button
          type="submit"
          className="w-full border-2 border-foreground bg-foreground px-6 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]"
        >
          Crear Cuenta
        </button>
      </form>

      {/* ── Footer Link ──────────────────────────────────── */}
      <div className="mt-10 border-t-2 border-foreground pt-6">
        <p className="text-sm text-muted-foreground">
          ¿Ya tiene cuenta?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="text-xs font-bold uppercase tracking-wide text-[#0094BB] transition-colors duration-200 hover:text-foreground"
          >
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
