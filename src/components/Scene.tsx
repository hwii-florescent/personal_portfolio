"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor, Sparkles, Text, useGLTF } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { MathUtils, Vector3, type Group, type Mesh, type Points, type ShaderMaterial } from "three";
import { timer, TimerTick } from "@/lib/timer";
import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { sections, type SectionId } from "@/data/sections";
import type { Palette } from "@/data/themes";
import Hologram from "./Hologram";
import Monitor, { useFocusPose } from "./HtmlPanel";
import Workshop, { RealProp } from "./Workshop";
import { Editable3D, useLayout } from "./LayoutEditor";
import { CAM, cameraLimits, identity } from "@/data/layout";
import { SPEECH_HEIGHTS, TYPE_MS } from "@/data/intro";


const FONT = "/fonts/Orbitron.ttf";
const UP = new Vector3(0, 1, 0);
// Bound drei's singular sparkle alpha before it reaches the HDR buffer; nonfinite values can spread through Bloom's mip chain.
// ponytail: shader-text patch for the installed drei version; tests/quad.test.mjs catches upstream changes. Prefer an upstream fix on upgrade.
const clampSparkles = (pts: Points | null) => {
  const m = pts?.material as ShaderMaterial | undefined;
  if (!m) return;
  m.fragmentShader = m.fragmentShader.replace("0.05 / distanceToCenter - 0.1", "clamp(0.05 / max(distanceToCenter, 1e-4) - 0.1, 0.0, 1.0)");
  m.needsUpdate = true;
};
[...sections.map((s) => s.model), "/models/mug.glb", "/models/pens.glb"].forEach((m) => useGLTF.preload(m));

// Slot layout across the desk: a shallow arc facing the viewer.
const slot = (i: number): [number, number, number] => {
  const k = i - (sections.length - 1) / 2;
  return [k * 1.25, 0, -Math.abs(k) * 0.3 - 0.2];
};

