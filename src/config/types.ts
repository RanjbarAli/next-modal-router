export const OVERLAY_TYPES = ["modal", "drawer", "sheet", "panel", "custom"] as const;

export type OverlayType = (typeof OVERLAY_TYPES)[number];

export interface OverlayDefinition {
  route: string;
  source: string;
  type: OverlayType;
  slot?: string;
  closeFallback: string;
}

export interface OverlayConfig<T extends Record<string, OverlayDefinition> = Record<string, OverlayDefinition>> {
  defaultSlot?: string;
  overlays: T;
}

export function defineConfig<const T extends Record<string, OverlayDefinition>>(
  config: OverlayConfig<T>,
): OverlayConfig<T> {
  return config;
}
