"use client";

import { useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface AddressMapProps {
  lat: number;
  lng: number;
  label?: string;
  draggable?: boolean;
  onCoordsChange?: (lat: number, lng: number) => void;
}

export function AddressMap({
  lat,
  lng,
  label,
  draggable,
  onCoordsChange,
}: AddressMapProps) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker && onCoordsChange) {
          const pos = marker.getLatLng();
          onCoordsChange(pos.lat, pos.lng);
        }
      },
    }),
    [onCoordsChange],
  );

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[lat, lng]}
        icon={icon}
        draggable={draggable}
        eventHandlers={eventHandlers}
        ref={markerRef}
      >
        {label && <Popup>{label}</Popup>}
      </Marker>
    </MapContainer>
  );
}
