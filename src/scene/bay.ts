// San Francisco Bay: the water, both bridges, the islands, the far shores and every light around them (terrain.ts
// says where each stands). It is one mesh, one set of lines, one sheet of water, one bank of fog and one cloud of
// points drawn twice, so the whole bay costs six draw calls.
import {
  AdditiveBlending, BoxGeometry, DoubleSide, BufferGeometry, CylinderGeometry, Float32BufferAttribute, Group, LineSegments, Matrix3, Matrix4, Mesh,
  PlaneGeometry, Points, ShaderMaterial, SphereGeometry, Vector3,
} from "three";
import { AIR_GLSL, HAZE, NOISE_GLSL, rng, U } from "./shared";
import { ground, PLACES, polar, WATER } from "./terrain";

type V3 = [number, number, number];
/** Linear rgb, then how strongly floodlights pick it out at night (0..1). -1 marks bare ground, which gets a mottled texture. */
type Tint = [number, number, number, number];

const ORANGE: Tint = [0.5, 0.05, 0.032, 0]; // International Orange
const STEEL: Tint = [0.3, 0.31, 0.33, 0.3];
const CONCRETE: Tint = [0.3, 0.29, 0.27, 0.08];
const ROCK: Tint = [0.07, 0.066, 0.058, -1];
const SCRUB: Tint = [0.034, 0.042, 0.03, -1];
const LAND: Tint = [0.045, 0.045, 0.05, -1];
export const SODIUM: V3 = [2.6, 1.35, 0.5], LED: V3 = [1.7, 1.9, 2.2], WARM: V3 = [1.7, 1.15, 0.6], RED: V3 = [5, 0.3, 0.2];
export const STEADY = 0, BEACON = 1, LIGHTHOUSE = 2, STROBE = 3, SPARKLE = 4;

// ---------------------------------------------------------------- builders
const attrs = () => ({ position: [] as number[], normal: [] as number[], aTint: [] as number[] });
const solid = attrs(), wires = attrs();
const mist = { position: [] as number[], aFog: [] as number[] };
const lamps = { position: [] as number[], aTo: [] as number[], aTint: [] as number[], aLamp: [] as number[], aMore: [] as number[] };
const v = new Vector3(), normals = new Matrix3(), T = new Matrix4(), R = new Matrix4(), K = new Matrix4();
const CUBE = new BoxGeometry(1, 1, 1).toNonIndexed();
const phase = rng(415);

/** Append a shape to the one far mesh. `tint` may vary with height above the water. */
export function build(g: BufferGeometry, m: Matrix4, tint: Tint | ((y: number) => Tint)) {
  const p = g.getAttribute("position"), n = g.getAttribute("normal");
  normals.getNormalMatrix(m);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).applyMatrix4(m);
    solid.position.push(v.x, v.y, v.z);
    solid.aTint.push(...(typeof tint === "function" ? tint(v.y - WATER) : tint));
    v.fromBufferAttribute(n, i).applyMatrix3(normals).normalize();
    solid.normal.push(v.x, v.y, v.z);
  }
}
function vertex(x: number, y: number, z: number, nx: number, ny: number, nz: number, tint: Tint) {
  solid.position.push(x, y, z); solid.normal.push(nx, ny, nz); solid.aTint.push(...tint);
}

/** A frame standing on the water: x runs along `bearing`, y is up, z is to its right. */
export function frame(x: number, z: number, bearing: number) {
  const a = (bearing * Math.PI) / 180;
  return new Matrix4().makeBasis(new Vector3(Math.sin(a), 0, -Math.cos(a)), new Vector3(0, 1, 0), new Vector3(Math.cos(a), 0, Math.sin(a))).setPosition(x, WATER, z);
}
/** A box in a frame. `tilt` leans it about the frame's x axis, `pitch` about its z axis. */
export function block(f: Matrix4, at: V3, size: V3, tint: Tint | ((y: number) => Tint), tilt = 0, pitch = 0) {
  build(CUBE, new Matrix4().copy(f).multiply(T.makeTranslation(...at)).multiply(R.makeRotationX(tilt)).multiply(K.makeRotationZ(pitch)).multiply(T.makeScale(...size)), tint);
}
function wire(f: Matrix4, a: V3, b: V3, tint: Tint) {
  for (const p of [a, b]) { v.set(...p).applyMatrix4(f); wires.position.push(v.x, v.y, v.z); wires.normal.push(0, 1, 0); wires.aTint.push(...tint); }
}

