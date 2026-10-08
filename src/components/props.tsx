"use client";

// Procedural set dressing for the engineer's workspace: primitives plus keyboard, mouse, headset, figures,
// GPU, handheld and bench tools. Everything is built from boxes/cylinders/spheres, so there are no assets to license.
import { useCallback } from "react";
import { Color, Object3D, type InstancedMesh } from "three";
import type { Palette } from "@/data/themes";

export type V3 = [number, number, number];

export function Box({ at, size, color, rough = 0.8, metal = 0, rot, emissive }: { at: V3; size: V3; color: string; rough?: number; metal?: number; rot?: V3; emissive?: string }) {
  return (
    <mesh position={at} rotation={rot}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} emissive={emissive} emissiveIntensity={emissive ? 0.6 : 0} />
    </mesh>
  );
}

export function Cyl({ at, r, h, color, rough = 0.6, metal = 0, rot, open }: { at: V3; r: number; h: number; color: string; rough?: number; metal?: number; rot?: V3; open?: boolean }) {
  return (
    <mesh position={at} rotation={rot}>
      <cylinderGeometry args={[r, r, h, 24, 1, open]} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </mesh>
  );
}

function Ball({ at, r, color, scale, rough = 0.6 }: { at: V3; r: number; color: string; scale?: V3; rough?: number }) {
  return (
    <mesh position={at} scale={scale}>
      <sphereGeometry args={[r, 20, 14]} />
      <meshStandardMaterial color={color} roughness={rough} />
    </mesh>
  );
}

