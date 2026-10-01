import { afterEach, describe, expect, it } from "vitest";
import { buildImagePath, storagePublicUrl, validateImage } from "@/lib/images";

const MB = 1024 * 1024;

describe("validateImage", () => {
  it.each(["image/jpeg", "image/png", "image/webp", "image/avif"])(
    "accepts %s up to 5 MB",
    (type) => {
      expect(validateImage({ type, size: 5 * MB })).toBeNull();
    },
  );

  it("rejects files over 5 MB with a size message", () => {
    expect(validateImage({ type: "image/png", size: 6 * MB })).toMatch(/demasiado grande/);
  });

  it("rejects other types with a type message", () => {
    expect(validateImage({ type: "application/pdf", size: 1000 })).toMatch(/JPG, PNG, WebP o AVIF/);
  });
});

describe("buildImagePath", () => {
  it("builds <entity>/<id>.<ext>", () => {
    expect(buildImagePath("products", "image/webp", "abc")).toBe("products/abc.webp");
    expect(buildImagePath("categories", "image/jpeg", "x")).toBe("categories/x.jpg");
  });

  it("refuses unsupported types", () => {
    expect(() => buildImagePath("products", "image/gif", "abc")).toThrow();
  });
});

describe("storagePublicUrl", () => {
  const original = process.env.SUPABASE_URL;
  afterEach(() => {
    process.env.SUPABASE_URL = original;
  });

  it("keeps local paths and resolves storage paths against the public bucket", () => {
    process.env.SUPABASE_URL = "https://abc.supabase.co/";
    expect(storagePublicUrl("/images/placeholder.svg")).toBe("/images/placeholder.svg");
    expect(storagePublicUrl("products/a.png")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/site-images/products/a.png",
    );
    expect(storagePublicUrl(null)).toBeNull();
  });
});
