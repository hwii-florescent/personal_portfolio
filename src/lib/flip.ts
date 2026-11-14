// The split-flap board of the intro. A real board cannot jump to a letter: its flaps hang on a drum in a fixed order,
// so a tile reaches a new character by showing every one between. Pure, so the driver (components/Intro.tsx) only paints.

/** The drum, in order. Index 0 is the blank flap. */
const RING = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·";
const mod = (n: number) => ((n % RING.length) + RING.length) % RING.length;

/**
 * What tile `i` shows, one flap at a time, to get from `from` to `to`: the last few characters of the drum before `to`
 * (all of them if it is close). The count varies from tile to tile (3 to 7) so a row of them settles raggedly, like the real thing.
 */
export function flipPath(from: string, to: string, i = 0): string[] {
  if (from === to) return [];
  const a = RING.indexOf(from), b = RING.indexOf(to);
  if (a < 0 || b < 0) return [to]; // not on the drum: just show it
  const n = Math.min(mod(b - a), 3 + ((i * 7) % 5));
  return Array.from({ length: n }, (_, k) => RING[mod(b - n + 1 + k)]);
}
