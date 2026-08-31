import { mkdir, open, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export interface PlannedWrite { path: string; content: string; overwrite?: boolean; skipIfExists?: boolean; }

export async function applyWrites(writes: PlannedWrite[], options: { dryRun: boolean; force: boolean }): Promise<string[]> {
  const changed: string[] = [];
  for (const write of writes) {
    await mkdir(path.dirname(write.path), { recursive: true });
    let existing = false;
    try { const handle = await open(write.path, "r"); await handle.close(); existing = true; } catch { /* new file */ }
    if (existing && write.skipIfExists && !options.force) continue;
    if (existing && !options.force && !write.overwrite) throw new Error(`Refusing to overwrite ${write.path}. Re-run with --force only if replacing this file is intentional.`);
    changed.push(write.path);
    if (options.dryRun) continue;
    const temporary = `${write.path}.nmr-${process.pid}.tmp`;
    await writeFile(temporary, write.content, "utf8");
    try { await rename(temporary, write.path); } catch (error) { await rm(temporary, { force: true }); throw error; }
  }
  return changed;
}
