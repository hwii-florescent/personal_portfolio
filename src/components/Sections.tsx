import { portfolio as p } from "@/data/portfolio";
import type { SectionId } from "@/data/sections";

const link = "underline decoration-accent underline-offset-4 hover:text-gold";

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
      {items.map((b) => <li key={b}>{b}</li>)}
    </ul>
  );
}

/** Server-safe: used in the HUD panel and, for all sections, in the sr-only SEO copy. */
export function SectionBody({ id }: { id: SectionId }) {
  switch (id) {
    case "experience":
      return (
        <ul className="space-y-8">
          {p.experience.map((e) => (
            <li key={e.role + e.dates}>
              <h3 className="font-medium text-fg">{e.role} · <span className="text-accent">{e.company}</span></h3>
              <p className="font-mono text-xs text-muted">{e.dates}</p>
              <Bullets items={e.bullets} />
            </li>
          ))}
        </ul>
      );
    case "projects":
      return (
        <ul className="space-y-5">
          {p.projects.map((pr) => (
            <li key={pr.name} className="border-l-2 border-primary pl-4">
              <h3 className="font-medium text-fg">{pr.name}</h3>
              {pr.award && <p className="text-xs text-gold">{pr.award}</p>}
              <p className="mt-1 text-sm text-muted">{pr.desc}</p>
              <p className="mt-2 font-mono text-xs text-accent">{pr.tech.join(" · ")}</p>
              <a className={`mt-2 inline-block text-sm ${link}`} href={pr.github} target="_blank" rel="noreferrer">GitHub</a>
            </li>
          ))}
        </ul>
      );
    case "skills":
      return (
        <dl className="space-y-5 text-sm">
          {p.skills.map((s) => (
            <div key={s.cat}>
              <dt className="font-mono text-xs uppercase tracking-widest text-accent">{s.cat}</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {s.items.map((i) => <span key={i} className="border border-accent/30 px-2 py-0.5 text-xs">{i}</span>)}
              </dd>
            </div>
          ))}
        </dl>
      );
    case "leadership":
      return (
        <>
          {p.leadership.map((l) => (
            <div key={l.role}>
              <h3 className="font-medium text-fg">{l.role} · <span className="text-accent">{l.org}</span></h3>
              <p className="font-mono text-xs text-muted">{l.dates}</p>
              <Bullets items={l.bullets} />
            </div>
          ))}
        </>
      );
    case "contact":
      return (
        <ul className="space-y-2 text-sm">
          {p.contact.map((c) => (
            <li key={c.href}><a className={link} href={c.href}>{c.label}</a></li>
          ))}
        </ul>
      );
  }
}
