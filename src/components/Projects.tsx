"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, ProjectCategory } from "@/lib/projects";

const categories: ("All" | ProjectCategory)[] = ["All", "Frontend", "Backend", "iOS", "Full-Stack"];
import ProjectCard from "./ui/ProjectCard";

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState<"All" | ProjectCategory>("All");

  const filteredProjects = projects.filter(
    (project) => activeCategory === "All" || project.category === activeCategory || project.tags.includes(activeCategory)
  );

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="py-24 md:py-32 relative"
      aria-label="Projects section"
    >
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="section-header"
        >
          <span className="section-number">02.</span>
          <h2 className="section-title">Things I&apos;ve Built</h2>
          <div className="section-line" />
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-3 mb-10"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/30 scale-105"
                  : "bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
              <ProjectCard
                title={project.title}
                subtitle={project.subtitle}
                year={project.year}
                description={project.description}
                tech={project.tech}
                tags={project.tags}
                accentColor={project.accentColor}
                links={project.links}
              />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
