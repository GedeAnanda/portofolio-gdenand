"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cursorState = useRef("default");

  useEffect(() => {
    // Check for touch device
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // GSAP quickTo for smooth following
    const xDot = gsap.quickTo(dot, "left", { duration: 0.05, ease: "power2.out" });
    const yDot = gsap.quickTo(dot, "top", { duration: 0.05, ease: "power2.out" });
    const xRing = gsap.quickTo(ring, "left", { duration: 0.25, ease: "power2.out" });
    const yRing = gsap.quickTo(ring, "top", { duration: 0.25, ease: "power2.out" });

    const onMouseMove = (e: MouseEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isLink =
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.closest("[data-cursor='link']");
      const isCard = target.closest("[data-cursor='card']");

      if (isCard) {
        if (cursorState.current !== "card") {
          cursorState.current = "card";
          document.body.classList.remove("cursor-hover-link");
          document.body.classList.add("cursor-hover-card");
        }
      } else if (isLink) {
        if (cursorState.current !== "link") {
          cursorState.current = "link";
          document.body.classList.remove("cursor-hover-card");
          document.body.classList.add("cursor-hover-link");
        }
      } else {
        if (cursorState.current !== "default") {
          cursorState.current = "default";
          document.body.classList.remove("cursor-hover-link", "cursor-hover-card");
        }
      }
    };

    const onMouseLeave = () => {
      cursorState.current = "default";
      document.body.classList.remove("cursor-hover-link", "cursor-hover-card");
    };

    // Hide default cursor
    document.body.style.cursor = "none";

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.body.classList.remove("cursor-hover-link", "cursor-hover-card");
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
