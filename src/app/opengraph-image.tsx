import { ImageResponse } from "next/og";

export const alt = "Nanda, backend engineer building Go APIs, native iOS apps and AI-powered tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const letters = [
  { ch: "N", color: "#ff5c93" },
  { ch: "a", color: "#ffd23f" },
  { ch: "n", color: "#5c7cff" },
  { ch: "d", color: "#b8f03c" },
  { ch: "a", color: "#ff8a3d" },
];

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
        background: "#fffdf8",
        color: "#17141f",
      }}
    >
      <div style={{ display: "flex", gap: 16 }}>
        {["#ff5c93", "#ffd23f", "#b8f03c"].map((c) => (
          <div key={c} style={{ width: 28, height: 28, borderRadius: 14, background: c, border: "4px solid #17141f" }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", fontSize: 210, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 0.9 }}>
          {letters.map((l, i) => (
            <span key={i} style={{ color: l.color, textShadow: "8px 8px 0 #17141f" }}>
              {l.ch}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 40, color: "#5d596d", maxWidth: 940 }}>
          Backend engineer in Bandung. Go APIs, native iOS apps and AI products, all playable.
        </div>
      </div>
    </div>,
    size,
  );
}
