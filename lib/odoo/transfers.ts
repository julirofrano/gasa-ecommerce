import { odooClient } from "./client";
import type { OdooContainerTransfer, OdooContainerTransferLine } from "./types";
import type { ContainerTransferWithLines } from "./orders";

const TRANSFER_LIST_FIELDS = [
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
  "customer_id",
  "notes",
  "create_date",
] as const;

const TRANSFER_DETAIL_FIELDS = [...TRANSFER_LIST_FIELDS, "partner_id"] as const;

export async function getCustomerReturns(
  commercialPartnerId: number,
  limit = 50,
  offset = 0,
): Promise<OdooContainerTransfer[]> {
  const parentId = commercialPartnerId;

  return odooClient.searchRead<OdooContainerTransfer>(
    "container.transfer",
    [
      ["customer_id", "child_of", parentId],
      ["transfer_type", "=", "customer_return"],
      ["state", "!=", "draft"],
    ],
    [...TRANSFER_LIST_FIELDS],
    limit,
    offset,
    "create_date DESC",
  );
}

export async function getTransferById(
  id: number,
): Promise<OdooContainerTransfer | null> {
  const transfers = await odooClient.read<OdooContainerTransfer>(
    "container.transfer",
    [id],
    [...TRANSFER_DETAIL_FIELDS],
  );
  return transfers[0] || null;
}

export async function getTransferWithLines(
  id: number,
): Promise<ContainerTransferWithLines | null> {
  const transfer = await getTransferById(id);
  if (!transfer) return null;

  if (transfer.container_line_ids.length === 0) {
    return { ...transfer, lines: [] };
  }

  const lines = await odooClient.read<OdooContainerTransferLine>(
    "container.transfer.line",
    transfer.container_line_ids,
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

  return { ...transfer, lines };
}
