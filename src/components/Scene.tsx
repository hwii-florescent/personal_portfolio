"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Grid, Line, Sparkles, Text } from "@react-three/drei";
import { MathUtils, type Group, type Mesh } from "three";
import { useRef, useState } from "react";
import { sections, type SectionId } from "@/data/sections";
import type { Palette } from "@/data/themes";

const TAU = Math.PI * 2;
const RADIUS = 3.2;
const nodePos = (i: number): [number, number, number] => {
  const a = (i / sections.length) * TAU;
  return [Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS];
};

/** Arc-reactor style core: wireframe shell, bright centre, three counter-rotating rings. */
function Core({ p, motion }: { p: Palette; motion: number }) {
  const rings = useRef<Group>(null);
  useFrame((_, dt) => {
    const [a, b, c] = rings.current?.children ?? [];
    const k = dt * motion;
    if (a) a.rotation.x += k * 0.6;
    if (b) b.rotation.y += k * 0.8;
    if (c) c.rotation.z -= k * 0.5;
  });
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshBasicMaterial color={p.accent} wireframe transparent opacity={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshBasicMaterial color={p.gold} />
      </mesh>
      <group ref={rings}>
        {[1.0, 1.25, 1.5].map((r, i) => (
          <mesh key={r} rotation={[i, i * 0.7, 0]}>
            <torusGeometry args={[r, 0.015, 8, 128]} />
            <meshBasicMaterial color={i === 1 ? p.primary : p.accent} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Shape({ kind }: { kind: (typeof sections)[number]["shape"] }) {
  switch (kind) {
    case "box": return <boxGeometry args={[0.7, 0.7, 0.7]} />;
    case "icosahedron": return <icosahedronGeometry args={[0.5, 0]} />;
    case "dodecahedron": return <dodecahedronGeometry args={[0.5, 0]} />;
    case "cone": return <coneGeometry args={[0.45, 0.8, 5]} />;
    case "torus": return <torusGeometry args={[0.4, 0.12, 10, 32]} />;
  }
}

function Node({ i, p, selected, onSelect }: { i: number; p: Palette; selected: boolean; onSelect: (id: SectionId) => void }) {
  const s = sections[i];
  const ref = useRef<Mesh>(null);
  const [hover, setHover] = useState(false);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    m.rotation.y += dt * 0.6;
    m.scale.setScalar(MathUtils.damp(m.scale.x, hover || selected ? 1.35 : 1, 8, dt));
  });
  return (
    <group position={nodePos(i)}>
      <mesh
        ref={ref}
        onClick={() => onSelect(s.id)}
        onPointerOver={() => { setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}
      >
        <Shape kind={s.shape} />
        <meshBasicMaterial color={selected || hover ? p.gold : p.primary} wireframe />
      </mesh>
      <Billboard position={[0, -0.8, 0]}>
        <Text fontSize={0.17} letterSpacing={0.2} color={selected || hover ? p.gold : p.accent} anchorY="middle">
          {s.label.toUpperCase()}
        </Text>
      </Billboard>
    </group>
  );
}

/** The ring of section nodes plus the camera rig. Selecting a node rotates it to the front and slides the core left. */
function World({ p, active, onSelect, motion }: { p: Palette; active: SectionId | null; onSelect: (id: SectionId) => void; motion: number }) {
  const ring = useRef<Group>(null);
  const lookX = useRef(0);
  const { size } = useThree();

  useFrame(({ camera }, dt) => {
    const g = ring.current;
    if (!g) return;
    if (active) {
      const a = (sections.findIndex((s) => s.id === active) / sections.length) * TAU;
      // pick the equivalent target angle nearest the current one so it spins the short way
      const target = -a + TAU * Math.round((g.rotation.y + a) / TAU);
      g.rotation.y = MathUtils.damp(g.rotation.y, target, 4, dt);
    } else {
      g.rotation.y += dt * 0.12 * motion;
    }
    const wide = size.width > 900;
    const dx = active && wide ? 1.7 : 0;
    lookX.current = MathUtils.damp(lookX.current, dx, 3, dt);
    camera.position.x = lookX.current;
    camera.position.y = MathUtils.damp(camera.position.y, active ? 0.9 : 1.8, 3, dt);
    camera.position.z = MathUtils.damp(camera.position.z, active ? 7 : 8, 3, dt);
    camera.lookAt(lookX.current, 0, 0);
  });

  return (
    <>
      <Core p={p} motion={motion} />
      <group ref={ring}>
        <mesh rotation-x={Math.PI / 2}>
          <ringGeometry args={[RADIUS - 0.02, RADIUS + 0.02, 128]} />
          <meshBasicMaterial color={p.accent} transparent opacity={0.35} />
        </mesh>
        {sections.map((s, i) => (
          <group key={s.id}>
            <Line points={[[0, 0, 0], nodePos(i)]} color={p.accent} transparent opacity={0.2} lineWidth={1} />
            <Node i={i} p={p} selected={active === s.id} onSelect={onSelect} />
          </group>
        ))}
      </group>
      <Grid
        position={[0, -1.6, 0]}
        args={[30, 30]}
        cellColor={p.accent}
        sectionColor={p.primary}
        cellThickness={0.6}
        sectionThickness={1}
        fadeDistance={22}
        infiniteGrid
      />
      <Sparkles count={80} scale={[14, 6, 14]} size={2} speed={motion * 0.3} color={p.accent} />
    </>
  );
}

export default function Scene(props: { p: Palette; active: SectionId | null; onSelect: (id: SectionId) => void; motion: number }) {
  return (
    <Canvas camera={{ position: [0, 1.8, 8], fov: 50 }} dpr={[1, 2]} aria-hidden="true">
      <World {...props} />
    </Canvas>
  );
}
