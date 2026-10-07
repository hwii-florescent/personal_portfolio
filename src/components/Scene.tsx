"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Sparkles, Text, useGLTF } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { MathUtils, AdditiveBlending, Color, DoubleSide, type Group } from "three";
import { Suspense, useRef, useState } from "react";
import { sections, type SectionId } from "@/data/sections";
import type { Palette } from "@/data/themes";
import Hologram from "./Hologram";

const FONT = "/fonts/Orbitron.ttf";
sections.forEach((s) => useGLTF.preload(s.model));

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

function Slot({ i, p, active, onSelect, motion }: {
  i: number; p: Palette; active: SectionId | null; onSelect: (id: SectionId | null) => void; motion: number;
}) {
  const s = sections[i];
  const g = useRef<Group>(null);
  const holo = useRef<Group>(null);
  const [hover, setHover] = useState(false);
  const selected = active === s.id;
  const other = active !== null && !selected;
  const home = slot(i);

  useFrame(({ clock }, dt) => {
    const grp = g.current;
    const h = holo.current;
    if (!grp || !h) return;
    // selected: pull the object toward the viewer / left, scaled up; others stay put, dimmed
    const tx = selected ? -1.6 : home[0];
    const tz = selected ? 0.6 : home[2];
    grp.position.x = MathUtils.damp(grp.position.x, tx, 4, dt);
    grp.position.z = MathUtils.damp(grp.position.z, tz, 4, dt);
    const sc = selected ? 1.4 : hover ? 1.12 : 1;
    h.scale.setScalar(MathUtils.damp(h.scale.x, sc, 6, dt));
    const bob = motion ? Math.sin(clock.elapsedTime * 1.2 + i) * 0.04 : 0;
    h.position.y = MathUtils.damp(h.position.y, (selected ? 0.55 : 0.35) + bob, 6, dt);
  });

  return (
    <group ref={g} position={home}>
      <Emitter p={p} lit={selected || hover} />
      <group ref={holo} position-y={0.35}>
        <Suspense fallback={null}>
          <Hologram url={s.model} p={p} opacity={other ? 0.12 : 1} boost={hover || selected ? 0.35 : 0} motion={motion} />
        </Suspense>
      </group>
      {/* generous invisible hit target so the click doesn't depend on thin geometry */}
      <mesh
        position-y={0.8}
        visible={false}
        onClick={(e) => { e.stopPropagation(); onSelect(selected ? null : s.id); }}
        onPointerOver={() => { setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}
      >
        <cylinderGeometry args={[0.8, 0.8, 1.8, 12]} />
      </mesh>
      {/* label sits flat on the desk, like engraving in front of the pad */}
      <Text
        font={FONT} fontSize={0.1} letterSpacing={0.25} position={[0, 0.02, 0.85]} rotation-x={-1.15}
        color={selected || hover ? p.gold : p.accent} anchorY="middle"
      >
        {s.label.toUpperCase()}
      </Text>
    </group>
  );
}

function Desk({ p }: { p: Palette }) {
  return (
    <>
      <mesh position={[0, -0.1, -1]} receiveShadow>
        <boxGeometry args={[16, 0.2, 9]} />
        <meshStandardMaterial color="#04070b" metalness={0.85} roughness={0.38} />
      </mesh>
      <Grid
        position={[0, 0.002, -1]}
        args={[16, 9]}
        cellSize={0.5}
        sectionSize={2}
        cellColor={p.accent}
        sectionColor={p.primary}
        cellThickness={0.4}
        sectionThickness={0.9}
        fadeDistance={9}
        fadeStrength={2}
      />
      {/* desk-edge accent line */}
      <mesh position={[0, 0.005, 3.5]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[16, 0.02]} />
        <meshBasicMaterial color={p.primary} toneMapped={false} />
      </mesh>
    </>
  );
}

function Rig({ active }: { active: SectionId | null }) {
  useFrame(({ camera, pointer }, dt) => {
    // slight mouse parallax so it feels like you're leaning over the table
    camera.position.x = MathUtils.damp(camera.position.x, pointer.x * 0.35, 2.5, dt);
    camera.position.y = MathUtils.damp(camera.position.y, (active ? 1.5 : 1.8) + pointer.y * 0.12, 2.5, dt);
    camera.position.z = MathUtils.damp(camera.position.z, active ? 4.6 : 5.2, 2.5, dt);
    camera.lookAt(active ? -0.6 : 0, 1.0, 0);
  });
  return null;
}

export default function Scene({ p, active, onSelect, motion }: {
  p: Palette; active: SectionId | null; onSelect: (id: SectionId | null) => void; motion: number;
}) {
  return (
    <Canvas camera={{ position: [0, 1.8, 5.2], fov: 48 }} dpr={[1, 2]} gl={{ antialias: true }} aria-hidden="true">
      <color attach="background" args={[p.bg]} />
      <fog attach="fog" args={[p.bg, 7, 15]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 3, 1]} intensity={8} color={p.accent} />
      <Desk p={p} />
      {sections.map((_, i) => (
        <Slot key={i} i={i} p={p} active={active} onSelect={onSelect} motion={motion} />
      ))}
      <Sparkles count={70} scale={[12, 3, 6]} position={[0, 1.2, -0.5]} size={2} speed={motion * 0.25} color={p.accent} />
      <Rig active={active} />
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.45} luminanceSmoothing={0.3} />
      </EffectComposer>
    </Canvas>
  );
}
