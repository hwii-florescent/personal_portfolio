"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { lines, sections, type ChapterId } from "@/data/sections";
import { themes, type ThemeId } from "@/data/themes";
import ResumeMonitor from "./ResumeMonitor";
import SceneLoader from "./SceneLoader";
import Intro from "./Intro";
import { introLines, LAST } from "@/data/intro";
import { AiLine, Overview, TopBar } from "./Hud";
import { LayoutProvider, useLayout } from "./LayoutEditor";
import { FLIGHT, MonitorFace } from "./HtmlPanel";
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

/** Native scroll triggers the existing monitor; the original fixed scene never moves or resizes. */
function ScrollEntry({ active, enabled, onOpenAction, blockedUntil }: { active: boolean; enabled: boolean; onOpenAction: () => void; blockedUntil: RefObject<number> }) {
  const editing = useLayout()?.editing;
  useLayoutEffect(() => {
    const html = document.documentElement;
    const previous = html.style.scrollbarWidth;
    const restoration = history.scrollRestoration;
    html.style.scrollbarWidth = "none";
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => { html.style.scrollbarWidth = previous; history.scrollRestoration = restoration; };
  }, []);
  useLayoutEffect(() => {
    const html = document.documentElement;
    const previous = html.style.overflow;
    window.scrollTo(0, 0);
    if (active || editing) html.style.overflow = "hidden";
    const enter = () => {
      if (window.scrollY < 20) return;
      if (performance.now() < blockedUntil.current) {
        blockedUntil.current = Math.max(blockedUntil.current, performance.now() + 300);
        window.scrollTo(0, 0);
      } else onOpenAction();
    };
    if (!active && !editing && enabled) window.addEventListener("scroll", enter, { passive: true });
    return () => { window.removeEventListener("scroll", enter); html.style.overflow = previous; };
  }, [active, enabled, editing, onOpenAction, blockedUntil]);
  return !active && !editing && enabled ? <div data-scroll-entry aria-hidden="true" style={{ height: "calc(100svh + 96px)", pointerEvents: "none" }} /> : null;
}

export default function Portfolio({ layout }: { layout: Layout }) {
  const in3d = useSyncExternalStore(subscribeWide, () => matchMedia(wide).matches, () => false);
  const [theme, setTheme] = useState<ThemeId>("jarvis");
  const [active, setActive] = useState<ChapterId | null>(null);
  const [intro, setIntro] = useState(true); // opening sequence at the table, before the free-look portfolio
  const [ready, setReady] = useState(false); // scene loaded: fade it in, then the intro starts (no loading screen)
  const onReady = useCallback(() => setReady(true), []);
  const showIntro = intro && ready;
  const [step, setStep] = useState(0);
  const next = useCallback(() => setStep((s) => Math.min(s + 1, LAST)), []);
  const holograms = !intro || step === LAST; // the holograms appear with the last intro line
  useEffect(() => { const t = setTimeout(() => setReady(true), 10000); return () => clearTimeout(t); }, []); // fallback if WebGL never comes up
  const [tick, setTick] = useState(0); // bump to re-roll the AI line
  const reduced = useSyncExternalStore(subscribe, () => matchMedia(mq).matches, () => false);

  const p = themes[theme];
  const spoken = introLines(p.ai)[step];
  const voice = lines[theme];
  const faceRef = useRef<HTMLDivElement>(null); // the 3D monitor's DOM, placed over the canvas by the scene each frame
  const opener = useRef<HTMLElement | null>(null); // what had focus before the panel opened, to restore on close
  const root = useRef<HTMLDivElement>(null);
  const blockedUntil = useRef(0);
  const select = useCallback((id: ChapterId | null) => {
    if (id && !opener.current) opener.current = document.activeElement as HTMLElement | null;
    if (!id) blockedUntil.current = performance.now() + (reduced ? 0 : FLIGHT * 1000) + 300;
    window.scrollTo(0, 0);
    setActive(id);
    if (id) setIntro(false);
    setTick((t) => t + 1);
  }, [reduced]);
  const openTop = useCallback(() => select("about"), [select]);
  const endIntro = useCallback(() => setIntro(false), []);

  const pool = voice[active === "about" || active === "education" ? "idle" : active ?? "idle"];
  const line = pool[tick % pool.length];

  // The panel focuses itself on mount (PanelShell); on close focus returns to the opener (a11y).
  useEffect(() => {
    if (!active && opener.current) {
      const target = opener.current.isConnected && opener.current !== document.body ? opener.current : root.current?.querySelector<HTMLElement>('nav[aria-label="Sections"] button');
      target?.focus({ preventScroll: true });
      opener.current = null;
    }
  }, [active]);

  const vars = { "--bg": p.bg, "--primary": p.primary, "--gold": p.gold, "--accent": p.accent } as CSSProperties;

  return (
    <div
      ref={root} className="portfolio-root" data-theme={theme} data-view={active ? "reading" : "home"}
      style={vars}
      onKeyDown={(e) => e.key === "Escape" && !intro && select(null)}
    >
      <LayoutProvider in3d={in3d} section={active !== null} initial={layout} onTargetAction={(id) => {
        // picking an item puts the scene in the view that shows it (home or a section open)
        if (viewOf(id) === "home" || id === "mobile-profile") select(null);
        else if ((id === "mobile-section" || viewOf(id) === "section") && !active) select("experience");
      }}>
      <div className="fixed inset-0 overflow-hidden bg-bg">
      <div className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${ready ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute inset-0">
          <SceneLoader p={p} active={active} onSelectAction={select} motion={reduced ? 0 : 1} panel3d={in3d} faceRef={faceRef} onReadyAction={onReady} speech={showIntro ? spoken : null} holograms={holograms} />
          {in3d && holograms && <MonitorFace ref={faceRef} active={active} onCloseAction={() => select(null)} />}
        </div>
        <div className="vignette pointer-events-none absolute inset-0" />
        <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />
      </div>

      <TopBar ai={p.ai} themeLabel={p.ai} onToggleThemeAction={() => setTheme((t) => (t === "jarvis" ? "spidey" : "jarvis"))} />

      {!active && !in3d && holograms && <Overview />}

      {active && !in3d && (
        <ResumeMonitor active={active} onCloseAction={() => select(null)} layoutId="mobile-section" className="mobile-resume" />
      )}

      {!intro && !active && <AiLine text={line} />}

      {holograms && <nav style={{ display: active ? "none" : undefined }} className="pointer-events-auto absolute inset-x-0 bottom-4 flex flex-wrap justify-center gap-2 px-4" aria-label="Sections">
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
      </nav>}

      {showIntro && <Intro step={step} text={spoken} reduced={reduced} onNextAction={next} onDoneAction={endIntro} onBeginAction={openTop} />}
      </div>
      <ScrollEntry active={active !== null} enabled={holograms} onOpenAction={openTop} blockedUntil={blockedUntil} />
      </LayoutProvider>
    </div>
  );
}
