// The page is one night in a room on Nob Hill. Each chapter owns a time of night and a place to stand; scrolling
// walks between them. Pure data and functions only: the page, the 3D scene and the minimap all read this.

export type Vec3 = readonly [number, number, number];

/** The room in metres (x east, y up, z south, floor at y = 0). Glass to the west, north and, north of `split`, east. */
export const ROOM = { w: -4, e: 4, n: -3.4, s: 3.2, h: 2.9, split: 0.2 } as const;
/** The desk runs along the west glass; the low table stands in the lounge corner. `r` is the clearance to keep. */
export const DESK = { x: -3.36, z: -1.6, top: 0.76, r: 1.05 } as const;
export const TABLE = { x: 1.9, z: -1.7, top: 0.4, r: 0.6 } as const;
/** The two hologram projectors. */
export const SITES = { a: [DESK.x + 0.05, DESK.top, DESK.z - 0.78], b: [TABLE.x, TABLE.top, TABLE.z] } as const satisfies Record<string, Vec3>;
/**
 * The intro rides a lift up the tower. It stands behind the room's south door (the black one, at x = 2.85): `front` is the
 * z of the cabin's inner front wall, the rest its inside size in metres, `door` the width of the opening.
 */
export const LIFT = { x: 2.85, front: ROOM.s + 0.3, depth: 2.1, width: 1.7, height: 2.6, door: 1, doorHeight: 2.15 } as const;
export const INTRO = { floors: 11, seconds: 15.5 } as const; // floors in the lift; how long the flight takes

/** hour runs past midnight (25 = 01:00) so it only ever increases. */
export const chapters = [
  { id: "top", label: "Intro", hour: 19.7, pos: [0.2, 1.5, -1.2], look: [-4, 1.12, -0.55], fov: 46, tall: { pos: [-0.4, 1.5, -1.5], look: [-4, -0.1, -1.55] } },
  { id: "about", label: "About", hour: 20.45, pos: [-0.9, 1.5, -0.1], look: [-4, 1.25, -3.2], fov: 44 },
  { id: "experience", label: "Experience", hour: 22, pos: [0.5, 1.55, 1.3], look: [0.55, 1.62, -3.4], fov: 46 },
  { id: "projects", label: "Projects", hour: 25, pos: [-1.7, 1.35, -0.7], look: [-3.5, 0.98, -2.2], fov: 40 },
  { id: "skills", label: "Skills", hour: 27.5, pos: [-0.7, 1.45, 0.4], look: [1.7, 0.85, -2.9], fov: 44, tall: { pos: [-0.7, 1.45, 0.4], look: [2.4, 0.85, -2.3] } },
  { id: "background", label: "Background", hour: 29.1, pos: [-1.6, 1.6, 1.9], look: [4, 1.5, -2.6], fov: 46 },
  { id: "contact", label: "Contact", hour: 30.4, pos: [-2.6, 1.5, -0.6], look: [4, 1.45, -3.0], fov: 46 },
] as const satisfies readonly { id: string; label: string; hour: number; pos: Vec3; look: Vec3; fov: number; tall?: { pos: Vec3; look: Vec3 } }[];
// `tall` is the same shot re-framed for a portrait screen, where the page's text covers the lower half.

export type ChapterId = (typeof chapters)[number]["id"];
export const LAST = chapters.length - 1;
export const DUSK = chapters[0].hour;
export const DAWN = chapters[LAST].hour;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10); // rests at each chapter

/**
 * Scroll offset -> position along the night, 0 at the top to LAST once the final chapter is on screen.
 * `tops` are the chapters' document offsets; a chapter takes over when its heading is 40% up the viewport.
 */
export function progress(y: number, tops: readonly number[], vh: number): number {
  if (tops.length < 2) return 0;
  const at = (i: number) => (i ? Math.max(tops[i] - vh * 0.4, 0) : 0);
  let i = 0;
  while (i < tops.length - 2 && y >= at(i + 1)) i++;
  const span = at(i + 1) - at(i);
  return i + (span > 0 ? clamp01((y - at(i)) / span) : 1);
}

/** Camera and clock at position `u` (see `progress`). The camera eases between chapters; the clock runs evenly. */
export function journeyAt(u: number, tall = false) {
  const x = Math.min(Math.max(u, 0), LAST);
  const i = Math.min(Math.floor(x), LAST - 1);
  const t = x - i;
  const k = ease(t);
  const a = chapters[i], b = chapters[i + 1];
  const shot = (c: (typeof chapters)[number]) => (tall && "tall" in c ? c.tall : c);
  const mix = (p: Vec3, q: Vec3): [number, number, number] => [lerp(p[0], q[0], k), lerp(p[1], q[1], k), lerp(p[2], q[2], k)];
  return { hour: lerp(a.hour, b.hour, t), pos: mix(shot(a).pos, shot(b).pos), look: mix(shot(a).look, shot(b).look), fov: lerp(a.fov, b.fov, k) };
}

/**
 * The intro's beats, in seconds from the moment the eyes open: the lift rises, its doors part, a straight walk out a step or
 * two into the room, a turn on the spot to face the way it will go (all of the room in view), then the camera holds still
 * while the room is built, and when that is nine tenths done it moves in one motion to the opening shot.
 */
