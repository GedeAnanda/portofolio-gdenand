"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const MARKS = ["var(--pop-cyan)", "var(--pop-yellow)", "var(--pop-pink)", "var(--pop-lime)"];

/**
 * A statement that brightens word by word as it scrolls through the viewport,
 * pacing the read. Words listed in `emphasis` get a highlighter, each in the next palette colour.
 */
export default function WordReveal({
  text,
  emphasis = [],
  className,
}: {
  text: string;
  emphasis?: string[];
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const words = el.querySelectorAll("[data-word]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 42%", scrub: 0.6 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const words = text.split(" ");
  let marked = 0;
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const bare = word.replace(/[.,]$/, "");
        const accent = emphasis.includes(bare);
        const color = accent ? MARKS[marked++ % MARKS.length] : undefined;
        return (
          <span key={i}>
            <span data-word className={accent ? "hl" : undefined} style={color ? { ["--mark" as string]: color } : undefined}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </p>
  );
}
