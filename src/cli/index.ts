import path from "node:path";
import { pathToFileURL } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { OVERLAY_TYPES, type OverlayConfig, type OverlayDefinition, type OverlayType } from "../config/types.js";
import { validateConfig } from "../config/validate.js";
import { calculateInterception } from "../routing/interception.js";
import { routeToFileSegments } from "../routing/segments.js";
import { analyze } from "./analyze.js";
import { loadConfig } from "./config-loader.js";
import { applyWrites, type PlannedWrite } from "./files.js";
import { dependencyVersion, fileExists, findProject } from "./project.js";
import { configTemplate, DEFAULT_TEMPLATE, pageTemplate } from "./templates.js";

interface Arguments { command?: string; positionals: string[]; flags: Record<string, string | boolean>; }

function parseArguments(argv: string[]): Arguments {
  const result: Arguments = { positionals: [], flags: {} };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index]!;
    if (!result.command && !item.startsWith("-")) { result.command = item; continue; }
    if (item.startsWith("--")) {
      const [rawKey, inline] = item.slice(2).split("=", 2);
      const key = rawKey!;
      const next = argv[index + 1];
      if (inline !== undefined) result.flags[key] = inline;
      else if (next && !next.startsWith("-")) { result.flags[key] = next; index += 1; }
      else result.flags[key] = true;
    } else result.positionals.push(item);
  }
  return result;
}

function flag(args: Arguments, key: string): string | undefined { const value = args.flags[key]; return typeof value === "string" ? value : undefined; }
function enabled(args: Arguments, key: string): boolean { return args.flags[key] === true || args.flags[key] === "true"; }
function relative(cwd: string, file: string): string { return path.relative(cwd, file) || "."; }
function outputJson(value: unknown): void { stdout.write(`${JSON.stringify(value, null, 2)}\n`); }

async function commandInit(args: Arguments): Promise<number> {
  const project = await findProject(flag(args, "cwd") ?? process.cwd());
  if (!dependencyVersion(project, "next")) throw new Error("This package does not declare Next.js. Install next before initializing next-modal-router.");
  const configPath = path.join(project.cwd, "next-modal-router.config.ts");
  const defaultSlot = flag(args, "slot") ?? "modal";
  const writes: PlannedWrite[] = [];
  if (!(await fileExists(configPath))) writes.push({ path: configPath, content: configTemplate({ defaultSlot, overlays: {} }) });
  else if (!enabled(args, "force")) throw new Error(`${relative(project.cwd, configPath)} already exists. Nothing was overwritten.`);
  else writes.push({ path: configPath, content: configTemplate({ defaultSlot, overlays: {} }) });
  writes.push({ path: path.join(project.appDir, `@${defaultSlot}`, "default.tsx"), content: DEFAULT_TEMPLATE, skipIfExists: true });
  const changed = await applyWrites(writes, { dryRun: enabled(args, "dry-run"), force: enabled(args, "force") });
  for (const file of changed) stdout.write(`${enabled(args, "dry-run") ? "WOULD CREATE" : "CREATE"} ${relative(project.cwd, file)}\n`);
  stdout.write(`\nInitialized next-modal-router in ${project.cwd}. Add the @${defaultSlot} slot prop to the layout that owns it.\n`);
  return 0;
}

async function askMissing(args: Arguments): Promise<Record<string, string>> {
  const values: Record<string, string> = {};
  if (enabled(args, "yes") || enabled(args, "ci") || !stdin.isTTY) return values;
  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    if (!args.positionals[0]) values.name = await prompt.question("Overlay name: ");
    if (!flag(args, "route")) values.route = await prompt.question("Route: ");
    if (!flag(args, "source")) values.source = await prompt.question("Source route: ");
    if (!flag(args, "type")) values.type = await prompt.question("Type (modal/drawer/sheet/panel/custom) [modal]: ") || "modal";
    if (!flag(args, "slot")) values.slot = await prompt.question("Slot [modal]: ") || "modal";
    if (!flag(args, "fallback")) values.fallback = await prompt.question("Close fallback: ");
  } finally { prompt.close(); }
  return values;
}

