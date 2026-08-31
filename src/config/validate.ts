import { OVERLAY_TYPES, type OverlayConfig, type OverlayDefinition } from "./types.js";
import { normalizeRoute } from "../routing/segments.js";

export interface ConfigProblem {
  path: string;
  message: string;
}

export function validateConfig(value: unknown): ConfigProblem[] {
  const problems: ConfigProblem[] = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [{ path: "config", message: "Configuration must be an object." }];
  }
  const config = value as Partial<OverlayConfig>;
  if (!config.overlays || typeof config.overlays !== "object" || Array.isArray(config.overlays)) {
    return [{ path: "overlays", message: "An overlays object is required." }];
  }
  const targets = new Map<string, string>();
  for (const [name, raw] of Object.entries(config.overlays)) {
    const path = `overlays.${name}`;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      problems.push({ path, message: "Overlay must be an object." });
      continue;
    }
    const overlay = raw as Partial<OverlayDefinition>;
    for (const key of ["route", "source", "closeFallback"] as const) {
      if (typeof overlay[key] !== "string" || overlay[key].length === 0) {
        problems.push({ path: `${path}.${key}`, message: `${key} is required.` });
      } else {
        try { normalizeRoute(overlay[key]); } catch (error) {
          problems.push({ path: `${path}.${key}`, message: (error as Error).message });
        }
      }
    }
    if (!overlay.type || !OVERLAY_TYPES.includes(overlay.type)) {
      problems.push({ path: `${path}.type`, message: `Expected one of: ${OVERLAY_TYPES.join(", ")}.` });
    }
    if (overlay.slot !== undefined && !/^[A-Za-z][\w-]*$/.test(overlay.slot)) {
      problems.push({ path: `${path}.slot`, message: "Slot must start with a letter and contain only letters, numbers, _ or -." });
    }
    if (typeof overlay.route === "string" && typeof overlay.slot !== "object") {
      const key = `${overlay.slot ?? config.defaultSlot ?? "modal"}:${overlay.route}`;
      const existing = targets.get(key);
      if (existing) problems.push({ path, message: `Duplicates intercepted target used by ${existing}.` });
      else targets.set(key, name);
    }
  }
  return problems;
}
