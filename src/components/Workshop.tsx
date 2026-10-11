"use client";

// The room around the holograms: an engineer's steel workbench in front (keyboard, mouse, headset), a wall behind
// (pegboard tools, character collectibles, neon sign, picture frame, hanging lamp). Procedural geometry and painted textures.
import { useMemo } from "react";
import { Environment, Lightformer, Text, useGLTF } from "@react-three/drei";
import { Box3, CanvasTexture, RepeatWrapping, SRGBColorSpace, Vector3 } from "three";
import type { Palette } from "@/data/themes";
import { Editable3D } from "./LayoutEditor";
import {
  Box, CableCoil, Cyl, Duck, Figure, Gpu, Handheld, Headset, Keyboard, Mouse, Multimeter, ScrewdriverSet, SolderingIron, type V3,
} from "./props";

// Deterministic pseudo-random so the layout is stable across renders/reloads.
const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}

// Brushed stainless: fine streaks along x, a few sheet seams. Metalness/anisotropy do the rest (needs the Environment in Scene).
const steelTex = () => canvasTex(1024, 512, (g) => {
  const r = rng(7);
  g.fillStyle = "#6b7782"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 1800; i++) {
    g.fillStyle = r() > 0.5 ? `rgba(255,255,255,${r() * 0.09})` : `rgba(40,50,60,${r() * 0.09})`;
    g.fillRect(r() * 1024, r() * 512, 40 + r() * 400, 1 + r());
  }
  g.fillStyle = "rgba(25,30,36,0.7)"; g.fillRect(0, 0, 1024, 3); g.fillRect(0, 0, 3, 512); // seams (tile edges)
}, [3, 1]);

const matTex = (accent: string) => canvasTex(1024, 512, (g) => {
  g.fillStyle = "#0a161d"; g.fillRect(0, 0, 1024, 512);
  for (let x = 0; x <= 1024; x += 32) { g.fillStyle = x % 160 === 0 ? `${accent}55` : `${accent}1f`; g.fillRect(x, 0, x % 160 === 0 ? 2 : 1, 512); }
  for (let y = 0; y <= 512; y += 32) { g.fillStyle = y % 160 === 0 ? `${accent}55` : `${accent}1f`; g.fillRect(0, y, 1024, y % 160 === 0 ? 2 : 1); }
  g.strokeStyle = `${accent}66`; g.lineWidth = 6; g.strokeRect(3, 3, 1018, 506);
});

const pegTex = () => canvasTex(256, 256, (g) => {
  g.fillStyle = "#4a4236"; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#171410";
  for (let x = 8; x < 256; x += 16) for (let y = 8; y < 256; y += 16) { g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill(); }
}, [7.4, 7]);

// Placeholder for the wall picture until a real image exists. ponytail: swap for useTexture("/images/….jpg") when there is one.
const placeholderTex = () => canvasTex(300, 400, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 400);
  gr.addColorStop(0, "#9fb4c4"); gr.addColorStop(1, "#5d6f7d");
  g.fillStyle = gr; g.fillRect(0, 0, 300, 400);
  g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.arc(215, 120, 28, 0, 7); g.fill(); // sun
  g.fillStyle = "rgba(40,55,68,0.75)"; g.beginPath(); g.moveTo(0, 330); g.lineTo(100, 200); g.lineTo(170, 290); g.lineTo(220, 230); g.lineTo(300, 330); g.lineTo(300, 400); g.lineTo(0, 400); g.fill();
  g.fillStyle = "rgba(255,255,255,0.7)"; g.font = "600 20px monospace"; g.textAlign = "center"; g.fillText("PHOTO COMING SOON", 150, 372);
});

function Bench({ p }: { p: Palette }) {
  const steel = useMemo(() => steelTex(), []);
  const mat = useMemo(() => matTex(p.accent), [p.accent]);
  return (
    <>
      <mesh position={[0, -0.07, 0.5]}>
        <boxGeometry args={[18, 0.14, 8]} />
        <meshPhysicalMaterial map={steel} metalness={1} roughness={0.48} anisotropy={0.7} />
      </mesh>
      {/* cutting mat under the holograms */}
      <mesh position={[0, 0.004, -0.1]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[7, 3.2]} />
        <meshStandardMaterial map={mat} roughness={0.85} />
      </mesh>
    </>
  );
}

