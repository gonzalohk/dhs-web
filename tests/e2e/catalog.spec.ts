import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./helpers";

test("products page lists every category with image and description", async ({ page }) => {
  await page.goto("/products");
  const cards = page.locator("main a[href^='/products/']");
  await expect(cards).toHaveCount(6);
  for (const card of await cards.all()) {
    await expect(card.locator("img")).toHaveAttribute("alt", /.+/);
    await expect(card.locator("p")).not.toBeEmpty();
  }
  await expectNoHorizontalScroll(page);
});

test("category page lists all products with price or quote action", async ({ page }) => {
  await page.goto("/products/frutas-y-verduras");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Frutas y verduras");
  const products = page.getByTestId("product");
  await expect(products).toHaveCount(3);

  const priced = products.filter({ hasText: "Tomate" });
  await expect(priced.getByTestId("price")).toContainText(/Bs\s?120,00/);
  await expect(priced.getByTestId("price")).toContainText("caja 20 kg");

  const unpriced = products.filter({ hasText: "Frutas de temporada" });
  const quote = unpriced.getByRole("link", { name: "Solicitar cotización" });
  await expect(quote).toHaveAttribute("href", /^https:\/\/wa\.me\/591\d{8}\?text=/);
  await expectNoHorizontalScroll(page);
});

test("unknown category returns 404 with links back", async ({ page }) => {
  const response = await page.goto("/products/no-existe");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("No encontramos esta página");
  await expect(page.getByRole("main").getByRole("link", { name: "Productos" })).toBeVisible();
});
