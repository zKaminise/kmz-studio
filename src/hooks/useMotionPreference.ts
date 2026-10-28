import { useSyncExternalStore } from "react";
const key = "kmz-studio:reduced-motion";
const listeners = new Set<() => void>();
const query =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : undefined;
let manual = false;
try {
  manual =
    typeof window !== "undefined" && localStorage.getItem(key) === "true";
} catch {
  /* Preference remains local to the visit. */
}
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  query?.addEventListener("change", listener);
  return () => {
    listeners.delete(listener);
    query?.removeEventListener("change", listener);
  };
};
export const useMotionPreference = () =>
  useSyncExternalStore(
    subscribe,
    () => manual || !!query?.matches,
    () => true,
  );
export function toggleMotionReduction() {
  manual = !manual;
  try {
    localStorage.setItem(key, String(manual));
  } catch {
    /* Storage can be unavailable. */
  }
  listeners.forEach((l) => l());
}
export const isMotionReduced = () => manual || !!query?.matches;
