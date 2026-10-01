# Tasks: Food Distribution Company Website

**Input**: Design documents from `/specs/001-food-distribution-website/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included. The constitution (Principle IV) requires automated tests for every feature, and SEO output and staff access control must be covered.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story the task belongs to (US1–US7)
- All paths are relative to the repository root `/home/zalo/Documents/proyectos`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create the Next.js 14 App Router project (TypeScript, Tailwind, `src/` directory, Node 20) at the repository root, with the folder layout from plan.md in `src/`, `supabase/migrations/`, and `tests/{unit,e2e,lighthouse}/`
- [X] T002 Install only the planned dependencies in `package.json`: `@supabase/supabase-js`, `@supabase/ssr`, `resend`, `zod`; dev: `vitest`, `@playwright/test`, `@lhci/cli`. Add no others without justification in plan.md
- [X] T003 [P] Configure ESLint, Prettier, and strict TypeScript in `eslint.config.mjs`, `.prettierrc`, `tsconfig.json`
- [X] T004 [P] Create `.env.example` with `NEXT_PUBLIC_SITE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CLOUDINARY_CLOUD`, `NEXT_PUBLIC_GTM_ID`; ensure `.env.local` is in `.gitignore`
- [X] T005 [P] Add npm scripts `test`, `test:e2e`, `test:lighthouse` in `package.json` and create `vitest.config.ts`, `playwright.config.ts` (projects at 320, 768, 1280 px widths), `lighthouserc.json` (SEO = 100, performance/accessibility/best-practices ≥ 0.9, mobile and desktop)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Write the Supabase migration `supabase/migrations/0001_schema.sql` creating tables from data-model.md: `settings` (single row, `id` int PK always 1), `categories` (`slug` unique), `products` (`category_id` FK → categories.id; `price_bob` numeric nullable; `unit` text, required when price is set; no slug), `faqs` (`topic` in ordering | payment | delivery | returns | other), `testimonials`, and `inquiries` (`status` new | handled default new; `handled_at`, `handled_by` nullable; `ip_hash`; `email_sent`)
- [X] T007 Write `supabase/migrations/0002_rls.sql`: anonymous read only on published rows of categories, products, faqs, testimonials, and on settings; no anonymous access to inquiries; authenticated staff may read `inquiries` and update only `status`, `handled_at`, `handled_by`; public sign-up disabled (document the dashboard setting in the file header)
- [X] T008 Write `supabase/migrations/0003_seed.sql` with placeholder Spanish company settings (Bolivia, +591), 4–6 categories, 10–15 products (some with `price_bob` and `unit`, most null), 6+ FAQs across ordering, payment, delivery, returns, and 3 testimonials
- [X] T009 [P] Implement `src/lib/supabase.ts` with server-only clients: public read (anon key), service role (for inquiry inserts), and staff session via `@supabase/ssr`; never import in client components
- [X] T010 [P] Implement `src/lib/format.ts`: Bs price formatter (`Intl`, locale `es-BO`), +591 phone normalizer to E.164 and display formatter, and `wa.me/591…?text=` link builder with URL-encoded message
- [X] T011 [P] Implement `src/lib/cloudinary.ts`: URL helper returning `f_auto,q_auto` delivery URLs with explicit width/height, plus a Next `Image` custom loader; fall back to a local placeholder when `public_id` is missing
- [X] T012 [P] Implement typed content queries in `src/lib/content.ts`: settings, published categories with published products (hide categories with no published products), category by slug, published FAQs by topic, published testimonials; all with `revalidate: 3600`
- [X] T013 [P] Implement `src/lib/seo.ts`: `buildMetadata()` (unique title, description, canonical, Open Graph/Twitter with `es_BO`) and JSON-LD builders for LocalBusiness (`addressCountry: BO`, `areaServed`), BreadcrumbList, ItemList, FAQPage
- [X] T014 [P] Create `src/components/JsonLd.tsx` rendering a JSON-LD `<script>` from a typed object
- [X] T015 Create `src/app/layout.tsx`: `lang="es-BO"`, base metadata, mobile-first Tailwind base styles (single colour palette, typography, spacing tokens in `tailwind.config.ts`), skip-to-content link, GTM/GA4 script loaded `afterInteractive` only when `NEXT_PUBLIC_GTM_ID` is set
- [X] T016 [P] Create `src/components/Header.tsx` (main navigation reaching every section in one click, accessible mobile menu, desktop WhatsApp button) and `src/components/Footer.tsx` (company name, contact details, section links, privacy notice link) reading from settings
- [X] T017 [P] Create `src/components/WhatsAppButton.tsx`: sticky on mobile (touch target ≥ 44×44 px), pre-filled Spanish message with page context, opens `wa.me/591…`; include it in `src/app/layout.tsx`
- [X] T018 [P] Create `src/app/not-found.tsx`: friendly 404 with links to main sections, returning HTTP 404
- [X] T019 [P] Write unit tests in `tests/unit/format.test.ts` (Bs formatting, +591 normalization, wa.me link encoding) and `tests/unit/seo.test.ts` (metadata uniqueness fields, JSON-LD shapes)

**Checkpoint**: Foundation ready; user stories can start.

---

## Phase 3: User Story 1 - Learn who the company is and what it offers (Priority: P1) 🎯 MVP

**Goal**: A first-time visitor understands within seconds what the company distributes, who it serves, and how to reach it.

**Independent Test**: Open Home and About on phone and desktop; a first-time visitor states what the company does, its product categories, and where it operates.

### Tests for User Story 1

- [X] T020 [P] [US1] Playwright e2e in `tests/e2e/home-about.spec.ts`: Home shows company name, value proposition, category summary, and a contact action within the first screen at 320, 768, and 1280 px; About shows story, mission, values, quality commitments; every main section reachable in one click from navigation; no horizontal scroll

### Implementation for User Story 1

- [X] T021 [P] [US1] Create `src/components/CategoryCard.tsx` (image via Cloudinary helper with explicit size, name, short description, link to `/products/[slug]`)
- [X] T022 [US1] Implement Home in `src/app/page.tsx`: hero with value proposition and WhatsApp action, category summary, key benefits (reliability, freshness, coverage), trust signals area, prominent contact/quote action, LocalBusiness JSON-LD, unique metadata (FR-003, FR-020)
- [X] T023 [US1] Implement About in `src/app/about/page.tsx`: company story, mission, values, quality and food-safety commitments, unique metadata (FR-004)

**Checkpoint**: Home and About work on their own; MVP demonstrable.

---

## Phase 4: User Story 2 - Browse the product catalog (Priority: P1)

**Goal**: A buyer explores categories and their products and can request a quote.

**Independent Test**: Open Products, find a category, see its products (with Bs price where set, otherwise "Solicitar cotización") without contacting the company.

### Tests for User Story 2

- [X] T024 [P] [US2] Playwright e2e in `tests/e2e/catalog.spec.ts`: all categories listed with image and description; category page lists all its products on one page; priced product shows Bs price and unit; unpriced product shows "Solicitar cotización" linking to WhatsApp; unknown category slug returns 404; empty categories are not listed
- [X] T025 [P] [US2] Unit test in `tests/unit/catalog-content.test.ts` for content queries hiding categories without published products

### Implementation for User Story 2

- [X] T026 [P] [US2] Create `src/components/ProductCard.tsx`: name, short description, image, price in Bs with unit when `price_bob` is set, otherwise "Solicitar cotización" WhatsApp action (layout identical in both cases, FR-006a)
- [X] T027 [US2] Implement `src/app/products/page.tsx`: all categories with image and short description, ItemList JSON-LD, unique metadata
- [X] T028 [US2] Implement `src/app/products/[category]/page.tsx`: `generateStaticParams`, all published products on a single page (no search, filters, pagination), BreadcrumbList + ItemList JSON-LD, per-category metadata, `notFound()` for unknown slug, "Request a quote" action visible (FR-005a, FR-006)

**Checkpoint**: Catalog browsable independently.

---

## Phase 5: User Story 3 - Contact the company or request a quote (Priority: P1)

**Goal**: A buyer contacts the company via WhatsApp (primary), the form, or phone; inquiries are stored and emailed.

**Independent Test**: Submit the form and see confirmation, a stored row, and an email; on mobile, tap phone/email/WhatsApp and the right app opens.

### Tests for User Story 3

- [X] T029 [P] [US3] Unit tests in `tests/unit/inquiry-schema.test.ts` for zod rules: `name` required 1–100 chars; `email` optional valid email, required if `phone` empty; `phone` optional, 7–20 chars of digits/`+`/spaces, required if `email` empty (+591 format); `business_name` ≤ 120 chars; `message` required 10–2000 chars; honeypot `website` must be empty; submissions faster than 3 s rejected
- [X] T030 [P] [US3] Unit tests in `tests/unit/submit-inquiry.test.ts` (mocked Supabase and Resend): success returns `{ ok: true }`; validation errors return per-field messages with input preserved; spam signals return success-looking result without storing; rate limit of 5 per hour per hashed IP; email failure does not fail the request when insert succeeded
- [X] T031 [P] [US3] Playwright e2e in `tests/e2e/contact.spec.ts`: contact page shows phone, email, address with map, hours, form; valid submit shows confirmation; invalid submit shows specific errors and keeps input; `tel:`, `mailto:`, and WhatsApp links present; sticky WhatsApp button visible on mobile on every page

### Implementation for User Story 3

- [X] T032 [US3] Implement zod schema in `src/lib/schema.ts` per contracts/contact-form.md with friendly Spanish error messages
- [X] T033 [US3] Implement Server Action `submitInquiry` in `src/app/contact/actions.ts` per contracts/contact-form.md: validate, reject spam signals silently, rate limit by hashed IP (max 5 per hour, counted in `inquiries`), insert via service role, send email to `CONTACT_TO_EMAIL` with Resend, set `email_sent`; return `{ ok, errors, formError }` with phone/WhatsApp fallback text on failure
- [X] T034 [US3] Create `src/components/ContactForm.tsx` (client component; fields name, email, phone, business name, message; hidden honeypot and `started_at`; inline errors; confirmation state; short privacy notice stating how data is used, FR-019; WhatsApp shown first as the main action)
- [X] T035 [US3] Implement `src/app/contact/page.tsx`: `tel:` and `mailto:` links, address with map embed (`map_url`), business hours, WhatsApp primary action, form secondary, unique metadata

**Checkpoint**: Lead capture works end-to-end.

---

## Phase 6: User Story 4 - Find the company through search engines (Priority: P2)

**Goal**: Every public page is technically ready for high SEO scores and local Bolivian search.

**Independent Test**: Audit each public page for metadata, structured data, sitemap entry, and Lighthouse SEO = 100.

### Tests for User Story 4

- [X] T036 [P] [US4] Playwright e2e in `tests/e2e/seo.spec.ts`: for every public route, unique `<title>` and meta description, single `<h1>`, canonical URL, Open Graph tags, `lang="es-BO"`, content present in server HTML (JavaScript disabled); `/sitemap.xml` lists public routes and excludes `/admin`; `/robots.txt` links the sitemap and disallows `/admin`; JSON-LD parses on Home, Products, category, FAQ
- [X] T037 [P] [US4] Configure Lighthouse CI in `tests/lighthouse/run.mjs` over all public routes (mobile and desktop): SEO = 100; performance, accessibility, best practices ≥ 90; assert LCP ≤ 2.5 s, CLS ≤ 0.1

### Implementation for User Story 4

- [X] T038 [P] [US4] Implement `src/app/sitemap.ts` generating URLs for all public pages and published categories (excluding `/admin/*`)
- [X] T039 [P] [US4] Implement `src/app/robots.ts`: allow public pages, disallow `/admin`, reference the sitemap
- [X] T040 [US4] Review every page in `src/app/` for one `h1`, ordered headings, landmarks, `alt` text, Bolivian Spanish place names and cities served in copy and LocalBusiness `areaServed` (FR-020); fix gaps found by T036/T037

**Checkpoint**: SEO gates pass.

---

## Phase 7: User Story 5 - Understand service areas, ordering, and delivery (Priority: P2)

**Goal**: A buyer learns coverage, delivery schedule, minimum order, and how to become a customer.

**Independent Test**: Everything is on one page without contacting the company.

### Tests for User Story 5

- [X] T041 [P] [US5] Playwright e2e in `tests/e2e/delivery.spec.ts`: page shows coverage areas, delivery schedule, minimum order info, ordering steps, and a visible "Solicitar cotización" / "Abrir cuenta" WhatsApp action

### Implementation for User Story 5

- [X] T042 [US5] Implement `src/app/delivery/page.tsx` from settings (`service_areas`, `delivery_schedule`, `minimum_order`, `ordering_steps`) with unique metadata and BreadcrumbList JSON-LD (FR-011)

---

## Phase 8: User Story 6 - Read common questions and trust signals (Priority: P3)

**Goal**: A cautious buyer finds certifications, client types, testimonials, and FAQ answers.

**Independent Test**: FAQ and trust content are reachable on the site.

### Tests for User Story 6

- [X] T043 [P] [US6] Playwright e2e in `tests/e2e/faq-trust.spec.ts`: FAQ shows answers grouped by ordering, payment, delivery, returns; Home/About show certifications, client types, and testimonials; FAQPage JSON-LD present

### Implementation for User Story 6

- [X] T044 [US6] Implement `src/app/faq/page.tsx` (accessible disclosure list grouped by topic, FAQPage JSON-LD, unique metadata) (FR-012)
- [X] T045 [US6] Add `src/components/Testimonials.tsx` and a certifications/client-types block, and use them in `src/app/page.tsx` and `src/app/about/page.tsx`

---

## Phase 9: User Story 7 - Manage received inquiries (Priority: P3)

**Goal**: Authorized staff sign in, see inquiries, and mark them handled.

**Independent Test**: Submit an inquiry publicly, sign in as staff, find it, mark it handled.

### Tests for User Story 7

- [X] T046 [P] [US7] Playwright e2e in `tests/e2e/admin.spec.ts`: signed-out request to `/admin/inquiries` redirects to `/admin/login` and shows no inquiry data; signed-in staff see inquiries newest first with name, contact, business, message, date, status; status toggles new ⇄ handled and persists; filter by status works; `/admin/*` has `noindex` and no public page links to it
- [X] T047 [P] [US7] Unit test in `tests/unit/admin-actions.test.ts`: `setInquiryStatus` fails without a session and updates `status`, `handled_at`, `handled_by` with one

### Implementation for User Story 7

- [X] T048 [US7] Implement `src/proxy.ts`: refresh the Supabase session and redirect unauthenticated `/admin/*` requests (except `/admin/login`) to `/admin/login`
- [X] T049 [US7] Implement Server Actions in `src/app/admin/actions.ts` per contracts/staff-area.md: `signIn` (generic error message), `signOut`, `setInquiryStatus(id, status)` where status is `new` or `handled`
- [X] T050 [US7] Implement `src/app/admin/login/page.tsx` (sign-in form, `robots: noindex`)
- [X] T051 [US7] Implement `src/app/admin/inquiries/page.tsx`: list newest first, status filter via query parameter (`all`, `new`, `handled`), status toggle, responsive layout, `robots: noindex`
- [X] T052 [US7] Document in `specs/001-food-distribution-website/quickstart.md` how to create staff users in Supabase Auth with public sign-up disabled (if not already present)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates across all stories

- [ ] T053 [P] Replace placeholder seed content with company-provided name, logo, brand colours, contact details, hours, products, photos, and texts (content task, tracked here for the company)
- [X] T054 [P] Accessibility pass on all pages: keyboard navigation, visible focus, contrast, labels, alt text (FR-015)
- [X] T055 [P] Verify images: explicit width/height, lazy loading below the fold, priority for the LCP image on Home and category pages (SC-004)
- [X] T056 Fix the contact form contract: update `specs/001-food-distribution-website/contracts/contact-form.md` phone rule to the +591 format used in `src/lib/schema.ts`
- [X] T057 Run the full validation in `specs/001-food-distribution-website/quickstart.md`: `npm test`, `npm run test:e2e`, `npm run test:lighthouse`; confirm SC-001–SC-008 targets and manual checks at 320, 768, and 1280 px
- [X] T058 Audit `package.json` against the Complexity Tracking table in plan.md; remove any unused dependency (Principle II)
- [ ] T059 Configure Vercel deployment and Cloudflare DNS/CDN, set production environment variables, and confirm the company legally confirms the no-cookie-banner assumption before launch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup; blocks all user stories.
- **User Stories (Phases 3–9)**: all depend on Foundational only.
  - US1, US2, US3 (P1) can run in parallel after Phase 2.
  - US4 (P2) audits pages from other stories; run its implementation after US1–US3 pages exist (T038/T039 can start earlier).
  - US5, US6 (P2/P3) are independent of each other.
  - US7 (P3) depends on inquiries from US3 for end-to-end validation, but its code depends only on Phase 2.
- **Polish (Phase 10)**: after the desired stories are complete.

### Within Each Story

- Tests are written first and MUST fail before implementation.
- Components before pages; schema before Server Actions; Server Actions before forms.

### Parallel Opportunities

- Phase 1: T003, T004, T005. Phase 2: T009–T014, T016–T019.
- Phase 3–5 stories can be staffed in parallel once Phase 2 is done.
- All `[P]` tests within a story can be written in parallel.

### Parallel Example: User Story 3

```text
Task: T029 tests/unit/inquiry-schema.test.ts
Task: T030 tests/unit/submit-inquiry.test.ts
Task: T031 tests/e2e/contact.spec.ts
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 → Phase 2 → Phase 3 (Home + About).
2. Validate on phone and desktop, then deploy as a preview.

### Incremental Delivery

1. Add US2 (catalog) and US3 (contact and WhatsApp): this is the minimum launchable site.
2. Add US4 (SEO gates) before public launch.
3. Add US5, US6, then US7 (staff panel); each is independently demonstrable.
4. Finish with Phase 10 and deploy.
