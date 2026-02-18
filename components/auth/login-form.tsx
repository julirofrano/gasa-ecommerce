"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";
import {
  requestMagicLink,
  checkPendingRegistration,
} from "@/app/(auth)/login/actions";

type LoginMode = "password" | "magic-link";

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [mode, setMode] = useState<LoginMode>("password");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPendingApproval(false);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      // Check if this is a pending registration before showing generic error
      const { pending } = await checkPendingRegistration(email);
      if (pending) {
        setPendingApproval(true);
      } else {
        setError("Credenciales incorrectas. Intente nuevamente.");
      }
      setIsPending(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  async function handleMagicLinkSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    if (!email) {
      setError("Ingrese su correo electrónico.");
      setIsPending(false);
      return;
    }

    await requestMagicLink(email);
    setMagicLinkSent(true);
    setIsPending(false);
  }

  function switchMode(newMode: LoginMode) {
    setMode(newMode);
    setError(null);
    setPendingApproval(false);
    setMagicLinkSent(false);
  }

  return (
    <>
      {/* ── Mode Toggle ──────────────────────────────── */}
      <div className="mt-10 flex border-2 border-foreground">
        <button
          type="button"
          onClick={() => switchMode("password")}
          className={`flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors duration-200 ${
            mode === "password"
              ? "bg-foreground text-background"
              : "bg-transparent text-foreground hover:bg-foreground/5"
          }`}
        >
          Contraseña
        </button>
        <button
          type="button"
          onClick={() => switchMode("magic-link")}
          className={`flex-1 border-l-2 border-foreground px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors duration-200 ${
            mode === "magic-link"
              ? "bg-foreground text-background"
              : "bg-transparent text-foreground hover:bg-foreground/5"
          }`}
        >
          Enlace de Acceso
        </button>
      </div>

      {pendingApproval && (
        <div className="mt-6 border-2 border-accent bg-accent/10 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Cuenta Pendiente
          </p>
          <p className="mt-2 text-sm text-foreground">
            Su cuenta está pendiente de aprobación. Recibirá un correo
            electrónico cuando sea aprobada.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 border-2 border-red-600 bg-red-600/10 px-4 py-3 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      {/* ── Password Form ────────────────────────────── */}
      {mode === "password" && (
        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-6">
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
              className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 border-2 border-foreground bg-transparent accent-accent"
              />
              <span className="text-xs font-bold uppercase tracking-wide">
                Recordarme
              </span>
            </label>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:text-foreground"
            >
              ¿Olvidó su contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full border-2 border-foreground bg-foreground px-6 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent disabled:opacity-50"
          >
            {isPending ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
      )}

      {/* ── Magic Link Form ──────────────────────────── */}
      {mode === "magic-link" && !magicLinkSent && (
        <form onSubmit={handleMagicLinkSubmit} className="mt-6 space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ingrese su correo y le enviaremos un enlace para acceder sin
            contraseña.
          </p>
          <div>
            <label
              htmlFor="magic-email"
              className="mb-2 block text-xs font-bold uppercase tracking-widest"
            >
              Correo Electrónico
            </label>
            <input
              id="magic-email"
              name="email"
              type="email"
              placeholder="correo@empresa.com"
              className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full border-2 border-foreground bg-foreground px-6 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent disabled:opacity-50"
          >
            {isPending ? "Enviando..." : "Enviar Enlace de Acceso"}
          </button>
        </form>
      )}

      {/* ── Magic Link Sent Confirmation ─────────────── */}
      {mode === "magic-link" && magicLinkSent && (
        <div className="mt-6 space-y-4">
          <div className="border-2 border-accent bg-accent/10 px-4 py-4">
            <p className="text-sm font-bold text-accent">
              Si la cuenta existe, recibirá un correo con el enlace de acceso.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Revise su bandeja de entrada y carpeta de spam. El enlace expira en
            7 días.
          </p>
          <button
            type="button"
            onClick={() => setMagicLinkSent(false)}
            className="text-xs font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:text-foreground"
          >
            Enviar otro enlace
          </button>
        </div>
      )}

      <div className="mt-10 border-t-2 border-foreground pt-6">
        <p className="text-sm text-muted-foreground">
          ¿No tiene cuenta?{" "}
          <Link
            href={ROUTES.REGISTER}
            className="text-xs font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:text-foreground"
          >
            Registrarse
          </Link>
        </p>
      </div>
    </>
  );
}
