export type RouteSegmentKind = "static" | "dynamic" | "catch-all" | "optional-catch-all" | "group" | "slot";

export interface RouteSegment {
  raw: string;
  kind: RouteSegmentKind;
  name: string;
  contributesToUrl: boolean;
}

const UNSAFE = /(?:^|\/)\.\.?($|\/)|[\\\0]/;

export function normalizeRoute(route: string): string {
  if (!route.startsWith("/")) throw new Error(`Route "${route}" must begin with "/".`);
  if (UNSAFE.test(route)) throw new Error(`Route "${route}" contains an unsafe filesystem segment.`);
  const normalized = `/${route.split("/").filter(Boolean).join("/")}`;
  return normalized === "/" ? normalized : normalized.replace(/\/$/, "");
}

export function parseSegment(raw: string): RouteSegment {
  if (/^\[\[\.\.\.[^\]/]+\]\]$/.test(raw)) return { raw, kind: "optional-catch-all", name: raw.slice(5, -2), contributesToUrl: true };
  if (/^\[\.\.\.[^\]/]+\]$/.test(raw)) return { raw, kind: "catch-all", name: raw.slice(4, -1), contributesToUrl: true };
  if (/^\[[^\]/]+\]$/.test(raw)) return { raw, kind: "dynamic", name: raw.slice(1, -1), contributesToUrl: true };
  if (/^\([^/]+\)$/.test(raw)) return { raw, kind: "group", name: raw.slice(1, -1), contributesToUrl: false };
  if (/^@[A-Za-z][\w-]*$/.test(raw)) return { raw, kind: "slot", name: raw.slice(1), contributesToUrl: false };
  if (!raw || raw.includes("[") || raw.includes("]")) throw new Error(`Invalid route segment "${raw}".`);
  return { raw, kind: "static", name: raw, contributesToUrl: true };
}

export function routeSegments(route: string): RouteSegment[] {
  return normalizeRoute(route).split("/").filter(Boolean).map(parseSegment);
}

export function urlSegments(route: string): string[] {
  return routeSegments(route).filter((segment) => segment.contributesToUrl).map((segment) => segment.raw);
}

export function routeToFileSegments(route: string): string[] {
  return routeSegments(route).map((segment) => segment.raw);
}
