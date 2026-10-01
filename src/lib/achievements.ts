import { createStore } from "./store";
import { SVM_ACCURACY, type ProjectId } from "./projects";

export type AchievementId =
  | "tour"
  | "scroll"
  | "macro"
  | "fridge"
  | "token"
  | "live"
  | "human"
  | "beat"
  | "ship"
  | "keys"
  | "theme"
  | "hello"
  | "konami";

export interface Achievement {
  id: AchievementId;
  title: string;
  /** How to earn it. Secret achievements show this only once unlocked. */
  hint: string;
  secret?: boolean;
}

export const achievements: Achievement[] = [
  { id: "tour", title: "Full tour", hint: "Scroll past all five projects." },
  { id: "scroll", title: "Window shopper", hint: "Scroll the FirStep landing page down to its footer." },
  { id: "macro", title: "Macro counter", hint: "Log a scanned meal in the LensLift prototype." },
  { id: "fridge", title: "Fridge raider", hint: "Find a recipe with the Olahin API console." },
  { id: "token", title: "Authorized", hint: "Get a 200 from a protected Olahin route." },
  { id: "live", title: "Gone live", hint: "Run Smoothies Sultan inside its browser frame." },
  { id: "human", title: "Human classifier", hint: "Finish a round of Beat the Model." },
  { id: "beat", title: "Better than SVM", hint: `Score above ${SVM_ACCURACY}% in Beat the Model.` },
  { id: "ship", title: "Shipped", hint: "Reach 500 points in Ship It." },
  { id: "keys", title: "Key smasher", hint: "Press six different skill keys." },
  { id: "theme", title: "Other side", hint: "Switch the colour theme." },
  { id: "hello", title: "Said hi", hint: "Copy my email address." },
  { id: "konami", title: "Old school", hint: "Entered the Konami code.", secret: true },
];

export type Toast =
  | { key: number; kind: "achievement"; id: AchievementId }
  | { key: number; kind: "info"; title: string; body: string };

const STORAGE_KEY = "nanda-progress-v1";

export const progress = createStore({
  unlocked: {} as Partial<Record<AchievementId, number>>,
  seen: [] as ProjectId[],
  toasts: [] as Toast[],
  panelOpen: false,
});

let toastKey = 0;

function persist() {
  const { unlocked, seen } = progress.get();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlocked, seen }));
  } catch {
    /* private mode: progress just won't survive a reload */
  }
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as { unlocked?: Partial<Record<AchievementId, number>>; seen?: ProjectId[] };
    progress.set({ unlocked: saved.unlocked ?? {}, seen: saved.seen ?? [] });
  } catch {
    /* corrupt or blocked storage: start fresh */
  }
}

export function isUnlocked(id: AchievementId) {
  return progress.get().unlocked[id] !== undefined;
}

export function unlock(id: AchievementId) {
  if (isUnlocked(id)) return;
  progress.set((s) => ({
    unlocked: { ...s.unlocked, [id]: Date.now() },
    toasts: [...s.toasts, { key: ++toastKey, kind: "achievement", id }],
  }));
  persist();
}

export function notify(title: string, body: string) {
  progress.set((s) => ({ toasts: [...s.toasts, { key: ++toastKey, kind: "info", title, body }] }));
}

export function dismissToast(key: number) {
  progress.set((s) => ({ toasts: s.toasts.filter((t) => t.key !== key) }));
}

export function markProjectSeen(id: ProjectId, total: number) {
  const { seen } = progress.get();
  if (seen.includes(id)) return;
  const next = [...seen, id];
  progress.set({ seen: next });
  persist();
  if (next.length >= total) unlock("tour");
}

export function resetProgress() {
  progress.set({ unlocked: {}, seen: [] });
  persist();
}

export function setPanelOpen(open: boolean) {
  progress.set({ panelOpen: open });
}
