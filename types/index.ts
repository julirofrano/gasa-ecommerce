// ---------------------------------------------------------------------------
// Product types
// ---------------------------------------------------------------------------

export type ProductType = "gas" | "supply" | "hazmat";
export type ContainerOwnership = "own" | "rent";

/** A container/cylinder size option for gas products */
export interface ContainerSize {
  id: number;
  label: string; // e.g. "10 m³", "45 kg"
  capacity: number;
  unit: string; // m³, kg, L
  /** Per-fill rental cost when the customer does not own a container */
  rentalPricePerFill: number;
}

/** Variant for non-gas (supply) products – e.g. different sizes or models */
export interface SupplyVariant {
  id: number;
  label: string;
  price: number;
  sku?: string;
}

/** Product category */
export interface ProductCategory {
  id: number;
  slug: string;
  name: string;
  parentId?: number;
}

/** Gas product — priced per unit of measure, requires container selection */
export interface GasProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  type: "gas";
  categoryId: number;
  categoryName: string;
  imageUrl?: string;
  inStock: boolean;
  sku: string;
  /** Price per unit of measure (e.g. $/m³) */
  pricePerUnit: number;
  /** m³, kg, L */
  unitOfMeasure: string;
  /** Available cylinder/container sizes */
  containerSizes: ContainerSize[];
  /** e.g. "99.5%", "99.999%" */
  purity?: string;
  /** Tax rate percentage (e.g. 21, 10.5). Fetched from Odoo taxes_id. */
  taxRate: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

/** Non-gas product — fixed price, optional variants */
export interface SupplyProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  type: "supply";
  categoryId: number;
  categoryName: string;
  imageUrl?: string;
  inStock: boolean;
  sku: string;
  price: number;
  brand?: string;
  variants?: SupplyVariant[];
  /** Tax rate percentage (e.g. 21, 10.5). Fetched from Odoo taxes_id. */
  taxRate: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export type Product = GasProduct | SupplyProduct;

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export interface CartItem {
  /** Unique key for this line item (e.g. "101" or "301-rent") */
  cartKey: string;
  id: number;
  productId: number;
  variantId?: number;
  name: string;
  slug: string;
  /** Unit price — for gas products this is the gas fill cost per container */
  price: number;
  quantity: number;
  imageUrl?: string;
  attributes?: Record<string, string>;
  /** Tax rate percentage — optional for backward compatibility with localStorage */
  taxRate?: number;
  // Gas-specific ----------------------------------------------------------
  productType?: ProductType;
  containerOwnership?: ContainerOwnership;
  /** Per-container rental surcharge (only when containerOwnership === "rent") */
  rentalPrice?: number;
  /** Container capacity in product UoM (kg, m³, L). Used to calculate Odoo qty. */
  containerCapacity?: number;
  /** Odoo gas.container ID — set when adding a specific container for refill */
  containerId?: number;
}

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------

export type DeliveryMethod =
  | "branch_pickup"
  | "own_delivery"
  | "carrier_delivery";

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

// ---------------------------------------------------------------------------
// Checkout & orders
// ---------------------------------------------------------------------------

export type CondicionIva =
  | "responsable_inscripto"
  | "monotributo"
  | "exento"
  | "consumidor_final";

export interface CheckoutData {
  email: string;
  phone: string;
  name: string;
  vat: string;
  condicionIva: CondicionIva;
  companyName?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  deliveryMethod: DeliveryMethod;
  deliveryBranchId?: number;
  deliveryCost: number;
  /** For mixed carts: delivery method for carrier-eligible items */
  carrierDeliveryMethod?: DeliveryMethod;
  carrierDeliveryBranchId?: number;
  /** Existing partner ID — skip partner creation when set */
  existingPartnerId?: number;
  /** Parent company ID — used as the order partner */
  existingCompanyId?: number;
  /** Saved shipping address ID — skip address creation when set */
  shippingAddressId?: number;
  /** Saved billing address ID */
  billingAddressId?: number;
  /** Signal server to save CUIT/CUIL to commercial partner (field was not prefilled) */
  saveVat?: boolean;
  /** Signal server to save condición IVA to commercial partner (field was not prefilled) */
  saveCondicionIva?: boolean;
}

/** A saved address for use in the checkout address selector */
export interface CheckoutAddress {
  id: number;
  name: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  stateId?: number;
  zipCode: string;
  country: string;
  countryId?: number;
  phone?: string;
  lat?: number;
  lng?: number;
}

/** Prefill data fetched server-side for logged-in users */
export interface CheckoutPrefillData {
  partnerId: number;
  companyId: number;
  email: string;
  phone: string;
  name: string;
  vat: string;
  condicionIva: CondicionIva | "";
  companyName: string;
  mainAddress: CheckoutAddress | null;
  deliveryAddresses: CheckoutAddress[];
  invoiceAddresses: CheckoutAddress[];
}

export interface Address {
  id?: number;
  name: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

export type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled";
export type OrderStatus = "draft" | "sent" | "sale" | "cancel";
