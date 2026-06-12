"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface ProjectCardProps {
  title: string;
  subtitle: string;
  year: number;
  description: string;
  tech: string[];
  tags: string[];
  accentColor: string;
  links: { label: string; url: string }[];
}

export default function ProjectCard({
  title,
  subtitle,
  year,
  description,
  tech,
  tags,
  accentColor,
  links,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (flipped) return;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setTilt({ rotateX: (y - 0.5) * -10, rotateY: (x - 0.5) * 10 });
      setGlarePos({ x: x * 100, y: y * 100 });
    },
    [flipped]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setGlarePos({ x: 50, y: 50 });
  }, []);

  return (
    <div
      ref={cardRef}
      className="project-card-wrapper group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor="card"
      aria-label={`Project: ${title}`}
    >
      <motion.div
        className={`project-card-inner${flipped ? " is-flipped" : ""}`}
        animate={{
          rotateX: flipped ? 0 : tilt.rotateX,
          rotateY: flipped ? 180 : tilt.rotateY,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 28 }}
      >
        {/* ======================== FRONT ======================== */}
        <div className="project-card-face">
          <div className="project-card-face-inner">
            {/* Accent top line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)` }}
            />

            {/* Glare */}
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.07) 0%, transparent 60%)`,
              }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative z-10">
              <span className="year-badge">{year}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                aria-label={`See more details about ${title}`}
                data-cursor="link"
              >
                Details
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Title */}
            <div className="mb-4 relative z-10">
              <h3
                className="text-xl md:text-2xl font-bold text-[var(--text-primary)] leading-tight mb-1"
                style={{ fontFamily: "var(--font-clash)" }}
              >
                {title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: accentColor }}
                />
                {subtitle}
              </p>
            </div>

            {/* Description */}
            <p
              className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5 relative z-10"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </p>

            {/* Tech + Links */}
            <div className="relative z-10 pt-4 border-t border-[var(--border-color)] space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {tech.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold transition-all hover:opacity-80"
                    style={{ color: accentColor }}
                    aria-label={`${link.label} — ${title}`}
                    data-cursor="link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {link.label === "GitHub" && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
                    {link.label}
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ======================== BACK ======================== */}
        <div className="project-card-back">
          <div className="project-card-back-inner">
            {/* Accent top line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)` }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="year-badge">{year}</span>
              <button
                onClick={() => setFlipped(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all text-sm"
                aria-label="Back to front"
                data-cursor="link"
              >
                ✕
              </button>
            </div>

            <h3
              className="text-xl font-bold text-[var(--text-primary)] mb-1 relative z-10"
              style={{ fontFamily: "var(--font-clash)" }}
            >
              {title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4 relative z-10">{subtitle}</p>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5 flex-1 relative z-10">
              {description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4 relative z-10">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                  style={{
                    background: `${accentColor}18`,
                    color: accentColor,
                    border: `1px solid ${accentColor}35`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--border-color)] mt-auto relative z-10">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ color: accentColor }}
                  aria-label={`${link.label} — ${title}`}
                  data-cursor="link"
                >
                  {link.label}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
