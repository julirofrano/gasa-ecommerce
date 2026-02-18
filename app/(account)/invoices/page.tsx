import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { getRequiredSession, getCommercialPartnerId } from "@/lib/auth/session";
import { getInvoices } from "@/lib/odoo/invoices";
import {
  INVOICE_PAYMENT_STATE_LABELS,
  INVOICE_TYPE_LABELS,
} from "@/lib/utils/constants";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { StatusBadge } from "@/components/account/status-badge";
import { EmptyState } from "@/components/account/empty-state";
import { InvoiceFilters } from "@/components/account/invoice-filters";
import type { OdooInvoice } from "@/lib/odoo/types";

export const metadata: Metadata = {
  title: "Mis Facturas",
  robots: { index: false, follow: false },
};

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

interface Props {
  searchParams: Promise<{ payment_state?: string; q?: string }>;
}

export default async function InvoicesPage({ searchParams }: Props) {
  const session = await getRequiredSession();
  const { payment_state, q } = await searchParams;

  const commercialPartnerId = await getCommercialPartnerId(session);
  const invoices = await getInvoices(commercialPartnerId);

  if (invoices.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-4xl font-black uppercase tracking-tighter md:text-5xl">
          Mis Facturas
        </h1>
        <EmptyState
          icon={FileText}
          title="Sin facturas"
          description="No tiene facturas registradas."
        />
      </div>
    );
  }

  // Stats reflect ALL invoices (unfiltered)
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(
    (i) => i.payment_state === "paid",
  ).length;
  const pendingInvoices = invoices.filter(
    (i) => i.payment_state === "not_paid" || i.payment_state === "partial",
  ).length;
  const totalResidual = invoices.reduce((sum, i) => sum + i.amount_residual, 0);

  // Filter invoices for the table
  let filtered = invoices;
  if (payment_state) {
    filtered = filtered.filter((i) => i.payment_state === payment_state);
  }
  if (q) {
    const search = q.toLowerCase();
    filtered = filtered.filter((i) => i.name.toLowerCase().includes(search));
  }

  return (
    <div>
      <h1 className="mb-6 text-4xl font-black uppercase tracking-tighter md:text-5xl">
        Mis Facturas
      </h1>

      {/* Stats Bar */}
      <div className="mb-8 grid grid-cols-2 gap-px bg-foreground md:grid-cols-4">
        {[
          { label: "Total Facturas", value: totalInvoices },
          { label: "Pagadas", value: paidInvoices },
          { label: "Pendientes", value: pendingInvoices },
          { label: "Saldo Total", value: formatCurrency(totalResidual) },
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

      {/* Filter Tabs + Search */}
      <InvoiceFilters />

      {/* Invoices Table */}
      <div className="border-2 border-foreground md:border-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground bg-muted">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest">
                  Factura
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-widest md:table-cell">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest">
                  Fecha
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-widest md:table-cell">
                  Vencimiento
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest">
                  Estado Pago
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest">
                  Total
                </th>
                <th className="hidden px-4 py-3 text-right text-xs font-bold uppercase tracking-widest md:table-cell">
                  Saldo
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron facturas con estos filtros.
                  </td>
                </tr>
              ) : (
                filtered.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b-2 border-foreground/10 last:border-0"
                  >
                    <td className="px-4 py-3 font-bold">{invoice.name}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {INVOICE_TYPE_LABELS[invoice.move_type] ||
                        invoice.move_type}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(invoice.invoice_date)}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {invoice.invoice_date_due
                        ? formatDate(invoice.invoice_date_due)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={getPaymentStateVariant(invoice.payment_state)}
                      >
                        {INVOICE_PAYMENT_STATE_LABELS[invoice.payment_state] ||
                          invoice.payment_state}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {formatCurrency(invoice.amount_total)}
                    </td>
                    <td className="hidden px-4 py-3 text-right font-bold md:table-cell">
                      {invoice.amount_residual > 0
                        ? formatCurrency(invoice.amount_residual)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-xs font-bold uppercase tracking-wide text-accent transition-colors duration-200 hover:text-foreground"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
