import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, isMobile } from "./helpers";

test("home shows the cover with the actions over it, and no visible title or subtitle", async ({
  page,
}) => {
  await page.goto("/");
  const viewport = page.viewportSize()!;
  // The h1 stays for screen readers and search engines, but title and subtitle are not shown.
  await expect(page.getByRole("heading", { level: 1 })).toContainText("DHS");
  // Visually hidden (sr-only): it occupies at most 1 px.
  const h1Box = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
  expect(h1Box.width).toBeLessThanOrEqual(1);
  expect(h1Box.height).toBeLessThanOrEqual(1);
  await expect(page.locator("main").getByText(/Alimentos para su negocio\./)).toHaveCount(0);

  const cover = page.getByRole("img", { name: /repartidor con tableta y paquete/ });
  await expect(cover).toBeVisible();
  const coverBox = (await cover.boundingBox())!;

  const cta = page.getByRole("link", { name: /Solicitar cotización por WhatsApp/ });
  await expect(cta).toBeVisible();
  const ctaBox = (await cta.boundingBox())!;
  if (viewport.width >= 768) {
    // On tablets and desktops the buttons sit on top of the cover image.
    expect(ctaBox.y).toBeGreaterThanOrEqual(coverBox.y);
    expect(ctaBox.y + ctaBox.height).toBeLessThanOrEqual(coverBox.y + coverBox.height);
  } else {
    // On phones the cover is too small to hold them, so they sit right below it.
    expect(ctaBox.y).toBeGreaterThanOrEqual(coverBox.y + coverBox.height - 1);
  }
  await expect(page.getByRole("link", { name: "Ver productos" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Nuestros productos" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Frutas y verduras/ })).toBeVisible();
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
