import Site from "@/components/Site";
import { About, Background, Contact, Experience, Hero, Projects, Skills } from "@/components/Sections";

export default function Home() {
  return (
    <Site>
      <Hero />
      {/* one reading scrim behind everything between the opening shot and the sunrise */}
      <div className="read">
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Background />
      </div>
      <Contact />
    </Site>
  );
}
