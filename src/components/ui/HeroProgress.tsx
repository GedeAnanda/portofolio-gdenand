"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { signals } from "@/lib/stage";

/** Feeds how far the hero has scrolled away into the 3D pin board (it flattens and tilts back). */
export default function HeroProgress({ target }: { target: string }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: target,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        signals.heroProgress = self.progress;
      },
    });
    return () => {
      trigger.kill();
      signals.heroProgress = 0;
    };
  }, [target]);
  return null;
}
