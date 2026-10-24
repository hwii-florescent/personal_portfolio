"use client";

// Real DOM (selectable, accessible) laid over the canvas: a framed home profile, or borderless résumé and navigation projections.
// Below md the same résumé uses a flat monitor instead.
// One monitor: at home it shows the profile out in the room; opening a section brings a landscape résumé to the camera.
// The DOM face is a plain sibling of the canvas: each frame the monitor's four corners are projected and the face is mapped onto that
// screen quad with one 2D homography. No CSS 3D context (preserve-3d / perspective), which Safari composites unreliably.
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, type Ref, type RefObject } from "react";
import { Euler, Matrix4, MathUtils, Quaternion, Vector3, type Group, type Mesh } from "three";
import { quadToCss } from "@/lib/quad";
import { PANEL, RESUME_PANEL } from "@/data/doc";
import type { Palette } from "@/data/themes";
import { sections, type ChapterId } from "@/data/sections";
import PanelShell from "./PanelShell";
import { ProfileBody } from "./Hud";
import ResumeMonitor from "./ResumeMonitor";
import { Editable3D, useLayout } from "./LayoutEditor";
import { CAM, identity, type Transform } from "@/data/layout";

const WORLD_W = 1.8; // a PANEL.w-wide panel is this wide in world units
const K = WORLD_W / PANEL.w; // world units per CSS px (shared by every panel so text sizes match)
export const FLIGHT = 1; // seconds for the monitor to travel between the home and reading poses (either direction)
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

