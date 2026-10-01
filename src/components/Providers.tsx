"use client";

import { useEffect, type ReactNode } from "react";
import { ui } from "@/lib/store";
import { achievements, loadProgress, notify, unlock } from "@/lib/achievements";
import SmoothScroll from "./SmoothScroll";
import { AchievementPanel, AchievementToasts } from "./Achievements";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const WELCOMED_KEY = "nanda-welcomed";

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    ui.set({ theme: root.dataset.theme === "dark" ? "dark" : "light" });
    loadProgress();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => ui.set({ reducedMotion: reduce.matches });
    onMotion();
    reduce.addEventListener("change", onMotion);

    // First visit: say once that the page is a game.
    let welcome = 0;
    try {
      if (!localStorage.getItem(WELCOMED_KEY)) {
        welcome = window.setTimeout(() => {
          notify(
            "This portfolio is playable",
            `${achievements.length} achievements are hidden in the projects, the arcade and a few other places.`,
          );
          try {
            localStorage.setItem(WELCOMED_KEY, "1");
          } catch {}
        }, 2600);
      }
    } catch {
      /* storage blocked: skip the welcome */
    }

    let step = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      step = key === KONAMI[step] ? step + 1 : key === KONAMI[0] ? 1 : 0;
      if (step === KONAMI.length) {
        step = 0;
        unlock("konami");
        root.dataset.konami = "on";
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      reduce.removeEventListener("change", onMotion);
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(welcome);
    };
  }, []);

  return (
    <>
      {children}
      <SmoothScroll />
      <AchievementToasts />
      <AchievementPanel />
    </>
  );
}
