"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * A statement that brightens word by word as it scrolls through the viewport,
 * pacing the read. Words listed in `emphasis` take the accent colour.
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
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const bare = word.replace(/[.,]$/, "");
        const accent = emphasis.includes(bare);
        return (
          <span key={i}>
            <span data-word className={accent ? "text-accent-text" : undefined}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </p>
  );
}
