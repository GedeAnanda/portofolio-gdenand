"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

interface ThemeContextType {
  theme: "dark" | "light";
  toggleTheme: (e?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Read saved preference on mount — NO more "mounted" guard
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved && saved !== "dark") {
      setTheme(saved);
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = useCallback(
    (e?: React.MouseEvent) => {
      const next = theme === "dark" ? "light" : "dark";
      const x = e ? e.clientX : window.innerWidth / 2;
      const y = e ? e.clientY : window.innerHeight / 2;

      if (overlayRef.current) {
        const overlay = overlayRef.current;
        overlay.style.background = next === "dark" ? "#0a0a0a" : "#fafafa";
        overlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;
        overlay.style.display = "block";

        requestAnimationFrame(() => {
          const maxDim = Math.max(window.innerWidth, window.innerHeight);
          const radius = Math.sqrt(maxDim * maxDim + maxDim * maxDim);
          overlay.style.transition =
            "clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
          overlay.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;

          setTimeout(() => {
            setTheme(next);
            document.documentElement.classList.toggle("light", next === "light");
            localStorage.setItem("theme", next);
            overlay.style.display = "none";
            overlay.style.transition = "none";
          }, 800);
        });
      } else {
        setTheme(next);
        document.documentElement.classList.toggle("light", next === "light");
        localStorage.setItem("theme", next);
      }
    },
    [theme]
  );

  // ALWAYS render children — no more "return null" on unmounted
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      <div
        ref={overlayRef}
        className="theme-transition"
        style={{ display: "none" }}
      />
    </ThemeContext.Provider>
  );
}