type LampOptions = { to?: V3; speed?: number; phase?: number; size?: number; mode?: number; habit?: number; mirror?: boolean };
/**
 * One light. `to` and `speed` (trips per second) make it travel; `habit` > 0 makes it a window that goes dark as the
 * night gets late; `mirror` gives it a reflection on the water.
 */
export function lamp(p: V3, color: V3, o: LampOptions = {}) {
  lamps.position.push(...p); lamps.aTo.push(...(o.to ?? p)); lamps.aTint.push(...color);
  lamps.aLamp.push(o.phase ?? phase(), o.speed ?? 0, o.size ?? 0.6, o.mode ?? STEADY);
  lamps.aMore.push(o.habit ?? 0, o.mirror ? 1 : 0);
}
const place = (f: Matrix4, p: V3): V3 => { v.set(...p).applyMatrix4(f); return [v.x, v.y, v.z]; };
const dim = (c: V3, k: number): V3 => [c[0] * k, c[1] * k, c[2] * k];

/** Smooth noise in 0..1 with a few octaves, for skylines. */
function skyline(seed: number) {
  const r = rng(seed), k = Array.from({ length: 64 }, r);
  const at = (x: number) => { const i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f); return k[i & 63] * (1 - s) + k[(i + 1) & 63] * s; };
  return (x: number) => at(x) * 0.55 + at(x * 2.7 + 9) * 0.3 + at(x * 7.1 + 3) * 0.15;
}
const hump = (t: number) => Math.sin(Math.PI * Math.min(1, Math.max(0, t)));

/**
 * A range of hills as a standing silhouette. `a` and `b` are its ends as [bearing, distance]; `top` is its skyline in
 * metres above the bay. Far hills need no more than this: aerial perspective does the modelling.
 */
function ridge(a: [number, number], b: [number, number], top: (t: number) => number, tint: Tint, steps = 90) {
  let last: number[] | undefined;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, [x, z] = polar(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t), r = Math.hypot(x, z);
    const cur = [x, z, WATER + Math.max(top(t), 0), (-x / r) * 0.75, (-z / r) * 0.75];
    if (last) for (const [p, y] of [[last, WATER - 3], [cur, WATER - 3], [cur, cur[2]], [last, WATER - 3], [cur, cur[2]], [last, last[2]]] as [number[], number][]) vertex(p[0], y, p[1], p[3], 0.66, p[4], tint);
    last = cur;
  }
}

/** A bank of fog standing on the water, soft along its top and at both ends. */
function fog(a: [number, number], b: [number, number], top: number, density: number, steps = 24) {
  for (let i = 0; i < steps; i++) {
    const at = (k: number) => { const t = (i + k) / steps; return [...polar(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t), t]; };
    const p = at(0), q = at(1);
    for (const [c, h] of [[p, 0], [q, 0], [q, 1], [p, 0], [q, 1], [p, 1]] as [number[], number][]) { mist.position.push(c[0], WATER + h * top, c[1]); mist.aFog.push(c[2], h, density); }
  }
}

/** Where a cable hangs at `u`. `piers` are [position along, top]; between two towers it is a parabola down to the deck. */
function hang(u: number, piers: number[][], deck: number) {
  let i = 0;
  while (i < piers.length - 2 && u > piers[i + 1][0]) i++;
  const [a, ya] = piers[i], [b, yb] = piers[i + 1], s = (u - a) / (b - a);
  return Math.min(ya, yb) > deck + 80 ? deck + 4 + (ya - deck - 4) * (2 * s - 1) ** 2 : ya + (yb - ya) * s - (b - a) * 0.2 * s * (1 - s);
}
/** Main cables and hangers on both sides of a deck. */
function suspend(f: Matrix4, piers: number[][], deck: number, half: number, tint: Tint, each: (u: number, y: number) => void) {
  const from = piers[0][0], to = piers[piers.length - 1][0], STEP = 16;
  for (const w of [-half, half]) {
    for (let u = from; u < to - 1; u += STEP) {
      const next = Math.min(u + STEP, to), ya = hang(u, piers, deck), yb = hang(next, piers, deck);
      wire(f, [u, ya, w], [next, yb, w], tint);
      block(f, [(u + next) / 2, (ya + yb) / 2, w], [Math.hypot(next - u, yb - ya), 1.9, 1.2], tint, 0, Math.atan2(yb - ya, next - u));
    }
    for (let u = from + 30; u < to; u += 30) {
      const y = hang(u, piers, deck);
      if (y < deck + 7) continue;
      wire(f, [u, y, w], [u, deck, w], tint);
      if (w > 0 === half > 0) each(u, y);
    }
  }
}

