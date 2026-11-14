// The room: a glass corner studio on the top floor, built from primitives. Glass to the west, north and half the
// east; an oak floor polished enough to carry the view; the desk and its rig along the west glass; a lounge corner
// to the north-east. Every matte surface takes its sky light through `indoor`, so the room is lit by its windows
// and its own lamps and not by an open sky it cannot see.
import {
  AdditiveBlending, AmbientLight, BoxGeometry, BufferGeometry, CanvasTexture, EdgesGeometry, LineBasicMaterial, LineSegments, MeshDepthMaterial, RGBADepthPacking, Color, CylinderGeometry, DirectionalLight, DoubleSide, Group, HalfFloatType, InstancedMesh, LatheGeometry, LinearFilter,
  LinearMipmapLinearFilter, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PerspectiveCamera, PlaneGeometry, PointLight,
  RepeatWrapping, ShaderMaterial, SphereGeometry, SRGBColorSpace, TorusGeometry, Vector2, Vector3, WebGLRenderTarget,
  type Camera, type Material, type MeshStandardMaterialParameters, type Scene, type WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { portfolio, stats } from "@/data/portfolio";
import { DESK, LIFT, ROOM, TABLE } from "@/lib/journey";
import { NOISE_GLSL, rng, U } from "./shared";
import type { SkyState } from "./sky-model";

const { w: W, e: E, n: N, s: S, h: H, split: SPLIT } = ROOM;
const rand = rng(99), f = (n: number) => n.toFixed(2);

// ---------------------------------------------------------------- textures (drawn once, no downloads)
function drawn(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, repeat: [number, number] = [1, 1]) {
  const el = document.createElement("canvas");
  el.width = w; el.height = h;
  draw(el.getContext("2d")!);
  const t = new CanvasTexture(el);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  return t;
}
const mono = (px: number, weight = 500) => `${weight} ${px}px ui-monospace, SFMono-Regular, Menlo, monospace`;
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const INK = "#0a0e16", BONE = "#e9e4d8", EMBER = "#ffb066", HOLO = "#7fd4ff", SLATE = "#8fa3c4";

const woodTex = drawn(256, 128, (c) => {
  c.fillStyle = "#553a26"; c.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 60; i++) {
    const y = rand() * 128, a = rand() * 5;
    c.strokeStyle = `rgba(${rand() < 0.3 ? "150,105,66" : "30,18,10"},${0.15 + rand() * 0.3})`;
    c.lineWidth = 0.5 + rand() * 1.4;
    c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(80, y + a, 170, y - a, 256, y + a * 0.5); c.stroke();
  }
});
const slatTex = drawn(64, 8, (c) => {
  const g = c.createLinearGradient(0, 0, 44, 0);
  g.addColorStop(0, "#2b1c12"); g.addColorStop(0.2, "#5b3d27"); g.addColorStop(0.8, "#4a301f"); g.addColorStop(1, "#22150d");
  c.fillStyle = "#030303"; c.fillRect(0, 0, 64, 8);
  c.fillStyle = g; c.fillRect(0, 0, 44, 8);
}, [(E - W) / 0.07, 1]);
const rugTex = drawn(512, 512, (c) => {
  c.fillStyle = "#1d2129"; c.fillRect(0, 0, 512, 512);
  c.strokeStyle = "#2a303b"; c.lineWidth = 2;
  for (let j = -1; j < 14; j++) for (let i = -1; i < 12; i++) { // a field of hexagons, a few of them filled
    const x = i * 48 + (j % 2 ? 24 : 0), y = j * 41.5;
    c.beginPath();
    for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3 + Math.PI / 6; c[k ? "lineTo" : "moveTo"](x + Math.cos(a) * 25, y + Math.sin(a) * 25); }
    c.closePath(); c.stroke();
    if (rand() < 0.07) { c.fillStyle = rand() < 0.4 ? "#6b4526" : "#2b3644"; c.fill(); }
  }
  c.strokeStyle = "#6b4526"; c.lineWidth = 5; c.strokeRect(14, 14, 484, 484);
});
const keyTex = drawn(64, 4, (c) => {
  const g = c.createLinearGradient(0, 0, 64, 0);
  g.addColorStop(0, HOLO); g.addColorStop(0.55, "#6f8dff"); g.addColorStop(1, EMBER);
  c.fillStyle = g; c.fillRect(0, 0, 64, 4);
});

