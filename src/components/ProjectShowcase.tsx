"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { projects } from "@/lib/projects";
import { ui, useStore } from "@/lib/store";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ViewSlot from "./ui/ViewSlot";

export default function ProjectShowcase() {
  const wide = useMediaQuery("(min-width: 1024px)");
  const active = useStore(ui, (s) => s.activeProject, 0);
  // Without WebGL there is nothing to put on stage, so the list takes the full width.
  const flat = useStore(ui, (s) => s.webgl === "none", false);
  const listRef = useRef<HTMLOListElement>(null);

  // The project crossing the middle of the viewport is the one on stage.
  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>("[data-project]");
    if (!items) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) ui.set({ activeProject: Number((entry.target as HTMLElement).dataset.project) });
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-12 lg:gap-12">
      <div className={flat ? "hidden" : "hidden lg:col-span-6 lg:block"}>
        <div className="sticky top-[calc(var(--nav-h)+3vh)] h-[calc(100svh-var(--nav-h)-6vh)]">
          <ViewSlot
            id="projects-stage"
            kind="projects"
            enabled={wide === true}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            label={`Interactive 3D object for ${projects[active].title}`}
          />
          <p className="t-label pointer-events-none absolute bottom-2 left-0" aria-live="polite">
            {projects[active].hint.pointer}
          </p>
        </div>
      </div>

      <ol ref={listRef} className={flat ? "lg:col-span-8" : "lg:col-span-6"}>
        {projects.map((p, i) => (
          <li
            key={p.id}
            id={`project-${p.id}`}
            data-project={i}
            className="flex flex-col justify-center border-t border-line py-14 lg:min-h-[78svh] lg:py-20"
          >
            <div className={flat ? "hidden" : "mb-10 lg:hidden"}>
              <div className="relative aspect-square w-full">
                <ViewSlot
                  id={`project-${p.id}`}
                  kind="project"
                  project={i}
                  enabled={wide === false}
                  className="absolute inset-0"
                  label={`Interactive 3D object for ${p.title}`}
                />
              </div>
              <p className="t-label mt-2">{p.hint.touch}</p>
            </div>

            <p className="t-label">
              {p.year} / {p.category}
            </p>
            <h3
              className="mt-4 text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.035em]"
              style={{ fontStretch: "118%" }}
            >
              {p.title}
            </h3>
            <p className="mt-3 text-lg text-muted">{p.subtitle}</p>
            <p className="mt-7 max-w-[56ch] leading-relaxed">{p.description}</p>
            <ul className="mt-7 flex flex-wrap gap-2" aria-label="Built with">
              {p.tech.map((t) => (
                <li
                  key={t}
                  className="rounded-full px-3 py-1 font-mono text-[0.75rem] text-muted ring-1 ring-line ring-inset"
                >
                  {t}
                </li>
              ))}
            </ul>
            {p.links.length > 0 && (
              <div className="mt-9 flex flex-wrap gap-6">
                {p.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-u inline-flex items-center gap-1.5 font-semibold"
                  >
                    {link.label}
                    <ArrowUpRight size={16} weight="bold" aria-hidden />
                    <span className="sr-only">for {p.title} (opens in a new tab)</span>
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
