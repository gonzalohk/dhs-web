import { expect, type Page } from "@playwright/test";

export const publicRoutes = [
  "/",
  "/about",
  "/products",
  "/products/frutas-y-verduras",
  "/delivery",
  "/faq",
  "/contact",
];

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

export function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1280) < 768;
}
