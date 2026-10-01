"use client";

import { useEffect, useRef } from "react";
import {
  Brain,
  Broadcast,
  Browser,
  Check,
  CircleHalf,
  CookingPot,
  EnvelopeSimple,
  ForkKnife,
  GameController,
  Key,
  Keyboard,
  Lock,
  MapTrifold,
  Printer,
  RocketLaunch,
  Trophy,
  X,
  type Icon,
} from "@phosphor-icons/react";
import {
  achievements,
  dismissToast,
  progress,
  resetProgress,
  setPanelOpen,
  type AchievementId,
  type Toast,
} from "@/lib/achievements";
import { useStore } from "@/lib/store";
import { getLenis } from "@/lib/scroll";
import { site } from "@/lib/site";

const icons: Record<AchievementId, Icon> = {
  tour: MapTrifold,
  scroll: Browser,
  print: Printer,
  macro: ForkKnife,
  fridge: CookingPot,
  token: Key,
  live: Broadcast,
  human: Brain,
  beat: Trophy,
  ship: RocketLaunch,
  keys: Keyboard,
  theme: CircleHalf,
  hello: EnvelopeSimple,
  konami: GameController,
};

const total = achievements.length;
const TINTS = ["var(--pop-pink)", "var(--pop-blue)", "var(--pop-lime)", "var(--pop-orange)", "var(--pop-violet)", "var(--pop-cyan)", "var(--pop-yellow)"];
/** Each achievement keeps one colour wherever its badge shows up. */
const tintOf = (id: AchievementId) => TINTS[achievements.findIndex((a) => a.id === id) % TINTS.length];
const byId = Object.fromEntries(achievements.map((a) => [a.id, a])) as Record<AchievementId, (typeof achievements)[number]>;

function useUnlockedCount() {
  return useStore(progress, (s) => Object.keys(s.unlocked).length, 0);
}

/* ------------------------------------------------------------------ */