/** Right monitor: an editor with a terminal open on the projects. The code is bars; only the terminal is real text. */
const codeTex = drawn(1024, 576, (c) => {
  c.fillStyle = INK; c.fillRect(0, 0, 1024, 576);
  c.fillStyle = "#0d121c"; c.fillRect(0, 0, 170, 576);
  for (let i = 0; i < 16; i++) { c.fillStyle = i === 4 ? HOLO : "#2a3446"; c.fillRect(18 + (i % 3 === 1 ? 14 : 0), 46 + i * 22, 56 + rand() * 70, 7); }
  c.fillStyle = "#101725"; c.fillRect(170, 0, 854, 30);
  c.fillStyle = INK; c.fillRect(170, 0, 150, 30);
  c.fillStyle = EMBER; c.fillRect(170, 0, 150, 2);
  const inks = [HOLO, BONE, EMBER, SLATE, BONE, "#5f6f8a"], indent = [0, 1, 1, 2, 2, 3, 2, 1, 1, 0, 0, 1, 2, 2, 1, 1, 0];
  indent.forEach((depth, i) => {
    c.fillStyle = "#2a3446"; c.fillRect(184, 50 + i * 21, 12, 6);
    if (i === 9) return;
    let x = 214 + depth * 26;
    for (let k = 2 + Math.floor(rand() * 4); k > 0; k--) { const w = 24 + rand() * 90; c.fillStyle = inks[Math.floor(rand() * inks.length)]; c.fillRect(x, 50 + i * 21, w, 7); x += w + 10; }
  });
  c.fillStyle = "#070a11"; c.fillRect(170, 418, 854, 158);
  c.fillStyle = "#1c2536"; c.fillRect(170, 418, 854, 2);
  c.font = mono(18); c.textBaseline = "top";
  const line = (x: number, y: number, parts: [string, string][]) => parts.reduce((at, [text, color]) => { c.fillStyle = color; c.fillText(text, at, y); return at + c.measureText(text).width; }, x);
  line(190, 432, [["huy@nob-hill", EMBER], [" ~ % ", "#7d8aa0"], ["ls projects/", BONE]]);
  portfolio.projects.slice(0, 8).forEach((p, i) => line(190 + (i % 2) * 410, 462 + Math.floor(i / 2) * 25, [[p.awards.length ? "★ " : "  ", EMBER], [clip(p.name, 30), p.awards.length ? "#ffd9a8" : "#a9c4ff"]]));
});
/** Left monitor: the roles as a scoreboard, the headline numbers underneath. */
const boardTex = drawn(1024, 576, (c) => {
  c.fillStyle = "#080c14"; c.fillRect(0, 0, 1024, 576);
  c.textBaseline = "top";
  c.font = mono(15, 600); c.fillStyle = HOLO;
  c.fillText("ROLE", 44, 30); c.fillText("ORG", 520, 30);
  c.textAlign = "right"; c.fillText("WHEN", 984, 30); c.textAlign = "left";
  c.fillStyle = "#1c2536"; c.fillRect(24, 58, 976, 2);
  portfolio.experience.slice(0, 6).forEach((e, i) => {
    const y = 80 + i * 52;
    if (!i) { c.fillStyle = "rgba(255,176,102,.14)"; c.fillRect(24, y - 12, 976, 46); c.fillStyle = EMBER; c.fillRect(24, y - 12, 4, 46); }
    c.fillStyle = i ? BONE : "#ffdcb4"; c.font = mono(21, 600); c.fillText(clip(e.role, 34), 44, y);
    c.fillStyle = SLATE; c.font = mono(17); c.fillText(clip(e.company.replace(/ Technologies Inc\.$/, ""), 28), 520, y + 2);
    c.textAlign = "right"; c.fillText(e.dates, 984, y + 2); c.textAlign = "left";
  });
  c.fillStyle = "#1c2536"; c.fillRect(24, 412, 976, 2);
  stats.forEach((s, i) => {
    const x = 44 + i * 244;
    c.fillStyle = i ? BONE : EMBER; c.font = mono(58, 600); c.fillText(s.value.replace("X", "×"), x, 438);
    c.fillStyle = SLATE; c.font = mono(14); c.fillText(s.label.toUpperCase(), x, 516);
  });
});
for (const t of [codeTex, boardTex]) t.wrapS = t.wrapT = 1001; // ClampToEdge: no bleed of the far edge into the bezel

// Three prints for the wall, drawn here: a board of hexagons, a set of rings with one shot off centre, and contours.
const prints = [
  drawn(300, 420, (c) => {
    c.fillStyle = "#e6dfd0"; c.fillRect(0, 0, 300, 420);
    for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) {
      const x = 62 + i * 44 + (j % 2 ? 22 : 0), y = 96 + j * 38;
      c.beginPath();
      for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3 + Math.PI / 6; c[k ? "lineTo" : "moveTo"](x + Math.cos(a) * 22, y + Math.sin(a) * 22); }
      c.closePath();
      const pick = rand();
      if (pick < 0.16) { c.fillStyle = "#d9772f"; c.fill(); } else if (pick < 0.4) { c.fillStyle = "#141a26"; c.fill(); }
      c.strokeStyle = "#141a26"; c.lineWidth = 1.5; c.stroke();
    }
  }),
  drawn(300, 420, (c) => {
    c.fillStyle = "#10151f"; c.fillRect(0, 0, 300, 420);
    c.strokeStyle = "#e6dfd0"; c.lineWidth = 1.2;
    for (let r = 18; r < 130; r += 16) { c.beginPath(); c.arc(150, 200, r, 0, Math.PI * 2); c.stroke(); }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { c.beginPath(); c.moveTo(150 + dx * 30, 200 + dy * 30); c.lineTo(150 + dx * 142, 200 + dy * 142); c.stroke(); }
    c.fillStyle = "#ff9a4a"; c.beginPath(); c.arc(171, 186, 7, 0, Math.PI * 2); c.fill();
  }),
  drawn(300, 420, (c) => {
    c.fillStyle = "#e6dfd0"; c.fillRect(0, 0, 300, 420);
    for (let k = 0; k < 26; k++) {
      c.strokeStyle = k % 5 === 2 ? "#2f5fbf" : "#141a26"; c.lineWidth = k % 5 === 2 ? 1.8 : 0.9;
      c.beginPath();
      for (let x = 24; x <= 276; x += 6) { const y = 60 + k * 12 + Math.sin(x * 0.021 + k * 0.33) * 22 + Math.sin(x * 0.05 - k * 0.2) * 9; c[x === 24 ? "moveTo" : "lineTo"](x, y); }
      c.stroke();
    }
  }),
];

