"use client";

import { useCallback, createContext, useContext, useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { TransformControls } from "@react-three/drei";
import { MathUtils, Spherical, Vector3, type Group } from "three";
import { CAM, cameraLimits, clampScale, editableItems, identity, idForView, isCamera, isMonitor, viewOf, type Layout, type LayoutId, type Transform } from "@/data/layout";

const Context = createContext<{
  layout: Layout; editing: boolean; cameraEditing: boolean; section: boolean; selected: LayoutId; mode: "translate" | "rotate" | "scale";
  select: (id: LayoutId) => void; update: (id: LayoutId, t: Transform) => void;
} | null>(null);
export const useLayout = () => useContext(Context);
const subscribe = () => () => {};
const local = () => ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);

export function LayoutProvider({ children, in3d, section, initial, onTargetAction }: { children: ReactNode; in3d: boolean; section: boolean; initial: Layout; onTargetAction: (id: LayoutId) => void }) {
  const isLocal = useSyncExternalStore(subscribe, local, () => false);
  const [layout, setLayout] = useState<Layout>(initial);
  const [saved, setSaved] = useState<Layout>(initial);
  const [editing, setEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const menu = useRef<HTMLElement>(null);
  const menuDrag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const controlsId = useId();
  const moveMenu = useCallback((x: number, y: number) => {
    const el = menu.current;
    if (!el) return;
    const next = { x: Math.max(8, Math.min(x, innerWidth - el.offsetWidth - 8)), y: Math.max(8, Math.min(y, innerHeight - el.offsetHeight - 8)) };
    setMenuPosition((old) => old?.x === next.x && old?.y === next.y ? old : next);
  }, []);
  const [selected, setSelected] = useState<LayoutId>("profile");
  const [mode, setMode] = useState<"translate" | "rotate" | "scale">("translate");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(layout) !== JSON.stringify(saved);
  const enabled = process.env.NODE_ENV === "development" && isLocal;
  const update = (id: LayoutId, t: Transform) => {
    setLayout((l) => {
      const next = { ...t, position: t.position.map((n) => isCamera(id) ? Number(n.toFixed(6)) : Math.min(20, Math.max(-20, n))) as Transform["position"], scale: clampScale(t.scale) };
      const previous = l[id] ?? (isCamera(id) ? { position: [...CAM.pos], scale: 1 } : identity);
      return JSON.stringify(previous) === JSON.stringify(next) ? l : { ...l, [id]: next };
    });
    setStatus("");
  };
  const select = (id: LayoutId) => { setSelected(id); onTargetAction(id); };
  const t = layout[selected] ?? identity;
  const monitor = isMonitor(selected); // sized by width/height, not uniform scale
  const view = section ? "section" : "home"; // follows what the scene shows (a section is open or not)
  const cameraEditing = enabled && in3d && editing && isCamera(selected) && viewOf(selected) === view;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const el = menu.current;
    if (!el || !menuPosition) return;
    const keepVisible = () => moveMenu(menuPosition.x, menuPosition.y);
    const observer = new ResizeObserver(keepVisible);
    observer.observe(el);
    window.addEventListener("resize", keepVisible);
    return () => { observer.disconnect(); window.removeEventListener("resize", keepVisible); };
  }, [menuPosition, moveMenu]);

  async function save() {
    setSaving(true); setStatus("");
    try {
      const response = await fetch("/api/dev-layout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(layout) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Save failed. Please retry.");
      setSaved(layout); setStatus("Saved to src/data/layout.json");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed. Please retry.");
    } finally { setSaving(false); }
  }

  return (
    <Context.Provider value={{ layout, editing, cameraEditing, section, selected, mode, select, update }}>
      {children}
      {enabled && (
        <aside ref={menu} className={`layout-editor${collapsed ? " is-collapsed" : ""}`} aria-label="Development layout editor"
          style={menuPosition ? { left: menuPosition.x, top: menuPosition.y, bottom: "auto" } : undefined}
          onKeyDown={(e) => e.stopPropagation()}>
          <div className="layout-editor-heading">
            <button type="button" className="layout-editor-move" aria-label="Move edit menu" title="Drag to move; use arrow keys when focused"
              onPointerDown={(e) => {
                if (e.button !== 0 || !menu.current) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                const rect = menu.current.getBoundingClientRect();
                menuDrag.current = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top };
              }} onPointerMove={(e) => {
                const d = menuDrag.current;
                if (d) moveMenu(d.left + e.clientX - d.x, d.top + e.clientY - d.y);
              }} onPointerUp={() => { menuDrag.current = null; }} onLostPointerCapture={() => { menuDrag.current = null; }}
              onKeyDown={(e) => {
                const delta = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
                if (!delta || !menu.current) return;
                e.preventDefault();
                const rect = menu.current.getBoundingClientRect();
                moveMenu(rect.left + delta[0], rect.top + delta[1]);
              }}>Move</button>
            {!collapsed && <button type="button" aria-expanded={editing} onClick={() => {
              if (!editing) select(in3d ? (section ? "monitor-open" : "profile") : "mobile-profile");
              setEditing(!editing);
            }}>{editing ? "Done editing" : "Edit layout"}</button>}
            <button type="button" aria-expanded={!collapsed} aria-controls={controlsId} onClick={() => setCollapsed(!collapsed)}>{collapsed ? "Expand" : "Collapse"}</button>
          </div>
          <div id={controlsId} hidden={collapsed}>
          {editing && <p>{dirty ? "Unsaved changes" : "Dev only"}</p>}
          {editing && (
            <fieldset disabled={saving}>
              {in3d && (
                <div className="layout-editor-actions" role="group" aria-label="Scene view">
                  <button aria-pressed={view === "home"} onClick={() => select(isCamera(selected) ? "camera-home" : "profile")}>Home view</button>
                  <button aria-pressed={view === "section"} onClick={() => select(isCamera(selected) ? "camera-section" : "monitor-open")}>Section view</button>
                </div>
              )}
              <label>Component
                <select value={selected} onChange={(e) => select(e.target.value as LayoutId)}>
                  {Object.entries(editableItems).filter(([id]) => in3d ? !id.startsWith("mobile-") && [view, "both"].includes(viewOf(id as LayoutId)) : id.startsWith("mobile-")).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                  {!Object.keys(editableItems).some((id) => id === selected && (in3d ? !id.startsWith("mobile-") && [view, "both"].includes(viewOf(id)) : id.startsWith("mobile-"))) && <option value={selected}>{editableItems[selected]} (other view)</option>}
                </select>
              </label>
              {isCamera(selected) ? <CameraFields id={selected} /> : <>
              <div className="layout-editor-actions">
                <button aria-pressed={mode === "translate"} onClick={() => setMode("translate")}>Move</button>
                {!selected.startsWith("mobile-") && <button aria-pressed={mode === "rotate"} onClick={() => setMode("rotate")}>Rotate</button>}
                <button aria-pressed={mode === "scale"} onClick={() => setMode("scale")}>Resize</button>
              </div>
              <p>{selected.startsWith("mobile-") ? "Drag the panel’s Move handle. Use Size below to resize." : monitor ? "Drag the arrows to move or the green ring to rotate horizontally. Use Width and Height below to resize independently." : "Drag the arrows to move, the green ring to rotate horizontally, or a Resize handle to scale evenly."}</p>
              <div className="layout-editor-coordinates">
                {(["X", "Y", "Z"] as const).slice(0, selected.startsWith("mobile-") ? 2 : 3).map((axis, i) => (
                  <label key={axis}>{axis} offset
                    <input type="number" min={-20} max={20} step={0.05} value={Number(t.position[i].toFixed(3))} onChange={(e) => {
                      const n = e.target.valueAsNumber;
                      if (!Number.isFinite(n)) return;
                      const position = [...t.position] as Transform["position"]; position[i] = n;
                      update(selected, { ...t, position });
                    }} />
                  </label>
                ))}
              </div>
              {!selected.startsWith("mobile-") && <label>Horizontal rotation (°)
                <input type="number" aria-label="Horizontal rotation" min={-180} max={180} step={1} value={Number(((t.rotation ?? 0) * 180 / Math.PI).toFixed(1))} onChange={(e) => {
                  const n = e.target.valueAsNumber;
                  if (Number.isFinite(n)) update(selected, { ...t, rotation: Math.min(180, Math.max(-180, n)) * Math.PI / 180 });
                }} />
              </label>}
              {monitor ? (["width", "height"] as const).map((axis) => (
                <label key={axis}>{axis === "width" ? "Width" : "Height"} · {Math.round((t[axis] ?? 1) * 100)}%
                  <input type="range" aria-label={`Monitor ${axis}`} min={0.25} max={3} step={0.05} value={t[axis] ?? 1} onChange={(e) => update(selected, { ...t, [axis]: Number(e.target.value) })} />
                </label>
              )) : <label>Size · {Math.round(t.scale * 100)}%
                <input type="range" aria-label="Component size" min={0.25} max={3} step={0.05} value={t.scale} onChange={(e) => update(selected, { ...t, scale: Number(e.target.value) })} />
              </label>}
              </>}
              <div className="layout-editor-actions">
                <button onClick={() => {
                  setLayout((l) => { const next = { ...l }; delete next[selected]; return next; }); setStatus("");
                }}>{isCamera(selected) ? "Reset view" : "Reset item"}</button>
                <button disabled={!dirty} onClick={() => { setLayout(saved); setStatus("Changes discarded."); }}>Discard</button>
              </div>
              <button className="layout-editor-save" disabled={!dirty || saving} onClick={save}>{saving ? "Saving…" : "Save to project"}</button>
              <p>Saved layouts ship with the site. Editing controls do not. Home and Section cameras are saved independently. Desktop and mobile panels have separate layouts.</p>
            </fieldset>
          )}
          <p role="status">{status || (!editing && dirty ? "Unsaved changes — reopen to save." : "")}</p>
          </div>
        </aside>
      )}
    </Context.Provider>
  );
}

