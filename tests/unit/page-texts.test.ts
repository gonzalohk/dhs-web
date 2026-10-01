import { describe, expect, it } from "vitest";
import { PAGE_TEXTS } from "@/content/page-texts";
import { findUnknownTokens } from "@/lib/tokens";

describe("page text registry", () => {
  it("has unique keys", () => {
    const keys = PAGE_TEXTS.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(PAGE_TEXTS.map((t) => [t.key, t] as const))("%s has a valid default", (_key, def) => {
    expect(def.default.length).toBeGreaterThan(0);
    expect(def.default.length).toBeLessThanOrEqual(def.maxLength);
    expect(findUnknownTokens(def.default)).toEqual([]);
    expect(def.label).toBeTruthy();
  });
});
