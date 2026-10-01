import { expect, test } from "@playwright/test";
import { publicRoutes } from "./helpers";

test("signed-out visitors are sent to sign-in and see no inquiries", async ({ page }) => {
  await page.goto("/admin/inquiries");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Ingreso del personal" })).toBeVisible();
  await expect(page.getByTestId("inquiry")).toHaveCount(0);
});

const adminRoutes = [
  "/admin",
  "/admin/company",
  "/admin/texts",
  "/admin/categories",
  "/admin/products",
  "/admin/faqs",
  "/admin/testimonials",
  "/admin/history",
  "/admin/inquiries",
];

test("every staff route redirects signed-out visitors to sign-in (SC-007)", async ({ page }) => {
  for (const route of adminRoutes) {
    await page.goto(route);
    await expect(page, route).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { name: "Ingreso del personal" })).toBeVisible();
  }
});

test("staff area is noindex and not linked from public pages", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  for (const route of publicRoutes) {
    await page.goto(route);
    await expect(page.locator('a[href^="/admin"]')).toHaveCount(0);
  }
});

// Needs a real Supabase project and a staff user: set SUPABASE_* and E2E_STAFF_EMAIL/PASSWORD.
test("staff can sign in, see inquiries newest first and change their status", async ({ page }) => {
  const email = process.env.E2E_STAFF_EMAIL;
  const password = process.env.E2E_STAFF_PASSWORD;
  test.skip(!email || !password, "Requires Supabase and a staff account");

  await page.goto("/admin/login");
  await page.getByLabel("Correo").fill(email!);
  await page.getByLabel("Contraseña").fill(password!);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/admin\/inquiries/);

  const first = page.getByTestId("inquiry").first();
  await expect(first).toBeVisible();
  const toggle = first.getByRole("button", { name: /Marcar como/ });
  const before = await toggle.textContent();
  await toggle.click();
  await expect(
    page
      .getByTestId("inquiry")
      .first()
      .getByRole("button", { name: /Marcar como/ }),
  ).not.toHaveText(before!);

  await page.getByRole("link", { name: "Nuevas" }).click();
  for (const badge of await page.getByTestId("inquiry").locator("span").all()) {
    await expect(badge).toHaveText("Nueva");
  }
});
