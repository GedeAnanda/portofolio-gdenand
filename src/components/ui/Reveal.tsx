"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";

type RevealTag = "div" | "p" | "figure" | "li";

/** Fades content up the first time it enters the viewport. Static under reduced motion (see globals.css). */
export default function Reveal({
  as = "div",
  delay = 0,
  className,
  style,
  children,
}: {
  as?: RevealTag;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.shown = "true";
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Every allowed tag is an HTMLElement, so one ref type covers them all.
  const Tag = as as "div";
  return (
    <Tag
      ref={ref as RefObject<HTMLDivElement>}
      data-reveal
      className={className}
      style={{ ...style, ["--d" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
