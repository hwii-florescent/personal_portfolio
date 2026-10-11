"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { lines, sections, type SectionId } from "@/data/sections";
import { themes, type ThemeId } from "@/data/themes";
import { SectionBody } from "./Sections";
import PanelShell from "./PanelShell";
import SceneLoader from "./SceneLoader";
import Boot from "./Boot";
import { AiLine, Overview, TopBar } from "./Hud";
import { LayoutProvider } from "./LayoutEditor";
import { MonitorFace } from "./HtmlPanel";
import { viewOf, type Layout } from "@/data/layout";

const mq = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const m = matchMedia(mq);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

const wide = "(min-width: 768px)"; // md: the panel lives in the 3D scene; below it is a flat overlay
const subscribeWide = (cb: () => void) => {
  const m = matchMedia(wide);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

export default function Portfolio({ layout }: { layout: Layout }) {
  const in3d = useSyncExternalStore(subscribeWide, () => matchMedia(wide).matches, () => false);
  const [theme, setTheme] = useState<ThemeId>("jarvis");
  const [active, setActive] = useState<SectionId | null>(null);
  const [booted, setBooted] = useState(false);
  const [tick, setTick] = useState(0); // bump to re-roll the AI line
  const reduced = useSyncExternalStore(subscribe, () => matchMedia(mq).matches, () => false);

  const p = themes[theme];
  const voice = lines[theme];
  const faceRef = useRef<HTMLDivElement>(null); // the 3D monitor's DOM, placed over the canvas by the scene each frame
  const opener = useRef<HTMLElement | null>(null); // what had focus before the panel opened, to restore on close
  const select = useCallback((id: SectionId | null) => {
    if (id && !opener.current) opener.current = document.activeElement as HTMLElement | null;
    setActive(id);
    setTick((t) => t + 1);
  }, []);
  const done = useCallback(() => setBooted(true), []);

  const pool = voice[active ?? "idle"];
  const line = pool[tick % pool.length];
  const activeSection = sections.find((s) => s.id === active);

  // The panel focuses itself on mount (PanelShell); on close focus returns to the opener (a11y).
  useEffect(() => {
    if (!active) { opener.current?.focus({ preventScroll: true }); opener.current = null; }
  }, [active]);

  const vars = { "--bg": p.bg, "--primary": p.primary, "--gold": p.gold, "--accent": p.accent } as CSSProperties;

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-bg"
      style={vars}
      onKeyDown={(e) => e.key === "Escape" && select(null)}
    >
      <LayoutProvider in3d={in3d} section={active !== null} initial={layout} onTargetAction={(id) => {
        // picking an item puts the scene in the view that shows it (home or a section open)
        if (viewOf(id) === "home" || id === "mobile-profile") select(null);
        else if ((id === "mobile-section" || viewOf(id) === "section") && !active) select("experience");
      }}>
      <div className="absolute inset-0">
        <SceneLoader p={p} active={active} onSelectAction={select} motion={reduced ? 0 : 1} panel3d={in3d} faceRef={faceRef} />
        {in3d && <MonitorFace ref={faceRef} active={active} onCloseAction={() => select(null)} />}
      </div>
      <div className="vignette pointer-events-none absolute inset-0" />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />

      <TopBar ai={p.ai} themeLabel={p.ai} onToggleThemeAction={() => setTheme((t) => (t === "jarvis" ? "spidey" : "jarvis"))} />

      {!active && !in3d && <Overview />}

      {activeSection && !in3d && (
        <PanelShell
          layoutId="mobile-section"
          label={activeSection.label}
          onClose={() => select(null)}
          h="70dvh"
          className="pointer-events-auto inset-x-3 top-14"
        >
          <SectionBody id={activeSection.id} />
        </PanelShell>
      )}

      <AiLine text={line} />

      <nav className="pointer-events-auto absolute inset-x-0 bottom-4 flex flex-wrap justify-center gap-2 px-4" aria-label="Sections">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => select(active === s.id ? null : s.id)}
            aria-pressed={active === s.id}
            className={`border px-2 py-1.5 font-hud text-[10px] sm:px-3 uppercase tracking-[0.2em] ${
              active === s.id ? "border-gold bg-gold/10 text-gold" : "border-accent/40 text-accent hover:bg-accent/10"
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {!booted && <Boot ai={p.ai} onDoneAction={done} />}
      </LayoutProvider>
    </div>
  );
}
