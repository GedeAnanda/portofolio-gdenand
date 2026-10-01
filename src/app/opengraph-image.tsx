import { ImageResponse } from "next/og";

export const alt = "Nanda, backend engineer building Go APIs, native iOS apps and AI-powered tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#0f0f0e",
        color: "#edede9",
      }}
    >
      <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#e2602f" }}>N.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 200, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 0.9 }}>Nanda</div>
        <div style={{ fontSize: 40, color: "#9a9a94", maxWidth: 900 }}>
          Backend engineer in Bandung. Go APIs, native iOS apps and AI-powered tools.
        </div>
      </div>
    </div>,
    size,
  );
}
