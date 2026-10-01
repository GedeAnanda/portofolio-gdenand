import { projects } from "./projects";

export type SkillCategory = "backend" | "ios" | "ai" | "frontend";

export interface Skill {
  name: string;
  category: SkillCategory;
}

export const categoryLabels: Record<SkillCategory, string> = {
  backend: "Backend",
  ios: "iOS",
  ai: "AI / ML",
  frontend: "Frontend",
};

export const categoryOrder: SkillCategory[] = ["backend", "ios", "ai", "frontend"];

export const skills: Skill[] = [
  { name: "Go", category: "backend" },
  { name: "Gin", category: "backend" },
  { name: "Node.js", category: "backend" },
  { name: "Express", category: "backend" },
  { name: "PostgreSQL", category: "backend" },
  { name: "Prisma", category: "backend" },
  { name: "REST API", category: "backend" },
  { name: "JWT", category: "backend" },

  { name: "Swift", category: "ios" },
  { name: "SwiftUI", category: "ios" },
  { name: "UIKit", category: "ios" },
  { name: "Xcode", category: "ios" },

  { name: "Python", category: "ai" },
  { name: "Claude API", category: "ai" },
  { name: "Gemini API", category: "ai" },
  { name: "IndoBERT", category: "ai" },
  { name: "scikit-learn", category: "ai" },
  { name: "TensorFlow", category: "ai" },

  { name: "Next.js", category: "frontend" },
  { name: "React", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "GSAP", category: "frontend" },
  { name: "Framer Motion", category: "frontend" },
  { name: "Git", category: "frontend" },
];

// Express runs on Node.js and Next.js is React, so those projects count for both.
const implied: Record<string, string> = { "Node.js": "Express", React: "Next.js" };

/** Projects whose tech list includes the given skill. */
export function projectsUsing(skill: string) {
  return projects.filter((p) => p.tech.includes(skill) || (implied[skill] !== undefined && p.tech.includes(implied[skill])));
}
