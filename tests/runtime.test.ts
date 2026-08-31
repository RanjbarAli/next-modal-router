import { describe, expect, it } from "vitest";
import { decideSafeClose } from "../src/runtime/history.js";
import { updateSearchParams, withSearchParams } from "../src/runtime/search-params.js";

describe("safe close", () => {
  it("uses back only for an internally recorded current entry", () => {
    expect(decideSafeClose({ depth: 1, currentPathname: "/products/42", entryPathname: "/products/42", fallback: "/products" })).toEqual({ action: "back" });
    expect(decideSafeClose({ depth: 0, currentPathname: "/products/42", fallback: "/products" })).toEqual({ action: "replace", href: "/products" });
    expect(decideSafeClose({ depth: 0, currentPathname: "/unknown" })).toEqual({ action: "replace", href: "/" });
  });
});

describe("search parameters", () => {
  it("preserves, replaces, removes, and repeats values", () => {
    expect(updateSearchParams("sort=newest&tab=details", { tab: "reviews" }).toString()).toBe("sort=newest&tab=reviews");
    expect(updateSearchParams("sort=newest&tab=details", { tab: null }).toString()).toBe("sort=newest");
    expect(updateSearchParams("", { tag: ["a", "b"] }).getAll("tag")).toEqual(["a", "b"]);
    expect(withSearchParams("/products/42", "tab=details", { tab: null })).toBe("/products/42");
  });
});
