# "Share Your Location" — Navbar Button + Location Banner

## Context

Guest users (and logged-in users without saved addresses) currently have no location context until they manually fill in their shipping address at checkout. This means they can't see whether GASA delivers to their area until deep in the checkout flow. Adding a "share your location" button in the navbar uses the browser's Geolocation API + Nominatim reverse geocoding to resolve the user's city/state/zip upfront. This enables:

- Showing delivery availability earlier (own_delivery zone check uses zip code)
- Pre-filling the shipping zip at checkout so the `DeliverySelector` works immediately
- Better UX messaging ("Entrega disponible en tu zona" vs discovering "not in zone" at checkout)

## Approach

### 1. Add `userLocation` to UIStore — `stores/ui-store.ts`

New state (persisted to `localStorage` as `"gasa-location"`):

```ts
interface UserLocation {
  lat: number;
  lng: number;
  city: string;
  state: string;
  zipCode: string;
}

// New fields on UIStore:
userLocation: UserLocation | null;
locationBannerDismissed: boolean;
setUserLocation: (location: UserLocation | null) => void;
dismissLocationBanner: () => void;
```

**Problem**: UIStore currently uses plain `create()` (no persist middleware). We need to either:

- Add a **separate persisted store** for location (`stores/location-store.ts`) — cleaner, avoids breaking existing UIStore
- **Chosen**: Create `stores/location-store.ts` with `persist` middleware. This keeps location state independent and persistable without touching the existing UIStore.

### 2. New store — `stores/location-store.ts`

Zustand store with `persist` middleware (key: `"gasa-location"`):

```ts
interface LocationStore {
  userLocation: UserLocation | null;
  bannerDismissed: boolean;
  setUserLocation: (location: UserLocation | null) => void;
  dismissBanner: () => void;
}
```

### 3. Reverse geocoding — `lib/geocoding/nominatim.ts`

Add `reverseGeocodeAddress(lat, lng)` function:

```ts
export async function reverseGeocodeAddress(
  lat: number,
  lng: number,
): Promise<{
  city: string;
  state: string;
  zipCode: string;
} | null>;
```

- Uses Nominatim `/reverse` endpoint with `lat`, `lon`, `format=json`, `countrycodes=ar`, `zoom=18`
- Extracts `address.city` (or `town`/`village`), `address.state`, `address.postcode`
- Same User-Agent and caching as existing forward geocoding

### 4. Server action — `app/(shop)/location-action.ts`

```ts
"use server";
export async function reverseGeocode(lat: number, lng: number) {
  return reverseGeocodeAddress(lat, lng);
}
```

### 5. New component — `components/layout/location-button.tsx`

Client component with:

- **Button**: `MapPin` icon from lucide-react
  - When location NOT set: icon + "Ubicación" label (desktop)
  - When location IS set: icon + city name (e.g., "Mendoza")
  - Loading state while geolocation/geocoding runs
- **Click handler**:
  1. `navigator.geolocation.getCurrentPosition()` → lat/lng
  2. Call `reverseGeocode(lat, lng)` server action
  3. `setUserLocation({ lat, lng, city, state, zipCode })`
- **Placement**: In header's right action icons section, before the Search button. Same pattern as other icon buttons.

### 6. Location banner — `components/layout/location-banner.tsx`

A slim banner below the header shown when `!userLocation && !bannerDismissed`:

- Message: "Compartí tu ubicación para ver opciones de entrega en tu zona"
- CTA button triggers geolocation (same flow as the navbar button)
- X dismiss button (sets `bannerDismissed = true`)
- Styled as a `bg-[#0094BB] text-white` slim strip (design accent)
- Hidden once location is set or dismissed

### 7. Modify header — `components/layout/header.tsx`

- Import and render `<LocationButton />` in the right action icons area (before Search)
- Render `<LocationBanner />` after the main `<header>` element

### 8. Wire into checkout — `components/checkout/checkout-form.tsx`

- Read `userLocation` from `useLocationStore`
- Use as initial value for `shippingZip` state (only if not using a saved address and zip is empty)
- This makes `resolvedShippingZip` available to `DeliverySelector` immediately

## Files to create

| File                                    | Purpose                                       |
| --------------------------------------- | --------------------------------------------- |
| `stores/location-store.ts`              | Persisted Zustand store for user location     |
| `components/layout/location-button.tsx` | Navbar geolocation button                     |
| `components/layout/location-banner.tsx` | Dismissible banner prompting location sharing |
| `app/(shop)/location-action.ts`         | Server action wrapping reverse geocoding      |

## Files to modify

| File                                    | Change                                            |
| --------------------------------------- | ------------------------------------------------- |
| `lib/geocoding/nominatim.ts`            | Add `reverseGeocodeAddress()` function            |
| `components/layout/header.tsx`          | Add `<LocationButton />` and `<LocationBanner />` |
| `components/checkout/checkout-form.tsx` | Pre-fill `shippingZip` from location store        |

## What does NOT change

- UIStore — untouched, location gets its own store
- Cart store — no location data in cart
- Server-side checkout actions — unchanged
- Delivery data/zones — consumed as-is via existing zip-based helpers
- Auth/session — unchanged

## Verification

1. `bun run build` — no compilation errors
2. Fresh visit (no localStorage): banner appears below header, navbar shows "Ubicación"
3. Click banner CTA or navbar button → browser prompts for geolocation → city appears in navbar, banner disappears
4. Reload page → location persisted, city still shown, no banner
5. Navigate to checkout → shipping zip pre-filled from stored location → delivery options visible immediately
6. Dismiss banner (X) → banner gone, stays gone on reload
7. Click navbar location button when already set → updates to new location
