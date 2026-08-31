import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: false,
    splitting: true,
    banner: { js: '"use client";' },
    external: ["next", "react", "react-dom"],
  },
  {
    entry: { config: "src/config/index.ts" },
    format: ["esm"],
    dts: true,
    sourcemap: false,
    external: ["next", "react", "react-dom"],
  },
  {
    entry: { cli: "src/cli/index.ts" },
    format: ["esm"],
    dts: true,
    banner: { js: "#!/usr/bin/env node" },
    external: ["jiti"],
  },
]);
