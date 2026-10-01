"use client";

import { useEffect, useRef } from "react";

const BASE = { wdth: 108, wght: 720 };
const PEAK = { wdth: 125, wght: 900 };
const RADIUS = 420;

/**
 * Display name whose letters widen and thicken as the pointer approaches,
 * using Mona Sans' width and weight axes. Static for touch and reduced motion.
 */
export default function KineticName({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const letters = Array.from(root.querySelectorAll<HTMLSpanElement>("[data-letter]"));
    const influence = letters.map(() => 0);
    let px = -1e5;
    let py = -1e5;
    let raf = 0;

    const loop = () => {
      // Read every rect first, then write, so each frame lays out once.
      const rects = letters.map((l) => l.getBoundingClientRect());
      let moving = false;
      letters.forEach((letter, i) => {
        const r = rects[i];
        const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
        const target = Math.max(0, 1 - d / RADIUS);
        influence[i] += (target - influence[i]) * 0.16;
        if (Math.abs(target - influence[i]) > 0.002) moving = true;
        const k = influence[i] * influence[i] * (3 - 2 * influence[i]);
        const wdth = BASE.wdth + (PEAK.wdth - BASE.wdth) * k;
        const wght = BASE.wght + (PEAK.wght - BASE.wght) * k;
        letter.style.fontVariationSettings = `"wdth" ${wdth.toFixed(1)}, "wght" ${wght.toFixed(0)}`;
      });
      raf = moving ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <span ref={ref} aria-hidden="true" className="inline-flex">
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          data-letter
          className="hero-rise inline-block"
          style={{
            fontVariationSettings: `"wdth" ${BASE.wdth}, "wght" ${BASE.wght}`,
            ["--d" as string]: `${120 + i * 70}ms`,
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
