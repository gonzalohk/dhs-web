import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The DHS palette (from the logo) lives in src/app/globals.css. These tests keep text and controls accessible.

const css = readFileSync(path.join(__dirname, "../../src/app/globals.css"), "utf8");

function token(name: string): string {
  const match = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!match) throw new Error(`Missing token --color-${name}`);
  return match[1].toUpperCase();
}

const value = (name: string) => (name === "white" ? "#FFFFFF" : token(name));

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const PAIRS: { fg: string; bgs: string[]; min: number }[] = [
  { fg: "ink", bgs: ["white", "brand-50"], min: 4.5 },
  { fg: "muted", bgs: ["white", "brand-50"], min: 4.5 },
  { fg: "brand-600", bgs: ["white", "brand-50"], min: 4.5 },
  { fg: "brand-700", bgs: ["white", "brand-50"], min: 4.5 },
  { fg: "brand-800", bgs: ["white", "brand-50"], min: 4.5 },
  {
    fg: "white",
    bgs: ["brand-600", "brand-700", "brand-800", "brand-900", "accent-700", "whatsapp"],
    min: 4.5,
  },
  { fg: "brand-50", bgs: ["brand-800", "brand-900"], min: 4.5 },
  { fg: "brand-900", bgs: ["accent-500"], min: 4.5 },
  { fg: "ink", bgs: ["accent-400"], min: 4.5 },
  { fg: "accent-700", bgs: ["white", "brand-50"], min: 4.5 },
  { fg: "support-700", bgs: ["white", "brand-50"], min: 4.5 },
  { fg: "accent-400", bgs: ["brand-800", "brand-900"], min: 4.5 },
  // Focus rings are non-text UI: at least 3:1 against their background.
  { fg: "accent-700", bgs: ["white"], min: 3 },
];

describe("palette contrast", () => {
  for (const { fg, bgs, min } of PAIRS) {
    for (const bg of bgs) {
      it(`${fg} on ${bg} is at least ${min}:1`, () => {
        expect(contrast(value(fg), value(bg))).toBeGreaterThanOrEqual(min);
      });
    }
  }

  it("keeps the logo colors in the palette", () => {
    expect(token("brand-700")).toBe("#304159");
    expect(token("accent-500")).toBe("#EF8F21");
    expect(token("support-600")).toBe("#99C34D");
  });
});
