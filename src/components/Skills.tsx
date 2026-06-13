"use client";

import { useRef, Suspense, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import { skills, categoryColors, categoryLabels } from "@/lib/skills";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const SkillsScene = dynamic(() => import("./SkillsScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

function MobileFallback() {
  const categories = Object.keys(categoryColors) as Array<keyof typeof categoryColors>;

  return (
    <div className="space-y-8">
      {categories.map((cat, catIndex) => {
        const catSkills = skills.filter((s) => s.category === cat);
        return (
          <div key={cat}>
            <h3
              className="text-sm uppercase tracking-wider mb-4 font-semibold"
              style={{ color: categoryColors[cat] }}
            >
              {categoryLabels[cat]}
            </h3>
            <div className="flex flex-wrap gap-3">
              {catSkills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: catIndex * 0.1 + i * 0.05, duration: 0.4 }}
                >
                  <div
                    className="skill-pill"
                    style={{ borderLeft: `3px solid ${skill.color}` }}
                  >
                    <span>{skill.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="py-24 md:py-32 relative"
      aria-label="Skills section"
    >
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-4 mb-16"
        >
          <span className="text-[var(--accent-primary)] font-mono text-sm">
            03.
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-clash)" }}
          >
            My Toolkit
          </h2>
          <div className="flex-1 h-px bg-[var(--border-color)]" />
        </motion.div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 mb-8">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: categoryColors[key] }}
              />
              <span className="text-xs text-[var(--text-secondary)]">{label}</span>
            </div>
          ))}
        </div>

        {/* 3D Constellation */}
        <div className="block mt-8">
          {headerInView && mounted && (
            <>
              <div className="h-[400px] lg:h-[600px] rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--surface)]">
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-12 h-12 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                    </div>
                  }
                >
                  <SkillsScene isDesktop={isDesktop} />
                </Suspense>
              </div>
              <p className="text-center text-xs text-[var(--text-secondary)] mt-4">
                Click and drag to rotate · Hover nodes for details
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
