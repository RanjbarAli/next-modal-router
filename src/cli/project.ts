import { access, readFile } from "node:fs/promises";
import path from "node:path";

export interface Project { cwd: string; appDir: string; appRelative: string; packageJson: Record<string, unknown>; typescript: boolean; }

async function exists(file: string): Promise<boolean> { try { await access(file); return true; } catch { return false; } }

export async function findProject(inputCwd: string): Promise<Project> {
  let cwd = path.resolve(inputCwd);
  while (true) {
    const packageFile = path.join(cwd, "package.json");
    if (await exists(packageFile)) {
      const packageJson = JSON.parse(await readFile(packageFile, "utf8")) as Record<string, unknown>;
      const candidates = ["src/app", "app"];
      for (const candidate of candidates) {
        const appDir = path.join(cwd, candidate);
        if (await exists(appDir)) return { cwd, appDir, appRelative: candidate, packageJson, typescript: await exists(path.join(cwd, "tsconfig.json")) };
      }
      throw new Error(`Found package.json in ${cwd}, but no app/ or src/app/ directory. next-modal-router requires the App Router.`);
    }
    const parent = path.dirname(cwd);
    if (parent === cwd) break;
    cwd = parent;
  }
  throw new Error(`No Next.js project found from ${path.resolve(inputCwd)}. Run the command inside an application or pass --cwd.`);
}

export async function fileExists(file: string): Promise<boolean> { return exists(file); }

export function dependencyVersion(project: Project, name: string): string | undefined {
  for (const key of ["dependencies", "devDependencies", "peerDependencies"] as const) {
    const record = project.packageJson[key];
    if (record && typeof record === "object" && !Array.isArray(record)) {
      const value = (record as Record<string, unknown>)[name];
      if (typeof value === "string") return value;
    }
  }
  return undefined;
}
