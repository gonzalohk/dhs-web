import { cache } from "react";
import * as placeholder from "@/content/placeholder";
import { isSupabaseConfigured, publicClient } from "./supabase";
import type { Category, CategoryWithProducts, Faq, Product, Settings, Testimonial } from "./types";

// Content comes from Supabase when configured, otherwise from placeholder content.
// Pages using these functions set `export const revalidate = 3600`.

/** Attaches products to their category and drops categories that have no products. */
export function groupCatalog(categories: Category[], products: Product[]): CategoryWithProducts[] {
  return categories
    .map((category) => ({
      ...category,
      products: products.filter((p) => p.categoryId === category.id),
    }))
    .filter((category) => category.products.length > 0);
}

export const getSettings = cache(async (): Promise<Settings> => {
  if (!isSupabaseConfigured()) return placeholder.settings;
  const { data, error } = await publicClient().from("settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return {
    companyName: data.company_name,
    tagline: data.tagline,
    story: data.story,
    mission: data.mission,
    values: data.values,
    certifications: data.certifications,
    clientTypes: data.client_types,
    phone: data.phone,
    email: data.email,
    whatsappNumber: data.whatsapp_number,
    address: data.address,
    city: data.city,
    mapUrl: data.map_url,
    businessHours: data.business_hours,
    serviceAreas: data.service_areas,
    deliverySchedule: data.delivery_schedule,
    minimumOrder: data.minimum_order,
    orderingSteps: data.ordering_steps,
  };
});

export const getCatalog = cache(async (): Promise<CategoryWithProducts[]> => {
  if (!isSupabaseConfigured()) return groupCatalog(placeholder.categories, placeholder.products);
  const db = publicClient();
  const [cats, prods] = await Promise.all([
    db.from("categories").select("*").eq("published", true).order("sort_order"),
    db.from("products").select("*").eq("published", true).order("sort_order"),
  ]);
  if (cats.error) throw cats.error;
  if (prods.error) throw prods.error;
  const categories: Category[] = cats.data.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    imagePublicId: c.image_public_id,
    imageAlt: c.image_alt,
  }));
  const products: Product[] = prods.data.map((p) => ({
    id: p.id,
    categoryId: p.category_id,
    name: p.name,
    description: p.description,
    priceBob: p.price_bob === null ? null : Number(p.price_bob),
    unit: p.unit,
    imagePublicId: p.image_public_id,
    imageAlt: p.image_alt,
  }));
  return groupCatalog(categories, products);
});

export async function getCategory(slug: string): Promise<CategoryWithProducts | undefined> {
  return (await getCatalog()).find((c) => c.slug === slug);
}

export const getFaqs = cache(async (): Promise<Faq[]> => {
  if (!isSupabaseConfigured()) return placeholder.faqs;
  const { data, error } = await publicClient()
    .from("faqs")
    .select("id, topic, question, answer")
    .eq("published", true)
    .order("sort_order");
  if (error) throw error;
  return data;
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  if (!isSupabaseConfigured()) return placeholder.testimonials;
  const { data, error } = await publicClient()
    .from("testimonials")
    .select("id, author, quote")
    .eq("published", true);
  if (error) throw error;
  return data;
});