function Slot({ i, p, active, onSelect, motion, focus, show }: {
  i: number; p: Palette; active: SectionId | null; onSelect: (id: SectionId | null) => void; motion: number; focus: boolean; show: boolean;
}) {
  const ap = useRef(show ? 1 : 0); // appear factor: the intro holds the holograms back, then they grow in
  const s = sections[i];
  const g = useRef<Group>(null);
  const holo = useRef<Group>(null);
  const hit = useRef<Mesh>(null);
  const label = useRef<Group>(null);
  const [worldScale] = useState(() => new Vector3());
  const [labelDirection] = useState(() => new Vector3());
  const f = useRef(0); // 0 = home spot, 1 = in the row beside the open monitor
  const [hover, setHover] = useState(false);
  const editor = useLayout();
  const pose = useFocusPose();
  const editing = editor?.editing;
  const selected = !editing && active === s.id;
  const home = slot(i);
  const rail = focus; // section view: the pad is in the row (has its own layout); home view: it is on the desk
  const id = rail ? (`pad-${s.id}` as const) : s.id;
  const tHome = editor?.layout[s.id] ?? identity;
  const tOpen = editor?.layout[`pad-${s.id}` as const] ?? identity;
  const tCur = rail ? tOpen : tHome; // the wrapper (Editable3D) currently in use
  const base = rail ? pose.pads[i] : home;
  const ev = {
    onClick: (e: ThreeEvent<MouseEvent>) => { if (!show) return; e.stopPropagation(); if (editing) { if (!editor.cameraEditing) editor.select(id); } else onSelect(selected ? null : s.id); },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { if (!show) return; e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; },
    onPointerOut: () => { setHover(false); document.body.style.cursor = ""; },
  };

  useFrame(({ camera }, dt) => {
    const grp = g.current;
    const h = holo.current;
    if (!grp || !h) return;
    f.current = MathUtils.damp(f.current, rail ? 1 : 0, 3.5, dt);
    const k = f.current;
    const L = MathUtils.lerp;
    // World pose = blend of the home layout and the section-view layout; then solve for the local pose inside the wrapper (offset, yaw, scale).
    const o = pose.pads[i];
    grp.position.set(
      L(home[0] + tHome.position[0], o[0] + tOpen.position[0], k) - base[0] - tCur.position[0],
      L(home[1] + tHome.position[1], o[1] + tOpen.position[1], k) - base[1] - tCur.position[1],
      L(home[2] + tHome.position[2], o[2] + tOpen.position[2], k) - base[2] - tCur.position[2],
    ).divideScalar(tCur.scale).applyAxisAngle(UP, -(tCur.rotation ?? 0));
    grp.rotation.y = L(tHome.rotation ?? 0, tOpen.rotation ?? 0, k) - (tCur.rotation ?? 0);
    ap.current = motion ? MathUtils.damp(ap.current, show ? 1 : 0, 3, dt) : Number(show);
    grp.visible = ap.current > 0.01;
    grp.scale.setScalar(Math.max(ap.current, 1e-4) * L(tHome.scale, pose.padScale * tOpen.scale, k) / tCur.scale);
    const sc = selected ? 1.15 : hover && !editing ? 1.12 : 1;
    h.scale.setScalar(MathUtils.damp(h.scale.x, sc, 6, dt));
    const bob = motion && !editing ? Math.sin(timer.getElapsed() * 1.2 + i) * 0.04 : 0;
    h.position.y = MathUtils.damp(h.position.y, 0.2 + bob, 6, dt);
    // Keep the central body target tight; visible geometry and labels handle the rest.
    hit.current?.scale.set(L(1, 0.6, k), 1, L(1, 0.6, k));
    // Follow the live world position (including gizmo drags), not the pad's yaw or text scale.
    if (label.current) {
      label.current.visible = grp.visible;
      grp.getWorldPosition(label.current.position);
      grp.getWorldScale(worldScale);
      label.current.position.y += 0.02;
      if (rail) {
        label.current.quaternion.copy(camera.quaternion);
        labelDirection.set(0, 0, 1).applyQuaternion(camera.quaternion).setY(0).normalize();
        label.current.position.addScaledVector(labelDirection, 0.85 * worldScale.x);
      } else {
        label.current.quaternion.identity();
        label.current.position.z += 0.85 * worldScale.x;
      }
    }
  });

  return (
    <>
    <Editable3D id={id} position={base}>
    <group ref={g} visible={show}>
      <group ref={holo} position-y={0.2} {...ev}>
        <Suspense fallback={null}>
          <Hologram url={s.model} p={p} opacity={rail && !selected && !hover ? 0.55 : 1} boost={hover || selected ? 0.35 : 0} motion={editing ? 0 : motion} />
        </Suspense>
      </group>
      {/* Tight invisible target: no oversized volume over neighbouring sections. */}
      <mesh ref={hit} name={`target-${s.id}`} position-y={0.6} visible={false} {...ev}>
        <cylinderGeometry args={[0.4, 0.4, 0.65, 16]} />
      </mesh>
    </group>
    </Editable3D>
    {/* World-space sibling: desk engraving at home, camera-facing labels in section view. */}
    <group ref={label} name={`label-${s.id}`} visible={show}>
      <Text
        font={FONT} fontSize={0.1} letterSpacing={0.25} rotation-x={rail ? 0 : -1.15}
        renderOrder={10} material-depthTest={false} material-depthWrite={false}
        color={selected || hover ? p.gold : p.accent} anchorY="middle" {...ev}
      >
        {s.label.toUpperCase()}
      </Text>
    </group>
    </>
  );
}

