import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ROUTES,
  INVOICE_STATE_LABELS,
  INVOICE_PAYMENT_STATE_LABELS,
  INVOICE_TYPE_LABELS,
} from "@/lib/utils/constants";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { getInvoiceById, getInvoiceLines } from "@/lib/odoo/invoices";
import { getRequiredSession } from "@/lib/auth/session";
import { verifyResourceOwnership } from "@/lib/auth/ownership";
import { StatusBadge } from "@/components/account/status-badge";
import type { OdooInvoice } from "@/lib/odoo/types";

interface Props {
  params: Promise<{ id: string }>;
}

function getInvoiceStateVariant(
  state: OdooInvoice["state"],
): "default" | "accent" | "muted" {
  switch (state) {
    case "posted":
      return "default";
    case "cancel":
    case "draft":
      return "muted";
    default:
      return "default";
  }
}

function getPaymentStateVariant(
  paymentState: OdooInvoice["payment_state"],
): "default" | "accent" | "muted" {
  switch (paymentState) {
    case "paid":
      return "accent";
    case "partial":
    case "in_payment":
      return "default";
    case "not_paid":
    case "reversed":
      return "muted";
    default:
      return "default";
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const invoice = await getInvoiceById(Number(id));
    return {
      title: invoice ? invoice.name : `Factura #${id}`,
      robots: { index: false, follow: false },
    };
  } catch {
    const { id } = await params;
    return {
      title: `Factura #${id}`,
      robots: { index: false, follow: false },
    };
  }
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  await getRequiredSession();
  const invoice = await getInvoiceById(Number(id));

  if (!invoice) {
    notFound();
  }

  // Verify the invoice belongs to the authenticated user's company
  const isOwner = await verifyResourceOwnership(invoice.partner_id[0]);
  if (!isOwner) {
    notFound();
  }

  const lines = await getInvoiceLines(invoice.invoice_line_ids);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs font-bold uppercase tracking-widest">
        <Link
          href={ROUTES.ACCOUNT_INVOICES}
          className="text-muted-foreground transition-colors duration-200 hover:text-accent"
        >
          Mis Facturas
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span>{invoice.name}</span>
      </nav>

      <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
        {invoice.name}
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
            <StatusBadge variant={getInvoiceStateVariant(invoice.state)}>
              {INVOICE_STATE_LABELS[invoice.state] || invoice.state}
            </StatusBadge>
            <StatusBadge
              variant={getPaymentStateVariant(invoice.payment_state)}
            >
              {INVOICE_PAYMENT_STATE_LABELS[invoice.payment_state] ||
                invoice.payment_state}
            </StatusBadge>
            <a
              href={`/api/documents/invoice/${invoice.id}`}
              download
              className="border-2 border-foreground bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-white"
            >
              Descargar PDF &darr;
            </a>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Tipo
            </dt>
            <dd className="text-sm font-bold">
              {INVOICE_TYPE_LABELS[invoice.move_type] || invoice.move_type}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Fecha
            </dt>
            <dd className="text-sm font-bold">
              {formatDate(invoice.invoice_date)}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Vencimiento
            </dt>
            <dd className="text-sm font-bold">
              {invoice.invoice_date_due
                ? formatDate(invoice.invoice_date_due)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Estado de Pago
            </dt>
            <dd className="text-sm font-bold">
              {INVOICE_PAYMENT_STATE_LABELS[invoice.payment_state] ||
                invoice.payment_state}
            </dd>
          </div>
        </dl>
      </section>

      {/* ── 02 Artículos ───────────────────────────────── */}
      <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            02
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent">
            Artículos
          </h2>
        </div>

        {/* Table header */}
        <div className="hidden border-b-2 border-foreground pb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground md:grid md:grid-cols-12 md:gap-4">
          <span className="col-span-5">Producto</span>
          <span className="col-span-2 text-right">Cantidad</span>
          <span className="col-span-2 text-right">Precio Unit.</span>
          <span className="col-span-3 text-right">Subtotal</span>
        </div>

        {/* Line items */}
        <div className="divide-y-2 divide-foreground/10">
          {lines.map((line) => (
            <div
              key={line.id}
              className="grid grid-cols-1 gap-1 py-4 md:grid-cols-12 md:items-center md:gap-4"
            >
              <p className="font-bold md:col-span-5">{line.name}</p>
              <p className="text-sm text-muted-foreground md:col-span-2 md:text-right">
                <span className="md:hidden">Cantidad: </span>
                {line.quantity}
              </p>
              <p className="text-sm md:col-span-2 md:text-right">
                <span className="md:hidden">Precio: </span>
                {formatCurrency(line.price_unit)}
              </p>
              <p className="font-bold md:col-span-3 md:text-right">
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
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent">
            Resumen
          </h2>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-bold">
              {formatCurrency(invoice.amount_untaxed)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">IVA</dt>
            <dd className="font-bold">{formatCurrency(invoice.amount_tax)}</dd>
          </div>
          <div className="flex justify-between border-t-2 border-foreground pt-3 text-lg font-black">
            <dt>Total</dt>
            <dd>{formatCurrency(invoice.amount_total)}</dd>
          </div>
          {invoice.amount_residual > 0 && (
            <div className="flex justify-between border-t-2 border-foreground/20 pt-3 text-lg font-black text-accent">
              <dt>Saldo Pendiente</dt>
              <dd>{formatCurrency(invoice.amount_residual)}</dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
