"use client";

import dynamic from "next/dynamic";
import ThemeProvider from "@/components/ThemeProvider";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Journey from "@/components/Journey";
import Contact from "@/components/Contact";

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
