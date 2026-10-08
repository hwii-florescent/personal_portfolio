import { ImageResponse } from "next/og";

export const alt = "Huy Hoang — Software Engineer & AI/ML Researcher";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
          padding: 80, background: "#020004", color: "#fff", borderLeft: "16px solid #CC0000",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 8, color: "#00E5FF" }}>PORTFOLIO // HUYHG.DEV</div>
        <div style={{ fontSize: 120, fontWeight: 900, marginTop: 24, textTransform: "uppercase" }}>Huy Hoang</div>
        <div style={{ fontSize: 40, marginTop: 16, color: "#FFD700" }}>Software Engineer & AI/ML Researcher</div>
      </div>
    ),
    size,
  );
}
