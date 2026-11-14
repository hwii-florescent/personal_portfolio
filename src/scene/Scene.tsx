"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, N8AO } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import { MathUtils, Vector3, type PerspectiveCamera } from "three";
import { BEATS, cabinAt, chapters, hologramsAt, INTRO, introAt, journeyAt, revealAt, SITES } from "@/lib/journey";
import { live } from "@/lib/live";
import { city } from "./city";
import { Grade } from "./grade";
import { holograms, updateHolograms } from "./holograms";
import { lift, updateLift } from "./lift";
import { disposeRoom, lend, materialize, renderMirror, room, updateRoom } from "./room";
import { U } from "./shared";
import { captureSky, disposeSky, sky } from "./sky";
import { skyAt } from "./sky-model";

const grade = new Grade();
const eye = new Vector3(), aim = new Vector3(), look = new Vector3(), feet = new Vector3();
// Quality tiers, best last. Antialiasing is the last thing to go: thin, far-off things (bridge cables, window grids)
// fall apart without it long before a slightly lower resolution shows.
const DPR = [1.25, 1.5, 2, 2];        // ceiling on the device pixel ratio
const SAMPLES = [2, 4, 4, 4];         // multisampling
const MIRROR = [0.3, 0.4, 0.5, 0.5];  // share of the canvas resolution spent on the floor's reflections
const BEST = DPR.length - 1;          // the only tier with ambient occlusion
const MIN_HORIZONTAL_FOV = MathUtils.degToRad(42); // phones in portrait would otherwise look through a keyhole

// Callouts pinned to the holograms: a label that follows each one on screen and jumps to the section it stands for.
const above = ([x, y, z]: readonly [number, number, number], up: number) => new Vector3(x, y + up, z);
const TAGS = [
  { of: "systems", at: above(SITES.a, 0.62), name: "Service graph", to: "experience" },
  { of: "route", at: above(SITES.a, 0.55), name: "Route found", to: "projects" },
  { of: "board", at: above(SITES.b, 0.2), name: "Skills board", to: "skills" },
] as const;
const pin = new Vector3();

/** Drives the whole room from the scroll position. Runs before the composer renders. */
function Stage({ tier, onReady, onSlow }: { tier: number; onReady: () => void; onSlow: () => void }) {
  const first = useRef(true);
  const flew = useRef(false); // the last frame was part of the intro's flight
  const lit = useRef(-1); // hour of the last sky capture
  const slow = useRef({ sum: 0, n: 0, strikes: 0 });
  const frame = useRef(0);
  const stride = useRef(0); // metres walked, for the bob of a first-person step
  const parallax = useRef(0); // how much of the pointer's look-around is applied: it eases in after the intro rather than switching on
  const tags = useRef<(HTMLElement | null)[]>(null);

  useFrame(({ gl, scene, camera, clock, size, viewport }, delta) => {
    const cam = camera as PerspectiveCamera;
    const dt = Math.min(delta, 0.1);
    const tall = size.width < size.height, flying = live.intro < 1;
    const snap = first.current || !live.motion || flying || flew.current; // reduced motion: cut between chapters, never travel
    const u = live.motion ? live.u : Math.round(live.u);
    const j = flying ? introAt(live.intro, tall) : journeyAt(u, tall);
    const k = snap ? 1 : 1 - Math.exp(-3.5 * dt);
    flew.current = flying;

    live.hour = MathUtils.lerp(live.hour, live.scrub ?? journeyAt(live.u).hour, snap ? 1 : 1 - Math.exp(-5 * dt));
    eye.fromArray(j.pos);
    aim.fromArray(j.look);
    if (snap) { look.copy(aim); feet.copy(eye); }
    const walked = feet.distanceTo(eye) * k;
    feet.lerp(eye, k);
    stride.current += walked;
    cam.position.copy(feet);
    if (live.motion && !flying) cam.position.y += Math.sin(stride.current * 8.4) * 0.011 * Math.min(walked / dt / 1.2, 1); // a step every 75 cm
    cam.lookAt(look.lerp(aim, k));
    parallax.current += ((flying ? 0 : 1) - parallax.current) * (snap ? 0 : 1 - Math.exp(-2.5 * dt));
    if (live.motion) { cam.rotateY(-live.pointerX * 0.12 * live.look * parallax.current); cam.rotateX(live.pointerY * 0.07 * live.look * parallax.current); }
    const fov = MathUtils.radToDeg(Math.max(MathUtils.degToRad(j.fov), flying ? 0 : 2 * Math.atan(Math.tan(MIN_HORIZONTAL_FOV / 2) / (size.width / size.height))));
    if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = MathUtils.lerp(cam.fov, fov, k); cam.updateProjectionMatrix(); }

    const time = live.motion ? clock.elapsedTime : 0;
    const s = skyAt(live.hour);
    U.uTime.value = time;
    U.uSunDir.value.fromArray(s.sunDir);
    U.uMoonDir.value.fromArray(s.moonDir);
    U.uMoon.value = s.moon;
    U.uZenith.value.fromArray(s.zenith);
    U.uHorizon.value.fromArray(s.horizon);
    U.uGlow.value.fromArray(s.glow);
    U.uSun.value.fromArray(s.sun);
    U.uCloud.value.fromArray(s.cloud);
    U.uStars.value = s.stars;
    U.uLit.value = s.lit;
    U.uLamps.value = s.lamps;
    U.uPx.value = (size.height * viewport.dpr) / 2;
    U.uDot.value = 1.4 * viewport.dpr;
    U.uKeyDir.value.fromArray(s.keyDir);
    U.uKey.value.fromArray(s.key);
    scene.environmentIntensity = s.ambient;
    updateRoom(s);
    const reveal = flying ? revealAt(live.intro) : 1; // the intro builds the room from its skeleton
    materialize(reveal);
    const cabin = flying && live.intro * INTRO.seconds < BEATS.build[0]; // the lift is in the scene until the camera has left it behind
    lift.visible = cabin;
    lend(cabin);
    if (cabin) { const c = cabinAt(live.intro); updateLift(c.floor, c.door); }
    holograms.visible = frame.current < 4 || reveal > 0.9; // drawn for real in the first frames, behind the black card, so their shaders, textures and buffers are ready before the intro reveals them
    updateHolograms(time, u, live.hour, U.uPx.value);
    cam.updateMatrixWorld();

    // Callouts: only where the hologram is up, in frame and clear of the text column (which steps aside in scene-only mode).
    tags.current ??= TAGS.map((t) => document.querySelector<HTMLElement>(`[data-tag="${t.of}"]`));
    const power = hologramsAt(u), clear = live.look > 0.5 ? -0.9 : 0.12;
    TAGS.forEach((t, i) => {
      const el = tags.current![i];
      if (!el) return;
      pin.copy(t.at).project(cam);
      const on = !flying && pin.z < 1 && pin.x > clear && pin.x < 0.8 - 360 / size.width && Math.abs(pin.y) < 0.8 && power[t.of] > 0.9;
      el.style.transform = `translate(${((pin.x + 1) / 2) * size.width}px, ${((1 - pin.y) / 2) * size.height}px)`;
      el.dataset.on = on ? "1" : "";
    });

    // Relight from the sky when the hour has moved, at most every third frame: clouds drift too slowly to matter.
    if (first.current || (Math.abs(live.hour - lit.current) > 0.03 && frame.current % 3 === 0)) { captureSky(gl, scene); lit.current = live.hour; }
    renderMirror(gl, scene, cam, MIRROR[tier]);

    // Quality steps down, never up, when frames that were asked for at full rate keep arriving late: two slow
    // stretches in a row, so one hitch (a shader compiling, a tab waking up) costs nothing. Never during the intro:
    // its first frames compile everything, and a tier change rebuilds the composer, a visible stall mid-flight.
    if (!flying && performance.now() - live.touched < 1000 && delta < 0.1 && frame.current > 60) {
      const m = slow.current;
      m.sum += delta; m.n++;
      if (m.n >= 45) {
        m.strikes = m.sum / m.n > 1 / 50 ? m.strikes + 1 : 0;
        if (m.strikes > 1) { onSlow(); m.strikes = 0; }
        m.sum = m.n = 0;
      }
    }
    frame.current++;
    if (first.current) { first.current = false; requestAnimationFrame(onReady); }
  });

  return (
    <>
      <primitive object={sky} dispose={null} />
      <primitive object={city} dispose={null} />
      <primitive object={room} dispose={null} />
      <primitive object={lift} dispose={null} />
      <primitive object={holograms} dispose={null} />
    </>
  );
}

