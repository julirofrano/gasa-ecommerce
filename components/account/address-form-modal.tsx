"use client";

import { useState, useEffect } from "react";
import type { OdooPartner } from "@/lib/odoo/types";

interface AddressFormData {
  name: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => Promise<void>;
  address?: OdooPartner | null;
  loading?: boolean;
}

const emptyForm: AddressFormData = {
  name: "",
  street: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
};

export function AddressFormModal({
  open,
  onClose,
  onSubmit,
  address,
  loading,
}: AddressFormModalProps) {
  const [form, setForm] = useState<AddressFormData>(emptyForm);

  useEffect(() => {
    if (address) {
      setForm({
        name: address.name || "",
        street: address.street || "",
        street2: address.street2 || "",
        city: address.city || "",
        state: address.state_id?.[1] || "",
        zip: address.zip || "",
        phone: address.phone || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [address]);

  if (!open) return null;

  function handleChange(field: keyof AddressFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  const isEdit = !!address;
  const title = isEdit ? "Editar Direccion" : "Nueva Direccion";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg border-2 border-foreground bg-background p-6 md:border-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-accent">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Nombre / Referencia"
            value={form.name}
            onChange={(v) => handleChange("name", v)}
            required
          />
          <Field
            label="Calle"
            value={form.street}
            onChange={(v) => handleChange("street", v)}
            required
          />
          <Field
            label="Calle 2 / Piso / Depto"
            value={form.street2}
            onChange={(v) => handleChange("street2", v)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Ciudad"
              value={form.city}
              onChange={(v) => handleChange("city", v)}
              required
            />
            <Field
              label="Provincia"
              value={form.state}
              onChange={(v) => handleChange("state", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Codigo Postal"
              value={form.zip}
              onChange={(v) => handleChange("zip", v)}
              required
            />
            <Field
              label="Telefono"
              value={form.phone}
              onChange={(v) => handleChange("phone", v)}
              type="tel"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="border-2 border-foreground bg-foreground px-6 py-2 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-foreground bg-background px-6 py-2 text-sm font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-widest">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border-b-2 border-foreground bg-transparent px-0 py-2 text-sm focus:border-accent focus:outline-none"
      />
    </div>
  );
}
