// The projectors and the holograms they throw. Each one is drawn from what it stands for: a service graph with
// traffic running through it, a city map with a route found across it, and the skills as an auto-battler board with
// one piece per skill. Lines, points and a few plates, all additive, so they feed the bloom pass, light the desk and
// show up in the floor like any other lamp.
import {
  AdditiveBlending, BufferGeometry, CanvasTexture, CylinderGeometry, DoubleSide, Float32BufferAttribute, Group, LineSegments, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, PointLight, Points, ShaderMaterial, Sprite, SpriteMaterial, type Object3D,
} from "three";
import { portfolio } from "@/data/portfolio";
import { hologramsAt, SITES } from "@/lib/journey";
import { rng, U } from "./shared";

type V3 = [number, number, number];
type Uniforms = ReturnType<typeof uniforms>;
const TAU = Math.PI * 2;
const uPx = { value: 400 }; // half the render height in pixels: turns a point's size in metres into pixels
const uDim = { value: 1 };  // daylight washes a projection out
const uniforms = (base: number, height: number) => ({ uTime: U.uTime, uPx, uDim, uPower: { value: 0 }, uBase: { value: base }, uHeight: { value: height } });

// Colour of a fragment at world height vY. A projection builds upward from its emitter as uPower goes 0 -> 1,
// with a bright scan front; once up it keeps fine scanlines and a slight flicker. tone: 0 = blue, 1 = amber.
const HOLO = /* glsl */ `
uniform float uTime, uPower, uBase, uHeight, uDim;
varying float vY;
vec3 holo(float tone, float gain){
  float h = (vY - uBase) / uHeight, front = uPower * 1.25;
  float on = smoothstep(front, front - 0.1, h);
  float edge = smoothstep(0.07, 0.0, abs(h - front + 0.05)) * step(uPower, 0.97);
  float scan = 0.8 + 0.2 * sin(vY * 240.0 - uTime * 5.0);
  float flick = 0.95 + 0.05 * sin(uTime * 29.0 + vY * 7.0);
  return mix(vec3(0.2, 0.7, 1.0), vec3(1.0, 0.52, 0.18), tone) * gain * (on * scan * flick + edge * 2.0) * smoothstep(0.0, 0.2, uPower) * uDim;
}`;
const material = (u: Record<string, { value: unknown }>, vertexShader: string, fragment: string) =>
  new ShaderMaterial({ uniforms: u, vertexShader, fragmentShader: HOLO + fragment, transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide });

