"use client";

import Link from "next/link";
import type { OdooContainer } from "@/lib/odoo/types";
import { CONTAINER_STATUS_LABELS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/formatting";
import { StatusBadge } from "./status-badge";
import { MarkEmptyButton } from "./mark-empty-button";

const NON_EMPTY_MARKABLE_STATUSES = new Set<OdooContainer["status"]>([
  "in_use",
  "full",
  "partially_filled",
]);

interface ContainerCardProps {
  container: OdooContainer;
  ownership?: "owned" | "possession";
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: number) => void;
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

function CardContent({
  container,
  ownership,
}: {
  container: OdooContainer;
  ownership?: "owned" | "possession";
}) {
  const gasType = container.associated_product[1];

  return (
    <>
      <div className="mb-3 flex items-start justify-between">
        <span className="font-mono text-sm font-bold">
          {container.serial_number || container.display_name}
        </span>
        <StatusBadge
          variant={getContainerStatusVariant(container.status)}
          className="transition-colors duration-200 group-hover:bg-background group-hover:text-accent"
        >
          {CONTAINER_STATUS_LABELS[container.status] || container.status}
        </StatusBadge>
      </div>
      <p className="font-bold">{gasType}</p>
      {ownership === "possession" && (
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-accent transition-colors duration-200 group-hover:text-background/70">
          En comodato
        </p>
      )}
      <div className="mt-2 space-y-1 text-sm text-muted-foreground transition-colors duration-200 group-hover:text-background/70">
        <p>Capacidad: {container.container_capacity} kg</p>
        {container.last_inspection_date && (
          <p>Última inspección: {formatDate(container.last_inspection_date)}</p>
        )}
      </div>
      {!NON_EMPTY_MARKABLE_STATUSES.has(container.status) ? null : (
        <div className="mt-3">
          <MarkEmptyButton containerId={container.id} />
        </div>
      )}
    </>
  );
}

export function ContainerCard({
  container,
  ownership,
  selectable,
  selected,
  onToggleSelect,
}: ContainerCardProps) {
  // Non-selectable: full-width link (original behavior)
  if (!selectable) {
    return (
      <Link
        href={`/containers/${container.id}`}
        className="group border-2 border-foreground bg-background p-5 transition-colors duration-200 hover:bg-accent hover:text-background md:border-4"
      >
        <CardContent container={container} ownership={ownership} />
      </Link>
    );
  }

  // Selectable: split into checkbox zone + link zone
  return (
    <div
      className={`group flex border-2 bg-background transition-colors duration-200 md:border-4 ${
        selected ? "border-accent bg-accent/5" : "border-foreground"
      }`}
    >
      {/* Checkbox zone */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleSelect?.(container.id);
        }}
        className="flex w-12 shrink-0 items-center justify-center border-r-2 border-inherit transition-colors hover:bg-accent/10"
        aria-label={
          selected
            ? `Deseleccionar envase ${container.serial_number}`
            : `Seleccionar envase ${container.serial_number}`
        }
      >
        <div
          className={`flex h-5 w-5 items-center justify-center border-2 transition-colors ${
            selected
              ? "border-accent bg-accent"
              : "border-foreground bg-background"
          }`}
        >
          {selected && (
            <svg
              className="h-3 w-3 text-background"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Link zone */}
      <Link
        href={`/containers/${container.id}`}
        className="min-w-0 flex-1 p-5 transition-colors duration-200 hover:bg-accent hover:text-background"
      >
        <CardContent container={container} ownership={ownership} />
      </Link>
    </div>
  );
}
