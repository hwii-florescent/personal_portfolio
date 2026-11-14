// Procedural sky dome: gradient, sun glow, a cloud deck lit from below, stars. The same shader, minus the
// sun disc and stars, is captured into a small PMREM so every surface in the room is lit by this exact sky.
import { BackSide, BoxGeometry, Mesh, PMREMGenerator, Scene, ShaderMaterial, type WebGLRenderer, type WebGLRenderTarget } from "three";
import { AIR_GLSL, NOISE_GLSL, U } from "./shared";

const vertexShader = /* glsl */ `
varying vec3 vDir;
void main(){
  vDir = position;
  vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0); // rotate with the camera, never translate
  gl_Position = p.xyww; // pinned to the far plane
}`;

const fragmentShader = /* glsl */ `
precision highp float;
varying vec3 vDir;
uniform float uTime, uEnv, uStars, uMoon;
uniform vec3 uSun, uCloud, uMoonDir;
${NOISE_GLSL}
${AIR_GLSL}

vec3 starField(vec3 d){
  vec2 uv = vec2(atan(d.z, d.x), asin(clamp(d.y, -1.0, 1.0))) * 64.0;
  vec4 r = hash4(uv);
  vec2 f = fract(uv) - (0.2 + 0.6 * r.xy);
  float twinkle = 0.7 + 0.3 * sin(uTime * (1.0 + 3.0 * r.w) + r.x * 40.0);
  float core = smoothstep(0.1, 0.0, length(f)) * pow(r.z, 12.0) * twinkle;
  return mix(vec3(0.75, 0.86, 1.0), vec3(1.0, 0.88, 0.7), r.w) * core * 2.5;
}

void main(){
  vec3 d = normalize(vDir);
  float h = max(d.y, 0.0);
  float mu = dot(d, uSunDir), s = max(mu, 0.0), ts = towardSun(d);
  vec3 hc = horizonColor(d);

  vec3 col = airColor(d);
  col += uSun * (pow(s, 8.0) * 0.12 + pow(s, 64.0) * 0.5 + pow(s, 700.0) * 2.5);
  col += starField(d) * uStars * smoothstep(0.02, 0.3, h) * (1.0 - uEnv);

  // moon: a disc with a hint of maria and a soft halo (drawn larger than life, as cameras and memory both do)
  float mm = dot(d, uMoonDir), halo = max(mm, 0.0);
  vec3 off = d - uMoonDir * mm;
  vec2 face = vec2(dot(off, normalize(cross(uMoonDir, vec3(0.0, 1.0, 0.0)))), off.y) / 0.0185;
  float disc = smoothstep(1.0, 0.94, length(face)) * step(0.0, mm);
  float maria = n2(face * 1.4 + 5.0) * 0.6 + n2(face * 3.3 + 1.0) * 0.4;
  vec3 moon = vec3(1.0, 0.97, 0.9) * disc * (0.5 + 0.75 * maria) * (0.72 + 0.28 * sqrt(max(1.0 - dot(face, face), 0.0))) * 2.6 * (1.0 - uEnv);
  col += (moon + vec3(0.45, 0.56, 0.8) * (pow(halo, 400.0) * 0.1 + pow(halo, 40.0) * 0.022)) * uMoon;

  // cloud deck: a flat layer in perspective, drifting, with a clear gap above the sun
  vec2 q = d.xz / (h + 0.11) * vec2(0.62, 0.9) + vec2(-0.011, 0.004) * uTime;
  vec2 qq = q + (fbm3(q * 0.45 + 7.1) - 0.5) * 1.3;
  float dens = fbm5(qq);
  float body = dens * 0.76 + n2(q * 0.2 + 3.7) * 0.34;
  float cov = smoothstep(0.5, 0.7, body);
  float gap = mix(0.02, 0.2, ts * ts);
  cov *= smoothstep(gap, gap + 0.16, h + (dens - 0.5) * 0.12);
  // relief: density one step toward the sun tells which side of a billow faces the light
  float relief = clamp((dens - fbm5(qq + normalize(uSunDir.xz + vec2(1e-5)) * 0.22)) * 4.5 + 0.5, 0.0, 1.0);
  vec3 cloud = uCloud * (0.55 + 0.9 * relief * relief);
  float under = pow(ts, 6.0) * exp(-max(h - gap, 0.0) * 5.0);
  cloud += uGlow * under * (0.05 + 1.1 * relief * relief * relief); // underside raked by the low sun
  cloud += uGlow * cov * (1.0 - cov) * 1.6 * pow(ts, 5.0);          // burning rim where the deck thins
  cloud += vec3(0.05, 0.032, 0.02) * uStars * exp(-h * 3.0);        // the city's sodium glow on low cloud at night
  cloud += vec3(0.3, 0.36, 0.5) * uMoon * pow(halo, 30.0) * (0.25 + cov * (1.0 - cov) * 4.0); // silver lining
  cloud = mix(cloud, hc, exp(-h * 12.0) * 0.6);                     // far cloud melts into the horizon
  col = mix(col, cloud, cov * 0.97);

  col += vec3(1.0, 0.8, 0.5) * uSun * smoothstep(0.9999, 0.99996, mu) * 18.0 * (1.0 - cov) * (1.0 - uEnv);

  if (d.y < 0.0) col = mix(hc, uHorizon * 0.35 + vec3(0.02, 0.014, 0.01) * uStars, smoothstep(0.0, 0.25, -d.y));
  gl_FragColor = vec4(clamp(col, 0.0, mix(64.0, 6.0, uEnv)), 1.0); // the capture stays free of fireflies
}`;

const box = new BoxGeometry(1, 1, 1);
const material = (env: number) => new ShaderMaterial({
  uniforms: { ...U, uEnv: { value: env } }, vertexShader, fragmentShader, side: BackSide, depthTest: false, depthWrite: false,
});

export const sky = new Mesh(box, material(0));
sky.frustumCulled = false;
sky.renderOrder = -1000;

const envScene = new Scene().add(new Mesh(box, material(1)));
let pmrem: PMREMGenerator | undefined;
let envTarget: WebGLRenderTarget | undefined;

/** Re-light the scene from the current sky. Costs a 64px cube plus its blur chain, so call it only when the hour moves. */
export function captureSky(gl: WebGLRenderer, scene: Scene) {
  pmrem ??= new PMREMGenerator(gl);
  const next = pmrem.fromScene(envScene, 0, 0.1, 10, { size: 64 });
  scene.environment = next.texture;
  envTarget?.dispose();
  envTarget = next;
}

export function disposeSky() {
  envTarget?.dispose();
  pmrem?.dispose();
  envTarget = pmrem = undefined;
}