const COIT = polar(...PLACES.coit);

// ---------------------------------------------------------------- the land we stand on
{
  const STEP = 50, at = (x: number, z: number) => { const g = ground(x, z); return g > 0 ? g : -4; };
  for (let x = -3700; x < 2500; x += STEP) for (let z = -1350; z < 1750; z += STEP) {
    const c = [[x, z], [x + STEP, z], [x + STEP, z + STEP], [x, z + STEP]].map(([px, pz]) => [px, at(px, pz), pz]);
    if (c.every((p) => p[1] < 0)) continue;
    const park = Math.hypot(x + 2700, z - 1500) < 850 || Math.hypot(x - COIT[0], z - COIT[1]) < 120;
    for (const i of [0, 3, 2, 0, 2, 1]) {
      const [px, py, pz] = c[i], e = 12;
      vertex(px, WATER + py, pz, (at(px - e, pz) - at(px + e, pz)) / (2 * e), 1, (at(px, pz - e) - at(px, pz + e)) / (2 * e), park ? SCRUB : LAND);
    }
  }
}

// ---------------------------------------------------------------- Golden Gate Bridge
{
  const f = frame(...polar(...PLACES.gate), 175); // +x runs south along the roadway; the near (east) side is z = -13.7
  const DECK = 67, piers = [[-983, 76], [-640, 227], [640, 227], [983, 76]];
  const lit = (y: number): Tint => [ORANGE[0], ORANGE[1], ORANGE[2], 1 - 0.55 * (y / 227)]; // flooded from the piers up
  for (const u of [-640, 640]) {
    for (const w of [-13.7, 13.7]) {
      for (const [a, b, along, across] of [[0, 70, 11, 7.5], [70, 112, 9.6, 6.4], [112, 152, 8.4, 5.6], [152, 191, 7.2, 4.9], [191, 227, 6.2, 4.2]]) block(f, [u, (a + b) / 2, w], [along, b - a, across], lit);
      lamp(place(f, [u, 231, w]), RED, { mode: BEACON, size: 1.6 });
    }
    for (const [y, h] of [[108, 9], [148, 7.5], [187, 7], [222, 10]]) block(f, [u, y, 0], [5.5, h, 27.4], lit); // the portals over the roadway
    for (const s of [-1, 1]) block(f, [u, 35, 0], [3, 3, 62], lit, s * Math.atan2(54, 27.4));               // cross bracing under it
    block(f, [u, 5, 0], [34, 10, 58], CONCRETE);
  }
  block(f, [0, DECK - 3.8, 0], [2740, 7.6, 27.4], [ORANGE[0], ORANGE[1], ORANGE[2], 0.35]);
  for (const u of [-983, 983]) for (const w of [-13.7, 13.7]) block(f, [u, 41, w], [15, 82, 9], CONCRETE); // pylons at the anchorages
  for (const u of [-1300, -1190, -1085, 1085, 1190, 1300]) block(f, [u, 30, 0], [5, 60, 22], lit);          // approach viaducts
  suspend(f, piers, DECK, -13.7, [ORANGE[0] * 0.8, ORANGE[1] * 0.8, ORANGE[2] * 0.8, 0.25], () => {});
  for (let i = 0; i <= 60; i++) lamp(place(f, [-1320 + i * 44, DECK + 9, i % 2 ? 13 : -13]), SODIUM, { mirror: i % 2 === 0 });
  for (let i = 0; i < 44; i++) { // traffic, both ways
    const south = i % 2 === 0, a: V3 = [south ? -1370 : 1370, DECK + 1.5, south ? -5 : 5], b: V3 = [-a[0], a[1], a[2]];
    lamp(place(f, a), south ? [1.5, 1.5, 1.3] : [1.6, 0.25, 0.15], { to: place(f, b), speed: 1 / (120 + phase() * 50), size: 0.4 });
  }
}

