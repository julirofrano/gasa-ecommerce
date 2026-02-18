import type { Metadata } from "next";
import { Suspense } from "react";
import { MagicLinkHandler } from "@/components/auth/magic-link-handler";

export const metadata: Metadata = {
  title: "Verificando acceso",
  robots: { index: false, follow: false },
};

export default function MagicLinkPage() {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
        Acceso — Portal de Clientes
      </p>
      <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
        Verificando
        <br />
        Acceso
      </h1>
      <div className="mt-10">
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Cargando...</p>
          }
        >
          <MagicLinkHandler />
        </Suspense>
      </div>
    </div>
  );
}
