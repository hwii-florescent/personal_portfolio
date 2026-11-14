import { ImageResponse } from "next/og";
import { portfolio as p } from "@/data/portfolio";

export const alt = `${p.name} — ${p.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The site's dusk in one frame: blue-hour sky, ember horizon, dark skyline.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 80, color: "#efe9dd",
          background: "linear-gradient(180deg, #071023 0%, #11224b 40%, #3a3458 62%, #b96a41 76%, #0b0d14 77.5%, #070b14 100%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#ffb066" }}>19:42 · BLUE HOUR</div>
        <div style={{ display: "flex", fontSize: 132, marginTop: 12, letterSpacing: -4 }}>{p.name}</div>
        <div style={{ display: "flex", fontSize: 38, marginTop: 4, color: "#ffdcb4" }}>{p.title}</div>
      </div>
    ),
    size,
  );
}
