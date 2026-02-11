"use client";

import { useState } from "react";
import type { OdooContainer } from "@/lib/odoo/types";
import { CONTAINER_STATUS_LABELS } from "@/lib/utils/constants";
import { StatusBadge } from "./status-badge";

interface PickupRequestModalProps {
  open: boolean;
  containers: OdooContainer[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (notes: string) => void;
}

function getContainerStatusVariant(
  status: OdooContainer["status"],
): "default" | "accent" | "muted" {
  switch (status) {
    case "in_use":
    case "full":
      return "accent";
    case "empty":
    case "maintenance":
      return "muted";
    default:
      return "default";
  }
}

export function PickupRequestModal({
  open,
  containers,
  loading,
  error,
  onClose,
  onSubmit,
}: PickupRequestModalProps) {
  const [notes, setNotes] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(notes);
  }

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
      <div className="relative w-full max-w-lg border-2 border-foreground bg-background md:border-4">
        <div className="max-h-[90vh] overflow-y-auto p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
              Solicitar Retiro
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground"
            >
              Cerrar
            </button>
          </div>

          {/* Container list */}
          <div className="mb-6 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest">
              {containers.length}{" "}
              {containers.length === 1 ? "envase" : "envases"}
            </p>
            <div className="divide-y divide-foreground/10">
              {containers.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <span className="font-mono text-sm font-bold">
                      {c.serial_number || c.display_name}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {c.associated_product[1]}
                    </span>
                  </div>
                  <StatusBadge variant={getContainerStatusVariant(c.status)}>
                    {CONTAINER_STATUS_LABELS[c.status] || c.status}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full resize-none border-b-2 border-foreground bg-transparent px-0 py-2 text-sm focus:border-[#0094BB] focus:outline-none"
                placeholder="Indicaciones especiales para el retiro..."
              />
            </div>

            {/* Error */}
            {error && (
              <p className="mb-4 text-sm font-bold text-red-600">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="border-2 border-foreground bg-foreground px-6 py-2 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB] disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Confirmar Retiro"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="border-2 border-foreground bg-background px-6 py-2 text-sm font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
