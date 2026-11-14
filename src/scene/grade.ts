// The last step of the picture: film response, a dusk-friendly split tone, vignette and grain, in one pass.
import { Effect } from "postprocessing";
import { Uniform } from "three";

const fragmentShader = /* glsl */ `
uniform float uGrain;
// ACES filmic fit (S. Hill): bright lamps roll off to white instead of clipping to flat orange
vec3 film(vec3 c){
  c = mat3(0.59719, 0.076, 0.0284, 0.35458, 0.90834, 0.13383, 0.04823, 0.01566, 0.83777) * c;
  c = (c * (c + 0.0245786) - 0.000090537) / (c * (0.983729 * c + 0.432951) + 0.238081);
  return clamp(mat3(1.60475, -0.10208, -0.00327, -0.53108, 1.10813, -0.07276, -0.07367, -0.00605, 1.07602) * c, 0.0, 1.0);
}
float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
  vec3 col = film(max(inputColor.rgb, 0.0));
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col *= mix(vec3(0.88, 1.0, 1.1), vec3(1.06, 1.0, 0.93), smoothstep(0.02, 0.5, l)); // cool shadows, warm highlights
  col = mix(col, col * col * (3.0 - 2.0 * col), 0.18);                               // gentle S-curve
  col = col * 0.99 + vec3(0.003, 0.0045, 0.007);                                     // lifted, slightly blue blacks
  vec2 c = uv - 0.5;
  col *= 1.0 - 0.36 * smoothstep(0.25, 1.0, dot(c, c) * 2.0);
  vec2 seed = uv * resolution + fract(time * vec2(7.31, 3.17)) * vec2(311.7, 173.3);
  col += (hash(seed) + hash(seed + 57.3) - 1.0) * uGrain * mix(1.0, 0.35, smoothstep(0.2, 0.9, l));
  outputColor = vec4(max(col, 0.0), 1.0);
}`;

export class Grade extends Effect {
  constructor() {
    super("Grade", fragmentShader, { uniforms: new Map([["uGrain", new Uniform(0.004)]]) });
  }
}
