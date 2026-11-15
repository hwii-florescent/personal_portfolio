"use client";

import { useEffect, useRef } from "react";
import { flipPath } from "@/lib/flip";
import { portfolio as p } from "@/data/portfolio";

type Line = "cmd" | "board" | "note";
// The queue, as a game would run it: [start in ms, where it shows, text, optional beat set on the card]. `board` flips on
// the split-flap; `cmd` and `note` are typed. The name card that follows is part of the flight (see Site.tsx).
const SCRIPT: readonly (readonly [number, Line, string, string?])[] = [
  [200, "cmd", "> locating nearest server"],
  [800, "board", "SAN FRANCISCO"],
  [1000, "note", "REGION NA-WEST · PING 12 MS"],
  [2400, "cmd", "> searching for a match"],
  [2500, "note", "IN QUEUE · 1 PLAYER READY"],
  [3100, "board", "MATCH FOUND", "found"],
  [3400, "note", "ACCEPTED · LOADING ARENA"],
  [4500, "board", "WELCOME TO THE ARENA"],
];
const END = 6400; // when the last line has had its moment: the flight may begin
const COLS = Math.max(...SCRIPT.filter((s) => s[1] === "board").map((s) => s[2].length)); // a real board has a fixed number of tiles
const STEP = 120, STAGGER = 18; // ms for one flap to fall; ms between one tile starting and the next
const TYPE = { cmd: 24, note: 14 }; // ms per typed character
const SHOWN = 100; // the most one frame may move the script's clock, in ms; under STEP, so no flap is ever skipped

// A tile is four halves: the static top and bottom, and the two flaps that swing over them (the old top falls, the new bottom lands).
const tile = () => {
  const el = document.createElement("span");
  el.innerHTML = '<i class="t"><b></b></i><i class="m"><b></b></i><i class="m"><b></b></i><i class="t"><b></b></i>';
  const [sTop, sBot, fBot, fTop] = [...el.children] as HTMLElement[];
  return { el, sTop, sBot, fBot, fTop, cur: " ", path: [] as string[], start: 0, shown: 0 };
};
type Tile = ReturnType<typeof tile>;
const paint = (half: HTMLElement, ch: string) => { half.firstElementChild!.textContent = ch; };
const flap = (tl: Tile, from: string, to: string) => {
  paint(tl.sTop, to); paint(tl.sBot, from); paint(tl.fTop, from); paint(tl.fBot, to);
  [tl.fTop, tl.fBot].forEach((h) => h.getAnimations().forEach((a) => a.cancel()));
  tl.fTop.animate({ transform: ["rotateX(0)", "rotateX(-90deg)"] }, { duration: STEP / 2, easing: "ease-in", fill: "forwards" });
  tl.fBot.animate({ transform: ["rotateX(90deg)", "rotateX(0)"] }, { duration: STEP / 2, delay: STEP / 2, easing: "ease-out", fill: "both" });
};

/** Rest a tile on `ch`: all four halves show it and no flap is mid-air. */
const settle = (tl: Tile, ch: string) => {
  tl.cur = ch;
  [tl.sTop, tl.sBot, tl.fTop, tl.fBot].forEach((h) => paint(h, ch));
  [tl.fTop, tl.fBot].forEach((h) => h.getAnimations().forEach((a) => a.cancel()));
};

/**
 * The 2D half of the intro: the opening card (a matchmaking terminal on black), the eyelids that open on the lift the
 * scene shows, and the name card. `onDone` fires when the queue has run and the flight may begin.
 */
export default function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current, html = document.documentElement;
    if (!el || html.dataset.intro !== "open") return;
    const slot = (name: Line) => el.querySelector<HTMLElement>(`[data-slot=${name}]`)!;
    const tiles = Array.from({ length: COLS }, tile);
    const typing: Partial<Record<"cmd" | "note", { text: string; at: number }>> = {};
    let t = 0, last = 0, next = 0, raf = 0, queued = false;
    slot("cmd").replaceChildren();
    slot("note").replaceChildren();
    slot("board").style.setProperty("--n", String(COLS));
    slot("board").replaceChildren(...tiles.map((tl) => tl.el));
    delete el.dataset.beat;

    const frame = (now: number) => {
      if (html.dataset.intro === undefined) return; // skipped, or over
      if (!queued) raf = requestAnimationFrame(frame); // the card has nothing left to do once the flight has been called
      // The script's clock counts only time that was drawn. A page loaded out of sight (the address bar's prerender, a
      // background tab) or stalled gets no frames, and by the wall clock it would come back with its beats already spent.
      t += Math.min(now - (last || now), SHOWN);
      last = now;
      while (!queued && next < SCRIPT.length && SCRIPT[next][0] <= t) {
        const [, name, text, beat] = SCRIPT[next++];
        if (beat) el.dataset.beat = beat;
        if (name === "board") {
          const word = text.padStart((COLS + text.length) >> 1).padEnd(COLS); // centred
          tiles.forEach((tl, i) => { tl.path = flipPath(tl.cur, word[i], i); tl.start = t + i * STAGGER; tl.shown = 0; });
        } else typing[name] = { text, at: t };
      }
      for (const name of ["cmd", "note"] as const) {
        const a = typing[name];
        if (!a) continue;
        slot(name).textContent = a.text.slice(0, Math.floor((t - a.at) / TYPE[name]));
        if ((t - a.at) / TYPE[name] >= a.text.length) delete typing[name];
      }
      for (const tl of tiles) {
        if (!tl.path.length || t < tl.start) continue;
        const begun = Math.min(Math.floor((t - tl.start) / STEP) + 1, tl.path.length);
        if (begun > tl.shown) { flap(tl, begun > 1 ? tl.path[begun - 2] : tl.cur, tl.path[begun - 1]); tl.shown = begun; }
        if (t - tl.start >= tl.path.length * STEP) { // the last flap has landed: rest on it
          settle(tl, tl.path[tl.path.length - 1]);
          tl.path = [];
        }
      }
      if (!queued && t >= END) { queued = true; onDone(); }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div className="intro" ref={root} aria-hidden="true">
      <div className="intro-focus" />
      <div className="intro-lid" />
      <div className="intro-lid" data-low />
      <div className="intro-term">
        <p className="intro-cmd" data-slot="cmd" />
        <p className="intro-board" data-slot="board" />
        <p className="intro-note" data-slot="note" />
      </div>
      <div className="intro-title">
        <p className="intro-kicker">Welcome to</p>
        <p className="intro-name">{p.name}’s <em>Portfolio</em></p>
      </div>
      <small className="intro-skip">Tap or press any key to skip</small>
    </div>
  );
}
