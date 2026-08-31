import { readdir } from "node:fs/promises";
import path from "node:path";
import { parseInterceptor } from "./interception.js";

export interface RouteNode { name: string; absolutePath: string; children: RouteNode[]; files: string[]; }
export interface DiscoveredIntercept { slot: string; filesystemPath: string; pagePath: string; marker: string; target: string; }

const IGNORED = new Set(["node_modules", ".next", ".git", "dist", "coverage"]);
const ROUTE_FILES = /^(?:page|default|layout)\.(?:js|jsx|ts|tsx)$/;

export async function buildRouteTree(root: string): Promise<RouteNode> {
  const entries = await readdir(root, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && ROUTE_FILES.test(entry.name)).map((entry) => entry.name).sort();
  const directories = entries.filter((entry) => entry.isDirectory() && !IGNORED.has(entry.name));
  const children = await Promise.all(directories.map((entry) => buildRouteTree(path.join(root, entry.name))));
  return { name: path.basename(root), absolutePath: root, children: children.sort((a, b) => a.name.localeCompare(b.name)), files };
}

export function discoverInterceptors(tree: RouteNode): DiscoveredIntercept[] {
  const results: DiscoveredIntercept[] = [];
  const visit = (node: RouteNode, slot: string | undefined, relative: string[]): void => {
    const activeSlot = node.name.startsWith("@") ? node.name.slice(1) : slot;
    const next = node === tree ? [] : [...relative, node.name];
    const withinSlot = activeSlot ? next.slice(next.findIndex((part) => part === `@${activeSlot}`) + 1) : [];
    const interceptorIndex = withinSlot.findIndex((part) => parseInterceptor(part));
    if (activeSlot && interceptorIndex >= 0 && node.files.some((file) => file.startsWith("page."))) {
      const routeParts = withinSlot.slice(interceptorIndex);
      const first = parseInterceptor(routeParts[0] ?? "");
      if (first) results.push({ slot: activeSlot, filesystemPath: routeParts.join("/"), pagePath: node.absolutePath, marker: first.marker, target: [first.target, ...routeParts.slice(1)].join("/") });
    }
    for (const child of node.children) visit(child, activeSlot, next);
  };
  visit(tree, undefined, []);
  return results;
}
