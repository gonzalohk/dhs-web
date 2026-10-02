import { expect, test } from "@playwright/test";
import { publicRoutes } from "./helpers";

// US1: the company data (DHS) is defined once and every page shows the same values.
// The e2e build uses placeholder DHS data plus demo content (E2E_DEMO=1).

test("every public page shows the DHS name and contact data and no placeholder company data", async ({
  page,
}) => {
  for (const route of publicRoutes) {
    await page.goto(route);
    // The header shows only the logo; its accessible name carries the company name.
    await expect(page.locator("header").getByRole("link", { name: /DHS/ }).first()).toBeVisible();
    await expect(page.locator("footer")).toContainText("DHS");
    await expect(page.locator("footer")).toContainText("+591 5773 4924");

    const body = await page.locator("body").innerText();
    expect(body, route).not.toContain("Distribuidora Andina");
    expect(body, route).not.toContain("[Pendiente]");

    for (const href of await page
      .locator('a[href^="tel:"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      expect(href, route).toBe("tel:+59157734924");
    }
    for (const href of await page
      .locator('a[href*="wa.me"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      expect(href, route).toMatch(/^https:\/\/wa\.me\/59157734924\?text=/);
    }
    for (const href of await page
      .locator('a[href^="mailto:"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      expect(href, route).toBe("mailto:distribuidoradhs2026@gmail.com");
    }
  }
});

test("structured business data matches the visible company data", async ({ request }) => {
  test.skip(test.info().project.name !== "desktop-1280", "Viewport independent; run once");
  for (const route of ["/", "/contact"]) {
    const html = await (await request.get(route)).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.+?)<\/script>/g)].map(
      (m) => JSON.parse(m[1]),
    );
    const business = blocks.find((b) => b["@type"] === "LocalBusiness");
    expect(business, route).toBeTruthy();
    expect(business.name).toBe("DHS");
    expect(business.telephone).toBe("+59157734924");
    expect(business.email).toBe("distribuidoradhs2026@gmail.com");
  }
});

test("page titles use the company name", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/DHS/);
  await page.goto("/about");
  await expect(page).toHaveTitle(/DHS/);
});
