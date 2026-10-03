import { describe, expect, it } from "vitest";
import { MAX_DIMENSION, fitWithin, formatBytes, webpName } from "@/lib/image-optimize";

describe("fitWithin", () => {
  it("scales large images down keeping the proportions", () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 6000)).toEqual({ width: 800, height: 1600 });
  });

  it("never enlarges small images", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(MAX_DIMENSION, 10)).toEqual({ width: MAX_DIMENSION, height: 10 });
  });
});

describe("helpers", () => {
  it("renames files to .webp", () => {
    expect(webpName("foto.final.JPG")).toBe("foto.final.webp");
    expect(webpName("")).toBe("imagen.webp");
  });

  it("formats sizes for messages", () => {
    expect(formatBytes(3.2 * 1024 * 1024)).toBe("3,2 MB");
    expect(formatBytes(180 * 1024)).toBe("180 KB");
  });
});
