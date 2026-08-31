import { describe, expect, it } from "vitest";
import { defineConfig } from "../src/config/types.js";
import { validateConfig } from "../src/config/validate.js";

describe("configuration", () => {
  it("preserves literal overlay names", () => {
    const config = defineConfig({ defaultSlot: "modal", overlays: { product: { route: "/products/[id]", source: "/products", type: "modal", closeFallback: "/products" } } });
    expect(config.overlays.product.type).toBe("modal");
    expect(validateConfig(config)).toEqual([]);
  });

  it("reports missing, invalid, and duplicate definitions", () => {
    const problems = validateConfig({ defaultSlot: "modal", overlays: {
      first: { route: "/products/[id]", source: "/products", type: "popover", closeFallback: "/products" },
      second: { route: "/products/[id]", source: "products", type: "modal", slot: "modal", closeFallback: "" },
      third: { route: "/other", source: "/", type: "modal", slot: "bad slot", closeFallback: "/" },
    } });
    expect(problems.map((problem) => problem.path)).toEqual(expect.arrayContaining(["overlays.first.type", "overlays.second.source", "overlays.second.closeFallback", "overlays.second", "overlays.third.slot"]));
  });
});