async function commandAdd(args: Arguments): Promise<number> {
  const prompted = await askMissing(args);
  const project = await findProject(flag(args, "cwd") ?? process.cwd());
  const loaded = await loadConfig(project.cwd);
  const name = args.positionals[0] ?? prompted.name;
  const route = flag(args, "route") ?? prompted.route;
  const source = flag(args, "source") ?? prompted.source;
  const type = (flag(args, "type") ?? prompted.type ?? "modal") as OverlayType;
  const slot = flag(args, "slot") ?? prompted.slot ?? loaded.config?.defaultSlot ?? "modal";
  const closeFallback = flag(args, "fallback") ?? prompted.fallback ?? source;
  if (!name || !route || !source || !closeFallback) throw new Error("add requires a name, --route, --source, and --fallback (or an interactive terminal).");
  if (!/^[A-Za-z][\w-]*$/.test(name)) throw new Error(`Invalid overlay name "${name}". Use letters, numbers, _ or -, beginning with a letter.`);
  if (!OVERLAY_TYPES.includes(type)) throw new Error(`Unknown overlay type "${type}". Expected: ${OVERLAY_TYPES.join(", ")}.`);
  const overlay: OverlayDefinition = { route, source, type, slot, closeFallback };
  const config: OverlayConfig = loaded.config ?? { defaultSlot: slot, overlays: {} };
  if (config.overlays[name] && !enabled(args, "force")) throw new Error(`Overlay "${name}" already exists. Use --force to replace its generated files and definition.`);
  const nextConfig: OverlayConfig = { ...config, overlays: { ...config.overlays, [name]: overlay } };
  const problems = validateConfig(nextConfig);
  if (problems.length) throw new Error(problems.map((problem) => `${problem.path}: ${problem.message}`).join("\n"));
  const interception = calculateInterception("/", route);
  const configPath = loaded.path ?? path.join(project.cwd, "next-modal-router.config.ts");
  const writes: PlannedWrite[] = [
    { path: path.join(project.appDir, `@${slot}`, "default.tsx"), content: DEFAULT_TEMPLATE, skipIfExists: true },
    { path: path.join(project.appDir, `@${slot}`, ...interception.filesystemPath.split("/"), "page.tsx"), content: pageTemplate(name, type, true) },
    { path: path.join(project.appDir, ...routeToFileSegments(route), "page.tsx"), content: pageTemplate(name, type, false), skipIfExists: true },
    { path: configPath, content: configTemplate(nextConfig), overwrite: Boolean(loaded.path) },
  ];
  const changed = await applyWrites(writes, { dryRun: enabled(args, "dry-run"), force: enabled(args, "force") });
  for (const file of changed) stdout.write(`${enabled(args, "dry-run") ? "WOULD WRITE" : "WRITE"} ${relative(project.cwd, file)}\n`);
  stdout.write(`\n${name}: ${source} → ${route} via @${slot}/${interception.filesystemPath}\n`);
  return 0;
}

async function commandCheck(args: Arguments): Promise<number> {
  const project = await findProject(flag(args, "cwd") ?? process.cwd());
  const loaded = await loadConfig(project.cwd);
  const result = await analyze(project, loaded.config);
  if (flag(args, "format") === "json") outputJson(result);
  else {
    stdout.write(`next-modal-router\n\nChecking ${result.checked} overlay${result.checked === 1 ? "" : "s"}...\n`);
    if (!result.issues.length) stdout.write("\n✓ Everything looks good.\n");
    for (const issue of result.issues) {
      const icon = issue.severity === "error" ? "✕" : issue.severity === "warning" ? "⚠" : "ℹ";
      stdout.write(`\n${icon} ${issue.code}${issue.overlay ? ` ${issue.overlay}` : ""}\n  ${issue.message}\n`);
      if (issue.suggestion) stdout.write(`  ${issue.suggestion}\n`);
      if (enabled(args, "verbose") && issue.path) stdout.write(`  path: ${issue.path}\n`);
    }
  }
  return result.valid ? 0 : 1;
}

