"use server";

import { revalidatePath } from "next/cache";
import { getRequiredSession, getCommercialPartnerId } from "@/lib/auth/session";
import { odooClient } from "@/lib/odoo/client";
import type { OdooContainer } from "@/lib/odoo/types";
import {
  getChildPartnerIds,
  getContainerById,
  markContainerEmpty,
  createContainerReturn,
} from "@/lib/odoo/containers";

export async function markContainerEmptyAction(
  containerId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getRequiredSession();
    const ownerPartnerId = await getCommercialPartnerId(session);

    const container = await getContainerById(containerId);
    if (!container) {
      return { success: false, error: "Contenedor no encontrado." };
    }

    // Verify ownership or location-based possession
    const isOwned =
      container.owner_customer &&
      container.owner_customer[0] === ownerPartnerId;
    const childIds = await getChildPartnerIds(ownerPartnerId);
    const customerContactIds = new Set([ownerPartnerId, ...childIds]);
    const isAtLocation =
      container.location === "customer" &&
      container.location_customer &&
      customerContactIds.has(container.location_customer[0]);

    if (!isOwned && !isAtLocation) {
      return {
        success: false,
        error: "No tiene permiso para este contenedor.",
      };
    }

    await markContainerEmpty(containerId);
    revalidatePath("/containers");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al marcar el contenedor como vacío.",
    };
  }
}

const SELECTABLE_STATUSES = new Set<OdooContainer["status"]>([
  "empty",
  "in_use",
  "full",
  "partially_filled",
]);

export async function requestPickupAction(
  containerIds: number[],
  notes?: string,
): Promise<{ success: boolean; error?: string; transferId?: number }> {
  try {
    if (containerIds.length === 0) {
      return { success: false, error: "No se seleccionaron envases." };
    }

    const session = await getRequiredSession();
    const ownerPartnerId = await getCommercialPartnerId(session);
    const childIds = await getChildPartnerIds(ownerPartnerId);
    const customerContactIds = new Set([ownerPartnerId, ...childIds]);

    // Batch-read all selected containers
    const containers = await odooClient.read<OdooContainer>(
      "gas.container",
      containerIds,
      [
        "id",
        "serial_number",
        "owner_customer",
        "location",
        "location_customer",
        "status",
      ],
    );

    if (containers.length !== containerIds.length) {
      return {
        success: false,
        error: "Algunos envases no fueron encontrados.",
      };
    }

    // Verify each container: owned or at customer location, and selectable status
    for (const c of containers) {
      const isOwned =
        c.owner_customer && c.owner_customer[0] === ownerPartnerId;
      const isAtLocation =
        c.location === "customer" &&
        c.location_customer &&
        customerContactIds.has(c.location_customer[0]);

      if (!isOwned && !isAtLocation) {
        return {
          success: false,
          error: `No tiene permiso para el envase ${c.serial_number}.`,
        };
      }

      if (!SELECTABLE_STATUSES.has(c.status)) {
        return {
          success: false,
          error: `El envase ${c.serial_number} no puede ser retirado en su estado actual.`,
        };
      }
    }

    // Group containers by location_customer to create one transfer per source address
    const bySource = new Map<number, number[]>();
    for (const c of containers) {
      const sourceId = c.location_customer
        ? c.location_customer[0]
        : ownerPartnerId;
      const group = bySource.get(sourceId);
      if (group) {
        group.push(c.id);
      } else {
        bySource.set(sourceId, [c.id]);
      }
    }

    const transferIds: number[] = [];
    for (const [sourceCustomerId, ids] of bySource) {
      const transferId = await createContainerReturn(
        sourceCustomerId,
        ids,
        notes,
      );
      transferIds.push(transferId);
    }

    revalidatePath("/containers");
    return { success: true, transferId: transferIds[0] };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al solicitar el retiro.",
    };
  }
}