// ---------------------------------------------------------------- Bay Bridge, western span
{
  const from = polar(...PLACES.bayBridge[0]), to = polar(...PLACES.bayBridge[1]);
  const f = frame(from[0], from[1], (Math.atan2(to[0] - from[0], from[1] - to[1]) * 180) / Math.PI); // +x runs toward the city; the near side is z = +10
  const DECK = 62, piers = [[0, 70], [350, 160], [1054, 160], [1408, 96], [1762, 160], [2466, 160], [2820, 70]];
  for (const u of [350, 1054, 1762, 2466]) {
    for (const w of [-10, 10]) { block(f, [u, 80, w], [6.5, 160, 4.5], STEEL); lamp(place(f, [u, 164, w]), RED, { mode: BEACON, size: 1.6 }); }
    for (let y = 12; y < 150; y += 23) {
      block(f, [u, y + 23, 0], [4, 2.4, 20], STEEL);
      if (y !== 58) for (const s of [-1, 1]) block(f, [u, y + 11.5, 0], [2, 2, 30.5], STEEL, s * Math.atan2(23, 20)); // the roadway runs through the gap
    }
    block(f, [u, 4, 0], [24, 8, 42], CONCRETE);
  }
  block(f, [1408, 48, 0], [58, 96, 30], CONCRETE); // the anchorage in mid-bay that lets two suspension spans meet
  block(f, [1536, DECK - 5, 0], [3073, 13, 20], [0.22, 0.23, 0.25, 0.25]);
  for (const u of [120, 2640, 2940]) block(f, [u, 26, 0], [6, 52, 18], CONCRETE);
  const sparkle = rng(88);
  suspend(f, piers, DECK, 10, STEEL, (u, y) => { // the Bay Lights: white LEDs strung down every hanger on the side that faces the city
    for (let h = DECK + 6; h < y; h += 9) lamp(place(f, [u, h, 10.5]), [1.3, 1.45, 1.7], { mode: SPARKLE, size: 0.4, mirror: sparkle() < 0.3 });
  });
  for (let u = 20; u < 3073; u += 40) lamp(place(f, [u, DECK + 10, 10]), dim(LED, 0.85), { mirror: true });
  for (let i = 0; i < 60; i++) {
    const west = i % 2 === 0, a: V3 = [west ? 0 : 3073, DECK + 2.5, west ? 6 : -6], b: V3 = [3073 - a[0], a[1], a[2]];
    lamp(place(f, a), west ? [1.6, 0.25, 0.15] : [1.5, 1.5, 1.3], { to: place(f, b), speed: 1 / (130 + phase() * 50), size: 0.4 });
  }
}

// ---------------------------------------------------------------- Alcatraz
{
  const [x, z] = polar(...PLACES.alcatraz), f = frame(x, z, 118);
  build(new SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2).toNonIndexed(), new Matrix4().copy(f).multiply(T.makeScale(250, 34, 95)), ROCK);
  block(f, [20, 40, 0], [150, 13, 38], [0.4, 0.38, 0.33, 0.9]);    // the cellhouse, floodlit all night
  block(f, [-105, 31, 18], [46, 12, 24], [0.36, 0.34, 0.3, 0.7]);  // the old barracks by the dock
  block(f, [150, 34, -20], [10, 30, 10], STEEL);                   // water tower
  build(new CylinderGeometry(1.6, 2.4, 26, 10).toNonIndexed(), new Matrix4().copy(f).multiply(T.makeTranslation(-62, 53, -14)), [0.5, 0.49, 0.45, 0.4]);
  lamp(place(f, [-62, 67, -14]), [5, 5.4, 6], { mode: LIGHTHOUSE, size: 2.4, mirror: true });
  const r = rng(12);
  for (let i = 0; i < 36; i++) lamp(place(f, [-170 + r() * 350, 10 + r() * 34, 20 + r() * 60]), dim(r() < 0.5 ? SODIUM : WARM, 0.5 + 0.5 * r()), { mirror: r() < 0.6 });
}

// ---------------------------------------------------------------- Coit Tower, on Telegraph Hill
{
  const [x, z] = polar(...PLACES.coit), f = new Matrix4().makeTranslation(x, WATER + ground(x, z) - 2, z), white: Tint = [0.5, 0.48, 0.44, 0.45];
  const ring = (bottom: number, top: number, rb: number, rt: number, tint: Tint) => build(new CylinderGeometry(rt, rb, top - bottom, 24).toNonIndexed(), new Matrix4().copy(f).multiply(T.makeTranslation(0, (bottom + top) / 2, 0)), tint);
  ring(0, 6, 9, 9, white); ring(6, 54, 6.2, 5.4, white); ring(54, 60, 5.1, 5.1, [0.12, 0.11, 0.1, 0.5]); ring(60, 66, 5.4, 5.2, white); // base, fluted shaft, the open arcade, the crown
}

