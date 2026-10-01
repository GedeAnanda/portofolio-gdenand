"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { JourneyItem, JourneyTag } from "@/lib/journey";

/*
 * A split-flap departures board. Cells are rendered with their final
 * characters (so the text is there without JavaScript), then blanked and
 * flipped into place the first time the board scrolls into view.
 */

const TITLE_CELLS = 21;
const TAG_CELLS = 11;
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const tagLabel: Record<JourneyTag, string> = {
  Achievement: "ACHIEVEMENT",
  Community: "COMMUNITY",
  "On Going": "ONGOING",
};

const pad = (s: string, n: number) => s.toUpperCase().padEnd(n, " ").slice(0, n);

const Cells = memo(function Cells({ text, tone }: { text: string; tone?: "accent" | "dim" }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span key={i} className="sf" data-char={ch} data-tone={tone}>
          <span className="sf-half sf-top">
            <span>{ch}</span>
          </span>
          <span className="sf-half sf-bottom">
            <span>{ch}</span>
          </span>
          <span className="sf-flap sf-flap-top">
            <span />
          </span>
          <span className="sf-flap sf-flap-bottom">
            <span />
          </span>
        </span>
      ))}
    </>
  );
});

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function flip(cell: HTMLElement, from: string, to: string, duration: number) {
  const [top, bottom, flapTop, flapBottom] = Array.from(cell.children) as HTMLElement[];
  const set = (el: HTMLElement, ch: string) => ((el.firstElementChild as HTMLElement).textContent = ch);
  set(top, to);
  set(flapTop, from);
  set(flapBottom, to);
  flapTop.style.visibility = "visible";
  await flapTop.animate([{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }], {
    duration,
    easing: "cubic-bezier(0.55, 0, 1, 0.45)",
  }).finished;
  flapTop.style.visibility = "hidden";
  flapBottom.style.visibility = "visible";
  await flapBottom.animate([{ transform: "rotateX(90deg)" }, { transform: "rotateX(0deg)" }], {
    duration,
    easing: "cubic-bezier(0, 0.55, 0.45, 1)",
  }).finished;
  set(bottom, to);
  flapBottom.style.visibility = "hidden";
}

async function settle(cell: HTMLElement, delay: number) {
  const target = cell.dataset.char ?? " ";
  await wait(delay);
  let current = " ";
  const spins = target === " " ? 0 : 2 + Math.floor(Math.random() * 4);
  for (let s = 0; s < spins; s++) {
    const next = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    await flip(cell, current, next, 34);
    current = next;
  }
  if (current !== target) await flip(cell, current, target, 52);
}

export default function DepartureBoard({ items }: { items: JourneyItem[] }) {
  const [selected, setSelected] = useState(items.length - 1);
  const boardRef = useRef<HTMLDivElement>(null);
  const item = items[selected];

  useEffect(() => {
    const board = boardRef.current;
    if (!board || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const rows = Array.from(board.querySelectorAll<HTMLElement>("[data-row]"));
        rows.forEach((row, r) => {
          const cells = Array.from(row.querySelectorAll<HTMLElement>(".sf")).filter((c) => c.offsetParent !== null);
          cells.forEach((cell) => {
            cell.querySelectorAll<HTMLElement>(".sf-half > span").forEach((s) => (s.textContent = " "));
          });
          cells.forEach((cell, c) => void settle(cell, r * 110 + c * 22));
        });
      },
      { threshold: 0.35 },
    );
    io.observe(board);
    return () => io.disconnect();
  }, []);

  return (
    <div className="mt-14 md:mt-20">
      <div className="@container">
        <div ref={boardRef} className="board overflow-hidden p-2.5 md:p-5">
          <div
            aria-hidden
            className="flex px-2.5 pb-3 pt-1 font-mono text-[0.6875rem] tracking-[0.08em] text-[#8d8d87]"
          >
            <span className="hidden md:inline" style={{ width: "calc((var(--cell-w) + var(--cell-gap)) * 5)" }}>
              YEAR
            </span>
            <span style={{ width: `calc((var(--cell-w) + var(--cell-gap)) * ${TITLE_CELLS + 1})` }}>MILESTONE</span>
            <span className="hidden md:inline">STATUS</span>
          </div>
          <ul>
            {items.map((it, i) => (
              <li key={it.title}>
                <button
                  type="button"
                  data-row
                  className="board-row flex-col items-start md:flex-row md:items-center"
                  aria-pressed={selected === i}
                  onClick={() => setSelected(i)}
                  aria-label={`${it.year}, ${it.title}, ${it.tag}`}
                >
                  <span aria-hidden className="mb-1 font-mono text-[0.6875rem] text-[#8d8d87] md:hidden">
                    {it.year}
                  </span>
                  <span aria-hidden className="flex">
                    <span className="hidden md:flex">
                      <Cells text={String(it.year)} />
                      <span style={{ width: "calc(var(--cell-w) + var(--cell-gap))" }} />
                    </span>
                    <Cells text={pad(it.board, TITLE_CELLS)} />
                    <span className="hidden md:flex">
                      <span style={{ width: "calc(var(--cell-w) + var(--cell-gap))" }} />
                      <Cells text={pad(tagLabel[it.tag], TAG_CELLS)} tone={it.tag === "On Going" ? "accent" : "dim"} />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div key={selected} className="hero-rise mt-10 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-12 md:gap-8" aria-live="polite">
        <p className="t-label md:col-span-3">
          {item.year} / {item.tag === "On Going" ? "Ongoing" : item.tag}
        </p>
        <div className="md:col-span-8 md:col-start-5">
          <h3 className="text-[clamp(1.5rem,2.4vw,2.25rem)] font-semibold leading-tight tracking-[-0.02em]">
            {item.title}
          </h3>
          <p lang="id" className="mt-4 max-w-[60ch] leading-relaxed text-muted">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}
