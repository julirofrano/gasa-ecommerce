"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";

export function MagicLinkHandler() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No se proporcionó un enlace de acceso válido.");
      return;
    }

    signIn("credentials", {
      magicToken: token,
      redirect: false,
    }).then((result) => {
      if (result?.error) {
        setStatus("error");
        setError("El enlace es inválido o ha expirado.");
      } else {
        setStatus("success");
        setTimeout(() => {
          window.location.href = "/profile";
        }, 1500);
      }
    });
  }, [token]);

  if (status === "verifying") {
    return (
      <div className="space-y-4">
        <div className="h-1 w-full overflow-hidden border border-foreground">
          <div className="h-full w-1/3 animate-pulse bg-accent" />
        </div>
        <p className="text-sm font-bold uppercase tracking-wide">
          Verificando...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-4">
        <div className="border-2 border-accent bg-accent/10 px-4 py-3">
          <p className="text-sm font-bold text-accent">
            Acceso verificado. Redirigiendo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-2 border-red-600 bg-red-600/10 px-4 py-3">
        <p className="text-sm font-bold text-red-600">
          {error ?? "El enlace es inválido o ha expirado."}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Puede solicitar un nuevo enlace desde la página de inicio de sesión.
      </p>
      <Link
        href={ROUTES.LOGIN}
        className="inline-block border-2 border-foreground bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent"
      >
        Ir a Iniciar Sesión
      </Link>
    </div>
  );
}