// ---------------------------------------------------------------- far shores
{
  const marin = skyline(5), tam = skyline(9), east = skyline(21), isle = skyline(33);
  // Marin Headlands: from Point Bonita behind the bridge, past its north end, round toward Sausalito
  ridge([277, 7600], [294, 3850], (t) => 30 + 250 * Math.min(1, t * 1.6) * (0.6 + 0.5 * marin(t * 5)), SCRUB, 50);
  ridge([294, 3850], [327, 5600], (t) => (250 + 80 * hump(t)) * (0.62 + 0.5 * marin(5 + t * 7)) * (1 - 0.45 * t), SCRUB);
  ridge([284, 8800], [345, 8200], (t) => 240 + 260 * marin(20 + t * 9), SCRUB);
  ridge([300, 15000], [340, 14500], (t) => 300 + 560 * Math.max(0, 1 - Math.abs(t - 0.56) * 2.3) ** 0.8 + 130 * tam(t * 6), SCRUB); // Mount Tamalpais
  ridge([334, 8600], [362, 7800], (t) => 150 * hump(t) ** 0.6 * (0.6 + 0.6 * isle(t * 6)), SCRUB, 50);                              // Tiburon
  ridge([7, 6100], [28, 5700], (t) => 245 * hump(t) ** 0.7 * (0.75 + 0.4 * isle(9 + t * 4)), SCRUB, 60);                            // Angel Island
  ridge([49, 4500], [61.5, 4350], () => 7, LAND, 8);                                                                                // Treasure Island
  ridge([61.2, 4500], [67, 4350], (t) => 105 * hump(t) ** 0.6 * (0.8 + 0.3 * isle(20 + t * 3)), SCRUB, 30);                         // Yerba Buena Island
  ridge([8, 17000], [118, 16000], (t) => 330 + 260 * east(t * 14), SCRUB, 160);                                                     // the East Bay hills
  ridge([60, 26000], [80, 26000], (t) => 1050 * Math.max(Math.max(0, 1 - Math.abs(t - 0.44) * 3.2), 0.8 * Math.max(0, 1 - Math.abs(t - 0.62) * 4.5)) ** 1.15, SCRUB, 60); // Mount Diablo

  // Fog through the Golden Gate: a bank standing behind the bridge, and wisps on the water in front of it.
  fog([255, 5200], [291, 4300], 190, 0.92);
  fog([262, 2950], [287, 3350], 46, 0.5);

  const r = rng(71);
  /** The lights of a town on a far shore, climbing `rise` metres up the hill behind it. */
  const town = (from: number, to: number, distance: number, depth: number, count: number, rise: number, tone: V3, gain = 1) => {
    for (let i = 0; i < count; i++) {
      const [x, z] = polar(from + (to - from) * r(), distance + depth * r()), climb = r() ** 2.2 * rise, k = gain * (0.45 + 0.9 * r());
      lamp([x, WATER + 5 + climb, z], dim(r() < 0.7 ? tone : r() < 0.6 ? LED : WARM, k), { habit: r() < 0.45 ? r() : 0, mirror: climb < 25 && r() < 0.55 });
    }
  };
  town(315, 327, 4550, 300, 300, 150, WARM, 0.8);      // Sausalito
  town(336, 358, 7450, 300, 220, 90, WARM, 0.7);       // Tiburon and Belvedere
  town(8, 30, 12600, 900, 380, 40, SODIUM, 0.7);       // Richmond
  town(28, 62, 12400, 1800, 1500, 300, SODIUM, 0.7);   // Albany and Berkeley
  town(60, 112, 11200, 2200, 1500, 230, SODIUM, 0.75); // Emeryville and Oakland
  town(49.5, 61, 4150, 180, 260, 8, LED, 0.6);         // Treasure Island
  town(62, 66, 4250, 60, 26, 60, WARM, 0.5);
  for (let i = 0; i < 7; i++) { const [x, z] = polar(10 + r() * 14, 5500 + r() * 200); lamp([x, WATER + 8 + r() * 40, z], dim(WARM, 0.5), { mirror: true }); } // Angel Island: a ranger station and not much else

  // Out on the water: ferries, a freighter inbound through the Gate, one riding at anchor.
  const vessel = (from: [number, number], to: [number, number], seconds: number, length: number) => {
    const a = polar(...from), b = polar(...to), speed = 1 / seconds, ph = r(), along = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let i = 0; i < Math.max(3, length / 14); i++) {
      const s = ((i / Math.max(2, length / 14)) * length) / along, y = WATER + (i ? 5 + (i % 3) * 3 : 16);
      lamp([a[0], y, a[1]], i ? dim(i % 4 === 1 ? RED : WARM, i % 4 === 1 ? 0.3 : 0.8) : LED, { to: [b[0], y, b[1]], speed, phase: ph + s, mirror: true, size: 0.5 });
    }
  };
  vessel([78, 2500], [322, 5000], 520, 40); vessel([326, 4800], [72, 2400], 610, 40); vessel([30, 3400], [300, 2500], 780, 28);
  vessel([272, 5200], [352, 3300], 900, 190); vessel([56, 3300], [56.2, 3300], 4000, 150);
  // And one airliner letting down toward Oakland.
  const up = polar(296, 11000), down = polar(84, 10000), ph = r();
  lamp([up[0], 1500, up[1]], RED, { to: [down[0], 650, down[1]], speed: 1 / 150, phase: ph, mode: STROBE, size: 2 });
  lamp([up[0], 1497, up[1]], dim(LED, 0.7), { to: [down[0], 647, down[1]], speed: 1 / 150, phase: ph, size: 1 });
}

