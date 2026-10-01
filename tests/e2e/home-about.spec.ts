import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, isMobile } from "./helpers";

test("home explains the company and offers contact on the first screen", async ({ page }) => {
  await page.goto("/");
  const viewportHeight = page.viewportSize()!.height;
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toContainText("DHS");
  await expect(page.getByText(/Alimentos para su negocio\./).first()).toBeVisible();

  const cta = page.getByRole("link", { name: /Solicitar cotización por WhatsApp/ });
  const ctaBox = await cta.boundingBox();
  expect(ctaBox!.y + ctaBox!.height).toBeLessThanOrEqual(viewportHeight * 2);

  await expect(page.getByRole("heading", { name: "Nuestros productos" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Frutas y verduras/ })).toBeVisible();
  await expect(page.getByText(/Atendemos en Santa Cruz, Montero/)).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("about shows story, mission, values and quality commitments", async ({ page }) => {
  await page.goto("/about");
  for (const name of [
    "Nuestra historia",
    "Nuestra misión",
    "Nuestros valores",
    "Calidad e inocuidad alimentaria",
  ]) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
  }
  await expectNoHorizontalScroll(page);
});

test("every main section is reachable in one click from the navigation", async ({ page }) => {
  await page.goto("/");
  const sections = [
    "Nosotros",
    "Productos",
    "Entregas y pedidos",
    "Preguntas frecuentes",
    "Contacto",
  ];
  for (const label of sections) {
    if (isMobile(page) || page.viewportSize()!.width < 1024) await page.getByText("Menú").click();
    const nav = page.getByRole("navigation", {
      name: isMobile(page) || page.viewportSize()!.width < 1024 ? "Menú móvil" : "Principal",
    });
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/");
  }
});
