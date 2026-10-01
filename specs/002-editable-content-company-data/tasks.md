# Tasks: Editable Content and Company Data

**Input**: Design documents from `/specs/002-editable-content-company-data/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/staff-editor.md, quickstart.md. Builds on feature 001 (`/specs/001-food-distribution-website/`), which is already implemented.

**Tests**: Included. The constitution (Principle IV) requires automated tests, and Principle VI requires English for code, identifiers, and documents (UI text for staff and visitors stays Spanish). Write each story's tests first and confirm they fail before implementing.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story the task belongs to (US1–US3)
- All paths are relative to the repository root `/home/zalo/Documents/proyectos`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Switch image handling from Cloudinary to Supabase Storage plus Next's built-in optimizer, and prepare configuration.

- [X] T001 Update `next.config.ts`: remove `images.loader: "custom"` and `loaderFile`; add `images.remotePatterns` for the host of `SUPABASE_URL` (path `/storage/v1/object/public/site-images/**`; derive the host from the env var, skip when unset); add `experimental.serverActions.bodySizeLimit: "6mb"` (use the key documented in `node_modules/next/dist/docs/` for this Next.js version)
- [X] T002 Delete `src/lib/image-loader.ts`; remove `NEXT_PUBLIC_CLOUDINARY_CLOUD` from `.env.example`; remove Cloudinary mentions from `README.md` and `specs/001-food-distribution-website/quickstart.md`
- [X] T003 [P] Rename `imagePublicId` to `imagePath` in `src/lib/types.ts` (types `Product` and `Category`), in `src/lib/content.ts` (map from DB column `image_path`), in `src/components/CategoryCard.tsx`, `src/components/ProductCard.tsx`, `src/app/products/[category]/page.tsx`, `tests/unit/catalog-content.test.ts`, and `src/content/placeholder.ts` (placeholder paths starting with `/` stay local files)
- [X] T004 Add `imageUrl(path: string | null): string | null` to `src/lib/content.ts` returning the Supabase public URL `${SUPABASE_URL}/storage/v1/object/public/site-images/${path}` for storage paths, the path itself when it starts with `/`, and `null` when empty; use it in `CategoryCard.tsx` and `ProductCard.tsx` before passing `src` to `next/image` (keeps explicit `width`/`height` and `alt`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database changes, shared rules, and editor building blocks needed by every story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Write migration `supabase/migrations/0004_editable_content.sql` per data-model.md: add `updated_at timestamptz not null default now()` to `settings`, `categories`, `products`, `faqs`, `testimonials` with a `before update` trigger that sets it to `now()`; rename `image_public_id` to `image_path` in `categories` and `products`; create `page_texts` (`key` text primary key, `value` text not null, `updated_at`); create `content_changes` (`id` uuid pk, `changed_at` default now(), `table_name` text, `row_id` text, `op` check in ('insert','update','delete'), `previous` jsonb null for insert, `new` jsonb null for delete, `changed_by` uuid from `auth.uid()`); add one generic trigger function that writes `content_changes` for insert, update, and delete, attached to `settings`, `page_texts`, `categories`, `products`, `faqs`, `testimonials` (row id from `id` or `key`)
- [X] T006 Write migration `supabase/migrations/0005_editor_policies.sql`: Row Level Security for authenticated staff: update on `settings`; select, insert, update, delete on `page_texts`, `categories`, `products`, `faqs`, `testimonials` (including unpublished rows); select on `content_changes`; anonymous may read `page_texts`; no anonymous access to `content_changes`; create public storage bucket `site-images` (public read; authenticated insert, update, delete); keep public sign-up disabled
- [X] T007 Write migration `supabase/migrations/0006_company_data_dhs.sql`: set `settings` row `company_name = 'DHS'`, `phone = '+59157734924'`, `whatsapp_number = '+59157734924'`, `email = 'distribuidoradhs2026@gmail.com'`; replace every value the owner did not provide (tagline, story, mission, values, certifications, client_types, address, city, map_url, business_hours, service_areas, delivery_schedule, minimum_order, ordering_steps) with clearly marked placeholders starting with "[Pendiente]"; set the demo `testimonials` to `published = false`; make no claim about DHS that the owner did not give
- [X] T008 [P] Create `src/lib/tokens.ts`: export `COMPANY_TOKENS` (exactly `{companyName}`, `{tagline}`, `{phone}`, `{whatsapp}`, `{email}`, `{address}`, `{city}`, `{hours}`), `renderText(text, settings)` replacing known tokens (phone shown as `formatBoPhone`), and `findUnknownTokens(text)` returning tokens not in the list
- [X] T009 [P] Create `src/content/page-texts.ts`: registry of editable texts, each with `key`, `page` (home | about | delivery | products | faq | contact), Spanish staff `label`, Spanish `default`, `maxLength`. Include at least: `home.eyebrow`, `home.title` (default uses `{companyName}`), `home.categoriesIntro`, `home.benefit1Title` … `home.benefit4Title` and `home.benefit1Text` … `home.benefit4Text`, `home.ctaTitle`, `home.ctaText`, `about.qualityTitle`, `about.qualityText`, `delivery.intro`, `products.intro`, `faq.intro`, `contact.intro`; defaults reproduce the current hard-coded Spanish text from `src/app/page.tsx`, `about/page.tsx`, `delivery/page.tsx`, `products/page.tsx`, `faq/page.tsx`, `contact/page.tsx` with no invented claims about DHS (replace "Santa Cruz y las principales ciudades de Bolivia." by a neutral text using `{city}`)
- [X] T010 [P] Create `src/lib/images.ts`: `validateImage(file: { type: string; size: number })` accepting only `image/jpeg`, `image/png`, `image/webp`, `image/avif` and at most 5 MB (5 * 1024 * 1024 bytes), returning a Spanish error message saying whether the file is too large or the wrong type; `buildImagePath(entity: "categories" | "products", ext, id)` returning `<entity>/<id>.<ext>`
- [X] T011 Create `src/lib/content-schemas.ts` (zod; Spanish messages naming the field) with one schema per entity enforcing data-model.md: settings (`company_name`, `whatsapp_number`, `email` required; email valid; `phone` and `whatsapp_number` normalized with `normalizeBoPhone` to `+591` followed by 8 digits, any digit including a leading 5); category (`name`, `description` required; `slug` lowercase letters, digits, hyphens); product (`name`, `description`, `category_id` required; `price_bob` > 0; `unit` required when `price_bob` is set; `image_alt` required when an image is set); faq (`topic` in ordering | payment | delivery | returns | other; `question`, `answer` required); testimonial (`author`, `quote` required); page text (known key, non-empty value within the registry `maxLength`, no unknown tokens via `findUnknownTokens`)
- [X] T012 [P] Write unit tests `tests/unit/tokens.test.ts` (known tokens replaced, phone formatted, unknown tokens listed, text without tokens unchanged) and `tests/unit/images.test.ts` (accepts JPEG/PNG/WebP/AVIF ≤ 5 MB; rejects 6 MB with the "too large" message; rejects `application/pdf` with the "type" message; path builder)
- [X] T013 [P] Write unit tests `tests/unit/content-schemas.test.ts` covering every rule in T011: empty required fields, malformed email, phone "57734924" accepted and normalized to `+59157734924`, price 0 or negative rejected, price without unit rejected, invalid topic rejected, text over `maxLength` and unknown token `{foo}` rejected
- [X] T014 Create `src/lib/content-admin.ts` (framework-free, takes a small DB interface so it is unit testable): `saveWithLock(db, table, id, values, loadedUpdatedAt)` updating only when `updated_at` equals `loadedUpdatedAt` and returning `{ ok: true, updatedAt }` or `{ ok: false, conflict: true }` when zero rows match (FR-013); `swapOrder(items, id, direction)` returning the two `sort_order` updates for neighbours; `canRestore(changes, changeId)` true only when the change is the latest for its `(table_name, row_id)`; `snapshotForRestore(change)` returning the row to apply (for a deleted row, the full `previous` snapshot to re-insert)
- [X] T015 [P] Write unit tests `tests/unit/content-admin.test.ts`: lock succeeds with matching `updated_at`; stale `updated_at` returns `conflict` and writes nothing; `swapOrder` at the first and last positions does nothing; `canRestore` false for an older change; delete restore returns the full snapshot
- [X] T016 Create `src/lib/staff-session.ts`: `requireStaff()` that returns the signed-in staff user via `staffClient()` or calls `redirect("/admin/login")`; use it in every new admin page and Server Action (contracts/staff-editor.md, "Authorization")
- [X] T017 Extend `src/lib/content.ts`: add `getPageTexts()` (rows from `page_texts` merged over registry defaults; defaults only when Supabase is not configured) and `text(texts, key, settings)` helper that returns `renderText(value, settings)`; wrap with `cache`
- [X] T018 [P] Create `src/components/admin/EditorForm.tsx` (client): shared form shell using `useActionState`; shows field errors named by field, a conflict banner "Alguien más guardó cambios; recargue la página" while keeping the typed values, a saving state, a success message, and a slot for the preview panel; carries the loaded `updatedAt` in a hidden field; controls ≥ 44 px, single column at 320 px
- [X] T019 [P] Create `src/components/admin/ImageField.tsx` (client): file input plus required alt text; calls `validateImage` before upload and shows its message; shows the current image and keeps it when the upload fails
- [X] T020 Update `src/app/admin/layout.tsx`: add staff navigation (Panel, Datos de la empresa, Textos, Categorías, Productos, Preguntas frecuentes, Testimonios, Historial, Consultas, Cerrar sesión) usable at 320 px; keep `robots: noindex, nofollow`
- [X] T021 Update `src/proxy.ts` only if needed so `/admin` and all `/admin/*` stay protected (matcher already covers them); add a test case to `tests/e2e/admin.spec.ts` that each new route (`/admin/company`, `/admin/texts`, `/admin/categories`, `/admin/products`, `/admin/faqs`, `/admin/testimonials`, `/admin/history`) redirects signed-out visitors to `/admin/login` (SC-007)

**Checkpoint**: Migrations, rules, and editor building blocks ready; user stories can start.

---

## Phase 3: User Story 1 - Define company data once and see it everywhere (Priority: P1) 🎯 MVP

**Goal**: The company data (DHS) lives in one record; every page, link, title, preview, and structured datum reads it; staff can edit it.

**Independent Test**: With DHS data loaded, open every public page and see only DHS name, +591 57734924, and the DHS email, no placeholder company data; change the phone in `/admin/company` and see every phone and WhatsApp link update.

### Tests for User Story 1

- [X] T022 [P] [US1] Update `src/content/placeholder.ts` and the e2e/unit tests that assert the old demo company ("Distribuidora Andina", "+591 3300 0000"): placeholder `settings` now use DHS name, phone `+59157734924`, WhatsApp `+59157734924`, email `distribuidoradhs2026@gmail.com`, and "[Pendiente]" placeholders for all other fields; update `tests/e2e/home-about.spec.ts`, `contact.spec.ts`, `faq-trust.spec.ts`, `delivery.spec.ts`, `catalog.spec.ts`, `tests/unit/seo.test.ts` accordingly (testimonials in placeholder content are unpublished, so the trust section must handle zero testimonials)
- [X] T023 [P] [US1] Write Playwright test `tests/e2e/company-data.spec.ts`: on `/`, `/about`, `/products`, `/delivery`, `/faq`, `/contact` the header and footer show "DHS" and `+591 5773 4924`; every `a[href^="tel:"]` equals `tel:+59157734924`; every WhatsApp link matches `wa.me/59157734924`; every `mailto:` is `distribuidoradhs2026@gmail.com`; the server HTML of `/` and `/contact` has JSON-LD `LocalBusiness` with the same `name`, `telephone`, `email`; no page contains "Distribuidora Andina"
- [X] T024 [P] [US1] Write unit tests `tests/unit/page-texts.test.ts`: every registry key is unique, has a default within its `maxLength`, and its default contains only known tokens; `text()` falls back to the default when the key is missing and renders tokens from settings

### Implementation for User Story 1

- [X] T025 [US1] Make the public pages read texts from `getPageTexts()`: `src/app/page.tsx` (eyebrow, title, categories intro, four benefits, CTA title and text), `src/app/about/page.tsx` (quality title and text), `src/app/delivery/page.tsx` (intro), `src/app/products/page.tsx` (intro), `src/app/faq/page.tsx` (intro), `src/app/contact/page.tsx` (intro); remove hard-coded city names and company claims from these files; keep `export const revalidate = 3600`
- [X] T026 [US1] Make metadata and structured data read company data only from `settings`: update `generateMetadata` in `src/app/page.tsx`, `about/page.tsx`, `contact/page.tsx` and the static `metadata` in `products/page.tsx`, `delivery/page.tsx`, `faq/page.tsx` (convert to `generateMetadata` using `settings.companyName`/`city`), remove "Bolivia"/city literals that duplicate settings, and confirm `localBusinessJsonLd` in `src/lib/seo.ts` uses only settings
- [X] T027 [US1] Create the company editor page `src/app/admin/company/page.tsx` (server component loading `settings`, rendering `EditorForm` with all company fields, `updatedAt` hidden field, token help list from `COMPANY_TOKENS`, Spanish labels, preview slot omitted until US3)
- [X] T028 [US1] Create `src/app/admin/content-actions.ts` with `saveCompany(state, formData)`: `requireStaff()`, validate with the settings schema from T011 (nothing saved on any invalid field, errors keyed by field name), `saveWithLock` against `settings` (id 1), on success `revalidatePath("/", "layout")`, return `{ ok: true }` or `{ ok: false, errors, conflict? }` per contracts/staff-editor.md
- [X] T029 [US1] Handle zero published testimonials in `src/components/TrustSection.tsx`: hide the testimonials column when the list is empty, and hide certifications and client-types blocks whose lists are empty or contain only "[Pendiente]" placeholders (so no unverified claim is shown)
- [X] T030 [US1] Create the dashboard `src/app/admin/page.tsx` (replace the redirect): links to every editor and to inquiries, a list of company data fields and page texts that still contain "[Pendiente]", and the latest 5 changes from `content_changes`; update `src/proxy.ts` redirect of signed-in users from `/admin/login` to `/admin`

**Checkpoint**: DHS data shows consistently everywhere and is editable in one place; MVP demonstrable.

---

## Phase 4: User Story 2 - Edit website content without a developer (Priority: P1)

**Goal**: Staff add, edit, hide, reorder, delete, and upload images for categories, products, FAQs, testimonials, and edit page texts, with validation and conflict warnings; changes go public immediately.

**Independent Test**: Staff change a product price, add a product with an image, hide a FAQ, edit the home title, and verify all four on the public site.

### Tests for User Story 2

- [X] T031 [P] [US2] Write Playwright test `tests/e2e/editor.spec.ts` (runs only when Supabase and `E2E_STAFF_EMAIL`/`E2E_STAFF_PASSWORD` are set, otherwise `test.skip`): sign in; change a product's price and see `Bs …` on its category page; add a product; hide a FAQ and see it disappear from `/faq`; edit `home.title` using `{companyName}` and see "DHS" on `/`; invalid input (empty product name, price without unit, malformed email in company data, unknown token `{foo}`) shows a message naming the field and saves nothing; reject a 6 MB image and a PDF with a clear message and keep the existing image
- [X] T032 [P] [US2] Write unit tests `tests/unit/content-actions.test.ts` (mocked Supabase and session): every action returns an unauthorized redirect without a session and writes nothing (SC-007); invalid input writes nothing; successful save calls `revalidatePath("/", "layout")`; `moveItem` swaps `sort_order` with the neighbour; `deleteItem` removes the row

### Implementation for User Story 2

- [X] T033 [US2] Extend `src/app/admin/content-actions.ts` with `saveText(state, formData)` (page text upsert by `key`, schema from T011, `saveWithLock` when the row exists) and `saveItem(entity, state, formData)` for `category | product | faq | testimonial` (insert when no `id`, update with `saveWithLock` otherwise, per-entity schema, revalidate)
- [X] T034 [US2] Extend `src/app/admin/content-actions.ts` with `setVisibility(entity, id, published)`, `moveItem(entity, id, direction)` using `swapOrder`, `deleteItem(entity, id)` (deleting a category with products is refused with a message unless it has none), each calling `requireStaff()` and `revalidatePath("/", "layout")`
- [X] T035 [US2] Extend `src/app/admin/content-actions.ts` with `uploadImage(entity, formData)`: `requireStaff()`, `validateImage`, require non-empty alt text, upload to bucket `site-images` at `buildImagePath(...)` with the staff client, return `{ ok: true, path }` or `{ ok: false, error }` leaving the existing image untouched on failure
- [X] T036 [P] [US2] Create the texts editor `src/app/admin/texts/page.tsx`: one `EditorForm` field per registry entry grouped by page, showing label, current value (or default), `maxLength` counter, and the allowed tokens
- [X] T037 [P] [US2] Create `src/app/admin/categories/page.tsx`: list with Mostrar/Ocultar, Subir/Bajar, Editar, Eliminar; add/edit form (name, description, slug, `ImageField`, visibility) with unpublished rows included
- [X] T038 [P] [US2] Create `src/app/admin/products/page.tsx`: list grouped by category with the same controls; form for name, description, category, optional price in Bs with unit (message "Indique la unidad de venta" when a price has no unit), `ImageField`, visibility
- [X] T039 [P] [US2] Create `src/app/admin/faqs/page.tsx` and `src/app/admin/testimonials/page.tsx`: lists with the same controls; FAQ form with topic selector (ordering | payment | delivery | returns | other), question, answer; testimonial form with author, quote
- [X] T040 [US2] Make public queries respect visibility after edits: in `src/lib/content.ts` ensure `getCatalog`, `getFaqs`, `getTestimonials` order by `sort_order` and only return published rows; hide categories without published products (already implemented in `groupCatalog`; add a regression test in `tests/unit/catalog-content.test.ts`)
- [X] T041 [US2] Add the "Editar" quick link on `/admin` for each editor and verify the editors are usable at 320, 768, and 1280 px (no horizontal scroll, controls ≥ 44 px) with a responsive check in `tests/e2e/editor.spec.ts` for the signed-out pages and, when configured, the signed-in pages

**Checkpoint**: Staff can maintain all site content themselves.

---

## Phase 5: User Story 3 - Edit safely and recover from mistakes (Priority: P2)

**Goal**: Staff preview an item before saving and restore the previous value of a published change.

**Independent Test**: Change a product price, preview it before saving, save it, then restore the previous value from the history page.

### Tests for User Story 3

- [X] T042 [P] [US3] Extend `tests/e2e/editor.spec.ts` (gated like T031): the preview panel shows the product card with the unsaved price before saving and the public page does not change until saving; after saving a wrong price, `/admin/history` → "Restaurar valor anterior" returns the public page to the old price; the restore button is absent for an older change of the same item
- [X] T043 [P] [US3] Extend `tests/unit/content-actions.test.ts`: `restoreChange` fails without a session; fails with `{ ok: false }` when a newer change exists for that item; for an update it applies `previous`; for a delete it re-inserts the full snapshot; the restore itself is recorded as a new change

### Implementation for User Story 3

- [X] T044 [US3] Create `src/components/admin/Preview.tsx` (client): renders the real public components with the unsaved form values — `ProductCard` for products, `CategoryCard` for categories, an FAQ `details` item, a testimonial `figure`, and a text block with tokens rendered by `renderText` for page texts and company data — inside the `EditorForm` preview slot with the label "Vista previa"; it never writes
- [X] T045 [US3] Wire `Preview` into the company, texts, categories, products, FAQ, and testimonial editors (`src/app/admin/company/page.tsx`, `texts/page.tsx`, `categories/page.tsx`, `products/page.tsx`, `faqs/page.tsx`, `testimonials/page.tsx`); keep the layout single column at 320 px
- [X] T046 [US3] Add `restoreChange(changeId)` to `src/app/admin/content-actions.ts`: `requireStaff()`, `canRestore`, apply `snapshotForRestore` (update, or re-insert for a deleted row) through the staff client, revalidate, return `{ ok }`
- [X] T047 [US3] Create `src/app/admin/history/page.tsx`: list `content_changes` newest first with table, item label, operation, who and when (Intl `es-BO`, timezone `America/La_Paz`), and a "Restaurar valor anterior" button only on the latest change of each item; show a clear message when nothing can be restored

**Checkpoint**: Editing is safe and reversible.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates across all stories

- [X] T048 [P] Update documentation: `specs/001-food-distribution-website/plan.md` and `research.md` note that image handling moved to Supabase Storage (see feature 002), mark Cloudinary removed in the Complexity Tracking table, and refresh `README.md` and `.env.example`
- [ ] T049 [P] Accessibility pass on all new admin pages: labels tied to inputs, error text linked with `aria-describedby`, visible focus, keyboard-only operation, contrast (FR-014)
- [X] T050 Run `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run test:e2e` (all three widths), `npm run build`, and `npm run test:lighthouse`; public pages keep SEO = 100 and other categories ≥ 90 (SC-006); fix regressions
- [X] T051 Verify no placeholder or invented company data is visible on public pages with the DHS migration applied: search the rendered pages for "[Pendiente]" and for "Distribuidora Andina", and confirm the dashboard lists every remaining "[Pendiente]" field (FR-003)
- [ ] T052 Run the manual validation steps in `specs/002-editable-content-company-data/quickstart.md` against a real Supabase project (migrations 0004–0006 applied, one staff user, bucket `site-images`) and record the result in this file's notes; includes the two-browser conflict test and the image upload limits
- [ ] T053 Ask the owner for the real content to replace the placeholders (tagline, story, mission, values, address, city, hours, service areas, delivery terms, categories, products, images, certifications) and enter it through the editors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies. T003 and T004 touch the same components as US1 later; finish them first.
- **Foundational (Phase 2)**: depends on Setup; blocks all stories. Migrations T005–T007 are sequential and must be applied to Supabase before any editor works.
- **US1 (Phase 3)**: depends on Phase 2.
- **US2 (Phase 4)**: depends on Phase 2; reuses `content-actions.ts` created in T028 (US1), so start after T028 or create the file with shared helpers first.
- **US3 (Phase 5)**: depends on US2 editors (preview slot, change log).
- **Polish (Phase 6)**: after the desired stories.

### Within Each Story

- Tests are written first and MUST fail before implementation.
- Schemas and logic modules before Server Actions; Server Actions before pages.

### Parallel Opportunities

- Phase 2: T008, T009, T010 in parallel; T012, T013, T015 in parallel after their modules; T018 and T019 in parallel.
- US1: T022, T023, T024 in parallel.
- US2: T031 and T032 in parallel; T036–T039 in parallel (different files).
- US3: T042 and T043 in parallel.

### Parallel Example: User Story 2

```text
Task: T036 src/app/admin/texts/page.tsx
Task: T037 src/app/admin/categories/page.tsx
Task: T038 src/app/admin/products/page.tsx
Task: T039 src/app/admin/faqs/page.tsx and testimonials/page.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 → Phase 2 → Phase 3 (company data everywhere, plus the company editor).
2. Apply the three migrations to Supabase, then validate that DHS data is consistent on every page.

### Incremental Delivery

1. Add US2 so staff can manage all content without a developer.
2. Add US3 (preview and restore).
3. Finish with Polish and enter the owner's real content (T053).