// ---------------------------------------------------------------- materials
const SOLID_VERT = /* glsl */ `
attribute vec4 aTint;
varying vec3 vWorld, vNormal;
varying vec4 vTint;
void main(){
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz; vNormal = mat3(modelMatrix) * normal; vTint = aTint;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;
const SOLID_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uKeyDir, uKey;
uniform float uLamps;
varying vec3 vWorld, vNormal;
varying vec4 vTint;
${NOISE_GLSL}
${AIR_GLSL}
void main(){
  vec3 view = vWorld - cameraPosition;
  float dist = length(view);
  view /= dist;
  vec3 n = normalize(vNormal), base = vTint.rgb;
  if (vTint.a < 0.0) base *= 0.6 + 0.8 * fbm3(vWorld.xz * 0.004 + vWorld.y * 0.03); // scrub, rock, rooftops
  vec3 light = mix(uHorizon, uZenith, 0.5 + 0.5 * n.y) + horizonColor(n) * (1.0 - abs(n.y)) * 0.4 + uKey * max(dot(n, uKeyDir), 0.0) * 0.32;
  vec3 col = base * light;
  col += mix(base, vec3(dot(base, vec3(0.5))) * vec3(1.0, 0.62, 0.3), 0.35) * max(vTint.a, 0.0) * uLamps * 0.55; // sodium floodlights
  gl_FragColor = vec4(mix(col, airColor(view), 1.0 - exp(-dist * ${HAZE})), 1.0);
}`;

const WATER_FRAG = /* glsl */ `
precision highp float;
uniform float uTime, uMoon, uStars;
uniform vec3 uMoonDir, uSun;
varying vec3 vWorld;
${NOISE_GLSL}
${AIR_GLSL}
// wave slope at one scale, faded out before it gets smaller than a pixel and starts to shimmer
vec2 swell(vec2 p, float scale, vec2 drift, float amount){
  vec2 q = p * scale;
  float fade = 1.0 - smoothstep(0.25, 0.9, max(fwidth(q.x), fwidth(q.y)));
  return (texture2D(uNoise, (q + uTime * drift) / 256.0).gb - 0.5) * amount * fade;
}
void main(){
  vec3 view = vWorld - cameraPosition;
  float dist = length(view);
  view /= dist;
  vec2 p = vWorld.xz;
  vec2 slope = swell(p, 0.012, vec2(0.03, 0.02), 0.07) + swell(p.yx, 0.05, vec2(-0.06, 0.05), 0.11) + swell(p, 0.26, vec2(0.11, -0.16), 0.16);
  float calm = fbm3(p * 0.0006 + vec2(uTime * 0.002, 3.0)); // cat's paws: patches the wind has and has not reached
  slope *= 0.55 + 0.9 * calm;
  vec3 n = normalize(vec3(-slope.x, 1.0, -slope.y));
  vec3 r = reflect(view, n);
  r.y = abs(r.y) + 0.012 + 0.03 * calm; // unresolved chop tips the mirror up, away from the brightest of the horizon
  float fresnel = 0.04 + 0.96 * pow(1.0 - max(dot(-view, n), 0.0), 5.0);
  vec3 body = (uZenith * 0.7 + uHorizon * 0.3) * vec3(0.22, 0.42, 0.48);
  vec3 col = mix(body, airColor(normalize(r)), fresnel) * (0.86 + 0.28 * calm);
  col += vec3(0.011, 0.01, 0.012) * uStars * (0.5 + calm); // at night the water holds a little of the glow of the city round it

  // glitter paths: a low sun or moon smears down the water toward the eye, breaking up on the chop
  float chop = 0.45 + 1.1 * n2(p * 0.021 + uTime * vec2(0.5, 0.3)) * n2(p.yx * 0.057 - uTime * 0.4);
  vec3 toSun = normalize(r) - uSunDir, toMoon = normalize(r) - uMoonDir;
  col += uSun * exp(-dot(toSun.xz, toSun.xz) * 260.0 - toSun.y * toSun.y * 14.0) * chop * 1.6 * step(0.0, uSunDir.y + 0.02);
  col += vec3(0.62, 0.76, 1.0) * uMoon * exp(-dot(toMoon.xz, toMoon.xz) * 520.0 - toMoon.y * toMoon.y * 22.0) * chop * 0.75;
  gl_FragColor = vec4(mix(col, airColor(view), 1.0 - exp(-dist * ${HAZE})), 1.0);
}`;