// ---------------------------------------------------------------- materials
/** Share of the open sky that reaches a point in the room: half of it at the glass, next to none by the back wall. */
const SKYLIGHT = /* glsl */ `float skylight(vec3 p){
  float d = min(min(p.x - (${f(W)}), p.z - (${f(N)})), ${f(E)} - p.x + step(${f(SPLIT)}, p.z) * 9.0);
  return mix(0.07, 0.5, exp(-max(d, 0.0) / 1.5));
}`;
const WORLD_VERT = /* glsl */ `#include <begin_vertex>
#ifdef USE_INSTANCING
  vWorld = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
#else
  vWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
#endif`;
function indoor<T extends MeshStandardMaterial>(m: T): T {
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWorld;").replace("#include <begin_vertex>", WORLD_VERT);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorld;\n" + SKYLIGHT)
      .replace("#include <lights_fragment_maps>", "#include <lights_fragment_maps>\n{ float k = skylight(vWorld); iblIrradiance *= k; radiance *= k; }");
  };
  return m;
}
const std = (color: number, roughness: number, metalness = 0, more: MeshStandardMaterialParameters = {}) => indoor(new MeshStandardMaterial({ color, roughness, metalness, ...more }));
const plaster = std(0x40444c, 0.92);
const soffit = std(0x16171a, 0.95);
const steel = std(0x0e0f11, 0.5, 0.7);
const walnut = std(0xffffff, 0.48, 0, { map: woodTex });
const slats = std(0xffffff, 0.62, 0, { map: slatTex, bumpMap: slatTex, bumpScale: 3 });
const black = std(0x0b0c0e, 0.42, 0.2);
const plastic = std(0x16181c, 0.6);
const keycap = std(0x24272d, 0.7);
const fabric = std(0x1c1e23, 0.96);
const felt = std(0x111317, 1);
const leather = std(0x5e3d28, 0.52);
const ceramic = std(0xe6e1d6, 0.3);
const rubber = std(0xf0b400, 0.45);
const aluminium = std(0xa9afb5, 0.35, 1);
const trim = std(0xe0975a, 0.6);
const rug = std(0xffffff, 1, 0, { map: rugTex });
const leaf = std(0x2a5733, 0.5, 0, { side: DoubleSide });
const glow = (map?: CanvasTexture) => new MeshBasicMaterial({ ...(map && { map }), toneMapped: false });
const codeGlow = glow(codeTex), boardGlow = glow(boardTex), keyGlow = glow(keyTex), shadeGlow = glow(), coveGlow = glow(), rgbGlow = glow();
codeGlow.color.setScalar(1.5); boardGlow.color.setScalar(1.5); keyGlow.color.setScalar(1.3); rgbGlow.color.setRGB(0.6, 2.4, 3.4);
const smoked = new MeshBasicMaterial({ color: 0x05070a, transparent: true, opacity: 0.45, depthWrite: false });

// ---------------------------------------------------------------- floor: oak boards, with the room and the view in their polish
const target = new WebGLRenderTarget(4, 4, {
  type: HalfFloatType, generateMipmaps: true, minFilter: LinearMipmapLinearFilter, magFilter: LinearFilter, // mips = the blur of a satin finish
});
const mirrorUniforms = { uNoise: U.uNoise, tMirror: { value: target.texture }, uMirror: { value: new Matrix4() } };
const boards = new MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
boards.onBeforeCompile = (shader) => {
  Object.assign(shader.uniforms, mirrorUniforms);
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nuniform mat4 uMirror;\nvarying vec3 vWorld;\nvarying vec4 vMirror;")
    .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvMirror = uMirror * vec4(vWorld, 1.0);");
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", /* glsl */ `#include <common>
      uniform sampler2D tMirror;
      varying vec3 vWorld;
      varying vec4 vMirror;
      ${NOISE_GLSL}
      ${SKYLIGHT}
      vec3 fAlbedo; float fRough; vec2 fSlope;
      // 14 cm boards running east to west, each row cut at its own places; antialiased by hand
      void planks(){
        vec2 p = vWorld.xz;
        float row = floor(p.y / 0.14), along = p.x / 2.1 + hash4(vec2(row, 5.0)).x * 9.0;
        vec4 h = hash4(vec2(floor(along), row));
        vec2 q = vec2(fract(along) * 2.1, fract(p.y / 0.14) * 0.14);
        float edge = min(min(q.x, 2.1 - q.x), min(q.y, 0.14 - q.y)), aa = fwidth(edge) + 1e-4;
        float joint = (1.0 - smoothstep(0.001, 0.0022 + aa, edge)) * clamp(0.006 / aa, 0.0, 1.0);
        float grain = fbm3(vec2(p.x * 2.6 + h.x * 31.0, p.y * 52.0 + h.y * 17.0)), figure = n2(vec2(p.x * 0.7 + h.z * 13.0, p.y * 9.0));
        vec3 oak = mix(vec3(0.12, 0.074, 0.046), vec3(0.24, 0.155, 0.097), grain * 0.7 + figure * 0.3) * (0.78 + 0.44 * h.z);
        fAlbedo = mix(oak, vec3(0.012), joint * 0.85);
        fRough = clamp(0.22 + 0.2 * grain + joint * 0.4, 0.0, 1.0);
        fSlope = (vec2(grain, figure) - 0.5) * 0.02 * (1.0 - smoothstep(3.0, 12.0, length(cameraPosition - vWorld)));
      }`)
    .replace("#include <map_fragment>", "planks();\ndiffuseColor.rgb = fAlbedo;")
    .replace("#include <roughnessmap_fragment>", "float roughnessFactor = fRough;")
    .replace("#include <normal_fragment_maps>", "normal = normalize(normal + mat3(viewMatrix) * vec3(fSlope.x, 0.0, fSlope.y));")
    .replace("#include <lights_fragment_maps>", "#include <lights_fragment_maps>\n{ float k = skylight(vWorld); iblIrradiance *= k; radiance *= k * 0.25; }") // the mirror stands in for most of it
    .replace("#include <opaque_fragment>", /* glsl */ `
      {
        float facing = clamp(normalize(cameraPosition - vWorld).y, 0.0, 1.0);
        float fresnel = 0.05 + 0.95 * pow(1.0 - facing, 3.0);
        vec2 bend = (mat3(viewMatrix) * vec3(fSlope.x, 0.0, fSlope.y)).xy * 1.2;
        outgoingLight += texture2D(tMirror, vMirror.xy / vMirror.w + bend, 1.0 + fRough * 9.0).rgb * fresnel * (1.0 - fRough);
      }
      #include <opaque_fragment>`);
};

