import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GASA - Gases Aconcagua S.A.",
    short_name: "GASA",
    description:
      "Tienda en línea y portal de clientes de Gases Aconcagua S.A. Gases industriales y medicinales en Argentina.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0094BB",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
