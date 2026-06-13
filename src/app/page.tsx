"use client";

import dynamic from "next/dynamic";
import ThemeProvider from "@/components/ThemeProvider";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
const About = dynamic(() => import("@/components/About"));
const Projects = dynamic(() => import("@/components/Projects"));
const Skills = dynamic(() => import("@/components/Skills"));
const Journey = dynamic(() => import("@/components/Journey"));
const Contact = dynamic(() => import("@/components/Contact"));

const LoadingScreen = dynamic(() => import("@/components/LoadingScreen"), {
  ssr: false,
});

const CustomCursor = dynamic(() => import("@/components/CustomCursor"), {
  ssr: false,
});

export default function Home() {
  return (
    <ThemeProvider>
      <SmoothScroll>
        <LoadingScreen />
        <CustomCursor />
        <Navbar />
        <main id="main-content">
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Journey />
          <Contact />
        </main>
      </SmoothScroll>
    </ThemeProvider>
  );
}
