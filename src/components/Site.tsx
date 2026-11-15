"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { chapters, clock, DAWN, DUSK, INTRO, journeyAt, phase, progress } from "@/lib/journey";
import { live } from "@/lib/live";
import { portfolio as p, resumeUrl } from "@/data/portfolio";
import Intro from "./Intro";

// three.js needs the browser, and the page must read fine before (or without) it.
const Scene = dynamic(() => import("@/scene/Scene"), { ssr: false });

/** No WebGL, a lost context, a driver bug: the sky falls back to the CSS gradient and the résumé carries on. */
class SceneBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.warn("Scene disabled:", error); this.props.onFail(); }
  render() { return this.state.failed ? null : this.props.children; }
}

const nav = chapters.slice(1); // the hero has no link of its own
const SKIP = ["keydown", "pointerdown", "wheel", "touchstart"] as const;
// The intro's beats, in milliseconds: the flight (eyes open in the lift, the ride, out into the room, the room being built) takes this long, and if the queue (see Intro.tsx) and the scene have not
// both come up by GIVE_UP the page is shown without it.
const FLIGHT = INTRO.seconds * 1000, GIVE_UP = 10000;

export default function Site({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [sceneOnly, setSceneOnly] = useState(false);
  const [hour, setHour] = useState<number>(DUSK); // only the scene-only slider reads this
  const main = useRef<HTMLElement>(null);
  const time = useRef<HTMLTimeElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const toggle = useRef<HTMLButtonElement>(null);
  const sceneUp = useRef(false);
  const queued = useRef(false); // the intro's matchmaking terminal has run its course
  const sceneDown = useRef(false); // no WebGL, or the scene threw: the intro has nothing to fly into
  const onFail = useCallback(() => { sceneDown.current = true; }, []);
  const onReady = useCallback(() => { sceneUp.current = true; setReady(true); }, []);
  const onQueued = useCallback(() => { queued.current = true; }, []);

  const show = useCallback((h: number) => {
    if (time.current) time.current.textContent = clock(h);
    if (label.current) label.current.textContent = phase(h);
  }, []);

  // Scroll, pointer and motion preference feed the scene through `live`; the header clock is written directly.
  useEffect(() => {
    const el = main.current;
    if (!el) return;
    let tops: number[] = [], raf = 0;
    const measure = () => { tops = chapters.map((c) => (document.getElementById(c.id)?.getBoundingClientRect().top ?? 0) + scrollY); };
    const update = () => {
      raf = 0;
      live.u = progress(scrollY, tops, innerHeight);
      live.touched = performance.now();
      if (live.scrub === null) show(journeyAt(live.u).hour);
      const current = Math.floor(live.u + 1e-3) - 1;
      links.current.forEach((a, i) => (i === current ? a?.setAttribute("aria-current", "true") : a?.removeAttribute("aria-current")));
    };
    const onScroll = () => { raf ||= requestAnimationFrame(update); };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      live.pointerX = (e.clientX / innerWidth) * 2 - 1;
      live.pointerY = (e.clientY / innerHeight) * 2 - 1;
      live.touched = performance.now();
    };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => { live.motion = !reduced.matches; live.touched = performance.now(); };
    const sizes = new ResizeObserver(() => { measure(); update(); }); // also fires when fonts land and the layout settles
    sizes.observe(el);
    onMotion();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onPointer, { passive: true });
    reduced.addEventListener("change", onMotion);
    return () => {
      sizes.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onPointer);
      reduced.removeEventListener("change", onMotion);
    };
  }, [show]);

  // The intro, when the script in layout.tsx asked for one: a matchmaking terminal on black (San Francisco, queue, match
  // found, welcome to the arena; long enough for the scene to come up and compile behind it), then the eyes open in a
  // lift that rises to the top floor, its doors part on the skeleton of the room, the camera walks out to see all of it
  // and the room is built around it, with the name card over it. Any key, click, wheel or touch ends it at once.
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro === undefined) return;
    if (scrollY > 4) { delete root.dataset.intro; return; } // restored half way down the page: nothing to introduce
    let raf = 0, flight = 0, t0 = 0; // t0: the first frame drawn. A page loaded out of sight has not been waiting until then.
    const end = () => {
      cancelAnimationFrame(raf);
      SKIP.forEach((e) => removeEventListener(e, end));
      live.intro = 1;
      live.touched = performance.now();
      delete root.dataset.intro;
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      live.touched = now;
      t0 ||= now;
      if (flight) {
        live.intro = Math.min((now - flight) / FLIGHT, 1);
        if (live.intro > 0.965) root.dataset.intro = "land";
        if (live.intro >= 1) end();
        return;
      }
      if (queued.current && sceneUp.current) { flight = now; root.dataset.intro = "fly"; }
      else if (now - t0 > GIVE_UP || sceneDown.current) end(); // the scene never came up; the page is all there is
    };
    live.intro = 0;
    SKIP.forEach((e) => addEventListener(e, end, { passive: true }));
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); SKIP.forEach((e) => removeEventListener(e, end)); };
  }, []);

  // Scene-only mode: the text steps aside, the pointer looks around, a slider scrubs the night.
  const setScene = useCallback((on: boolean) => {
    live.look = on ? 1 : 0.25;
    live.scrub = null;
    live.touched = performance.now();
    if (on) setHour(journeyAt(live.u).hour);
    else show(journeyAt(live.u).hour);
    setSceneOnly(on);
  }, [show]);
  useEffect(() => {
    if (!sceneOnly) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setScene(false); toggle.current?.focus(); } };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [sceneOnly, setScene]);
  const scrub = (h: number) => { live.scrub = h; live.touched = performance.now(); setHour(h); show(h); };

  return (
    <div className="site" data-scene-only={sceneOnly || undefined} data-ready={ready || undefined}>
      <a className="skip" href="#about">Skip to content</a>

      <div className="backdrop" aria-hidden="true">
        <div className="backdrop-canvas" data-ready={ready || undefined}>
          <SceneBoundary onFail={onFail}><Scene onReadyAction={onReady} /></SceneBoundary>
        </div>
      </div>

      <header className="bar">
        <a className="wordmark" href="#top">{p.name}</a>
        <nav className="bar-nav" aria-label="Sections">
          {nav.map((c, i) => (
            <a key={c.id} href={`#${c.id}`} ref={(a) => { links.current[i] = a; }} data-chapter={c.id}>{c.label}</a>
          ))}
        </nav>
        <p className="bar-clock" title="Time in the room. It moves as you scroll.">
          <span className="sr-only">Time in the scene: </span>
          <time ref={time}>{clock(DUSK)}</time>
          <span ref={label} className="bar-phase">{phase(DUSK)}</span>
        </p>
        <button ref={toggle} type="button" className="bar-button" aria-pressed={sceneOnly} onClick={() => setScene(!sceneOnly)}>
          {sceneOnly ? "Back to the résumé" : "Free look"}
        </button>
        <a className="bar-button bar-resume" href={resumeUrl}>Résumé<span className="down" aria-hidden="true">↓</span></a>
      </header>

      <main ref={main} inert={sceneOnly}>{children}</main>

      {sceneOnly && (
        <div className="scrubber">
          <label htmlFor="scrub">Time of night</label>
          <input id="scrub" type="range" min={DUSK} max={DAWN} step={0.01} value={hour} onChange={(e) => scrub(Number(e.target.value))} aria-valuetext={`${clock(hour)}, ${phase(hour)}`} />
          <p>Move the pointer to look around. Scroll to walk the room. Esc returns.</p>
        </div>
      )}

      {/* Shown only while html[data-intro] is set; see the effect above and the styles. */}
      <Intro onDone={onQueued} />
    </div>
  );
}