function Wall({ p }: { p: Palette }) {
  const peg = useMemo(() => pegTex(), []);
  return (
    <>
      <mesh position={[0, 3, -3.6]}>
        <planeGeometry args={[30, 9]} />
        <meshStandardMaterial color="#14181f" roughness={0.95} />
      </mesh>

      {/* left: pegboard of bench tools, two shelves of collectibles under it */}
      <mesh position={[-4.9, 3.15, -3.58]}>
        <planeGeometry args={[2.8, 1.5]} />
        <meshStandardMaterial map={peg} roughness={0.9} />
      </mesh>
      <group position={[-4.9, 3.15, -3.5]}>
        <Multimeter at={[-0.95, 0.05, 0]} />
        <SolderingIron at={[-0.45, 0.15, 0]} />
        <ScrewdriverSet at={[0.3, 0.3, 0]} />
        <CableCoil at={[1.0, 0.2, 0]} />
        <Box at={[0.3, -0.3, 0]} size={[0.5, 0.16, 0.03]} color="#a8adb3" metal={0.7} rough={0.4} />
      </group>
      {[1.75, 0.95].map((y) => <Box key={y} at={[-4.85, y, -3.4]} size={[2.9, 0.05, 0.3]} color="#4a3320" rough={0.55} />)}
      <Figure at={[-6.0, 1.775, -3.4]} character="miles" h={0.62} rotY={0.22} />
      <Figure at={[-5.45, 1.775, -3.4]} character="luffy" rotY={0.12} />
      <Figure at={[-4.9, 1.775, -3.4]} character="zoro" />
      <Handheld at={[-4.25, 1.775, -3.4]} rotY={-0.2} />
      <Figure at={[-3.75, 1.775, -3.4]} character="chopper" h={0.52} rotY={-0.18} />
      <Figure at={[-5.9, 0.975, -3.4]} character="chopper" h={0.52} rotY={0.15} />
      <Figure at={[-5.25, 0.975, -3.4]} character="miles" rotY={0.2} />
      <Box at={[-4.5, 1.1, -3.4]} size={[0.5, 0.2, 0.28]} color="#4d3b4f" />
      <Box at={[-4.45, 1.28, -3.4]} size={[0.44, 0.16, 0.26]} color="#38503f" />
      <Duck at={[-3.7, 0.975, -3.4]} rotY={0.3} />

      {/* centre: neon sign */}
      <Text font="/fonts/Orbitron.ttf" position={[-0.2, 3.2, -3.5]} fontSize={0.42} letterSpacing={0.08} color={p.accent} material-toneMapped={false} anchorY="middle">
        {"{ SHIP IT }"}
      </Text>
      <Text font="/fonts/Orbitron.ttf" position={[-0.2, 2.75, -3.5]} fontSize={0.12} letterSpacing={0.12} color={p.gold} material-toneMapped={false} anchorY="middle">
        while (alive) learn();
      </Text>

      {/* right: shelving unit with figures, a GPU, books, a console */}
      {[2.55, 6.5].map((x) => <Box key={x} at={[x, 2, -3.35]} size={[0.08, 4, 0.45]} color="#2a2f36" metal={0.6} />)}
      {[0.9, 1.9, 2.9].map((y) => <Box key={y} at={[4.52, y - 0.02, -3.35]} size={[4.05, 0.06, 0.5]} color="#4a3320" rough={0.55} />)}
      <Figure at={[3.0, 2.91, -3.3]} character="miles" h={0.62} rotY={-0.15} />
      <Figure at={[3.6, 2.91, -3.3]} character="luffy" rotY={-0.12} />
      <Figure at={[4.2, 2.91, -3.3]} character="chopper" h={0.52} />
      <Figure at={[4.8, 2.91, -3.3]} character="zoro" rotY={-0.18} />
      <mesh position={[5.6, 3.1, -3.3]}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#9aa3ad" metalness={0.8} roughness={0.3} />
      </mesh>
      <Handheld at={[3.0, 1.91, -3.3]} rotY={0.2} />
      <Gpu p={p} at={[3.95, 1.91, -3.3]} />
      {["#7a3a30", "#38503f", "#2d4fb0"].map((c, i) => (
        <Box key={i} at={[4.85 + i * 0.09, 1.93 + (i % 2) * 0.01 + 0.17, -3.3]} size={[0.06, 0.34, 0.24]} color={c} rough={0.9} />
      ))}
      <CableCoil at={[5.75, 1.99, -3.3]} />
      <Box at={[3.1, 1.08, -3.3]} size={[0.34, 0.3, 0.34]} color="#1a1e24" metal={0.5} rough={0.4} />
      <Figure at={[4.0, 0.93, -3.3]} character="luffy" rotY={-0.2} />
      <Box at={[4.85, 1.07, -3.3]} size={[0.55, 0.26, 0.35]} color="#3b4a5a" rough={0.9} />
      <Figure at={[5.6, 0.93, -3.3]} character="miles" rotY={-0.25} />
    </>
  );
}

