"use client";

import type { Branch, CartItem, DeliveryMethod } from "@/types";
import {
  classifyCartItems,
  getAvailableDeliveryMethods,
  getDeliveryMethodLabel,
  getDeliveryCostLabel,
  isInOwnDeliveryZone,
} from "@/lib/data/delivery";

const labelClass = "mb-2 block text-xs font-bold uppercase tracking-widest";
const inputClass =
  "w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm focus:border-[#0094BB] focus:outline-none";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeliverySelection {
  /** Primary delivery method (for gas/hazmat items, or the only method for pure carts) */
  deliveryMethod: DeliveryMethod;
  deliveryBranchId?: number;
  /** For mixed carts: delivery method for carrier-eligible (supply) items */
  carrierDeliveryMethod?: DeliveryMethod;
  carrierDeliveryBranchId?: number;
}

interface DeliverySelectorProps {
  items: CartItem[];
  branches: Branch[];
  zipCode: string;
  selection: DeliverySelection | null;
  onChange: (selection: DeliverySelection) => void;
  errors?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MethodOption({
  method,
  selected,
  disabled,
  disabledMessage,
  name,
  onChange,
}: {
  method: DeliveryMethod;
  selected: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  name: string;
  onChange: (method: DeliveryMethod) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 border-2 border-foreground px-4 py-3 transition-colors duration-200 ${
        selected
          ? "bg-foreground text-background"
          : "bg-background hover:bg-muted"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <input
        type="radio"
        name={name}
        value={method}
        checked={selected}
        disabled={disabled}
        onChange={() => onChange(method)}
        className="mt-0.5 h-4 w-4 accent-[#0094BB]"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">
            {getDeliveryMethodLabel(method)}
          </span>
          <span
            className={`text-sm ${selected ? "text-background/70" : "text-muted-foreground"}`}
          >
            {getDeliveryCostLabel(method)}
          </span>
        </div>
        {disabled && disabledMessage && (
          <p
            className={`mt-1 text-xs ${selected ? "text-background/50" : "text-muted-foreground"}`}
          >
            {disabledMessage}
          </p>
        )}
      </div>
    </label>
  );
}

function BranchSelector({
  branches,
  selectedBranchId,
  onChange,
}: {
  branches: Branch[];
  selectedBranchId?: number;
  onChange: (branchId: number) => void;
}) {
  return (
    <div className="ml-7 mt-3">
      <label htmlFor="branch-select" className={labelClass}>
        Sucursal
      </label>
      <select
        id="branch-select"
        value={selectedBranchId ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputClass}
      >
        <option value="">Seleccionar sucursal...</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name} — {branch.address}, {branch.city}
          </option>
        ))}
      </select>
    </div>
  );
}

