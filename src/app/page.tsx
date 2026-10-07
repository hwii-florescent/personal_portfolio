import SceneLoader from "@/components/SceneLoader";
import { portfolio as p, resumeUrl } from "@/data/portfolio";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="mb-8 font-mono text-sm uppercase tracking-widest text-accent">{title}</h2>
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <SceneLoader />

      <header className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
        <p className="font-mono text-sm text-accent">{p.roles[0]}</p>
        <h1 className="mt-2 text-6xl font-semibold tracking-tight">{p.name}</h1>
        <p className="mt-6 max-w-xl text-lg text-muted">{p.bio}</p>
        <div className="mt-8 flex gap-4 font-mono text-sm">
          <a className="underline decoration-accent underline-offset-4" href={resumeUrl}>Resume</a>
          <a className="underline decoration-accent underline-offset-4" href="#contact">Contact</a>
        </div>
      </header>

      <Section id="experience" title="Experience">
        <ul className="space-y-10">
          {p.experience.map((e) => (
            <li key={e.role + e.dates}>
              <h3 className="text-lg font-medium">{e.role} · <span className="text-muted">{e.company}</span></h3>
              <p className="font-mono text-xs text-muted">{e.dates}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                {e.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="projects" title="Projects">
        <ul className="grid gap-6 sm:grid-cols-2">
          {p.projects.map((pr) => (
            <li key={pr.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
              <h3 className="font-medium">{pr.name}</h3>
              {pr.award && <p className="mt-1 text-xs text-accent">{pr.award}</p>}
              <p className="mt-2 text-sm text-muted">{pr.desc}</p>
              <p className="mt-3 font-mono text-xs text-muted">{pr.tech.join(" · ")}</p>
              <a className="mt-3 inline-block text-sm underline decoration-accent underline-offset-4" href={pr.github}>GitHub</a>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="skills" title="Skills">
        <dl className="space-y-4 text-sm">
          {p.skills.map((s) => (
            <div key={s.cat}>
              <dt className="font-mono text-xs text-muted">{s.cat}</dt>
              <dd>{s.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="leadership" title="Leadership">
        {p.leadership.map((l) => (
          <div key={l.role}>
            <h3 className="font-medium">{l.role} · <span className="text-muted">{l.org}</span></h3>
            <p className="font-mono text-xs text-muted">{l.dates}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
              {l.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
          </div>
        ))}
      </Section>

      <Section id="contact" title="Contact">
        <ul className="space-y-2 text-sm">
          {p.contact.map((c) => (
            <li key={c.href}><a className="underline decoration-accent underline-offset-4" href={c.href}>{c.label}</a></li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
