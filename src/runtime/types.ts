import type { ReadonlyURLSearchParams } from "next/navigation";
import type { SearchParamUpdates } from "./search-params.js";

export interface OverlayNavigationOptions { fallback?: string; scroll?: boolean; }
export interface OverlayState {
  isOpen: boolean;
  isOverlayNavigation: boolean;
  pathname: string;
  previousPathname?: string;
  depth: number;
  fallback?: string;
  canGoBackSafely: boolean;
}
export interface OverlayRouter extends OverlayState {
  searchParams: ReadonlyURLSearchParams;
  open(href: string, options?: OverlayNavigationOptions): void;
  replace(href: string, options?: OverlayNavigationOptions): void;
  close(fallback?: string): void;
  back(): void;
  forward(): void;
  refresh(): void;
  setSearchParams(updates: SearchParamUpdates, options?: { scroll?: boolean }): void;
}
