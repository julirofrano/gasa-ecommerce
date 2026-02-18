"use client";

import { useState } from "react";
import type { OdooPartner } from "@/lib/odoo/types";

interface ProfileFormProps {
  partner: OdooPartner;
  isParticular?: boolean;
}

export function ProfileForm({ partner, isParticular }: ProfileFormProps) {
  const [name, setName] = useState(partner.name || "");
  const [position, setPosition] = useState(partner.function || "");
  const [email, setEmail] = useState(partner.email || "");
  const [phone, setPhone] = useState(partner.phone || "");
  const [saved, setSaved] = useState(false);

  const hasChanges =
    name !== (partner.name || "") ||
    position !== (partner.function || "") ||
    email !== (partner.email || "") ||
    phone !== (partner.phone || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Mock save
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest">
          Nombre
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border-b-2 border-foreground bg-transparent px-0 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      {!isParticular && (
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest">
            Cargo
          </label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Ej: Gerente de Compras"
            className="w-full border-b-2 border-foreground bg-transparent px-0 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest">
          Correo Electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-b-2 border-foreground bg-transparent px-0 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest">
          Teléfono
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border-b-2 border-foreground bg-transparent px-0 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      {(hasChanges || saved) && (
        <div className="flex items-end md:col-span-2">
          {hasChanges && (
            <button
              type="submit"
              className="border-2 border-foreground bg-foreground px-6 py-2 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent"
            >
              Guardar Cambios
            </button>
          )}
          {saved && (
            <span
              className={`text-sm font-bold text-accent ${hasChanges ? "ml-4" : ""}`}
            >
              Cambios guardados
            </span>
          )}
        </div>
      )}
    </form>
  );
}
