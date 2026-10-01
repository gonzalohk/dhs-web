# Data Model

Extends the feature 001 schema (`specs/001-food-distribution-website/data-model.md`). Timestamps are UTC.

## Changes to existing tables

| Table | Change |
|-------|--------|
| `settings` | add `updated_at timestamptz not null default now()` |
| `categories` | rename `image_public_id` → `image_path` (Supabase Storage path, or null); add `updated_at` |
| `products` | rename `image_public_id` → `image_path`; add `updated_at` |
| `faqs` | add `updated_at` |
| `testimonials` | add `updated_at` |

`updated_at` is set by a `before update` trigger and is the optimistic-locking token (FR-013).

## page_texts (new)
- `key` (text, PK): matches a key in the code registry `src/content/page-texts.ts`
- `value` (text, not null): the edited text; may contain tokens
- `updated_at`
- Validation: `key` must exist in the registry; `value` non-empty and within the registry's max length;
  only known tokens allowed: `{companyName}`, `{tagline}`, `{phone}`, `{whatsapp}`, `{email}`, `{address}`,
  `{city}`, `{hours}`. Missing rows use the registry default.

## content_changes (new)
- `id` (uuid, PK), `changed_at` (timestamptz, default now())
- `table_name` (text), `row_id` (text)
- `op` (insert | update | delete)
- `previous` (jsonb, null for insert), `new` (jsonb, null for delete)
- `changed_by` (uuid, `auth.uid()`; null for dashboard or service edits)
- Written by a trigger on `settings`, `page_texts`, `categories`, `products`, `faqs`, `testimonials`.
- Restore: apply the `previous` snapshot of the latest change of that `(table_name, row_id)`; for a
  deleted row, re-insert it. The restore creates its own change record. Only the latest change per item
  is restorable.

## Storage
- Bucket `site-images`, public read. Staff (authenticated) can insert, update, delete.
- Object path: `<categories|products>/<uuid>.<jpg|png|webp|avif>`; maximum 5 MB.
- `image_alt` stays on the owning row and is required whenever `image_path` is set.

## Validation rules (enforced in Server Actions with zod; mirrored by DB checks where listed)
- **settings**: `company_name`, `whatsapp_number`, `email` required; email valid; `phone` and
  `whatsapp_number` normalized to E.164 `+591` + 8 digits (any digit, including a leading 5).
- **categories**: `name` and `description` required; `slug` lowercase letters, digits, hyphens, unique
  (DB unique).
- **products**: `name`, `description`, `category_id` required; `price_bob` > 0 (DB check); `unit` required
  when `price_bob` is set (DB check); `image_alt` required with an image.
- **faqs**: `topic` in ordering | payment | delivery | returns | other (DB check); `question`, `answer`
  required.
- **testimonials**: `author`, `quote` required.
- **sort_order**: integers; reorder swaps values between neighbours.

## Row Level Security additions
- Authenticated staff: select/insert/update/delete on `settings` (update only), `page_texts`, `categories`,
  `products`, `faqs`, `testimonials`; read on `content_changes`; staff can also read unpublished rows.
- Anonymous: unchanged (read published content; `page_texts` readable).
- `content_changes`: no anonymous access; inserts come from the trigger.
- Public sign-up remains disabled.

## Initial data (migration 0006)
- `settings`: `company_name = 'DHS'`, `phone = '+59157734924'`, `whatsapp_number = '+59157734924'`,
  `email = 'distribuidoradhs2026@gmail.com'`; unknown fields hold "[Pendiente] …" placeholders.
- `testimonials`: demo rows set to `published = false`; `certifications` replaced by a placeholder.
