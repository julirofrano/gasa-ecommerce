"use client";

import { useState } from "react";
import type { OdooPartner } from "@/lib/odoo/types";

interface ProfileFormProps {
  partner: OdooPartner;
}

export function ProfileForm({ partner }: ProfileFormProps) {
  const [email, setEmail] = useState(partner.email || "");
  const [phone, setPhone] = useState(partner.phone || "");
  const [saved, setSaved] = useState(false);

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
          Correo Electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-b-2 border-foreground bg-transparent px-0 py-2 text-sm focus:border-[#0094BB] focus:outline-none"
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
          className="w-full border-b-2 border-foreground bg-transparent px-0 py-2 text-sm focus:border-[#0094BB] focus:outline-none"
        />
      </div>
      <div className="flex items-end md:col-span-2">
        <button
          type="submit"
          className="border-2 border-foreground bg-foreground px-6 py-2 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]"
        >
          Guardar Cambios
        </button>
        {saved && (
          <span className="ml-4 text-sm font-bold text-[#0094BB]">
            Cambios guardados
          </span>
        )}
      </div>
    </form>
  );
}