const LINE_VERT = /* glsl */ `
attribute vec3 aLook; // tone, gain, dash coordinate (-1 = solid)
varying vec3 vLook; varying float vY;
void main(){ vLook = aLook; vec4 wp = modelMatrix * vec4(position, 1.0); vY = wp.y; gl_Position = projectionMatrix * viewMatrix * wp; }`;
const LINE_FRAG = /* glsl */ `
varying vec3 vLook;
void main(){ if (vLook.z >= 0.0 && fract(vLook.z) > 0.5) discard; gl_FragColor = vec4(holo(vLook.x, vLook.y * 2.4), 1.0); }`;
const DOT_VERT = /* glsl */ `
attribute vec3 aTo; attribute vec4 aDot; // phase, trips per second, size in metres, tone
uniform float uTime, uPx;
varying float vTone, vY;
void main(){
  vec4 wp = modelMatrix * vec4(mix(position, aTo, fract(uTime * aDot.y + aDot.x)), 1.0), mv = viewMatrix * wp;
  vY = wp.y; vTone = aDot.w; gl_Position = projectionMatrix * mv;
  gl_PointSize = max(aDot.z * uPx * projectionMatrix[1][1] / -mv.z, 1.5);
}`;
const DOT_FRAG = /* glsl */ `
varying float vTone;
void main(){ gl_FragColor = vec4(holo(vTone, 3.2) * smoothstep(0.5, 0.08, length(gl_PointCoord - 0.5)), 1.0); }`;
const FILL_VERT = /* glsl */ `
varying vec2 vUv; varying float vY;
void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vY = wp.y; gl_Position = projectionMatrix * viewMatrix * wp; }`;
const BEAM_FRAG = /* glsl */ `
varying vec2 vUv;
void main(){ gl_FragColor = vec4(holo(0.0, 0.16 * pow(clamp(1.0 - vUv.y, 0.0, 1.0), 1.7)), 1.0); }`;
/** Line work, collected segment by segment and drawn in one call. */
class Wire {
  private p: number[] = [];
  private look: number[] = [];
  line(a: V3, b: V3, tone = 0, gain = 1, t0 = -1, t1 = -1) { this.p.push(...a, ...b); this.look.push(tone, gain, t0, tone, gain, t1); return this; }
  path(points: V3[], tone = 0, gain = 1, dash = 0) { for (let i = 1; i < points.length; i++) this.line(points[i - 1], points[i], tone, gain, dash ? (i - 1) * dash : -1, dash ? i * dash : -1); return this; }
  /** Circle or arc in the XZ plane; `dash` breaks it into that many dashes. */
  ring(c: V3, r: number, { tone = 0, gain = 1, from = 0, to = TAU, dash = 0 } = {}) {
    const n = Math.ceil((to - from) / 0.09), at = (i: number): V3 => { const a = from + ((to - from) * i) / n; return [c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r]; };
    for (let i = 0; i < n; i++) this.line(at(i), at(i + 1), tone, gain, dash ? (dash * i) / n : -1, dash ? (dash * (i + 1)) / n : -1);
    return this;
  }
  ticks(c: V3, r0: number, r1: number, count: number, gain = 0.7, every = 0, r2 = r1) {
    for (let i = 0; i < count; i++) { const a = (i / count) * TAU, r = every && i % every === 0 ? r2 : r1; this.line([c[0] + Math.cos(a) * r0, c[1], c[2] + Math.sin(a) * r0], [c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r], 0, gain); }
    return this;
  }
  box([x0, y0, z0]: V3, [x1, y1, z1]: V3, tone = 0, gain = 1) {
    for (const y of [y0, y1]) this.path([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [x0, y, z0]], tone, gain);
    for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) this.line([x, y0, z], [x, y1, z], tone, gain);
    return this;
  }
  /** Small octahedron: marks a node that matters. */
  gem([x, y, z]: V3, r: number, tone = 0, gain = 1) {
    const eq: V3[] = [[x + r, y, z], [x, y, z + r], [x - r, y, z], [x, y, z - r]];
    eq.forEach((e, i) => { this.line(e, eq[(i + 1) % 4], tone, gain); this.line(e, [x, y + r * 1.4, z], tone, gain); this.line(e, [x, y - r * 1.4, z], tone, gain); });
    return this;
  }
  build(u: Uniforms) {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(this.p, 3));
    g.setAttribute("aLook", new Float32BufferAttribute(this.look, 3));
    return new LineSegments(g, material(u, LINE_VERT, LINE_FRAG));
  }
}

/** Glowing points: fixed nodes, and pulses that travel from a to b over and over. */
class Dots {
  private a: number[] = [];
  private b: number[] = [];
  private dot: number[] = [];
  add(a: V3, size: number, tone = 0) { return this.move(a, a, size, tone, 0, 0); }
  move(a: V3, b: V3, size: number, tone: number, speed: number, phase: number) { this.a.push(...a); this.b.push(...b); this.dot.push(phase, speed, size, tone); return this; }
  build(u: Uniforms) {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(this.a, 3));
    g.setAttribute("aTo", new Float32BufferAttribute(this.b, 3));
    g.setAttribute("aDot", new Float32BufferAttribute(this.dot, 4));
    const points = new Points(g, material(u, DOT_VERT, DOT_FRAG));
    points.frustumCulled = false; // the pulses leave the bounds of their start points
    return points;
  }
}

