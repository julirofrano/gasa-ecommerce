import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ROUTES,
  CONTAINER_STATUS_LABELS,
  CONTAINER_TYPE_LABELS,
} from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/formatting";
import {
  getContainerById,
  getContainerTransferHistory,
  resolveOwnerPartnerId,
  getChildPartnerIds,
} from "@/lib/odoo/containers";
import { getRequiredSession } from "@/lib/auth/session";
import { StatusBadge } from "@/components/account/status-badge";
import { Timeline } from "@/components/account/timeline";
import type { OdooContainer } from "@/lib/odoo/types";

interface Props {
  params: Promise<{ id: string }>;
}

function getContainerStatusVariant(
  status: string,
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const container = await getContainerById(Number(id));
    const name = container
      ? container.serial_number || container.display_name
      : `Envase #${id}`;
    return {
      title: name,
      robots: { index: false, follow: false },
    };
  } catch {
    const { id } = await params;
    return {
      title: `Envase #${id}`,
      robots: { index: false, follow: false },
    };
  }
}

export default async function ContainerDetailPage({ params }: Props) {
  const { id } = await params;

  const [container, history, session] = await Promise.all([
    getContainerById(Number(id)),
    getContainerTransferHistory(Number(id)),
    getRequiredSession(),
  ]);

  if (!container) {
    notFound();
  }

  const ownerPartnerId = await resolveOwnerPartnerId(session.user.partnerId);
  const childIds = await getChildPartnerIds(ownerPartnerId);
  const customerContactIds = new Set([ownerPartnerId, ...childIds]);

  // Verify the container belongs to or is in possession of the user's company
  const isOwned =
    container.owner_customer && container.owner_customer[0] === ownerPartnerId;
  const isInPossession =
    container.location === "customer" &&
    container.location_customer &&
    customerContactIds.has(container.location_customer[0]);

  if (!isOwned && !isInPossession) {
    notFound();
  }

  let displayStatus: string = container.status;
  let displayLocation = container.effective_location;
  let ownershipLabel: string;

  let isMasked = false;

  if (isOwned) {
    const isAtOwnLocation =
      container.location === "customer" &&
      container.location_customer &&
      (container.location_customer[0] === ownerPartnerId ||
        customerContactIds.has(container.location_customer[0]));

    if (!isAtOwnLocation) {
      displayStatus = "filling";
      displayLocation = "En proceso de llenado";
      isMasked = true;
    }
    ownershipLabel = container.owner_customer
      ? container.owner_customer[1]
      : "";
  } else {
    ownershipLabel = "GASA (en comodato)";
  }

  const displayName = container.serial_number || container.display_name;
  const gasType = container.associated_product[1];

  return (
    <div>
      {/* ── Breadcrumb ─────────────────────────────────── */}
      <nav className="mb-4 text-xs font-bold uppercase tracking-widest">
        <Link
          href={ROUTES.ACCOUNT_CONTAINERS}
          className="text-muted-foreground transition-colors duration-200 hover:text-[#0094BB]"
        >
          Mis Envases
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span>{displayName}</span>
      </nav>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
          {displayName}
        </h1>
        <StatusBadge variant={getContainerStatusVariant(displayStatus)}>
          {CONTAINER_STATUS_LABELS[displayStatus] || displayStatus}
        </StatusBadge>
      </div>

      {/* ── Content Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Container Info */}
        <div className="border-2 border-foreground p-6 md:border-4 md:p-8">
          <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#0094BB]">
            Información del Envase
          </h2>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Número de Serie</dt>
              <dd className="font-mono font-bold">{displayName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Producto</dt>
              <dd className="font-bold">{gasType}</dd>
            </div>
            {container.container_type && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tipo de Envase</dt>
                <dd className="font-bold">
                  {CONTAINER_TYPE_LABELS[container.container_type] ||
                    container.container_type}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Capacidad</dt>
              <dd className="font-bold">{container.container_capacity} kg</dd>
            </div>
            {container.current_product_quantity > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cantidad Actual</dt>
                <dd className="font-bold">
                  {container.current_product_quantity} kg
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Estado</dt>
              <dd>
                <StatusBadge variant={getContainerStatusVariant(displayStatus)}>
                  {CONTAINER_STATUS_LABELS[displayStatus] || displayStatus}
                </StatusBadge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Propiedad</dt>
              <dd className="max-w-[200px] text-right font-bold">
                {ownershipLabel}
              </dd>
            </div>
            {container.last_inspection_date && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Última Inspección</dt>
                <dd className="font-bold">
                  {formatDate(container.last_inspection_date)}
                </dd>
              </div>
            )}
            {container.next_inspection_date && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Próxima Inspección</dt>
                <dd className="font-bold">
                  {formatDate(container.next_inspection_date)}
                </dd>
              </div>
            )}
            {displayLocation && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ubicación</dt>
                <dd className="max-w-[200px] text-right font-bold">
                  {displayLocation}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Right Column: Actions + Timeline */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="border-2 border-foreground p-6 md:border-4 md:p-8">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#0094BB]">
              Acciones
            </h2>
            {isMasked ? (
              <p className="text-sm text-muted-foreground">
                Este envase se encuentra en proceso de llenado. No se pueden
                realizar acciones en este momento.
              </p>
            ) : (
              <div className="space-y-3">
                <button className="w-full border-2 border-foreground bg-foreground px-4 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]">
                  Solicitar Recarga
                </button>
                <button className="w-full border-2 border-foreground bg-background px-4 py-4 text-sm font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background">
                  Solicitar Devolución
                </button>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="border-2 border-foreground p-6 md:border-4 md:p-8">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#0094BB]">
              Historial
            </h2>
            {history.length > 0 ? (
              <Timeline entries={history} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay movimientos registrados para este envase.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
