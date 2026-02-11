import type { OdooPartner } from "@/lib/odoo/types";

export interface MockPartnerData {
  partner: OdooPartner;
  shippingAddresses: OdooPartner[];
}

const MOCK_PARTNERS: Record<number, MockPartnerData> = {
  42: {
    partner: {
      id: 42,
      name: "Metalúrgica Cuyo S.R.L.",
      email: "admin@metalurgicacuyo.com.ar",
      phone: "(261) 429-8800",
      vat: "30-71456892-3",
      street: "Ruta Provincial 84 Km 5.5",
      street2: "Parque Industrial",
      city: "Luján de Cuyo",
      state_id: [10, "Mendoza"],
      zip: "5507",
      country_id: [10, "Argentina"],
      is_company: true,
      child_ids: [101, 102],
      user_ids: [1],
      property_product_pricelist: [1, "Lista Industrial B2B"],
    },
    shippingAddresses: [
      {
        id: 101,
        name: "Planta Principal — Luján de Cuyo",
        street: "Ruta Provincial 84 Km 5.5",
        street2: "Parque Industrial, Nave 12",
        city: "Luján de Cuyo",
        state_id: [10, "Mendoza"],
        zip: "5507",
        country_id: [10, "Argentina"],
        is_company: false,
        parent_id: [42, "Metalúrgica Cuyo S.R.L."],
        child_ids: [],
        user_ids: [],
      },
      {
        id: 102,
        name: "Depósito — Godoy Cruz",
        street: "Calle Balcarce 1540",
        city: "Godoy Cruz",
        state_id: [10, "Mendoza"],
        zip: "5501",
        country_id: [10, "Argentina"],
        is_company: false,
        parent_id: [42, "Metalúrgica Cuyo S.R.L."],
        child_ids: [],
        user_ids: [],
      },
    ],
  },
};

export function getMockPartner(partnerId: number): MockPartnerData | undefined {
  return MOCK_PARTNERS[partnerId];
}
