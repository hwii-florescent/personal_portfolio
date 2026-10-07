// Single source of truth for colours: applied as CSS vars (HUD) and read directly by three.js (scene).
export const themes = {
  jarvis: { ai: "J.A.R.V.I.S.", primary: "#CC0000", gold: "#FFD700", accent: "#00E5FF", bg: "#020004" },
  spidey: { ai: "K.A.R.E.N.", primary: "#E62429", gold: "#F5F7FF", accent: "#3D7BFF", bg: "#03050F" },
} as const;

export type ThemeId = keyof typeof themes;
export type Palette = (typeof themes)[ThemeId];
