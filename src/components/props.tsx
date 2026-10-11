"use client";

// Procedural set dressing for the engineer's workspace: primitives plus keyboard, mouse, headset, figures,
// GPU, handheld and bench tools. Character collectibles are original procedural fan-art, not official product assets.
import { useCallback, useEffect, useMemo } from "react";
import { CanvasTexture, Color, Object3D, SRGBColorSpace, type InstancedMesh } from "three";
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

export type FigureCharacter = "miles" | "luffy" | "zoro" | "chopper";

/** Painted vinyl face, wrapped around the head rather than floating in front of it. */
function figureFace(character: FigureCharacter) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 256;
  const g = canvas.getContext("2d")!;
  g.fillStyle = character === "miles" ? "#151923" : character === "chopper" ? "#c99159" : "#f3c79f";
  g.fillRect(0, 0, 512, 256);
  g.lineCap = "round"; g.lineJoin = "round";
  if (character === "miles") {
    g.strokeStyle = "#a7283e"; g.lineWidth = 1.5;
    // Fine red webbing reads as a printed suit, not glowing circuitry.
    for (let x = 0; x <= 512; x += 32) {
      g.beginPath(); g.moveTo(256, 18); g.lineTo(x, 256); g.stroke();
    }
    for (const y of [64, 96, 128, 160, 192, 224]) {
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x < 512; x += 32) g.quadraticCurveTo(x + 16, y + 12, x + 32, y);
      g.stroke();
    }
    for (const side of [-1, 1]) {
      g.save(); g.translate(256, 127); g.scale(side, 1);
      g.beginPath(); g.moveTo(12, 15); g.quadraticCurveTo(15, -2, 48, -30);
      g.quadraticCurveTo(54, 16, 26, 24); g.closePath();
      g.strokeStyle = "#ef334c"; g.lineWidth = 8; g.stroke();
      g.fillStyle = "#fffaf2"; g.fill(); g.restore();
    }
  } else {
    g.fillStyle = "#241c1c";
    for (const x of [229, 283]) {
      if (character === "zoro" && x === 283) {
        g.strokeStyle = "#5d3d31"; g.lineWidth = 3;
        g.beginPath(); g.moveTo(x - 7, 128); g.lineTo(x + 7, 130); g.stroke();
        g.beginPath(); g.moveTo(x + 2, 109); g.lineTo(x - 2, 145); g.stroke();
      } else {
        g.beginPath(); g.ellipse(x, 128, 7, 12, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#fff9eb"; g.beginPath(); g.arc(x - 2, 124, 2, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#241c1c";
      }
    }
    g.strokeStyle = "#6b3d30"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(242, 151); g.quadraticCurveTo(256, 163, 270, 151); g.stroke();
    if (character === "luffy") {
      g.fillStyle = "#fff8df"; g.beginPath(); g.moveTo(236, 149);
      g.quadraticCurveTo(256, 158, 276, 149); g.quadraticCurveTo(256, 180, 236, 149); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(278, 145); g.lineTo(292, 145); g.stroke();
      for (const x of [282, 289]) { g.beginPath(); g.moveTo(x, 142); g.lineTo(x, 148); g.stroke(); }
    }
    if (character === "chopper") {
      g.fillStyle = "#4099cd"; g.beginPath(); g.ellipse(256, 143, 6, 4, 0, 0, Math.PI * 2); g.fill();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Original chibi collectibles: oversized heads, satin vinyl, and character-specific silhouettes. */
export function Figure({ at, character, h = 0.58, rotY = 0 }: { at: V3; character: FigureCharacter; h?: number; rotY?: number }) {
  const face = useMemo(() => figureFace(character), [character]);
  useEffect(() => () => face.dispose(), [face]);
  const miles = character === "miles", chopper = character === "chopper";
  const skin = chopper ? "#c99159" : "#f3c79f";
  const outfit = miles ? "#151923" : character === "luffy" ? "#d93639" : character === "zoro" ? "#39785b" : "#e67b92";
  return (
    <group name={`collectible-${character}`} position={at} rotation-y={rotY} scale={h / 0.5}>
      <Cyl at={[0, 0.012, 0]} r={0.13} h={0.024} color="#252933" rough={0.4} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Ball at={[side * 0.043, 0.045, 0.02]} r={1} scale={[0.035, 0.025, 0.053]} color={miles ? "#e13349" : chopper ? "#70412e" : "#453029"} rough={0.4} />
          <Ball at={[side * 0.041, 0.088, 0]} r={1} scale={[0.032, 0.057, 0.033]} color={miles ? "#151923" : character === "luffy" ? "#4884bd" : character === "zoro" ? "#263f37" : skin} rough={0.4} />
          {character === "luffy" && <Cyl at={[side * 0.041, 0.08, 0]} r={0.033} h={0.022} color="#fff0c9" />}
          <group position={[side * 0.093, 0.178, 0]} rotation-z={side * 0.24}>
            <Ball at={[0, 0, 0]} r={1} scale={[0.033, 0.06, 0.035]} color={outfit} rough={0.38} />
            <Ball at={[0, -0.048, 0.008]} r={0.029} color={miles ? "#df3048" : skin} rough={0.4} />
          </group>
        </group>
      ))}
      <Ball at={[0, 0.176, 0]} r={1} scale={[0.079, 0.086, 0.057]} color={outfit} rough={0.38} />
      {character === "luffy" && <>
        <Ball at={[0, 0.188, 0.052]} r={1} scale={[0.033, 0.06, 0.012]} color={skin} />
        <Box at={[0, 0.126, 0.055]} size={[0.13, 0.02, 0.012]} color="#edbf45" />
        {[0.16, 0.195, 0.23].map((y) => <Ball key={y} at={[-0.037, y, 0.051]} r={0.006} color="#edbf45" />)}
      </>}
      {miles && <group name="spider-emblem" position={[0, 0.192, 0.057]}>
        <Ball at={[0, 0, 0]} r={1} scale={[0.012, 0.023, 0.004]} color="#ed334b" />
        {[-1, 1].flatMap((side) => [0, 1, 2, 3].map((i) => (
          <group key={`${side}-${i}`} position={[side * 0.021, 0.018 - i * 0.012, 0]} rotation-z={side * (i < 2 ? -0.65 : 0.65)}>
            <Box at={[0, 0, 0]} size={[0.04, 0.006, 0.004]} color="#ed334b" />
          </group>
        )))}
      </group>}
      {character === "zoro" && <>
        <Box at={[0, 0.13, 0.055]} size={[0.145, 0.025, 0.018]} color="#a52842" />
        <group name="three-swords" position={[0.106, 0.14, -0.02]} rotation-z={-0.5}>
          {["#f1e8d6", "#673e66", "#242832"].map((color, i) => <group key={color} position={[i * 0.019, 0, 0]}>
            <Cyl at={[0, -0.045, 0]} r={0.009} h={0.17} color={color} />
            <Cyl at={[0, 0.062, 0]} r={0.01} h={0.04} color="#25232e" />
            <Cyl at={[0, 0.04, 0]} r={0.02} h={0.007} color="#dab564" />
          </group>)}
        </group>
      </>}
      {!miles && [-1, 1].map((side) => <Ball key={side} at={[side * 0.117, 0.326, 0]} r={0.025} color={skin} rough={0.4} />)}
      <mesh name="painted-head" position={[0, 0.344, 0]} rotation-y={-Math.PI / 2} scale={[1, 1.03, 0.93]}>
        <sphereGeometry args={[0.124, 32, 24]} />
        <meshStandardMaterial map={face} roughness={0.36} />
      </mesh>
      {(character === "luffy" || character === "zoro") && <>
        <mesh position={[0, 0.35, -0.006]}>
          <sphereGeometry args={[0.128, 24, 16, 0, Math.PI * 2, 0, 1.05]} />
          <meshStandardMaterial color={character === "zoro" ? "#69a65d" : "#20202a"} roughness={0.45} />
        </mesh>
        {[-0.085, -0.045, 0, 0.045, 0.085].map((x, i) => <Ball key={x} at={[x, 0.416 - Math.abs(x) * 0.35, 0.074]} r={1} scale={[0.025, 0.035 + (i % 2) * 0.009, 0.026]} color={character === "zoro" ? "#69a65d" : "#20202a"} rough={0.45} />)}
      </>}
      {character === "luffy" && <group name="straw-hat" rotation-z={-0.08} position={[0, 0.432, -0.008]}>
        <Cyl at={[0, 0, 0]} r={0.162} h={0.018} color="#eac679" rough={0.65} />
        <Ball at={[0, 0.008, 0]} r={1} scale={[0.108, 0.055, 0.105]} color="#eac679" rough={0.65} />
        <Cyl at={[0, 0.019, 0]} r={0.107} h={0.018} color="#ce343c" rough={0.45} />
      </group>}
      {character === "zoro" && [-0.012, 0, 0.012].map((z) => <mesh key={z} position={[-0.132, 0.309, z]}>
        <torusGeometry args={[0.012, 0.003, 6, 12]} />
        <meshStandardMaterial color="#e9c363" metalness={0.45} roughness={0.35} />
      </mesh>)}
      {chopper && <group name="chopper-hat">
        {[-1, 1].map((side) => <group key={side} position={[side * 0.126, 0.411, -0.01]} rotation-z={side * -0.5}>
          <Cyl at={[0, 0.02, 0]} r={0.013} h={0.085} color="#754730" />
          {[-1, 1].map((branch) => <Cyl key={branch} at={[branch * 0.018, 0.042, 0]} r={0.009} h={0.044} color="#754730" rot={[0, 0, branch * -0.8]} />)}
        </group>)}
        <Cyl at={[0, 0.415, 0]} r={0.147} h={0.024} color="#de7b9c" rough={0.4} />
        <Cyl at={[0, 0.455, 0]} r={0.112} h={0.08} color="#de7b9c" rough={0.4} />
        <Cyl at={[0, 0.495, 0]} r={0.113} h={0.01} color="#de7b9c" rough={0.4} />
        <group position={[0, 0.455, 0.113]}>
          <Box at={[0, 0, 0]} size={[0.054, 0.014, 0.005]} color="#fff5e9" rot={[0, 0, Math.PI / 4]} />
          <Box at={[0, 0, 0]} size={[0.054, 0.014, 0.005]} color="#fff5e9" rot={[0, 0, -Math.PI / 4]} />
        </group>
      </group>}
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
