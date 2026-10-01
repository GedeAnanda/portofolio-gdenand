export type ProjectId = "firstep" | "fotokita" | "lenslift" | "olahin" | "sultan" | "gemastik";

export interface Project {
  id: ProjectId;
  title: string;
  year: number;
  role: string;
  team: string;
  /** One line, shown under the title. */
  summary: string;
  description: string;
  impact: string;
  tech: string[];
  links: { label: string; url: string }[];
}

/** Accuracy of the SVM on the 775-review test set, from the team's GEMASTIK paper (709 of 775 correct). */
export const SVM_ACCURACY = 91.48;

export const projects: Project[] = [
  {
    id: "firstep",
    title: "FirStep",
    year: 2026,
    role: "Team lead, full-stack developer",
    team: "Team of 3",
    summary: "AI career simulator for Indonesian students",
    description:
      "Maps a five-year career path with salary projections, then adds a CV Roaster, a Reality Check score and a First Income guide. Built with Next.js and PostgreSQL, with Claude doing the reasoning.",
    impact:
      "Finalist at the Focus Target x Microsoft Elevate AI Showcase, exhibited live at FX Sudirman, Jakarta on 5 June 2026.",
    tech: ["Next.js", "Claude API", "PostgreSQL", "Vercel"],
    links: [{ label: "Live demo", url: "https://firstep-two.vercel.app" }],
  },
  {
    id: "fotokita",
    title: "fotokita.space",
    year: 2026,
    role: "Solo developer, product and UI",
    team: "Solo project, live and public",
    summary: "A photobox in the browser: two peace signs take the shot",
    description:
      "Hold up a peace sign with both hands and MediaPipe hand tracking fires the shutter, four times. Then pick one of nine layouts, from a 1x4 strip to a newspaper page, add a cover, filter and frame, and save a print-ready PNG or a boomerang clip for Stories, TikTok and Reels.",
    impact:
      "Live and used by real people to make photostrips with friends and partners. No install and no upload: the photos, the collage and the video are all made on the device.",
    tech: ["Next.js", "MediaPipe", "Canvas API", "Tailwind CSS", "Vercel"],
    links: [{ label: "Live site", url: "https://fotokita.space" }],
  },
  {
    id: "lenslift",
    title: "LensLift",
    year: 2026,
    role: "iOS and backend developer",
    team: "Solo project",
    summary: "iOS fitness app that reads your meal from a photo",
    description:
      "Photograph a meal and Claude Vision (claude-haiku-4-5) returns calories and macros. It also logs workouts, body weight and live gym sessions. SwiftUI on the phone, a Go and Gin REST API with PostgreSQL behind it.",
    impact: "My first Swift project, built from zero: a native client and its Go backend, in two repositories.",
    tech: ["Swift", "SwiftUI", "Go", "Gin", "GORM", "PostgreSQL", "JWT", "Claude API"],
    links: [
      { label: "iOS repo", url: "https://github.com/GedeAnanda/lenslift" },
      { label: "Backend repo", url: "https://github.com/GedeAnanda/lenslift-backend" },
    ],
  },
  {
    id: "olahin",
    title: "Olahin Dong",
    year: 2026,
    role: "Backend developer",
    team: "GDG on Campus Telkom University, team of 3",
    summary: "Recipes from whatever is already in your fridge",
    description:
      "Finds recipes from the ingredients you have, tracks pantry stock and expiry dates, keeps a monthly grocery budget and runs weekly cooking challenges. I built the whole Express API; two teammates built the Flutter app on top of it.",
    impact:
      "Sole backend developer: I designed the schema, the REST contract and the auth that both Flutter developers shipped against.",
    tech: ["Express", "PostgreSQL", "Prisma", "Zod", "JWT", "REST API"],
    links: [{ label: "Backend repo", url: "https://github.com/GedeAnanda/BE-Olahin" }],
  },
  {
    id: "sultan",
    title: "Smoothies Sultan",
    year: 2025,
    role: "Web developer, UI designer",
    team: "Solo project",
    summary: "Scroll-driven landing page for a smoothie brand",
    description:
      "A loading reveal, a cup that bursts into fruit as you scroll, a manifesto that lights up word by word and a bento showcase. Built with Next.js, GSAP and Framer Motion.",
    impact: "Live on Vercel. It is where I learned to turn a brand direction into motion without losing performance.",
    tech: ["Next.js", "GSAP", "Framer Motion", "Tailwind CSS", "Vercel"],
    links: [{ label: "Live site", url: "https://smoothies-sultan.vercel.app" }],
  },
  {
    id: "gemastik",
    title: "GEMASTIK XVIII",
    year: 2026,
    role: "Team lead, ML engineer",
    team: "National competition team",
    summary: "Sentiment analysis of Indonesian e-government apps",
    description:
      "An NLP pipeline over reviews of M-Pajak, Mobile JKN, MyPertamina and SIGNAL: IndoBERT to label the data, TF-IDF features and an SVM classifier, written up as an IEEE-format paper in Indonesian.",
    impact: `Passed Telkom University's internal selection for GEMASTIK XVIII, Data Mining category. The SVM reached ${SVM_ACCURACY}% accuracy on 775 test reviews.`,
    tech: ["Python", "IndoBERT", "scikit-learn", "TF-IDF", "SVM"],
    links: [],
  },
];

export const projectById = (id: ProjectId) => projects.find((p) => p.id === id)!;

/** Each project's colour, used for its stage, sticker and shadows (see the palette in globals.css). */
export const projectTint: Record<ProjectId, string> = {
  firstep: "var(--pop-blue)",
  fotokita: "var(--pop-pink)",
  lenslift: "var(--pop-lime)",
  olahin: "var(--pop-orange)",
  sultan: "var(--pop-yellow)",
  gemastik: "var(--pop-violet)",
};
