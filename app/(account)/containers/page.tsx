import type { Metadata } from "next";
import { Container } from "lucide-react";
import { getRequiredSession, getCommercialPartnerId } from "@/lib/auth/session";
import {
  getContainers,
  getChildPartnerIds,
  splitContainersByOwnership,
} from "@/lib/odoo/containers";
import { ContainersPageClient } from "@/components/account/containers-page-client";
import { EmptyState } from "@/components/account/empty-state";

export const metadata: Metadata = {
  title: "Mis Envases",
  robots: { index: false, follow: false },
};

export default async function ContainersPage() {
  const session = await getRequiredSession();
  const ownerPartnerId = await getCommercialPartnerId(session);

  const [containers, childIds] = await Promise.all([
    getContainers(ownerPartnerId),
    getChildPartnerIds(ownerPartnerId),
  ]);

  if (containers.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-4xl font-black uppercase tracking-tighter md:text-5xl">
          Mis Envases
        </h1>
        <EmptyState
          icon={Container}
          title="Sin envases"
          description="No tiene envases asignados a su cuenta. Contáctenos para coordinar la asignación de envases."
          ctaLabel="Contactar"
          ctaHref="/contact"
        />
      </div>
    );
  }

  const customerContactIds = new Set([ownerPartnerId, ...childIds]);
  const { owned, inPossession } = splitContainersByOwnership(
    containers,
    ownerPartnerId,
    customerContactIds,
  );

  const totalContainers = containers.length;
  const empty = containers.filter((c) => c.status === "empty").length;

  return (
    <div>
      <h1 className="mb-6 text-4xl font-black uppercase tracking-tighter md:text-5xl">
        Mis Envases
      </h1>

      {/* ── Stats Bar ──────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-px bg-foreground md:grid-cols-4">
        {[
          { label: "Total Envases", value: totalContainers },
          { label: "Propios", value: owned.length },
          { label: "En Comodato", value: inPossession.length },
          { label: "Vacíos", value: empty },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-foreground px-4 py-4 text-background"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-background/50">
              {stat.label}
            </p>
            <p className="mt-1 text-lg font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <ContainersPageClient owned={owned} inPossession={inPossession} />
    </div>
  );
}
