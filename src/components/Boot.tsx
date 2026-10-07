"use client";

import { useEffect, useState } from "react";

const checks = ["ARC REACTOR ........ ONLINE", "NEURAL INTERFACE .... SYNCED", "PORTFOLIO DATA ...... LOADED"];

export default function Boot({ ai, onDone }: { ai: string; onDone: () => void }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPct((p) => Math.min(100, p + 4)), 60);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (pct < 100) return;
    const t = setTimeout(onDone, 300);
    return () => clearTimeout(t);
  }, [pct, onDone]);
  useEffect(() => {
    window.addEventListener("keydown", onDone);
    return () => window.removeEventListener("keydown", onDone);
  }, [onDone]);

  return (
    <div
      role="status"
      onClick={onDone}
      className="absolute inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-bg font-mono text-xs text-accent"
    >
      <p className="font-hud text-3xl font-black tracking-[0.4em] text-primary sm:text-5xl">{ai}</p>
      <div className="mt-8 space-y-1">
        {checks.map((c, i) => (
          <p key={c} className={pct > (i + 1) * 25 ? "opacity-100" : "opacity-0"}>▸ {c}</p>
        ))}
      </div>
      <div className="mt-8 h-1 w-64 bg-accent/20">
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2">{pct}%</p>
      <p className="mt-10 text-muted">[ CLICK OR PRESS ANY KEY TO SKIP ]</p>
    </div>
  );
}
