import type { Metadata } from "next";
import Link from "next/link";
import { Truck } from "lucide-react";
import { getRequiredSession, getCommercialPartnerId } from "@/lib/auth/session";
import { getCustomerReturns } from "@/lib/odoo/transfers";
import { TRANSFER_STATE_LABELS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/formatting";
import { StatusBadge } from "@/components/account/status-badge";
import { EmptyState } from "@/components/account/empty-state";
import type { OdooContainerTransfer } from "@/lib/odoo/types";

export const metadata: Metadata = {
  title: "Devoluciones",
  robots: { index: false, follow: false },
};

function getTransferStateVariant(
  state: OdooContainerTransfer["state"],
): "default" | "accent" | "muted" {
  switch (state) {
    case "done":
      return "accent";
    case "confirmed":
    case "in_transit":
      return "default";
    default:
      return "muted";
  }
}

export default async function ReturnsPage() {
  const session = await getRequiredSession();
  const commercialPartnerId = await getCommercialPartnerId(session);
  const returns = await getCustomerReturns(commercialPartnerId);

  if (returns.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-4xl font-black uppercase tracking-tighter md:text-5xl">
          Devoluciones
        </h1>
        <EmptyState
          icon={Truck}
          title="Sin devoluciones"
          description="No tiene solicitudes de devolución registradas."
        />
      </div>
    );
  }

  const totalReturns = returns.length;
  const pendingReturns = returns.filter(
    (r) => r.state === "pending_company_signature",
  ).length;
  const inProgressReturns = returns.filter(
    (r) => r.state === "confirmed" || r.state === "in_transit",
  ).length;
  const completedReturns = returns.filter((r) => r.state === "done").length;

  return (
    <div>
      <h1 className="mb-6 text-4xl font-black uppercase tracking-tighter md:text-5xl">
        Devoluciones
      </h1>

      {/* Stats Bar */}
      <div className="mb-8 grid grid-cols-2 gap-px bg-foreground md:grid-cols-4">
        {[
          { label: "Total", value: totalReturns },
          { label: "Pendientes", value: pendingReturns },
          { label: "En Proceso", value: inProgressReturns },
          { label: "Completados", value: completedReturns },
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

      {/* Returns Table */}
      <div className="border-2 border-foreground md:border-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground bg-muted">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest">
                  Devolución
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest">
                  Fecha
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-widest md:table-cell">
                  Envases
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-widest md:table-cell">
                  Origen
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {returns.map((transfer) => (
                <tr
                  key={transfer.id}
                  className="border-b-2 border-foreground/10 last:border-0"
                >
                  <td className="px-4 py-3 font-bold">{transfer.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {transfer.create_date
                      ? formatDate(transfer.create_date)
                      : "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {transfer.container_count}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {transfer.source_effective}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={getTransferStateVariant(transfer.state)}
                    >
                      {TRANSFER_STATE_LABELS[transfer.state] || transfer.state}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/returns/${transfer.id}`}
                      className="text-xs font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:text-foreground"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
