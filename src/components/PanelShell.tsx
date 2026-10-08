import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { PANEL } from "@/data/doc";
import type { LayoutId } from "@/data/layout";
import { useFlatLayout } from "./LayoutEditor";

/**
 * The one holographic panel: fixed gold header, thin scrolling body.
 * Size via `w`/`h` (px or any CSS length; omit h to fit content), position/tilt via className
 * (`[--tilt:8deg] [--origin:left_center]` override the default right-edge tilt).
 * With `onClose` it is a dialog: shows [ESC] CLOSE and takes focus on mount. Without it, a passive readout.
 * Used for section panels (flat in Portfolio, in 3D in HtmlPanel) and the home-screen cards (Hud).
 */
export default function PanelShell({ label, onClose, w, h, className = "", style, layoutId, children }: {
  label: string; onClose?: () => void; w?: number | string; h?: number | string;
  className?: string; style?: CSSProperties; layoutId?: LayoutId; children: ReactNode;
}) {
  const flat = useFlatLayout(layoutId);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { if (onClose) ref.current?.focus({ preventScroll: true }); }, [onClose]);
  return (
    <section ref={ref} tabIndex={onClose ? -1 : undefined} className={`holo-panel outline-none ${className}`} style={{ width: w, height: h, ...style, ...flat.style }} aria-label={label}>
      {flat.handle}
      <div className="holo-scan" />
      <div className="flex shrink-0 items-center justify-between" style={{ height: PANEL.header, padding: `${PANEL.pad}px ${PANEL.pad}px 0` }}>
        <h2 className="font-hud text-xl font-bold uppercase tracking-widest text-gold">{label}</h2>
        {onClose && <button onClick={onClose} className="font-mono text-xs text-accent hover:text-gold">[ ESC ] CLOSE</button>}
      </div>
      <div className="holo-scroll min-h-0 flex-1 overflow-y-auto" style={{ padding: `0 ${PANEL.pad}px ${PANEL.pad}px` }}>{children}</div>
    </section>
  );
}