// ---------------------------------------------------------------- builders
export const room = new Group();
const under = new Group(); // whatever lies below the floor, and would block the mirror camera's view up into the room
room.add(under);
function put<T extends Object3D>(o: T, x: number, y: number, z: number, parent: Object3D = room, shadow = true) {
  o.position.set(x, y, z);
  o.castShadow = o.receiveShadow = shadow;
  parent.add(o);
  return o;
}
const box = (w: number, h: number, d: number, m: Material, x: number, y: number, z: number, parent?: Object3D, shadow = true) => put(new Mesh(new BoxGeometry(w, h, d), m), x, y, z, parent, shadow);
const soft = (w: number, h: number, d: number, r: number, m: Material, x: number, y: number, z: number, parent?: Object3D) => put(new Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m), x, y, z, parent);
const cyl = (top: number, bottom: number, h: number, m: Material, x: number, y: number, z: number, parent?: Object3D, sides = 20) => put(new Mesh(new CylinderGeometry(top, bottom, h, sides), m), x, y, z, parent);
const UNIT = new BoxGeometry(1, 1, 1);
/** Many boxes in one draw call: each is [width, height, depth, x, y, z]. */
function boxes(m: Material, list: number[][], parent: Object3D = room, shadow = true) {
  const mesh = new InstancedMesh(UNIT, m, list.length), o = new Object3D();
  list.forEach(([w, h, d, x, y, z], i) => { o.position.set(x, y, z); o.scale.set(w, h, d); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); });
  mesh.frustumCulled = false;
  return put(mesh, 0, 0, 0, parent, shadow);
}
const face = (w: number, h: number, m: Material, x: number, y: number, z: number, turn: number, parent?: Object3D) => { const o = put(new Mesh(new PlaneGeometry(w, h), m), x, y, z, parent, false); o.rotation.y = turn; return o; };

// ---------------------------------------------------------------- shell
const CX = (W + E) / 2, CZ = (N + S) / 2;
const floor = put(new Mesh(new PlaneGeometry(E - W, S - N).rotateX(-Math.PI / 2), boards), CX, 0, CZ, room, false);
floor.receiveShadow = true;
box(E - W + 0.5, 0.3, S - N + 0.5, steel, CX, -0.152, CZ, under, false);                 // the edge of the floor slab, seen from outside
box(E - W + 1.1, 0.34, S - N + 0.9, soffit, CX, H + 0.17, CZ + 0.1);                      // ceiling and roof in one
box(E - W + 0.5, H + 0.5, 6.2, soffit, CX, H / 2 + 0.1, S + 0.25 + 3.1);                  // the rest of the top floor, behind the south wall
box(E - W + 0.5, H, 0.25, plaster, CX, H / 2, S + 0.125);                                 // south wall
face(E - W, H, slats, CX, H / 2, S - 0.004, Math.PI).receiveShadow = true;                // faced in walnut slats
box(0.25, H, S - SPLIT, plaster, E + 0.125, H / 2, (SPLIT + S) / 2);                      // east wall, south of the glass
box(0.94, 2.12, 0.05, black, 2.85, 1.06, S - 0.02);                                       // door
box(0.03, 0.14, 0.05, aluminium, 2.5, 1.05, S - 0.06);
box(E - W - 0.3, 0.018, 0.05, coveGlow, CX, H - 0.05, S - 0.1, room, false);              // a line of warm light along the top of the wall
{
  // A bench-height sill under all the glass: a solid edge to the room, capped in walnut.
  const SILL = 0.46, sill = [[0.22, SILL, S - N, W + 0.11, SILL / 2, CZ], [E - W, SILL, 0.22, CX, SILL / 2, N + 0.11], [0.22, SILL, SPLIT - N, E - 0.11, SILL / 2, (N + SPLIT) / 2]];
  boxes(plaster, sill);
  boxes(walnut, sill.map(([w, , d, x, , z]) => [w + 0.03, 0.03, d + 0.03, x, SILL + 0.015, z]));
}
{
  // Glazing: corner posts, mullions and rails in black steel.
  const frame: number[][] = [];
  for (const [x, z] of [[W, N], [E, N], [W, S - 0.06], [E, SPLIT]]) frame.push([0.12, H, 0.12, x, H / 2, z]);
  for (let k = 1; k < 5; k++) frame.push([0.09, H, 0.05, W, H / 2, N + (k * (S - N)) / 5]);
  for (let k = 1; k < 6; k++) frame.push([0.05, H, 0.09, W + (k * (E - W)) / 6, H / 2, N]);
  for (let k = 1; k < 3; k++) frame.push([0.09, H, 0.05, E, H / 2, N + (k * (SPLIT - N)) / 3]);
  for (const y of [0.035, H - 0.035]) frame.push([0.1, 0.07, S - N, W, y, CZ], [E - W, 0.07, 0.1, CX, y, N], [0.1, 0.07, SPLIT - N, E, y, (N + SPLIT) / 2]);
  boxes(steel, frame);
}
// The glass itself: almost nothing head on, a veil of the room's own light at a glancing angle, a little grime.
const veil = new Color();
const glass = new ShaderMaterial({
  uniforms: { uNoise: U.uNoise, uVeil: { value: veil } }, transparent: true, depthWrite: false, side: DoubleSide,
  vertexShader: /* glsl */ `varying vec3 vWorld, vFace;
    void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vWorld = wp.xyz; vFace = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * wp; }`,
  fragmentShader: /* glsl */ `uniform vec3 uVeil; varying vec3 vWorld, vFace;
    ${NOISE_GLSL}
    void main(){
      float glance = pow(1.0 - abs(dot(normalize(cameraPosition - vWorld), normalize(vFace))), 3.0);
      float grime = fbm3(vec2(vWorld.x + vWorld.z, vWorld.y) * 1.7);
      gl_FragColor = vec4(uVeil * (0.6 + 0.8 * grime), 0.03 + 0.3 * glance + 0.03 * grime);
    }`,
});
face(S - N, H, glass, W, H / 2, CZ, Math.PI / 2);
face(E - W, H, glass, CX, H / 2, N, 0);
face(SPLIT - N, H, glass, E, H / 2, (N + SPLIT) / 2, Math.PI / 2);

