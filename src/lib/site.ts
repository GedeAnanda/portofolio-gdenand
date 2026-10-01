export const site = {
  name: "Nanda",
  fullName: "Gede Ananda",
  role: "Backend engineer",
  location: "Bandung, Indonesia",
  email: "gdenand2020@gmail.com",
  cvUrl: "/cv.pdf" as string | null,
  socials: [
    { label: "GitHub", href: "https://github.com/GedeAnanda" },
    { label: "LinkedIn", href: "https://linkedin.com/in/gedeananda" },
    { label: "Instagram", href: "https://instagram.com/gdenand" },
  ],
} as const;

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Arcade", href: "#arcade" },
  { label: "Skills", href: "#skills" },
  { label: "Journey", href: "#journey" },
  { label: "Contact", href: "#contact" },
] as const;