/** Fixed to the pad's world-space center: the speech projects upward once, not toward the camera. */
function Speech({ text, p, instant, height }: { text: string; p: Palette; instant: boolean; height: number }) {
  const rise = useRef<Group>(null);
  useFrame((_, dt) => {
    if (rise.current) rise.current.position.y = instant ? height : MathUtils.damp(rise.current.position.y, height, 3, dt);
  });
  return (
    <group name="speech-projector" position={[0, 0.025, 0]}>
      <group ref={rise} name="speech-text" position-y={instant ? height : 0.06}>
        <SpeechLine key={text} text={text} p={p} instant={instant} />
      </group>
    </group>
  );
}

/** Key the line, not the projector: new speech retypes without dropping back onto the pad. */
function SpeechLine({ text, p, instant }: { text: string; p: Palette; instant: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (instant) return;
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 1)), TYPE_MS);
    return () => clearInterval(id);
  }, [text, instant]);
  const shown = instant ? text : text.slice(0, n);
  const glow = { color: p.accent, outlineWidth: 0.006, outlineColor: p.accent, outlineOpacity: 0.35, "material-toneMapped": false, "material-depthWrite": false } as const;
  return (
    <group>
      <Text font={FONT} fontSize={0.07} letterSpacing={0.3} position-y={0.14} anchorY="bottom" {...glow} color={p.gold} outlineColor={p.gold}>
        {`▸ ${p.ai}`}
      </Text>
      <Text font={FONT} fontSize={text.length < 40 ? 0.26 : 0.15} maxWidth={5.2} lineHeight={1.35} textAlign="center" anchorY="top" renderOrder={10} {...glow}>
        {shown}
      </Text>
    </group>
  );
}

function Rig({ active, focus, intro }: { active: SectionId | null; focus: boolean; intro: boolean }) {
  const editor = useLayout();
  const camera = useThree((s) => s.camera);
  const id = active ? "camera-section" : "camera-home";
  const position = [...(editor?.layout[id]?.position ?? CAM.pos)];
  // Intro orbits at 21° with the saved home distance and yaw; revealing the modules restores the saved 30° home pose.
  if (intro && !active && !editor?.editing) {
    const radius = Math.hypot(position[0], position[1] - CAM.at[1], position[2]);
    const yaw = Math.atan2(position[0], position[2]);
    const elevation = MathUtils.degToRad(21);
    position[0] = radius * Math.cos(elevation) * Math.sin(yaw);
    position[1] = CAM.at[1] + radius * Math.sin(elevation);
    position[2] = radius * Math.cos(elevation) * Math.cos(yaw);
  }
  const firstFrame = useRef(true);
  const cameraEditing = !!editor?.cameraEditing;
  const interacting = useRef(false);
  useEffect(() => { interacting.current = false; }, [id, cameraEditing]);
  useEffect(() => {
    if (!cameraEditing) return;
    camera.position.fromArray(position);
    camera.lookAt(...CAM.at);
  }, [camera, position, cameraEditing]);

  useFrame(({ camera, pointer, size }, dt) => {
    if (cameraEditing) return; // OrbitControls owns the camera while adjusting a view.
    if (firstFrame.current) {
      if (intro && !editor?.editing) camera.position.fromArray(position); // start at 21°, rather than flying there from the Canvas default
      firstFrame.current = false;
    }
    const flat = active && !focus;
    const zoom = size.width < 768 ? Math.max(1, 1.4 * size.height / size.width) : 1;
    const parallax = active || editor?.editing ? 0 : 0.01; // Barely perceptible at the desk; no mouse tilt while reading.
    // Opening: settle just ahead of the monitor's fixed-length flight (HtmlPanel FLIGHT) so the profile lands on the résumé's box.
    const rate = active ? 4.5 : 2.5;
    camera.position.x = MathUtils.damp(camera.position.x, position[0] * zoom + pointer.x * 0.35 * parallax, rate, dt);
    camera.position.y = MathUtils.damp(camera.position.y, CAM.at[1] + (position[1] - CAM.at[1]) * zoom - (flat ? 0.3 : 0) + pointer.y * 0.12 * parallax, rate, dt);
    camera.position.z = MathUtils.damp(camera.position.z, position[2] * zoom - (flat ? 0.4 : 0), rate, dt);
    camera.lookAt(flat ? -0.6 : CAM.at[0], CAM.at[1], CAM.at[2]);
  }, -2); // before the controls and the monitor's DOM projection

  return cameraEditing && editor ? (
    <OrbitControls key={id} target={[...CAM.at]} enablePan={false} enableDamping={false}
      minDistance={cameraLimits.distance[0]} maxDistance={cameraLimits.distance[1]}
      minPolarAngle={MathUtils.degToRad(90 - cameraLimits.elevation[1])}
      maxPolarAngle={MathUtils.degToRad(90 - cameraLimits.elevation[0])}
      minAzimuthAngle={MathUtils.degToRad(cameraLimits.azimuth[0])}
      maxAzimuthAngle={MathUtils.degToRad(cameraLimits.azimuth[1])}
      onStart={() => { interacting.current = true; }} onEnd={() => { interacting.current = false; }}
      onChange={() => { if (interacting.current) editor.update(id, { position: camera.position.toArray(), scale: 1 }); }} />
  ) : null;
}

