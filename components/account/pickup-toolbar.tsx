"use client";

interface PickupToolbarProps {
  count: number;
  onClear: () => void;
  onRequestPickup: () => void;
}

export function PickupToolbar({
  count,
  onClear,
  onRequestPickup,
}: PickupToolbarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-[#0094BB] bg-[#0094BB] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <p className="text-sm font-bold">
          {count}{" "}
          {count === 1 ? "envase seleccionado" : "envases seleccionados"}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-bold uppercase tracking-wide text-white/70 transition-colors hover:text-white"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={onRequestPickup}
            className="border-2 border-white bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#0094BB] transition-colors hover:bg-transparent hover:text-white"
          >
            Solicitar Retiro
          </button>
        </div>
      </div>
    </div>
  );
}
