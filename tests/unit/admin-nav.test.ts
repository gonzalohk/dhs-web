import { describe, expect, it } from "vitest";
import { ADMIN_NAV, findNavItem } from "@/lib/admin-nav";

describe("admin navigation", () => {
  const items = ADMIN_NAV.flatMap((g) => g.items);

  it("has unique links and every staff section", () => {
    expect(new Set(items.map((i) => i.href)).size).toBe(items.length);
    expect(items.map((i) => i.href)).toEqual(
      expect.arrayContaining([
        "/admin",
        "/admin/company",
        "/admin/texts",
        "/admin/categories",
        "/admin/products",
        "/admin/faqs",
        "/admin/testimonials",
        "/admin/inquiries",
        "/admin/history",
      ]),
    );
  });

  it("finds the current section, including sub-paths, and the panel only on its own path", () => {
    expect(findNavItem("/admin")?.label).toBe("Panel");
    expect(findNavItem("/admin/products")?.label).toBe("Productos");
    expect(findNavItem("/admin/products/anything")?.label).toBe("Productos");
    expect(findNavItem("/admin/login")).toBeUndefined();
  });
});