/** Mounts only once everything in the canvas (textures, models) has loaded, i.e. when the first real frame can be shown. */
function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

export default function Scene({ p, active, onSelectAction, motion, panel3d, faceRef, onReadyAction, speech, holograms }: {
  p: Palette; active: SectionId | null; onSelectAction: (id: SectionId | null) => void; motion: number; panel3d?: boolean;
  faceRef: RefObject<HTMLDivElement | null>; onReadyAction: () => void;
  speech: string | null; holograms: boolean; // intro: what the AI says now, and whether the holograms may appear yet
}) {
  // Low-end GPUs: when the frame rate stays below the monitor's bounds, drop to 1x resolution and skip Bloom.
  // ponytail: one-way (no recovery) so it cannot flip-flop; upgrade to onIncline if recovery is wanted.
  const [low, setLow] = useState(false);
  const focus = !!panel3d && active !== null; // md+: camera pushes in on the monitor and the section objects line up beside it
  return (
    <Canvas shadows="percentage" camera={{ position: [...CAM.pos], fov: 48 }} dpr={low ? 1 : [1, 2]} gl={{ antialias: true }} aria-hidden="true">
      <PerformanceMonitor onDecline={() => setLow(true)} />
      <TimerTick />
      <Ready onReady={onReadyAction} />
      <color attach="background" args={[p.bg]} />
      <fog attach="fog" args={[p.bg, 38, 65]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 3, 1]} intensity={8} color={p.accent} />
      <Workshop p={p} desktop={!!panel3d} />
      <Suspense fallback={null}>
        <Editable3D id="mug" position={[-4.25, 0, 2.35]}><RealProp url="/models/mug.glb" at={[0, 0, 0]} size={0.42} rotY={0.6} /></Editable3D>
        <Editable3D id="pens" position={[3.6, 0, 2.35]}><RealProp url="/models/pens.glb" at={[0, 0, 0]} size={0.65} rotY={-0.4} /></Editable3D>
      </Suspense>
      {sections.map((_, i) => (
        <Slot key={i} i={i} p={p} active={active} onSelect={onSelectAction} motion={motion} focus={focus} show={holograms && active === null} />
      ))}
      {speech && <Speech text={speech} p={p} instant={motion === 0} height={holograms ? SPEECH_HEIGHTS.modules : SPEECH_HEIGHTS.intro} />}
      <Sparkles ref={clampSparkles} count={70} scale={[12, 3, 6]} position={[0, 1.2, -0.5]} size={2} speed={motion * 0.25} color={p.accent} />
      {panel3d && holograms && <Monitor p={p} active={active} faceRef={faceRef} />}
      <Rig active={active} focus={focus} intro={!holograms} />
      {!low && (
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.45} luminanceSmoothing={0.3} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
