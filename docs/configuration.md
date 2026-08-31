# Configuration

The generated `next-modal-router.config.ts` uses `defineConfig` for literal inference. `.mts`, `.js`, and `.mjs` are also discovered.

```ts
import { defineConfig } from "next-modal-router/config"

export default defineConfig({
  defaultSlot: "modal",
  overlays: {
    product: {
      route: "/products/[id]",
      source: "/products",
      type: "modal",
      slot: "modal",
      closeFallback: "/products",
    },
  },
})
```

`route`, `source`, and `closeFallback` are absolute application routes. `slot` omits the leading `@`. `type` is one of `modal`, `drawer`, `sheet`, `panel`, or `custom` and has no visual runtime behavior. `defaultSlot` applies when a definition omits `slot`.

Config files execute in the local development process, like Next.js config. The loader does not evaluate strings or accept remote configuration. Keep configuration deterministic for CI.
