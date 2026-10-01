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
    const ld = localBusinessJsonLd(settings);
    expect(ld["@type"]).toBe("LocalBusiness");
    expect(ld.address.addressCountry).toBe("BO");
    expect(ld.telephone).toMatch(/^\+591\d{8}$/);
    expect(ld.areaServed).toContainEqual({ "@type": "City", name: "Santa Cruz de la Sierra" });
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
