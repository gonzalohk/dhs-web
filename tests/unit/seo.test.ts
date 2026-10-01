import { describe, expect, it } from "vitest";
import { settings } from "@/content/placeholder";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqPageJsonLd,
  itemListJsonLd,
  localBusinessJsonLd,
  siteUrl,
} from "@/lib/seo";
import { publicSettings } from "@/lib/tokens";

describe("buildMetadata", () => {
  it("sets title, description, canonical and social previews", () => {
    const meta = buildMetadata({ title: "Productos", description: "Catálogo", path: "/products" });
    expect(meta.title).toBe("Productos");
    expect(meta.description).toBe("Catálogo");
    expect(meta.alternates?.canonical).toBe("/products");
    expect(meta.openGraph).toMatchObject({ title: "Productos", url: "/products", locale: "es_BO" });
    expect(meta.twitter).toMatchObject({ title: "Productos" });
  });
});

describe("JSON-LD builders", () => {
  it("describes the business in Bolivia with served cities", () => {
    const full = {
      ...settings,
      address: "Av. Real 123",
      city: "Santa Cruz de la Sierra",
      serviceAreas: ["Santa Cruz de la Sierra", "Montero"],
    };
    const ld = localBusinessJsonLd(full);
    expect(ld["@type"]).toBe("LocalBusiness");
    expect(ld.name).toBe("DHS");
    expect(ld.address?.addressCountry).toBe("BO");
    expect(ld.telephone).toBe("+59157734924");
    expect(ld.email).toBe("distribuidoradhs2026@gmail.com");
    expect(ld.areaServed).toContainEqual({ "@type": "City", name: "Santa Cruz de la Sierra" });
  });

  it("omits address, description, and served areas that are not available yet", () => {
    const ld = localBusinessJsonLd(publicSettings(settings));
    expect(ld).not.toHaveProperty("address");
    expect(ld).not.toHaveProperty("areaServed");
    expect(ld).not.toHaveProperty("description");
  });

  it("numbers breadcrumb and list items from 1 with absolute URLs", () => {
    const crumbs = breadcrumbJsonLd([
      { name: "Inicio", path: "/" },
      { name: "Productos", path: "/products" },
    ]);
    expect(crumbs.itemListElement[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      name: "Productos",
      item: `${siteUrl}/products`,
    });
    const list = itemListJsonLd("Lácteos", [{ name: "Queso" }]);
    expect(list.itemListElement[0]).toEqual({ "@type": "ListItem", position: 1, name: "Queso" });
  });

  it("maps FAQs to questions with accepted answers", () => {
    const ld = faqPageJsonLd([{ id: "1", topic: "payment", question: "¿Factura?", answer: "Sí." }]);
    expect(ld.mainEntity[0]).toEqual({
      "@type": "Question",
      name: "¿Factura?",
      acceptedAnswer: { "@type": "Answer", text: "Sí." },
    });
  });
});
