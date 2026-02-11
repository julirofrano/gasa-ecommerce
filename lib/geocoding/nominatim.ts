interface GeocodingInput {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

const cache = new Map<string, GeocodingResult | null>();

function buildCacheKey(input: GeocodingInput): string {
  return [input.street, input.city, input.state, input.zip, input.country]
    .filter(Boolean)
    .join("|")
    .toLowerCase();
}

async function nominatimSearch(q: string): Promise<GeocodingResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ar");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "GASA-Ecommerce/1.0 (contacto@gasesaconcagua.com)",
    },
    next: { revalidate: 604800 }, // 7 days
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

export async function geocodeAddress(
  input: GeocodingInput,
): Promise<GeocodingResult | null> {
  const key = buildCacheKey(input);
  if (cache.has(key)) return cache.get(key) ?? null;

  // Build progressive fallback queries: full → street+city → city+state → city
  const queries: string[] = [];

  const full = [
    input.street,
    input.city,
    input.state,
    input.zip,
    input.country,
  ].filter(Boolean);
  if (full.length > 0) queries.push(full.join(", "));

  if (input.street && input.city) {
    queries.push(
      [input.street, input.city, input.state].filter(Boolean).join(", "),
    );
  }

  if (input.city && input.state) {
    queries.push(`${input.city}, ${input.state}`);
  }

  if (input.city) {
    queries.push(input.city);
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = queries.filter((q) => {
    const k = q.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  for (const q of unique) {
    const result = await nominatimSearch(q);
    if (result) {
      cache.set(key, result);
      return result;
    }
  }

  cache.set(key, null);
  return null;
}