export const BEATS = { ride: [0.7, 3.8], doors: [3.9, 4.7], walk: [4.7, 7.2], turn: [7.2, 8.5], build: [8.1, 12.3], move: [11.5, 15] } as const;
const seg = (t: number, [a, b]: readonly [number, number]) => clamp01((t * INTRO.seconds - a) / (b - a));

/**
 * The intro's camera, `t` 0 to 1, as a person would move it: inside the lift (humming a little while it rises) facing the
 * doors; a straight walk out through them; a turn on the spot (it never walks and turns at once, until the last move);
 * a hold; and one motion, walking and turning together, to the opening shot. Yaw is measured from north (-z) toward the west (-x).
 */
const CAB = { pos: [LIFT.x, 1.6, LIFT.front + 1.7], pitch: 0.13, fov: 68 } as const; // looking up a little, at the floor indicator
const STOP: Vec3 = [LIFT.x, 1.6, ROOM.s - 0.7]; // where the walk ends: just a step or two inside the south door
const yawTo = (from: Vec3, to: Vec3) => Math.atan2(from[0] - to[0], from[2] - to[2]);
const pitchTo = (from: Vec3, to: Vec3) => Math.atan2(to[1] - from[1], Math.hypot(to[0] - from[0], to[2] - from[2]));
const smooth = (x: number) => x * x * (3 - 2 * x);
/** A walk: a quarter of it easing up to speed, a quarter easing to a stop, one steady pace between, so it never starts or stops with a jolt. */
const pace = (x: number) => { const a = 0.25, v = 1 / (1 - a); return x < a ? (v / (2 * a)) * x * x : x > 1 - a ? 1 - (v / (2 * a)) * (1 - x) ** 2 : v * (x - a / 2); };
export function introAt(t: number, tall = false) {
  const end = journeyAt(0, tall), walk = pace(seg(t, BEATS.walk)), turn = smooth(seg(t, BEATS.turn)), move = smooth(seg(t, BEATS.move)); // it eases out of the hold, no push
  const mix = (p: Vec3, q: Vec3, k: number): [number, number, number] => [lerp(p[0], q[0], k), lerp(p[1], q[1], k), lerp(p[2], q[2], k)];
  const pos = move > 0 ? mix(STOP, end.pos, move) : mix(CAB.pos, STOP, walk);
  const hum = smooth(clamp01((t * INTRO.seconds - 0.7) / 0.4)) * (1 - smooth(clamp01((t * INTRO.seconds - 3.4) / 0.4))); // the car, while it moves
  pos[0] += hum * 0.003 * Math.sin(t * 2300);
  pos[1] += hum * 0.004 * (Math.sin(t * 1700) + 0.6 * Math.sin(t * 2900));
  const yaw = lerp(lerp(0, yawTo(STOP, end.pos), turn), yawTo(end.pos, end.look), move);
  const pitch = lerp(lerp(lerp(CAB.pitch, 0, smooth(clamp01((t * INTRO.seconds - BEATS.walk[0]) / 1.2))), -0.1, turn), pitchTo(end.pos, end.look), move);
  const look: [number, number, number] = move >= 1 ? [...end.look] : [pos[0] - Math.sin(yaw) * Math.cos(pitch) * 10, pos[1] + Math.sin(pitch) * 10, pos[2] - Math.cos(yaw) * Math.cos(pitch) * 10];
  return { pos, look, fov: lerp(lerp(CAB.fov, 64, walk), end.fov, move) };
}

/** The lift at intro position `t`: the floor on its indicator and how far its doors are open (0..1). */
export function cabinAt(t: number) {
  return { floor: Math.min(INTRO.floors, 1 + Math.floor(ease(seg(t, BEATS.ride)) * INTRO.floors)), door: ease(seg(t, BEATS.doors)) };
}

/** How much of the room has been built at intro position `t`: 0 is its skeleton alone, 1 all of it. It starts as the camera finishes turning. */
export function revealAt(t: number): number {
  return smooth(seg(t, BEATS.build));
}

/**
 * How far each hologram is projected (0..1) at position `u`. The service graph idles over the desk, gives way to the
 * route map while Projects is read and returns after; the skills board comes up over the lounge table and stays.
 */
export function hologramsAt(u: number) {
  const step = (a: number, b: number) => { const t = clamp01((u - a) / (b - a)); return t * t * (3 - 2 * t); };
  return { systems: 1 - step(2.3, 2.6) + step(4.05, 4.4), route: step(2.62, 2.95) * (1 - step(3.7, 4.03)), board: step(3.3, 3.85) };
}

/** 25.5 -> "01:30" */
export function clock(hour: number): string {
  const m = Math.round(hour * 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
}

const phases: readonly (readonly [number, string])[] = [
  [20.2, "Blue hour"], [21.3, "Dusk"], [24, "Nightfall"], [26.4, "After midnight"], [28.5, "Small hours"], [30.05, "First light"], [Infinity, "Sunrise"],
];
export const phase = (hour: number): string => phases.find(([until]) => hour < until)![1];