const FOG_VERT = /* glsl */ `
attribute vec3 aFog; // along 0..1, up 0..1, density
varying vec3 vWorld, vFog;
void main(){ vFog = aFog; vec4 world = modelMatrix * vec4(position, 1.0); vWorld = world.xyz; gl_Position = projectionMatrix * viewMatrix * world; }`;
const FOG_FRAG = /* glsl */ `
precision highp float;
uniform float uTime, uStars, uLamps;
uniform vec3 uKey;
varying vec3 vWorld, vFog;
${NOISE_GLSL}
${AIR_GLSL}
void main(){
  vec3 view = normalize(vWorld - cameraPosition);
  float billow = fbm5(vec2(vFog.x * 16.0 - uTime * 0.008, vFog.y * 2.2 + uTime * 0.003));
  float top = 0.3 + 0.7 * billow; // the bank's upper edge, in the same 0..1 as vFog.y
  float a = vFog.z * smoothstep(top, top - 0.3, vFog.y) * smoothstep(0.0, 0.14, vFog.x) * smoothstep(1.0, 0.86, vFog.x);
  vec3 col = horizonColor(view) * (0.7 + 0.5 * billow) + uZenith * 0.5 + uKey * 0.035 + vec3(0.06, 0.036, 0.02) * uStars * uLamps;
  gl_FragColor = vec4(col, a);
}`;

// Lights are points with a floor on their size: a street lamp ten kilometres off is far smaller than a pixel, and
// drawn at its true size it would flicker in and out as the camera moves. Distance takes it out in brightness instead.
const LAMP_VERT = /* glsl */ `
attribute vec3 aTo, aTint;
attribute vec4 aLamp; // phase, trips per second, size in metres, mode
attribute vec2 aMore; // window habit (0 = always lit), mirrored on the water
uniform float uTime, uPx, uDot, uLit, uLamps;
varying vec3 vColor;
varying float vSeed, vLen;
vec3 lampAt(){ return mix(position, aTo, fract(uTime * aLamp.y + aLamp.x)); }
float lampGain(float dist){
  float seed = aLamp.x, mode = aLamp.w, g = 0.5 + 0.5 * uLamps;
  if (aMore.x > 0.0) g *= step(aMore.x, uLit * 1.6);
  g *= 1.0 - 0.45 * smoothstep(1500.0, 9000.0, dist) * (0.5 + 0.5 * sin(uTime * (2.0 + 5.0 * fract(seed * 7.3)) + seed * 80.0)); // scintillation
  if (mode > 3.5) g *= 0.2 + 0.8 * pow(0.5 + 0.5 * sin(uTime * (1.2 + 2.6 * fract(seed * 5.1)) + seed * 50.0), 3.0);
  else if (mode > 2.5) g *= step(fract(uTime * 0.9 + seed), 0.07);
  else if (mode > 1.5) g *= 0.3 + pow(max(sin(uTime * 1.2566 + seed), 0.0), 60.0) * 3.0; // one flash every five seconds
  else if (mode > 0.5) g *= fract(uTime * 0.55) < 0.45 ? 1.0 : 0.06;
  return g * mix(1.0, 0.5, smoothstep(2500.0, 16000.0, dist));
}
// depth as if the light were a touch nearer, so it never fights the wall or hillside it is mounted on
vec4 project(vec4 mv, float pull){
  vec4 at = projectionMatrix * mv, nearer = projectionMatrix * vec4(mv.xyz * pull, 1.0);
  at.z = nearer.z / nearer.w * at.w;
  return at;
}`;
const GLOW_VERT = LAMP_VERT + /* glsl */ `
void main(){
  vec4 mv = viewMatrix * modelMatrix * vec4(lampAt(), 1.0);
  float dist = length(mv.xyz);
  gl_Position = project(mv, 0.985);
  gl_PointSize = clamp(aLamp.z * uPx * projectionMatrix[1][1] / dist, uDot * (0.85 + 0.5 * fract(aLamp.x * 31.7)), 40.0);
  vColor = aTint * lampGain(dist);
}`;
const GLOW_FRAG = /* glsl */ `
varying vec3 vColor;
void main(){ gl_FragColor = vec4(vColor * smoothstep(0.5, 0.22, length(gl_PointCoord - 0.5)), 1.0); }`;
// The same lights again, as the wavering streak each one lays on the water: placed where the eye would see the mirror image.
const STREAK_VERT = LAMP_VERT + /* glsl */ `
void main(){
  vec3 p = lampAt();
  float h = p.y - (${WATER}.0), eye = cameraPosition.y - (${WATER}.0), t = eye / max(eye + h, 1.0);
  vec4 mv = viewMatrix * vec4(mix(cameraPosition.x, p.x, t), ${WATER}.0, mix(cameraPosition.z, p.z, t), 1.0);
  float dist = length(mv.xyz);
  vLen = uPx * 0.075 * (0.6 + 0.8 * fract(aLamp.x * 13.7)) * mix(1.0, 0.5, smoothstep(3000.0, 12000.0, dist));
  vSeed = aLamp.x;
  vColor = aTint * lampGain(dist) * 0.42;
  gl_Position = aMore.y > 0.5 && h > 0.0 && eye > 1.0 ? project(mv, 0.995) : vec4(2.0, 2.0, 2.0, 1.0);
  gl_PointSize = max(vLen, 4.0);
}`;
const STREAK_FRAG = /* glsl */ `
uniform float uTime, uDot;
varying vec3 vColor;
varying float vSeed, vLen;
void main(){
  vec2 q = gl_PointCoord - 0.5;
  float y = gl_FragCoord.y / uDot;
  float sway = sin(y * 0.5 + uTime * 2.6 + vSeed * 40.0) * 0.3 + sin(y * 1.3 - uTime * 4.1 + vSeed * 17.0) * 0.16;
  float x = (q.x * vLen) / uDot + sway;
  float a = exp(-x * x * 2.4) * smoothstep(0.5, 0.05, abs(q.y)) * (0.45 + 0.55 * sin(y * 0.9 - uTime * 3.3 + vSeed * 60.0));
  gl_FragColor = vec4(vColor * a, 1.0);
}`;

