"use client";

// An animated cabin workshop: walnut furniture, daylight on the left, collectibles on the right.
import { useEffect, useMemo } from "react";
import { Environment, Lightformer, RoundedBox, useGLTF, useTexture } from "@react-three/drei";
import { Box3, CanvasTexture, RepeatWrapping, SRGBColorSpace, Vector3 } from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import type { Palette } from "@/data/themes";
import { Editable3D } from "./LayoutEditor";
import {
  Box, CableCoil, Cyl, Duck, Figure, Gpu, Handheld, Headset, Keyboard, Mouse, Multimeter, ScrewdriverSet, SolderingIron, type V3,
} from "./props";

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

// Broad, gently wandering grain rather than photorealistic noise: varnished animation-cel walnut.
const woodTex = () => canvasTex(1024, 512, (g) => {
  const r = rng(7);
  g.fillStyle = "#70452b"; g.fillRect(0, 0, 1024, 512);
  for (let plank = 0; plank < 8; plank++) {
    g.fillStyle = ["#795035", "#674029", "#865738", "#70472f"][plank % 4];
    g.fillRect(0, plank * 64, 1024, 64);
    for (let i = 0; i < 18; i++) {
      const y = plank * 64 + r() * 64;
      const bend = 2 + r() * 8;
      g.strokeStyle = r() > 0.45 ? "rgba(37,19,12,0.16)" : "rgba(217,162,104,0.13)";
      g.lineWidth = 0.5 + r() * 2;
      g.beginPath(); g.moveTo(0, y);
      g.bezierCurveTo(300, y + bend, 700, y - bend, 1024, y); g.stroke();
    }
    g.fillStyle = "rgba(37,19,12,0.3)"; g.fillRect(0, plank * 64, 1024, 1);
  }
});

const projectionTex = (accent: string, web = false) => canvasTex(512, 512, (g) => {
  if (web) {
    g.fillStyle = "#17243b"; g.fillRect(0, 0, 512, 512);
    const point = (r: number, a: number) => [256 + Math.cos(a) * r, 244 + Math.sin(a) * r];
    g.strokeStyle = "#78bdff66"; g.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const [x, y] = point(350, i * Math.PI / 6);
      g.beginPath(); g.moveTo(256, 244); g.lineTo(x, y); g.stroke();
    }
    g.strokeStyle = `${accent}aa`; g.lineWidth = 2;
    for (const r of [48, 88, 132, 180, 232, 292]) {
      g.beginPath(); g.moveTo(...point(r, 0) as [number, number]);
      for (let i = 1; i <= 12; i++) {
        const [cx, cy] = point(r * 0.86, (i - 0.5) * Math.PI / 6);
        const [x, y] = point(r, i * Math.PI / 6);
        g.quadraticCurveTo(cx, cy, x, y);
      }
      g.stroke();
    }
    g.fillStyle = "#9ed2ff"; g.font = "10px monospace";
    g.fillText("HWIII / WEB-LINK WORKSPACE", 24, 482);
    return;
  }
  g.fillStyle = "#617f85"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = `${accent}12`; g.lineWidth = 1;
  for (let n = 16; n < 512; n += 24) {
    g.beginPath(); g.moveTo(n, 0); g.lineTo(n, 512); g.moveTo(0, n); g.lineTo(512, n); g.stroke();
  }
  g.strokeStyle = `${accent}88`; g.lineWidth = 2;
  for (const x of [18, 494]) for (const y of [18, 494]) {
    const sx = x === 18 ? 1 : -1, sy = y === 18 ? 1 : -1;
    g.beginPath(); g.moveTo(x + sx * 28, y); g.lineTo(x, y); g.lineTo(x, y + sy * 28); g.stroke();
  }
  g.fillStyle = `${accent}88`; g.font = "10px monospace";
  g.fillText("HWIII / HOLOGRAPHIC WORKSPACE", 24, 482);
});

