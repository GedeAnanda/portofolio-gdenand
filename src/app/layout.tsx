import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nanda — Full-Stack Engineer · iOS Developer · AI Builder",
  description:
    "I'm Nanda, a software engineer based in Bandung, Indonesia. I build full-stack web apps, native iOS experiences, and AI-powered tools — always with a focus on solving real problems elegantly.",
  keywords: [
    "Nanda",
    "software engineer",
    "full-stack developer",
    "iOS developer",
    "AI builder",
    "portfolio",
    "Bandung",
    "Telkom University",
    "Next.js",
    "React",
    "Swift",
    "Go",
  ],
  authors: [{ name: "Nanda" }],
  openGraph: {
    title: "Nanda — Full-Stack Engineer · iOS Developer · AI Builder",
    description:
      "Building real things that solve real problems. Portfolio of Nanda, a software engineer from Bandung, Indonesia.",
    type: "website",
    locale: "en_US",
    siteName: "Nanda Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nanda — Full-Stack Engineer · iOS Developer · AI Builder",
    description:
      "Building real things that solve real problems.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[var(--background)] text-[var(--text-primary)]">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