const geometry = (data: Record<string, number[]>, sizes: Record<string, number>) => {
  const g = new BufferGeometry();
  for (const [name, values] of Object.entries(data)) g.setAttribute(name, new Float32BufferAttribute(values, sizes[name] ?? 3));
  return g;
};
const far = <M extends Mesh | LineSegments | Points>(o: M, order = 0) => { o.frustumCulled = false; o.matrixAutoUpdate = false; o.renderOrder = order; return o; };

export const bay = new Group();

/** Build the bay once everything that stands in it, the city included, has been added. */
export function fillBay() {
  const shaded = new ShaderMaterial({ uniforms: { ...U }, vertexShader: SOLID_VERT, fragmentShader: SOLID_FRAG, side: DoubleSide });
  const water = new Mesh(new PlaneGeometry(90000, 90000).rotateX(-Math.PI / 2).translate(0, WATER, 0), new ShaderMaterial({
    uniforms: { ...U }, fragmentShader: WATER_FRAG,
    vertexShader: /* glsl */ `varying vec3 vWorld; void main(){ vec4 world = modelMatrix * vec4(position, 1.0); vWorld = world.xyz; gl_Position = projectionMatrix * viewMatrix * world; }`,
  }));
  const lights = geometry(lamps, { aLamp: 4, aMore: 2 });
  const additive = { uniforms: { ...U }, transparent: true, depthWrite: false, blending: AdditiveBlending };
  // The far transparent layers draw before anything in the room (holograms, glass), which must stay in front of them.
  bay.add(
    far(water),
    far(new Mesh(geometry(solid, { aTint: 4 }), shaded)),
    far(new LineSegments(geometry(wires, { aTint: 4 }), shaded)),
    far(new Mesh(geometry(mist, {}), new ShaderMaterial({ uniforms: { ...U }, vertexShader: FOG_VERT, fragmentShader: FOG_FRAG, transparent: true, depthWrite: false, side: DoubleSide })), -30),
    far(new Points(lights, new ShaderMaterial({ ...additive, vertexShader: STREAK_VERT, fragmentShader: STREAK_FRAG })), -20),
    far(new Points(lights, new ShaderMaterial({ ...additive, vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG })), -10),
  );
}