function Bench({ p }: { p: Palette }) {
  const karen = p.ai === "K.A.R.E.N.";
  const wood = useMemo(() => woodTex(), []);
  const projection = useMemo(() => projectionTex(p.accent, karen), [p.accent, karen]);
  const frame = karen ? "#343c4e" : "#573623", apron = karen ? "#7d1f33" : "#52311f";
  useEffect(() => () => wood.dispose(), [wood]);
  useEffect(() => () => projection.dispose(), [projection]);
  return (
    <group name="walnut-worktable">
      <RoundedBox name="tabletop" args={[9.4, 0.24, 6.8]} radius={0.06} smoothness={3} position={[0, -0.12, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={karen ? undefined : wood} color={karen ? "#2a303d" : undefined} roughness={karen ? 0.3 : 0.48} metalness={karen ? 0.2 : 0} />
      </RoundedBox>
      {/* A genuinely square inset; the lip, fasteners and glow belong to the projector, not the wood. */}
      <Box at={[0, 0.003, 0]} size={[5.4, 0.018, 5.4]} color="#242f32" metal={0.7} rough={0.35} />
      <mesh name="square-projection-insert" position={[0, 0.014, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[5.2, 5.2]} />
        <meshStandardMaterial map={projection} emissiveMap={projection} emissive={p.accent} emissiveIntensity={0.32} roughness={0.32} metalness={0.35} />
      </mesh>
      {[-2.63, 2.63].map((n) => (
        <group key={n}>
          <mesh position={[n, 0.018, 0]}><boxGeometry args={[0.015, 0.008, 5.26]} /><meshBasicMaterial color={p.accent} toneMapped={false} /></mesh>
          <mesh position={[0, 0.018, n]}><boxGeometry args={[5.26, 0.008, 0.015]} /><meshBasicMaterial color={p.accent} toneMapped={false} /></mesh>
        </group>
      ))}
      {[-2.66, 2.66].flatMap((x) => [-2.66, 2.66].map((z) => <Cyl key={`${x},${z}`} at={[x, 0.018, z]} r={0.023} h={0.012} color="#9aa3a3" metal={0.8} />))}
      {/* Solid wood aprons and four tapered-looking trestle legs, all visible from the chair. */}
      {[-3.9, 3.9].map((x) => (
        <group key={x}>
          {[-2.6, 2.6].map((z) => <Box key={z} at={[x, -1.28, z]} size={[0.26, 2.3, 0.3]} color={frame} rot={[0, 0, -Math.sign(x) * 0.06]} />)}
          <Box at={[x, -1.95, 0]} size={[0.2, 0.22, 5.4]} color={frame} />
        </group>
      ))}
      {[-3.05, 3.05].map((z) => <Box key={z} at={[0, -0.39, z]} size={[8.3, 0.3, 0.12]} color={apron} />)}
      <Box at={[0, -1.95, -1.9]} size={[8, 0.18, 0.18]} color={frame} />
      {karen && <Box at={[0, -2.425, 0]} size={[10.2, 0.03, 7.6]} color="#6f2234" rough={0.95} />}
    </group>
  );
}

function Window({ karen = false }: { karen?: boolean }) {
  const view = useMemo(() => canvasTex(512, 512, karen ? (g) => {
    const sky = g.createLinearGradient(0, 0, 0, 512);
    sky.addColorStop(0, "#111a3a"); sky.addColorStop(0.55, "#38305a"); sky.addColorStop(1, "#b0476a");
    g.fillStyle = sky; g.fillRect(0, 0, 512, 512);
    g.fillStyle = "#f2e8ff"; g.beginPath(); g.arc(405, 92, 26, 0, Math.PI * 2); g.fill();
    const r = rng(11);
    for (let layer = 0; layer < 2; layer++) {
      g.fillStyle = layer ? "#12172b" : "#222a48";
      for (let x = -10; x < 520; x += 46 + layer * 12) {
        const h = 130 + r() * 200 + layer * 50;
        g.fillRect(x, 512 - h, 42 + layer * 10, h);
        g.fillStyle = layer ? "#ffd48a" : "#ffe9b8";
        for (let y = 512 - h + 16; y < 500; y += 24) if (r() > 0.45) g.fillRect(x + 8 + r() * 14, y, 7, 10);
        g.fillStyle = layer ? "#12172b" : "#222a48";
      }
    }
  } : (g) => {
    g.fillStyle = "#aec3c4"; g.fillRect(0, 0, 512, 512);
    g.fillStyle = "#e9dabb"; g.beginPath(); g.arc(115, 105, 44, 0, Math.PI * 2); g.fill();
    // Layered low-poly woodland, in the same illustrated material language as the room.
    for (let layer = 0; layer < 3; layer++) {
      g.fillStyle = ["#819b92", "#5f8074", "#3d6154"][layer];
      g.beginPath(); g.moveTo(0, 512);
      for (let x = -40; x <= 560; x += 65) {
        const y = 245 + layer * 65 + Math.sin(x * 0.03 + layer) * 24;
        g.lineTo(x, y + 80); g.lineTo(x + 32, y); g.lineTo(x + 65, y + 80);
      }
      g.lineTo(512, 512); g.closePath(); g.fill();
    }
  }), [karen]);
  useEffect(() => () => view.dispose(), [view]);
  const sash = karen ? "#d9dde8" : "#71492f";
  return (
    <group name="left-window" position={[-4.85, 1.85, -4.68]}>
      <mesh><planeGeometry args={[2.8, 3.5]} /><meshBasicMaterial map={view} toneMapped /></mesh>
      {[-1.48, 1.48].map((x) => <Box key={x} at={[x, 0, 0.08]} size={[0.18, 3.85, 0.2]} color={sash} />)}
      {[-1.82, 1.82].map((y) => <Box key={y} at={[0, y, 0.08]} size={[3.14, 0.18, 0.2]} color={sash} />)}
      <Box at={[0, 0, 0.1]} size={[0.07, 3.5, 0.14]} color={karen ? "#aab1c4" : "#e2d5b9"} />
      <Box at={[0, 0.1, 0.1]} size={[2.8, 0.07, 0.14]} color={karen ? "#aab1c4" : "#e2d5b9"} />
      <Box at={[0, -1.87, 0.2]} size={[3.3, 0.12, 0.5]} color={karen ? "#46506a" : "#91613d"} />
      {karen ? <>
        {/* Fire-escape landing outside the glass: grating, rail and balusters. */}
        <Box at={[0, -1.55, 0.42]} size={[3.0, 0.07, 0.62]} color="#1a1f31" metal={0.6} />
        <Box at={[0, -0.65, 0.7]} size={[3.0, 0.06, 0.06]} color="#1a1f31" metal={0.6} />
        {[-1.4, -0.93, -0.47, 0, 0.47, 0.93, 1.4].map((x) => <Box key={x} at={[x, -1.1, 0.7]} size={[0.04, 0.9, 0.04]} color="#1a1f31" metal={0.6} />)}
        <Box at={[0.95, 0.15, 0.1]} size={[0.5, 3.1, 0.04]} color="#7d1f33" rough={0.95} rot={[0, 0, 0.05]} />
      </> : <>
        {/* Raised wooden blinds echo the cabin reference without hiding the daylight. */}
        {[1.65, 1.49, 1.33].map((y) => <Box key={y} at={[0, y, 0.19]} size={[2.85, 0.1, 0.12]} color="#a47d52" rot={[0.35, 0, 0]} />)}
        <Cyl at={[1.27, 0.75, 0.24]} r={0.008} h={1.85} color="#ddcdae" />
      </>}
      <pointLight position={[0, 0.3, 1.4]} intensity={32} distance={13} color={karen ? "#9fb4ff" : "#c6dfdf"} />
    </group>
  );
}

function Wall({ p, desktop = false }: { p: Palette; desktop?: boolean }) {
  const karen = p.ai === "K.A.R.E.N.";
  const wood = useMemo(() => woodTex(), []);
  const shelfFrame = karen ? "#2f3850" : "#634129", shelfBoard = karen ? "#c9ced8" : "#805336";
  useEffect(() => () => wood.dispose(), [wood]);
  return (
    <>
      <Box at={[0, 1, -4.9]} size={[16, 7.2, 0.25]} color={karen ? "#25304f" : "#39372f"} />
      <Box at={[-7.7, 1, 0]} size={[0.2, 7.2, 10]} color={karen ? "#2c3558" : "#474237"} />
      <Box at={[7.7, 1, 0]} size={[0.2, 7.2, 10]} color={karen ? "#1b2240" : "#302e29"} />
      {[-6.7, -3.12, 2.6, 6.55].map((x) => <Box key={x} at={[x, 1, -4.73]} size={[0.16, 7.2, 0.14]} color={karen ? "#3a4566" : "#65472f"} />)}
      <Box at={[0, -2.2, -4.7]} size={[15.4, 0.22, 0.12]} color={karen ? "#7d1f33" : "#65472f"} />
      {karen && <Box at={[0, 2.35, -4.77]} size={[15.4, 0.05, 0.04]} color="#c9374f" metal={0.2} />}
      <mesh name="wood-plank-floor" position={[0, -2.45, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[15.4, 15]} /><meshStandardMaterial map={karen ? undefined : wood} color={karen ? "#3b4254" : "#aa977f"} roughness={karen ? 0.7 : 0.88} />
      </mesh>
      <Window karen={karen} />
      {/* Right-side built-in cabinet: dark backing, walnut shelves, collectible silhouettes. */}
      <group name="right-figure-cabinet" position={[4.6, desktop ? -0.55 : 0, -4.48]}>
        <Box at={[0, 0.65, -0.16]} size={[3.65, 6.05, 0.14]} color={karen ? "#5d1c2e" : "#241f1a"} />
        {[-1.85, 1.85].map((x) => <Box key={x} at={[x, 0.65, 0.1]} size={[0.17, 6.1, 0.72]} color={shelfFrame} rough={karen ? 0.35 : 0.55} metal={karen ? 0.5 : 0} />)}
        {[-2.32, -0.75, 0.35, 1.45, 2.55, 3.68].map((y) => <Box key={y} at={[0, y, 0.13]} size={[3.8, 0.12, 0.8]} color={shelfBoard} rough={karen ? 0.3 : 0.5} metal={karen ? 0.4 : 0} />)}
        {[-0.8, 0.8].map((x) => <Box key={x} at={[x, -1.55, 0.3]} size={[1.5, 1.35, 0.16]} color={karen ? "#8e2236" : "#5c3c28"} />)}
        {[-0.13, 0.13].map((x) => <Box key={x} at={[x, -1.45, 0.4]} size={[0.045, 0.22, 0.07]} color={karen ? "#d9dde8" : "#c2a675"} metal={0.7} />)}
        {(["miles", "luffy", "chopper", "zoro"] as const).map((character, i) => <Figure key={character} at={[-1.35 + i * 0.88, 2.61, 0.28]} character={character} h={0.72} rotY={-0.08} />)}
        <Handheld at={[-1.3, 1.51, 0.26]} rotY={0.12} />
        <Gpu p={p} at={[-0.42, 1.51, 0.26]} />
        <Figure at={[0.5, 1.51, 0.26]} character="zoro" h={0.7} />
        <Figure at={[1.32, 1.51, 0.26]} character="chopper" h={0.65} />
        <Figure at={[-1.3, 0.41, 0.26]} character="luffy" h={0.72} />
        {["#7a3a30", "#38503f", "#b39a69", "#475b70"].map((c, i) => <Box key={c} at={[-0.45 + i * 0.14, 0.69, 0.26]} size={[0.11, 0.56 - i * 0.03, 0.35]} color={c} rot={[0, 0, i === 3 ? -0.12 : 0]} />)}
        <Figure at={[1.15, 0.41, 0.26]} character="miles" h={0.7} />
        <CableCoil at={[-1.1, -0.58, 0.25]} />
        <Box at={[0.4, -0.5, 0.26]} size={[1, 0.32, 0.45]} color="#526056" />
        {[1.4, 2.5, 3.63].map((y) => <pointLight key={y} position={[0, y, 0.5]} intensity={3} distance={2.1} color={karen ? "#ffb7ca" : "#ffcf93"} />)}
      </group>
    </>
  );
}

/** A closer 3:4 portrait crop: keep the face readable instead of framing mostly sky. */
function WallFrame({ at, w = 1.8, h = 2.45 }: { at: V3; w?: number; h?: number }) {
  const source = useTexture("/images/huy-hoang.jpg");
  const pic = useMemo(() => {
    const crop = source.clone();
    crop.repeat.set(0.5, 0.5);
    crop.offset.set(0.25, 0.23);
    crop.needsUpdate = true;
    return crop;
  }, [source]);
  useEffect(() => () => pic.dispose(), [pic]);
  const F = 0.09;
  return (
    <group name="wall-portrait" position={at}>
      <Box at={[0, 0, 0]} size={[w, h, 0.06]} color="#e9e4d8" />
      {[-1, 1].map((s) => <group key={s}>
        <Box at={[0, s * (h - F) / 2, 0.05]} size={[w, F, 0.09]} color="#4a3320" rough={0.5} />
        <Box at={[s * (w - F) / 2, 0, 0.05]} size={[F, h - 2 * F, 0.09]} color="#4a3320" rough={0.5} />
      </group>)}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[w - 2 * F - 0.14, (w - 2 * F - 0.14) * 4 / 3]} />
        <meshStandardMaterial map={pic} emissiveMap={pic} emissive="#ffffff" emissiveIntensity={0.2} roughness={0.8} />
      </mesh>
    </group>
  );
}

function DeskGear({ p }: { p: Palette }) {
  return (
    <>
      <Editable3D id="keyboard" position={[0.05, 0, 2.99]}><Keyboard p={p} at={[0, 0, 0]} /></Editable3D>
      <Editable3D id="mouse" position={[1.55, 0, 2.99]}><Mouse p={p} at={[0, 0, 0]} /></Editable3D>
      <Editable3D id="headset" position={[-4, 0, 1.5]}><Headset p={p} at={[0, 0, 0]} rotY={0.4} /></Editable3D>
      <Editable3D id="duck" position={[-0.5, 0, 2.65]}><Duck at={[0, 0, 0]} rotY={0.5} /></Editable3D>
      {/* Small working mess around the clear projection field, not in its hit targets. */}
      <group position={[-3.55, 0.02, -0.45]} rotation-y={0.18}>
        <Box at={[0, 0.015, 0]} size={[0.75, 0.035, 0.94]} color="#293c37" />
        <Box at={[0.04, 0.04, 0.03]} size={[0.65, 0.018, 0.82]} color="#dfd3b5" rot={[0, -0.12, 0]} />
        {[0, 1, 2, 3].map((n) => <Box key={n} at={[-0.04, 0.05, -0.18 + n * 0.1]} size={[0.36 - n * 0.04, 0.002, 0.006]} color="#777765" rot={[0, -0.12, 0]} />)}
        <Cyl at={[0.2, 0.065, 0.02]} r={0.016} h={0.55} color="#b59b64" rot={[Math.PI / 2, 0, -0.25]} />
      </group>
      <Multimeter at={[3.55, 0.07, 1.2]} />
      <ScrewdriverSet at={[3.6, 0.04, -1.45]} />
      <group position={[-3.5, 0.13, -2.2]} rotation={[-Math.PI / 2, 0, 0]}><SolderingIron at={[0, 0, 0]} /></group>
      <Box at={[3.6, 0.025, -0.4]} size={[0.6, 0.04, 0.48]} color="#294d3c" rot={[0, 0.25, 0]} />
      <Box at={[3.6, 0.07, -0.4]} size={[0.23, 0.05, 0.23]} color="#232629" metal={0.7} />
      {[-0.2, 0.2].map((x) => <Cyl key={x} at={[3.6 + x, 0.06, -0.25]} r={0.035} h={0.05} color="#c6ac6f" metal={0.7} />)}
    </>
  );
}

// Hidden-LED-strip look: a thin square outline of light on the ceiling, about 75% of the room's floor each way (room interior: 15.4 x 10).
// Lines only, no fixture. Each edge also casts a soft area light downward so the room is still lit.
export const LED = { w: 11.5, d: 7.5, y: 4.55, z: 0.1, t: 0.07, color: "#fff0da" } as const;
function CeilingLed() {
  useEffect(() => { RectAreaLightUniformsLib.init(); }, []);
  const edges = [
    { at: [0, LED.y, LED.z - LED.d / 2], size: [LED.w, LED.t, LED.t], light: [LED.w, 0.4] },
    { at: [0, LED.y, LED.z + LED.d / 2], size: [LED.w, LED.t, LED.t], light: [LED.w, 0.4] },
    { at: [-LED.w / 2, LED.y, LED.z], size: [LED.t, LED.t, LED.d], light: [0.4, LED.d] },
    { at: [LED.w / 2, LED.y, LED.z], size: [LED.t, LED.t, LED.d], light: [0.4, LED.d] },
  ] as const;
  return (
    <group name="ceiling-led">
      {edges.map((e, i) => (
        <group key={i} position={e.at}>
          <mesh name="led-strip">
            <boxGeometry args={[...e.size]} />
            <meshBasicMaterial color={LED.color} toneMapped={false} />
          </mesh>
          <rectAreaLight position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} width={e.light[0]} height={e.light[1]} intensity={3} color={LED.color} />
        </group>
      ))}
    </group>
  );
}

/** A solid model resting on its lowest point, scaled by its longest side. */
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

export default function Workshop({ p, desktop = false }: { p: Palette; desktop?: boolean }) {
  return (
    <>
      <hemisphereLight args={p.ai === "K.A.R.E.N." ? ["#c9d4ff", "#3a2638", 1.05] : ["#e0d7bf", "#4d3827", 1.15]} />
      <directionalLight position={[-5, 6, 3]} intensity={2.2} color={p.ai === "K.A.R.E.N." ? "#d6ddff" : "#ffe1b2"} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.001} />
      <Environment resolution={128} frames={1} environmentIntensity={0.35}>
        <Lightformer form="rect" intensity={1.8} color="#f6dfba" position={[-5, 4, 0]} scale={[4, 4, 1]} />
        <Lightformer form="rect" intensity={1} color={p.accent} position={[0, 2, -2]} scale={[5, 1.2, 1]} />
      </Environment>
      <Bench p={p} />
      <Wall p={p} desktop={desktop} />
      <DeskGear p={p} />
      <WallFrame at={[-2.05, 1.4, -4.69]} />
      <CeilingLed />
    </>
  );
}
