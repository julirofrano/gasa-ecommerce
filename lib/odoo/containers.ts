import { odooClient } from "./client";
import type {
  OdooContainer,
  OdooContainerTransfer,
  OdooContainerTransferLine,
} from "./types";
import type { TimelineEntry } from "@/components/account/timeline";
import {
  TRANSFER_TYPE_LABELS,
  TRANSFER_STATE_LABELS,
} from "@/lib/utils/constants";

/**
 * Fetch all child contact IDs for a commercial partner.
 * Used to determine if an owned container is at this customer's location.
 */
export async function getChildPartnerIds(
  commercialPartnerId: number,
): Promise<number[]> {
  return odooClient.search("res.partner", [
    ["commercial_partner_id", "=", commercialPartnerId],
    ["id", "!=", commercialPartnerId],
  ]);
}

const CONTAINER_FIELDS = [
  "serial_number",
  "display_name",
  "owner_customer",
  "associated_product",
  "status",
  "container_type",
  "current_product_quantity",
  "container_capacity",
  "last_inspection_date",
  "next_inspection_date",
  "owner",
  "location",
  "location_customer",
  "effective_location",
  "gas_type",
  "tare_weight",
];

export async function getContainers(
  commercialPartnerId: number,
  limit = 50,
  offset = 0,
): Promise<OdooContainer[]> {
  const ownerPartnerId = commercialPartnerId;
  return odooClient.searchRead<OdooContainer>(
    "gas.container",
    [
      "|",
      ["owner_customer", "=", ownerPartnerId],
      "&",
      ["location_customer.parent_id", "=", ownerPartnerId],
      ["location", "=", "customer"],
    ],
    CONTAINER_FIELDS,
    limit,
    offset,
    "serial_number ASC",
  );
}

/**
 * Split containers into owned vs in-possession (comodato).
 * For owned containers NOT at the customer's own location, mask status to "filling"
 * and hide effective_location.
 */
export function splitContainersByOwnership(
  containers: OdooContainer[],
  ownerPartnerId: number,
  customerContactIds: Set<number>,
): { owned: OdooContainer[]; inPossession: OdooContainer[] } {
  const owned: OdooContainer[] = [];
  const inPossession: OdooContainer[] = [];

  for (const c of containers) {
    const isOwned = c.owner_customer && c.owner_customer[0] === ownerPartnerId;

    if (isOwned) {
      const isAtOwnLocation =
        c.location === "customer" &&
        c.location_customer &&
        (c.location_customer[0] === ownerPartnerId ||
          customerContactIds.has(c.location_customer[0]));

      if (isAtOwnLocation) {
        owned.push(c);
      } else {
        owned.push({
          ...c,
          status: "filling",
          effective_location: "En proceso de llenado",
        });
      }
    } else {
      inPossession.push(c);
    }
  }

  return { owned, inPossession };
}

export async function getContainerById(
  containerId: number,
): Promise<OdooContainer | null> {
  const containers = await odooClient.read<OdooContainer>(
    "gas.container",
    [containerId],
    CONTAINER_FIELDS,
  );
  return containers[0] || null;
}

export async function getContainerTransferHistory(
  containerId: number,
): Promise<TimelineEntry[]> {
  // 1. Find all transfer lines for this container
  const lines = await odooClient.searchRead<OdooContainerTransferLine>(
    "container.transfer.line",
    [["container_id", "=", containerId]],
    ["transfer_id"],
  );

  if (lines.length === 0) return [];

  // 2. Collect unique transfer IDs and batch-read them
  const transferIds = [...new Set(lines.map((l) => l.transfer_id[0]))];

  const transfers = await odooClient.read<OdooContainerTransfer>(
    "container.transfer",
    transferIds,
    [
      "name",
      "transfer_type",
      "state",
      "effective_date",
      "scheduled_date",
      "source_effective",
      "destination_effective",
    ],
  );

  // 3. Map to TimelineEntry and sort descending
  const entries: TimelineEntry[] = transfers.map((t) => {
    const date = (t.effective_date as string | false) || t.scheduled_date || "";
    const typeLabel = TRANSFER_TYPE_LABELS[t.transfer_type] || t.transfer_type;
    const stateLabel = TRANSFER_STATE_LABELS[t.state] || t.state;

    return {
      date,
      title: `${typeLabel} — ${t.name}`,
      description: stateLabel,
    };
  });

  entries.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

  return entries;
}

export async function markContainerEmpty(
  containerId: number,
): Promise<boolean> {
  return odooClient.write("gas.container", [containerId], {
    status: "empty",
    current_product_quantity: 0,
  });
}

export async function requestContainerReturn(
  containerId: number,
  notes?: string,
): Promise<boolean> {
  return odooClient.write("gas.container", [containerId], {
    status: "return_requested",
    notes: notes || "",
  });
}

/**
 * Create a container.transfer record (customer_return) with one line per container.
 * Uses Odoo's [0, 0, vals] ORM command for inline line creation.
 *
 * `sourceCustomerId` must match the containers' `location_customer` in Odoo.
 * Odoo's _set_source_destination_partners unconditionally copies `customer_id`
 * to `source_customer_id` for customer_return transfers, so `customer_id` must
 * be the actual source location partner (may be a child contact).
 */
export async function createContainerReturn(
  sourceCustomerId: number,
  containerIds: number[],
  notes?: string,
): Promise<number> {
  const lineCommands = containerIds.map((id) => [0, 0, { container_id: id }]);
  return odooClient.create("container.transfer", {
    transfer_type: "customer_return",
    customer_id: sourceCustomerId,
    container_line_ids: lineCommands,
    notes: notes || false,
  });
}
