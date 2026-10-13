"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { portfolio as p, resumeUrl, stats } from "@/data/portfolio";
import type { SectionId } from "@/data/sections";
import type { LayoutId } from "@/data/layout";
import { SectionBody } from "./Sections";
import { useFlatLayout } from "./LayoutEditor";

const chapters = [
  { id: "about", label: "About", icon: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0" },
  { id: "education", label: "Education", icon: "m2 8 10-5 10 5-10 5zM6 10v7q6 5 12 0v-7M22 8v9" },
  { id: "skills", label: "Skills", icon: "m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" },
  { id: "experience", label: "Experience", icon: "M8 7V4h8v3M3 7h18v14H3zM3 12h18M10 11v3h4v-3" },
  { id: "projects", label: "Projects", icon: "m12 3 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8" },
  { id: "leadership", label: "Leadership", icon: "m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1z" },
  { id: "contact", label: "Contact", icon: "M3 5h18v14H3zM3 5l9 8 9-8" },
] as const;
type ChapterId = (typeof chapters)[number]["id"];

/** One document, one native scroll container. Navigation never replaces the résumé or scrolls the page behind it. */
export default function ResumeMonitor({ active, onCloseAction, className = "", layoutId }: {
  active: SectionId; onCloseAction: () => void; className?: string; layoutId?: LayoutId;
}) {
  const root = useRef<HTMLElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const targets = useRef<Partial<Record<ChapterId, HTMLElement>>>({});
  const [viewed, setViewed] = useState<ChapterId>(active);
  const reading = useRef(false);
  const flat = useFlatLayout(layoutId);

  const jump = useCallback((id: ChapterId, smooth = false) => {
    const el = targets.current[id];
    if (!el || !scroll.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroll.current.scrollTo({ top: Math.max(0, el.offsetTop - 28), behavior: smooth && !reduced ? "smooth" : "instant" });
  }, []);
  useEffect(() => { root.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    reading.current = false;
    jump(active);
    const el = scroll.current;
    if (!el) return;
    // The monitor resizes during its flight; re-anchor the requested chapter until the visitor takes over scrolling.
    const observer = new ResizeObserver(() => { if (!reading.current) jump(active); });
    observer.observe(el);
    return () => observer.disconnect();
  }, [active, jump]);

  const trackSection = () => {
    const el = scroll.current;
    if (!el) return;
    let current: ChapterId = "about";
    for (const chapter of chapters) {
      if ((targets.current[chapter.id]?.offsetTop ?? Infinity) <= el.scrollTop + el.clientHeight * 0.25) current = chapter.id;
    }
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) current = "contact";
    setViewed(current);
  };

  return (
    <section ref={root} tabIndex={-1} aria-label="Scrollable portfolio résumé" className={`resume-monitor ${className}`} style={flat.style}>
      {flat.handle}
      <div className="resume-workspace">
        <nav className="resume-nav" aria-label="Résumé sections">
          {chapters.map((chapter) => (
            <a key={chapter.id} href={`#resume-${chapter.id}`} aria-current={viewed === chapter.id ? "location" : undefined} onClick={(e) => { e.preventDefault(); reading.current = true; jump(chapter.id, true); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={chapter.icon} /></svg>
              <span>{chapter.label}</span>
            </a>
          ))}
          <a className="resume-download" href={resumeUrl} download>Download résumé <span aria-hidden="true">↓</span></a>
        </nav>
        <div className="resume-document">
          <header className="resume-toolbar">
            <span className="resume-route">~/{viewed}</span>
            <span className="resume-system">HUY HOANG / PORTFOLIO</span>
            <button onClick={onCloseAction} className="resume-close" aria-label="Close résumé and return to the table">Back to desk <span aria-hidden="true">×</span></button>
          </header>
          <div ref={scroll} className="resume-scroll" onScroll={trackSection} onWheel={() => { reading.current = true; }} onTouchMove={() => { reading.current = true; }} onPointerDown={() => { reading.current = true; }} onKeyDown={(e) => { if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) reading.current = true; }} tabIndex={0} aria-label="Résumé content">
            {chapters.map((chapter) => (
              <section key={chapter.id} id={`resume-${chapter.id}`} ref={(el) => { if (el) targets.current[chapter.id] = el; }} className={`resume-chapter resume-${chapter.id}`} aria-labelledby={`resume-heading-${chapter.id}`}>
                {chapter.id === "about" ? (
                  <>
                    <div className="resume-introduction">
                      <div>
                        <p className="resume-hello">Hi, I’m</p>
                        <h2 id="resume-heading-about" className="resume-name">{p.name}</h2>
                        <p className="resume-role">Software engineer &amp; AI systems builder</p>
                        <p className="resume-bio">{p.bio}</p>
                        <p className="resume-bio">{p.bio2}</p>
                      </div>
                      <div className="resume-portrait" role="img" aria-label="Portrait of Huy Hoang" />
                    </div>
                    <dl className="resume-stats">
                      {stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}
                    </dl>
                  </>
                ) : (
                  <>
                    <h2 id={`resume-heading-${chapter.id}`} className="resume-section-title">{chapter.label}</h2>
                    {chapter.id === "education" ? (
                      <div className="resume-education-entry">
                        <h3>{p.education.school}</h3>
                        <p>{p.education.degree}</p>
                        <p className="resume-education-meta">Graduation: {p.education.grad} · GPA: {p.education.gpa}</p>
                        <p className="resume-education-meta">{p.education.location}</p>
                      </div>
                    ) : <SectionBody id={chapter.id} />}
                  </>
                )}
              </section>
            ))}
          </div>
          <footer className="resume-footer"><span>Scroll to explore</span><span>ESC · Back to desk</span></footer>
        </div>
      </div>
    </section>
  );
}
