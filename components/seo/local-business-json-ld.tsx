const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Gases Aconcagua S.A.",
    alternateName: "GASA",
    url: appUrl,
    telephone: "+54-9-261-369-1623",
    email: "consultas@gasesaconcagua.com.ar",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mendoza",
      addressRegion: "Mendoza",
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -33.0787,
      longitude: -68.975,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
    ],
    priceRange: "$$",
    description:
      "Proveedor de gases industriales, medicinales e insumos de soldadura. Oxígeno, CO₂, argón, nitrógeno, acetileno y más.",
    areaServed: ["Mendoza", "San Juan", "San Luis", "La Pampa"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