/** Full frame rate while the visitor scrolls or moves, half rate for the drifting clouds, nothing at all under reduced motion. */
function Pacer() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let id = 0, n = 0;
    const loop = () => {
      id = requestAnimationFrame(loop);
      const busy = performance.now() - live.touched < 1400;
      // Two frames per request while busy: fiber stops its loop when a request runs out, and a loop restarted
      // every frame only draws every other one.
      if (busy) invalidate(2);
      else if (live.motion && n++ % 2 === 0) invalidate();
    };
    live.touched = performance.now();
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [invalidate]);
  return null;
}

export default function Scene({ onReadyAction }: { onReadyAction: () => void }) {
  const [tier, setTier] = useState(() => (matchMedia("(pointer: coarse), (max-width: 820px)").matches ? BEST - 1 : BEST)); // phones skip ambient occlusion
  useEffect(() => () => { disposeSky(); disposeRoom(); }, []);
  const start = live.intro < 1 ? introAt(live.intro) : chapters[0];
  return (
    <>
    <Canvas
      frameloop="demand" shadows="percentage" dpr={[1, DPR[tier]]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [...start.pos], fov: start.fov, near: 0.25, far: 40000 }}
      aria-hidden="true"
    >
      <Stage tier={tier} onReady={onReadyAction} onSlow={() => setTier((t) => Math.max(0, t - 1))} />
      <Pacer />
      <EffectComposer multisampling={SAMPLES[tier]}>
        {tier === BEST ? <N8AO halfRes aoRadius={0.9} intensity={2.4} distanceFalloff={1} quality="medium" /> : <></>}
        <Bloom mipmapBlur intensity={0.65} luminanceThreshold={1} luminanceSmoothing={0.3} radius={0.78} />
        <primitive object={grade} dispose={null} />
      </EffectComposer>
    </Canvas>
    <div className="tags">
      {TAGS.map((t) => (
        <a key={t.of} className="tag-holo" data-tag={t.of} href={`#${t.to}`} tabIndex={-1}>
          <span>{t.name}</span>
          <small>{chapters.find((c) => c.id === t.to)!.label} →</small>
        </a>
      ))}
    </div>
    </>
  );
}
