"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Play, ArrowClockwise } from "@phosphor-icons/react";
import { unlock } from "@/lib/achievements";
import { ShipItGame, type Palette } from "./engine";

const BEST_KEY = "shipit-best";
const TARGET = 500;
const JUMP_KEYS = new Set([" ", "ArrowUp", "w", "W"]);

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    bg: v("--bg"),
    ink: v("--ink"),
    muted: v("--muted"),
    line: v("--line-strong"),
    pink: v("--pop-pink"),
    blue: v("--pop-blue"),
    violet: v("--pop-violet"),
    orange: v("--pop-orange"),
  };
}

const pad = (n: number) => String(n).padStart(5, "0");

export default function ShipIt() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const bestRef = useRef<HTMLSpanElement>(null);
  const gameRef = useRef<ShipItGame | null>(null);
  const best = useRef(0);
  /** Starts the frame loop if it is idle; set up by the effect. */
  const kickRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<"idle" | "running" | "over">("idle");
  const [final, setFinal] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    try {
      best.current = Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {}
    if (bestRef.current) bestRef.current.textContent = pad(best.current);

    let shown = -1;
    const game = new ShipItGame(canvas, readPalette(), {
      onScore: (score) => {
        if (score !== shown && scoreRef.current) {
          shown = score;
          scoreRef.current.textContent = pad(score);
        }
        if (score >= TARGET) unlock("ship");
      },
      onOver: (score) => {
        if (score > best.current) {
          best.current = score;
          if (bestRef.current) bestRef.current.textContent = pad(score);
          try {
            localStorage.setItem(BEST_KEY, String(score));
          } catch {}
        }
        setFinal(score);
        setPhase("over");
      },
    });
    game.cool = document.documentElement.dataset.konami === "on";
    gameRef.current = game;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      game.resize(width, height);
    });
    ro.observe(canvas);

    // Repaint with the new palette when the theme or the Konami flag changes.
    const mo = new MutationObserver(() => {
      game.colors = readPalette();
      game.cool = document.documentElement.dataset.konami === "on";
      game.draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-konami"] });

    // Only loop while the game is running and on screen.
    let raf = 0;
    let last = 0;
    let visible = false;
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      game.update(dt);
      game.draw();
      raf = game.state === "running" && visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => {
      if (!raf && game.state === "running" && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      kick();
    });
    io.observe(wrap);
    document.addEventListener("visibilitychange", kick);
    kickRef.current = kick;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", kick);
      gameRef.current = null;
    };
  }, []);

  const begin = () => {
    const game = gameRef.current;
    if (!game) return;
    game.start();
    setPhase("running");
    wrapRef.current?.focus({ preventScroll: true });
    kickRef.current();
  };

  const press = () => {
    const game = gameRef.current;
    if (!game) return;
    if (game.state === "running") game.press();
    else begin();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (JUMP_KEYS.has(e.key) || e.key === "Enter") {
      e.preventDefault();
      if (!e.repeat) press();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (JUMP_KEYS.has(e.key)) gameRef.current?.release();
  };

  return (
    <div>
      <div
        ref={wrapRef}
        tabIndex={0}
        role="application"
        aria-label="Ship It game. Press Space, the up arrow or tap to jump."
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          e.preventDefault();
          wrapRef.current?.focus({ preventScroll: true });
          press();
        }}
        onPointerUp={() => gameRef.current?.release()}
        className="panel relative cursor-pointer touch-manipulation select-none overflow-hidden outline-none focus-visible:border-pop-blue"
        style={{
          ["--panel-shadow" as string]: "var(--pop-pink)",
          background: "color-mix(in oklab, var(--pop-cyan) 16%, var(--raised))",
        }}
      >
        <div className="pointer-events-none absolute right-4 top-3 z-10 flex gap-5 font-mono text-[0.75rem] text-muted md:right-6 md:top-5">
          <span>
            Best <span ref={bestRef} className="text-ink">00000</span>
          </span>
          <span>
            Score <span ref={scoreRef} className="text-ink">00000</span>
          </span>
        </div>

        <canvas ref={canvasRef} className="block aspect-[3/2] w-full font-mono sm:aspect-[2/1] md:aspect-[3/1]" aria-hidden />

        {phase !== "running" && (
          <div className="fade-in absolute inset-0 flex flex-col items-start justify-center gap-4 bg-[color-mix(in_oklab,var(--raised)_62%,transparent)] px-6 md:px-12">
            {phase === "idle" ? (
              <>
                <p
                  className="t-sticker text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-none tracking-[-0.04em] text-pop-pink"
                  style={{ fontStretch: "125%" }}
                >
                  Ship It
                </p>
                <p className="max-w-[40ch] text-sm text-muted md:text-base">
                  <span className="hidden sm:inline">
                    Jump the bugs and merge conflicts, stay low under the 500s, grab coffee. Hold to jump higher.
                  </span>
                  <span className="sm:hidden">Tap to jump over bugs. Hold to jump higher.</span>
                </p>
                <button type="button" className="btn btn-primary" onClick={begin}>
                  <Play size={16} weight="fill" aria-hidden />
                  Play
                </button>
              </>
            ) : (
              <>
                <p className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.04em]" style={{ fontStretch: "125%" }}>
                  Build failed at {final}
                </p>
                <p className="text-sm text-muted md:text-base" aria-live="polite">
                  {final >= TARGET ? "Shipped. Go for a new best." : `${TARGET - final} more to ship.`} Space or tap to redeploy.
                </p>
                <button type="button" className="btn btn-primary" onClick={begin}>
                  <ArrowClockwise size={16} weight="bold" aria-hidden />
                  Redeploy
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
