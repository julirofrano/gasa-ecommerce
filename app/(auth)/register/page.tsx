import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

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
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
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
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
