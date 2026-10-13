import { portfolio as p } from "./portfolio";

export const LAST = 2; // index of the final intro line: the holograms appear with it
export const TYPE_MS = 24; // ms per typed character

// Speech height above the pad. Lower numbers move the text closer to the table.
export const SPEECH_HEIGHTS = {
  intro: 1.3, // welcome and bio
  modules: 2.3, // "Pick a module to explore"
} as const;

/** What the AI says during the opening, one line per step. */
export const introLines = (ai: string) => [
  "Hi, welcome to Huy's Portfolio.",
  `I'm ${ai}, your guide. Huy is a ${p.experience[0].role} at ${p.experience[0].company.replace(/ Inc\.$/, "")} and a ${p.education.degree.replace("B.S. in ", "")} student at the ${p.education.school}.`,
  "Pick a module to explore.",
];
