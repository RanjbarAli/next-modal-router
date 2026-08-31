import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";
import type { OverlayConfig } from "../config/types.js";
import { validateConfig } from "../config/validate.js";

const NAMES = ["next-modal-router.config.ts", "next-modal-router.config.mts", "next-modal-router.config.js", "next-modal-router.config.mjs"];

export async function findConfig(cwd: string): Promise<string | undefined> {
  for (const name of NAMES) { const file = path.join(cwd, name); try { await access(file); return file; } catch { /* keep searching */ } }
  return undefined;
}

export async function loadConfig(cwd: string): Promise<{ path?: string; config?: OverlayConfig }> {
  const configPath = await findConfig(cwd);
  if (!configPath) return {};
  const builtConfig = fileURLToPath(new URL("./config.js", import.meta.url));
  const sourceConfig = fileURLToPath(new URL("../config/index.ts", import.meta.url));
  let configEntry = builtConfig;
  try { await access(builtConfig); } catch { configEntry = sourceConfig; }
  const jiti = createJiti(import.meta.url, { interopDefault: true, alias: { "next-modal-router/config": configEntry } });
  const loaded = await jiti.import(configPath, { default: true }) as unknown;
  const problems = validateConfig(loaded);
  if (problems.length) throw new Error(`Invalid ${path.basename(configPath)}:\n${problems.map((problem) => `  ${problem.path}: ${problem.message}`).join("\n")}`);
  return { path: configPath, config: loaded as OverlayConfig };
}
