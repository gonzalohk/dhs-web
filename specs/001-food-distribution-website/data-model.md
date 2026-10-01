# Data Model

All tables live in Supabase PostgreSQL. `published` controls public visibility. Timestamps are UTC.

## settings (single row)
- `id` (int, PK, always 1)
- `company_name`, `tagline`, `story`, `mission`, `values` (text[]), `certifications` (text[])
- `phone`, `email`, `whatsapp_number` (E.164, +591), `address`, `map_url`, `business_hours` (text)
- `service_areas` (text[]), `delivery_schedule`, `minimum_order`, `ordering_steps` (text[])

## categories
- `id` (uuid, PK), `slug` (text, unique), `name`, `description`
- `image_public_id` (Cloudinary id), `image_alt`, `sort_order` (int), `published` (bool)

## products
- `id` (uuid, PK), `category_id` (FK → categories.id), `name`, `description` (no slug: no product pages)
- `price_bob` (numeric, nullable; null = "Request a quote"), `unit` (text, required when price is set)
- `image_public_id`, `image_alt`, `sort_order`, `published`

## faqs
- `id` (uuid, PK), `topic` (ordering | payment | delivery | returns | other), `question`, `answer`,
  `sort_order`, `published`

## testimonials
- `id` (uuid, PK), `author` (client name or business type), `quote`, `published`

## inquiries
- `id` (uuid, PK), `created_at`
- `name` (required), `email` (nullable), `phone` (nullable), `business_name`, `message` (required)
- `ip_hash` (text, for rate limiting), `email_sent` (bool)
- `status` (new | handled, default new), `handled_at` (nullable), `handled_by` (nullable, staff user id)
- State transition: `new` ⇄ `handled`, by staff only.
- Validation: at least one of `email` or `phone` (+591 format); message 10–2000 chars; name ≤ 100 chars.

## Relationships and rules
- categories 1—N products; a category with no published products is hidden from listings (edge case).
- Row Level Security: anonymous read only on published rows of categories, products, faqs, testimonials,
  and settings; no anonymous access to inquiries. Inserts to inquiries only via server-side service key.
  Authenticated staff may read `inquiries` and update only `status`, `handled_at`, `handled_by`.
  Public sign-up is disabled; staff are Supabase Auth users created by the company (fewer than 10).
