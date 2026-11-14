// Splits a résumé bullet so its metrics can be set in a stronger face: "cut context 50%" -> ["cut context ", <50%>].
// A metric is a number with an optional unit that does not sit inside a word, so EC2, OAuth2 and YOLOv8 stay plain.
const METRIC = /(?<![\p{L}\d.-])\d[\d,.]*(?:%\+?|[kKxX]\+?|\+|ms|min|h)?(?![\p{L}\d])/gu;

export type Part = { text: string; strong: boolean };

export function emphasize(text: string): Part[] {
  const out: Part[] = [];
  let at = 0;
  for (const m of text.matchAll(METRIC)) {
    const value = m[0].replace(/[.,]$/, ""); // sentence punctuation after a number is not part of it
    if (m.index > at) out.push({ text: text.slice(at, m.index), strong: false });
    out.push({ text: value, strong: true });
    at = m.index + value.length;
  }
  if (at < text.length) out.push({ text: text.slice(at), strong: false });
  return out;
}
