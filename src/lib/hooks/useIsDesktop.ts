"use client";
import { useSyncExternalStore } from "react";

export function useIsDesktop(breakpoint = 768): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(`(min-width: ${breakpoint}px)`).matches,
    () => false
  );
}
