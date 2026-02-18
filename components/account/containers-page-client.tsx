"use client";

import { useState, useTransition } from "react";
import type { OdooContainer } from "@/lib/odoo/types";
import { requestPickupAction } from "@/app/(account)/containers/actions";
import { ContainerCard } from "./container-card";
import { PickupToolbar } from "./pickup-toolbar";
import { PickupRequestModal } from "./pickup-request-modal";

const SELECTABLE_STATUSES = new Set<OdooContainer["status"]>([
  "empty",
  "in_use",
  "full",
  "partially_filled",
]);

interface ContainersPageClientProps {
  owned: OdooContainer[];
  inPossession: OdooContainer[];
}

export function ContainersPageClient({
  owned,
  inPossession,
}: ContainersPageClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function openModal() {
    setError(null);
    setShowModal(true);
  }

  function closeModal() {
    if (!isPending) {
      setShowModal(false);
      setError(null);
    }
  }

  function handleSubmit(notes: string) {
    startTransition(async () => {
      const result = await requestPickupAction(
        [...selectedIds],
        notes || undefined,
      );
      if (result.success) {
        setSelectedIds(new Set());
        setShowModal(false);
        setError(null);
      } else {
        setError(result.error || "Error desconocido.");
      }
    });
  }

  // Collect all containers that are currently selected (from both lists)
  const allContainers = [...owned, ...inPossession];
  const selectedContainers = allContainers.filter((c) => selectedIds.has(c.id));

  return (
    <>
      {/* Owned Containers */}
      {owned.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">
            Envases Propios
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {owned.map((container) => {
              const isSelectable = SELECTABLE_STATUSES.has(container.status);
              return (
                <ContainerCard
                  key={container.id}
                  container={container}
                  ownership="owned"
                  selectable={isSelectable}
                  selected={selectedIds.has(container.id)}
                  onToggleSelect={toggleSelect}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* In-Possession (Comodato) Containers */}
      {inPossession.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">
            Envases en Comodato
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inPossession.map((container) => {
              const isSelectable = SELECTABLE_STATUSES.has(container.status);
              return (
                <ContainerCard
                  key={container.id}
                  container={container}
                  ownership="possession"
                  selectable={isSelectable}
                  selected={selectedIds.has(container.id)}
                  onToggleSelect={toggleSelect}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Sticky bottom toolbar */}
      <PickupToolbar
        count={selectedIds.size}
        onClear={clearSelection}
        onRequestPickup={openModal}
      />

      {/* Confirmation modal */}
      <PickupRequestModal
        open={showModal}
        containers={selectedContainers}
        loading={isPending}
        error={error}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}
