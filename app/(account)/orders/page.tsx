import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { getRequiredSession } from "@/lib/auth/session";
import { getOrders } from "@/lib/odoo/orders";
import { getPartner } from "@/lib/odoo/partners";
import { ORDER_STATUS_LABELS } from "@/lib/utils/constants";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { StatusBadge } from "@/components/account/status-badge";
import { EmptyState } from "@/components/account/empty-state";
import { OrderFilters } from "@/components/account/order-filters";
import type { OdooSaleOrder } from "@/lib/odoo/types";

export const metadata: Metadata = {
  title: "Mis Pedidos",
  robots: { index: false, follow: false },
};

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

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function OrdersPage({ searchParams }: Props) {
  const session = await getRequiredSession();
  const { status, q } = await searchParams;

  // Resolve parent company — orders may be linked to the company, not the contact
  const partner = await getPartner(session.user.partnerId);
  const partnerIds = partner?.parent_id
    ? [session.user.partnerId, partner.parent_id[0]]
    : [session.user.partnerId];
  const orders = await getOrders(partnerIds);

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-4xl font-black uppercase tracking-tighter md:text-5xl">
          Mis Pedidos
        </h1>
        <EmptyState
          icon={Package}
          title="Sin pedidos"
          description="Todavía no realizó ningún pedido. Explore nuestro catálogo de productos."
          ctaLabel="Ver Productos"
          ctaHref="/products"
        />
      </div>
    );
  }

  // Stats reflect ALL orders (unfiltered)
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.state === "sale").length;
  const totalAmount = orders.reduce((sum, o) => sum + o.amount_total, 0);

  // Filter orders for the table
  let filtered = orders;
  if (status) {
    filtered = filtered.filter((o) => o.state === status);
  }
  if (q) {
    const search = q.toLowerCase();
    filtered = filtered.filter((o) => o.name.toLowerCase().includes(search));
  }

  return (
    <div>
      <h1 className="mb-6 text-4xl font-black uppercase tracking-tighter md:text-5xl">
        Mis Pedidos
      </h1>

      {/* Stats Bar */}
      <div className="mb-8 grid grid-cols-3 gap-px bg-foreground">
        {[
          { label: "Total Pedidos", value: totalOrders },
          { label: "Completados", value: completedOrders },
          { label: "Monto Total", value: formatCurrency(totalAmount) },
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
      <OrderFilters />

      {/* Orders Table */}
      <div className="border-2 border-foreground md:border-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground bg-muted">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest">
                  Pedido
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest">
                  Total
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
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron pedidos con estos filtros.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b-2 border-foreground/10 last:border-0"
                  >
                    <td className="px-4 py-3 font-bold">{order.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(order.date_order)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={getOrderStatusVariant(order.state)}>
                        {ORDER_STATUS_LABELS[order.state] || order.state}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {formatCurrency(order.amount_total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-xs font-bold uppercase tracking-wide text-[#0094BB] transition-colors duration-200 hover:text-foreground"
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
