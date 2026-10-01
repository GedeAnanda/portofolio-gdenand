import { flushSync } from "react-dom";
import { ui, type Theme } from "./store";

// Renamed from "theme" so a dark choice saved by the old design does not override the new light default.
const STORAGE_KEY = "nanda-theme";

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  // Swap every colour at once; per-element colour transitions would replay after the wipe.
  root.classList.add("theme-switching");
  root.dataset.theme = theme;
  flushSync(() => ui.set({ theme }));
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Switches theme with a circular wipe from `origin`, using the View Transitions
 * API where available. The two awaited frames give the game canvas time to
 * redraw with the new palette before the "after" snapshot is taken.
 */
export function setTheme(theme: Theme, origin?: { x: number; y: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode: the choice just won't persist */
  }

  const doc = document as Document & {
    startViewTransition?: (cb: () => Promise<void> | void) => { ready: Promise<void> };
  };

  if (!doc.startViewTransition || ui.get().reducedMotion) {
    applyTheme(theme);
    return;
  }

  const transition = doc.startViewTransition(async () => {
    applyTheme(theme);
    await nextFrame();
    await nextFrame();
  });

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
}
