// Single source of truth for colours: applied as CSS vars (HUD) and read directly by three.js (scene).
export const themes = {
  jarvis: { ai: "J.A.R.V.I.S.", primary: "#CC0000", gold: "#FFD700", accent: "#00E5FF", bg: "#020004" },
  spidey: { ai: "K.A.R.E.N.", primary: "#C82038", gold: "#F5F2FF", accent: "#FF5C76", bg: "#060B18" },
} as const;

export type ThemeId = keyof typeof themes;
export type Palette = (typeof themes)[ThemeId];
