import { ImageResponse } from "next/og";
import { ACCENT_COLOR } from "@/lib/utils/constants";

export const runtime = "edge";
export const alt = "GASA - Gases Aconcagua S.A.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "60px",
        backgroundColor: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          backgroundColor: ACCENT_COLOR,
        }}
      />

      {/* Section label */}
      <div
        style={{
          fontSize: "14px",
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: ACCENT_COLOR,
          marginBottom: "20px",
        }}
      >
        Gases Industriales y Medicinales
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "72px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "-0.04em",
          lineHeight: 0.9,
          color: "#000000",
          marginBottom: "30px",
        }}
      >
        GASES
        <br />
        ACONCAGUA S.A.
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: "20px",
          color: "#666666",
          maxWidth: "600px",
          lineHeight: 1.5,
        }}
      >
        Proveedor de gases industriales, medicinales e insumos de soldadura en
        Argentina.
      </div>

      {/* Bottom border */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4px",
          backgroundColor: "#000000",
        }}
      />
    </div>,
    { ...size },
  );
}