// ---------------------------------------------------------------- the desk (local +x runs north along the glass, +z toward the chair)
const T = DESK.top;
const screenLight = put(new PointLight(0x9cc0ff, 1, 4.5, 2), DESK.x + 0.8, 1.15, DESK.z, room, false);
const deskLight = new PointLight(0xffb070, 1, 2.6, 2);
{
  const g = put(new Group(), DESK.x, 0, DESK.z);
  g.rotation.y = Math.PI / 2;
  box(2.0, 0.032, 0.8, walnut, 0, T - 0.016, 0, g);
  const legs: number[][] = [[1.7, 0.04, 0.03, 0, T - 0.052, -0.33]];
  for (const x of [-0.86, 0.86]) { for (const z of [-0.33, 0.33]) legs.push([0.05, T - 0.032, 0.05, x, (T - 0.032) / 2, z]); legs.push([0.05, 0.04, 0.7, x, 0.02, 0], [0.05, 0.04, 0.7, x, T - 0.052, 0]); }
  boxes(steel, legs, g);
  box(0.96, 0.004, 0.42, felt, 0, T + 0.002, 0.15, g);

  // two monitors on one arm, turned in toward the chair
  cyl(0.018, 0.018, 0.48, black, 0, T + 0.24, -0.34, g, 12);
  box(0.1, 0.012, 0.12, black, 0, T + 0.006, -0.33, g);
  box(0.8, 0.026, 0.03, black, 0, T + 0.36, -0.31, g);
  for (const [x, yaw, screen] of [[-0.37, 0.2, boardGlow], [0.37, -0.2, codeGlow]] as const) {
    const m = put(new Group(), x, T + 0.36, -0.2, g);
    m.rotation.y = yaw;
    soft(0.724, 0.42, 0.024, 0.008, black, 0, 0, -0.013, m);
    put(new Mesh(new PlaneGeometry(0.706, 0.397), screen), 0, 0.004, 0.0002, m, false);
    box(0.1, 0.1, 0.07, black, 0, 0, -0.055, m);
  }
  box(1.9, 0.008, 0.012, rgbGlow, 0, T - 0.04, -0.385, g, false); // a strip of light along the back edge, washing the floor under the desk

  // keyboard: a case, a bed of light, and caps that let it through the gaps
  const kb = put(new Group(), -0.05, T + 0.004, 0.19, g);
  box(0.312, 0.018, 0.108, plastic, 0, 0.009, 0, kb);
  put(new Mesh(new PlaneGeometry(0.3, 0.098).rotateX(-Math.PI / 2), keyGlow), 0, 0.0185, 0, kb, false);
  const caps: number[][] = [];
  for (let row = 0; row < 5; row++) {
    let x = -0.1425;
    for (const u of row < 4 ? Array<number>(15).fill(1) : [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1]) { caps.push([u * 0.019 - 0.003, 0.008, 0.016, x + (u * 0.019) / 2, 0.0235, -0.038 + row * 0.019]); x += u * 0.019; }
  }
  boxes(keycap, caps, kb);
  put(new Mesh(new SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), plastic), 0.26, T + 0.004, 0.2, g).scale.set(0.031, 0.036, 0.056); // mouse

  // a lamp at the south end: the one warm light on a desk of cold ones
  const dl = put(new Group(), -0.88, T, 0.08, g);
  cyl(0.065, 0.07, 0.014, black, 0, 0.007, 0, dl, 24);
  cyl(0.007, 0.007, 0.36, aluminium, 0, 0.19, 0, dl, 8);
  const head = cyl(0.03, 0.06, 0.07, black, 0.045, 0.37, 0, dl, 20);
  head.rotation.z = -0.5;
  cyl(0.05, 0.05, 0.004, shadeGlow, 0, -0.036, 0, head, 20).castShadow = false;
  dl.add(deskLight);
  deskLight.position.set(0.1, 0.3, 0.02);

  // headset on its stand
  const hs = put(new Group(), -0.84, T, -0.24, g);
  hs.rotation.y = 0.5;
  cyl(0.06, 0.065, 0.012, black, 0, 0.006, 0, hs);
  cyl(0.008, 0.008, 0.27, aluminium, 0, 0.14, 0, hs, 10);
  box(0.05, 0.012, 0.03, aluminium, 0, 0.275, 0, hs);
  put(new Mesh(new TorusGeometry(0.085, 0.011, 8, 24, Math.PI), plastic), 0, 0.2, 0, hs);
  for (const x of [-0.085, 0.085]) { cyl(0.043, 0.043, 0.03, plastic, x, 0.19, 0, hs).rotation.z = Math.PI / 2; cyl(0.04, 0.04, 0.012, fabric, x * 0.78, 0.19, 0, hs).rotation.z = Math.PI / 2; }

  // mug, with what is left of the coffee
  const profile = [[0, 0], [0.036, 0], [0.04, 0.008], [0.041, 0.092], [0.037, 0.092], [0.035, 0.012], [0, 0.012]].map(([x, y]) => new Vector2(x, y));
  const mug = put(new Mesh(new LatheGeometry(profile, 24), ceramic), 0.5, T, 0.24, g);
  put(new Mesh(new TorusGeometry(0.024, 0.006, 8, 16, Math.PI), ceramic), 0.04, 0.05, 0, mug).rotation.z = -Math.PI / 2;
  cyl(0.036, 0.036, 0.002, std(0x1a0f08, 0.15), 0, 0.078, 0, mug, 20);
  box(0.21, 0.014, 0.15, std(0x18222e, 0.7), -0.62, T + 0.007, 0.26, g).rotation.y = 0.3; // notebook
  // every desk needs a duck to explain the bug to
  const duck = put(new Group(), -0.52, T, -0.2, g);
  duck.rotation.y = -0.9;
  put(new Mesh(new SphereGeometry(0.034, 16, 12), rubber), 0, 0.028, 0, duck).scale.set(1.25, 0.85, 1);
  put(new Mesh(new SphereGeometry(0.023, 16, 12), rubber), 0.026, 0.066, 0, duck);
  cyl(0, 0.009, 0.02, std(0xe2571a, 0.5), 0.052, 0.064, 0, duck, 8).rotation.z = -Math.PI / 2;
}
// The computer, on the floor beside the desk with its glass side to the room.
const pcLight = put(new PointLight(0x46adff, 0.5, 2.4, 2), W + 0.75, 0.3, DESK.z + 1.32, room, false);
{
  const g = put(new Group(), W + 0.42, 0, DESK.z + 1.32);
  boxes(black, [[0.21, 0.012, 0.44, 0, 0.474, 0], [0.21, 0.012, 0.44, 0, 0.026, 0], [0.012, 0.46, 0.44, -0.099, 0.25, 0], [0.21, 0.46, 0.012, 0, 0.25, -0.214], [0.21, 0.46, 0.012, 0, 0.25, 0.214], [0.07, 0.05, 0.3, 0, 0.19, -0.02]], g);
  boxes(rgbGlow, [[0.004, 0.01, 0.29, 0.036, 0.215, -0.02], [0.005, 0.07, 0.006, 0, 0.36, -0.09], [0.005, 0.07, 0.006, 0, 0.36, -0.105], [0.005, 0.1, 0.006, 0.05, 0.14, -0.2], [0.005, 0.1, 0.006, 0.05, 0.27, -0.2], [0.005, 0.1, 0.006, 0.05, 0.4, -0.2]], g, false);
  put(new Mesh(new TorusGeometry(0.034, 0.005, 8, 28), rgbGlow), 0.01, 0.35, 0.02, g, false).rotation.y = Math.PI / 2;
  face(0.43, 0.45, smoked, 0.105, 0.25, 0, Math.PI / 2, g);
}
// The chair, pushed back and turned, the way it is left by someone who has just stood up.
{
  const g = put(new Group(), -2.15, 0, -0.4);
  g.rotation.y = -Math.PI / 2 - 0.7;
  for (let k = 0; k < 5; k++) {
    const spoke = put(new Group(), 0, 0, 0, g);
    spoke.rotation.y = (k * Math.PI * 2) / 5;
    box(0.035, 0.025, 0.3, plastic, 0, 0.07, 0.15, spoke);
    put(new Mesh(new SphereGeometry(0.027, 10, 8), black), 0, 0.027, 0.3, spoke);
  }
  cyl(0.026, 0.03, 0.36, aluminium, 0, 0.25, 0, g, 12);
  soft(0.5, 0.09, 0.5, 0.035, fabric, 0, 0.475, 0, g);
  const back = put(new Group(), 0, 0.5, -0.25, g);
  back.rotation.x = -0.12;
  soft(0.5, 0.74, 0.085, 0.035, fabric, 0, 0.42, 0, back);
  soft(0.3, 0.15, 0.085, 0.035, fabric, 0, 0.86, 0.01, back);
  for (const x of [-0.17, 0.17]) box(0.012, 0.62, 0.006, trim, x, 0.42, -0.044, back);
  for (const x of [-0.29, 0.29]) { box(0.035, 0.22, 0.035, plastic, x, 0.6, -0.02, g); soft(0.07, 0.03, 0.27, 0.012, plastic, x, 0.72, 0.02, g); }
}

