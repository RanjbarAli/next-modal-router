import path from "node:path";
import type { OverlayConfig } from "../config/types.js";
import { calculateInterception } from "../routing/interception.js";
import { buildRouteTree, discoverInterceptors, type DiscoveredIntercept } from "../routing/tree.js";
import { routeToFileSegments } from "../routing/segments.js";
import type { ValidationIssue, ValidationResult } from "../validation/types.js";
import { fileExists, type Project } from "./project.js";

const PAGE_EXTENSIONS = ["tsx", "ts", "jsx", "js"];
async function hasRouteFile(directory: string, base: "page" | "default"): Promise<boolean> {
  return (await Promise.all(PAGE_EXTENSIONS.map((extension) => fileExists(path.join(directory, `${base}.${extension}`))))).some(Boolean);
}

export interface Analysis extends ValidationResult { discovered: DiscoveredIntercept[]; checked: number; }

export async function analyze(project: Project, config?: OverlayConfig): Promise<Analysis> {
  const tree = await buildRouteTree(project.appDir);
  const discovered = discoverInterceptors(tree);
  const issues: ValidationIssue[] = [];
  const definitions = Object.entries(config?.overlays ?? {});
  for (const [name, overlay] of definitions) {
    const slot = overlay.slot ?? config?.defaultSlot ?? "modal";
    const expected = calculateInterception("/", overlay.route).filesystemPath;
    const slotDir = path.join(project.appDir, `@${slot}`);
    if (!(await hasRouteFile(slotDir, "default"))) issues.push({ code: "NMR001", severity: "error", overlay: name, path: slotDir, message: `Missing @${slot}/default.tsx.`, suggestion: "Run next-modal-router init or create a default component that returns null." });
    const found = discovered.find((item) => item.slot === slot && item.target === overlay.route.replace(/^\//, ""));
    if (!found) issues.push({ code: "NMR002", severity: "error", overlay: name, message: `Missing interceptor @${slot}/${expected}.`, suggestion: `Run next-modal-router add ${name} with the configured route.` });
    else if (found.filesystemPath !== expected) issues.push({ code: "NMR003", severity: "error", overlay: name, path: found.pagePath, message: `Invalid interception path. Expected ${expected}; found ${found.filesystemPath}.`, suggestion: "Move the interceptor to the expected route-segment depth." });
    const fullPage = path.join(project.appDir, ...routeToFileSegments(overlay.route));
    if (!(await hasRouteFile(fullPage, "page"))) issues.push({ code: "NMR004", severity: "error", overlay: name, path: fullPage, message: `Missing full-page counterpart for ${overlay.route}.`, suggestion: "Create page.tsx so hard navigation and refresh render a normal page." });
    const fallback = path.join(project.appDir, ...routeToFileSegments(overlay.closeFallback));
    if (!(await hasRouteFile(fallback, "page"))) issues.push({ code: "NMR005", severity: "warning", overlay: name, path: fallback, message: `Close fallback ${overlay.closeFallback} has no page.`, suggestion: "Create the fallback page or correct closeFallback." });
  }
  if (!config) for (const item of discovered) issues.push({ code: "NMR006", severity: "info", path: item.pagePath, message: `Discovered unconfigured overlay @${item.slot}/${item.filesystemPath}.`, suggestion: "Add it to next-modal-router.config.ts for richer validation." });
  return { valid: !issues.some((issue) => issue.severity === "error"), issues, discovered, checked: definitions.length || discovered.length };
}