async function commandDoctor(args: Arguments): Promise<number> {
  const project = await findProject(flag(args, "cwd") ?? process.cwd());
  const loaded = await loadConfig(project.cwd);
  const result = await analyze(project, loaded.config);
  const report = { environment: { node: process.version, next: dependencyVersion(project, "next") ?? null, react: dependencyVersion(project, "react") ?? null, appRouter: true, typescript: project.typescript, appDirectory: project.appRelative }, configuration: { path: loaded.path ? relative(project.cwd, loaded.path) : null, overlays: result.checked, valid: result.valid, warnings: result.issues.filter((issue) => issue.severity === "warning").length, errors: result.issues.filter((issue) => issue.severity === "error").length } };
  if (flag(args, "format") === "json") outputJson(report);
  else stdout.write(`Environment\n───────────\nNode             ${report.environment.node}\nNext.js          ${report.environment.next ?? "not declared"}\nReact            ${report.environment.react ?? "not declared"}\nApp Router       ✓ (${project.appRelative})\nTypeScript       ${project.typescript ? "✓" : "–"}\n\nConfiguration\n─────────────\nConfig           ${report.configuration.path ?? "not found (discovery mode)"}\nOverlays         ${report.configuration.overlays}\nWarnings         ${report.configuration.warnings}\nErrors           ${report.configuration.errors}\n\n${result.valid ? "Everything looks good." : "Run `next-modal-router check --verbose` for actionable diagnostics."}\n`);
  return result.valid ? 0 : 1;
}

async function commandList(args: Arguments): Promise<number> {
  const project = await findProject(flag(args, "cwd") ?? process.cwd());
  const loaded = await loadConfig(project.cwd);
  const analysis = await analyze(project, loaded.config);
  const configured = Object.entries(loaded.config?.overlays ?? {}).map(([name, overlay]) => ({ name, route: overlay.route, source: overlay.source, type: overlay.type, slot: overlay.slot ?? loaded.config?.defaultSlot ?? "modal", origin: "config" }));
  const known = new Set(configured.map((item) => `${item.slot}:${item.route.replace(/^\//, "")}`));
  const discovered = analysis.discovered.filter((item) => !known.has(`${item.slot}:${item.target}`)).map((item) => ({ name: item.target, route: `/${item.target}`, source: "unknown", type: "custom", slot: item.slot, origin: "discovered" }));
  const items = [...configured, ...discovered];
  if (flag(args, "format") === "json") outputJson(items);
  else {
    stdout.write("NAME                 ROUTE                              TYPE      SLOT       ORIGIN\n");
    for (const item of items) stdout.write(`${item.name.padEnd(21)}${item.route.padEnd(35)}${item.type.padEnd(10)}${item.slot.padEnd(11)}${item.origin}\n`);
    if (!items.length) stdout.write("No overlays found.\n");
  }
  return 0;
}

function printHelp(): void {
  stdout.write(`next-modal-router\nURL-native overlays for Next.js App Router\n\nUsage:\n  next-modal-router <command> [options]\n\nCommands:\n  init       Create a typed config and default parallel slot\n  add        Generate an overlay interceptor and full-page route\n  check      Validate configured or discovered overlay routes\n  doctor     Inspect project compatibility and configuration\n  list       List configured and discovered overlays\n\nGlobal options:\n  --cwd <path>       Next.js application directory\n  --format json      Machine-readable output (check, doctor, list)\n  --dry-run          Report writes without changing files (init, add)\n  --force            Replace files owned by the requested operation\n  --ci                Disable prompts and ANSI output\n  --verbose           Include filesystem paths in diagnostics\n`);
}

export async function run(argv = process.argv.slice(2)): Promise<number> {
  const args = parseArguments(argv);
  if (!args.command || args.command === "help" || enabled(args, "help")) { printHelp(); return 0; }
  if (args.command === "init") return commandInit(args);
  if (args.command === "add") return commandAdd(args);
  if (args.command === "check") return commandCheck(args);
  if (args.command === "doctor") return commandDoctor(args);
  if (args.command === "list") return commandList(args);
  throw new Error(`Unknown command "${args.command}". Run next-modal-router help.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().then((code) => { process.exitCode = code; }).catch((error: unknown) => { process.stderr.write(`next-modal-router: ${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 2; });
}
