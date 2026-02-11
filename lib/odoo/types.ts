/**
 * TypeScript interfaces for Odoo models
 */

export interface OdooTax {
  id: number;
  name: string;
  amount: number;
  amount_type: string;
  type_tax_use: string;
  company_id: [number, string];
}

export interface OdooProduct {
  id: number;
  name: string;
  display_name: string;
  default_code?: string;
  description?: string;
  description_sale?: string;
  list_price: number;
  standard_price: number;
  categ_id: [number, string];
  product_variant_ids: number[];
  attribute_line_ids: number[];
  image_1920?: string;
  qty_available: number;
  virtual_available: number;
  active: boolean;
  website_published: boolean;
  is_gas?: boolean;
  uom_id?: [number, string];
  taxes_id?: number[];
  website_meta_title?: string;
  website_meta_description?: string;
  website_meta_keywords?: string;
  seo_name?: string;
}

export interface OdooProductVariant {
  id: number;
  name: string;
  display_name: string;
  product_tmpl_id: [number, string];
  default_code?: string;
  list_price: number;
  standard_price: number;
  qty_available: number;
  virtual_available: number;
  image_variant_1920?: string;
  product_template_attribute_value_ids: number[];
  active: boolean;
}

export interface OdooCategory {
  id: number;
  name: string;
  display_name: string;
  complete_name: string;
  parent_id?: [number, string];
  child_id: number[];
  product_count: number;
}

export interface OdooPartner {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  vat?: string;
  street?: string;
  street2?: string;
  city?: string;
  state_id?: [number, string];
  zip?: string;
  country_id?: [number, string];
  is_company: boolean;
  type?: "contact" | "invoice" | "delivery" | "private" | "other";
  parent_id?: [number, string];
  child_ids: number[];
  property_product_pricelist?: [number, string];
  user_ids: number[];
  l10n_ar_afip_responsibility_type_id?: [number, string] | false;
  partner_latitude?: number;
  partner_longitude?: number;
}

export interface OdooSaleOrder {
  id: number;
  name: string;
  partner_id: [number, string];
  partner_invoice_id: [number, string];
  partner_shipping_id: [number, string];
  date_order: string;
  state: "draft" | "sent" | "sale" | "cancel";
  order_line: number[];
  amount_untaxed: number;
  amount_tax: number;
  amount_total: number;
  currency_id: [number, string];
  pricelist_id: [number, string];
  note?: string;
  client_order_ref?: string;
  payment_term_id?: [number, string];
  invoice_status: "no" | "to invoice" | "invoiced";
  invoice_ids: number[];
}

export interface OdooOrderLine {
  id: number;
  order_id: [number, string];
  product_id: [number, string];
  product_uom_qty: number;
  qty_delivered: number;
  price_unit: number;
  price_subtotal: number;
  price_total: number;
  tax_id: number[];
  name: string;
  discount: number;
}

export interface OdooContainer {
  id: number;
  serial_number: string;
  display_name: string;
  owner_customer: [number, string] | false;
  associated_product: [number, string];
  status:
    | "empty"
    | "in_use"
    | "partially_filled"
    | "maintenance"
    | "filling"
    | "full"
    | "in_transit";
  container_type?: "battery" | "dewar" | "cylinder" | "liquid_tank";
  current_product_quantity: number;
  container_capacity: number;
  last_inspection_date: string | false;
  next_inspection_date: string | false;
  owner: "own" | "customer" | "supplier";
  location: "customer" | "supplier" | "in_transit" | "company";
  location_customer: [number, string] | false;
  effective_location: string;
  gas_type: string;
  tare_weight?: number;
}

export interface OdooInvoice {
  id: number;
  name: string;
  move_type: "out_invoice" | "in_invoice" | "out_refund" | "in_refund";
  partner_id: [number, string];
  invoice_date: string;
  invoice_date_due?: string;
  state: "draft" | "posted" | "cancel";
  payment_state: "not_paid" | "in_payment" | "paid" | "partial" | "reversed";
  amount_untaxed: number;
  amount_tax: number;
  amount_total: number;
  amount_residual: number;
  currency_id: [number, string];
  invoice_line_ids: number[];
}

export interface OdooInvoiceLine {
  id: number;
  move_id: [number, string];
  product_id: [number, string] | false;
  name: string;
  quantity: number;
  price_unit: number;
  discount: number;
  price_subtotal: number;
  price_total: number;
  tax_ids: number[];
}

export interface OdooStockPicking {
  id: number;
  name: string;
  origin?: string;
  state: "draft" | "waiting" | "confirmed" | "assigned" | "done" | "cancel";
  scheduled_date: string;
  date_done?: string;
  picking_type_id: [number, string];
}

export interface OdooContainerTransfer {
  id: number;
  name: string;
  transfer_type:
    | "customer_send"
    | "customer_return"
    | "internal"
    | "supplier_receive"
    | "supplier_return";
  state:
    | "draft"
    | "confirmed"
    | "in_transit"
    | "done"
    | "cancelled"
    | "pending_company_signature";
  sale_order_id: [number, string] | false;
  stock_picking_id: [number, string] | false;
  container_line_ids: number[];
  container_count: number;
  scheduled_date: string;
  effective_date: string | false;
  source_effective: string;
  destination_effective: string;
}

export interface OdooContainerTransferLine {
  id: number;
  transfer_id: [number, string];
  container_id: [number, string];
  snapshot_serial_number: string;
  snapshot_product_name: string;
  snapshot_container_type: "cylinder" | "bundle" | "tank" | "dewar" | "other";
  snapshot_status:
    | "available"
    | "in_use"
    | "empty"
    | "maintenance"
    | "in_transit"
    | "full"
    | "retired";
  snapshot_product_quantity: number;
  is_empty: boolean;
}

export interface OdooCompany {
  id: number;
  name: string;
  street?: string;
  city?: string;
  state_id?: [number, string];
  zip?: string;
  phone?: string;
}

export interface OdooRPCRequest {
  jsonrpc: "2.0";
  method: "call";
  params: Record<string, unknown>;
  id: number;
}

export interface OdooRPCResponse<T = unknown> {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: {
      name: string;
      debug: string;
      message: string;
      arguments: string[];
      context: Record<string, unknown>;
    };
  };
}

export interface OdooAuthResponse {
  uid: number;
  username: string;
  company_id: number;
  partner_id: number;
  session_id: string;
  db: string;
}
