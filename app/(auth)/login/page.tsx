import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description:
    "Inicie sesión en su cuenta de Gases Aconcagua S.A. para gestionar pedidos, consultar precios y coordinar entregas.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0094BB]">
        Acceso — Portal de Clientes
      </p>
      <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
        Iniciar
        <br />
        Sesión
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Ingrese sus credenciales para acceder a su cuenta empresarial.
      </p>

      {/* ── Form ─────────────────────────────────────────── */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
