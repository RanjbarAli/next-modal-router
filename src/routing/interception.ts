import { normalizeRoute, urlSegments } from "./segments.js";

export type InterceptionMarker = "(.)" | "(..)" | "(..)(..)" | "(...)" | string;

export interface InterceptionResult {
  marker: InterceptionMarker;
  target: string;
  filesystemPath: string;
  levelsUp: number;
}

/** Calculates a matcher from the route level that owns the parallel slot. */
export function calculateInterception(slotOwnerRoute: string, targetRoute: string): InterceptionResult {
  const owner = urlSegments(slotOwnerRoute);
  const target = urlSegments(targetRoute);
  let common = 0;
  while (common < owner.length && common < target.length && owner[common] === target[common]) common += 1;
  const levelsUp = owner.length - common;
  const relativeTarget = target.slice(common).join("/");
  if (!relativeTarget) throw new Error(`Target ${normalizeRoute(targetRoute)} cannot equal the slot owner route.`);
  const marker = levelsUp === 0 ? "(.)" : common === 0 ? "(...)" : "(..)".repeat(levelsUp);
  return { marker, target: `/${target.join("/")}`, filesystemPath: `${marker}${relativeTarget}`, levelsUp };
}

export function parseInterceptor(value: string): { marker: string; target: string } | null {
  const match = /^(\(\.\)|(?:\(\.\.\))+|\(\.\.\.\))(.+)$/.exec(value.replaceAll("\\", "/"));
  return match?.[1] && match[2] ? { marker: match[1], target: match[2].replace(/^\//, "") } : null;
}
