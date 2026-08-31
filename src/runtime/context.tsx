"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { OverlayState } from "./types.js";

interface Entry { href: string; pathname: string; fallback?: string; trigger?: HTMLElement; }
interface OverlayContextValue extends OverlayState {
  mark(href: string, fallback?: string): void;
  replaceMark(href: string, fallback?: string): void;
  pop(): Entry | undefined;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

function pathnameOf(href: string): string {
  try { return new URL(href, "http://nmr.local").pathname; } catch { return href.split("?")[0] ?? href; }
}

function activeEntries(entries: Entry[], pathname: string): Entry[] {
  let index = -1;
  for (let cursor = entries.length - 1; cursor >= 0; cursor -= 1) {
    if (entries[cursor]?.pathname === pathname) { index = cursor; break; }
  }
  return index < 0 ? [] : entries.slice(0, index + 1);
}

export interface OverlayRouterProviderProps { children: ReactNode; defaultFallback?: string; restoreFocus?: boolean; }

export function OverlayRouterProvider({ children, defaultFallback, restoreFocus = true }: OverlayRouterProviderProps) {
  const pathname = usePathname();
  const [entries, setEntries] = useState<Entry[]>([]);
  const previous = useRef<string | undefined>(undefined);
  const lastPath = useRef(pathname);
  if (lastPath.current !== pathname) { previous.current = lastPath.current; lastPath.current = pathname; }

  const mark = useCallback((href: string, fallback?: string) => {
    const active = typeof document === "undefined" ? undefined : document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    const resolvedFallback = fallback ?? defaultFallback;
    setEntries((current) => [...activeEntries(current, pathname), { href, pathname: pathnameOf(href), ...(resolvedFallback ? { fallback: resolvedFallback } : {}), ...(active ? { trigger: active } : {}) }]);
  }, [defaultFallback, pathname]);
  const replaceMark = useCallback((href: string, fallback?: string) => {
    setEntries((current) => {
      const active = activeEntries(current, pathname);
      const resolvedFallback = fallback ?? active.at(-1)?.fallback ?? defaultFallback;
      return [...active.slice(0, -1), { href, pathname: pathnameOf(href), ...(resolvedFallback ? { fallback: resolvedFallback } : {}) }];
    });
  }, [defaultFallback, pathname]);
  const pop = useCallback(() => {
    const removed = activeEntries(entries, pathname).at(-1);
    if (restoreFocus) queueMicrotask(() => removed?.trigger?.isConnected && removed.trigger.focus());
    return removed;
  }, [entries, pathname, restoreFocus]);
  const active = activeEntries(entries, pathname);
  const top = active.at(-1);
  const value = useMemo<OverlayContextValue>(() => ({
    isOpen: active.length > 0,
    isOverlayNavigation: active.length > 0,
    pathname,
    ...(previous.current ? { previousPathname: previous.current } : {}),
    depth: active.length,
    ...(top?.fallback ? { fallback: top.fallback } : {}),
    canGoBackSafely: Boolean(top && top.pathname === pathname),
    mark, replaceMark, pop,
  }), [active.length, mark, pathname, pop, replaceMark, top]);
  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlayContext(): OverlayContextValue {
  const context = useContext(OverlayContext);
  if (!context) throw new Error("next-modal-router hooks and OverlayLink must be rendered inside OverlayRouterProvider.");
  return context;
}
