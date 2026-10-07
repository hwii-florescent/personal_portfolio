"use client";

import { useEffect, useState } from "react";
import { portfolio as p, resumeUrl, stats } from "@/data/portfolio";
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

export function TopBar({ ai, themeLabel, onToggleTheme }: { ai: string; themeLabel: string; onToggleTheme: () => void }) {
  const clock = useClock();
  return (
    <div className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between border-b border-accent/20 bg-bg/80 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-accent">
      <span>{p.name} {"// Portfolio"}</span>
      <span className="hidden sm:inline">{clock}</span>
      <span className="flex items-center gap-4">
        <button onClick={onToggleTheme} className="border border-accent/40 px-2 py-0.5 hover:bg-accent/10" aria-label={`Switch AI, currently ${ai}`}>
          AI: {themeLabel}
        </button>
        <a href={resumeUrl} className="hover:text-gold">Resume ↓</a>
      </span>
    </div>
  );
}

/** Home screen readouts: shown only before a section is opened. */
export function Overview() {
  const role = useRole();
  const current = p.experience[0];
  return (
    <>
      <section className="hud-card pointer-events-auto absolute left-4 top-14 max-w-sm p-5 sm:left-8 sm:top-20" aria-label="Overview">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Subject profile</p>
        <h2 className="mt-2 font-hud text-3xl font-black uppercase leading-none text-fg sm:text-4xl">{p.name}</h2>
        <p className="mt-2 h-5 font-mono text-sm text-accent"><Typed key={role} text={role} speed={35} /></p>
        <p className="mt-4 text-sm text-muted">{p.bio}</p>
        <p className="mt-4 font-mono text-[11px] text-muted">
          {p.education.school} · {p.education.degree} · {p.education.grad}
        </p>
      </section>

      <section className="hud-card pointer-events-auto absolute right-8 top-20 hidden w-72 p-5 lg:block" aria-label="Telemetry">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Live telemetry</p>
        <dl className="mt-3 grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dd className="font-hud text-2xl font-bold text-gold">{s.value}</dd>
              <dt className="font-mono text-[9px] uppercase tracking-wider text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-5 border-t border-accent/20 pt-3 font-mono text-[11px] text-accent">
          ● STATUS: {current.role} @ {current.company}
        </p>
      </section>
    </>
  );
}

export function AiLine({ text }: { text: string }) {
  return (
    <p className="pointer-events-none absolute inset-x-0 bottom-28 px-4 sm:bottom-16 text-center font-mono text-xs uppercase tracking-widest text-accent sm:text-sm" aria-live="polite">
      ▸ <Typed key={text} text={text} />
    </p>
  );
}
