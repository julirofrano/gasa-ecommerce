"use client";

import { useState } from "react";
import type { OdooPartner } from "@/lib/odoo/types";
import { createContact, updateContact } from "@/app/(account)/profile/actions";

interface ContactsSectionProps {
  number: string;
  contacts: OdooPartner[];
}

const emptyForm = { name: "", position: "", email: "", phone: "" };

export function ContactsSection({ number, contacts }: ContactsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function handleAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function handleEdit(contact: OdooPartner) {
    setEditingId(contact.id);
    setForm({
      name: contact.name || "",
      position: contact.function || "",
      email: contact.email || "",
      phone: contact.phone || "",
    });
    setError(null);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: form.name,
      function: form.position || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
    };

    const result = editingId
      ? await updateContact(editingId, payload)
      : await createContact(payload);

    setLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error || "Error al guardar el contacto.");
    }
  }

  const isEdit = editingId !== null;

  return (
    <section className="border-2 border-foreground p-6 md:border-4 md:p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            {number}
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent">
            Contactos de la Empresa
          </h2>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-xs font-bold uppercase tracking-wide text-accent hover:text-foreground"
        >
          + Agregar Contacto
        </button>
      </div>

      {error && !modalOpen && (
        <p className="mb-4 text-sm font-bold text-red-600">{error}</p>
      )}

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay otros contactos registrados.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="border-2 border-foreground p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold">{contact.name}</p>
                  {contact.function && (
                    <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-accent">
                      {contact.function}
                    </p>
                  )}
                </div>
                {contact.user_ids?.length > 0 && (
                  <span className="shrink-0 bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-background">
                    Portal
                  </span>
                )}
              </div>
              {contact.email && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {contact.email}
                </p>
              )}
              {contact.phone && (
                <p className="text-xs text-muted-foreground">{contact.phone}</p>
              )}
              <button
                type="button"
                onClick={() => handleEdit(contact)}
                className="mt-2 text-xs font-bold uppercase tracking-wide text-accent hover:text-foreground"
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-foreground/50"
            onClick={handleClose}
            onKeyDown={(e) => e.key === "Escape" && handleClose()}
            role="button"
            tabIndex={-1}
            aria-label="Cerrar"
          />

          <div className="relative w-full max-w-lg border-2 border-foreground bg-background p-6 md:border-4 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-accent">
                {isEdit ? "Editar Contacto" : "Nuevo Contacto"}
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                Cerrar
              </button>
            </div>

            {error && (
              <p className="mb-4 text-sm font-bold text-red-600">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    className="w-full border-b-2 border-foreground bg-transparent px-0 py-2 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, position: e.target.value }))
                    }
                    placeholder="Ej: Gerente de Compras"
                    className="w-full border-b-2 border-foreground bg-transparent px-0 py-2 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest">
                    Correo Electronico
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full border-b-2 border-foreground bg-transparent px-0 py-2 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="w-full border-b-2 border-foreground bg-transparent px-0 py-2 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
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
                  onClick={handleClose}
                  className="border-2 border-foreground bg-background px-6 py-2 text-sm font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
