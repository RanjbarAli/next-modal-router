"use client";

import { useOverlayContext } from "./context.js";
import type { OverlayState } from "./types.js";

export function useOverlayState(): OverlayState {
  const context = useOverlayContext();
  return {
    isOpen: context.isOpen,
    isOverlayNavigation: context.isOverlayNavigation,
    pathname: context.pathname,
    ...(context.previousPathname ? { previousPathname: context.previousPathname } : {}),
    depth: context.depth,
    ...(context.fallback ? { fallback: context.fallback } : {}),
    canGoBackSafely: context.canGoBackSafely,
  };
}
