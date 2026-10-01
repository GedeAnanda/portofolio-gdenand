"use client";

import { useEffect, useRef } from "react";
import { categoryLabels, categoryOrder, projectsUsing, skills } from "@/lib/skills";
import { ui, useStore } from "@/lib/store";
import { signals } from "@/lib/stage";
import ViewSlot from "./ui/ViewSlot";

function pressSkill(name: string) {
  signals.keyPress.set(name, performance.now());
  ui.set({ selectedSkill: name });
}

export default function SkillBoard() {
  const selected = useStore(ui, (s) => s.selectedSkill, "Go");
  const webgl = useStore(ui, (s) => s.webgl, "unknown");
  const rootRef = useRef<HTMLDivElement>(null);
  const skill = skills.find((s) => s.name === selected) ?? skills[0];
  const usedIn = projectsUsing(skill.name);

  // Typing a letter while this section is on screen presses every key that starts with it.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let inView = false;
    const io = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), { threshold: 0.25 });
    io.observe(root);
    const onKey = (e: KeyboardEvent) => {
      if (!inView || e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const letter = e.key.toLowerCase();
      const matches = skills.filter((s) => s.name.toLowerCase().startsWith(letter));
      if (!matches.length) return;
      const now = performance.now();
      matches.forEach((s, i) => signals.keyPress.set(s.name, now + i * 60));
      ui.set({ selectedSkill: matches[0].name });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="container-x mt-12 grid gap-12 md:mt-16 lg:grid-cols-12 lg:gap-10">
      <div className={`lg:col-span-8 ${webgl === "none" ? "hidden" : ""}`}>
        <div className="relative aspect-video w-full sm:aspect-[16/12]">
          <ViewSlot
            id="keyboard"
            kind="keyboard"
            className="absolute inset-0"
            label="A 3D keyboard where every key is one of the skills listed"
          />
        </div>
      </div>

      <div className="flex flex-col gap-12 lg:col-span-4 lg:pt-6">
        <div aria-live="polite" className="min-h-[9.5rem]">
          <p className="t-label">{categoryLabels[skill.category]}</p>
          <p
            className="mt-3 text-[clamp(2.25rem,4vw,3.25rem)] font-bold leading-none tracking-[-0.035em]"
            style={{ fontStretch: "118%" }}
          >
            {skill.name}
          </p>
          <p className="mt-4 text-muted">
            {usedIn.length > 0 ? (
              <>
                Used in{" "}
                {usedIn.map((p, i) => (
                  <span key={p.id}>
                    <a href={`#project-${p.id}`} className="link-u font-medium text-ink">
                      {p.title}
                    </a>
                    {i < usedIn.length - 2 ? ", " : i === usedIn.length - 2 ? " and " : "."}
                  </span>
                ))}
              </>
            ) : (
              "Not part of the four projects above."
            )}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {categoryOrder.map((cat) => (
            <div key={cat}>
              <p className="t-label mb-2.5">{categoryLabels[cat]}</p>
              <div className="flex flex-wrap gap-2">
                {skills
                  .filter((s) => s.category === cat)
                  .map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      className="chip"
                      aria-pressed={selected === s.name}
                      onClick={() => pressSkill(s.name)}
                    >
                      {s.name}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
