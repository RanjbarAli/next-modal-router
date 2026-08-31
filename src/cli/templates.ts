import type { OverlayConfig, OverlayDefinition } from "../config/types.js";

export const DEFAULT_TEMPLATE = `export default function Default() {\n  return null;\n}\n`;

export function pageTemplate(name: string, type: string, intercepted: boolean): string {
  const title = name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ");
  if (!intercepted) return `export default function Page() {\n  return (\n    <main>\n      <h1>${title}</h1>\n      <p>This is the full-page route for ${name}.</p>\n    </main>\n  );\n}\n`;
  return `"use client";\n\nimport { Suspense } from "react";\nimport { useOverlayRouter } from "next-modal-router";\n\nfunction ${name.replace(/[^A-Za-z0-9]/g, "")}Overlay() {\n  const overlay = useOverlayRouter();\n\n  return (\n    <section role="dialog" aria-modal="true" aria-labelledby="${name}-title">\n      <h2 id="${name}-title">${title}</h2>\n      <p>Replace this headless ${type} route with your application content.</p>\n      <button type="button" onClick={() => overlay.close()}>Close</button>\n    </section>\n  );\n}\n\nexport default function Page() {\n  return <Suspense fallback={null}><${name.replace(/[^A-Za-z0-9]/g, "")}Overlay /></Suspense>;\n}\n`;
}

export function configTemplate(config: OverlayConfig): string {
  const entries = Object.entries(config.overlays).map(([name, item]) => `    ${JSON.stringify(name)}: ${formatObject(item, 4)},`).join("\n\n");
  return `import { defineConfig } from "next-modal-router/config";\n\nexport default defineConfig({\n  defaultSlot: ${JSON.stringify(config.defaultSlot ?? "modal")},\n  overlays: {${entries ? `\n${entries}\n  ` : ""}},\n});\n`;
}

function formatObject(value: OverlayDefinition, spaces: number): string {
  const indent = " ".repeat(spaces);
  return `{\n${Object.entries(value).map(([key, item]) => `${indent}  ${key}: ${JSON.stringify(item)},`).join("\n")}\n${indent}}`;
}
