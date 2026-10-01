import { expect, test } from "@playwright/test";

test("FAQ answers ordering, payment, delivery and returns", async ({ page }) => {
  await page.goto("/faq");
  for (const name of ["Pedidos", "Pagos", "Entregas", "Devoluciones"]) {
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  }
  await page.getByText("¿Qué formas de pago aceptan?").click();
  await expect(page.getByText(/Pago de prueba: transferencia/)).toBeVisible();
});

test("home and about show certifications, client types and testimonials", async ({ page }) => {
  for (const route of ["/", "/about"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: "Certificaciones y calidad" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "A quiénes atendemos" })).toBeVisible();
    await expect(page.getByTestId("testimonials").locator("figure")).toHaveCount(3);
  }
});
