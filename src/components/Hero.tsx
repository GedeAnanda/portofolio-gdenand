"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const LanyardCard3D = dynamic(() => import("./LanyardCard3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const roles = [
  { text: "ship", emoji: "🚀" },
  { text: "scale", emoji: "⚡" },
  { text: "matter", emoji: "🎯" },
  { text: "win", emoji: "🏆" },
];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setRoleIndex((p) => (p + 1) % roles.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-1/4 right-1/4 w-[700px] h-[700px] rounded-full opacity-[0.07] blur-[140px]"
          style={{ background: "radial-gradient(circle, #ff6b2b, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 -left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "radial-gradient(circle, #6c63ff, transparent 70%)" }}
        />
      </div>

      <div className="section-container w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center min-h-screen">

          {/* ======= LEFT — Text Content ======= */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="order-2 lg:order-1 py-20 lg:py-0"
          >
            {/* Role badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--surface)] mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span
                className="text-[var(--text-secondary)] text-xs md:text-sm font-medium tracking-wide"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                Backend Engineer · API Architect · System Builder
              </span>
            </motion.div>

            {/* H1 */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.08] mb-6"
              style={{ fontFamily: "var(--font-clash)" }}
            >
              <span className="text-[var(--text-primary)]">I build systems</span>
              <br />
              <span className="text-[var(--text-primary)]">that </span>
              <span className="inline-flex items-center gap-2 relative">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={roleIndex}
                    initial={{ y: 36, opacity: 0, filter: "blur(8px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -36, opacity: 0, filter: "blur(8px)" }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="text-gradient inline-block"
                  >
                    {roles[roleIndex].text} {roles[roleIndex].emoji}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="text-[var(--text-secondary)] text-base md:text-lg max-w-lg mb-8 leading-relaxed"
            >
              Backend engineer crafting production-grade APIs, scalable
              architectures, and reliable systems. Based in Bandung, Indonesia.
            </motion.p>

            {/* Terminal snippet */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.25 }}
              className="mb-8 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] max-w-sm"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <code className="text-xs md:text-sm text-[var(--text-secondary)] leading-loose block">
                <span className="text-[var(--accent-primary)]">$</span> curl api.nanda.dev/me
                <br />
                <span className="text-green-400">{"{"}</span>
                <span className="text-[var(--text-secondary)]"> &quot;stack&quot;: </span>
                <span className="text-[var(--accent-secondary)]">&quot;Go&quot;</span>
                <span className="text-[var(--text-secondary)]">, &quot;open&quot;: </span>
                <span className="text-green-400">true </span>
                <span className="text-green-400">{"}"}</span>
              </code>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3 bg-[var(--accent-primary)] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[rgba(255,107,43,0.25)] transition-all duration-300 hover:-translate-y-0.5 text-sm md:text-base"
                aria-label="View projects"
                data-cursor="link"
              >
                View Projects ↓
              </button>
              <a
                href="/cv.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-[var(--border-color)] text-[var(--text-primary)] font-semibold rounded-lg hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all duration-300 hover:-translate-y-0.5 text-sm md:text-base"
                aria-label="Download CV"
                data-cursor="link"
              >
                Download CV
              </a>
            </motion.div>
          </motion.div>

          {/* ======= RIGHT — Lanyard Card ======= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="order-1 lg:order-2 relative w-full flex items-center justify-center"
            style={{ height: "clamp(560px, 100vh, 900px)" }}
          >
            {mounted && isDesktop ? (
              <>
                <LanyardCard3D />
                {/* Hint label */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-[var(--text-secondary)] tracking-[0.25em] uppercase"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  drag to swing ↕
                </motion.p>
              </>
            ) : mounted && !isDesktop ? (
              <div className="w-full flex flex-col items-center justify-center pt-12 lg:pt-0">
                <div className="relative w-64 h-80 rounded-[2rem] overflow-hidden border border-[var(--border-color)] bg-[var(--surface)] shadow-2xl shadow-[var(--accent-primary)]/10">
                  <Image 
                    src="/avatar.jpg" 
                    alt="Nanda" 
                    fill
                    sizes="(max-width: 1024px) 256px, 320px"
                    priority
                    className="object-cover" 
                    style={{ filter: "brightness(1.1) contrast(1.05)" }} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white font-bold text-2xl mb-1">Nanda</h3>
                    <div className="bg-[var(--accent-primary)] px-3 py-1 rounded-full w-fit">
                      <p className="text-white font-mono text-xs font-bold">BACKEND ENGINEER</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none lg:left-[25%]"
      >
        <span
          className="text-[var(--text-secondary)] text-[10px] tracking-[0.3em] uppercase"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          scroll
        </span>
        <motion.div
          animate={{ height: [14, 28, 14] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-px bg-[var(--accent-primary)] rounded-full"
        />
      </motion.div>
    </section>
  );
}
