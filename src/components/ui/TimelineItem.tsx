"use client";

import { motion } from "framer-motion";

interface TimelineItemProps {
  year: number;
  title: string;
  description: string;
  side: "left" | "right";
  tag?: string;
  index: number;
}

const tagStyles: Record<string, { bg: string; text: string; border: string }> = {
  Achievement: {
    bg: "rgba(255, 107, 43, 0.12)",
    text: "#ff6b2b",
    border: "rgba(255, 107, 43, 0.25)",
  },
  Community: {
    bg: "rgba(96, 165, 250, 0.12)",
    text: "#60a5fa",
    border: "rgba(96, 165, 250, 0.25)",
  },
  "On Going": {
    bg: "rgba(74, 222, 128, 0.12)",
    text: "#4ade80",
    border: "rgba(74, 222, 128, 0.25)",
  },
};

export default function TimelineItem({
  year,
  title,
  description,
  side,
  tag,
  index,
}: TimelineItemProps) {
  const style = tag ? tagStyles[tag] : tagStyles["Community"];
  const isRight = side === "right";

  return (
    <motion.div
      initial={{ opacity: 0, x: isRight ? 60 : -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
      className={`relative flex items-start mb-10 md:mb-14 ${
        isRight ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      {/* Content Card */}
      <div
        className={`
          ml-10 md:ml-0 w-full
          ${isRight
            ? "md:w-[calc(50%-40px)] md:ml-[calc(50%+40px)] md:pl-0"
            : "md:w-[calc(50%-40px)] md:mr-[calc(50%+40px)]"
          }
        `}
      >
        <div className="group relative rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 md:p-6 transition-all duration-300 hover:border-[var(--accent-primary)] hover:shadow-lg hover:shadow-[rgba(255,107,43,0.06)]">
          {/* Accent top line — appears on hover */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(90deg, var(--accent-primary), transparent)" }}
          />

          {/* Year + Tag row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="year-badge">{year}</span>
            {tag && (
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: style.bg,
                  color: style.text,
                  border: `1px solid ${style.border}`,
                  fontFamily: "var(--font-jetbrains)",
                  letterSpacing: "0.04em",
                }}
              >
                {tag === "On Going" ? "🟢 On Going" : tag}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className="text-base md:text-lg font-bold text-[var(--text-primary)] mb-2 leading-snug group-hover:text-[var(--accent-primary)] transition-colors duration-300"
            style={{ fontFamily: "var(--font-clash)" }}
          >
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Timeline Dot — centered on the line */}
      <div
        className={`
          absolute top-6 left-[2px] md:left-1/2 md:-translate-x-1/2
          flex items-center justify-center
        `}
      >
        <div className="timeline-dot" />
      </div>
    </motion.div>
  );
}
