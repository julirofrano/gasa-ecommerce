"use client";

import type { CheckoutAddress } from "@/types";
import { AddressMapWrapper } from "@/components/account/address-map-wrapper";

interface AddressSelectorProps {
  addresses: CheckoutAddress[];
  mainAddress: CheckoutAddress | null;
  selectedId: number | "new";
  onChange: (id: number | "new") => void;
  name: string;
}

export function AddressSelector({
  addresses,
  mainAddress,
  selectedId,
  onChange,
  name,
}: AddressSelectorProps) {
  // Build the list: main address first (if it has street data), then saved addresses
  const options: (CheckoutAddress & { isMain?: boolean })[] = [];

  if (mainAddress?.street) {
    options.push({ ...mainAddress, isMain: true });
  }

  for (const addr of addresses) {
    // Skip if same as main address
    if (mainAddress && addr.id === mainAddress.id) continue;
    options.push(addr);
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {options.map((addr) => {
        const selected = selectedId === addr.id;
        return (
          <div key={addr.id}>
            <label
              className={`flex cursor-pointer items-start gap-3 border-2 border-foreground p-4 transition-colors duration-200 ${
                selected
                  ? "bg-foreground text-background"
                  : "bg-background hover:bg-muted"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={addr.id}
                checked={selected}
                onChange={() => onChange(addr.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold">
                    {addr.name}
                  </span>
                  {(addr as { isMain?: boolean }).isMain && (
                    <span
                      className={`shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                        selected
                          ? "bg-background text-foreground"
                          : "bg-foreground text-background"
                      }`}
                    >
                      Principal
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 text-xs ${selected ? "text-background/70" : "text-muted-foreground"}`}
                >
                  {addr.street}
                  {addr.street2 ? `, ${addr.street2}` : ""}
                </p>
                <p
                  className={`text-xs ${selected ? "text-background/70" : "text-muted-foreground"}`}
                >
                  {addr.city}
                  {addr.state ? `, ${addr.state}` : ""}
                  {addr.zipCode ? ` (${addr.zipCode})` : ""}
                </p>
                {selected && (
                  <div className="mt-2">
                    <AddressMapWrapper
                      partnerId={addr.id}
                      street={addr.street}
                      city={addr.city}
                      state={addr.state}
                      zip={addr.zipCode}
                      country={addr.country}
                      savedLat={addr.lat}
                      savedLng={addr.lng}
                    />
                  </div>
                )}
              </div>
            </label>
          </div>
        );
      })}

      {/* New address option */}
      <label
        className={`flex cursor-pointer items-center gap-3 border-2 border-dashed border-foreground p-4 transition-colors duration-200 ${
          selectedId === "new"
            ? "bg-foreground text-background"
            : "bg-background hover:bg-muted"
        }`}
      >
        <input
          type="radio"
          name={name}
          value="new"
          checked={selectedId === "new"}
          onChange={() => onChange("new")}
          className="h-4 w-4 shrink-0 accent-accent"
        />
        <span className="text-sm font-bold">+ Nueva direccion</span>
      </label>
    </div>
  );
}
