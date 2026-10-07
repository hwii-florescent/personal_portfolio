"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function Knot() {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.x += dt * 0.15;
    ref.current.rotation.y += dt * 0.2;
  });
  return (
    <Float speed={1.5} floatIntensity={0.6}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1, 0.3, 160, 24]} />
        <meshStandardMaterial color="#5eead4" wireframe />
      </mesh>
    </Float>
  );
}

/** Fixed full-screen backdrop. Replace <Knot /> with your own scene. */
export default function Scene() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} />
        <Knot />
      </Canvas>
    </div>
  );
}
