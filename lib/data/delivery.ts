import type { CartItem, DeliveryMethod } from "@/types";

// ---------------------------------------------------------------------------
// Own-delivery zones (postal code prefixes served by GASA fleet)
// ---------------------------------------------------------------------------

export const OWN_DELIVERY_ZONES: Record<string, string[]> = {
  lujan: [
    "5500",
    "5501",
    "5503",
    "5505",
    "5507",
    "5509",
    "5511",
    "5513",
    "5515",
    "5517",
    "5519",
    "5521",
    "5523",
    "5525",
    "5527",
    "5547",
    "5549",
    "5551",
    "5553",
    "5555",
    "5557",
  ],
  sanRafael: [
    "5600",
    "5601",
    "5603",
    "5605",
    "5607",
    "5609",
    "5611",
    "5613",
    "5615",
    "5617",
    "5619",
    "5620",
    "5621",
    "5622",
    "5623",
    "5624",
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if a postal code is within GASA's own-delivery coverage */
export function isInOwnDeliveryZone(zipCode: string): boolean {
  const zip = zipCode.trim();
  return Object.values(OWN_DELIVERY_ZONES).some((prefixes) =>
    prefixes.some((prefix) => zip.startsWith(prefix)),
  );
}

/** Split cart items into own-delivery (gas/hazmat) vs carrier (supply) groups */
export function classifyCartItems(items: CartItem[]): {
  ownDelivery: CartItem[];
  carrierDelivery: CartItem[];
} {
  const ownDelivery: CartItem[] = [];
  const carrierDelivery: CartItem[] = [];

  for (const item of items) {
    if (item.productType === "gas" || item.productType === "hazmat") {
      ownDelivery.push(item);
    } else {
      carrierDelivery.push(item);
    }
  }

  return { ownDelivery, carrierDelivery };
}

/** Determine which delivery methods are available for the cart + zip combination */
export function getAvailableDeliveryMethods(
  items: CartItem[],
  zipCode: string,
): {
  gasHazmatMethods: DeliveryMethod[];
  supplyMethods: DeliveryMethod[];
  isMixedCart: boolean;
} {
  const { ownDelivery, carrierDelivery } = classifyCartItems(items);
  const inZone = isInOwnDeliveryZone(zipCode);

  const gasHazmatMethods: DeliveryMethod[] = [];
  const supplyMethods: DeliveryMethod[] = [];

  if (ownDelivery.length > 0) {
    gasHazmatMethods.push("branch_pickup");
    if (inZone) {
      gasHazmatMethods.unshift("own_delivery");
    }
  }

  if (carrierDelivery.length > 0) {
    supplyMethods.push("branch_pickup");
    supplyMethods.unshift("carrier_delivery");
    if (inZone) {
      // Allow GASA fleet delivery for supplies too (inserted after carrier)
      supplyMethods.splice(1, 0, "own_delivery");
    }
  }

  return {
    gasHazmatMethods,
    supplyMethods,
    isMixedCart: ownDelivery.length > 0 && carrierDelivery.length > 0,
  };
}

/** Human-readable label for a delivery method */
export function getDeliveryMethodLabel(method: DeliveryMethod): string {
  switch (method) {
    case "branch_pickup":
      return "Retiro en Sucursal";
    case "own_delivery":
      return "Entrega GASA";
    case "carrier_delivery":
      return "Envío a Domicilio";
  }
}

/** Delivery cost display string */
export function getDeliveryCostLabel(method: DeliveryMethod): string {
  switch (method) {
    case "branch_pickup":
      return "Gratis";
    case "own_delivery":
      return "$0";
    case "carrier_delivery":
      return "A confirmar";
  }
}

/** Get the numeric delivery cost (MVP: all free / zero) */
export function getDeliveryCost(_method: DeliveryMethod): number {
  // MVP: all delivery methods are free
  return 0;
}
