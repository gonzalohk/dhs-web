import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, isMobile, publicRoutes } from "./helpers";

test("contact page shows phone, email, address, map, hours and form", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("main").getByRole("link", { name: /\+591/ })).toHaveAttribute(
    "href",
    /^tel:\+591\d{8}$/,
  );
  await expect(page.getByRole("main").getByRole("link", { name: /@/ })).toHaveAttribute(
    "href",
    /^mailto:/,
  );
  await expect(page.getByRole("main").locator("address")).toContainText("Bolivia");
  await expect(page.getByTitle(/Mapa de ubicación/)).toBeAttached();
  await expect(page.getByText(/Horario:/)).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: "Abrir WhatsApp" }),
  ).toHaveAttribute("href", /wa\.me\/591/);
  await expect(page.getByRole("button", { name: "Enviar mensaje" })).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("invalid submission shows specific errors and keeps input", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Nombre", { exact: false }).first().fill("Ana Pérez");
  await page.getByLabel(/^Mensaje/).fill("Hola");
  await page.waitForTimeout(3100);
  await page.getByRole("button", { name: "Enviar mensaje" }).click();
  await expect(
    page.getByText("Ingrese un correo electrónico o un teléfono para poder responderle."),
  ).toBeVisible();
  await expect(page.getByText("El mensaje debe tener al menos 10 caracteres.")).toBeVisible();
  await expect(page.locator("#name")).toHaveValue("Ana Pérez");
  await expect(page.locator("#message")).toHaveAttribute("aria-invalid", "true");
});

test("valid submission shows confirmation", async ({ page }) => {
  await page.goto("/contact");
  await page.locator("#name").fill("Ana Pérez");
  await page.locator("#businessName").fill("Restaurante Sabor");
  await page.locator("#phone").fill("7000 0000");
  await page.locator("#message").fill("Quisiera una cotización semanal de verduras.");
  await page.waitForTimeout(3100);
  await page.getByRole("button", { name: "Enviar mensaje" }).click();
  await expect(page.getByRole("status")).toContainText("Recibimos su mensaje");
});

test("sticky WhatsApp button is on every page on mobile", async ({ page }) => {
  test.skip(!isMobile(page), "Mobile only");
  for (const route of publicRoutes) {
    await page.goto(route);
    const button = page.getByTestId("sticky-whatsapp");
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("href", /^https:\/\/wa\.me\/591\d{8}\?text=/);
    const box = await button.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});
