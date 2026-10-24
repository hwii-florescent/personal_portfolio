"use client";

import { useEffect } from "react";
import { LAST, TYPE_MS } from "@/data/intro";

/** Opening controls. The speech itself is a 3D hologram over the table (Speech in Scene.tsx); this keeps the timing, keys and a screen-reader copy. */
export default function Intro({ step, text, reduced, onNextAction, onDoneAction, onBeginAction }: {
  step: number; text: string; reduced: boolean; onNextAction: () => void; onDoneAction: () => void; onBeginAction: () => void;
}) {
  // Auto-advance after the line has been typed and had time to be read; Next / Enter / Space / → skip ahead.
  useEffect(() => {
    if (step === LAST) return;
    const id = setTimeout(onNextAction, reduced ? 3500 : text.length * (TYPE_MS + 45) + 1200);
    return () => clearTimeout(id);
  }, [step, text, reduced, onNextAction]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onDoneAction();
      if (e.target instanceof HTMLElement && e.target.closest("button, a")) return;
      if (["Enter", " ", "ArrowRight"].includes(e.key)) { e.preventDefault(); onNextAction(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNextAction, onDoneAction]);

  return (
    <div role="region" aria-label="Introduction" className="pointer-events-none absolute inset-x-0 bottom-28 z-40 sm:bottom-16 flex justify-center">
      <span className="sr-only" aria-live="polite">{text}</span>
      <div className="pointer-events-auto flex max-w-[calc(100%-32px)] gap-5 text-center font-mono text-xs text-accent">
        {step < LAST && <button onClick={onNextAction} className="hover:text-gold">[ NEXT ▸ ]</button>}
        <button onClick={step === LAST ? onBeginAction : onDoneAction} className="text-muted hover:text-gold">[ {step === LAST ? "scroll to begin or click on a section you are interested in" : "SKIP"} ]</button>
      </div>
    </div>
  );
}
