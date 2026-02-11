"use client";

import { useState } from "react";
import type { OdooPartner } from "@/lib/odoo/types";
import { AddressCard } from "./address-card";
import { AddressFormModal } from "./address-form-modal";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  convertAddressType,
  setMainAddress,
} from "@/app/(account)/profile/actions";

interface ParentAddress {
  street?: string;
  city?: string;
  zip?: string;
}

interface AddressSectionProps {
  number: string;
  title: string;
  type: "delivery" | "invoice";
  addresses: OdooPartner[];
  emptyMessage: string;
  parentAddress: ParentAddress;
}

function isMainAddress(addr: OdooPartner, parent: ParentAddress): boolean {
  return (
    !!addr.street &&
    addr.street === parent.street &&
    addr.city === parent.city &&
    addr.zip === parent.zip
  );
}

export function AddressSection({
  number,
  title,
  type,
  addresses,
  emptyMessage,
  parentAddress,
}: AddressSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<OdooPartner | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    setEditingAddress(null);
    setError(null);
    setModalOpen(true);
  }

  function handleEdit(address: OdooPartner) {
    setEditingAddress(address);
    setError(null);
    setModalOpen(true);
  }

  async function handleSetMain(addressId: number) {
    setError(null);
    const result = await setMainAddress(addressId);
    if (!result.success) {
      setError(result.error || "Error al establecer principal.");
    }
  }

  async function handleConvert(addressId: number) {
    const targetType = type === "delivery" ? "invoice" : "delivery";
    setError(null);
    const result = await convertAddressType(addressId, targetType);
    if (!result.success) {
      setError(result.error || "Error al convertir.");
    }
  }

  async function handleDelete(addressId: number) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    setError(null);
    const result = await deleteAddress(addressId);
    if (!result.success) {
      setError(result.error || "Error al eliminar.");
    }
  }

  async function handleSubmit(data: {
    name: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  }) {
    setLoading(true);
    setError(null);

    const payload = {
      name: data.name,
      street: data.street,
      street2: data.street2 || undefined,
      city: data.city,
      zip: data.zip,
      phone: data.phone || undefined,
      state: data.state || undefined,
    };

    const result = editingAddress
      ? await updateAddress(editingAddress.id, payload)
      : await createAddress(type, payload);

    setLoading(false);

    if (result.success) {
      setModalOpen(false);
      setEditingAddress(null);
    } else {
      setError(result.error || "Error al guardar.");
    }
  }

  return (
    <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            {number}
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-xs font-bold uppercase tracking-wide text-[#0094BB] hover:text-foreground"
        >
          + Agregar Direccion
        </button>
      </div>

      {error && <p className="mb-4 text-sm font-bold text-red-600">{error}</p>}

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              type={type}
              isMain={isMainAddress(addr, parentAddress)}
              onEdit={() => handleEdit(addr)}
              onDelete={() => handleDelete(addr.id)}
              onConvert={() => handleConvert(addr.id)}
              onSetMain={() => handleSetMain(addr.id)}
            />
          ))}
        </div>
      )}

      <AddressFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={handleSubmit}
        address={editingAddress}
        loading={loading}
      />
    </section>
  );
}
