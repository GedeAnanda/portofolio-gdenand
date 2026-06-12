"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { journeyItems } from "@/lib/journey";
import TimelineItem from "./ui/TimelineItem";

export default function Journey() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="py-24 md:py-32 relative"
      aria-label="Journey section"
    >
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="section-header"
        >
          <span className="section-number">04.</span>
          <h2 className="section-title">The Path So Far</h2>
          <div className="section-line" />
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 mb-12 -mt-4"
        >
          {[
            { label: "Achievement", color: "#ff6b2b" },
            { label: "Community",   color: "#60a5fa" },
            { label: "On Going",    color: "#4ade80" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: item.color }}
              />
              <span
                className="text-xs text-[var(--text-secondary)]"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical center line */}
          <div className="timeline-line" />

          {journeyItems.map((item, i) => (
            <TimelineItem
              key={i}
              year={item.year}
              title={item.title}
              description={item.description}
              side={item.side}
              tag={item.tag}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
