"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ui, useStore } from "@/lib/store";
import { frame, registerSlot, slotVisible, unregisterSlot, type SceneKind } from "@/lib/stage";

interface ViewSlotProps {
  id: string;
  kind: SceneKind;
  /** Render order inside the shared canvas. */
  index?: number;
  project?: number;
  /** When false the box still takes up space but nothing is drawn into it. */
  enabled?: boolean | null;
  className?: string;
  /** Screen-reader description of what the 3D view shows. */
  label?: string;
  /** Shown only when the device cannot run WebGL 2. */
  fallback?: ReactNode;
}

export default function ViewSlot({
  id,
  kind,
  index = 1,
  project,
  enabled = true,
  className,
  label,
  fallback,
}: ViewSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const webgl = useStore(ui, (s) => s.webgl, "unknown");

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    registerSlot({ id, kind, ref, index, props: { project } });
    const io = new IntersectionObserver(
      ([entry]) => {
        slotVisible.set(id, entry.isIntersecting);
        frame.needsFlush = true;
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      unregisterSlot(id);
    };
  }, [id, kind, index, project, enabled]);

  return (
    <div ref={ref} data-slot={id} className={className} role={label ? "img" : undefined} aria-label={label}>
      {webgl === "none" ? fallback : null}
    </div>
  );
}
