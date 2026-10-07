// Each section is a real object projected above the desk (CC0 models in public/models).
export const sections = [
  { id: "experience", label: "Experience", model: "/models/crane.glb" },
  { id: "projects", label: "Projects", model: "/models/laptop.glb" },
  { id: "skills", label: "Skills", model: "/models/robot.glb" },
  { id: "leadership", label: "Leadership", model: "/models/ship.glb" },
  { id: "contact", label: "Contact", model: "/models/dish.glb" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

type Voice = Record<SectionId | "idle", string[]>;

// Two voices: Stark's J.A.R.V.I.S. and Peter's suit AI, K.A.R.E.N.
export const lines: Record<"jarvis" | "spidey", Voice> = {
  jarvis: {
    idle: ["Good evening, sir. All systems nominal.", "Awaiting your command.", "Select a module to begin."],
    experience: ["Career timeline retrieved from the archives.", "Seven engagements on record, sir."],
    projects: ["Project files decrypted. One has a Terraform prize attached.", "Shall I run a combat assessment?"],
    skills: ["Cross-referencing the technology stack.", "Skill matrix calibrated."],
    leadership: ["Command structure analysis complete.", "Leadership metrics: above average."],
    contact: ["Opening a secure channel.", "Encryption active. Ready to transmit."],
  },
  spidey: {
    idle: ["Hey Peter, I'm online. Web-shooters ready.", "Training wheels protocol is off.", "Pick a module."],
    experience: ["Pulling the mission log. Quite the résumé.", "Several internships on file."],
    projects: ["Scanning the project database. Nice work.", "That Terraform win was a good one."],
    skills: ["Running a capability scan. That's a lot of tools.", "Suit and stack both upgraded."],
    leadership: ["Checking leadership history. Found it.", "Team lead, confirmed."],
    contact: ["Opening comms. Don't mess it up.", "Line is secure."],
  },
};
