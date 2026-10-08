"use client";

import { useEffect, useState } from "react";
import { portfolio as p, resumeUrl, stats } from "@/data/portfolio";
import PanelShell from "./PanelShell";
import Typed from "./Typed";

function useClock() {
  const [t, setT] = useState("--:--:--");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-GB"));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function useRole() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % p.roles.length), 3000);
    return () => clearInterval(id);
  }, []);
  return p.roles[i];
}

export function TopBar({ ai, themeLabel, onToggleThemeAction }: { ai: string; themeLabel: string; onToggleThemeAction: () => void }) {
  const clock = useClock();
  return (
    <div className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between border-b border-accent/20 bg-bg/80 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-accent">
      <span className="whitespace-nowrap">{p.name}<span className="hidden sm:inline">{" // Portfolio"}</span></span>
      <span className="hidden sm:inline">{clock}</span>
      <span className="flex items-center gap-4">
        <button onClick={onToggleThemeAction} className="border border-accent/40 px-2 py-0.5 hover:bg-accent/10" aria-label={`Switch AI, currently ${ai}`}>
          AI: {themeLabel}
        </button>
        <a href={resumeUrl} className="hover:text-gold">Resume ↓</a>
      </span>
    </div>
  );
}

export function ProfileBody({ full }: { full?: boolean }) {
  const role = useRole();
  const current = p.experience[0];
  return (
    <>
      <h3 className={`font-hud font-black uppercase leading-none text-fg ${full ? "text-3xl" : "text-3xl sm:text-4xl"}`}>{p.name}</h3>
      <p className="mt-2 h-5 font-mono text-sm text-accent"><Typed key={role} text={role} speed={35} /></p>
      <p className={`mt-4 text-sm text-muted ${full ? "" : "line-clamp-3"}`}>{p.bio}</p>
      <p className="mt-4 font-mono text-[11px] text-muted">
        {p.education.school} · {p.education.degree} · {p.education.grad}
      </p>
      {full && <p className="mt-3 font-mono text-[11px] text-accent">● STATUS: {current.role} @ {current.company}</p>}
    </>
  );
}

export function TelemetryBody() {
  const current = p.experience[0];
  return (
    <div className="flex h-full flex-col">
      <table className="w-full flex-1 border-collapse border border-accent/30 text-left">
        <tbody>
          {stats.map((s) => (
            <tr key={s.label} className="border-b border-accent/20 last:border-b-0">
              <th scope="row" className="border-r border-accent/20 px-3 py-2 font-mono text-[10px] font-normal uppercase tracking-wider text-muted">{s.label}</th>
              <td className="px-3 py-2 text-right font-hud text-2xl font-bold text-gold">{s.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 font-mono text-[11px] text-accent">● STATUS: {current.role} @ {current.company}</p>
    </div>
  );
}

/** Mobile home screen: just the profile card, flat. On md+ both cards live in the 3D scene (HomePanels). */
export function Overview() {
  return (
    <PanelShell layoutId="mobile-profile" label="Subject profile" w={320} className="pointer-events-auto left-4 top-14 [--origin:left_center] [--tilt:8deg]">
      <ProfileBody />
    </PanelShell>
  );
}

export function AiLine({ text }: { text: string }) {
  return (
    <p className="pointer-events-none absolute inset-x-0 bottom-28 px-4 sm:bottom-16 text-center font-mono text-xs uppercase tracking-widest text-accent sm:text-sm" aria-live="polite">
      ▸ <Typed key={text} text={text} />
    </p>
  );
}
