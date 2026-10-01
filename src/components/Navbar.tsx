"use client";

import { useEffect, useRef, useState } from "react";
import { CircleHalf, List, X } from "@phosphor-icons/react/dist/ssr";
import { navLinks } from "@/lib/site";
import { ui, useStore } from "@/lib/store";
import { setTheme } from "@/lib/theme";
import { unlock } from "@/lib/achievements";
import { TrophyButton } from "./Achievements";
import { getLenis, scrollToHash } from "@/lib/scroll";

function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useStore(ui, (s) => s.theme, "dark");
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
        unlock("theme");
      }}
      className={`grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/8 ${className}`}
      aria-label={`Switch to ${next} theme`}
    >
      <CircleHalf size={20} weight="bold" aria-hidden />
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sentinel = document.getElementById("nav-sentinel");
    if (!sentinel) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map((l) => document.querySelector<HTMLElement>(l.href))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(`#${entry.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    const top = document.getElementById("top");
    const topIo = new IntersectionObserver(([entry]) => entry.isIntersecting && setActive(""), {
      rootMargin: "-45% 0px -50% 0px",
    });
    if (top) topIo.observe(top);
    return () => {
      io.disconnect();
      topIo.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const toggle = toggleRef.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
      toggle?.focus();
    };
  }, [open]);

  return (
    <>
      <div id="nav-sentinel" aria-hidden className="pointer-events-none absolute left-0 top-0 h-24 w-px" />
      <header
        className="fixed inset-x-0 top-0 transition-[background-color,box-shadow,backdrop-filter] duration-300"
        style={{
          zIndex: "var(--z-nav)",
          background: scrolled ? "color-mix(in oklab, var(--bg) 84%, transparent)" : "transparent",
          boxShadow: scrolled ? "0 1px 0 var(--line)" : "none",
          backdropFilter: scrolled ? "blur(14px) saturate(1.2)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px) saturate(1.2)" : "none",
        }}
      >
        <nav aria-label="Main" className="container-x flex h-16 items-center justify-between">
          <a
            href="#top"
            className="text-2xl font-extrabold tracking-[-0.04em] text-accent-text"
            style={{ fontStretch: "125%" }}
            aria-label="Nanda, back to top"
          >
            N.
          </a>
          <ul className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={active === link.href ? "true" : undefined}
                  className="relative rounded-full px-3.5 py-2.5 text-[0.9375rem] font-medium text-muted transition-colors hover:text-ink aria-[current=true]:text-ink"
                >
                  {link.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-3.5 bottom-1 h-px origin-left bg-accent transition-transform duration-300"
                    style={{ transform: active === link.href ? "scaleX(1)" : "scaleX(0)" }}
                  />
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1">
            <TrophyButton className="mr-1" />
            <ThemeToggle />
            <button
              ref={toggleRef}
              type="button"
              className="grid size-11 place-items-center rounded-full text-ink lg:hidden"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Open menu"
            >
              <List size={22} weight="bold" aria-hidden />
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 flex flex-col bg-bg lg:hidden"
          style={{ zIndex: "var(--z-menu)" }}
        >
          <div className="container-x flex h-16 items-center justify-between">
            <span
              className="text-2xl font-extrabold tracking-[-0.04em] text-accent-text"
              style={{ fontStretch: "125%" }}
            >
              N.
            </span>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full text-ink"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={22} weight="bold" aria-hidden />
            </button>
          </div>
          <ul className="container-x mt-6 flex flex-1 flex-col gap-1">
            {navLinks.map((link, i) => (
              <li key={link.href} className="hero-rise" style={{ ["--d" as string]: `${60 + i * 50}ms` }}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    // Close first: scrolling is locked while the menu is open.
                    e.preventDefault();
                    setOpen(false);
                    requestAnimationFrame(() => requestAnimationFrame(() => scrollToHash(link.href)));
                  }}
                  className="block py-2 text-5xl font-bold tracking-[-0.03em] text-ink"
                  style={{ fontStretch: "115%" }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
