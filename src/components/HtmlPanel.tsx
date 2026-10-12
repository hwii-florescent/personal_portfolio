"use client";

// Panels placed in the 3D scene: real DOM (selectable, accessible) laid over the canvas, inside a thin glowing WebGL frame so they read as
// hologram monitors. Below md the flat PanelShell is used instead.
// One monitor: at home it shows the profile out in the room; when a section opens it flies to the camera and the pads line up on the bench.
// The DOM face is a plain sibling of the canvas: each frame the monitor's four corners are projected and the face is mapped onto that
// screen quad with one 2D homography. No CSS 3D context (preserve-3d / perspective), which Safari composites unreliably.
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, type CSSProperties, type ReactNode, type Ref, type RefObject } from "react";
import { Euler, Matrix4, MathUtils, Quaternion, Vector3, type Group, type Mesh } from "three";
import { quadToCss } from "@/lib/quad";
import { PANEL } from "@/data/doc";
import type { Palette } from "@/data/themes";
import { sections, type SectionId } from "@/data/sections";
import PanelShell from "./PanelShell";
import { ProfileBody } from "./Hud";
import { SectionBody } from "./Sections";
import { Editable3D, useLayout } from "./LayoutEditor";
import { CAM, identity, type Transform } from "@/data/layout";

const WORLD_W = 1.8; // a PANEL.w-wide panel is this wide in world units
const K = WORLD_W / PANEL.w; // world units per CSS px (shared by every panel so text sizes match)
const DEPTH = 0.015; // slab thickness (world units): thin glass, not a monitor
const FRAME = 0.01; // bezel bar width
const UP = new Vector3(0, 1, 0);
const CORNERS = [[-1, 1], [1, 1], [1, -1], [-1, -1]] as const; // top-left, top-right, bottom-right, bottom-left
const v = new Vector3();

// The section monitor follows its saved camera, including its horizontal viewing angle.
const TAN = Math.tan(MathUtils.degToRad(48 / 2)); // half the camera's vertical fov (Scene.tsx)
const HOME = { lean: -0.4, yaw: -0.4, z: -0.8 };
const homeScale = (aspect: number) => Math.min(1.15, aspect * 0.85); // narrow (tablet-portrait) viewports: shrink so it stays on screen
const homePos = (aspect: number): [number, number, number] => [Math.min(3.5, 2.3 * aspect), (PANEL.h * K * homeScale(aspect)) / 2 * Math.cos(HOME.lean) + 0.25, HOME.z];

/** Open state: the monitor right in front of the camera on its right, the five pads in a row on the bench to its left. */
function layoutPose(aspect: number, width: number, height: number, position: readonly number[]) {
  const cam = new Vector3().fromArray(position);
  const target = new Vector3(...CAM.at);
  const f = target.clone().sub(cam).normalize();
  const rightAxis = f.clone().cross(UP).normalize();
  const u = rightAxis.clone().cross(f).normalize();
  const rotation = new Euler().setFromRotationMatrix(new Matrix4().lookAt(cam, target, UP));
  const W = width * K, H = height * K;
  const D = Math.max(H / (2 * TAN * 0.88), W / 0.6 / (2 * TAN * aspect)); // reading view: fit within 88% height / 60% width, even for resized monitors
  const ndc = (D0: number) => D0 / (TAN * aspect * D); // world units at the monitor plane -> screen x in [-1, 1]
  const right = 0.94 - ndc(W / 2); // panel centre, screen x
  const left = right - ndc(W / 2); // panel left edge
  const centre = cam.clone().addScaledVector(f, D).addScaledVector(rightAxis, right * TAN * aspect * D);
  // Wrap the rail when the reading panel leaves too little room for five distinct labels/targets.
  const columns = aspect < 1.7 ? 3 : sections.length;
  const x0 = columns === 3 ? -0.76 : -0.58, x1 = Math.min(left - 0.2, 0.1);
  const pads = sections.map((_, i) => {
    const nx = x0 + ((x1 - x0) * (i % columns)) / (columns - 1);
    const ny = -0.24 - Math.floor(i / columns) * 0.26;
    const ray = f.clone().addScaledVector(rightAxis, nx * TAN * aspect).addScaledVector(u, ny * TAN);
    return cam.clone().addScaledVector(ray, -cam.y / ray.y);
  });
  const pitch = pads[1].distanceTo(pads[0]);
  return {
    monitor: { pos: [centre.x, centre.y, centre.z] as [number, number, number], lean: rotation.x, yaw: rotation.y, roll: rotation.z },
    pads: pads.map((v) => [v.x, v.y, v.z] as [number, number, number]),
    padScale: Math.min(0.7, Math.max(0.2, (pitch * 0.95) / 1.18)), // retain the original 1.18-wide spacing envelope so saved pad offsets do not shift
  };
}
/** The pads' default spots follow the default panel size (so resizing the monitor never shifts saved pad offsets); the monitor follows its own size. */
function focusPose(aspect: number, width: number, height: number, position: readonly number[]) {
  const base = layoutPose(aspect, PANEL.w, PANEL.h, position);
  return { ...base, monitor: layoutPose(aspect, width, height, position).monitor };
}
export type FocusPose = ReturnType<typeof focusPose>;

