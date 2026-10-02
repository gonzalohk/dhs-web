import type { Metadata } from "next";
import { COMPANY_FULL_NAME } from "./brand";
import type { Faq, Settings } from "./types";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

type PageMeta = { title: string; description: string; path: string };

/** Per-page metadata: unique title and description, canonical URL, social previews. */
export function buildMetadata({ title, description, path }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", locale: "es_BO" },
    twitter: { card: "summary", title, description },
  };
}

export function localBusinessJsonLd(s: Settings) {
  const hasAddress = Boolean(s.address || s.city);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: s.companyName,
    legalName: COMPANY_FULL_NAME,
    ...(s.tagline ? { description: s.tagline } : {}),
    url: siteUrl,
    telephone: s.phone,
    email: s.email,
    ...(hasAddress
      ? {
          address: {
            "@type": "PostalAddress",
            ...(s.address ? { streetAddress: s.address } : {}),
            ...(s.city ? { addressLocality: s.city } : {}),
            addressCountry: "BO",
          },
        }
      : {}),
    ...(s.serviceAreas.length > 0
      ? { areaServed: s.serviceAreas.map((name) => ({ "@type": "City", name })) }
      : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function itemListJsonLd(name: string, items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { url: `${siteUrl}${item.path}` } : {}),
    })),
  };
}

export function faqPageJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
