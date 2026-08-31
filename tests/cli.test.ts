import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { rm } from "node:fs/promises";
import { run } from "../src/cli/index.js";
import { findProject } from "../src/cli/project.js";
import { loadConfig } from "../src/cli/config-loader.js";
import { analyze } from "../src/cli/analyze.js";

const directories: string[] = [];
async function fixture(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "nmr-test-")); directories.push(root);
  await mkdir(path.join(root, "app", "products"), { recursive: true });
  await writeFile(path.join(root, "app", "products", "page.tsx"), "export default function Page(){return null}\n");
  await writeFile(path.join(root, "package.json"), JSON.stringify({ dependencies: { next: "16.3.3", react: "19.2.8" } }));
  await writeFile(path.join(root, "tsconfig.json"), "{}");
  return root;
}
afterEach(async () => { await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))); });

describe("CLI generation and check", () => {
  it("initializes, generates a compilable tree, and validates it", async () => {
    const root = await fixture();
    expect(await run(["init", "--cwd", root, "--yes"])).toBe(0);
    expect(await run(["add", "product", "--cwd", root, "--route", "/products/[id]", "--source", "/products", "--type", "modal", "--slot", "modal", "--fallback", "/products"])).toBe(0);
    const interceptor = path.join(root, "app", "@modal", "(.)products", "[id]", "page.tsx");
    expect(await readFile(interceptor, "utf8")).toContain("useOverlayRouter");
    const project = await findProject(root);
    const loaded = await loadConfig(root);
    const result = await analyze(project, loaded.config);
    expect(result.valid).toBe(true);
  });

  it("supports dry runs without writing", async () => {
    const root = await fixture();
    expect(await run(["init", "--cwd", root, "--yes", "--dry-run"])).toBe(0);
    await expect(readFile(path.join(root, "next-modal-router.config.ts"), "utf8")).rejects.toThrow();
  });

  it("reports missing defaults and pages with stable codes", async () => {
    const root = await fixture();
    await mkdir(path.join(root, "app", "@modal", "(.)products", "[id]"), { recursive: true });
    await writeFile(path.join(root, "app", "@modal", "(.)products", "[id]", "page.tsx"), "export default function Page(){return null}\n");
    await writeFile(path.join(root, "next-modal-router.config.ts"), `export default { defaultSlot: "modal", overlays: { product: { route: "/products/[id]", source: "/products", type: "modal", closeFallback: "/missing" } } }`);
    const result = await analyze(await findProject(root), (await loadConfig(root)).config);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(["NMR001", "NMR004", "NMR005"]));
  });
});