export function useFocusPose(): FocusPose {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const layout = useLayout()?.layout;
  const t = layout?.["monitor-open"] ?? identity;
  const position = layout?.["camera-section"]?.position ?? CAM.pos;
  const width = PANEL.w * (t.width ?? 1), height = PANEL.h * (t.height ?? 1);
  return useMemo(() => focusPose(aspect, width, height, position), [aspect, width, height, position]);
}

/** One framed hologram panel: translucent slab + glowing bezel, with a PanelShell face.
 *  Home and section view each have their own layout (`profile` / `monitor-open`: offset, yaw, width, height). `k` blends the two world poses,
 *  so the flight, swivel and resize all animate between whatever the two layouts say. */
function HoloPanel({ p, scale = 1, position, yaw, lean = 0, focus, open, faceRef }: {
  p: Palette; scale?: number; lean?: number; position: [number, number, number]; yaw: number;
  focus: FocusPose["monitor"]; open: boolean; faceRef: RefObject<HTMLDivElement | null>;
}) {
  const editor = useLayout();
  const id = open ? "monitor-open" : "profile";
  const layout = editor?.layout;
  const tHome = layout?.profile ?? identity;
  const tOpen = layout?.["monitor-open"] ?? identity;
  const tCur = open ? tOpen : tHome; // the wrapper (Editable3D) currently in use
  const base = open ? focus.pos : position;
  const fly = useRef<Group>(null);
  const slab = useRef<Mesh>(null);
  const bar = { top: useRef<Mesh>(null), bottom: useRef<Mesh>(null), left: useRef<Mesh>(null), right: useRef<Mesh>(null) };
  const k = useRef(0); // 0 = out in the room (home layout), 1 = in front of the camera (section layout)
  const q = useRef({ a: new Quaternion(), b: new Quaternion(), c: new Quaternion() });
  const [start] = useState<[number, number, number]>(() => [lean, yaw, 0]);
  const dims = (t: Transform) => [PANEL.w * (t.width ?? 1), PANEL.h * (t.height ?? 1)] as const;

  useFrame(({ camera, size }, dt) => {
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
    b.setFromEuler(g.rotation.set(focus.lean, focus.yaw, focus.roll)).premultiply(c.setFromAxisAngle(UP, tOpen.rotation ?? 0));
    g.quaternion.copy(a.slerp(b, f)).premultiply(c.setFromAxisAngle(UP, -cy));
    g.scale.setScalar(L(scale * tHome.scale, tOpen.scale, f) / tCur.scale);
    // size: the DOM box and the bezel follow the blended width/height
    const [wa, ha] = dims(tHome), [wb, hb] = dims(tOpen);
    const w = L(wa, wb, f), h = L(ha, hb, f);
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
    // DOM face: same frame as the camera (Rig runs first) and the pose above, so it can't drift from its frame.
    const el = faceRef.current;
    if (!el) return;
    g.updateWorldMatrix(true, false);
    camera.updateMatrixWorld();
    const quad: [number, number][] = [];
    for (const [sx, sy] of CORNERS) {
      v.set((sx * W) / 2, (sy * H) / 2, 0).applyMatrix4(g.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
      if (v.z > -camera.near) break; // a corner behind the camera: hide rather than fold through infinity
      v.applyMatrix4(camera.projectionMatrix);
      quad.push([((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height]);
    }
    // WebKit mispaints projective matrices with large screen translations baked in. Keep the matrix local to the top-left corner;
    // left/top position the face separately. The resulting screen quad is identical, without the disappearing/edge-on panel.
    const [x, y] = quad[0] ?? [0, 0];
    const css = quad.length === 4 ? quadToCss(w, h, quad.map(([qx, qy]) => [qx - x, qy - y])) : null;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.visibility = css ? "" : "hidden";
    if (css) {
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.transform = css;
    }
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

/** In the canvas: the monitor's frame. It also places `faceRef` (MonitorFace, rendered next to the canvas) every frame. */
export default function Monitor({ p, active, faceRef }: { p: Palette; active: SectionId | null; faceRef: RefObject<HTMLDivElement | null> }) {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const pose = useFocusPose();
  return <HoloPanel p={p} scale={homeScale(aspect)} lean={HOME.lean} yaw={HOME.yaw} position={homePos(aspect)} focus={pose.monitor} open={active !== null} faceRef={faceRef} />;
}

/** Outside the canvas (a sibling over it): the monitor's DOM. Hidden until Monitor has placed it. Not inside R3F's event root, so
 *  pointer events on it never raycast through to the pads behind. */
export function MonitorFace({ ref, active, onCloseAction }: { ref: Ref<HTMLDivElement>; active: SectionId | null; onCloseAction: () => void }) {
  const editor = useLayout();
  const editing = !!editor?.editing;
  // fade the selected panel and let the pointer through, so its move/resize handles (in WebGL, underneath) work
  const selected = editing && editor.selected === (active ? "monitor-open" : "profile");
  return (
    <div ref={ref} style={{
      position: "absolute", left: 0, top: 0, width: PANEL.w, height: PANEL.h, transformOrigin: "0 0", visibility: "hidden",
      opacity: selected ? 0.3 : 1, pointerEvents: editing ? "none" : undefined,
    }}>
      <Swipe screen={active ?? "profile"} onClose={onCloseAction} interactive={!editing} />
    </div>
  );
}
