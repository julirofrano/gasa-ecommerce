import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { WhatsAppButton } from "@/components/whatsapp-button";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "GASA - Gases Industriales y Medicinales | Gases Aconcagua S.A.",
    template: "%s | GASA",
  },
  description:
    "Proveedor de gases industriales, medicinales e insumos de soldadura en Argentina. Oxígeno, CO₂, argón, nitrógeno, acetileno y más. Gases Aconcagua S.A.",
  keywords: [
    "gases industriales",
    "gases medicinales",
    "oxígeno",
    "CO2",
    "argón",
    "nitrógeno",
    "acetileno",
    "helio",
    "soldadura",
    "Mendoza",
    "Argentina",
    "Gases Aconcagua",
    "GASA",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: appUrl,
    siteName: "GASA - Gases Aconcagua S.A.",
    title: "GASA - Gases Industriales y Medicinales | Gases Aconcagua S.A.",
    description:
      "Proveedor de gases industriales, medicinales e insumos de soldadura en Argentina. Oxígeno, CO₂, argón, nitrógeno, acetileno y más.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GASA - Gases Industriales y Medicinales",
    description:
      "Proveedor de gases industriales, medicinales e insumos de soldadura en Argentina.",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <SessionProvider>
          <ThemeProvider>
            {children}
            <WhatsAppButton />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
