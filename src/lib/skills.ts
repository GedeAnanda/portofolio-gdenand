export interface Skill {
  name: string;
  category: "backend" | "ios" | "ai" | "frontend";
  proficiency: number;
  color: string;
  position: [number, number, number];
}

export const categoryColors: Record<string, string> = {
  backend: "#ff6b2b",
  ios: "#60a5fa",
  ai: "#6c63ff",
  frontend: "#4ade80",
};

export const categoryLabels: Record<string, string> = {
  backend: "Backend",
  ios: "iOS",
  ai: "AI / ML",
  frontend: "Frontend",
};

export const skills: Skill[] = [
  // Backend (orange)
  { name: "Go", category: "backend", proficiency: 85, color: "#ff6b2b", position: [-3, 1.5, 0] },
  { name: "Node.js", category: "backend", proficiency: 80, color: "#ff6b2b", position: [-2.5, 2.5, 1] },
  { name: "Express", category: "backend", proficiency: 78, color: "#ff6b2b", position: [-3.5, 0.5, -1] },
  { name: "PostgreSQL", category: "backend", proficiency: 75, color: "#ff6b2b", position: [-2, 1, -1.5] },
  { name: "Prisma", category: "backend", proficiency: 70, color: "#ff6b2b", position: [-4, 2, 0.5] },
  { name: "REST API", category: "backend", proficiency: 85, color: "#ff6b2b", position: [-3, 3, -0.5] },

  // iOS (blue)
  { name: "Swift", category: "ios", proficiency: 80, color: "#60a5fa", position: [3, 1.5, 0] },
  { name: "SwiftUI", category: "ios", proficiency: 78, color: "#60a5fa", position: [2.5, 2.5, 1] },
  { name: "Xcode", category: "ios", proficiency: 75, color: "#60a5fa", position: [3.5, 0.5, -1] },
  { name: "UIKit", category: "ios", proficiency: 60, color: "#60a5fa", position: [2, 1, 1.5] },

  // AI/ML (purple)
  { name: "Python", category: "ai", proficiency: 75, color: "#6c63ff", position: [0, 3, 2] },
  { name: "TensorFlow", category: "ai", proficiency: 65, color: "#6c63ff", position: [1, 3.5, 1] },
  { name: "Gemini API", category: "ai", proficiency: 80, color: "#6c63ff", position: [-1, 3.5, 1.5] },
  { name: "Machine Learning", category: "ai", proficiency: 60, color: "#6c63ff", position: [0.5, 4, 0] },

  // Frontend (green)
  { name: "React", category: "frontend", proficiency: 85, color: "#4ade80", position: [0, -1, 2] },
  { name: "Next.js", category: "frontend", proficiency: 82, color: "#4ade80", position: [1, -0.5, 1] },
  { name: "Tailwind CSS", category: "frontend", proficiency: 90, color: "#4ade80", position: [-1, -0.5, 1.5] },
  { name: "GSAP", category: "frontend", proficiency: 75, color: "#4ade80", position: [0, -2, 0.5] },
  { name: "Framer Motion", category: "frontend", proficiency: 78, color: "#4ade80", position: [-0.5, -1.5, -0.5] },
  { name: "Git", category: "frontend", proficiency: 85, color: "#4ade80", position: [1.5, -1.5, 0] },
];
