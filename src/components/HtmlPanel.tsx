"use client";

// Panels placed in the 3D scene: real DOM (selectable, accessible) positioned by drei <Html transform>,
// inside a thin glowing frame so they read as hologram monitors. Below md the flat PanelShell is used instead.
// One monitor: at home it shows the profile out in the room; when a section opens it flies to the camera and the pads line up on the bench.
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MathUtils, Quaternion, Vector3, type Group, type Intersection, type Mesh } from "three";
import { PANEL } from "@/data/doc";
import type { Palette } from "@/data/themes";
import { sections, type SectionId } from "@/data/sections";
import PanelShell from "./PanelShell";
import { ProfileBody } from "./Hud";
import { SectionBody } from "./Sections";
import { Editable3D, useLayout } from "./LayoutEditor";
import { identity, type Transform } from "@/data/layout";

const WORLD_W = 1.8; // a PANEL.w-wide panel is this wide in world units
const K = WORLD_W / PANEL.w; // world units per CSS px (shared by every panel so text sizes match)
const DEPTH = 0.015; // slab thickness (world units): thin glass, not a monitor
const FRAME = 0.01; // bezel bar width
const UP = new Vector3(0, 1, 0);

// drei <Html> sits inside R3F's event root, so pointer events on the monitor's DOM bubble up and get raycast *through* the panel
// onto the invisible pad hit targets behind it (hover/click on the empty part of the panel hit a pad). While the pointer is over the panel, drop all hits.
const panel = { over: false };
const ignoreBehindPanel = (hits: Intersection[]) => (panel.over ? [] : hits);
function PanelEventGuard() {
  const setEvents = useThree((s) => s.setEvents);
  useEffect(() => { setEvents({ filter: ignoreBehindPanel }); return () => setEvents({ filter: undefined }); }, [setEvents]);
  return null;
}

// The camera never leaves this pose (Rig adds only mouse parallax); the open monitor and the pad row are placed relative to it.
export const CAM = { pos: [0, 1.8, 5.2], at: [0, 1, 0] } as const;
const TAN = Math.tan(MathUtils.degToRad(48 / 2)); // half the camera's vertical fov (Scene.tsx)
const HOME = { lean: -0.06, yaw: -1.1, z: -1.8 };
const homeScale = (aspect: number) => Math.min(1.04, aspect * 0.72); // narrow (tablet-portrait) viewports: shrink so it stays on screen
const homePos = (aspect: number): [number, number, number] => [2.3 * aspect, (PANEL.h * K * homeScale(aspect)) / 2 * Math.cos(HOME.lean) + 0.25, HOME.z];

/** Open state: the monitor right in front of the camera on its right, the five pads in a row on the bench to its left. */
function layoutPose(aspect: number, width: number, height: number) {
  const cam = new Vector3(...CAM.pos);
  const f = new Vector3(...CAM.at).sub(cam).normalize(); // camera forward
  const u = new Vector3(0, 1, 0).addScaledVector(f, -f.y).normalize(); // camera up
  const W = width * K, H = height * K;
  const D = Math.min(4.6, Math.max(H / (2 * TAN * 0.8), W / 0.5 / (2 * TAN * aspect))); // monitor distance: ~80% of the height, at most half the width
  const ndc = (D0: number) => D0 / (TAN * aspect * D); // world units at the monitor plane -> screen x in [-1, 1]
  const right = 0.94 - ndc(W / 2); // panel centre, screen x
  const left = right - ndc(W / 2); // panel left edge
  const centre = cam.clone().addScaledVector(f, D).addScaledVector(new Vector3(1, 0, 0), right * TAN * aspect * D);
  // pads: evenly across the free screen width, at a fixed screen height, dropped onto the bench plane (y = 0)
  const n = sections.length;
  const x0 = -0.76, x1 = Math.min(left - 0.2, 0.1);
  const pads = sections.map((_, i) => {
    const nx = x0 + ((x1 - x0) * i) / (n - 1);
    const ray = f.clone().addScaledVector(new Vector3(1, 0, 0), nx * TAN * aspect).addScaledVector(u, -0.4 * TAN);
    return cam.clone().addScaledVector(ray, -cam.y / ray.y);
  });
  const pitch = pads[1].distanceTo(pads[0]);
  return {
    monitor: { pos: [centre.x, centre.y, centre.z] as [number, number, number], lean: Math.atan2(f.y, -f.z) },
    pads: pads.map((v) => [v.x, v.y, v.z] as [number, number, number]),
    padScale: Math.min(0.7, Math.max(0.2, (pitch * 0.95) / 1.18)), // pad outer ring is ~1.18 wide at scale 1
  };
}
/** The pads' default spots follow the default panel size (so resizing the monitor never shifts saved pad offsets); the monitor follows its own size. */
function focusPose(aspect: number, width: number, height: number) {
  const base = layoutPose(aspect, PANEL.w, PANEL.h);
  return { ...base, monitor: layoutPose(aspect, width, height).monitor };
}
export type FocusPose = ReturnType<typeof focusPose>;

