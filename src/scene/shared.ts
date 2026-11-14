// State shared by every part of the scene: one set of sky uniforms (so sky, city and room can never disagree
// about the light), a noise texture and GLSL helpers.
import { Color, DataTexture, LinearFilter, RepeatWrapping, RGBAFormat, UnsignedByteType, Vector3 } from "three";

/** Small deterministic PRNG so the city and the stains are the same on every visit. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 256x256 of independent random bytes. Bilinear filtering turns one fetch into smooth value noise (see NOISE_GLSL);
// fetched at texel centres it is a hash.
const noise = (() => {
  const r = rng(20261112), data = new Uint8Array(256 * 256 * 4);
  for (let i = 0; i < data.length; i++) data[i] = r() * 256;
  const t = new DataTexture(data, 256, 256, RGBAFormat, UnsignedByteType);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.magFilter = t.minFilter = LinearFilter;
  t.needsUpdate = true;
  return t;
})();

export const U = {
  uTime: { value: 0 },
  uNoise: { value: noise },
  uSunDir: { value: new Vector3(-1, 0, 0) },
  uMoonDir: { value: new Vector3(0, 1, 0) }, uMoon: { value: 0 },
  uZenith: { value: new Color() }, uHorizon: { value: new Color() }, uGlow: { value: new Color() },
  uSun: { value: new Color() }, uCloud: { value: new Color() },
  uStars: { value: 0 },
  uLit: { value: 0.3 }, // share of city windows lit
  uLamps: { value: 1 }, // street and flood lighting, 0..1
  uPx: { value: 450 }, // half the render height in pixels: turns a size in metres into pixels
  uDot: { value: 1.5 }, // the smallest a far-off light is drawn, in pixels
  uKeyDir: { value: new Vector3(0, 1, 0) }, uKey: { value: new Color() },
};

export const HAZE = "0.00009"; // aerial perspective per metre: clear air after rain

export const NOISE_GLSL = /* glsl */ `
uniform sampler2D uNoise;
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return texture2D(uNoise, (i + f + 0.5) / 256.0).r; }
vec4 hash4(vec2 id){ return texture2D(uNoise, (floor(id) + 0.5) / 256.0); }
const mat2 OCT = mat2(1.6, 1.2, -1.2, 1.6);
float fbm3(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++){ s += a * n2(p); p = OCT * p + 17.3; a *= 0.5; } return s / 0.875; }
float fbm5(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * n2(p); p = OCT * p + 17.3; a *= 0.5; } return s / 0.96875; }
`;

// Clear air in direction d: the horizon colour (cool, warming toward the sun's azimuth) thinning into the zenith.
// The city fades into exactly this, which is what makes distant towers sit in the air instead of on top of it.
export const AIR_GLSL = /* glsl */ `
uniform vec3 uSunDir, uZenith, uHorizon, uGlow;
float towardSun(vec3 d){ return clamp(dot(normalize(d.xz + vec2(1e-5)), normalize(uSunDir.xz + vec2(1e-5))) * 0.5 + 0.5, 0.0, 1.0); }
vec3 horizonColor(vec3 d){
  float ts = towardSun(d);
  return mix(uHorizon, uGlow, pow(ts, 5.0)) + uGlow * 1.2 * pow(ts, 30.0);
}
vec3 airColor(vec3 d){
  float h = max(d.y, 0.0);
  return mix(uZenith, uHorizon, exp(-h * 5.0)) + (horizonColor(d) - uHorizon) * exp(-h * 9.0);
}
`;
