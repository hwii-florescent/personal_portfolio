// Art-directed sky for one night, keyed by hour (19.7 = dusk ... 30.4 = 06:24 next morning).
// Plain numbers only, so it runs in node for the check in tests/journey.test.mjs. Colours are scene-linear.

/** Linear interpolation through a table of [x, ...values] rows sorted by x; clamps at both ends. */
export function sample(rows: readonly (readonly number[])[], x: number): number[] {
  let i = 0;
  while (i < rows.length - 2 && x >= rows[i + 1][0]) i++;
  const a = rows[i], b = rows[i + 1];
  const t = Math.min(1, Math.max(0, (x - a[0]) / (b[0] - a[0])));
  return a.slice(1).map((v, j) => v + (b[j + 1] - v) * t);
}

// hour, sun azimuth (deg, 0 = north / -z, 90 = east / +x), sun elevation (deg)
const SUN = [
  [19.7, 290, -2.2], [20.45, 298, -9.5], [22, 318, -25], [25, 360, -42],
  [27.5, 402, -29], [29.1, 421, -12], [30, 428, -2.6], [30.4, 430, 3.2],
] as const;

// hour | zenith rgb | horizon rgb (away from the sun) | glow rgb (horizon under the sun) | sun rgb (disc + aureole) | stars | cloud rgb
const SKY = [
  [19.7, 0.012, 0.035, 0.15, 0.07, 0.11, 0.26, 1.1, 0.36, 0.1, 0.5, 0.24, 0.1, 0.08, 0.035, 0.05, 0.095],
  [20.45, 0.007, 0.018, 0.08, 0.032, 0.048, 0.125, 0.4, 0.105, 0.06, 0.1, 0.04, 0.02, 0.6, 0.018, 0.024, 0.045],
  [22, 0.004, 0.008, 0.028, 0.018, 0.022, 0.045, 0.03, 0.026, 0.04, 0, 0, 0, 1, 0.012, 0.013, 0.02],
  [25, 0.003, 0.006, 0.022, 0.016, 0.019, 0.038, 0.016, 0.019, 0.038, 0, 0, 0, 1, 0.01, 0.011, 0.017],
  [27.5, 0.0035, 0.007, 0.026, 0.016, 0.02, 0.042, 0.02, 0.023, 0.048, 0, 0, 0, 1, 0.01, 0.012, 0.019],
  [29.1, 0.007, 0.016, 0.062, 0.03, 0.045, 0.11, 0.26, 0.1, 0.09, 0.05, 0.02, 0.02, 0.5, 0.016, 0.02, 0.04],
  [30, 0.03, 0.075, 0.24, 0.14, 0.18, 0.33, 1.2, 0.42, 0.16, 0.7, 0.34, 0.14, 0.02, 0.06, 0.07, 0.12],
  [30.4, 0.06, 0.14, 0.38, 0.26, 0.27, 0.36, 1.6, 0.7, 0.28, 1.6, 0.9, 0.4, 0, 0.13, 0.13, 0.17],
] as const;

// hour | image-based light strength | practical lamps 0..1 | share of city windows lit
const LIGHT = [
  [19.7, 1.8, 0.6, 0.3], [20.45, 2.2, 1, 0.5], [22, 4, 1, 0.5], [25, 4, 1, 0.3],
  [27.5, 4, 1, 0.17], [29.1, 3, 1, 0.2], [30, 1.8, 0.6, 0.15], [30.4, 1.3, 0.25, 0.1],
] as const;

// hour, moon azimuth, elevation. It comes up over Angel Island north of the room, so the night chapters are back-lit:
// rims on every object, long shadows toward the camera and a glitter path down the bay and across the floor.
const MOON = [[20.8, 34, 3], [22, 19, 12], [25, 2, 25], [27.5, -14, 17], [29.2, -24, 6]] as const;
const MOONLIGHT = [0.35, 0.46, 0.75] as const;
const SUNLIGHT = [5, 2.6, 1.1] as const;
const SUNLIGHT_ELEVATION = 9; // the key light sits higher than the drawn disc so the sill shadow does not swallow the floor

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function dirFrom(azimuth: number, elevation: number): [number, number, number] {
  const a = (azimuth * Math.PI) / 180, e = (elevation * Math.PI) / 180;
  return [Math.cos(e) * Math.sin(a), Math.sin(e), -Math.cos(e) * Math.cos(a)];
}

export type Rgb = [number, number, number];
export type SkyState = {
  sunDir: Rgb; moonDir: Rgb; moon: number; zenith: Rgb; horizon: Rgb; glow: Rgb; sun: Rgb; stars: number; cloud: Rgb;
  ambient: number; lamps: number; lit: number;
  keyDir: Rgb; key: Rgb; // one directional light: the moon by night, the sun after it clears the horizon
};

export function skyAt(hour: number): SkyState {
  const [azimuth, elevation] = sample(SUN, hour);
  const s = sample(SKY, hour);
  const [ambient, lamps, lit] = sample(LIGHT, hour);
  const moon = smooth(20.8, 22, hour) * (1 - smooth(28, 29.2, hour));
  const [moonAzimuth, moonElevation] = sample(MOON, hour);
  const moonDir = dirFrom(moonAzimuth, moonElevation);
  const day = smooth(30.02, 30.4, hour);
  return {
    sunDir: dirFrom(azimuth, elevation), moonDir, moon,
    zenith: s.slice(0, 3) as Rgb, horizon: s.slice(3, 6) as Rgb, glow: s.slice(6, 9) as Rgb, sun: s.slice(9, 12) as Rgb,
    stars: s[12], cloud: s.slice(13, 16) as Rgb,
    ambient, lamps, lit,
    keyDir: day > 0 ? dirFrom(azimuth, SUNLIGHT_ELEVATION) : moonDir,
    key: day > 0 ? (SUNLIGHT.map((c) => c * day) as Rgb) : (MOONLIGHT.map((c) => c * moon) as Rgb),
  };
}
