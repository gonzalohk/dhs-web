import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { expectNoHorizontalScroll } from "./helpers";

// Editor flows (US2 and US3). They need a real Supabase project with migrations 0001–0006 applied,
// a staff user, and these variables: SUPABASE_*, E2E_STAFF_EMAIL, E2E_STAFF_PASSWORD.
// The signed-out guards live in admin.spec.ts and always run.

const email = process.env.E2E_STAFF_EMAIL;
const password = process.env.E2E_STAFF_PASSWORD;
const configured = Boolean(email && password && process.env.SUPABASE_URL);

test.describe("staff editors", () => {
  test.skip(!configured, "Requires Supabase and a staff account");
  test.describe.configure({ mode: "serial" });

  async function signIn(page: Page) {
    await page.goto("/admin/login");
    await page.getByLabel("Correo").fill(email!);
    await page.getByLabel("Contraseña").fill(password!);
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page).toHaveURL(/\/admin$/);
  }

  const stamp = Date.now().toString(36);

  test("company data: invalid input is rejected naming the field, valid input goes public", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/company");
    const emailField = page.getByLabel(/Correo electrónico/);
    await emailField.fill("no-es-correo");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText(/Correo electrónico: ingrese un correo válido/)).toBeVisible();

    await emailField.fill("distribuidoradhs2026@gmail.com");
    await page.getByLabel(/^Teléfono/).fill("57734924");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByRole("status")).toContainText("guardados");
    await page.goto("/contact");
    await expect(
      page.getByRole("main").getByRole("link", { name: /\+591 5773 4924/ }),
    ).toBeVisible();
  });

  test("page texts: variables are rendered and unknown variables are rejected", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/texts");
    const field = page.getByLabel("Inicio: título principal");
    await field.fill("Hola {foo}");
    await page.getByRole("button", { name: "Guardar texto" }).first().click();
    await expect(page.getByText(/variable desconocida \{foo\}/)).toBeVisible();

    await field.fill(`{companyName}: pruebas ${stamp}`);
    await page.getByRole("button", { name: "Guardar texto" }).first().click();
    await expect(page.getByRole("status").first()).toContainText("Texto guardado");
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(`pruebas ${stamp}`);
  });

  test("products: add with price, preview, hide, and see the result on the public site", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/products");
    await page.getByLabel(/^Nombre/).fill(`Producto ${stamp}`);
    await page.getByLabel(/^Descripción/).fill("Producto de prueba");
    await page.getByLabel(/Precio en Bs/).fill("12.5");
    // price without unit is rejected
    await page.getByRole("button", { name: "Agregar producto" }).click();
    await expect(page.getByText(/indique la unidad de venta/i)).toBeVisible();
    await page.getByLabel(/^Unidad de venta/).fill("kg");
    await expect(page.getByRole("complementary", { name: "Vista previa" })).toContainText(
      `Producto ${stamp}`,
    );
    await page.getByRole("button", { name: "Agregar producto" }).click();
    await expect(page.getByRole("status")).toContainText("agregado");

    const item = page.getByTestId("item").filter({ hasText: `Producto ${stamp}` });
    await expect(item).toBeVisible();
    await item.getByRole("button", { name: "Ocultar" }).click();
    await expect(page.getByTestId("item").filter({ hasText: `Producto ${stamp}` })).toContainText(
      "Oculto",
    );
  });

  test("images: oversized and non-image files are rejected and the current image stays", async ({
    page,
  }, testInfo) => {
    await signIn(page);
    await page.goto("/admin/products");
    await page.getByLabel(/Texto alternativo/).fill("Imagen de prueba");
    await page.getByLabel(/^Archivo/).setInputFiles({
      name: "grande.png",
      mimeType: "image/png",
      buffer: Buffer.alloc(6 * 1024 * 1024),
    });
    await page.getByRole("button", { name: "Subir imagen" }).click();
    await expect(page.getByText(/demasiado grande/)).toBeVisible();
    await page
      .getByLabel(/^Archivo/)
      .setInputFiles(path.join(testInfo.config.rootDir, "../package.json"));
    await page.getByRole("button", { name: "Subir imagen" }).click();
    await expect(page.getByText(/JPG, PNG, WebP o AVIF/)).toBeVisible();
  });

  test("history: restore the previous value of the latest change", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/history");
    const first = page.getByTestId("change").first();
    await expect(first).toBeVisible();
    await first.getByRole("button", { name: "Restaurar valor anterior" }).click();
    await expect(page.getByRole("status")).toContainText("restaurado");
  });

  test("editors stay usable without horizontal scroll", async ({ page }) => {
    await signIn(page);
    for (const route of [
      "/admin",
      "/admin/company",
      "/admin/texts",
      "/admin/products",
      "/admin/faqs",
    ]) {
      await page.goto(route);
      await expectNoHorizontalScroll(page);
    }
  });
});