function ItemList({ items, label }: { items: CartItem[]; label: string }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#0094BB]">
        {label}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DeliverySelector({
  items,
  branches,
  zipCode,
  selection,
  onChange,
  errors,
}: DeliverySelectorProps) {
  const { ownDelivery, carrierDelivery } = classifyCartItems(items);
  const { gasHazmatMethods, supplyMethods, isMixedCart } =
    getAvailableDeliveryMethods(items, zipCode);
  const inZone = isInOwnDeliveryZone(zipCode);

  // Pure gas/hazmat cart
  if (ownDelivery.length > 0 && carrierDelivery.length === 0) {
    return (
      <div className="space-y-3">
        {!inZone && zipCode.length >= 4 && (
          <p className="text-xs text-muted-foreground">
            Tu código postal no está en nuestra zona de entrega directa.
          </p>
        )}
        <MethodOption
          method="own_delivery"
          name="delivery-method"
          selected={selection?.deliveryMethod === "own_delivery"}
          disabled={!inZone}
          disabledMessage="No disponible para tu zona. Retirá en nuestras sucursales."
          onChange={(method) => onChange({ deliveryMethod: method })}
        />
        <MethodOption
          method="branch_pickup"
          name="delivery-method"
          selected={selection?.deliveryMethod === "branch_pickup"}
          onChange={(method) =>
            onChange({
              deliveryMethod: method,
              deliveryBranchId: selection?.deliveryBranchId,
            })
          }
        />
        {selection?.deliveryMethod === "branch_pickup" && (
          <BranchSelector
            branches={branches}
            selectedBranchId={selection.deliveryBranchId}
            onChange={(branchId) =>
              onChange({ ...selection, deliveryBranchId: branchId })
            }
          />
        )}
        {errors?.deliveryMethod && (
          <p className="mt-1 text-xs text-red-600">{errors.deliveryMethod}</p>
        )}
        {errors?.deliveryBranchId && (
          <p className="mt-1 text-xs text-red-600">{errors.deliveryBranchId}</p>
        )}
      </div>
    );
  }

  // Pure supply cart
  if (carrierDelivery.length > 0 && ownDelivery.length === 0) {
    const methods =
      supplyMethods.length > 0
        ? supplyMethods
        : (["carrier_delivery", "branch_pickup"] as DeliveryMethod[]);
    return (
      <div className="space-y-3">
        {methods.map((method) => (
          <MethodOption
            key={method}
            method={method}
            name="delivery-method"
            selected={selection?.deliveryMethod === method}
            onChange={(m) =>
              onChange({
                deliveryMethod: m,
                deliveryBranchId:
                  m === "branch_pickup"
                    ? selection?.deliveryBranchId
                    : undefined,
              })
            }
          />
        ))}
        {selection?.deliveryMethod === "branch_pickup" && (
          <BranchSelector
            branches={branches}
            selectedBranchId={selection.deliveryBranchId}
            onChange={(branchId) =>
              onChange({ ...selection, deliveryBranchId: branchId })
            }
          />
        )}
        {errors?.deliveryMethod && (
          <p className="mt-1 text-xs text-red-600">{errors.deliveryMethod}</p>
        )}
        {errors?.deliveryBranchId && (
          <p className="mt-1 text-xs text-red-600">{errors.deliveryBranchId}</p>
        )}
      </div>
    );
  }

  // Mixed cart
  if (isMixedCart) {
    const sameDelivery =
      selection?.deliveryMethod === "own_delivery" &&
      selection?.carrierDeliveryMethod === "own_delivery";

    return (
      <div className="space-y-6">
        <div className="border-b-2 border-foreground pb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {sameDelivery
              ? "Envío combinado — Entrega GASA"
              : "Este pedido se enviará en 2 envíos"}
          </p>
        </div>

        {/* Shipment 1: Gas / Hazmat */}
        <div>
          <ItemList
            items={ownDelivery}
            label="Envío 1 — Gases y Materiales Especiales"
          />
          <div className="space-y-3">
            {!inZone && zipCode.length >= 4 && (
              <p className="text-xs text-muted-foreground">
                Tu código postal no está en nuestra zona de entrega directa.
              </p>
            )}
            <MethodOption
              method="own_delivery"
              name="gas-delivery-method"
              selected={selection?.deliveryMethod === "own_delivery"}
              disabled={!inZone}
              disabledMessage="No disponible para tu zona. Retirá en nuestras sucursales."
              onChange={(method) =>
                onChange({
                  ...selection!,
                  deliveryMethod: method,
                })
              }
            />
            <MethodOption
              method="branch_pickup"
              name="gas-delivery-method"
              selected={selection?.deliveryMethod === "branch_pickup"}
              onChange={(method) =>
                onChange({
                  ...selection!,
                  deliveryMethod: method,
                  deliveryBranchId: selection?.deliveryBranchId,
                })
              }
            />
            {selection?.deliveryMethod === "branch_pickup" && (
              <BranchSelector
                branches={branches}
                selectedBranchId={selection.deliveryBranchId}
                onChange={(branchId) =>
                  onChange({ ...selection, deliveryBranchId: branchId })
                }
              />
            )}
          </div>
          {errors?.deliveryMethod && (
            <p className="mt-1 text-xs text-red-600">{errors.deliveryMethod}</p>
          )}
          {errors?.deliveryBranchId && (
            <p className="mt-1 text-xs text-red-600">
              {errors.deliveryBranchId}
            </p>
          )}
        </div>

        {/* Shipment 2: Supplies */}
        <div>
          <ItemList
            items={carrierDelivery}
            label="Envío 2 — Insumos Industriales"
          />
          <div className="space-y-3">
            {supplyMethods.map((method) => (
              <MethodOption
                key={method}
                method={method}
                name="supply-delivery-method"
                selected={
                  selection?.carrierDeliveryMethod === method ||
                  (!selection?.carrierDeliveryMethod &&
                    method === supplyMethods[0])
                }
                onChange={(m) =>
                  onChange({
                    ...selection!,
                    carrierDeliveryMethod: m,
                    carrierDeliveryBranchId:
                      m === "branch_pickup"
                        ? selection?.carrierDeliveryBranchId
                        : undefined,
                  })
                }
              />
            ))}
            {selection?.carrierDeliveryMethod === "branch_pickup" && (
              <BranchSelector
                branches={branches}
                selectedBranchId={selection?.carrierDeliveryBranchId}
                onChange={(branchId) =>
                  onChange({
                    ...selection!,
                    carrierDeliveryBranchId: branchId,
                  })
                }
              />
            )}
          </div>
          {errors?.carrierDeliveryMethod && (
            <p className="mt-1 text-xs text-red-600">
              {errors.carrierDeliveryMethod}
            </p>
          )}
          {errors?.carrierDeliveryBranchId && (
            <p className="mt-1 text-xs text-red-600">
              {errors.carrierDeliveryBranchId}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
