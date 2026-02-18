import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ROUTES,
  TRANSFER_STATE_LABELS,
  CONTAINER_TYPE_LABELS,
  SNAPSHOT_STATUS_LABELS,
} from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/formatting";
import { getTransferWithLines } from "@/lib/odoo/transfers";
import { getRequiredSession } from "@/lib/auth/session";
import { verifyResourceOwnership } from "@/lib/auth/ownership";
import { StatusBadge } from "@/components/account/status-badge";
import type { OdooContainerTransfer } from "@/lib/odoo/types";

interface Props {
  params: Promise<{ id: string }>;
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const transfer = await getTransferWithLines(Number(id));
    return {
      title: transfer ? transfer.name : `Devolución #${id}`,
      robots: { index: false, follow: false },
    };
  } catch {
    const { id } = await params;
    return {
      title: `Devolución #${id}`,
      robots: { index: false, follow: false },
    };
  }
}

export default async function ReturnDetailPage({ params }: Props) {
  const { id } = await params;
  await getRequiredSession();
  const transfer = await getTransferWithLines(Number(id));

  if (!transfer) {
    notFound();
  }

  // Verify the transfer belongs to the authenticated user's company
  const ownerPartnerId = transfer.customer_id?.[0] ?? transfer.partner_id?.[0];
  if (!ownerPartnerId) {
    notFound();
  }
  const isOwner = await verifyResourceOwnership(ownerPartnerId);
  if (!isOwner) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs font-bold uppercase tracking-widest">
        <Link
          href={ROUTES.ACCOUNT_RETURNS}
          className="text-muted-foreground transition-colors duration-200 hover:text-accent"
        >
          Devoluciones
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span>{transfer.name}</span>
      </nav>

      <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
        {transfer.name}
      </h1>

      {/* ── 01 Detalle ─────────────────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-bold text-muted-foreground">
              01
            </span>
            <h2 className="text-xs font-bold uppercase tracking-widest text-accent">
              Detalle
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge variant={getTransferStateVariant(transfer.state)}>
              {TRANSFER_STATE_LABELS[transfer.state] || transfer.state}
            </StatusBadge>
            <a
              href={`/api/documents/container-transfer/${transfer.id}`}
              download
              className="border-2 border-foreground bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-white"
            >
              Descargar PDF &darr;
            </a>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {transfer.scheduled_date && (
            <div>
              <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Fecha Programada
              </dt>
              <dd className="text-sm font-bold">
                {formatDate(transfer.scheduled_date)}
              </dd>
            </div>
          )}
          {transfer.effective_date && (
            <div>
              <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Fecha Efectiva
              </dt>
              <dd className="text-sm font-bold">
                {formatDate(transfer.effective_date as string)}
              </dd>
            </div>
          )}
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Envases
            </dt>
            <dd className="text-sm font-bold">{transfer.container_count}</dd>
          </div>
        </dl>

        {/* Origin → Destination */}
        <div className="mt-6 border-t-2 border-foreground/10 pt-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-bold uppercase tracking-widest">Origen</span>{" "}
            {transfer.source_effective}
            <span className="mx-2">&rarr;</span>
            <span className="font-bold uppercase tracking-widest">
              Destino
            </span>{" "}
            {transfer.destination_effective}
          </p>
        </div>

        {/* Notes */}
        {transfer.notes && (
          <div className="mt-4 border-t-2 border-foreground/10 pt-4">
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Notas
            </dt>
            <dd className="text-sm">{transfer.notes}</dd>
          </div>
        )}
      </section>

      {/* ── 02 Envases ─────────────────────────────────── */}
      {transfer.lines.length > 0 && (
        <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
          <div className="mb-6 flex items-baseline gap-3">
            <span className="font-mono text-sm font-bold text-muted-foreground">
              02
            </span>
            <h2 className="text-xs font-bold uppercase tracking-widest text-accent">
              Envases
            </h2>
          </div>

          {/* Table header */}
          <div className="hidden border-b-2 border-foreground pb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground md:grid md:grid-cols-10 md:gap-4">
            <span className="col-span-2">N° Serie</span>
            <span className="col-span-3">Gas</span>
            <span className="col-span-2">Tipo</span>
            <span className="col-span-1 text-right">Cantidad</span>
            <span className="col-span-2 text-right">Estado</span>
          </div>

          {/* Container lines */}
          <div className="divide-y-2 divide-foreground/10">
            {transfer.lines.map((line) => (
              <div
                key={line.id}
                className="grid grid-cols-1 gap-1 py-3 md:grid-cols-10 md:items-center md:gap-4"
              >
                <p className="font-mono text-sm font-bold md:col-span-2">
                  {line.snapshot_serial_number}
                </p>
                <p className="text-sm md:col-span-3">
                  {line.snapshot_product_name}
                </p>
                <p className="text-sm text-muted-foreground md:col-span-2">
                  <span className="md:hidden">Tipo: </span>
                  {CONTAINER_TYPE_LABELS[line.snapshot_container_type] ||
                    line.snapshot_container_type}
                </p>
                <p className="text-sm md:col-span-1 md:text-right">
                  <span className="md:hidden">Cantidad: </span>
                  {line.snapshot_product_quantity}
                </p>
                <div className="md:col-span-2 md:text-right">
                  <StatusBadge
                    variant={
                      line.is_empty || line.snapshot_status === "empty"
                        ? "muted"
                        : line.snapshot_status === "full"
                          ? "accent"
                          : "default"
                    }
                  >
                    {SNAPSHOT_STATUS_LABELS[line.snapshot_status] ||
                      line.snapshot_status}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
