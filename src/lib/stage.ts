import type { RefObject } from "react";
import { createStore } from "./store";

/**
 * Every 3D object on the page renders into one shared, fixed WebGL canvas.
 * Sections only place an empty <div> (a "slot"); the lazily loaded Stage
 * draws the matching scene into that div's rectangle each frame.
 */
export type SceneKind = "pins" | "projects" | "project" | "keyboard" | "button";

export interface Slot {
  id: string;
  kind: SceneKind;
  ref: RefObject<HTMLDivElement | null>;
  index: number;
  props?: { project?: number };
}

export const views = createStore({ slots: [] as Slot[] });

/** Updated by an IntersectionObserver; read every frame, never rendered. */
export const slotVisible = new Map<string, boolean>();

export function registerSlot(slot: Slot) {
  views.set((s) => ({ slots: [...s.slots.filter((x) => x.id !== slot.id), slot] }));
}

export function unregisterSlot(id: string) {
  views.set((s) => ({ slots: s.slots.filter((x) => x.id !== id) }));
  slotVisible.delete(id);
  frame.needsFlush = true;
}

export function isSlotVisible(id: string) {
  return slotVisible.get(id) === true;
}

/** Mutable per-frame signals shared between DOM and 3D. Never trigger React renders. */
export const signals = {
  /** Skill name -> timestamp (ms) at which its key should go down. */
  keyPress: new Map<string, number>(),
  /** Window pointer, normalised to [-1, 1]. */
  pointer: { x: 0, y: 0, lastMove: 0 },
  /** 0 while the hero fills the screen, 1 once it has scrolled away. */
  heroProgress: 0,
  /** Timestamp of the last push-button press (ms). */
  buttonPress: 0,
};

/**
 * The GSAP ticker drives Lenis first and then the canvas, so the 3D views are
 * always drawn at the exact scroll position the DOM is painted at.
 */
export const frame = {
  /** R3F's advance(). With frameloop="never" it takes seconds and uses them as the clock time. */
  advance: null as null | ((seconds: number) => void),
  needsFlush: true,
};

export function anySlotVisible() {
  for (const v of slotVisible.values()) if (v) return true;
  return false;
}
