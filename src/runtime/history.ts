export interface SafeCloseInput {
  depth: number;
  currentPathname: string;
  entryPathname?: string;
  fallback?: string;
}

export type SafeCloseDecision = { action: "back" } | { action: "replace"; href: string };

export function decideSafeClose(input: SafeCloseInput): SafeCloseDecision {
  if (input.depth > 0 && input.entryPathname === input.currentPathname) return { action: "back" };
  if (input.fallback) return { action: "replace", href: input.fallback };
  return { action: "replace", href: "/" };
}