// ---------------------------------------------------------------- lounge corner
put(new Mesh(new BoxGeometry(3.0, 0.012, 2.5), rug), 2.3, 0.006, -1.3, room, false).receiveShadow = true;
cyl(0.45, 0.45, 0.03, black, TABLE.x, TABLE.top - 0.015, TABLE.z, room, 40);
cyl(0.035, 0.035, TABLE.top - 0.04, steel, TABLE.x, (TABLE.top - 0.04) / 2 + 0.01, TABLE.z, room, 12);
cyl(0.24, 0.26, 0.016, steel, TABLE.x, 0.02, TABLE.z, room, 32);
{
  const g = put(new Group(), 3.05, 0, -0.3);
  g.rotation.y = -2.29; // facing the table and the north-west view
  soft(0.82, 0.26, 0.8, 0.06, leather, 0, 0.3, 0, g);
  const back = soft(0.82, 0.52, 0.2, 0.07, leather, 0, 0.62, -0.33, g);
  back.rotation.x = -0.18;
  for (const x of [-0.38, 0.38]) soft(0.14, 0.3, 0.76, 0.06, leather, x, 0.48, 0, g);
  soft(0.36, 0.3, 0.12, 0.05, fabric, 0.06, 0.6, -0.2, g).rotation.set(-0.3, 0, 0.12);
  boxes(steel, [-1, 1].flatMap((x) => [-1, 1].map((z) => [0.03, 0.17, 0.03, x * 0.34, 0.085, z * 0.33])), g);
}
const lamp = put(new PointLight(0xffb070, 1, 8, 2), 3.3, 1.45, 0.72, room, false);
cyl(0.14, 0.15, 0.02, steel, 3.55, 0.01, 0.78, room, 28);
cyl(0.011, 0.011, 1.5, steel, 3.55, 0.76, 0.78, room, 8);
put(new Mesh(new CylinderGeometry(0.13, 0.17, 0.25, 28, 1, true), shadeGlow), 3.55, 1.6, 0.78, room, false).material.side = DoubleSide;
{
  // a snake plant in the corner
  const g = put(new Group(), 3.5, 0, -2.95);
  cyl(0.17, 0.13, 0.32, std(0x2a2c30, 0.6), 0, 0.16, 0, g, 24);
  cyl(0.155, 0.155, 0.01, std(0x1a130d, 1), 0, 0.3, 0, g, 24);
  for (let i = 0; i < 13; i++) {
    const h = 0.45 + rand() * 0.5, blade = new PlaneGeometry(0.085, h, 1, 6).translate(0, h / 2, 0), p = blade.getAttribute("position");
    for (let k = 0; k < p.count; k++) { const y = Math.max(p.getY(k) / h, 0); p.setX(k, p.getX(k) * (1 - y ** 2.4) * (0.55 + 0.45 * Math.min(y * 4, 1))); p.setZ(k, 0.1 * h * y * y); }
    blade.computeVertexNormals();
    const b = put(new Mesh(blade, leaf), (rand() - 0.5) * 0.14, 0.3, (rand() - 0.5) * 0.14, g);
    b.rotation.set(0.04 + rand() * 0.22, rand() * Math.PI * 2, 0, "YXZ");
  }
}
{
  // a telescope at the north glass, trained on the island
  const g = put(new Group(), 1.35, 0, -2.6);
  g.rotation.y = 0.22; // Alcatraz, from here
  for (let k = 0; k < 3; k++) { const a = (k * Math.PI * 2) / 3 + 0.5; const leg = cyl(0.012, 0.009, 1.2, steel, Math.sin(a) * 0.2, 0.57, Math.cos(a) * 0.2, g, 8); leg.rotation.set(0.34, a, 0, "YXZ"); }
  cyl(0.03, 0.03, 0.08, steel, 0, 1.15, 0, g, 12);
  const tube = put(new Group(), 0, 1.22, 0, g);
  tube.rotation.x = 0.07; // a touch below level: the island sits under the horizon from up here
  cyl(0.05, 0.045, 0.62, ceramic, 0, 0, -0.08, tube, 20).rotation.x = Math.PI / 2;
  cyl(0.056, 0.056, 0.05, black, 0, 0, -0.4, tube, 20).rotation.x = Math.PI / 2;
  cyl(0.018, 0.022, 0.1, black, 0, 0, 0.28, tube, 12).rotation.x = Math.PI / 2;
}
// three prints on the east wall, and a sideboard with speakers along the south one
prints.forEach((t, i) => {
  const z = 1.25 + i * 0.7;
  box(0.02, 0.76, 0.56, black, E - 0.012, 1.55, z);
  face(0.5, 0.7, std(0xffffff, 0.85, 0, { map: t }), E - 0.024, 1.55, z, -Math.PI / 2);
});
box(2.2, 0.42, 0.42, walnut, -1.7, 0.33, S - 0.24);
boxes(steel, [-1, 1].flatMap((x) => [[0.03, 0.12, 0.3, -1.7 + x * 1.0, 0.06, S - 0.24]]));
for (const x of [-2.55, -0.85]) { box(0.2, 0.32, 0.22, black, x, 0.7, S - 0.22); cyl(0.07, 0.07, 0.01, plastic, x, 0.66, S - 0.335, room, 20).rotation.x = Math.PI / 2; }

