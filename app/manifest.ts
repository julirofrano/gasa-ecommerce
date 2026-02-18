import type { MetadataRoute } from "next";
import { ACCENT_COLOR } from "@/lib/utils/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GASA - Gases Aconcagua S.A.",
    short_name: "GASA",
    description:
      "Tienda en línea y portal de clientes de Gases Aconcagua S.A. Gases industriales y medicinales en Argentina.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: ACCENT_COLOR,
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
