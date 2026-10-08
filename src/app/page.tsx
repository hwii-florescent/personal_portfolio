import { readFileSync } from "node:fs";
import { join } from "node:path";
import Portfolio from "@/components/Portfolio";
import { SectionBody } from "@/components/Sections";
import { sections } from "@/data/sections";
import { portfolio as p } from "@/data/portfolio";
import saved from "@/data/layout.json"; // read on the server so a dev save does not hot-reload client modules
import { validLayout } from "@/data/layout";

export default function Home() {
  let value: unknown = saved;
  if (process.env.NODE_ENV === "development") {
    // ponytail: sync I/O for the small dev-only editor file; use async + Suspense if it grows.
    // Do not wait for the bundler to notice a save before serving a new tab.
    try { value = JSON.parse(readFileSync(join(process.cwd(), "src/data/layout.json"), "utf8")); }
    catch (error) { console.error("Could not load dev layout", error); value = {}; }
  }
  const layout = validLayout(value) ? value : {}; // a hand-edited bad file falls back to the default layout
  return (
    <main>
      <h1 className="sr-only">{p.name} — Software Engineer &amp; AI/ML Researcher</h1>
      <Portfolio layout={layout} />
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
