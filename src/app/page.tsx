import Portfolio from "@/components/Portfolio";
import { SectionBody } from "@/components/Sections";
import { sections } from "@/data/sections";
import { portfolio as p } from "@/data/portfolio";

export default function Home() {
  return (
    <main>
      <h1 className="sr-only">{p.name} — Software Engineer &amp; AI/ML Researcher</h1>
      <Portfolio />
      {/* Plain, crawlable copy of everything; the 3D UI above is the visual layer. */}
      <div className="sr-only">
        <p>{p.bio}</p>
        <p>{p.bio2}</p>
        {sections.map((s) => (
          <section key={s.id}>
            <h2>{s.label}</h2>
            <SectionBody id={s.id} />
          </section>
        ))}
      </div>
    </main>
  );
}
