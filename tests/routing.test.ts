import { describe, expect, it } from "vitest";
import { calculateInterception, parseInterceptor } from "../src/routing/interception.js";
import { normalizeRoute, parseSegment, routeSegments, urlSegments } from "../src/routing/segments.js";

describe("route segments", () => {
  it("normalizes and classifies App Router syntax", () => {
    expect(normalizeRoute("/products/[id]/")).toBe("/products/[id]");
    expect(parseSegment("[id]").kind).toBe("dynamic");
    expect(parseSegment("[...slug]").kind).toBe("catch-all");
    expect(parseSegment("[[...slug]]").kind).toBe("optional-catch-all");
    expect(parseSegment("(shop)").contributesToUrl).toBe(false);
    expect(parseSegment("@modal").kind).toBe("slot");
    expect(urlSegments("/(shop)/products/[id]")).toEqual(["products", "[id]"]);
    expect(routeSegments("/products/[id]")).toHaveLength(2);
  });

  it("rejects traversal and malformed input", () => {
    expect(() => normalizeRoute("products")).toThrow("must begin");
    expect(() => normalizeRoute("/../../etc/passwd")).toThrow("unsafe");
    expect(() => parseSegment("[broken")).toThrow("Invalid");
  });
});

describe("interception calculation", () => {
  it.each([
    ["/", "/products/[id]", "(.)products/[id]"],
    ["/products", "/products/[id]/reviews", "(.)[id]/reviews"],
    ["/products/[id]", "/products/photos/[id]", "(..)photos/[id]"],
    ["/shop/cart/item", "/shop/photos/[id]", "(..)(..)photos/[id]"],
    ["/dashboard", "/settings/profile", "(...)settings/profile"],
    ["/(shop)/products", "/(catalog)/products/[id]", "(.)[id]"],
  ])("maps %s to %s", (owner, target, expected) => {
    expect(calculateInterception(owner, target).filesystemPath).toBe(expected);
  });

  it("parses compound interceptors", () => {
    expect(parseInterceptor("(..)(..)photos")).toEqual({ marker: "(..)(..)", target: "photos" });
    expect(parseInterceptor("regular")).toBeNull();
  });
});
