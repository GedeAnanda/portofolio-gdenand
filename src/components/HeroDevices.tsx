"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import BrowserFrame from "./mockups/BrowserFrame";
import PhoneFrame from "./mockups/PhoneFrame";
import firstepLanding from "../../public/work/firstep/landing-full.webp";
import firstepResult from "../../public/work/firstep/mobile-result.webp";
import llResult from "../../public/work/lenslift/result.webp";
import llTargets from "../../public/work/lenslift/targets.webp";
import llProgress from "../../public/work/lenslift/progress.webp";

const lensliftScreens = [
  { src: llResult, alt: "LensLift showing 650 kcal for a plate of nasi goreng, analysed by AI" },
  { src: llTargets, alt: "LensLift daily targets with calorie and macro sliders" },
  { src: llProgress, alt: "LensLift progress screen with a body weight chart" },
];

/** Depth of each layer in px of travel at the edge of the viewport. */
const DEPTH = [10, 22, 30];

export default function HeroDevices() {
  const layers = useRef<(HTMLAnchorElement | null)[]>([]);
  const [screen, setScreen] = useState(0);

  // Pointer parallax: each device drifts by its depth. Fine pointers only, never under reduced motion.
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    const loop = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      layers.current.forEach((el, i) => {
        if (el) el.style.transform = `translate3d(${(current.x * DEPTH[i]).toFixed(2)}px, ${(current.y * DEPTH[i]).toFixed(2)}px, 0)`;
      });
      raf = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // The LensLift phone pages through three real screens.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setScreen((s) => (s + 1) % lensliftScreens.length), 3400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto aspect-[1.08] w-full max-w-[720px] lg:mr-0">
      {/* Two flat shapes behind the devices, for colour. */}
      <span
        aria-hidden
        className="pop-in absolute bottom-[4%] left-[4%] aspect-square w-[38%] rounded-full border-2 border-edge bg-pop-yellow"
        style={{ ["--d" as string]: "120ms" }}
      />
      <span
        aria-hidden
        className="pop-in absolute right-[-2%] top-[-3%] aspect-square w-[24%] rounded-[30%] border-2 border-edge bg-pop-pink"
        style={{ ["--d" as string]: "60ms", ["--r" as string]: "14deg", transform: "rotate(14deg)" }}
      />
      <a
        ref={(el) => {
          layers.current[0] = el;
        }}
        href="#project-firstep"
        aria-label="FirStep in a browser. Go to the project."
        className="absolute right-0 top-[3%] block w-[88%] will-change-transform"
      >
        <div className="hero-rise relative" style={{ ["--d" as string]: "200ms" }}>
        <span
          className="sticker pop-in absolute -left-4 -top-6 z-10"
          style={{ ["--tint" as string]: "var(--pop-cyan)", ["--r" as string]: "-4deg", ["--d" as string]: "700ms" }}
        >
          Next.js + Claude API
        </span>
        <BrowserFrame url="firstep-two.vercel.app">
          <Image
            src={firstepLanding}
            alt="FirStep landing page: simulate your dream career before you regret it"
            fill
            priority
            sizes="(min-width: 1024px) 600px, 88vw"
            className="object-cover object-top"
          />
        </BrowserFrame>
        </div>
      </a>

      <a
        ref={(el) => {
          layers.current[1] = el;
        }}
        href="#project-lenslift"
        aria-label="LensLift on an iPhone. Go to the project."
        className="absolute bottom-[1%] left-0 block w-[28%] will-change-transform"
      >
        <div className="hero-rise relative" style={{ ["--d" as string]: "340ms" }}>
        <span
          className="sticker pop-in absolute -right-[38%] top-[14%] z-10"
          style={{ ["--tint" as string]: "var(--pop-lime)", ["--r" as string]: "6deg", ["--d" as string]: "850ms" }}
        >
          SwiftUI + Go
        </span>
        <PhoneFrame tone="dark">
          {lensliftScreens.map((s, i) => (
            <Image
              key={s.alt}
              src={s.src}
              alt={i === screen ? s.alt : ""}
              aria-hidden={i !== screen}
              fill
              sizes="200px"
              className="object-cover object-top transition-opacity duration-700"
              style={{ opacity: i === screen ? 1 : 0 }}
            />
          ))}
        </PhoneFrame>
        </div>
      </a>

      <a
        ref={(el) => {
          layers.current[2] = el;
        }}
        href="#project-firstep"
        aria-label="FirStep simulation result on a phone. Go to the project."
        className="absolute bottom-[6%] right-[7%] block w-[24%] will-change-transform"
      >
        <div className="hero-rise relative" style={{ ["--d" as string]: "460ms" }}>
        <span
          className="sticker pop-in absolute -bottom-5 -left-[30%] z-10"
          style={{ ["--tint" as string]: "var(--pop-orange)", ["--r" as string]: "-5deg", ["--d" as string]: "1000ms" }}
        >
          AI on TikTok
        </span>
        <PhoneFrame tone="light" screen="#fafafa">
          <Image
            src={firstepResult}
            alt="FirStep career simulation result: Backend Specialist to Tech Lead, 72% probability"
            fill
            sizes="180px"
            className="object-cover object-top"
          />
        </PhoneFrame>
        </div>
      </a>
    </div>
  );
}
