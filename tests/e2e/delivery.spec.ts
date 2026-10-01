import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./helpers";

test("delivery page explains coverage, schedule, minimum order and how to start", async ({
  page,
}) => {
  await page.goto("/delivery");
  for (const name of [
    "Zonas de entrega",
    "Días y horarios de entrega",
    "Pedido mínimo",
    "Cómo ser cliente",
  ]) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
  }
  await expect(page.getByText("Santa Cruz de la Sierra", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir cuenta por WhatsApp" })).toHaveAttribute(
    "href",
    /wa\.me\/591/,
  );
  await expectNoHorizontalScroll(page);
});
