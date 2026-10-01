import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/** Smooth-scrolls to an in-page anchor and moves keyboard focus to it. */
export function scrollToHash(hash: string) {
  const target =
    hash === "#top" || hash === "#" ? document.getElementById("top") : document.querySelector<HTMLElement>(hash);
  if (!target) return false;

  if (lenis) {
    lenis.scrollTo(target, { duration: 1.3 });
  } else {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }

  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  const url = hash === "#top" ? window.location.pathname + window.location.search : hash;
  history.replaceState(null, "", url);
  return true;
}
