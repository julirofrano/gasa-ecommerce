const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Gases Aconcagua S.A.",
    alternateName: "GASA",
    url: appUrl,
    logo: `${appUrl}/favicon.ico`,
    description:
      "Proveedor de gases industriales, medicinales e insumos de soldadura en Argentina.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mendoza",
      addressCountry: "AR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+54-9-261-369-1623",
      contactType: "customer service",
      availableLanguage: "Spanish",
    },
    areaServed: [
      { "@type": "State", name: "Mendoza" },
      { "@type": "State", name: "San Juan" },
      { "@type": "State", name: "San Luis" },
      { "@type": "State", name: "La Pampa" },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
