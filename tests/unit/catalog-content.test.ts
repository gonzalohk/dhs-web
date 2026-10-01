import { describe, expect, it } from "vitest";
import { groupCatalog } from "@/lib/content";
import type { Category, Product } from "@/lib/types";

const category = (id: string): Category => ({
  id,
  slug: id,
  name: id,
  description: "",
  imagePath: null,
  imageSrc: null,
  imageAlt: "",
});
const product = (id: string, categoryId: string): Product => ({
  id,
  categoryId,
  name: id,
  description: "",
  priceBob: null,
  unit: null,
  imagePath: null,
  imageSrc: null,
  imageAlt: "",
});

describe("groupCatalog", () => {
  it("attaches products to their category and keeps category order", () => {
    const result = groupCatalog(
      [category("a"), category("b")],
      [product("p1", "b"), product("p2", "a"), product("p3", "b")],
    );
    expect(result.map((c) => c.id)).toEqual(["a", "b"]);
    expect(result[1].products.map((p) => p.id)).toEqual(["p1", "p3"]);
  });

  it("hides categories without published products", () => {
    const result = groupCatalog([category("a"), category("empty")], [product("p1", "a")]);
    expect(result.map((c) => c.id)).toEqual(["a"]);
  });
});