// ---------------------------------------------------------------- light
const cove = [-2.4, 0.2, 2.6].map((x) => put(new PointLight(0xff9a50, 1, 7, 2), x, H - 0.3, S - 0.6, room, false));
const stripLight = put(new PointLight(0x46adff, 1, 3.2, 2), DESK.x - 0.2, 0.4, DESK.z, room, false);
const fill = put(new AmbientLight(0x8094b8, 0), 0, 0, 0, room, false); // what bounces around a room with the lights on
const key = put(new DirectionalLight(0xffffff, 1), 0, 40, 0, room, false); // sun, then moon, through the glass
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.03;
Object.assign(key.shadow.camera, { left: -8, right: 8, top: 7, bottom: -7, near: 1, far: 100 });
room.add(key.target);

export function updateRoom(s: SkyState) {
  key.color.setRGB(s.key[0], s.key[1], s.key[2]);
  key.position.set(s.keyDir[0], s.keyDir[1], s.keyDir[2]).multiplyScalar(48);
  const on = s.lamps;
  shadeGlow.color.setRGB(5, 2.9, 1.35).multiplyScalar(0.12 + 0.88 * on);
  coveGlow.color.setRGB(6, 2.9, 1.1).multiplyScalar(on);
  lamp.intensity = 21 * on;
  cove.forEach((c) => { c.intensity = 12 * on; });
  fill.intensity = 0.12 + 0.3 * on;
  screenLight.intensity = 6.5;
  stripLight.intensity = 1.1;
  pcLight.intensity = 0.8;
  deskLight.intensity = 1.6 * (0.3 + 0.7 * on);
  veil.setRGB(0.05, 0.06, 0.085).multiplyScalar(0.4 + 0.6 * on);
}

/** While the intro's lift is in view the cove light nearest it moves inside, at half strength, so the cabin is lit and no light is added. Call after `updateRoom`. */
export function lend(inside: boolean) {
  if (inside) { cove[2].position.set(LIFT.x, H - 0.35, LIFT.front + 0.9); cove[2].intensity *= 0.5; }
  else cove[2].position.set(2.6, H - 0.3, S - 0.6);
}

