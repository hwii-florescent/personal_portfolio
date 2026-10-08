// One design for every section panel. Both renderers (DOM in Sections.tsx, WebGL in Panel3D.tsx)
// read this file, so fonts, sizes, colours, spacing and link style cannot drift apart. Sizes are CSS px.
import { portfolio as p } from "./portfolio";
import type { SectionId } from "./sections";

export type Tone = "fg" | "muted" | "accent" | "gold";
export type Run = { t: string; tone?: Tone };
export type Kind = "h" | "meta" | "p" | "bullet" | "tags" | "label" | "award" | "link";
export type Block = { kind: Kind; runs: Run[]; href?: string };
export type Entry = Block[];

type Style = { font: "sans" | "sansMedium" | "mono"; size: number; line: number; tone: Tone; gap: number; track?: number; upper?: boolean };
/** gap = px of space above the block (ignored for the first block of an entry). */
export const style: Record<Kind, Style> = {
  h: { font: "sansMedium", size: 16, line: 1.35, tone: "fg", gap: 0 },
  meta: { font: "mono", size: 12, line: 1.4, tone: "muted", gap: 2 },
  p: { font: "sans", size: 14, line: 1.5, tone: "muted", gap: 6 },
  bullet: { font: "sans", size: 14, line: 1.5, tone: "muted", gap: 6 },
  tags: { font: "mono", size: 12, line: 1.5, tone: "accent", gap: 8 },
  label: { font: "mono", size: 12, line: 1.4, tone: "accent", gap: 0, track: 0.1, upper: true },
  award: { font: "mono", size: 12, line: 1.4, tone: "gold", gap: 2 },
  link: { font: "mono", size: 13, line: 1.4, tone: "accent", gap: 14 },
};
export const ENTRY_GAP = 28;
export const BULLET_INDENT = 16;

// Panel size in CSS px for the 3D panel (h is tuned so it covers ~70% of the viewport height) (the flat mobile panel is responsive and only borrows pad/header).
export const PANEL = { w: 500, h: 660, pad: 24, header: 72 };

const t = (s: string, tone?: Tone): Run => ({ t: s, tone });
const b = (kind: Kind, ...runs: Run[]): Block => ({ kind, runs });
const bullets = (items: readonly string[]): Block[] => items.map((x) => b("bullet", t(x)));
const arrow = (href: string) => (href.startsWith("http") ? " ↗" : "");

export function docFor(id: SectionId): Entry[] {
  switch (id) {
    case "experience":
      return p.experience.map((e) => [b("h", t(e.role + " · "), t(e.company, "accent")), b("meta", t(e.dates)), ...bullets(e.bullets)]);
    case "leadership":
      return p.leadership.map((l) => [b("h", t(l.role + " · "), t(l.org, "accent")), b("meta", t(l.dates)), ...bullets(l.bullets)]);
    case "projects":
      return p.projects.map((x) => [
        b("h", t(x.name)),
        ...(x.award ? [b("award", t(x.award))] : []),
        b("p", t(x.desc)),
        b("tags", t(x.tech.join(" · "))),
        { ...b("link", t("GitHub" + arrow(x.github))), href: x.github },
      ]);
    case "skills":
      return p.skills.map((s) => [b("label", t(s.cat)), b("p", t(s.items.join(" · ")))]);
    case "contact":
      return [p.contact.map((c) => ({ ...b("link", t(c.label + arrow(c.href))), href: c.href }))];
    default:
      throw new Error(`No document for section: ${id satisfies never}`);
  }
}
