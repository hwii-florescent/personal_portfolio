// Section view = a section is open: the monitor flies to the camera and the pads line up in a row. It has its own layout, separate from home.
export const editableItems = {
  profile: "Monitor, home (profile)", "monitor-open": "Monitor, section view",
  "camera-home": "Camera, home view", "camera-section": "Camera, section view",
  "mobile-profile": "Mobile profile", "mobile-section": "Mobile section",
  experience: "Experience hologram, home", projects: "Projects hologram, home", skills: "Skills hologram, home",
  leadership: "Leadership hologram, home", contact: "Contact hologram, home",
  "pad-experience": "Experience hologram, section view", "pad-projects": "Projects hologram, section view", "pad-skills": "Skills hologram, section view",
  "pad-leadership": "Leadership hologram, section view", "pad-contact": "Contact hologram, section view",
  keyboard: "Keyboard, home", mouse: "Mouse + pad, home", headset: "Headset, home", duck: "Desk duck, home",
  mug: "Mug, home", pens: "Pen holder, home",
  "section-keyboard": "Keyboard, section view", "section-mouse": "Mouse + pad, section view",
  "section-headset": "Headset, section view", "section-duck": "Desk duck, section view",
  "section-mug": "Mug, section view", "section-pens": "Pen holder, section view",
} as const;
export type LayoutId = keyof typeof editableItems;
/** rotation: yaw in radians. width/height: panel size multipliers, monitors only. */
export type Transform = { position: [number, number, number]; scale: number; rotation?: number; width?: number; height?: number };
export type Layout = Partial<Record<LayoutId, Transform>>;
export const identity: Transform = { position: [0, 0, 0], scale: 1 };
// Camera transforms store absolute eye positions, orbiting the centre of the desk.
export const CAM = { pos: [0, 4.8, 10.8], at: [0, 0.4, 0] } as const;
export const cameraLimits = { distance: [5, 18], elevation: [10, 65], azimuth: [-65, 65] } as const;
export const isCamera = (id: LayoutId) => id === "camera-home" || id === "camera-section";
export const clampScale = (n: number) => Math.min(3, Math.max(0.25, n));
export const isMonitor = (id: LayoutId) => id === "profile" || id === "monitor-open";
const HOME_IDS: string[] = ["camera-home", "profile", "experience", "projects", "skills", "leadership", "contact", "keyboard", "mouse", "headset", "duck", "mug", "pens"];
/** Resolve desk props at the shared editable wrapper so every caller uses the current view. */
export const idForView = (id: LayoutId, section: boolean): LayoutId =>
  section && Object.hasOwn(editableItems, `section-${id}`) ? `section-${id}` as LayoutId : id;
/** Which scene state an item lives in: only visible at home, only while a section is open, or always. */
export const viewOf = (id: LayoutId): "home" | "section" | "both" =>
  id === "camera-section" || id === "monitor-open" || id.startsWith("pad-") || id.startsWith("section-") ? "section" : HOME_IDS.includes(id) ? "home" : "both";

const within = (n: unknown, lo: number, hi: number) => typeof n === "number" && Number.isFinite(n) && n >= lo && n <= hi;

// Leave a small tolerance for the spherical-to-Cartesian round trip at slider/orbit limits.
function validCamera([x, y, z]: number[]) {
  const dy = y - CAM.at[1], distance = Math.hypot(x, dy, z);
  const elevation = Math.asin(dy / distance) * 180 / Math.PI;
  const azimuth = Math.atan2(x, z) * 180 / Math.PI;
  return [distance, elevation, azimuth].every((n, i) => {
    const [lo, hi] = [cameraLimits.distance, cameraLimits.elevation, cameraLimits.azimuth][i];
    return within(n, lo - 1e-6, hi + 1e-6);
  });
}

// Only allow known targets and bounded, finite transforms at the file-writing boundary.
export function validLayout(value: unknown): value is Layout {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.entries(value).every(([id, t]) =>
    Object.hasOwn(editableItems, id) && t && typeof t === "object" &&
    Object.keys(t).every((k) => ["position", "scale", "rotation", "width", "height"].includes(k)) &&
    Array.isArray(t.position) && t.position.length === 3 && t.position.every((n: unknown) => within(n, -20, 20)) &&
    within(t.scale, 0.25, 3) &&
    (!isCamera(id as LayoutId) || validCamera(t.position)) &&
    (t.rotation === undefined || within(t.rotation, -Math.PI, Math.PI)) &&
    ["width", "height"].every((k) => t[k] === undefined || (isMonitor(id as LayoutId) && within(t[k], 0.25, 3)))
  );
}

export function localEditorRequest(request: Request): boolean {
  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  if (!host || !origin) return false;
  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
      url.host === host && ["http:", "https:"].includes(url.protocol);
  } catch { return false; }
}
