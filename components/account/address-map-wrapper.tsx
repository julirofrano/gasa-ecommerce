"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  geocode,
  saveCoordinates,
} from "@/app/(account)/profile/geocode-action";

const AddressMap = dynamic(
  () => import("./address-map").then((m) => m.AddressMap),
  { ssr: false },
);

interface AddressMapWrapperProps {
  partnerId?: number;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  savedLat?: number;
  savedLng?: number;
  onCoordsCapture?: (lat: number, lng: number) => void;
}

export function AddressMapWrapper({
  partnerId,
  street,
  city,
  state,
  zip,
  country,
  savedLat,
  savedLng,
  onCoordsCapture,
}: AddressMapWrapperProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    savedLat && savedLng ? { lat: savedLat, lng: savedLng } : null,
  );
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [persisted, setPersisted] = useState(!!(savedLat && savedLng));
  const geocodedKey = useRef<string>("");

  const addressKey = [street, city, state, zip, country]
    .filter(Boolean)
    .join("|");

  const doGeocode = useCallback(async () => {
    if (geocodedKey.current === addressKey) return;
    geocodedKey.current = addressKey;

    // If we have saved coords and this is the first open, use them
    if (persisted && coords?.lat === savedLat && coords?.lng === savedLng) {
      return;
    }

    setLoading(true);
    setNotFound(false);
    setCoords(null);

    const result = await geocode({ street, city, state, zip, country });

    if (result) {
      setCoords({ lat: result.lat, lng: result.lng });
      onCoordsCapture?.(result.lat, result.lng);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }, [
    addressKey,
    street,
    city,
    state,
    zip,
    country,
    persisted,
    coords,
    savedLat,
    savedLng,
  ]);

  useEffect(() => {
    if (open && !coords) {
      doGeocode();
    }
  }, [open, coords, doGeocode]);

  // Re-geocode when address changes while map is open
  useEffect(() => {
    if (open && geocodedKey.current !== addressKey) {
      doGeocode();
    }
  }, [open, addressKey, doGeocode]);

  const handleCoordsChange = useCallback(
    async (lat: number, lng: number) => {
      setCoords({ lat, lng });
      onCoordsCapture?.(lat, lng);
      if (!partnerId) return;
      setSaving(true);
      await saveCoordinates(partnerId, lat, lng);
      setPersisted(true);
      setSaving(false);
    },
    [partnerId, onCoordsCapture],
  );

  const handleSaveInitial = useCallback(async () => {
    if (!partnerId || !coords) return;
    setSaving(true);
    await saveCoordinates(partnerId, coords.lat, coords.lng);
    setPersisted(true);
    setSaving(false);
  }, [partnerId, coords]);

  if (!street && !city) return null;

  const addressLabel = [street, city].filter(Boolean).join(", ");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-bold uppercase tracking-wide text-[#0094BB] hover:text-foreground"
      >
        {persisted ? "Ver Mapa" : "+ Ubicacion"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Cerrar mapa"
          />

          {/* Panel */}
          <div className="relative flex h-full max-h-[80vh] w-full max-w-4xl flex-col border-2 border-foreground bg-background md:border-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-3 md:px-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
                  Ubicacion
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {addressLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                Cerrar
              </button>
            </div>

            {/* Map area */}
            <div className="relative flex-1">
              {loading && (
                <div className="flex h-full items-center justify-center bg-muted">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Cargando mapa...
                  </p>
                </div>
              )}
              {notFound && !loading && (
                <div className="flex h-full items-center justify-center bg-muted">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    No se pudo ubicar esta direccion en el mapa.
                  </p>
                </div>
              )}
              {coords && !loading && (
                <AddressMap
                  lat={coords.lat}
                  lng={coords.lng}
                  label={addressLabel}
                  draggable
                  onCoordsChange={handleCoordsChange}
                />
              )}
            </div>

            {/* Footer */}
            {coords && !loading && (
              <div className="flex items-center gap-3 border-t-2 border-foreground px-4 py-2 md:px-6">
                {partnerId && !persisted && (
                  <button
                    type="button"
                    onClick={handleSaveInitial}
                    disabled={saving}
                    className="border-2 border-foreground bg-foreground px-4 py-1 text-xs font-bold uppercase tracking-wide text-background transition-colors hover:border-[#0094BB] hover:bg-[#0094BB] disabled:opacity-50"
                  >
                    Guardar Ubicacion
                  </button>
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Arrastra el pin para ajustar la ubicacion
                </p>
                {saving && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0094BB]">
                    Guardando...
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
