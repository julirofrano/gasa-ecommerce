import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ROUTES,
  ORDER_STATUS_LABELS,
  TRANSFER_STATE_LABELS,
  TRANSFER_TYPE_LABELS,
  CONTAINER_TYPE_LABELS,
  SNAPSHOT_STATUS_LABELS,
} from "@/lib/utils/constants";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import {
  getOrderById,
  getOrderLines,
  getOrderPickings,
  getOrderContainerTransfers,
} from "@/lib/odoo/orders";
import { getInvoiceNames } from "@/lib/odoo/invoices";
import { getRequiredSession } from "@/lib/auth/session";
import { verifyResourceOwnership } from "@/lib/auth/ownership";
import type { ContainerTransferWithLines } from "@/lib/odoo/orders";
import { StatusBadge } from "@/components/account/status-badge";
import { ReorderButton } from "@/components/account/reorder-button";
import type { OdooSaleOrder, OdooContainerTransfer } from "@/lib/odoo/types";

interface Props {
  params: Promise<{ id: string }>;
}

function getOrderStatusVariant(
  state: OdooSaleOrder["state"],
): "default" | "accent" | "muted" {
  switch (state) {
    case "sale":
      return "accent";
    case "cancel":
      return "muted";
    default:
      return "default";
  }
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
  const { id } = await params;
  const order = await getOrderById(Number(id));
  return {
    title: order ? order.name : `Pedido #${id}`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  await getRequiredSession();
  const order = await getOrderById(Number(id));

  if (!order) {
    notFound();
  }

  // Verify the order belongs to the authenticated user's company
  const isOwner = await verifyResourceOwnership(order.partner_id[0]);
  if (!isOwner) {
    notFound();
  }

  const [lines, pickings, containerTransfers, invoices] = await Promise.all([
    getOrderLines(order.order_line),
    getOrderPickings(order.name),
    getOrderContainerTransfers(order.id),
    getInvoiceNames(order.invoice_ids),
  ]);

  // Build reorder lines data for the client component
  const reorderLines = lines.map((line) => ({
    productId: line.product_id[0],
    name: line.name,
    price: line.price_unit,
    quantity: line.product_uom_qty,
  }));

  // Compute delivered totals when there's a partial delivery
  const hasPartialDelivery = lines.some(
    (l) => l.qty_delivered !== l.product_uom_qty,
  );

  let deliveredUntaxed = 0;
  let deliveredTotal = 0;

  if (hasPartialDelivery) {
    for (const line of lines) {
      const ratio =
        line.product_uom_qty > 0
          ? line.qty_delivered / line.product_uom_qty
          : 0;
      deliveredUntaxed += line.price_subtotal * ratio;
      deliveredTotal += line.price_total * ratio;
    }
  }

  const deliveredTax = deliveredTotal - deliveredUntaxed;

  // Build timeline entries from order state + stock pickings
  const timeline: { label: string; date: string; detail?: string }[] = [
    { label: "Pedido creado", date: order.date_order },
  ];
  if (order.state === "sale") {
    timeline.push({ label: "Orden confirmada", date: order.date_order });
  }
  // Add completed stock pickings
  for (const picking of pickings) {
    timeline.push({
      label: `Entrega ${picking.name}`,
      date: picking.date_done || picking.scheduled_date,
      detail: picking.picking_type_id[1],
    });
  }
  // Add container transfer events
  for (const transfer of containerTransfers) {
    if (transfer.state === "done" || transfer.state === "in_transit") {
      const typeLabel =
        TRANSFER_TYPE_LABELS[transfer.transfer_type] || transfer.transfer_type;
      timeline.push({
        label: `${typeLabel} ${transfer.name}`,
        date: (transfer.effective_date as string) || transfer.scheduled_date,
        detail: `${transfer.container_count} envase${transfer.container_count !== 1 ? "s" : ""}`,
      });
    }
  }
  if (order.state === "cancel") {
    timeline.push({ label: "Cancelada", date: order.date_order });
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs font-bold uppercase tracking-widest">
        <Link
          href={ROUTES.ACCOUNT_ORDERS}
          className="text-muted-foreground transition-colors duration-200 hover:text-[#0094BB]"
        >
          Mis Pedidos
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span>{order.name}</span>
      </nav>

      <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
        {order.name}
      </h1>

      {/* ── 01 Detalle ─────────────────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-bold text-muted-foreground">
              01
            </span>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
              Detalle
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge variant={getOrderStatusVariant(order.state)}>
              {ORDER_STATUS_LABELS[order.state] || order.state}
            </StatusBadge>
            <a
              href={`/api/documents/sale-order/${order.id}`}
              download
              className="border-2 border-foreground bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB] hover:text-white"
            >
              Descargar PDF &darr;
            </a>
            {invoices.length === 1 && (
              <a
                href={`/api/documents/invoice/${invoices[0].id}`}
                download
                className="border-2 border-foreground bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB] hover:text-white"
              >
                Descargar Factura &darr;
              </a>
            )}
            {invoices.length > 1 &&
              invoices.map((inv) => (
                <a
                  key={inv.id}
                  href={`/api/documents/invoice/${inv.id}`}
                  download
                  className="border-2 border-foreground bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB] hover:text-white"
                >
                  {inv.name} &darr;
                </a>
              ))}
            <ReorderButton lines={reorderLines} />
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Fecha
            </dt>
            <dd className="text-sm font-bold">
              {formatDate(order.date_order)}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Estado
            </dt>
            <dd className="text-sm font-bold">
              {ORDER_STATUS_LABELS[order.state] || order.state}
            </dd>
          </div>
          {order.payment_term_id && (
            <div>
              <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Condicion de Pago
              </dt>
              <dd className="text-sm font-bold">{order.payment_term_id[1]}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* ── 02 Articulos ───────────────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            02
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
            Articulos
          </h2>
        </div>

        {/* Table header */}
        <div className="hidden border-b-2 border-foreground pb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground md:grid md:grid-cols-12 md:gap-4">
          <span className="col-span-4">Producto</span>
          <span className="col-span-2 text-right">Pedido</span>
          <span className="col-span-2 text-right">Entregado</span>
          <span className="col-span-2 text-right">Precio Unit.</span>
          <span className="col-span-2 text-right">Subtotal</span>
        </div>

        {/* Line items */}
        <div className="divide-y-2 divide-foreground/10">
          {lines.map((line) => (
            <div
              key={line.id}
              className="grid grid-cols-1 gap-1 py-4 md:grid-cols-12 md:items-center md:gap-4"
            >
              <p className="font-bold md:col-span-4">{line.name}</p>
              <p className="text-sm text-muted-foreground md:col-span-2 md:text-right">
                <span className="md:hidden">Pedido: </span>
                {line.product_uom_qty}
              </p>
              <p
                className={`text-sm md:col-span-2 md:text-right ${line.qty_delivered < line.product_uom_qty ? "text-[#0094BB] font-bold" : "text-muted-foreground"}`}
              >
                <span className="md:hidden">Entregado: </span>
                {line.qty_delivered}
              </p>
              <p className="text-sm md:col-span-2 md:text-right">
                <span className="md:hidden">Precio: </span>
                {formatCurrency(line.price_unit)}
              </p>
              <p className="font-bold md:col-span-2 md:text-right">
                {formatCurrency(line.price_subtotal)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 03 Resumen ─────────────────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            03
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
            Resumen
          </h2>
        </div>
        <dl className="space-y-3 text-sm">
          {hasPartialDelivery && (
            <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Pedido
            </dt>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-bold">
              {formatCurrency(order.amount_untaxed)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">IVA</dt>
            <dd className="font-bold">{formatCurrency(order.amount_tax)}</dd>
          </div>
          <div className="flex justify-between border-t-2 border-foreground pt-3 text-lg font-black">
            <dt>Total Pedido</dt>
            <dd>{formatCurrency(order.amount_total)}</dd>
          </div>
        </dl>

        {hasPartialDelivery && (
          <dl className="mt-6 space-y-3 border-t-2 border-foreground/20 pt-6 text-sm">
            <dt className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
              Entregado
            </dt>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-bold">{formatCurrency(deliveredUntaxed)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">IVA</dt>
              <dd className="font-bold">{formatCurrency(deliveredTax)}</dd>
            </div>
            <div className="flex justify-between border-t-2 border-foreground pt-3 text-lg font-black text-[#0094BB]">
              <dt>Total Entregado</dt>
              <dd>{formatCurrency(deliveredTotal)}</dd>
            </div>
          </dl>
        )}
      </section>

      {/* ── 04 Envio ───────────────────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            04
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
            Envio
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Direccion de Envio
            </dt>
            <dd className="text-sm font-bold">
              {order.partner_shipping_id[1]}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Direccion de Facturacion
            </dt>
            <dd className="text-sm font-bold">{order.partner_invoice_id[1]}</dd>
          </div>
        </dl>
      </section>

      {/* ── Envases (only when transfers exist) ──────── */}
      {containerTransfers.length > 0 && (
        <ContainerTransfersSection
          transfers={containerTransfers}
          sectionNumber="05"
        />
      )}

      {/* ── Seguimiento ──────────────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            {containerTransfers.length > 0 ? "06" : "05"}
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
            Seguimiento
          </h2>
        </div>
        <div className="space-y-0">
          {timeline.map((entry, i) => (
            <div key={i} className="flex gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className="dot-indicator h-3 w-3 bg-foreground" />
                {i < timeline.length - 1 && (
                  <div className="w-0.5 grow bg-foreground/20" />
                )}
              </div>
              {/* Content */}
              <div className="pb-6">
                <p className="text-sm font-bold">{entry.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(entry.date)}
                </p>
                {entry.detail && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {entry.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContainerTransfersSection({
  transfers,
  sectionNumber,
}: {
  transfers: ContainerTransferWithLines[];
  sectionNumber: string;
}) {
  return (
    <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-mono text-sm font-bold text-muted-foreground">
          {sectionNumber}
        </span>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
          Envases
        </h2>
      </div>

      <div className="space-y-8">
        {transfers.map((transfer) => (
          <div key={transfer.id}>
            {/* Transfer header */}
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm font-bold">
                {transfer.name}
              </span>
              <StatusBadge variant={getTransferStateVariant(transfer.state)}>
                {TRANSFER_STATE_LABELS[transfer.state] || transfer.state}
              </StatusBadge>
              <span className="text-xs text-muted-foreground">
                {TRANSFER_TYPE_LABELS[transfer.transfer_type] ||
                  transfer.transfer_type}
              </span>
              {transfer.effective_date && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(transfer.effective_date as string)}
                </span>
              )}
              <a
                href={`/api/documents/container-transfer/${transfer.id}`}
                download
                className="text-xs font-bold uppercase tracking-wide text-[#0094BB] transition-colors duration-200 hover:text-foreground"
              >
                Descargar PDF &darr;
              </a>
            </div>

            {/* Location */}
            <p className="mb-4 text-xs text-muted-foreground">
              <span className="font-bold uppercase tracking-widest">
                Origen
              </span>{" "}
              {transfer.source_effective}
              <span className="mx-2">&rarr;</span>
              <span className="font-bold uppercase tracking-widest">
                Destino
              </span>{" "}
              {transfer.destination_effective}
            </p>

            {/* Container table */}
            {transfer.lines.length > 0 && (
              <>
                <div className="hidden border-b-2 border-foreground pb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground md:grid md:grid-cols-10 md:gap-4">
                  <span className="col-span-2">N° Serie</span>
                  <span className="col-span-3">Gas</span>
                  <span className="col-span-2">Tipo</span>
                  <span className="col-span-1 text-right">Cantidad</span>
                  <span className="col-span-2 text-right">Estado</span>
                </div>
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
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
