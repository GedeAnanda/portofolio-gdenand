"use client";

import { useEffect, useRef, useState } from "react";
import { categoryLabels, categoryOrder, categoryTint, projectsUsing, skills } from "@/lib/skills";
import { unlock } from "@/lib/achievements";

const KEYS_GOAL = 6;

export default function SkillKeys() {
  const [selected, setSelected] = useState("Go");
  const rootRef = useRef<HTMLDivElement>(null);
  const pressed = useRef(new Set<string>());
  const skill = skills.find((s) => s.name === selected) ?? skills[0];
  const usedIn = projectsUsing(skill.name);

  const press = (name: string, delay = 0) => {
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(name)}"]`);
    window.setTimeout(() => {
      if (el) {
        el.dataset.down = "";
        window.setTimeout(() => delete el.dataset.down, 150);
      }
    }, delay);
    pressed.current.add(name);
    if (pressed.current.size >= KEYS_GOAL) unlock("keys");
  };

  // Typing a letter while the keyboard is on screen presses every key that starts with it.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let inView = false;
    const io = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), { threshold: 0.3 });
    io.observe(root);
    const onKey = (e: KeyboardEvent) => {
      if (!inView || e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], [role='application']")) return;
      const letter = e.key.toLowerCase();
      const matches = skills.filter((s) => s.name.toLowerCase().startsWith(letter));
      if (!matches.length) return;
      matches.forEach((s, i) => press(s.name, i * 60));
      setSelected(matches[0].name);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="panel bg-sunken p-4 md:p-6 lg:col-span-8" style={{ ["--panel-shadow" as string]: "var(--pop-cyan)", background: "var(--sunken)" }}>
        <div className="flex flex-col gap-5">
          {categoryOrder.map((cat) => (
            <div key={cat} className="grid grid-cols-1 gap-3 md:grid-cols-[5.5rem_1fr] md:items-center">
              <p className="t-label">{categoryLabels[cat]}</p>
              <div className="flex flex-wrap gap-x-2.5 gap-y-3.5 pb-1.5">
                {skills
                  .filter((s) => s.category === cat)
                  .map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      data-key={s.name}
                      className="keycap"
                      style={{ ["--key" as string]: categoryTint[cat] }}
                      aria-pressed={selected === s.name}
                      onClick={() => {
                        press(s.name);
                        setSelected(s.name);
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 lg:pt-4" aria-live="polite">
        <p>
          <span className="sticker" style={{ ["--tint" as string]: categoryTint[skill.category], ["--r" as string]: "-2deg" }}>
            {categoryLabels[skill.category]}
          </span>
        </p>
        <p className="t-title mt-5">{skill.name}</p>
        <p className="mt-5 leading-relaxed text-muted">
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
            "Not part of the six projects on this page."
          )}
        </p>
        <p className="t-label mt-8 hidden [@media(hover:hover)]:block">Type a letter to press its keys.</p>
      </div>
    </div>
  );
}
