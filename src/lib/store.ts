import { useSyncExternalStore } from "react";

type Listener = () => void;

export interface Store<T> {
  get: () => T;
  set: (patch: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: Listener) => () => void;
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set: (patch) => {
      const next = typeof patch === "function" ? patch(state) : patch;
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Selectors must return primitives or stable references. */
export function useStore<T extends object, S>(store: Store<T>, selector: (state: T) => S, serverValue?: S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => (serverValue === undefined ? selector(store.get()) : serverValue),
  );
}

export type Theme = "light" | "dark";

export const ui = createStore({
  theme: "dark" as Theme,
  reducedMotion: false,
});
