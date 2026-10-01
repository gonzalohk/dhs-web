import { cache } from "react";
import { PAGE_TEXT_BY_KEY, PAGE_TEXTS } from "@/content/page-texts";
import { applyDemoProducts, demoFaqs, demoSettings, demoTestimonials } from "@/content/demo";
import * as placeholder from "@/content/placeholder";
import { mapCategory, mapFaq, mapProduct, mapSettings, mapTestimonial } from "./mappers";
import { isSupabaseConfigured, publicClient } from "./supabase";
import { publicSettings, renderTextOrNull } from "./tokens";
import type { Category, CategoryWithProducts, Faq, Product, Settings, Testimonial } from "./types";

// Content comes from Supabase when configured, otherwise from placeholder content.
// Pages using these functions set `export const revalidate = 3600`; staff edits revalidate on demand.
// E2E_DEMO=1 (automated tests only) layers demo content over the placeholders.

const demo = () => process.env.E2E_DEMO === "1";

/** Attaches products to their category and drops categories that have no products. */
export function groupCatalog(categories: Category[], products: Product[]): CategoryWithProducts[] {
  return categories
    .map((category) => ({
      ...category,
      products: products.filter((p) => p.categoryId === category.id),
    }))
    .filter((category) => category.products.length > 0);
}

/** Company data exactly as stored (including "[Pendiente]" markers). Used by the staff editors. */
export const getRawSettings = cache(async (): Promise<Settings> => {
  if (!isSupabaseConfigured()) return { ...placeholder.settings, ...(demo() ? demoSettings : {}) };
  const { data, error } = await publicClient().from("settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return mapSettings(data);
});

/** Company data for visitors: values that are still "[Pendiente]" are empty, so pages hide them. */
export const getSettings = cache(async (): Promise<Settings> =>
  publicSettings(await getRawSettings()),
);

export const getCatalog = cache(async (): Promise<CategoryWithProducts[]> => {
  if (!isSupabaseConfigured()) {
    const products = demo() ? applyDemoProducts(placeholder.products) : placeholder.products;
    return groupCatalog(placeholder.categories, products);
  }
  const db = publicClient();
  const [cats, prods] = await Promise.all([
    db.from("categories").select("*").eq("published", true).order("sort_order"),
    db.from("products").select("*").eq("published", true).order("sort_order"),
  ]);
  if (cats.error) throw cats.error;
  if (prods.error) throw prods.error;
  return groupCatalog(cats.data.map(mapCategory), prods.data.map(mapProduct));
});

export async function getCategory(slug: string): Promise<CategoryWithProducts | undefined> {
  return (await getCatalog()).find((c) => c.slug === slug);
}

export const getFaqs = cache(async (): Promise<Faq[]> => {
  if (!isSupabaseConfigured()) return demo() ? demoFaqs : placeholder.faqs;
  const { data, error } = await publicClient()
    .from("faqs")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  if (error) throw error;
  return data.map(mapFaq);
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  if (!isSupabaseConfigured()) return demo() ? demoTestimonials : placeholder.testimonials;
  const { data, error } = await publicClient()
    .from("testimonials")
    .select("*")
    .eq("published", true);
  if (error) throw error;
  return data.map(mapTestimonial);
});

/** Edited page texts merged over the registry defaults. */
export const getPageTexts = cache(async (): Promise<Record<string, string>> => {
  const texts: Record<string, string> = Object.fromEntries(
    PAGE_TEXTS.map((t) => [t.key, t.default]),
  );
  if (!isSupabaseConfigured()) return texts;
  const { data, error } = await publicClient().from("page_texts").select("key, value");
  if (error) throw error;
  for (const row of data) if (PAGE_TEXT_BY_KEY.has(row.key)) texts[row.key] = row.value;
  return texts;
});

/** A page text with company-data variables replaced; null when a used variable has no value yet. */
export function pageText(
  texts: Record<string, string>,
  key: string,
  settings: Settings,
): string | null {
  return renderTextOrNull(texts[key] ?? PAGE_TEXT_BY_KEY.get(key)?.default ?? "", settings);
}
