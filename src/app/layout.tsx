import type { Metadata, Viewport } from "next";
import { Martian_Mono, Mona_Sans } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import Providers from "@/components/Providers";

const mona = Mona_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mona",
  display: "swap",
});

const martian = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian",
  display: "swap",
});

const title = "Nanda | Backend engineer, iOS developer, AI builder";
const description =
  "Portfolio of Nanda (Gede Ananda), a backend engineer in Bandung. Play with the projects: an AI career simulator, an iOS fitness app, a recipe API and a sentiment model.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Nanda",
    "Gede Ananda",
    "backend engineer",
    "software engineer",
    "iOS developer",
    "AI builder",
    "portfolio",
    "Bandung",
    "Telkom University",
    "Go",
    "Swift",
    "Next.js",
  ],
  authors: [{ name: "Gede Ananda" }],
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_US",
    siteName: "Nanda",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e6e6e2" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0e" },
  ],
};

// Runs before first paint so the stored or system theme never flashes.
const themeScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t}catch(e){d.dataset.theme='dark'}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${mona.variable} ${martian.variable}`}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
