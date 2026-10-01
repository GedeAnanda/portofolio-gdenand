"use client";

import { useEffect } from "react";
import { markProjectSeen } from "@/lib/achievements";
import { projects, type ProjectId } from "@/lib/projects";

/** Counts a project as seen once its article crosses the middle of the viewport. */
export default function ProjectTracker() {
  useEffect(() => {
    const articles = document.querySelectorAll<HTMLElement>("article[data-project]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          markProjectSeen(entry.target.getAttribute("data-project") as ProjectId, projects.length);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    articles.forEach((a) => io.observe(a));
    return () => io.disconnect();
  }, []);
  return null;
}
