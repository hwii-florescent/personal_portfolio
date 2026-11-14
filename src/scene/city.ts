// San Francisco itself: the neighbours on our own hill, the houses that step down to the water, and the Financial
// District with the towers everyone knows. Every building is a box, or one of two special shapes, drawn by a single
// facade shader that gives each its own material, window rhythm and lighting habits.
import { BoxGeometry, CylinderGeometry, Group, InstancedBufferAttribute, InstancedMesh, Object3D, ShaderMaterial, type BufferGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { bay, BEACON, fillBay, lamp, LED, RED, SODIUM, WARM } from "./bay";
import { AIR_GLSL, HAZE, NOISE_GLSL, rng, U } from "./shared";
import { ground, inland, PLACES, polar, WATER } from "./terrain";

const TILT = 0.16; // the street grid north of Market runs about nine degrees off the compass
const HOME = 0, OFFICE = 1, PYRAMID = 2, GLASS = 3;
const CONCRETE = 1, CURTAIN = 2, CARNELIAN = 3; // an office's cladding, when it should not be left to chance
const CREAM = 1, WHITE = 2;                      // likewise a home's paint

const vertexShader = /* glsl */ `
attribute vec4 aLook; // seed, kind, height at which the windows stop (0 = the roofline), cladding or radius
varying vec3 vWorld, vNormal, vLocal, vSize;
varying vec4 vLook;
varying float vAxis;
void main(){
  mat4 m = modelMatrix * instanceMatrix;
  vSize = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
  vLocal = position * vSize; // metres from the middle of the footprint, and up from the base
  vAxis = step(0.5, abs(normal.x));
  vLook = aLook;
  vec4 world = m * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(m) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const fragmentShader = /* glsl */ `
precision highp float;
uniform float uTime, uLit, uLamps;
uniform vec3 uKeyDir, uKey;
varying vec3 vWorld, vNormal, vLocal, vSize;
varying vec4 vLook;
varying float vAxis;
${NOISE_GLSL}
${AIR_GLSL}
vec3 stucco(float t){ // the city's pastels
  vec3 c = vec3(0.5, 0.45, 0.36);
  c = mix(c, vec3(0.54, 0.53, 0.5), step(0.24, t));
  c = mix(c, vec3(0.55, 0.44, 0.24), step(0.42, t));
  c = mix(c, vec3(0.5, 0.29, 0.25), step(0.55, t));
  c = mix(c, vec3(0.28, 0.38, 0.48), step(0.67, t));
  c = mix(c, vec3(0.32, 0.41, 0.31), step(0.79, t));
  return mix(c, vec3(0.27, 0.27, 0.28), step(0.9, t));
}
float band(float lo, float hi, float x, float aa){ return smoothstep(lo - aa, lo + aa, x) * (1.0 - smoothstep(hi - aa, hi + aa, x)); }
void main(){
  vec3 view = vWorld - cameraPosition;
  float dist = length(view);
  view /= dist;
  vec3 n = normalize(vNormal);
  float kind = vLook.y;
  vec4 b = hash4(vec2(vLook.x * 251.0, vLook.x * 97.0)); // this building

  vec3 base; vec2 want; vec4 pane; // cladding, window pitch in metres, the glazed part of each cell (x0, x1, y0, y1)
  if (kind < 0.5) { base = stucco(vLook.w < 0.5 ? b.x : vLook.w < 1.5 ? 0.1 : vLook.w < 2.5 ? 0.3 : 0.95) * (0.8 + 0.4 * b.y); want = vec2(mix(2.4, 3.1, b.z), 3.1); pane = vec4(0.27, 0.73, 0.2, 0.76); }
  else if (kind < 1.5) {
    float m = vLook.w > 0.5 ? vLook.w * 0.3 - 0.1 : b.x;
    base = (m < 0.4 ? vec3(0.17, 0.16, 0.15) : m < 0.7 ? vec3(0.045, 0.055, 0.07) : vec3(0.12, 0.052, 0.036)) * (0.7 + 0.5 * b.y);
    want = vec2(mix(1.5, 2.2, b.z), 3.9); pane = vec4(0.1, 0.9, 0.28, 0.8);
  }
  else if (kind < 2.5) { base = vec3(0.5, 0.49, 0.46); want = vec2(2.0, 3.9); pane = vec4(0.32, 0.68, 0.26, 0.8); }
  else { base = vec3(0.05, 0.065, 0.085); want = vec2(1.5, 4.3); pane = vec4(0.05, 0.95, 0.1, 0.88); }

  vec2 span = vec2(vAxis > 0.5 ? vSize.z : vSize.x, vSize.y);
  vec2 face = vec2((vAxis > 0.5 ? vLocal.z : vLocal.x) + span.x * 0.5, vLocal.y);
  vec2 pitch = kind < 1.5 ? span / max(floor(span / want + 0.5), 1.0) : want; // a whole number of windows across a box
  if (kind > 2.5) { float girth = 6.2832 * vLook.w; face.x = (atan(vLocal.z, -vLocal.x) / 6.2832 + 0.5) * girth; pitch.x = girth / floor(girth / want.x); }
  float limit = vLook.z > 0.5 ? vLook.z : span.y;

  vec3 sky = mix(uHorizon, uZenith, 0.5 + 0.5 * n.y);
  sky = mix(sky, vec3(dot(sky, vec3(0.3, 0.5, 0.2))), 0.3) * 0.9; // a wall faces other walls as much as it faces open sky
  vec3 light = sky + horizonColor(n) * (1.0 - abs(n.y)) * 0.4 + uKey * max(dot(n, uKeyDir), 0.0) * 0.32;
  vec3 col;
  if (n.y > 0.6) {
    // roofs: tar and gravel inside a parapet the colour of the walls
    vec2 edge = vSize.xz * 0.5 - abs(vLocal.xz);
    col = mix(vec3(0.085, 0.085, 0.09) * (0.7 + 0.6 * b.w), base * 0.9, 1.0 - smoothstep(0.35, 0.6, min(edge.x, edge.y))) * light;
  } else {
    vec2 cell = face / pitch, id = floor(cell), f = fract(cell), aa = fwidth(cell);
    float below = limit - face.y; // metres under the roofline, or under the crown
    col = base * (0.84 + 0.16 * smoothstep(0.02, 0.1, f.y)); // slab edge at every floor
    if (kind < 0.5) {
      float bay = step(0.5, fract((id.x + floor(b.w * 2.0)) * 0.5)); // every other column is a bay window standing proud of the wall
      col *= mix(0.82, 1.06, bay) * (0.8 + 0.2 * smoothstep(0.0, 0.07, min(f.x, 1.0 - f.x)));
    }
    if (kind < 1.5) col *= 1.0 + 0.3 * step(below, 0.55) - 0.3 * step(0.55, below) * step(below, 1.0); // cornice and its shadow
    col *= light * mix(0.55, 1.0, smoothstep(0.0, 11.0, face.y)); // the street below is the darkest part of any facade

    float glazed = band(pane.x, pane.y, f.x, aa.x) * band(pane.z, pane.w, f.y, aa.y) * step(1.0, below);
    if (kind < 0.5) col = mix(col, vec3(0.46, 0.45, 0.43) * light, band(pane.x - 0.06, pane.y + 0.06, f.x, aa.x) * band(pane.z - 0.05, pane.w + 0.05, f.y, aa.y) * step(1.0, below)); // painted trim
    vec4 w = hash4(id + floor(vLook.x * 4096.0) + floor(n.xz * 1.5) * 37.0); // this window
    vec4 level = hash4(vec2(id.y + 3.0, vLook.x * 419.0));                   // this floor
    float habit = uLit * (0.4 + 0.9 * b.y);
    // homes light window by window; offices leave whole floors on
    float on = kind < 0.5 ? step(w.x, habit) : max(step(w.x, habit * 0.45), step(level.x, 0.26) * step(level.y, uLit * 1.6) * step(w.y, 0.88));
    vec3 tint = w.z < 0.62 ? vec3(1.0, 0.6, 0.27) : (w.z < 0.88 ? vec3(1.0, 0.82, 0.58) : vec3(0.66, 0.82, 1.0));
    if (kind > 0.5) tint = mix(tint, vec3(0.85, 0.93, 1.0), 0.55);
    float tv = w.w > 0.97 ? 0.65 + 0.35 * sin(uTime * 7.0 + w.x * 50.0) * sin(uTime * 2.3 + w.y * 20.0) : 1.0;
    // inside the pane: a centre mullion, a blind pulled part of the way down, light pooling toward the lamp
    vec2 q = (f - pane.xz) / (pane.yw - pane.xz);
    float inside = (0.15 + 0.85 * smoothstep(0.0, 0.06, abs(q.x - 0.5))) * (kind < 0.5 ? 0.3 + 0.7 * smoothstep(0.0, 0.05, abs(q.y - 0.52)) : 1.0) // sash windows
                 * mix(1.0, 0.5, step(1.0 - 0.6 * w.w, q.y))
                 * (0.62 + 0.38 * (1.0 - abs(q.x - w.y) * 1.3) * (0.4 + 0.6 * q.y));
    vec3 glow = tint * (0.3 + 1.1 * w.y) * inside * tv;
    vec3 glass = airColor(reflect(view, n)) * (kind > 2.5 ? 0.75 : 0.45); // dark panes still hold the sky
    // past the point where panes are smaller than pixels, show the facade's average glow instead of noise
    float detail = 1.0 - smoothstep(0.3, 0.75, max(aa.x, aa.y));
    col = mix(col, mix(glass, glow, on), glazed * detail);
    col = mix(col, mix(col, glass, 0.4) + vec3(1.0, 0.7, 0.42) * habit * 0.1, (1.0 - detail) * step(1.0, below));
    if (kind > 2.5) col = mix(col, vec3(0.4) * light, band(0.9, 1.0, f.y, aa.y) * detail); // sunshade fins at every floor

    if (below < 0.0 && kind > 2.5) {
      // Salesforce Tower's crown: nine storeys of LEDs behind perforated metal, playing slow abstract colour after dark
      float drift = fbm3(vec2(face.x * 0.018 + uTime * 0.02, face.y * 0.02 - uTime * 0.035));
      vec3 led = mix(vec3(1.0, 0.42, 0.14), vec3(0.25, 0.5, 1.0), smoothstep(0.35, 0.65, drift)) * (0.35 + 0.9 * fbm3(vec2(face.x * 0.03 - uTime * 0.03, face.y * 0.05 + 7.0)));
      col = vec3(0.3) * light + led * uLamps * 0.9 * (0.8 + 0.2 * step(0.5, fract(face.y / 1.4)));
    } else if (below < 0.0) {
      col = vec3(0.42, 0.43, 0.45) * light + vec3(0.9, 0.86, 0.78) * uLamps * 0.3; // the Pyramid's aluminium spire, lit from inside
    }
  }
  gl_FragColor = vec4(mix(col, airColor(view), 1.0 - exp(-dist * ${HAZE})), 1.0);
}`;

const material = new ShaderMaterial({ uniforms: { ...U }, vertexShader, fragmentShader });
const o = new Object3D();
/** One special shape, standing at a compass bearing and distance, squared up to the street grid. */
function landmark(geometry: BufferGeometry, at: readonly [number, number], look: [number, number, number, number]) {
  const [x, z] = polar(...at), mesh = new InstancedMesh(geometry, material, 1);
  o.position.set(x, WATER + ground(x, z) - 3, z); o.rotation.y = -TILT; o.scale.setScalar(1); o.updateMatrix();
  mesh.setMatrixAt(0, o.matrix);
  geometry.setAttribute("aLook", new InstancedBufferAttribute(new Float32Array(look), 4));
  mesh.frustumCulled = false;
  return { mesh, x, z, y: o.position.y };
}

type Box = { x: number; z: number; y: number; w: number; h: number; d: number; seed: number; kind: number; cladding?: number; turn?: number };
const boxes: Box[] = [];
/** Whether something this high can be seen from the room, whose glass runs to the floor: down to about 27 degrees. */
const seen = (x: number, z: number, top: number) => top > -0.5 * Math.hypot(x, z) - 3;
// bearing, distance, width, depth, height of the roof above our floor, paint, seed, and how far the upper storeys step back
const NEIGHBOURS = [[249, 140, 26, 30, 15, CREAM, 0.317, 0], [341, 150, 23, 23, 19, CREAM, 0.62, 13], [24, 215, 34, 24, 7, WHITE, 0.141, 0]];
// x, z and radius of the ground the houses must leave alone: our own building and those neighbours
const taken = [[0, 3, 15], ...NEIGHBOURS.map(([bearing, distance, w, d]) => [...polar(bearing, distance), Math.max(w, d) * 0.72 + 6])];
const dim = (c: readonly number[], k: number): [number, number, number] => [c[0] * k, c[1] * k, c[2] * k];

// ---------------------------------------------------------------- houses, block by block, wherever the land shows
{
  const r = rng(7), cos = Math.cos(TILT), sin = Math.sin(TILT), coit = polar(...PLACES.coit);
  const world = (u: number, w: number): [number, number] => [u * cos - w * sin, u * sin + w * cos];
  for (let i = -27; i <= 18; i++) for (let j = -13; j <= 13; j++) {
    const [bx, bz] = world(i * 147, j * 105);
    if (inland(bx, bz) < 90) continue;
    for (const [u, w] of [[-55, -52.5], [0, -52.5], [55, -52.5], [-73.5, 0]]) { // street lamps along the two streets this block owns
      const [x, z] = world(i * 147 + u, j * 105 + w), y = WATER + ground(x, z) + 8;
      if (seen(x, z, y + 4)) lamp([x, y, z], dim(SODIUM, 0.75 + 0.4 * r()), { mirror: inland(x, z) < 260 });
    }
    for (const row of [-1, 1]) for (let u = -62; u < 60; ) { // two rows of houses, back to back
      const wide = Math.min(8 + r() * 20, 62 - u), deep = 20 + r() * 8, tall = r() < 0.05 && Math.hypot(bx, bz) > 700 && Math.hypot(bx - coit[0], bz - coit[1]) > 420; // nothing may stand over Coit Tower
      const [x, z] = world(i * 147 + u + wide / 2, j * 105 + row * (42 - deep / 2)), y = WATER + ground(x, z) - 3, h = (tall ? 24 + r() * 26 : 9.5 + r() * 6.5) + 3;
      const seed = r(), far = Math.hypot(x, z);
      u += wide;
      if (!seen(x, z, y + h) || taken.some(([tx, tz, clear]) => Math.hypot(x - tx, z - tz) < clear + wide / 2)) continue;
      boxes.push({ x, z, y, w: wide - 0.5, h, d: deep, seed, kind: HOME });
      if (far > 450 && r() < 0.85) lamp([x - (x / far) * deep * 0.52, y + h * (0.35 + 0.55 * r()), z - (z / far) * deep * 0.52], dim(r() < 0.75 ? WARM : LED, 0.35 + 0.5 * r()), { habit: 0.04 + 0.96 * r(), size: 0.5 });
    }
  }
}

// ---------------------------------------------------------------- neighbours on our own hill, near enough to read every window
for (const [bearing, distance, w, d, top, cladding, seed, crown] of NEIGHBOURS) {
  const [x, z] = polar(bearing, distance), y = WATER + ground(x, z) - 4;
  boxes.push({ x, z, y, w, h: top - y, d, seed, kind: HOME, cladding });
  if (crown) boxes.push({ x, z, y: top - 12, w: w * 0.72, h: crown + 12, d: d * 0.72, seed, kind: HOME, cladding }); // a 1920s apartment tower steps back near the top
  boxes.push({ x: x + 2, z: z - 1, y: top + crown, w: w * 0.3, h: 3.4, d: d * 0.34, seed: seed * 0.5, kind: OFFICE, cladding: CONCRETE }); // lift motor room
  lamp([x + 2, top + crown + 4.6, z - 1], dim(RED, 0.5), { size: 0.3 });
}

// Our own building: an apartment tower squared to the compass. Its top floor is the room (see room.ts).
{
  const y = WATER + ground(0, 3) - 4;
  boxes.push({ x: 0, z: 3.05, y, w: 8.5, h: -0.3 - y, d: 13.3, seed: 0.47, kind: HOME, cladding: CREAM, turn: 0 });
}

// ---------------------------------------------------------------- the Financial District
const downtown: { x: number; z: number; top: number }[] = [];
{
  const r = rng(3), tower = polar(...PLACES.salesforce);
  const rise = (bearing: number, distance: number, w: number, d: number, h: number, cladding = 0, seed = r()) => {
    const [x, z] = polar(bearing, distance), y = WATER + ground(x, z) - 3;
    boxes.push({ x, z, y, w, h: h + 3, d, seed, kind: OFFICE, cladding });
    downtown.push({ x, z, top: y + h + 3 });
    return [x, y + h + 3, z] as [number, number, number];
  };
  rise(83, 1230, 60, 34, 237, CARNELIAN, 0.4); // 555 California
  rise(98.5, 1590, 30, 30, 232, CURTAIN, 0.7); // 181 Fremont
  for (const bearing of [103, 105.2, 107.4]) rise(bearing, 1420, 16, 62, 150 + (bearing - 103) * 6, CONCRETE, 0.2); // the Embarcadero Center slabs
  for (let n = 0; n < 34; n++) {
    const bearing = 79.5 + r() * 34, distance = 1150 + r() * 700, middle = Math.max(0, 1 - Math.abs(bearing - 94) / 19);
    const w = 28 + r() * 22, d = 28 + r() * 22, h = 62 + r() * 62 + middle * r() * 95;
    const [x, z] = polar(bearing, distance);
    if (downtown.some((t) => Math.hypot(t.x - x, t.z - z) < 58) || Math.hypot(x - tower[0], z - tower[1]) < 70) continue;
    const top = rise(bearing, distance, w, d, h);
    if (h > 110 && r() < 0.55) { boxes.push({ x: top[0], z: top[2], y: top[1] - 12, w: w * 0.68, h: h * (0.1 + r() * 0.14) + 12, d: d * 0.68, seed: r(), kind: OFFICE }); downtown[downtown.length - 1].top += h * 0.17; }
  }
  for (const t of downtown) if (t.top > 55) lamp([t.x, t.top + 4, t.z], RED, { mode: BEACON, size: 1.4 });
}

// The Transamerica Pyramid: a four-sided spire of white quartz with a wing up each flank and an aluminium tip.
const flat = (g: BufferGeometry) => { const f = g.toNonIndexed(); f.computeVertexNormals(); return f; };
const pyramid = landmark(mergeGeometries([
  flat(new CylinderGeometry(4.2, 37.5, 212, 4).rotateY(Math.PI / 4).translate(0, 106, 0)),
  flat(new CylinderGeometry(0.4, 4.2, 48, 4).rotateY(Math.PI / 4).translate(0, 236, 0)),
  ...[-1, 1].map((s) => new BoxGeometry(6, 78, 9).translate(s * 10.2, 158, 0).toNonIndexed()),
]), PLACES.pyramid, [0.37, PYRAMID, 212, 0]);
lamp([pyramid.x, pyramid.y + 263, pyramid.z], [3.4, 3.4, 3.6], { size: 2.6 });
lamp([pyramid.x, pyramid.y + 266, pyramid.z], RED, { mode: BEACON, size: 1.4 });

// Salesforce Tower: a rounded square that tapers into its crown.
const salesforce = landmark((() => {
  const H = 326, RADIUS = 25, g = new CylinderGeometry(1, 1, 1, 56, 28).translate(0, 0.5, 0), p = g.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), across = Math.hypot(x, z);
    const squared = (Math.cos(a) ** 4 + Math.sin(a) ** 4) ** -0.25, taper = y < 0.45 ? 1 : 1 - 0.42 * ((y - 0.45) / 0.55) ** 2.2;
    p.setXYZ(i, Math.cos(a) * across * RADIUS * squared * taper, y * H, Math.sin(a) * across * RADIUS * squared * taper);
  }
  g.computeVertexNormals();
  return g;
})(), PLACES.salesforce, [0.83, GLASS, 288, 25]);
lamp([salesforce.x, salesforce.y + 330, salesforce.z], RED, { mode: BEACON, size: 1.4 });

// ---------------------------------------------------------------- one draw call for every box
const towers = new InstancedMesh(new BoxGeometry(1, 1, 1).translate(0, 0.5, 0), material, boxes.length);
boxes.forEach((b, i) => {
  o.position.set(b.x, b.y, b.z);
  o.rotation.y = b.turn ?? -TILT;
  o.scale.set(b.w, b.h, b.d);
  o.updateMatrix();
  towers.setMatrixAt(i, o.matrix);
});
towers.geometry.setAttribute("aLook", new InstancedBufferAttribute(new Float32Array(boxes.flatMap((b) => [b.seed, b.kind, 0, b.cladding ?? 0])), 4));
towers.frustumCulled = false;

fillBay();
export const city = new Group().add(bay, towers, pyramid.mesh, salesforce.mesh);
