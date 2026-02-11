"use server";

import { auth } from "@/auth";
import { getContainers } from "@/lib/odoo/containers";

export interface CustomerContainerInfo {
  id: number;
  serial_number: string;
  container_capacity: number;
  gas_type: string;
  status: string;
}

export async function getCustomerContainersForProduct(
  productId: number,
): Promise<CustomerContainerInfo[]> {
  const session = await auth();
  if (!session?.user?.partnerId) return [];

  const containers = await getContainers(session.user.partnerId);

  return containers
    .filter(
      (c) =>
        Array.isArray(c.associated_product) &&
        c.associated_product[0] === productId,
    )
    .map((c) => ({
      id: c.id,
      serial_number: c.serial_number,
      container_capacity: c.container_capacity,
      gas_type: c.gas_type,
      status: c.status,
    }));
}
