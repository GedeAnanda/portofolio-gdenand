"use client";

import { useEffect, ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    let lenis: any;
    let gsapInstance: any;

    const init = async () => {
      const [Lenis, gsapModule, ScrollTriggerModule] = await Promise.all([
        import("lenis").then((m) => m.default),
        import("gsap").then((m) => m.default),
        import("gsap/ScrollTrigger").then((m) => m.ScrollTrigger)
      ]);

      gsapInstance = gsapModule;
      gsapInstance.registerPlugin(ScrollTriggerModule);

      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
      });

      lenis.on("scroll", ScrollTriggerModule.update);

      gsapInstance.ticker.add((time: number) => {
        lenis.raf(time * 1000);
      });

      gsapInstance.ticker.lagSmoothing(0);
    };

    init();

    return () => {
      if (lenis) {
        lenis.destroy();
        if (gsapInstance) {
          gsapInstance.ticker.remove((time: number) => {
            lenis.raf(time * 1000);
          });
        }
      }
    };
  }, []);

  return <>{children}</>;
}
