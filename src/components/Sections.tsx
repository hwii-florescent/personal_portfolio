import Image from "next/image";
import type { ReactNode } from "react";
import { portfolio as p, portraitUrl, resumeUrl, stats } from "@/data/portfolio";
import { emphasize } from "@/lib/emphasize";
import { chapters, clock, phase, type ChapterId } from "@/lib/journey";

// Server-rendered: every word of the résumé is plain HTML, readable with the scene switched off.

const Arrow = () => (
  <svg className="arrow" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
);
const Out = ({ href, children }: { href: string; children: ReactNode }) => (
  <a className="link" href={href} {...(href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}>{children}{href.startsWith("http") && <Arrow />}</a>
);

/** A bullet with its numbers set stronger, so a skim still lands on the results. */
const Bullet = ({ text }: { text: string }) => <li>{emphasize(text).map((part, i) => (part.strong ? <strong key={i}>{part.text}</strong> : part.text))}</li>;

function Chapter({ id, title, children }: { id: ChapterId; title: ReactNode; children: ReactNode }) {
  const c = chapters.find((x) => x.id === id)!;
  return (
    <section id={id} className="chapter" aria-labelledby={`${id}-title`}>
      <div className="col">
        <p className="stamp"><time>{clock(c.hour)}</time><span>{phase(c.hour)}</span></p>
        <h2 id={`${id}-title`}>{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Entry({ title, org, dates, logo, bullets }: { title: string; org: string; dates: string; logo: string; bullets: readonly string[] }) {
  return (
    <article className="entry">
      <Image className="entry-logo" src={logo} alt="" width={44} height={44} />
      <div>
        <h3>{title}</h3>
        <p className="entry-meta"><span>{org}</span><time>{dates}</time></p>
        <ul className="bullets">{bullets.map((b) => <Bullet key={b} text={b} />)}</ul>
      </div>
    </article>
  );
}

export function Hero() {
  const email = p.contact[0];
  const linkedin = p.contact.find((c) => c.kind === "linkedin")!;
  const github = p.contact.find((c) => c.kind === "github")!;
  return (
    <section id="top" className="hero" aria-labelledby="name">
      <div className="hero-card">
        <p className="eyebrow">
          <span className="tag">{p.title}</span>
          <span>{p.education.degree.replace("B.S. in ", "")} · {p.education.school} ’{p.education.grad.slice(-2)}</span>
          <span className="eyebrow-dim">Previously {p.experience[0].company.replace(/ Technologies Inc\.$/, "")}</span>
        </p>
        <h1 id="name">{p.name.split(" ")[0]} <em>{p.name.split(" ").slice(1).join(" ")}</em></h1>
        <p className="premise">{p.tagline}</p>
        <div className="actions">
          <a className="button button-primary" href={resumeUrl}>Read the résumé<span className="down" aria-hidden="true">↓</span></a>
          <a className="button" href={email.href}>Email me</a>
          <Out href={github.href}>GitHub</Out>
          <Out href={linkedin.href}>LinkedIn</Out>
        </div>
        <dl className="stats">
          {stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value.replace("X", "×")}</dd></div>)}
        </dl>
      </div>
    </section>
  );
}

export function About() {
  return (
    <Chapter id="about" title={<>Hello, I’m <em>Huy</em>.</>}>
      <div className="about">
        <div>
          <p className="lede">{p.bio2}</p>
          <p className="body">{p.bio}</p>
          <ul className="roles" aria-label="What I do">{p.roles.slice(1).map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
        <figure className="portrait">
          <Image src={portraitUrl} alt="Huy Hoang on a rooftop at blue hour, the city lighting up behind him" width={1320} height={1760} sizes="(max-width: 720px) 62vw, 240px" />
        </figure>
      </div>
    </Chapter>
  );
}

export function Experience() {
  return (
    <Chapter id="experience" title="Experience">
      {p.experience.map((e) => <Entry key={e.role + e.company} title={e.role} org={e.company} dates={e.dates} logo={e.logo} bullets={e.bullets} />)}
    </Chapter>
  );
}

export function Projects() {
  const won = p.projects.filter((x) => x.awards.length), rest = p.projects.filter((x) => !x.awards.length);
  return (
    <Chapter id="projects" title="Projects">
      <div className="winners">
        {won.map((x) => (
          <article key={x.name} className="card">
            <ul className="awards" aria-label="Awards">{x.awards.map((a) => <li key={a}>{a}</li>)}</ul>
            <h3>{x.name}</h3>
            <p className="body">{emphasize(x.desc).map((part, i) => (part.strong ? <strong key={i}>{part.text}</strong> : part.text))}</p>
            <p className="tech">{x.tech.join(" · ")}</p>
            <Out href={x.github}>Source on GitHub</Out>
          </article>
        ))}
      </div>
      <ul className="builds">
        {rest.map((x) => (
          <li key={x.name}>
            <div className="builds-head"><h3>{x.name}</h3><Out href={x.github}>GitHub</Out></div>
            <p className="body">{x.desc}</p>
            <p className="tech">{x.tech.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </Chapter>
  );
}

export function Skills() {
  return (
    <Chapter id="skills" title="Skills">
      {/* Laid out the way an auto-battler lists a team: each group is a trait with its count, each skill a unit. */}
      <ul className="traits">
        {p.skills.map((s) => (
          <li key={s.cat} data-tier={s.items.length >= 8 ? 3 : s.items.length >= 5 ? 2 : 1}>
            <span className="trait-count" aria-hidden="true">{s.items.length}</span>
            <div>
              <h3>{s.cat}</h3>
              <ul className="units">{s.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </li>
        ))}
      </ul>
    </Chapter>
  );
}

export function Background() {
  const e = p.education;
  return (
    <Chapter id="background" title={<>Education <em>&amp;</em> leadership</>}>
      <article className="entry">
        <Image className="entry-logo" src="/uf_herbert_wertheim_college_of_engineering_logo.jpeg" alt="" width={44} height={44} />
        <div>
          <h3>{e.degree}</h3>
          <p className="entry-meta"><span>{e.school} · {e.location}</span><time>Graduating {e.grad}</time></p>
          <p className="body">GPA <strong>{e.gpa}</strong></p>
        </div>
      </article>
      {p.leadership.map((l) => <Entry key={l.role} title={l.role} org={l.org} dates={l.dates} logo={l.logo} bullets={l.bullets} />)}
    </Chapter>
  );
}

export function Contact() {
  return (
    <Chapter id="contact" title="Contact">
      <ul className="reach">
        {p.contact.map((c) => <li key={c.href}><span>{c.kind}</span><Out href={c.href}>{c.label}</Out></li>)}
      </ul>
      <footer className="colophon">
        <p>© 2026 {p.name} · Room drawn live in WebGL · <a className="link" href="#top">Back to top ↑</a></p>
      </footer>
    </Chapter>
  );
}
