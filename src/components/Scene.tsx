"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { PerformanceMonitor, Sparkles, Text, useGLTF } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { MathUtils, AdditiveBlending, Color, DoubleSide, Vector3, type Group, type Mesh } from "three";
import { timer, TimerTick } from "@/lib/timer";
import { Suspense, useRef, useState } from "react";
import { sections, type SectionId } from "@/data/sections";
import type { Palette } from "@/data/themes";
import Hologram from "./Hologram";
import Monitor, { CAM, useFocusPose } from "./HtmlPanel";
import Workshop, { RealProp } from "./Workshop";
import { Editable3D, useLayout } from "./LayoutEditor";
import { identity } from "@/data/layout";


const FONT = "/fonts/Orbitron.ttf";
const UP = new Vector3(0, 1, 0);
[...sections.map((s) => s.model), "/models/mug.glb", "/models/pens.glb"].forEach((m) => useGLTF.preload(m));

// Slot layout across the desk: a shallow arc facing the viewer.
const slot = (i: number): [number, number, number] => {
  const k = i - (sections.length - 1) / 2;
  return [k * 1.25, 0, -Math.abs(k) * 0.3 - 0.2];
};

const beamVert = /* glsl */ `varying float vH; void main(){ vH = uv.y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `;
const beamFrag = /* glsl */ `uniform vec3 uColor; uniform float uA; varying float vH;
  void main(){ gl_FragColor = vec4(uColor, pow(1.0 - vH, 2.0) * uA); }`;

