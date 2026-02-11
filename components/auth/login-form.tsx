"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
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
      setError("Credenciales incorrectas. Intente nuevamente.");
      setIsPending(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <>
      {error && (
        <div className="mb-6 border-2 border-red-600 bg-red-600/10 px-4 py-3 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
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
            className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-[#0094BB] focus:outline-none"
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
            className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-[#0094BB] focus:outline-none"
            required
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 border-2 border-foreground bg-transparent accent-[#0094BB]"
            />
            <span className="text-xs font-bold uppercase tracking-wide">
              Recordarme
            </span>
          </label>
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-xs font-bold uppercase tracking-wide text-[#0094BB] transition-colors duration-200 hover:text-foreground"
          >
            ¿Olvidó su contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full border-2 border-foreground bg-foreground px-6 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB] disabled:opacity-50"
        >
          {isPending ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </form>

      <div className="mt-10 border-t-2 border-foreground pt-6">
        <p className="text-sm text-muted-foreground">
          ¿No tiene cuenta?{" "}
          <Link
            href={ROUTES.REGISTER}
            className="text-xs font-bold uppercase tracking-wide text-[#0094BB] transition-colors duration-200 hover:text-foreground"
          >
            Registrarse
          </Link>
        </p>
      </div>
    </>
  );
}