function CameraFields({ id }: { id: LayoutId }) {
  const editor = useLayout()!;
  const position = editor.layout[id]?.position ?? CAM.pos;
  const spherical = new Spherical().setFromVector3(new Vector3().fromArray(position).sub(new Vector3(...CAM.at)));
  const values = { distance: spherical.radius, elevation: 90 - MathUtils.radToDeg(spherical.phi), azimuth: MathUtils.radToDeg(spherical.theta) };
  const labels = { distance: "Camera distance", elevation: "View elevation", azimuth: "View angle" };
  return (
    <>
      <p>Drag the room to orbit. Scroll or pinch to zoom. These sliders also work with arrow keys.</p>
      {(["distance", "elevation", "azimuth"] as const).map((axis) => (
        <label key={axis}>{labels[axis]} · {values[axis].toFixed(1)}{axis === "distance" ? "" : "°"}
          <input type="range" aria-label={labels[axis]} min={cameraLimits[axis][0]} max={cameraLimits[axis][1]} step={axis === "distance" ? 0.1 : 1} value={values[axis]} onChange={(e) => {
            const n = Number(e.target.value);
            const next = spherical.clone();
            if (axis === "distance") next.radius = n;
            else if (axis === "elevation") next.phi = MathUtils.degToRad(90 - n);
            else next.theta = MathUtils.degToRad(n);
            editor.update(id, { position: new Vector3().setFromSpherical(next).add(new Vector3(...CAM.at)).toArray(), scale: 1 });
          }} />
        </label>
      ))}
    </>
  );
}

