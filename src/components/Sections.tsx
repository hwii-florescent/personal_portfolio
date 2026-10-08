import type { CSSProperties } from "react";
import { BULLET_INDENT, ENTRY_GAP, docFor, style, type Block, type Entry, type Tone } from "@/data/doc";
import type { SectionId } from "@/data/sections";

// DOM renderer for the shared section design in src/data/doc.ts (the WebGL one is in Panel3D.tsx).
const tone: Record<Tone, string> = { fg: "var(--color-fg)", muted: "var(--color-muted)", accent: "var(--accent)", gold: "var(--gold)" };
const family = { sans: "var(--font-inter)", sansMedium: "var(--font-inter)", mono: "var(--font-jetbrains)" };

function BlockView({ b, gap }: { b: Block; gap: number }) {
  const s = style[b.kind];
  const css: CSSProperties = {
    marginTop: gap, fontFamily: family[s.font], fontWeight: s.font === "sansMedium" ? 500 : 400, fontSize: s.size,
    lineHeight: s.line, color: tone[s.tone], letterSpacing: s.track ? `${s.track}em` : undefined, textTransform: s.upper ? "uppercase" : undefined,
  };
  const text = b.runs.map((r, i) => (r.tone ? <span key={i} style={{ color: tone[r.tone] }}>{r.t}</span> : r.t));
  if (b.href) {
    const ext = b.href.startsWith("http");
    return (
      <p style={css}>
        <a href={b.href} {...(ext && { target: "_blank", rel: "noreferrer" })} className="underline decoration-accent underline-offset-4 hover:text-gold">{text}</a>
      </p>
    );
  }
  if (b.kind === "bullet") {
    return (
      <li style={{ ...css, position: "relative", paddingLeft: BULLET_INDENT, listStyle: "none" }}>
        <span style={{ position: "absolute", left: 0 }} aria-hidden>•</span>{text}
      </li>
    );
  }
  return b.kind === "h" ? <h3 style={css}>{text}</h3> : <p style={css}>{text}</p>;
}

function EntryView({ e, first }: { e: Entry; first: boolean }) {
  // bullets render inside one <ul>; everything else is a plain block
  const out: React.ReactNode[] = [];
  for (let i = 0; i < e.length; i++) {
    const gap = i === 0 ? 0 : style[e[i].kind].gap;
    if (e[i].kind !== "bullet") { out.push(<BlockView key={i} b={e[i]} gap={gap} />); continue; }
    let j = i;
    while (j < e.length && e[j].kind === "bullet") j++;
    out.push(<ul key={i} style={{ marginTop: gap }}>{e.slice(i, j).map((b, k) => <BlockView key={k} b={b} gap={k ? style.bullet.gap : 0} />)}</ul>);
    i = j - 1;
  }
  return <div style={{ marginTop: first ? 0 : ENTRY_GAP }}>{out}</div>;
}

/** Server-safe: used in the HUD panel and, for all sections, in the sr-only SEO copy. */
export function SectionBody({ id }: { id: SectionId }) {
  return <>{docFor(id).map((e, i) => <EntryView key={i} e={e} first={i === 0} />)}</>;
}