const spinning: [Object3D, number][] = []; // object, radians per second about its own Y
function spin(parent: Object3D, wire: Wire, u: Uniforms, y: number, speed: number, tiltX = 0, tiltZ = 0) {
  const tilt = new Group(), o = wire.build(u);
  tilt.position.y = y;
  tilt.rotation.set(tiltX, 0, tiltZ);
  tilt.add(o);
  parent.add(tilt);
  spinning.push([o, speed]);
}
/** The faint cone of light between an emitter and what it projects. */
function beam(parent: Object3D, u: Uniforms, radius: number, height: number, foot = 0.04) {
  const m = new Mesh(new CylinderGeometry(radius, foot, height, 40, 1, true), material(u, FILL_VERT, BEAM_FRAG));
  m.position.y = height / 2;
  parent.add(m);
}
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// ---------------------------------------------------------------- systems: services, the calls between them, traffic
function systems(u: Uniforms) {
  const r = rng(11), g = new Group(), wire = new Wire(), dots = new Dots(), K = 0.6, C = 0.47; // K: the size of the whole graph, C: its middle above the desk
  const nodes: V3[] = [];
  while (nodes.length < 26) {
    const p: V3 = [(r() * 2 - 1) * 0.46 * K, C + (r() * 2 - 1) * 0.3 * K, (r() * 2 - 1) * 0.46 * K];
    if (Math.hypot(p[0], (p[1] - C) * 1.5, p[2]) < 0.46 * K && nodes.every((q) => dist(p, q) > 0.15 * K)) nodes.push(p);
  }
  const HUBS = 4, seen = new Set<string>();
  const link = (i: number, j: number, gain: number) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (i === j || seen.has(key)) return;
    seen.add(key);
    wire.line(nodes[i], nodes[j], 0, gain);
    if (r() < 0.75) dots.move(nodes[i], nodes[j], 0.02 * K, 1, 0.14 + r() * 0.3, r());
  };
  const nearest = (i: number, pool: number[]) => pool.filter((j) => j !== i).sort((a, b) => dist(nodes[i], nodes[a]) - dist(nodes[i], nodes[b]))[0];
  const hubs = [...Array(HUBS).keys()], rest = nodes.map((_, i) => i).slice(HUBS);
  hubs.forEach((i) => { link(i, (i + 1) % HUBS, 0.8); wire.gem(nodes[i], 0.034 * K, 0, 1.1); dots.add(nodes[i], 0.05 * K); });
  rest.forEach((i) => { link(i, nearest(i, hubs), 0.55); link(i, nearest(i, rest), 0.4); dots.add(nodes[i], 0.028 * K); });

  g.add(wire.build(u), dots.build(u));
  spin(g, new Wire().ring([0, 0, 0], 0.6 * K, { gain: 0.6 }).ticks([0, 0, 0], 0.6 * K, 0.618 * K, 72, 0.5, 6, 0.645 * K), u, C, 0.1);
  spin(g, new Wire().ring([0, 0, 0], 0.54 * K, { gain: 0.7, dash: 46 }), u, C, -0.17, 1.12);
  spin(g, new Wire().ring([0, 0, 0], 0.66 * K, { gain: 1, to: 1.2 }).ring([0, 0, 0], 0.66 * K, { gain: 1, from: 2.1, to: 3.3 }).ring([0, 0, 0], 0.66 * K, { tone: 1, gain: 1, from: 4.2, to: 5.4 }), u, C, 0.26, -0.5, 0.42);
  g.add(new Wire().ring([0, 0.004, 0], 0.11, { gain: 0.8 }).ring([0, 0.004, 0], 0.15, { gain: 0.5, dash: 18 }).ticks([0, 0.004, 0], 0.165, 0.185, 24, 0.5).build(u));
  beam(g, u, 0.5 * K, C - 0.12 * K);
  return g;
}