/** Offset from each existing responsive/animated placement; preserves default layout when unset. */
export function Editable3D({ id, position = [0, 0, 0], children }: { id: LayoutId; position?: [number, number, number]; children: ReactNode }) {
  const editor = useLayout();
  const group = useRef<Group>(null);
  const viewId = idForView(id, !!editor?.section);
  const t = editor?.layout[viewId] ?? identity;
  const selected = editor?.editing && editor.selected === viewId;
  // The gizmo is a sibling of the offset group: nested inside it, the group's offset would be applied twice.
  return (
    <>
      <group position={position}>
        <group ref={group} position={t.position} rotation-y={t.rotation ?? 0} scale={t.scale}
          onClick={(e) => { if (editor?.editing && !editor.cameraEditing) { e.stopPropagation(); editor.select(viewId); } }}>
          {children}
        </group>
      </group>
      {selected && !(isMonitor(id) && editor.mode === "scale") && (
        <TransformControls object={group as React.RefObject<Group>} mode={editor.mode} space="world" size={0.8}
          showX={editor.mode !== "rotate"} showZ={editor.mode !== "rotate"}
          onObjectChange={() => {
            const g = group.current;
            if (!g || editor.mode !== "scale") return;
            // keep size uniform: follow whichever axis the drag moved furthest
            const s = [g.scale.x, g.scale.y, g.scale.z].reduce((a, b) => (Math.abs(b - t.scale) > Math.abs(a - t.scale) ? b : a));
            g.scale.setScalar(clampScale(s));
          }}
          onMouseUp={() => {
            if (!group.current) return;
            const g = group.current;
            // Read yaw from the quaternion: XYZ Euler angles fold back after ±90°.
            const q = g.quaternion;
            const rotation = Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.x * q.x));
            editor.update(viewId, { ...t, position: g.position.toArray(), scale: g.scale.x, rotation });
          }} />
      )}
    </>
  );
}

export function useFlatLayout(id?: LayoutId) {
  const editor = useLayout();
  const t = id ? editor?.layout[id] ?? identity : identity;
  const drag = useRef<{ x: number; y: number; t: Transform } | null>(null);
  const style: CSSProperties = id ? { translate: `${t.position[0] * 100}vw ${t.position[1] * 100}dvh`, scale: t.scale, transformOrigin: "top left" } : {};
  const handle = id && editor?.editing ? (
    <button className="layout-drag-handle" onPointerDown={(e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      editor.select(id); drag.current = { x: e.clientX, y: e.clientY, t };
    }} onPointerMove={(e) => {
      if (!drag.current) return;
      const d = drag.current;
      editor.update(id, { ...d.t, position: [d.t.position[0] + (e.clientX - d.x) / innerWidth, d.t.position[1] + (e.clientY - d.y) / innerHeight, 0] });
    }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
      onKeyDown={(e) => {
        const axis = ["ArrowLeft", "ArrowRight"].includes(e.key) ? 0 : ["ArrowUp", "ArrowDown"].includes(e.key) ? 1 : -1;
        if (axis === -1) return;
        e.preventDefault(); e.stopPropagation();
        const position = [...t.position] as Transform["position"];
        position[axis] += ["ArrowLeft", "ArrowUp"].includes(e.key) ? -0.01 : 0.01;
        editor.update(id, { ...t, position });
      }}>Move {editableItems[id]}</button>
  ) : null;
  return { style, handle };
}