/** Emitter pad on the desk: glowing rings plus a soft light cone rising to the hologram. */
function Emitter({ p, lit }: { p: Palette; lit: boolean }) {
  const beam = useRef<Group>(null);
  useFrame((_, dt) => {
    if (beam.current) beam.current.scale.y = MathUtils.damp(beam.current.scale.y, lit ? 1.6 : 1, 5, dt);
  });
  return (
    <group scale={0.7}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
        <ringGeometry args={[0.62, 0.68, 64]} />
        <meshBasicMaterial color={p.accent} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
        <ringGeometry args={[0.82, 0.84, 64]} />
        <meshBasicMaterial color={p.primary} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.008}>
        <circleGeometry args={[0.62, 48]} />
        <meshBasicMaterial color={p.accent} transparent opacity={lit ? 0.22 : 0.1} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={beam}>
        <mesh position-y={0.7}>
          <cylinderGeometry args={[0.55, 0.62, 1.4, 40, 1, true]} />
          <shaderMaterial
            vertexShader={beamVert}
            fragmentShader={beamFrag}
            uniforms={{ uColor: { value: new Color(p.accent) }, uA: { value: lit ? 0.25 : 0.14 } }}
            transparent depthWrite={false} side={DoubleSide} blending={AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

function Slot({ i, p, active, onSelect, motion, focus }: {
  i: number; p: Palette; active: SectionId | null; onSelect: (id: SectionId | null) => void; motion: number; focus: boolean;
}) {
  const s = sections[i];
  const g = useRef<Group>(null);
  const holo = useRef<Group>(null);
  const hit = useRef<Mesh>(null);
  const label = useRef<Mesh>(null);
  const [worldScale] = useState(() => new Vector3());
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
    onClick: (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (editing) editor.select(id); else onSelect(selected ? null : s.id); },
    onPointerOver: () => { setHover(true); document.body.style.cursor = "pointer"; },
    onPointerOut: () => { setHover(false); document.body.style.cursor = ""; },
  };

  useFrame((_, dt) => {
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
    grp.scale.setScalar(L(tHome.scale, pose.padScale * tOpen.scale, k) / tCur.scale);
    const sc = selected ? 1.15 : hover && !editing ? 1.12 : 1;
    h.scale.setScalar(MathUtils.damp(h.scale.x, sc, 6, dt));
    const bob = motion && !editing ? Math.sin(timer.getElapsed() * 1.2 + i) * 0.04 : 0;
    h.position.y = MathUtils.damp(h.position.y, 0.2 + bob, 6, dt);
    // pads sit close together in the row: narrow the hit cylinders so neighbours don't overlap
    hit.current?.scale.set(L(1, 0.6, k), 1, L(1, 0.6, k));
    // Follow the live world position (including gizmo drags), not the pad's yaw or text scale.
    if (label.current) {
      grp.getWorldPosition(label.current.position);
      grp.getWorldScale(worldScale);
      label.current.position.y += 0.02;
      label.current.position.z += 0.85 * worldScale.x;
    }
  });

  return (
    <>
    <Editable3D id={id} position={base}>
    <group ref={g}>
      <Emitter p={p} lit={selected || hover} />
      <group ref={holo} position-y={0.2}>
        <Suspense fallback={null}>
          <Hologram url={s.model} p={p} opacity={rail && !selected && !hover ? 0.55 : 1} boost={hover || selected ? 0.35 : 0} motion={editing ? 0 : motion} />
        </Suspense>
      </group>
      {/* generous invisible hit target so the click doesn't depend on thin geometry */}
      <mesh ref={hit} position-y={0.8} visible={false} {...ev}>
        <cylinderGeometry args={[0.8, 0.8, 1.8, 12]} />
      </mesh>
    </group>
    </Editable3D>
    {/* World-space sibling: fixed-size engraving at the front, never hidden by a resized object. */}
    <Text
      ref={label} font={FONT} fontSize={0.1} letterSpacing={0.25} rotation-x={-1.15}
      renderOrder={10} material-depthTest={false} material-depthWrite={false}
      color={selected || hover ? p.gold : p.accent} anchorY="middle" {...ev}
    >
      {s.label.toUpperCase()}
    </Text>
    </>
  );
}

function Rig({ active, focus }: { active: SectionId | null; focus: boolean }) {
  const editor = useLayout();
  useFrame(({ camera, pointer }, dt) => {
    // slight mouse parallax so it feels like you're leaning over the table. The camera stays put when a section opens (md+):
    // the monitor comes to it. Below md the old nudge toward the flat panel remains.
    const flat = active && !focus;
    camera.position.x = MathUtils.damp(camera.position.x, editor?.editing ? 0 : pointer.x * 0.35, 2.5, dt);
    camera.position.y = MathUtils.damp(camera.position.y, (flat ? 1.5 : CAM.pos[1]) + (editor?.editing ? 0 : pointer.y * 0.12), 2.5, dt);
    camera.position.z = MathUtils.damp(camera.position.z, flat ? 4.6 : CAM.pos[2], 2.5, dt);
    camera.lookAt(flat ? -0.6 : CAM.at[0], CAM.at[1], CAM.at[2]);
  });
  return null;
}

export default function Scene({ p, active, onSelectAction, motion, panel3d }: {
  p: Palette; active: SectionId | null; onSelectAction: (id: SectionId | null) => void; motion: number; panel3d?: boolean;
}) {
  // Low-end GPUs: when the frame rate stays below the monitor's bounds, drop to 1x resolution and skip Bloom.
  // ponytail: one-way (no recovery) so it cannot flip-flop; upgrade to onIncline if recovery is wanted.
  const [low, setLow] = useState(false);
  const focus = !!panel3d && active !== null; // md+: camera pushes in on the monitor and the section objects line up beside it
  return (
    <Canvas camera={{ position: [0, 1.8, 5.2], fov: 48 }} dpr={low ? 1 : [1, 2]} gl={{ antialias: true }} aria-hidden="true">
      <PerformanceMonitor onDecline={() => setLow(true)} />
      <TimerTick />
      <color attach="background" args={[p.bg]} />
      <fog attach="fog" args={[p.bg, 9, 21]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 3, 1]} intensity={8} color={p.accent} />
      <Workshop p={p} />
      <Suspense fallback={null}>
        <Editable3D id="mug" position={[-2.5, 0, 1.1]}><RealProp url="/models/mug.glb" at={[0, 0, 0]} size={0.42} rotY={0.6} /></Editable3D>
        <Editable3D id="pens" position={[2.6, 0, 1.1]}><RealProp url="/models/pens.glb" at={[0, 0, 0]} size={0.65} rotY={-0.4} /></Editable3D>
      </Suspense>
      {sections.map((_, i) => (
        <Slot key={i} i={i} p={p} active={active} onSelect={onSelectAction} motion={motion} focus={focus} />
      ))}
      <Sparkles count={70} scale={[12, 3, 6]} position={[0, 1.2, -0.5]} size={2} speed={motion * 0.25} color={p.accent} />
      {panel3d && <Monitor p={p} active={active} onCloseAction={() => onSelectAction(null)} />}
      <Rig active={active} focus={focus} />
      {!low && (
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.45} luminanceSmoothing={0.3} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
