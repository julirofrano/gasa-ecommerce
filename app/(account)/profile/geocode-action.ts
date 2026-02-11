"use server";

import { geocodeAddress } from "@/lib/geocoding/nominatim";
import { updatePartner } from "@/lib/odoo/partners";

export async function geocode(input: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}) {
  return geocodeAddress(input);
}

export async function saveCoordinates(
  partnerId: number,
  lat: number,
  lng: number,
) {
  return updatePartner(partnerId, {
    partner_latitude: lat,
    partner_longitude: lng,
  });
}