export function TrophyButton({ className = "" }: { className?: string }) {
  const count = useUnlockedCount();
  return (
    <button
      type="button"
      onClick={() => setPanelOpen(true)}
      className={`inline-flex h-10 items-center gap-2 rounded-full border-2 border-edge bg-pop-yellow px-3.5 font-mono text-[0.75rem] font-semibold text-[#17141f] shadow-[3px_3px_0_var(--hard)] transition-[transform,box-shadow] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--hard)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${className}`}
      aria-label={`Achievements, ${count} of ${total} unlocked`}
      aria-haspopup="dialog"
    >
      <Trophy size={16} weight={count > 0 ? "fill" : "bold"} aria-hidden />
      <span key={count} className={count > 0 ? "toast-in" : undefined}>
        {count}/{total}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */

function ToastCard({ toast }: { toast: Toast }) {
  useEffect(() => {
    const id = window.setTimeout(() => dismissToast(toast.key), toast.kind === "info" ? 7000 : 4800);
    return () => window.clearTimeout(id);
  }, [toast]);

  if (toast.kind === "info") {
    return (
      <div className="toast-in panel pointer-events-auto flex gap-3 p-4 pr-3" style={{ ["--panel-shadow" as string]: "var(--pop-pink)" }}>
        <span className="grid size-10 flex-none place-items-center rounded-full border-2 border-edge bg-pop-pink text-[#17141f]">
          <GameController size={20} weight="fill" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-snug">{toast.title}</p>
          <p className="mt-1 text-sm leading-snug text-muted">{toast.body}</p>
          <button type="button" className="link-u mt-2 text-sm font-semibold" onClick={() => setPanelOpen(true)}>
            See the list
          </button>
        </div>
        <button
          type="button"
          className="grid size-8 flex-none place-items-center rounded-full text-muted hover:text-ink"
          onClick={() => dismissToast(toast.key)}
          aria-label="Dismiss"
        >
          <X size={14} weight="bold" aria-hidden />
        </button>
      </div>
    );
  }

  const a = byId[toast.id];
  const Glyph = icons[toast.id];
  return (
    <button
      type="button"
      onClick={() => {
        dismissToast(toast.key);
        setPanelOpen(true);
      }}
      className="toast-in panel pointer-events-auto flex w-full items-center gap-3 p-3 pr-5 text-left"
      style={{ ["--panel-shadow" as string]: tintOf(toast.id) }}
    >
      <span
        className="grid size-11 flex-none place-items-center rounded-full border-2 border-edge text-[#17141f]"
        style={{ background: tintOf(toast.id) }}
      >
        <Glyph size={22} weight="fill" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="t-label block">Achievement unlocked</span>
        <span className="block font-semibold leading-snug">{a.title}</span>
      </span>
    </button>
  );
}

export function AchievementToasts() {
  const toasts = useStore(progress, (s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 flex flex-col gap-2 sm:right-auto sm:w-[360px]"
      style={{ zIndex: "var(--z-toast)" }}
    >
      {toasts.slice(-3).map((t) => (
        <ToastCard key={t.key} toast={t} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function AchievementPanel() {
  const open = useStore(progress, (s) => s.panelOpen, false);
  const unlocked = useStore(progress, (s) => s.unlocked);
  const count = Object.keys(unlocked).length;
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
      if (e.key !== "Tab" || !dialogRef.current) return;
      // Keep focus inside the panel.
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>("button, a[href]");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
      returnFocus.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-end" style={{ zIndex: "var(--z-menu)" }}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        className="fade-in absolute inset-0 cursor-default bg-[rgb(var(--shadow)/0.45)] backdrop-blur-[2px]"
        onClick={() => setPanelOpen(false)}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievements-title"
        className="toast-in relative m-2 flex w-full max-w-[440px] flex-col overflow-hidden rounded-(--radius-frame) border-2 border-edge bg-bg shadow-[6px_6px_0_var(--pop-yellow)] sm:m-3"
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-5 pt-6">
          <div>
            <h2 id="achievements-title" className="text-2xl font-bold tracking-[-0.02em]" style={{ fontStretch: "112%" }}>
              Achievements
            </h2>
            <p className="mt-1 text-sm text-muted">
              {count} of {total} unlocked. Everything on this page is playable.
            </p>
          </div>
          <button
            type="button"
            className="grid size-10 flex-none place-items-center rounded-full ring-1 ring-line ring-inset hover:ring-ink"
            onClick={() => setPanelOpen(false)}
            aria-label="Close achievements"
          >
            <X size={16} weight="bold" aria-hidden />
          </button>
        </div>

        <div className="flex gap-1 px-6" aria-hidden>
          {achievements.map((a, i) => (
            <span
              key={a.id}
              className={`h-2.5 flex-1 rounded-full border-[1.5px] ${i < count ? "border-edge" : "border-line bg-ink/5"}`}
              style={i < count ? { background: TINTS[i % TINTS.length] } : undefined}
            />
          ))}
        </div>

        <ul className="mt-4 flex-1 overflow-y-auto overscroll-contain px-3 pb-3" data-lenis-prevent>
          {achievements.map((a) => {
            const done = unlocked[a.id] !== undefined;
            const hidden = a.secret && !done;
            const Glyph = icons[a.id];
            return (
              <li key={a.id} className="flex items-center gap-3.5 rounded-2xl px-3 py-3">
                <span
                  className={`grid size-11 flex-none place-items-center rounded-full border-2 ${
                    done ? "border-edge text-[#17141f]" : "border-line text-muted"
                  }`}
                  style={done ? { background: tintOf(a.id) } : undefined}
                >
                  {hidden ? <Lock size={18} aria-hidden /> : <Glyph size={20} weight={done ? "fill" : "regular"} aria-hidden />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold leading-snug ${done ? "" : "text-ink/80"}`}>{hidden ? "Secret" : a.title}</p>
                  <p className="text-sm leading-snug text-muted">{hidden ? "Keep exploring." : a.hint}</p>
                </div>
                {done && (
                  <Check size={18} weight="bold" className="flex-none text-ok" aria-label="Unlocked" />
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4">
          {count === total ? (
            <p className="text-sm">
              All done. Say hi at{" "}
              <a href={`mailto:${site.email}`} className="link-u font-semibold">
                {site.email}
              </a>
            </p>
          ) : (
            <p className="text-sm text-muted">Progress stays in this browser.</p>
          )}
          <button
            type="button"
            className="link-u text-sm font-semibold"
            onClick={resetProgress}
            disabled={count === 0}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
