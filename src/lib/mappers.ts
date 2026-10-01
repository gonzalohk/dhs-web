// Maps database rows (snake_case) to the app types. Used by the public queries and the staff editors.
import { storagePublicUrl } from "./images";
import type { Category, Faq, FaqTopic, Product, Settings, Testimonial } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export function mapSettings(r: Row): Settings {
  return {
    companyName: r.company_name,
    tagline: r.tagline,
    story: r.story,
    mission: r.mission,
    values: r.values,
    certifications: r.certifications,
    clientTypes: r.client_types,
    phone: r.phone,
    email: r.email,
    whatsappNumber: r.whatsapp_number,
    address: r.address,
    city: r.city,
    mapUrl: r.map_url,
    businessHours: r.business_hours,
    serviceAreas: r.service_areas,
    deliverySchedule: r.delivery_schedule,
    minimumOrder: r.minimum_order,
    orderingSteps: r.ordering_steps,
    updatedAt: r.updated_at,
  };
}

export function mapCategory(r: Row): Category {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    imagePath: r.image_path,
    imageSrc: storagePublicUrl(r.image_path),
    imageAlt: r.image_alt,
    published: r.published,
    sortOrder: r.sort_order,
    updatedAt: r.updated_at,
  };
}

export function mapProduct(r: Row): Product {
  return {
    id: r.id,
    categoryId: r.category_id,
    name: r.name,
    description: r.description,
    priceBob: r.price_bob === null ? null : Number(r.price_bob),
    unit: r.unit,
    imagePath: r.image_path,
    imageSrc: storagePublicUrl(r.image_path),
    imageAlt: r.image_alt,
    published: r.published,
    sortOrder: r.sort_order,
    updatedAt: r.updated_at,
  };
}

export function mapFaq(r: Row): Faq {
  return {
    id: r.id,
    topic: r.topic as FaqTopic,
    question: r.question,
    answer: r.answer,
    published: r.published,
    sortOrder: r.sort_order,
    updatedAt: r.updated_at,
  };
}

export function mapTestimonial(r: Row): Testimonial {
  return {
    id: r.id,
    author: r.author,
    quote: r.quote,
    published: r.published,
    updatedAt: r.updated_at,
  };
}
