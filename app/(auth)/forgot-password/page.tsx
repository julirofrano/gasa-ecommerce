import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Recuperar Contraseña",
  description:
    "Recupere el acceso a su cuenta de Gases Aconcagua S.A. Ingrese su correo electrónico para recibir instrucciones.",
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPasswordPage() {
  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
        Recuperación — Acceso
      </p>
      <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
        Recuperar
        <br />
        Contraseña
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Ingrese su correo electrónico y le enviaremos instrucciones para
        restablecer su contraseña.
      </p>

      {/* ── Form ─────────────────────────────────────────── */}
      <form className="mt-10 space-y-6">
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

        <button
          type="submit"
          className="w-full border-2 border-foreground bg-foreground px-6 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]"
        >
          Enviar Instrucciones
        </button>
      </form>

      {/* ── Footer Link ──────────────────────────────────── */}
      <div className="mt-10 border-t-2 border-foreground pt-6">
        <p className="text-sm text-muted-foreground">
          ¿Recordó su contraseña?{" "}
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
