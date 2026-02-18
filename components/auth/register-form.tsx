"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";
import { registerAction } from "@/app/(auth)/register/actions";

type AccountType = "empresa" | "particular";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, {
    error: null,
    success: false,
    pendingApproval: undefined,
  });
  const [accountType, setAccountType] = useState<AccountType>("empresa");

  function switchAccountType(type: AccountType) {
    setAccountType(type);
  }

  function handleCuitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    let masked = digits;
    if (digits.length > 2) masked = digits.slice(0, 2) + "-" + digits.slice(2);
    if (digits.length > 10)
      masked =
        digits.slice(0, 2) + "-" + digits.slice(2, 10) + "-" + digits.slice(10);
    e.target.value = masked;
  }

  // ── Success Screen ──────────────────────────────────────────
  if (state.success) {
    if (state.pendingApproval) {
      return (
        <div className="mt-10 space-y-6">
          <div className="border-2 border-accent bg-accent/10 px-6 py-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
              Solicitud Recibida
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              Su solicitud de registro ha sido recibida y será revisada por
              nuestro equipo.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Será notificado por correo electrónico cuando su cuenta sea
            aprobada. Este proceso suele completarse en 1-2 días hábiles.
          </p>
          <div className="border-t-2 border-foreground pt-6">
            <p className="text-sm text-muted-foreground">
              ¿Ya tiene una cuenta aprobada?{" "}
              <Link
                href={ROUTES.LOGIN}
                className="text-xs font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:text-foreground"
              >
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-10 space-y-6">
        <div className="border-2 border-accent bg-accent/10 px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Confirme su Correo
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground">
            Le enviamos un correo electrónico con un enlace de confirmación.
            Haga clic en el enlace para activar su cuenta.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Revise su bandeja de entrada y carpeta de spam. El enlace expira en 7
          días.
        </p>
        <div className="border-t-2 border-foreground pt-6">
          <p className="text-sm text-muted-foreground">
            ¿Ya confirmó su correo?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="text-xs font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:text-foreground"
            >
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Registration Form ───────────────────────────────────────
  return (
    <>
      {/* ── Account Type Toggle ────────────────────────── */}
      <div className="mt-10 flex border-2 border-foreground">
        <button
          type="button"
          onClick={() => switchAccountType("empresa")}
          className={`flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors duration-200 ${
            accountType === "empresa"
              ? "bg-foreground text-background"
              : "bg-transparent text-foreground hover:bg-foreground/5"
          }`}
        >
          Empresa
        </button>
        <button
          type="button"
          onClick={() => switchAccountType("particular")}
          className={`flex-1 border-l-2 border-foreground px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors duration-200 ${
            accountType === "particular"
              ? "bg-foreground text-background"
              : "bg-transparent text-foreground hover:bg-foreground/5"
          }`}
        >
          Particular
        </button>
      </div>

      {state.error && (
        <div className="mt-6 border-2 border-red-600 bg-red-600/10 px-4 py-3 text-sm font-bold text-red-600">
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-6">
        <input type="hidden" name="accountType" value={accountType} />

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
              name="name"
              type="text"
              placeholder="Juan"
              className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              required
              autoComplete="given-name"
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
              name="lastName"
              type="text"
              placeholder="Pérez"
              className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        {accountType === "empresa" && (
          <div>
            <label
              htmlFor="company"
              className="mb-2 block text-xs font-bold uppercase tracking-widest"
            >
              Empresa / Razón Social
            </label>
            <input
              id="company"
              name="company"
              type="text"
              placeholder="Nombre de su empresa"
              className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              required
              autoComplete="organization"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="cuit"
            className="mb-2 block text-xs font-bold uppercase tracking-widest"
          >
            {accountType === "empresa" ? "CUIT" : "CUIT / CUIL"}
          </label>
          <input
            id="cuit"
            name="cuit"
            type="text"
            placeholder="XX-XXXXXXXX-X"
            inputMode="numeric"
            maxLength={13}
            onChange={handleCuitChange}
            className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            required={accountType === "empresa"}
          />
          <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            Formato: XX-XXXXXXXX-X
            {accountType === "particular" && " (opcional)"}
          </p>
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
            name="email"
            type="email"
            placeholder="correo@empresa.com"
            className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            required
            autoComplete="email"
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
            name="phone"
            type="tel"
            placeholder="+54 9 261 000-0000"
            className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            required
            autoComplete="tel"
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
            name="password"
            type="password"
            placeholder="••••••••"
            minLength={8}
            className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            required
            autoComplete="new-password"
          />
          <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            Mínimo 8 caracteres
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full border-2 border-foreground bg-foreground px-6 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent disabled:opacity-50"
        >
          {isPending
            ? accountType === "empresa"
              ? "Enviando solicitud..."
              : "Creando cuenta..."
            : accountType === "empresa"
              ? "Solicitar Registro"
              : "Crear Cuenta"}
        </button>
      </form>

      <div className="mt-10 border-t-2 border-foreground pt-6">
        <p className="text-sm text-muted-foreground">
          ¿Ya tiene cuenta?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="text-xs font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:text-foreground"
          >
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </>
  );
}
