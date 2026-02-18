import { odooClient } from "./client";
import type { OdooWarehouse, OdooPartner } from "./types";
import { haversineDistance } from "@/lib/utils/geo";

/** Get the warehouse ID for a given company (branch) ID. */
export async function getWarehouseByCompanyId(
  companyId: number,
): Promise<number | null> {
  const warehouses = await odooClient.searchRead<OdooWarehouse>(
    "stock.warehouse",
    [["company_id", "=", companyId]],
    ["id"],
    1,
  );
  return warehouses.length > 0 ? warehouses[0].id : null;
}

interface WarehouseWithCoords {
  id: number;
  lat: number;
  lng: number;
}

/** Fetch all warehouses and resolve their partner coordinates. */
export async function getWarehousesWithCoords(): Promise<
  WarehouseWithCoords[]
> {
  const warehouses = await odooClient.searchRead<OdooWarehouse>(
    "stock.warehouse",
    [],
    ["id", "partner_id"],
  );

  if (warehouses.length === 0) return [];

  const partnerIds = warehouses.map((wh) => wh.partner_id[0]);
  const partners = await odooClient.read<
    Pick<OdooPartner, "id" | "partner_latitude" | "partner_longitude">
  >("res.partner", partnerIds, ["id", "partner_latitude", "partner_longitude"]);

  const coordsByPartnerId = new Map<number, { lat: number; lng: number }>();
  for (const p of partners) {
    if (p.partner_latitude && p.partner_longitude) {
      coordsByPartnerId.set(p.id, {
        lat: p.partner_latitude,
        lng: p.partner_longitude,
      });
    }
  }

  const result: WarehouseWithCoords[] = [];
  for (const wh of warehouses) {
    const coords = coordsByPartnerId.get(wh.partner_id[0]);
    if (coords) {
      result.push({ id: wh.id, lat: coords.lat, lng: coords.lng });
    }
  }

  return result;
}

/** Get branch (company) names for a list of warehouse IDs. */
export async function getBranchNamesByWarehouseIds(
  warehouseIds: number[],
): Promise<Map<number, string>> {
  if (warehouseIds.length === 0) return new Map();

  const warehouses = await odooClient.read<OdooWarehouse>(
    "stock.warehouse",
    warehouseIds,
    ["id", "company_id"],
  );

  const result = new Map<number, string>();
  for (const wh of warehouses) {
    result.set(wh.id, wh.company_id[1]);
  }
  return result;
}

/** Find the warehouse closest to the given coordinates. */
export async function findNearestWarehouseId(
  lat: number,
  lng: number,
): Promise<number | null> {
  const warehouses = await getWarehousesWithCoords();
  if (warehouses.length === 0) return null;

  let nearest: { id: number; distance: number } | null = null;
  for (const wh of warehouses) {
    const d = haversineDistance(lat, lng, wh.lat, wh.lng);
    if (!nearest || d < nearest.distance) {
      nearest = { id: wh.id, distance: d };
    }
  }

  return nearest?.id ?? null;
}
