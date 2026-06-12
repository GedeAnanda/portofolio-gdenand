"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

const techStack = [
  "Go", "Node.js", "PostgreSQL", "REST API", "JWT",
  "Express", "Prisma", "Railway", "Docker",
  "React", "Next.js", "Python", "TensorFlow", "Git",
  "Swift", "SwiftUI",
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-24 md:py-32 relative"
      aria-label="About section"
    >
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-number">01.</span>
          <h2 className="section-title">About Me</h2>
          <div className="section-line" />
        </div>

        {/* Bio — full width, no stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-20"
        >
          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed mb-4">
            I&apos;m <span className="text-[var(--text-primary)] font-semibold">Nanda</span>,
            a backend-focused software engineer based in{" "}
            <span className="text-[var(--text-primary)]">Bandung, Indonesia</span>.
            I design and build production-grade APIs, scalable backend services,
            and robust system architectures — primarily in{" "}
            <span className="text-[var(--accent-primary)] font-medium">Go</span> and{" "}
            <span className="text-[var(--accent-primary)] font-medium">Node.js</span>.
          </p>
          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed mb-4">
            Beyond backend, I ship native iOS apps with Swift/SwiftUI and build
            AI-powered tools. Currently studying Informatics Engineering at
            Telkom University while competing and shipping products on a national stage.
          </p>
          <div
            className="flex items-center gap-3 mt-6 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border-color)] w-fit"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            <span className="text-[var(--accent-primary)] text-sm">→</span>
            <span className="text-xs md:text-sm text-[var(--text-secondary)]">
              Focus:{" "}
              <span className="text-[var(--text-primary)]">API Design</span> ·{" "}
              <span className="text-[var(--text-primary)]">Clean Architecture</span> ·{" "}
              <span className="text-[var(--text-primary)]">System Reliability</span>
            </span>
          </div>
        </motion.div>

        {/* Tech Stack Marquee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="marquee-container py-6 border-t border-b border-[var(--border-color)]"
        >
          <div className="marquee-track">
            {[...techStack, ...techStack].map((tech, i) => (
              <span key={i} className="tech-pill">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                  style={{ background: "var(--accent-primary)" }}
                />
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
