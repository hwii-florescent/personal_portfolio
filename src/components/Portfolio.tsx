"use client";

import { useCallback, useState, useSyncExternalStore, type CSSProperties } from "react";
import { lines, sections, type SectionId } from "@/data/sections";
import { themes, type ThemeId } from "@/data/themes";
import { SectionBody } from "./Sections";
import SceneLoader from "./SceneLoader";
import Boot from "./Boot";
import { AiLine, Overview, TopBar } from "./Hud";

const mq = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const m = matchMedia(mq);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

export default function Portfolio() {
  const [theme, setTheme] = useState<ThemeId>("jarvis");
  const [active, setActive] = useState<SectionId | null>(null);
  const [booted, setBooted] = useState(false);
  const [tick, setTick] = useState(0); // bump to re-roll the AI line
  const reduced = useSyncExternalStore(subscribe, () => matchMedia(mq).matches, () => false);

  const p = themes[theme];
  const voice = lines[theme];
  const select = useCallback((id: SectionId | null) => { setActive(id); setTick((t) => t + 1); }, []);
  const done = useCallback(() => setBooted(true), []);

  const pool = voice[active ?? "idle"];
  const line = pool[tick % pool.length];
  const activeSection = sections.find((s) => s.id === active);

  const vars = { "--bg": p.bg, "--primary": p.primary, "--gold": p.gold, "--accent": p.accent } as CSSProperties;

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-bg"
      style={vars}
      onKeyDown={(e) => e.key === "Escape" && select(null)}
    >
      <div className="absolute inset-0">
        <SceneLoader p={p} active={active} onSelect={select} motion={reduced ? 0 : 1} />
      </div>
      <div className="vignette pointer-events-none absolute inset-0" />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />

      <TopBar ai={p.ai} themeLabel={p.ai} onToggleTheme={() => setTheme((t) => (t === "jarvis" ? "spidey" : "jarvis"))} />

      {!active && <Overview />}

      {activeSection && (
        <section
          className="hud-card pointer-events-auto absolute inset-x-3 bottom-28 top-14 overflow-y-auto p-6 md:inset-x-auto md:right-8 md:top-20 md:w-[min(560px,45vw)]"
          aria-label={activeSection.label}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-hud text-xl font-bold uppercase tracking-widest text-gold">{activeSection.label}</h2>
            <button onClick={() => select(null)} className="font-mono text-xs text-accent hover:text-gold">[ ESC ] CLOSE</button>
          </div>
          <SectionBody id={activeSection.id} />
        </section>
      )}

      <AiLine text={line} />

      <nav className="pointer-events-auto absolute inset-x-0 bottom-4 flex flex-wrap justify-center gap-2 px-4" aria-label="Sections">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => select(active === s.id ? null : s.id)}
            aria-pressed={active === s.id}
            className={`border px-3 py-1.5 font-hud text-[10px] uppercase tracking-[0.2em] ${
              active === s.id ? "border-gold bg-gold/10 text-gold" : "border-accent/40 text-accent hover:bg-accent/10"
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {!booted && <Boot ai={p.ai} onDone={done} />}
    </div>
  );
}
