import type { ContainerSize, GasProduct } from '@/types';

// ---------------------------------------------------------------------------
// Gas-specific data keyed by Odoo product template ID
// This data is NOT available in Odoo and must be maintained here.
// ---------------------------------------------------------------------------

/** Odoo product.template IDs for gas products */
export const GAS_PRODUCT_IDS = {
  OXIGENO_INDUSTRIAL: 273,
  CO2_INDUSTRIAL: 258,
  ACETILENO_INDUSTRIAL: 278,
  ARGON_INDUSTRIAL: 284,
  NITROGENO_INDUSTRIAL: 266,
  OXIGENO_MEDICINAL: 297,
  MEZCLA_AR_CO2: 295,
  HELIO: 246,
  PROPANO: 249,
} as const;

export interface GasProductData {
  unitOfMeasure: string;
  purity?: string;
  containerSizes: ContainerSize[];
}

export const GAS_PRODUCT_DATA: Record<number, GasProductData> = {
  // Oxígeno Industrial
  [GAS_PRODUCT_IDS.OXIGENO_INDUSTRIAL]: {
    unitOfMeasure: 'm³',
    containerSizes: [
      {
        id: 101,
        label: '1 m³',
        capacity: 1,
        unit: 'm³',
        rentalPricePerFill: 5000,
      },
      {
        id: 102,
        label: '3 m³',
        capacity: 3,
        unit: 'm³',
        rentalPricePerFill: 8000,
      },
      {
        id: 103,
        label: '6 m³',
        capacity: 6,
        unit: 'm³',
        rentalPricePerFill: 12000,
      },
      {
        id: 104,
        label: '10 m³',
        capacity: 10,
        unit: 'm³',
        rentalPricePerFill: 18000,
      },
    ],
  },

  // CO₂ Industrial
  [GAS_PRODUCT_IDS.CO2_INDUSTRIAL]: {
    unitOfMeasure: 'kg',
    containerSizes: [
      {
        id: 201,
        label: '10 kg',
        capacity: 10,
        unit: 'kg',
        rentalPricePerFill: 6000,
      },
      {
        id: 202,
        label: '20 kg',
        capacity: 20,
        unit: 'kg',
        rentalPricePerFill: 9000,
      },
      {
        id: 203,
        label: '30 kg',
        capacity: 30,
        unit: 'kg',
        rentalPricePerFill: 12000,
      },
    ],
  },
  // Argón Industrial
  [GAS_PRODUCT_IDS.ARGON_INDUSTRIAL]: {
    unitOfMeasure: 'm³',
    containerSizes: [
      {
        id: 301,
        label: '3 m³',
        capacity: 3,
        unit: 'm³',
        rentalPricePerFill: 9000,
      },
      {
        id: 302,
        label: '6 m³',
        capacity: 6,
        unit: 'm³',
        rentalPricePerFill: 14000,
      },
      {
        id: 303,
        label: '10 m³',
        capacity: 10,
        unit: 'm³',
        rentalPricePerFill: 20000,
      },
    ],
  },
  // Nitrógeno Industrial
  [GAS_PRODUCT_IDS.NITROGENO_INDUSTRIAL]: {
    unitOfMeasure: 'm³',
    containerSizes: [
      {
        id: 401,
        label: '3 m³',
        capacity: 3,
        unit: 'm³',
        rentalPricePerFill: 7000,
      },
      {
        id: 402,
        label: '6 m³',
        capacity: 6,
        unit: 'm³',
        rentalPricePerFill: 11000,
      },
      {
        id: 403,
        label: '10 m³',
        capacity: 10,
        unit: 'm³',
        rentalPricePerFill: 16000,
      },
    ],
  },
  // Acetileno Industrial
  [GAS_PRODUCT_IDS.ACETILENO_INDUSTRIAL]: {
    unitOfMeasure: 'kg',
    containerSizes: [
      {
        id: 501,
        label: '3,5 kg',
        capacity: 3.5,
        unit: 'kg',
        rentalPricePerFill: 8000,
      },
      {
        id: 502,
        label: '7 kg',
        capacity: 7,
        unit: 'kg',
        rentalPricePerFill: 14000,
      },
    ],
  },
  // Oxígeno Medicinal
  [GAS_PRODUCT_IDS.OXIGENO_MEDICINAL]: {
    unitOfMeasure: 'm³',
    containerSizes: [
      {
        id: 601,
        label: '1 m³',
        capacity: 1,
        unit: 'm³',
        rentalPricePerFill: 7000,
      },
      {
        id: 602,
        label: '3 m³',
        capacity: 3,
        unit: 'm³',
        rentalPricePerFill: 11000,
      },
      {
        id: 603,
        label: '6 m³',
        capacity: 6,
        unit: 'm³',
        rentalPricePerFill: 16000,
      },
    ],
  },
  // Mezcla Ar/CO₂
  [GAS_PRODUCT_IDS.MEZCLA_AR_CO2]: {
    unitOfMeasure: 'm³',
    containerSizes: [
      {
        id: 701,
        label: '3 m³',
        capacity: 3,
        unit: 'm³',
        rentalPricePerFill: 10000,
      },
      {
        id: 702,
        label: '6 m³',
        capacity: 6,
        unit: 'm³',
        rentalPricePerFill: 15000,
      },
      {
        id: 703,
        label: '10 m³',
        capacity: 10,
        unit: 'm³',
        rentalPricePerFill: 22000,
      },
    ],
  },
  // Helio
  [GAS_PRODUCT_IDS.HELIO]: {
    unitOfMeasure: 'm³',
    containerSizes: [
      {
        id: 801,
        label: '3 m³',
        capacity: 3,
        unit: 'm³',
        rentalPricePerFill: 12000,
      },
      {
        id: 802,
        label: '6 m³',
        capacity: 6,
        unit: 'm³',
        rentalPricePerFill: 18000,
      },
    ],
  },
  [GAS_PRODUCT_IDS.PROPANO]: {
    unitOfMeasure: 'kg',
    containerSizes: [
      {
        id: 101,
        label: '45 kg',
        capacity: 1,
        unit: 'm³',
        rentalPricePerFill: 5000,
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Pure calculation helpers (used by gas-product-actions.tsx)
// ---------------------------------------------------------------------------

/** Calculate the gas fill cost for a given container size */
export function calculateGasFillPrice(
  product: GasProduct,
  containerSize: ContainerSize
): number {
  return product.pricePerUnit * containerSize.capacity;
}

/** Calculate total per container (gas fill + optional rental) */
export function calculateContainerTotal(
  product: GasProduct,
  containerSize: ContainerSize,
  ownership: 'own' | 'rent'
): number {
  const fillCost = calculateGasFillPrice(product, containerSize);
  const rental = ownership === 'rent' ? containerSize.rentalPricePerFill : 0;
  return fillCost + rental;
}
