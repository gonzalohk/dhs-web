import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, isMobile } from "./helpers";

test("home shows the company name and the actions over the cover at every screen size", async ({
  page,
}) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toBeVisible();
  await expect(h1).toContainText("DHS");

  // The cover is the section background; the name and the actions sit inside that section.
  const section = page.locator('section[aria-label="DHS"]');
  const sectionBox = (await section.boundingBox())!;
  const cover = section.getByRole("img", { name: /repartidor con tableta y paquete/ });
  await expect(cover).toBeAttached();
  const coverBox = (await cover.boundingBox())!;
  expect(Math.round(coverBox.width)).toBe(Math.round(sectionBox.width));
  expect(Math.round(coverBox.height)).toBe(Math.round(sectionBox.height));

  const cta = page.getByRole("link", { name: /Solicitar cotización por WhatsApp/ });
  await expect(cta).toBeVisible();
  for (const box of [(await h1.boundingBox())!, (await cta.boundingBox())!]) {
    expect(box.y).toBeGreaterThanOrEqual(sectionBox.y);
    expect(box.y + box.height).toBeLessThanOrEqual(sectionBox.y + sectionBox.height);
  }
  await expect(page.getByRole("link", { name: "Ver productos" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nuestros productos" })).toBeVisible();
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
