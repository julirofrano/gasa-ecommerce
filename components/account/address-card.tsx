"use client";

import { useState } from "react";
import type { OdooPartner } from "@/lib/odoo/types";
import { AddressMapWrapper } from "./address-map-wrapper";

interface AddressCardProps {
  address: OdooPartner;
  type: "delivery" | "invoice";
  isMain: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onConvert: () => void;
  onSetMain: () => void;
}

export function AddressCard({
  address,
  type,
  isMain,
  onEdit,
  onDelete,
  onConvert,
  onSetMain,
}: AddressCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const convertLabel =
    type === "delivery" ? "Copiar a Facturacion" : "Copiar a Envio";
  return (
    <div
      className={`border-2 p-4 ${isMain ? "border-[#0094BB]" : "border-foreground/20"}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <p className="text-sm font-bold">{address.name}</p>
        {isMain && (
          <span className="bg-[#0094BB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            Principal
          </span>
        )}
      </div>
      <div className="mb-3 text-sm text-muted-foreground">
        <p>{address.street}</p>
        {address.street2 && <p>{address.street2}</p>}
        <p>
          {address.city}
          {address.state_id && `, ${address.state_id[1]}`}
          {address.zip && ` (${address.zip})`}
        </p>
        {address.phone && <p>{address.phone}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-bold uppercase tracking-wide text-[#0094BB] hover:text-foreground"
        >
          Editar
        </button>
        <AddressMapWrapper
          partnerId={address.id}
          street={address.street}
          city={address.city}
          state={address.state_id?.[1]}
          zip={address.zip}
          country={address.country_id?.[1]}
          savedLat={address.partner_latitude}
          savedLng={address.partner_longitude}
        />
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="px-1 text-sm font-bold tracking-wide text-muted-foreground hover:text-foreground"
            aria-label="Mas opciones"
          >
            ...
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
                onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
                role="button"
                tabIndex={-1}
                aria-label="Cerrar menu"
              />
              <div className="absolute right-0 bottom-full z-50 mb-1 border-2 border-foreground bg-background">
                {!isMain && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onSetMain();
                    }}
                    className="block w-full whitespace-nowrap px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-foreground hover:bg-foreground hover:text-background"
                  >
                    Marcar Principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onConvert();
                  }}
                  className="block w-full whitespace-nowrap px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-foreground hover:bg-foreground hover:text-background"
                >
                  {convertLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="block w-full whitespace-nowrap px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-red-600 hover:bg-red-600 hover:text-white"
                >
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
