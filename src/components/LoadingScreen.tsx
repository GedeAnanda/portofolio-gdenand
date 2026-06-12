"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function LoadingScreen() {
  const [show, setShow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const letters = ["N", "A", "N", "D", "A"];

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("loaded")) {
      setShow(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        // Wipe out
        gsap.to(containerRef.current, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            setShow(false);
            sessionStorage.setItem("loaded", "true");
          },
        });
      },
    });

    // Stagger letter reveal
    tl.to(lettersRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.15,
      ease: "power3.out",
      delay: 0.3,
    });

    // Progress bar
    tl.to(
      progressRef.current,
      {
        width: "100%",
        duration: 1.2,
        ease: "power2.inOut",
      },
      0.2
    );

    // Hold for a moment
    tl.to({}, { duration: 0.4 });

    return () => {
      tl.kill();
    };
  }, []);

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      className="loading-screen"
      style={{ clipPath: "inset(0 0 0 0)" }}
      aria-label="Loading"
    >
      <div className="flex gap-2 md:gap-4">
        {letters.map((letter, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) lettersRef.current[i] = el;
            }}
            className="loading-letter"
          >
            {letter}
          </span>
        ))}
      </div>
      <div className="loading-progress">
        <div ref={progressRef} className="loading-progress-bar" />
      </div>
    </div>
  );
}