/** Keep the saved pad rail calibrated separately; the reading monitor uses a centered full-width pose. */
function layoutPose(aspect: number, width: number, height: number, position: readonly number[], reading = false, viewportHeight?: number) {
  const cam = new Vector3().fromArray(position);
  const target = new Vector3(...CAM.at);
  const f = target.clone().sub(cam).normalize();
  const rightAxis = f.clone().cross(UP).normalize();
  const u = rightAxis.clone().cross(f).normalize();
  const rotation = new Euler().setFromRotationMatrix(new Matrix4().lookAt(cam, target, UP));
  const W = width * K, H = height * K;
  // Native-pixel reading distance makes the flight land on the flat DOM box without a size pop.
  const D = reading && viewportHeight ? viewportHeight * K / (2 * TAN) : Math.max(H / (2 * TAN * (reading ? 0.82 : 0.88)), W / (reading ? 0.92 : 0.6) / (2 * TAN * aspect));
  const ndc = (D0: number) => D0 / (TAN * aspect * D); // world units at the monitor plane -> screen x in [-1, 1]
  const right = reading ? 0 : 0.94 - ndc(W / 2); // reading monitor is centered; pad layout stays calibrated to the old rail
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
function focusPose(aspect: number, width: number, height: number, position: readonly number[], viewportHeight?: number) {
  const base = layoutPose(aspect, PANEL.w, PANEL.h, position);
  return { ...base, width, height, monitor: layoutPose(aspect, width, height, position, true, viewportHeight).monitor };
}
export type FocusPose = ReturnType<typeof focusPose>;

export function useFocusPose(): FocusPose {
  const size = useThree((s) => s.size);
  const aspect = size.width / size.height;
  const layout = useLayout()?.layout;
  const t = layout?.["monitor-open"] ?? identity;
  const position = layout?.["camera-section"]?.position ?? CAM.pos;
  // Keep source CSS pixels near screen pixels on narrower devices instead of shrinking the text to fit.
  const width = Math.min(RESUME_PANEL.w * (t.width ?? 1), size.width * 0.92);
  const height = Math.min(RESUME_PANEL.h * (t.height ?? 1), size.height * 0.82);
  return useMemo(() => focusPose(aspect, width, height, position, size.height), [aspect, width, height, position, size.height]);
}

/** One framed hologram panel: translucent slab + glowing bezel, with a PanelShell face.
 *  Home and section view each have their own layout (`profile` / `monitor-open`: offset, yaw, width, height). `k` blends the two world poses,
 *  so the flight, swivel and resize all animate between whatever the two layouts say. */
function HoloPanel({ p, scale = 1, position, yaw, lean = 0, focus, open, faceRef, documentSize }: {
  p: Palette; scale?: number; lean?: number; position: [number, number, number]; yaw: number;
  focus: FocusPose["monitor"]; open: boolean; faceRef: RefObject<HTMLDivElement | null>;
  documentSize: readonly [number, number];
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
  const t = useRef(0); // linear flight clock behind k
  const q = useRef({ a: new Quaternion(), b: new Quaternion(), c: new Quaternion() });
  const [start] = useState<[number, number, number]>(() => [lean, yaw, 0]);
  const dims = (t: Transform) => [PANEL.w * (t.width ?? 1), PANEL.h * (t.height ?? 1)] as const;
  const reduced = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)"), []);

  useFrame(({ camera, size }, dt) => {
    const g = fly.current;
    if (!g) return;
    // A fixed-length eased tween, not a damp: it lands exactly on time with no slow exponential tail, and reverses cleanly mid-flight.
    t.current = reduced.matches ? Number(open) : MathUtils.clamp(t.current + (open ? dt : -dt) / FLIGHT, 0, 1);
    k.current = MathUtils.smoothstep(t.current, 0, 1);
    const f = k.current;
    const L = MathUtils.lerp;
    // World pose = blend of the two layouts; then solve for the local pose inside the wrapper (its offset, yaw and scale).
    const cy = tCur.rotation ?? 0;
    g.position.set(
      L(position[0] + tHome.position[0], focus.pos[0] + tOpen.position[0], f) - base[0] - tCur.position[0],
      L(position[1] + tHome.position[1], focus.pos[1] + tOpen.position[1], f) - base[1] - tCur.position[1],
      L(position[2] + tHome.position[2], focus.pos[2] + tOpen.position[2], f) - base[2] - tCur.position[2],
    ).divideScalar(tCur.scale).applyAxisAngle(UP, -cy);
    // Keep the home angle; reading faces the actual camera without saved yaw or keystone tilt.
    const { a, b, c } = q.current;
    a.setFromEuler(g.rotation.set(lean, yaw, 0)).premultiply(c.setFromAxisAngle(UP, tHome.rotation ?? 0));
    if (editor?.editing) b.setFromEuler(g.rotation.set(focus.lean, focus.yaw, focus.roll)).premultiply(c.setFromAxisAngle(UP, tOpen.rotation ?? 0));
    else b.copy(camera.quaternion);
    g.quaternion.copy(a.slerp(b, f)).premultiply(c.setFromAxisAngle(UP, -cy));
    g.scale.setScalar(L(scale * tHome.scale, tOpen.scale, f) / tCur.scale);
    // size: the DOM box and the bezel follow the blended width/height
    const [wa, ha] = dims(tHome), [wb, hb] = documentSize;
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
    const reading = el.dataset.reading === "true"; // Read the DOM's current mode, not a stale Canvas callback's props.
    if (!reading) delete el.dataset.settled;
    const rw = Math.floor(wb), rh = Math.floor(hb);
    const left = Math.round((size.width - rw) / 2), top = Math.round((size.height - rh) / 2);
    // Reading: the profile zooms in, then (mirroring Esc, which swaps to the profile before flying out) cross-fades to the résumé, a
    // separate flat layer (the face's next sibling) at its final box. The fade (s) is tied to the flight clock, so it needs no landing check.
    // It ends exactly when the flight does, so there is neither a pause nor a pop.
    const sibling = el.nextElementSibling as HTMLElement | null;
    const layer = reading && open && sibling?.classList?.contains("resume-layer") ? sibling : null;
    const landed = reading && el.dataset.settled === "true";
    const s = layer ? (landed ? 1 : MathUtils.smoothstep(f, 0.85, 1)) : 0; // swap happens at the landing, like Esc swaps at the start
    el.style.setProperty("--profile-fade", String(1 - s));
    if (layer) {
      Object.assign(layer.style, {
        left: `${left}px`, top: `${top}px`, width: `${rw}px`, height: `${rh}px`, opacity: String(s),
        transform: `scale(${0.97 + 0.03 * s})`, visibility: s > 0.01 ? "visible" : "hidden", pointerEvents: s > 0.9 ? "auto" : "none",
      });
      if (landed || f > 0.98) { // landed: the flat layer carries on alone, even through chapter changes or resize
        el.style.visibility = "hidden";
        if (el.dataset.settled !== "true") {
          el.dataset.settled = "true";
          layer.querySelector<HTMLElement>(".resume-monitor")?.focus({ preventScroll: true });
        }
        return;
      }
    } else if (landed) return; // a stale closing callback must not overwrite the reading DOM
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
      <group position={[0, 0, -DEPTH / 2 - 0.005]} visible={!open || !!editor?.editing}>
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

/** In the canvas: the monitor's frame. It also places `faceRef` (MonitorFace, rendered next to the canvas) every frame. */
export default function Monitor({ p, active, faceRef }: { p: Palette; active: ChapterId | null; faceRef: RefObject<HTMLDivElement | null> }) {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const pose = useFocusPose();
  return <HoloPanel p={p} scale={homeScale(aspect)} lean={HOME.lean} yaw={HOME.yaw} position={homePos(aspect)} focus={pose.monitor} open={active !== null} faceRef={faceRef} documentSize={[pose.width, pose.height]} />;
}

/** Outside the canvas (a sibling over it): the monitor's DOM. Hidden until Monitor has placed it. Not inside R3F's event root, so
 *  pointer events on it never raycast through to the pads behind. */
export function MonitorFace({ ref, active, onCloseAction }: { ref: Ref<HTMLDivElement>; active: ChapterId | null; onCloseAction: () => void }) {
  const editor = useLayout();
  const editing = !!editor?.editing;
  const reading = active !== null && !editing;
  // fade the selected panel and let the pointer through, so its move/resize handles (in WebGL, underneath) work
  const selected = editing && editor.selected === (active ? "monitor-open" : "profile");
  const resume = active && <ResumeMonitor active={active} onCloseAction={onCloseAction} />;
  return (
    <>
    <div ref={ref} className="monitor-face" data-active={active !== null || undefined} data-reading={reading || undefined} style={{
      position: "absolute", left: 0, top: 0, width: PANEL.w, height: PANEL.h, transformOrigin: "0 0", visibility: "hidden",
      opacity: selected ? 0.3 : 1, pointerEvents: editing ? "none" : undefined,
    }}>
      <PanelShell label="Profile" w="100%" h="100%" style={{ position: "relative", animation: "none", transform: "none" }}>
        <ProfileBody full />
      </PanelShell>
      {editing && resume /* the layout editor moves the résumé with the 3D frame, so it rides the face there */}
    </div>
    {reading && <div className="resume-layer">{resume}</div>}
    </>
  );
}