/** Flat unlit colour (LEDs, screens, underglow): blooms because it is not tone-mapped. */
function Glow({ at, size, color, rot, opacity = 1 }: { at: V3; size: V3; color: string; rot?: V3; opacity?: number }) {
  return (
    <mesh position={at} rotation={rot}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={color} toneMapped={false} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}

/** Mechanical keyboard: case, 56 instanced keycaps (accent Esc/Enter), spacebar, RGB underglow. ~1.5 wide. */
export function Keyboard({ p, at, rotY = 0 }: { p: Palette; at: V3; rotY?: number }) {
  const COLS = 14, ROWS = 4, PITCH = 0.1;
  const setKeys = useCallback((m: InstancedMesh | null) => {
    if (!m) return;
    const d = new Object3D();
    const c = new Color();
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let k = 0; k < COLS; k++) {
        d.position.set((k - (COLS - 1) / 2) * PITCH, 0.072, r * PITCH - 0.2);
        d.updateMatrix();
        m.setMatrixAt(i, d.matrix);
        const accent = (r === 0 && k === 0) || (r === 1 && k === COLS - 1);
        m.setColorAt(i++, c.set(accent ? p.accent : (r + k) % 5 === 0 ? "#2c343d" : "#1b2128"));
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [p.accent]);
  return (
    <group position={at} rotation={[0.07, rotY, 0]}>
      <Glow at={[0, 0.004, 0]} size={[1.58, 0.004, 0.66]} color={p.accent} opacity={0.55} />
      <Box at={[0, 0.03, 0]} size={[1.52, 0.05, 0.58]} color="#10141a" metal={0.5} rough={0.4} />
      <instancedMesh ref={setKeys} args={[undefined, undefined, COLS * ROWS]}>
        <boxGeometry args={[0.088, 0.04, 0.088]} />
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
      <Box at={[0, 0.072, 0.2]} size={[0.62, 0.04, 0.088]} color="#1b2128" rough={0.5} />
      {[-0.55, -0.45, 0.45, 0.55].map((x) => <Box key={x} at={[x, 0.072, 0.2]} size={[0.088, 0.04, 0.088]} color="#2c343d" rough={0.5} />)}
    </group>
  );
}

/** Gaming mouse on a pad with glowing edge. */
export function Mouse({ p, at, rotY = 0 }: { p: Palette; at: V3; rotY?: number }) {
  return (
    <group position={at} rotation-y={rotY}>
      <Glow at={[0, 0.003, 0]} size={[1.0, 0.003, 0.6]} color={p.primary} opacity={0.5} />
      <Box at={[0, 0.008, 0]} size={[0.94, 0.012, 0.54]} color="#12161b" rough={0.95} />
      <group position={[0.1, 0, 0.02]} rotation-y={-0.15}>
        <Ball at={[0, 0.04, 0]} r={1} color="#171b21" scale={[0.07, 0.034, 0.115]} rough={0.35} />
        <Glow at={[0, 0.072, 0]} size={[0.012, 0.004, 0.09]} color={p.accent} />
        <Glow at={[0, 0.07, -0.025]} size={[0.014, 0.014, 0.03]} color="#0b0e12" />
        <Glow at={[0, 0.012, 0.0]} size={[0.13, 0.003, 0.22]} color={p.accent} opacity={0.4} />
      </group>
    </group>
  );
}

/** Over-ear headset standing on the desk. */
export function Headset({ p, at, rotY = 0 }: { p: Palette; at: V3; rotY?: number }) {
  return (
    <group position={at} rotation-y={rotY}>
      <mesh position={[0, 0.07, 0]}>
        <torusGeometry args={[0.17, 0.016, 10, 28, Math.PI]} />
        <meshStandardMaterial color="#1b2128" roughness={0.5} />
      </mesh>
      {[-0.17, 0.17].map((x) => (
        <group key={x} position={[x, 0.07, 0]}>
          <Cyl at={[0, 0, 0]} r={0.07} h={0.055} color="#161a20" rot={[0, 0, Math.PI / 2]} />
          <mesh position={[Math.sign(x) * 0.03, 0, 0]} rotation-y={Math.PI / 2}>
            <torusGeometry args={[0.052, 0.006, 8, 24]} />
            <meshBasicMaterial color={p.accent} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Duck({ at, rotY = 0 }: { at: V3; rotY?: number }) {
  return (
    <group position={at} rotation-y={rotY}>
      <Ball at={[0, 0.07, 0]} r={1} color="#f5c518" scale={[0.085, 0.07, 0.1]} />
      <Ball at={[0, 0.16, 0.05]} r={0.05} color="#f5c518" />
      <Box at={[0, 0.15, 0.1]} size={[0.05, 0.014, 0.04]} color="#ee7b1a" />
      {[-0.02, 0.02].map((x) => <Ball key={x} at={[x, 0.175, 0.088]} r={0.008} color="#111" />)}
    </group>
  );
}

/** Collectible figure on a plinth, ~`h` tall. kind picks the silhouette. */
export function Figure({ at, kind, color, accent, h = 0.4, rotY = 0 }: { at: V3; kind: "hero" | "robot" | "cat" | "mage"; color: string; accent: string; h?: number; rotY?: number }) {
  return (
    <group position={at} rotation-y={rotY} scale={h / 0.4}>
      <Cyl at={[0, 0.01, 0]} r={0.1} h={0.02} color="#1a1d22" />
      {[-0.035, 0.035].map((x) => <Box key={x} at={[x, 0.07, 0]} size={[0.05, 0.1, 0.05]} color="#2b3340" />)}
      <Box at={[0, 0.18, 0]} size={[0.15, 0.12, 0.09]} color={color} rough={0.5} />
      {[-0.095, 0.095].map((x) => <Box key={x} at={[x, 0.18, 0]} size={[0.035, 0.1, 0.04]} color={color} rough={0.5} />)}
      {kind === "robot" ? (
        <>
          <Box at={[0, 0.31, 0]} size={[0.16, 0.13, 0.13]} color="#aab3bd" metal={0.6} rough={0.35} />
          <Glow at={[0, 0.315, 0.066]} size={[0.11, 0.035, 0.004]} color={accent} />
          <Cyl at={[0, 0.42, 0]} r={0.008} h={0.08} color="#aab3bd" metal={0.6} />
          <Ball at={[0, 0.465, 0]} r={0.018} color={accent} />
        </>
      ) : (
        <>
          <Ball at={[0, 0.31, 0]} r={0.09} color={kind === "cat" ? "#d9d4cc" : "#e8c9a8"} />
          {kind === "hero" && (
            <>
              <Box at={[0, 0.34, 0.01]} size={[0.17, 0.06, 0.15]} color={accent} rough={0.5} />
              <Box at={[0, 0.2, -0.06]} size={[0.16, 0.16, 0.015]} color={accent} rough={0.7} />
              {[-0.03, 0.03].map((x) => <Glow key={x} at={[x, 0.31, 0.085]} size={[0.035, 0.02, 0.004]} color="#ffffff" />)}
            </>
          )}
          {kind === "cat" && [-0.05, 0.05].map((x) => (
            <mesh key={x} position={[x, 0.4, 0]} rotation-z={x > 0 ? -0.25 : 0.25}>
              <coneGeometry args={[0.035, 0.07, 4]} />
              <meshStandardMaterial color="#d9d4cc" roughness={0.6} />
            </mesh>
          ))}
          {kind === "mage" && (
            <mesh position={[0, 0.44, 0]}>
              <coneGeometry args={[0.1, 0.17, 16]} />
              <meshStandardMaterial color={accent} roughness={0.6} />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}

/** Graphics card standing upright: the AI engineer's trophy. */
export function Gpu({ p, at, rotY = 0 }: { p: Palette; at: V3; rotY?: number }) {
  return (
    <group position={at} rotation-y={rotY}>
      <Box at={[0, 0.12, 0]} size={[0.5, 0.22, 0.07]} color="#14171c" metal={0.6} rough={0.35} />
      {[-0.13, 0.13].map((x) => (
        <group key={x} position={[x, 0.12, 0.038]}>
          <Cyl at={[0, 0, 0]} r={0.075} h={0.008} color="#0b0d10" rot={[Math.PI / 2, 0, 0]} />
          <mesh>
            <torusGeometry args={[0.075, 0.006, 8, 28]} />
            <meshBasicMaterial color={p.accent} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <Glow at={[0, 0.235, 0]} size={[0.5, 0.012, 0.072]} color={p.primary} />
    </group>
  );
}

/** Retro handheld console, leaning back. */
export function Handheld({ at, rotY = 0 }: { at: V3; rotY?: number }) {
  return (
    <group position={at} rotation={[-0.15, rotY, 0]}>
      <Box at={[0, 0.15, 0]} size={[0.2, 0.3, 0.035]} color="#c9c3b0" rough={0.6} />
      <Glow at={[0, 0.2, 0.019]} size={[0.14, 0.11, 0.004]} color="#8fa36b" />
      <Box at={[-0.05, 0.07, 0.02]} size={[0.05, 0.012, 0.006]} color="#2a2d33" />
      <Box at={[-0.05, 0.07, 0.02]} size={[0.012, 0.05, 0.006]} color="#2a2d33" />
      {[0.04, 0.075].map((x, i) => <Cyl key={x} at={[x, 0.06 + i * 0.02, 0.02]} r={0.011} h={0.006} color="#a8283a" rot={[Math.PI / 2, 0, 0]} />)}
    </group>
  );
}

/** Bench tools for the pegboard (local origin = board centre; z is toward the room). */
export function Multimeter({ at }: { at: V3 }) {
  return (
    <group position={at}>
      <Box at={[0, 0, 0]} size={[0.16, 0.26, 0.05]} color="#e0b020" rough={0.5} />
      <Glow at={[0, 0.07, 0.027]} size={[0.11, 0.06, 0.004]} color="#9bb58a" />
      <Cyl at={[0, -0.05, 0.03]} r={0.038} h={0.012} color="#15181c" rot={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

export function SolderingIron({ at }: { at: V3 }) {
  return (
    <group position={at} rotation-z={0.5}>
      <Cyl at={[0, 0, 0]} r={0.016} h={0.26} color="#2b2f36" />
      <Cyl at={[0, -0.18, 0]} r={0.007} h={0.1} color="#b5bcc4" metal={0.9} rough={0.3} />
      <Glow at={[0, -0.235, 0]} size={[0.014, 0.014, 0.014]} color="#ff5a2a" />
    </group>
  );
}

export function ScrewdriverSet({ at }: { at: V3 }) {
  return (
    <group position={at}>
      <Box at={[0, 0, 0]} size={[0.42, 0.13, 0.035]} color="#1a1e24" />
      {[-0.15, -0.075, 0, 0.075, 0.15].map((x, i) => <Cyl key={x} at={[x, 0, 0.025]} r={0.014} h={0.1} color={["#e0a020", "#cc3a2a", "#2d9cdb", "#3fa34d", "#b5bcc4"][i]} />)}
    </group>
  );
}

export function CableCoil({ at, color = "#2aa6a0" }: { at: V3; color?: string }) {
  return (
    <mesh position={at}>
      <torusGeometry args={[0.1, 0.022, 10, 24]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
}
