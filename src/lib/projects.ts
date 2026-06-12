export type ProjectCategory = "Backend" | "iOS" | "Frontend" | "Full-Stack";

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  year: number;
  description: string;
  tech: string[];
  tags: string[];
  category: ProjectCategory;
  accentColor: string;
  links: { label: string; url: string }[];
}

export const projects: Project[] = [
  {
    id: "olahin",
    title: "Olahin",
    subtitle: "Go REST API Backend",
    year: 2026,
    description:
      "Production-grade REST API backend built in Go for a fitness tracking platform. Features full CRUD for workouts, nutrition logs, and user data — with JWT auth, clean architecture, and Railway deployment.",
    tech: ["Go", "PostgreSQL", "JWT", "Railway", "REST API"],
    tags: ["Go", "Backend", "API", "2026"],
    category: "Backend",
    accentColor: "#60a5fa",
    links: [{ label: "GitHub", url: "https://github.com/GedeAnanda/BE-Olahin" }],
  },
  {
    id: "lenslift",
    title: "LensLift",
    subtitle: "iOS Gym Companion App",
    year: 2026,
    description:
      "Full-stack iOS fitness app with AI-powered food photo analysis, workout logging, nutrition tracking, and body weight monitoring. Built end-to-end: native Swift/SwiftUI frontend with a Go REST API backend, deployed on Railway.",
    tech: ["Swift", "SwiftUI", "Go", "PostgreSQL", "Railway", "Xcode"],
    tags: ["iOS", "Full-Stack", "AI", "2026"],
    category: "iOS",
    accentColor: "#4ade80",
    links: [{ label: "GitHub", url: "https://github.com/GedeAnanda/lenslift" }],
  },
  {
    id: "firstep",
    title: "FirStep",
    subtitle: "AI Career Simulator",
    year: 2026,
    description:
      "AI-powered career simulator for Indonesian college students. Generates personalized 5-year career timelines with salary projections, risk warnings, and milestone events. Selected for Festival AI Nusantara showcase and passed Microsoft Elevate Innovation program.",
    tech: ["React", "Gemini API", "Node.js", "Express", "Tailwind"],
    tags: ["AI", "Full-Stack", "Microsoft Elevate", "Competition Winner", "2026"],
    category: "Full-Stack",
    accentColor: "#ff6b2b",
    links: [
      { label: "Live Demo", url: "#" },
      { label: "GitHub", url: "#" },
    ],
  },
  {
    id: "smoothies-sultan",
    title: "Smoothies Sultan",
    subtitle: "Premium Landing Page",
    year: 2026,
    description:
      "Awwwards-level marketing landing page for a premium smoothie brand. Features cinematic scroll animations, horizontal text marquee, bento grid showcase, and a full-screen loading reveal.",
    tech: ["Next.js", "GSAP", "Framer Motion", "Tailwind CSS", "Vercel"],
    tags: ["Frontend", "Design", "Animation", "2026"],
    category: "Frontend",
    accentColor: "#fbbf24",
    links: [
      { label: "Live Site", url: "https://smoothies-sultan.vercel.app" },
    ],
  },
];
