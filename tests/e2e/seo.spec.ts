import { expect, test } from "@playwright/test";
import { publicRoutes } from "./helpers";

// Reads the server HTML directly (no JavaScript), as a crawler would.
test("every public page has unique, complete SEO metadata in server HTML", async ({ request }) => {
  test.skip(test.info().project.name !== "desktop-1280", "Viewport independent; run once");
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const route of publicRoutes) {
    const html = await (await request.get(route)).text();
    const title = /<title>([^<]+)<\/title>/.exec(html)?.[1];
    const description = /<meta name="description" content="([^"]+)"/.exec(html)?.[1];
    expect(title, route).toBeTruthy();
    expect(description, route).toBeTruthy();
    titles.add(title!);
    descriptions.add(description!);
    expect(html.match(/<h1[\s>]/g), route).toHaveLength(1);
    expect(html, route).toMatch(/<html lang="es-BO"/);
    expect(html, route).toMatch(/<link rel="canonical" href="[^"]+"/);
    expect(html, route).toMatch(/<meta property="og:title"/);
    expect(html, route).toMatch(/<meta property="og:locale" content="es_BO"/);
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">(.+?)<\/script>/g)) {
      expect(() => JSON.parse(json), route).not.toThrow();
    }
  }
  expect(titles.size).toBe(publicRoutes.length);
  expect(descriptions.size).toBe(publicRoutes.length);
});

test("structured data is present where expected", async ({ request }) => {
  test.skip(test.info().project.name !== "desktop-1280", "Viewport independent; run once");
  const expectations: [string, string][] = [
    ["/", "LocalBusiness"],
    ["/products", "ItemList"],
    ["/products/lacteos", "BreadcrumbList"],
    ["/faq", "FAQPage"],
  ];
  for (const [route, type] of expectations) {
    expect(await (await request.get(route)).text(), route).toContain(`"@type":"${type}"`);
  }
});

test("sitemap and robots are published and exclude the staff area", async ({ request }) => {
  test.skip(test.info().project.name !== "desktop-1280", "Viewport independent; run once");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/products/frutas-y-verduras</loc>");
  expect(sitemap).toContain("/contact</loc>");
  expect(sitemap).not.toContain("/admin");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  expect(robots).toMatch(/Sitemap: .+\/sitemap\.xml/);
});
