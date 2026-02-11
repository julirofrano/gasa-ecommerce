import { odooClient } from "./client";
import type {
  OdooSaleOrder,
  OdooOrderLine,
  OdooStockPicking,
  OdooContainerTransfer,
  OdooContainerTransferLine,
} from "./types";

export async function createOrder(
  partnerId: number,
  orderLines: Array<{
    productId: number;
    quantity: number;
    priceUnit: number;
  }>,
  shippingAddressId?: number,
  notes?: string,
  pricelistId?: number,
  invoiceAddressId?: number,
): Promise<number> {
  const orderData: Record<string, unknown> = {
    partner_id: partnerId,
    partner_shipping_id: shippingAddressId || partnerId,
    order_line: orderLines.map((line) => [
      0,
      0,
      {
        product_id: line.productId,
        product_uom_qty: line.quantity,
        price_unit: line.priceUnit,
      },
    ]),
  };

  if (invoiceAddressId) {
    orderData.partner_invoice_id = invoiceAddressId;
  }

  if (pricelistId) {
    orderData.pricelist_id = pricelistId;
  }

  if (notes) {
    orderData.note = notes;
  }

  return odooClient.create("sale.order", orderData);
}

export async function getOrders(
  partnerIds: number | number[],
  limit = 20,
  offset = 0,
): Promise<OdooSaleOrder[]> {
  const ids = Array.isArray(partnerIds) ? partnerIds : [partnerIds];
  const domain: unknown[] =
    ids.length === 1
      ? [["partner_id", "=", ids[0]]]
      : [["partner_id", "in", ids]];
  return odooClient.searchRead<OdooSaleOrder>(
    "sale.order",
    domain,
    [
      "name",
      "partner_id",
      "date_order",
      "state",
      "amount_total",
      "currency_id",
      "invoice_status",
      "payment_term_id",
    ],
    limit,
    offset,
    "date_order DESC",
  );
}

export async function getOrderById(
  orderId: number,
): Promise<OdooSaleOrder | null> {
  const orders = await odooClient.read<OdooSaleOrder>(
    "sale.order",
    [orderId],
    [
      "name",
      "partner_id",
      "partner_invoice_id",
      "partner_shipping_id",
      "date_order",
      "state",
      "order_line",
      "amount_untaxed",
      "amount_tax",
      "amount_total",
      "currency_id",
      "pricelist_id",
      "note",
      "client_order_ref",
      "invoice_status",
      "payment_term_id",
      "invoice_ids",
    ],
  );
  return orders[0] || null;
}

export async function getOrderLines(
  orderLineIds: number[],
): Promise<OdooOrderLine[]> {
  if (orderLineIds.length === 0) return [];

  return odooClient.read<OdooOrderLine>("sale.order.line", orderLineIds, [
    "order_id",
    "product_id",
    "product_uom_qty",
    "qty_delivered",
    "price_unit",
    "price_subtotal",
    "price_total",
    "name",
    "discount",
  ]);
}

export async function getOrderPickings(
  orderName: string,
): Promise<OdooStockPicking[]> {
  return odooClient.searchRead<OdooStockPicking>(
    "stock.picking",
    [
      ["origin", "=", orderName],
      ["state", "=", "done"],
    ],
    [
      "name",
      "origin",
      "state",
      "scheduled_date",
      "date_done",
      "picking_type_id",
    ],
    undefined,
    undefined,
    "date_done ASC",
  );
}

export type ContainerTransferWithLines = OdooContainerTransfer & {
  lines: OdooContainerTransferLine[];
};

export async function getOrderContainerTransfers(
  orderId: number,
): Promise<ContainerTransferWithLines[]> {
  const transfers = await odooClient.searchRead<OdooContainerTransfer>(
    "container.transfer",
    [["sale_order_id", "=", orderId]],
    [
      "name",
      "transfer_type",
      "state",
      "sale_order_id",
      "stock_picking_id",
      "container_line_ids",
      "container_count",
      "scheduled_date",
      "effective_date",
      "source_effective",
      "destination_effective",
    ],
    undefined,
    undefined,
    "effective_date ASC",
  );

  if (transfers.length === 0) return [];

  // Collect all line IDs and batch-read them
  const allLineIds = transfers.flatMap((t) => t.container_line_ids);
  if (allLineIds.length === 0) {
    return transfers.map((t) => ({ ...t, lines: [] }));
  }

  const allLines = await odooClient.read<OdooContainerTransferLine>(
    "container.transfer.line",
    allLineIds,
    [
      "transfer_id",
      "container_id",
      "snapshot_serial_number",
      "snapshot_product_name",
      "snapshot_container_type",
      "snapshot_status",
      "snapshot_product_quantity",
      "is_empty",
    ],
  );

  // Group lines by transfer_id
  const linesByTransfer = new Map<number, OdooContainerTransferLine[]>();
  for (const line of allLines) {
    const transferId = line.transfer_id[0];
    const existing = linesByTransfer.get(transferId);
    if (existing) {
      existing.push(line);
    } else {
      linesByTransfer.set(transferId, [line]);
    }
  }

  return transfers.map((t) => ({
    ...t,
    lines: linesByTransfer.get(t.id) || [],
  }));
}

export async function confirmOrder(orderId: number): Promise<boolean> {
  return odooClient.call<boolean>("sale.order", "action_confirm", [[orderId]]);
}

export async function cancelOrder(orderId: number): Promise<boolean> {
  return odooClient.call<boolean>("sale.order", "action_cancel", [[orderId]]);
}

export async function writeOrderPaymentRef(
  orderId: number,
  paymentRef: string,
): Promise<boolean> {
  return odooClient.write("sale.order", [orderId], {
    client_order_ref: paymentRef,
  });
}