// ---------------------------------------------------------------- route: a city block model with a path found through its traffic
function route(u: Uniforms) {
  const r = rng(23), g = new Group(), map = new Group(), wire = new Wire(), dots = new Dots();
  const cuts = (n: number, span: number) => { const w = Array.from({ length: n }, () => 0.7 + r() * 0.6), sum = w.reduce((a, b) => a + b, 0); let at = -span / 2; return [at, ...w.map((x) => (at += (x / sum) * span))]; };
  const xs = cuts(8, 1), zs = cuts(5, 0.62), X = xs.length - 1, Z = zs.length - 1, node = (i: number, j: number, y = 0.003): V3 => [xs[i], y, zs[j]];
  for (const x of xs) wire.line([x, 0, zs[0]], [x, 0, zs[Z]], 0, 0.22);
  for (const z of zs) wire.line([xs[0], 0, z], [xs[X], 0, z], 0, 0.22);
  for (let i = 0; i < X; i++) for (let j = 0; j < Z; j++) {
    if (r() < 0.22) continue; // a park, a car park
    const centre = 1 - Math.hypot((i + 0.5) / X - 0.5, (j + 0.5) / Z - 0.5) * 1.4, h = 0.015 + r() * r() * 0.15 * Math.max(centre, 0.25), s = 0.014;
    wire.box([xs[i] + s, 0, zs[j] + s], [xs[i + 1] - s, h, zs[j + 1] - s], 0, 0.3 + h * 2);
  }
  // Two ways across town, each a staircase of right and up moves: the one that was found (amber) and the one it beat (dashed).
  const walk = (bias: number) => { const steps: [number, number][] = [[0, Z]]; let i = 0, j = Z; while (i < X || j > 0) { if (j === 0 || (i < X && r() < bias)) i++; else j--; steps.push([i, j]); } return steps; };
  const best = walk(0.62), other = walk(0.4);
  wire.path(other.map(([i, j]) => node(i, j)), 0, 0.9, 1.5);
  wire.path(best.map(([i, j]) => node(i, j, 0.006)), 1, 2.2);
  best.slice(1).forEach(([i, j], k) => dots.move(node(...best[k], 0.006), node(i, j, 0.006), 0.03, 1, 0.55, (k % 3) / 3));
  for (let n = 0; n < 34; n++) { // everyone else on the road
    const along = r() < 0.5, i = Math.floor(r() * (along ? X : X + 1)), j = Math.floor(r() * (along ? Z + 1 : Z));
    const a = node(i, j), b = along ? node(i + 1, j) : node(i, j + 1), back = r() < 0.5;
    dots.move(back ? b : a, back ? a : b, 0.012, 0, 0.1 + r() * 0.25, r());
  }
  for (const [i, j] of [best[0], best[best.length - 1]]) { const [x, , z] = node(i, j); wire.line([x, 0, z], [x, 0.22, z], 1, 1.1).gem([x, 0.25, z], 0.02, 1, 1.4); dots.add([x, 0.25, z], 0.03, 1); }
  const fx = 0.55, fz = 0.36, c = 0.07; // frame: corner brackets and a scale along the near edge
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) wire.path([[sx * (fx - c), 0, sz * fz], [sx * fx, 0, sz * fz], [sx * fx, 0, sz * (fz - c)]], 0, 1);
  for (let i = 0; i <= 20; i++) wire.line([-0.5 + i / 20, 0, fz], [-0.5 + i / 20, 0, fz + (i % 5 ? 0.012 : 0.028)], 0, 0.6);

  map.add(wire.build(u), dots.build(u));
  map.position.set(0.03, 0.4, 0.04);
  map.rotation.set(0.95, 0.76, 0, "YXZ"); // tipped up like a drafting table, toward where you stand to read the projects
  map.scale.setScalar(0.66);
  g.add(map, new Wire().ring([0, 0.004, 0], 0.11, { gain: 0.8 }).ring([0, 0.004, 0], 0.15, { tone: 1, gain: 0.6, dash: 18 }).build(u));
  beam(g, u, 0.26, 0.28);
  return g;
}