export function useFocusPose(): FocusPose {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const t = useLayout()?.layout["monitor-open"] ?? identity;
  const width = PANEL.w * (t.width ?? 1), height = PANEL.h * (t.height ?? 1);
  return useMemo(() => focusPose(aspect, width, height), [aspect, width, height]);
}

/** One framed hologram panel: translucent slab + glowing bezel, with a PanelShell face.
 *  Home and section view each have their own layout (`profile` / `monitor-open`: offset, yaw, width, height). `k` blends the two world poses,
 *  so the flight, swivel and resize all animate between whatever the two layouts say. */
function HoloPanel({ p, scale = 1, position, yaw, lean = 0, focus, open, children }: {
  p: Palette; scale?: number; lean?: number; position: [number, number, number]; yaw: number;
  focus: FocusPose["monitor"]; open: boolean; children: ReactNode;
}) {
  const editor = useLayout();
  const id = open ? "monitor-open" : "profile";
  const layout = editor?.layout;
  const tHome = layout?.profile ?? identity;
  const tOpen = layout?.["monitor-open"] ?? identity;
  const tCur = open ? tOpen : tHome; // the wrapper (Editable3D) currently in use
  const base = open ? focus.pos : position;
  const fly = useRef<Group>(null);
  const box = useRef<HTMLDivElement>(null);
  const slab = useRef<Mesh>(null);
  const bar = { top: useRef<Mesh>(null), bottom: useRef<Mesh>(null), left: useRef<Mesh>(null), right: useRef<Mesh>(null) };
  const k = useRef(0); // 0 = out in the room (home layout), 1 = in front of the camera (section layout)
  const q = useRef({ a: new Quaternion(), b: new Quaternion(), c: new Quaternion() });
  const [start] = useState<[number, number, number]>(() => [lean, yaw, 0]);
  const dims = (t: Transform) => [PANEL.w * (t.width ?? 1), PANEL.h * (t.height ?? 1)] as const;
  const [w0, h0] = dims(tHome);

  useFrame((_, dt) => {
    const g = fly.current;
    if (!g) return;
    k.current = MathUtils.damp(k.current, open ? 1 : 0, 3.2, dt);
    const f = k.current;
    const L = MathUtils.lerp;
    // World pose = blend of the two layouts; then solve for the local pose inside the wrapper (its offset, yaw and scale).
    const cy = tCur.rotation ?? 0;
    g.position.set(
      L(position[0] + tHome.position[0], focus.pos[0] + tOpen.position[0], f) - base[0] - tCur.position[0],
      L(position[1] + tHome.position[1], focus.pos[1] + tOpen.position[1], f) - base[1] - tCur.position[1],
      L(position[2] + tHome.position[2], focus.pos[2] + tOpen.position[2], f) - base[2] - tCur.position[2],
    ).divideScalar(tCur.scale).applyAxisAngle(UP, -cy);
    // home faces out by yaw/lean (+ saved yaw); open faces the camera (+ saved yaw)
    const { a, b, c } = q.current;
    a.setFromEuler(g.rotation.set(lean, yaw, 0)).premultiply(c.setFromAxisAngle(UP, tHome.rotation ?? 0));
    b.setFromEuler(g.rotation.set(focus.lean, 0, 0)).premultiply(c.setFromAxisAngle(UP, tOpen.rotation ?? 0));
    g.quaternion.copy(a.slerp(b, f)).premultiply(c.setFromAxisAngle(UP, -cy));
    g.scale.setScalar(L(scale * tHome.scale, tOpen.scale, f) / tCur.scale);
    // size: the DOM box and the bezel follow the blended width/height
    const [wa, ha] = dims(tHome), [wb, hb] = dims(tOpen);
    const w = L(wa, wb, f), h = L(ha, hb, f);
    const el = box.current;
    if (el) { el.style.width = `${w}px`; el.style.height = `${h}px`; }
    const W = w * K, H = h * K;
    slab.current?.scale.set(W, H, DEPTH);
    bar.top.current?.scale.set(W + 2 * FRAME, FRAME, DEPTH * 1.6);
    bar.top.current?.position.set(0, (H + FRAME) / 2, 0);
    bar.bottom.current?.scale.set(W + 2 * FRAME, FRAME, DEPTH * 1.6);
    bar.bottom.current?.position.set(0, -(H + FRAME) / 2, 0);
    bar.left.current?.scale.set(FRAME, H, DEPTH * 1.6);
    bar.left.current?.position.set(-(W + FRAME) / 2, 0, 0);
    bar.right.current?.scale.set(FRAME, H, DEPTH * 1.6);
    bar.right.current?.position.set((W + FRAME) / 2, 0, 0);
  });
  return (
    <Editable3D id={id} position={base}>
    <group ref={fly} rotation={start} scale={scale}>
      <group position={[0, 0, -DEPTH / 2 - 0.005]}>
        <mesh ref={slab}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={p.accent} transparent opacity={0.05} depthWrite={false} />
        </mesh>
        {(["top", "bottom", "left", "right"] as const).map((side) => (
          <mesh key={side} ref={bar[side]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={p.accent} transparent opacity={0.35} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {/* drei: 400 / distanceFactor CSS px per world unit */}
      <Html transform distanceFactor={400 * K} zIndexRange={[0, 0]}>
        {/* DOM sits above the canvas: fade the selected panel so its move/resize handles show through */}
        <div
          ref={box}
          onPointerMove={() => { panel.over = true; }} onPointerDown={() => { panel.over = true; }} onPointerLeave={() => { panel.over = false; }}
          style={{ width: w0, height: h0, opacity: editor?.editing && editor.selected === id ? 0.3 : 1 }}
        >{children}</div>
      </Html>
    </group>
    </Editable3D>
  );
}

// Screens swipe like full-screen apps: the new one slides in from the side of its place in the order, the old one slides away and fades.
const order = ["profile", ...sections.map((s) => s.id)];
type Screen = "profile" | SectionId;
const SWIPE_MS = 450;

function Swipe({ screen, onClose, interactive }: { screen: Screen; onClose: () => void; interactive: boolean }) {
  const [st, setSt] = useState<{ cur: Screen; prev: Screen | null; dir: 1 | -1; moved: boolean }>({ cur: screen, prev: null, dir: 1, moved: false });
  if (st.cur !== screen) setSt({ cur: screen, prev: st.cur, dir: order.indexOf(screen) > order.indexOf(st.cur) ? 1 : -1, moved: true });
  const layer = (id: Screen, role: "in" | "out" | "still"): ReactNode => {
    const css: CSSProperties = {
      position: "absolute", inset: 0, transform: "none", pointerEvents: interactive && role !== "out" ? "auto" : "none",
      ["--sx" as string]: `${st.dir * 100}%`,
      animationName: role === "in" ? "swipe-in" : role === "out" ? "swipe-out" : "holo-in-flat",
      animationDuration: role === "still" ? undefined : `${SWIPE_MS}ms`, animationTimingFunction: "cubic-bezier(.3,.8,.2,1)", animationFillMode: "both",
    };
    return (
      <div key={id} style={css} aria-hidden={role === "out" || undefined} onAnimationEnd={role === "out" ? (e) => { if (e.target === e.currentTarget) setSt((s) => ({ ...s, prev: null })); } : undefined}>
        <PanelShell label={id === "profile" ? "Profile" : sections.find((s) => s.id === id)!.label} onClose={id === "profile" ? undefined : onClose} w="100%" h="100%" style={{ position: "relative", animation: "none", transform: "none" }}>
          {id === "profile" ? <ProfileBody full /> : <SectionBody id={id} />}
        </PanelShell>
      </div>
    );
  };
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {st.prev && layer(st.prev, "out")}
      {layer(st.cur, st.moved ? "in" : "still")}
    </div>
  );
}

export default function Monitor({ p, active, onCloseAction }: { p: Palette; active: SectionId | null; onCloseAction: () => void }) {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const pose = useFocusPose();
  const editing = useLayout()?.editing;
  const open = active !== null;
  return (
    <>
    <PanelEventGuard />
    <HoloPanel p={p} scale={homeScale(aspect)} lean={HOME.lean} yaw={HOME.yaw} position={homePos(aspect)} focus={pose.monitor} open={open}>
      <Swipe screen={open ? active : "profile"} onClose={onCloseAction} interactive={!editing} />
    </HoloPanel>
    </>
  );
}
