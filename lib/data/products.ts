import type { ContainerSize, GasProduct, ProductCategory } from "@/types";
import { slugify } from "@/lib/utils/slugify";

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
  description?: string;
  containerSizes: ContainerSize[];
}

export const GAS_PRODUCT_DATA: Record<number, GasProductData> = {
  // Oxígeno Industrial
  [GAS_PRODUCT_IDS.OXIGENO_INDUSTRIAL]: {
    unitOfMeasure: "m³",
    description:
      "El oxígeno industrial es un gas esencial para numerosos procesos industriales, caracterizado por su alta pureza y versatilidad de aplicaciones. Con concentraciones superiores al 99.5%, nuestro oxígeno garantiza resultados óptimos en soldadura, corte, procesos siderúrgicos y una amplia gama de aplicaciones industriales críticas.",
    containerSizes: [
      {
        id: 101,
        label: "1 m³",
        capacity: 1,
        unit: "m³",
        rentalPricePerFill: 5000,
      },
      {
        id: 102,
        label: "3 m³",
        capacity: 3,
        unit: "m³",
        rentalPricePerFill: 8000,
      },
      {
        id: 103,
        label: "6 m³",
        capacity: 6,
        unit: "m³",
        rentalPricePerFill: 12000,
      },
      {
        id: 104,
        label: "10 m³",
        capacity: 10,
        unit: "m³",
        rentalPricePerFill: 18000,
      },
    ],
  },

  // CO₂ Industrial
  [GAS_PRODUCT_IDS.CO2_INDUSTRIAL]: {
    unitOfMeasure: "kg",
    description:
      "El anhídrido carbónico, también conocido como dióxido de carbono (CO₂), es un gas incoloro, inodoro y ligeramente ácido que se encuentra naturalmente en la atmósfera terrestre. Es ampliamente utilizado en aplicaciones industriales y comerciales como refrigeración, extinción de incendios, soldadura y carbonatación de bebidas.",
    containerSizes: [
      {
        id: 201,
        label: "10 kg",
        capacity: 10,
        unit: "kg",
        rentalPricePerFill: 6000,
      },
      {
        id: 202,
        label: "20 kg",
        capacity: 20,
        unit: "kg",
        rentalPricePerFill: 9000,
      },
      {
        id: 203,
        label: "30 kg",
        capacity: 30,
        unit: "kg",
        rentalPricePerFill: 12000,
      },
    ],
  },
  // Argón Industrial
  [GAS_PRODUCT_IDS.ARGON_INDUSTRIAL]: {
    unitOfMeasure: "m³",
    description:
      "El argón es un gas noble inerte, ideal para procesos de soldadura que requieren protección contra la oxidación. Su alta pureza (mín. 99.996%) y estabilidad lo convierten en la elección preferida para soldadura TIG y MIG de metales no ferrosos.",
    containerSizes: [
      {
        id: 301,
        label: "3 m³",
        capacity: 3,
        unit: "m³",
        rentalPricePerFill: 9000,
      },
      {
        id: 302,
        label: "6 m³",
        capacity: 6,
        unit: "m³",
        rentalPricePerFill: 14000,
      },
      {
        id: 303,
        label: "10 m³",
        capacity: 10,
        unit: "m³",
        rentalPricePerFill: 20000,
      },
    ],
  },
  // Nitrógeno Industrial
  [GAS_PRODUCT_IDS.NITROGENO_INDUSTRIAL]: {
    unitOfMeasure: "m³",
    description:
      "El nitrógeno es un gas incoloro, insípido e inodoro que constituye aproximadamente el 78% de la atmósfera terrestre. Desempeña un papel fundamental en atmósferas controladas, conservación de alimentos, refrigeración, industria farmacéutica y fabricación electrónica.",
    containerSizes: [
      {
        id: 401,
        label: "3 m³",
        capacity: 3,
        unit: "m³",
        rentalPricePerFill: 7000,
      },
      {
        id: 402,
        label: "6 m³",
        capacity: 6,
        unit: "m³",
        rentalPricePerFill: 11000,
      },
      {
        id: 403,
        label: "10 m³",
        capacity: 10,
        unit: "m³",
        rentalPricePerFill: 16000,
      },
    ],
  },
  // Acetileno Industrial
  [GAS_PRODUCT_IDS.ACETILENO_INDUSTRIAL]: {
    unitOfMeasure: "kg",
    description:
      "El acetileno es un gas combustible ampliamente utilizado en aplicaciones de soldadura y corte. Combinado con oxígeno, produce una llama de alta temperatura (aprox. 3.200°C) ideal para trabajos de soldadura oxiacetilénica.",
    containerSizes: [
      {
        id: 501,
        label: "3,5 kg",
        capacity: 3.5,
        unit: "kg",
        rentalPricePerFill: 8000,
      },
      {
        id: 502,
        label: "7 kg",
        capacity: 7,
        unit: "kg",
        rentalPricePerFill: 14000,
      },
    ],
  },
  // Oxígeno Medicinal
  [GAS_PRODUCT_IDS.OXIGENO_MEDICINAL]: {
    unitOfMeasure: "m³",
    description:
      "El oxígeno gaseoso medicinal es un gas terapéutico esencial utilizado en una amplia gama de aplicaciones médicas para el tratamiento de pacientes con deficiencias respiratorias y trastornos cardiovasculares. Su alta pureza farmacéutica (mín. 99.5%) cumple con normas de farmacopeas internacionales.",
    containerSizes: [
      {
        id: 601,
        label: "1 m³",
        capacity: 1,
        unit: "m³",
        rentalPricePerFill: 7000,
      },
      {
        id: 602,
        label: "3 m³",
        capacity: 3,
        unit: "m³",
        rentalPricePerFill: 11000,
      },
      {
        id: 603,
        label: "6 m³",
        capacity: 6,
        unit: "m³",
        rentalPricePerFill: 16000,
      },
    ],
  },
  // Mezcla Ar/CO₂
  [GAS_PRODUCT_IDS.MEZCLA_AR_CO2]: {
    unitOfMeasure: "m³",
    description:
      "La mezcla de argón y dióxido de carbono (CO₂) es un gas de soldadura ampliamente utilizado en aplicaciones industriales. Combina las propiedades inertes del argón con la estabilidad y el poder de penetración del CO₂, ideal para soldadura MIG/MAG de acero al carbono.",
    containerSizes: [
      {
        id: 701,
        label: "3 m³",
        capacity: 3,
        unit: "m³",
        rentalPricePerFill: 10000,
      },
      {
        id: 702,
        label: "6 m³",
        capacity: 6,
        unit: "m³",
        rentalPricePerFill: 15000,
      },
      {
        id: 703,
        label: "10 m³",
        capacity: 10,
        unit: "m³",
        rentalPricePerFill: 22000,
      },
    ],
  },
  // Helio
  [GAS_PRODUCT_IDS.HELIO]: {
    unitOfMeasure: "m³",
    description:
      "El helio es un gas inerte y no inflamable con propiedades únicas de baja densidad, alta conductividad térmica y estabilidad química. Se utiliza en refrigeración criogénica, soldadura TIG, detección de fugas, investigación científica y sistemas de resonancia magnética.",
    containerSizes: [
      {
        id: 801,
        label: "3 m³",
        capacity: 3,
        unit: "m³",
        rentalPricePerFill: 12000,
      },
      {
        id: 802,
        label: "6 m³",
        capacity: 6,
        unit: "m³",
        rentalPricePerFill: 18000,
      },
    ],
  },
  [GAS_PRODUCT_IDS.PROPANO]: {
    unitOfMeasure: "kg",
    description:
      "El propano es un gas licuado de petróleo (GLP) altamente versátil y eficiente. Su alta densidad energética, combustión limpia y facilidad de almacenamiento lo convierten en una solución energética ideal para calefacción industrial, soldadura, industria alimentaria y agricultura.",
    containerSizes: [
      {
        id: 101,
        label: "45 kg",
        capacity: 1,
        unit: "m³",
        rentalPricePerFill: 5000,
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Display names for gas products (used by static fallback)
// ---------------------------------------------------------------------------

export const GAS_PRODUCT_NAMES: Record<number, string> = {
  [GAS_PRODUCT_IDS.OXIGENO_INDUSTRIAL]: "Oxígeno Industrial",
  [GAS_PRODUCT_IDS.CO2_INDUSTRIAL]: "CO₂ Industrial",
  [GAS_PRODUCT_IDS.ACETILENO_INDUSTRIAL]: "Acetileno Industrial",
  [GAS_PRODUCT_IDS.ARGON_INDUSTRIAL]: "Argón Industrial",
  [GAS_PRODUCT_IDS.NITROGENO_INDUSTRIAL]: "Nitrógeno Industrial",
  [GAS_PRODUCT_IDS.OXIGENO_MEDICINAL]: "Oxígeno Medicinal",
  [GAS_PRODUCT_IDS.MEZCLA_AR_CO2]: "Mezcla Ar/CO₂",
  [GAS_PRODUCT_IDS.HELIO]: "Helio",
  [GAS_PRODUCT_IDS.PROPANO]: "Propano",
};

// ---------------------------------------------------------------------------
// Static fallback data for when Odoo is unavailable
// ---------------------------------------------------------------------------

export const STATIC_GAS_PRODUCTS: GasProduct[] = Object.entries(
  GAS_PRODUCT_IDS,
).map(([, id]) => {
  const data = GAS_PRODUCT_DATA[id];
  const name = GAS_PRODUCT_NAMES[id];
  return {
    id,
    slug: slugify(name),
    name,
    description: data.description || "",
    type: "gas",
    categoryId: id === GAS_PRODUCT_IDS.OXIGENO_MEDICINAL ? 13 : 2,
    categoryName:
      id === GAS_PRODUCT_IDS.OXIGENO_MEDICINAL
        ? "Gases Medicinales"
        : "Gases Industriales",
    imageUrl: undefined,
    inStock: true,
    sku: `GAS-${id}`,
    pricePerUnit: 0,
    unitOfMeasure: data.unitOfMeasure,
    containerSizes: data.containerSizes,
    purity: data.purity,
    taxRate: 21,
  } satisfies GasProduct;
});

export const STATIC_CATEGORIES: ProductCategory[] = [
  { id: 2, slug: "gases-industriales", name: "Gases Industriales" },
  { id: 13, slug: "gases-medicinales", name: "Gases Medicinales" },
];

// ---------------------------------------------------------------------------
// Pure calculation helpers (used by gas-product-actions.tsx)
// ---------------------------------------------------------------------------

/** Calculate the gas fill cost for a given container size */
export function calculateGasFillPrice(
  product: GasProduct,
  containerSize: ContainerSize,
): number {
  return product.pricePerUnit * containerSize.capacity;
}

/** Calculate total per container (gas fill + optional rental) */
export function calculateContainerTotal(
  product: GasProduct,
  containerSize: ContainerSize,
  ownership: "own" | "rent",
): number {
  const fillCost = calculateGasFillPrice(product, containerSize);
  const rental = ownership === "rent" ? containerSize.rentalPricePerFill : 0;
  return fillCost + rental;
}
