"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOverlayContext } from "./context.js";
import { decideSafeClose } from "./history.js";
import { withSearchParams, type SearchParamUpdates } from "./search-params.js";
import type { OverlayNavigationOptions, OverlayRouter } from "./types.js";

export function useOverlayRouter(): OverlayRouter {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useOverlayContext();
  const open = useCallback((href: string, options?: OverlayNavigationOptions) => {
    context.mark(href, options?.fallback);
    router.push(href, { scroll: options?.scroll ?? false });
  }, [context, router]);
  const replace = useCallback((href: string, options?: OverlayNavigationOptions) => {
    context.replaceMark(href, options?.fallback);
    router.replace(href, { scroll: options?.scroll ?? false });
  }, [context, router]);
  const close = useCallback((fallback?: string) => {
    const resolvedFallback = fallback ?? context.fallback;
    const decision = decideSafeClose({ depth: context.depth, currentPathname: context.pathname, ...(context.canGoBackSafely ? { entryPathname: context.pathname } : {}), ...(resolvedFallback ? { fallback: resolvedFallback } : {}) });
    context.pop();
    if (decision.action === "back") router.back(); else router.replace(decision.href, { scroll: false });
  }, [context, router]);
  const setSearchParams = useCallback((updates: SearchParamUpdates, options?: { scroll?: boolean }) => {
    router.replace(withSearchParams(context.pathname, searchParams.toString(), updates), { scroll: options?.scroll ?? false });
  }, [context.pathname, router, searchParams]);
  return useMemo(() => ({ ...context, searchParams, open, replace, close, back: router.back, forward: router.forward, refresh: router.refresh, setSearchParams }), [close, context, open, replace, router.back, router.forward, router.refresh, searchParams, setSearchParams]);
}