// ---------------------------------------------------------------- board: a hex board with one piece per skill, and the traits they add up to
const labelGlow = new MeshBasicMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide });
const YAW = -0.89; // toward where you stand to read the skills
function board(u: Uniforms) {
  const groups = portfolio.skills, pieces = groups.flatMap((s, c) => s.items.map(() => c));
  const g = new Group(), tilt = new Group(), wire = new Wire(), dots = new Dots();
  const R = 0.082, DX = Math.sqrt(3) * R, DZ = 1.5 * R, COLS = 7, ROWS = Math.ceil(pieces.length / COLS);
  const hex = ([x, y, z]: V3, r: number): V3[] => Array.from({ length: 7 }, (_, k) => { const a = (k * Math.PI) / 3 + Math.PI / 6; return [x + Math.cos(a) * r, y, z + Math.sin(a) * r]; });
  for (let i = 0; i < ROWS * COLS; i++) {
    const row = Math.floor(i / COLS), c: V3 = [((i % COLS) - (COLS - 1) / 2 + (row % 2 ? 0.25 : -0.25)) * DX, 0, (row - (ROWS - 1) / 2) * DZ], of = pieces[i];
    wire.path(hex(c, R * 0.94), 0, of === undefined ? 0.2 : 0.45);
    if (of === undefined) continue; // an empty hex
    // a piece: a small tapered prism, taller for the groups listed first, alternating colour so each group reads as a block
    const tone = of % 2, h = 0.05 + 0.08 * (1 - of / groups.length), foot = hex(c, R * 0.52), head = hex([c[0], h, c[2]], R * 0.34);
    wire.path(foot, tone, 0.8).path(head, tone, 1.2);
    for (let k = 0; k < 6; k++) wire.line(foot[k], head[k], tone, 0.6);
    dots.add([c[0], h + 0.022, c[2]], 0.017, tone);
  }
  const fx = (COLS / 2 + 0.45) * DX, fz = (ROWS / 2) * DZ + R * 0.5, corner = 0.07;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) wire.path([[sx * (fx - corner), 0, sz * fz], [sx * fx, 0, sz * fz], [sx * fx, 0, sz * (fz - corner)]], 0, 1);
  tilt.add(wire.build(u), dots.build(u));
  tilt.position.y = 0.62;
  tilt.rotation.set(0.82, YAW, 0, "YXZ"); // tipped up like a game board seen from the player's seat
  g.add(tilt);

  // the traits: how many pieces each group fields
  const canvas = document.createElement("canvas"), ROW = 60, W = 0.6, H = (W * ROW * groups.length) / 512;
  canvas.width = 512; canvas.height = ROW * groups.length;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.textBaseline = "middle";
  groups.forEach((s, i) => {
    const y = ROW * (i + 0.5);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3 + Math.PI / 6; ctx[k ? "lineTo" : "moveTo"](30 + Math.cos(a) * 22, y + Math.sin(a) * 22); }
    ctx.closePath(); ctx.stroke();
    ctx.font = "600 24px ui-monospace, SFMono-Regular, Menlo, monospace"; ctx.textAlign = "center"; ctx.fillText(String(s.items.length), 30, y + 1);
    ctx.font = "600 27px ui-monospace, SFMono-Regular, Menlo, monospace"; ctx.textAlign = "left"; ctx.fillText(s.cat, 70, y + 1);
  });
  labelGlow.map = new CanvasTexture(canvas);
  labelGlow.map.anisotropy = 8;
  const traits = new Mesh(new PlaneGeometry(W, H), labelGlow);
  traits.position.set(0.5, 1.02, 0.52);
  traits.rotation.y = YAW;
  g.add(traits);

  spin(g, new Wire().ring([0, 0, 0], 0.3, { gain: 0.8, dash: 30 }).ring([0, 0, 0], 0.35, { tone: 1, gain: 0.9, to: 1.6 }), u, 0.16, 0.2);
  g.add(new Wire().ring([0, 0.004, 0], 0.2, { gain: 0.8 }).ring([0, 0.004, 0], 0.27, { gain: 0.5, dash: 24 }).ticks([0, 0.004, 0], 0.3, 0.33, 36, 0.5, 3, 0.36).build(u));
  beam(g, u, 0.5, 0.42, 0.06);
  return g;
}