// ---------------------------------------------------------------- materialize
// The intro builds the room from its skeleton: first only the edges of everything, glowing blue lines in the dark, then the
// solids grow out of them a cell at a time, the low cells before the high ones. Every surface of the room (and its shadow)
// drops the fragments of cells not built yet, so shadows and occlusion stay honest while it grows. The floor, the slab
// under it and the glass are there throughout.
const BUILD = { value: 1 }; // 0 is the skeleton alone, 1 is the finished room (its resting state)
const CELL = 0.05, BAND = 0.1; // metres per cell; share of the build a cell glows for before it settles
const GROW_PARS = /* glsl */ `varying vec3 vGrow;
uniform float uBuild;
float builtAt(vec3 p) { // the moment (0..1) the cell holding p is built: random, but the low ones first
  vec3 c = floor(p / ${CELL});
  return 0.5 * fract(sin(dot(c, vec3(12.9898, 78.233, 37.719))) * 43758.5453) + 0.5 * clamp(p.y / ${H.toFixed(2)}, 0.0, 1.0);
}`;
const GROW_PROJECT = /* glsl */ `#include <project_vertex>
vec4 growPos = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
  growPos = instanceMatrix * growPos;
#endif
vGrow = (modelMatrix * growPos).xyz;`;
function growing<T extends Material>(m: T): T {
  const before = m.onBeforeCompile;
  m.onBeforeCompile = (shader, renderer) => {
    before.call(m, shader, renderer);
    shader.uniforms.uBuild = BUILD;
    shader.vertexShader = shader.vertexShader.replace("void main() {", "varying vec3 vGrow;\nvoid main() {").replace("#include <project_vertex>", GROW_PROJECT);
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", `${GROW_PARS}\nvoid main() {\n  float grow = (uBuild * ${1 + BAND} - builtAt(vGrow)) / ${BAND};\n  if (grow <= 0.0) discard;`)
      .replace("#include <opaque_fragment>", "if (grow < 1.0) outgoingLight += vec3(0.3, 1.1, 1.8) * 2.0 * (1.0 - grow);\n#include <opaque_fragment>");
  };
  m.customProgramCacheKey = () => before.toString() + "grow";
  return m;
}
const blueprint = new Group();
const edgeMaterial = new LineBasicMaterial({ color: new Color(0.3, 1.3, 2.4), transparent: true, opacity: 0.75, blending: AdditiveBlending, depthWrite: false, toneMapped: false });
{
  const shadow = growing(new MeshDepthMaterial({ depthPacking: RGBADepthPacking })), grown = new Set<Material>(), edges = new Map<BufferGeometry, EdgesGeometry>(), at = new Matrix4();
  room.updateMatrixWorld(true);
  room.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh || mesh === floor || mesh.parent === under || mesh.material === glass) return;
    const m = mesh.material as Material;
    if (!grown.has(m) && !(m as ShaderMaterial).isShaderMaterial) { grown.add(m); growing(m); }
    mesh.customDepthMaterial = shadow;
    let e = edges.get(mesh.geometry);
    if (!e) edges.set(mesh.geometry, (e = new EdgesGeometry(mesh.geometry, 25)));
    let geometry: BufferGeometry = e;
    const inst = mesh as InstancedMesh;
    if (inst.isInstancedMesh) { // every instance's edges baked into one geometry, in world space
      const parts: BufferGeometry[] = [];
      for (let i = 0; i < inst.count; i++) { inst.getMatrixAt(i, at).premultiply(mesh.matrixWorld); parts.push(e.clone().applyMatrix4(at)); }
      if (!parts.length) return;
      geometry = mergeGeometries(parts);
    }
    const lines = new LineSegments(geometry, edgeMaterial);
    lines.matrixAutoUpdate = false;
    if (!inst.isInstancedMesh) lines.matrix.copy(mesh.matrixWorld);
    lines.frustumCulled = false;
    blueprint.add(lines);
  });
}
blueprint.visible = false;
room.add(blueprint);

/** `t` 0 is the skeleton, 1 the finished room (see journey revealAt). Cheap to call every frame: it does nothing while `t` holds still. */
export function materialize(t: number) {
  if (t === BUILD.value) return;
  BUILD.value = t;
  edgeMaterial.opacity = 0.75 * (1 - Math.min(1, Math.max(0, (t - 0.35) / 0.55))); // the lines let go as the solids take over
  blueprint.visible = t < 1;
}

// ---------------------------------------------------------------- floor mirror
const mirror = new PerspectiveCamera();
const eye = new Vector3(), aim = new Vector3(), up = new Vector3(), buffer = new Vector2();
const bias = new Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);

/** Render the scene from below the floor (plane y = 0) into the mirror texture. `scale` is the share of the canvas resolution. */
export function renderMirror(gl: WebGLRenderer, scene: Scene, camera: Camera, scale: number) {
  const size = gl.getDrawingBufferSize(buffer);
  const w = Math.max(2, Math.round(size.x * scale)), h = Math.max(2, Math.round(size.y * scale));
  if (target.width !== w || target.height !== h) target.setSize(w, h);

  // Reflect the eye, the point it looks at and its up vector through y = 0.
  camera.getWorldPosition(eye);
  camera.getWorldDirection(aim).add(eye);
  up.set(0, 1, 0).applyQuaternion(camera.quaternion);
  mirror.position.set(eye.x, -eye.y, eye.z);
  mirror.up.set(up.x, -up.y, up.z);
  mirror.lookAt(aim.x, -aim.y, aim.z);
  mirror.updateMatrixWorld(true);
  mirror.projectionMatrix.copy(camera.projectionMatrix);
  mirror.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
  mirrorUniforms.uMirror.value.multiplyMatrices(bias, mirror.projectionMatrix).multiply(mirror.matrixWorldInverse);

  const previous = gl.getRenderTarget(), shadows = gl.shadowMap.autoUpdate;
  floor.visible = under.visible = false;
  gl.shadowMap.autoUpdate = false; // the main pass keeps the shadow maps fresh
  gl.setRenderTarget(target);
  gl.clear();
  gl.render(scene, mirror);
  gl.setRenderTarget(previous);
  gl.shadowMap.autoUpdate = shadows;
  floor.visible = under.visible = true;
}

export const disposeRoom = () => target.dispose();
