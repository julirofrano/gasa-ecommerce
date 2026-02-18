export const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== "false";
export const ODOO_ENABLED = process.env.NEXT_PUBLIC_ODOO_ENABLED !== "false";

export const ACCENT_COLOR = "#0094BB";

export const APP_NAME = "GASA";
export const APP_DESCRIPTION =
  "Gases Aconcagua S.A. - Tienda en línea y portal de clientes";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
  CART: "/cart",
  CHECKOUT: "/checkout",
  CHECKOUT_SUCCESS: "/checkout/success",
  CHECKOUT_FAILURE: "/checkout/failure",
  CHECKOUT_PENDING: "/checkout/pending",
  ACCOUNT_PROFILE: "/profile",
  ACCOUNT_ORDERS: "/orders",
  ACCOUNT_CONTAINERS: "/containers",
  ACCOUNT_INVOICES: "/invoices",
  ACCOUNT_RETURNS: "/returns",
  ABOUT: "/about",
  INDUSTRIES: "/industries",
  SERVICES: "/services",
  SERVICES_GAS_SYSTEMS: "/services/gas-systems",
  SERVICES_GAS_SYSTEMS_INDUSTRIAL: "/services/gas-systems/industrial",
  SERVICES_GAS_SYSTEMS_MEDICAL: "/services/gas-systems/medical",
  SERVICES_HOME_CARE: "/services/home-care",
  SERVICES_ICE_PELLETS: "/services/ice-pellets",
  CONTACT: "/contact",
  ETHICS: "/ethics",
  SEARCH: "/search",
} as const;

export const ITEMS_PER_PAGE = 20;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Presupuesto enviado",
  sale: "Completada",
  cancel: "Cancelada",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
};

export const CONTAINER_STATUS_LABELS: Record<string, string> = {
  empty: "Vacío",
  in_use: "En uso",
  partially_filled: "Parcialmente lleno",
  maintenance: "En mantenimiento",
  filling: "En llenado",
  full: "Lleno",
  in_transit: "En tránsito",
};

export const TRANSFER_STATE_LABELS: Record<string, string> = {
  draft: "Borrador",
  confirmed: "Confirmado",
  in_transit: "En tránsito",
  done: "Completado",
  cancelled: "Cancelado",
  pending_company_signature: "Pendiente firma",
};

export const TRANSFER_TYPE_LABELS: Record<string, string> = {
  customer_send: "Envío a cliente",
  customer_return: "Devolución de cliente",
  internal: "Transferencia interna",
  supplier_receive: "Recepción de proveedor",
  supplier_return: "Devolución a proveedor",
};

export const CONTAINER_TYPE_LABELS: Record<string, string> = {
  cylinder: "Cilindro",
  battery: "Batería",
  liquid_tank: "Tanque",
  dewar: "Dewar",
};

export const SNAPSHOT_STATUS_LABELS: Record<string, string> = {
  available: "Disponible",
  in_use: "En uso",
  empty: "Vacío",
  full: "Lleno",
  maintenance: "En mantenimiento",
  in_transit: "En tránsito",
  retired: "Retirado",
};

export const INVOICE_STATE_LABELS: Record<string, string> = {
  draft: "Borrador",
  posted: "Publicada",
  cancel: "Cancelada",
};

export const INVOICE_PAYMENT_STATE_LABELS: Record<string, string> = {
  not_paid: "No pagada",
  in_payment: "En proceso de pago",
  paid: "Pagada",
  partial: "Pago parcial",
  reversed: "Revertida",
};

export const INVOICE_TYPE_LABELS: Record<string, string> = {
  out_invoice: "Factura",
  out_refund: "Nota de crédito",
  in_invoice: "Factura proveedor",
  in_refund: "Nota de crédito proveedor",
};