// ---------------------------------------------------------------- stations
// Additive light vanishes against a bright sky. Each projector also throws a faint dark field, like tinted glass,
// so the hologram keeps its colour at dusk and in front of lit windows.
const haze = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const ctx = c.getContext("2d")!, g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "#fff"); g.addColorStop(0.55, "rgba(255,255,255,0.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
})();
const metal = new MeshStandardMaterial({ color: 0x1a1d23, metalness: 0.85, roughness: 0.34 });
function station(x: number, y: number, z: number, size: number, lightY: number, field: [number, number], shows: { build: (u: Uniforms) => Group; height: number; of: keyof ReturnType<typeof hologramsAt> | "always" }[]) {
  const g = new Group(), lens = new MeshBasicMaterial();
  g.position.set(x, y, z);
  const puck = new Mesh(new CylinderGeometry(0.075 * size, 0.09 * size, 0.03 * size, 28), metal);
  puck.position.y = 0.015 * size; puck.castShadow = puck.receiveShadow = true;
  const glass = new Mesh(new CylinderGeometry(0.05 * size, 0.05 * size, 0.004, 24), lens);
  glass.position.y = 0.03 * size + 0.001;
  const light = new PointLight(0x46adff, 0, 5, 2);
  light.position.y = lightY;
  const shade = new Sprite(new SpriteMaterial({ map: haze, color: 0x02060f, transparent: true, depthWrite: false, opacity: 0 }));
  shade.position.y = lightY; shade.scale.set(field[0], field[1], 1); shade.renderOrder = -1;
  g.add(puck, glass, light, shade);
  holograms.add(g);
  return { lens, light, shade: shade.material, shows: shows.map((s) => { const u = uniforms(y, s.height), o = s.build(u); o.position.y = 0.03 * size; g.add(o); return { u, o, of: s.of }; }) };
}

export const holograms = new Group();
const stations = [
  // on the north end of the desk, clear of the monitors
  station(...SITES.a, 1, 0.5, [1.25, 1.15], [{ build: systems, height: 0.95, of: "systems" }, { build: route, height: 0.9, of: "route" }]),
  // on the low table in the lounge corner
  station(...SITES.b, 1.4, 0.75, [2.1, 1.8], [{ build: board, height: 1.45, of: "board" }]),
];

/** u = position along the journey (which projections are up), hour = time of night, px = half the render height in pixels. */
export function updateHolograms(time: number, u: number, hour: number, px: number) {
  const power = hologramsAt(u);
  uPx.value = px;
  uDim.value = 1 - 0.7 * Math.min(Math.max((hour - 29.6) / 0.8, 0), 1); // sunrise
  for (const s of stations) {
    let most = 0;
    for (const show of s.shows) { const p = show.of === "always" ? 1 : power[show.of]; show.u.uPower.value = p; show.o.visible = p > 0.002; most = Math.max(most, p); }
    s.light.intensity = 3.2 * most * uDim.value;
    s.shade.opacity = 0.5 * most * uDim.value;
    s.lens.color.setRGB(0.5, 1.9, 2.8).multiplyScalar((0.25 + most) * uDim.value);
    if (s.shows[0].of === "board") labelGlow.color.setRGB(0.5, 1.75, 2.5).multiplyScalar(most * most * uDim.value);
  }
  for (const [o, speed] of spinning) o.rotation.y = time * speed;
}