/** Dark-walnut picture frame hung on the wall: frame bars, off-white mat, placeholder picture. Size in world units. */
function WallFrame({ at, w = 1.4, h = 1.8 }: { at: V3; w?: number; h?: number }) {
  const pic = useMemo(() => placeholderTex(), []);
  const F = 0.1; // frame bar width
  const walnut = "#4a3320";
  return (
    <group position={at}>
      <Box at={[0, (h - F) / 2, 0.03]} size={[w, F, 0.06]} color={walnut} rough={0.55} />
      <Box at={[0, -(h - F) / 2, 0.03]} size={[w, F, 0.06]} color={walnut} rough={0.55} />
      <Box at={[-(w - F) / 2, 0, 0.03]} size={[F, h - 2 * F, 0.06]} color={walnut} rough={0.55} />
      <Box at={[(w - F) / 2, 0, 0.03]} size={[F, h - 2 * F, 0.06]} color={walnut} rough={0.55} />
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[w - 2 * F, h - 2 * F]} />
        <meshStandardMaterial color="#e9e4d8" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[w - 2 * F - 0.24, h - 2 * F - 0.3]} />
        <meshStandardMaterial map={pic} emissiveMap={pic} emissive="#ffffff" emissiveIntensity={0.25} roughness={0.8} />
      </mesh>
    </group>
  );
}

/** The engineer's kit along the front of the bench, clear of the hologram labels. */
function DeskGear({ p }: { p: Palette }) {
  return (
    <>
      <Editable3D id="keyboard" position={[0.05, 0, 1.2]}><Keyboard p={p} at={[0, 0, 0]} /></Editable3D>
      <Editable3D id="mouse" position={[1.55, 0, 1.2]}><Mouse p={p} at={[0, 0, 0]} /></Editable3D>
      <Editable3D id="headset" position={[-1.5, 0, 1.25]}><Headset p={p} at={[0, 0, 0]} rotY={0.4} /></Editable3D>
      <Editable3D id="duck" position={[-2.0, 0, 1.45]}><Duck at={[0, 0, 0]} rotY={0.5} /></Editable3D>
    </>
  );
}

/** Hanging work lamp: warm pool of light that makes the wood and wall read as a real room. */
function Lamp() {
  return (
    <group position={[1.9, 0, -2.2]}>
      <Cyl at={[0, 4.2, 0]} r={0.012} h={2.2} color="#111" />
      <mesh position={[0, 3.1, 0]}>
        <coneGeometry args={[0.38, 0.3, 32, 1, true]} />
        <meshStandardMaterial color="#2b3038" metalness={0.6} roughness={0.4} side={2} />
      </mesh>
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.9, 0.4]} intensity={22} distance={14} decay={2} color="#ffd6a8" />
    </group>
  );
}

/** A real (solid, original-material) model standing on the bench, scaled so its longest side is `size`. */
export function RealProp({ url, at, size, rotY = 0 }: { url: string; at: V3; size: number; rotY?: number }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const root = scene.clone(true);
    const b = new Box3().setFromObject(root);
    const d = b.getSize(new Vector3());
    root.scale.multiplyScalar(size / Math.max(d.x, d.y, d.z));
    const b2 = new Box3().setFromObject(root);
    const c = b2.getCenter(new Vector3());
    root.position.set(-c.x, -b2.min.y, -c.z);
    return root;
  }, [scene, size]);
  return <group position={at} rotation-y={rotY}><primitive object={model} /></group>;
}

export default function Workshop({ p }: { p: Palette }) {
  return (
    <>
      <hemisphereLight args={["#8a9bb0", "#1c2128", 0.5]} />
      {/* reflections for the steel: a big warm softbox plus cyan/red strips behind the bench, rendered once */}
      <Environment resolution={128} frames={1} environmentIntensity={0.25}>
        <Lightformer form="rect" intensity={1.8} color="#e6f0fa" position={[0, 4, -6]} scale={[14, 3, 1]} />
        <Lightformer form="rect" intensity={2} color={p.accent} position={[-7, 2, -2]} rotation-y={Math.PI / 2} scale={[8, 1.2, 1]} />
        <Lightformer form="rect" intensity={1} color={p.primary} position={[7, 2, -2]} rotation-y={-Math.PI / 2} scale={[8, 1.2, 1]} />
      </Environment>
      <Bench p={p} />
      <Wall p={p} />
      <DeskGear p={p} />
      <WallFrame at={[-2.55, 2.4, -3.58]} />
      <Lamp />
    </>
  );
}
