# Implementation Plan: Food Distribution Company Website

**Branch**: `001-food-distribution-website` | **Date**: 2026-09-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-food-distribution-website/spec.md`

## Summary

A fast, SEO-first, mobile-first marketing site for a Bolivian food distributor: Home, About, Products
(categories, each listing all its products on one page), Delivery & Ordering, FAQ, Contact, plus a
protected staff area for managing inquiries. Spanish (`es-BO`), +591 phones, prices in Bs. WhatsApp is
the primary contact action (sticky button with a pre-filled message). Public pages are statically
generated (with periodic revalidation) so crawlers get full HTML. Catalog (with optional prices), FAQ, and
testimonials live in Supabase, editable by a non-expert in its table editor. The contact form is a Next.js
Server Action that validates input, stores the inquiry in Supabase, and emails the company through Resend.
Staff sign in with Supabase Auth to view inquiries and mark them handled. The stack was chosen by the user;
its cost against the constitution is tracked in Complexity Tracking.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS, Next.js 14+ (App Router)

**Primary Dependencies**: `next`, `react`, `tailwindcss`, `@supabase/supabase-js` and `@supabase/ssr`
(staff sessions), `resend`, `zod` (form validation). Images via Cloudinary delivery URLs (no SDK). GA4 via
Google Tag Manager script.

**Storage**: Supabase PostgreSQL (categories, products with optional price, FAQ, testimonials, inquiries
with status, company settings); Supabase Auth for staff

**Testing**: Vitest (unit: validation, metadata, JSON-LD builders, phone/price formatting), Playwright (e2e:
responsive at 320/768/1280 px, form flow, WhatsApp button, staff sign-in and status change, SEO
assertions), Lighthouse CI (SEO = 100, others ≥ 90)

**Target Platform**: Modern browsers on mobile and desktop; hosted on Vercel, Cloudflare as DNS/CDN

**Project Type**: web-application (single Next.js project; no separate backend)

**Performance Goals**: LCP ≤ 2.5 s on mid-range phone over 4G, CLS ≤ 0.1, INP ≤ 200 ms

**Constraints**: Zero client JS where not needed (Server Components by default); no login for public
visitors (staff area only); Spanish only; all docs/code in English; analytics loaded after the page is
interactive; staff area `noindex` and never linked publicly

**Scale/Scope**: ~9 page types, ~6-10 categories, fewer than 30 products at launch, fewer than 10 staff
users, low-volume contact traffic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simple, Readable Code | PASS | Server Components, one folder per route, no custom state library, no abstraction layers over Supabase |
| II. Minimal Dependencies | **JUSTIFIED VIOLATION** | Stack is user-mandated; see Complexity Tracking. Reduced: `next-seo` dropped (Metadata API covers it), no Cloudinary SDK, no UI component library, no form library, no admin framework (staff area is two plain pages) |
| III. SEO (NON-NEGOTIABLE) | PASS | Metadata API, JSON-LD (LocalBusiness, BreadcrumbList, FAQPage, ItemList/Product), `sitemap.ts`, `robots.ts`, static HTML, `es-BO` locale, Lighthouse CI gate; `/admin` excluded from index |
| IV. Tested Code | PASS | Vitest + Playwright + Lighthouse CI; SEO output and staff access control covered by tests |
| V. Responsive, Mobile-First | PASS | Tailwind mobile-first; Playwright at 320/768/1280; 44 px touch targets; sticky WhatsApp button |

**Post-design re-check**: PASS with the tracked violation. Pages stay static; client JS is limited to the
contact form, mobile menu, and staff sign-in form; all Supabase access is in server code.

## Project Structure

### Documentation (this feature)

```text
specs/001-food-distribution-website/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── contact-form.md
│   ├── public-routes.md
│   └── staff-area.md
└── tasks.md             # created later by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                 # header, footer, sticky WhatsApp button, GTM, base metadata
│   ├── page.tsx                   # Home
│   ├── about/page.tsx
│   ├── products/page.tsx          # category overview
│   ├── products/[category]/page.tsx   # category with all its products
│   ├── delivery/page.tsx
│   ├── faq/page.tsx
│   ├── contact/page.tsx
│   ├── contact/actions.ts         # Server Action: validate, store, email
│   ├── admin/login/page.tsx       # staff sign-in (noindex)
│   ├── admin/inquiries/page.tsx   # list, filter by status, mark handled (noindex)
│   ├── admin/actions.ts           # Server Actions: sign in/out, set inquiry status
│   ├── not-found.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── proxy.ts                  # protects /admin/*, refreshes the Supabase session
├── components/                    # Header, Footer, CategoryCard, ProductCard, ContactForm, WhatsAppButton, JsonLd
├── lib/
│   ├── supabase.ts                # server-only clients (public read, service role, staff session)
│   ├── content.ts                 # typed queries for catalog, FAQ, testimonials, settings
│   ├── schema.ts                  # zod schemas
│   ├── seo.ts                     # metadata + JSON-LD builders
│   ├── format.ts                  # Bs price and +591 phone formatting, wa.me link builder
│   └── cloudinary.ts              # URL helper (AVIF/WebP, sizes)
supabase/
└── migrations/                    # tables, RLS policies, seed data
tests/
├── unit/
├── e2e/
└── lighthouse/
```

**Structure Decision**: One Next.js App Router project. No separate backend: Server Actions and Supabase
cover the contact form and the staff area. No per-product pages (fewer than 30 products).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Supabase (DB + client) | Lets a non-expert edit catalog, prices, FAQ, testimonials (FR-018) and stores inquiries so none are lost if email fails (FR-008) | Content in repo files needs a developer for every change; email-only loses leads on failure |
| Supabase Auth + protected `/admin` | Staff must view inquiries and mark them handled (FR-017a/b); accounts created by the company, no public sign-up | Reading inquiries only in the Supabase dashboard was rejected by the user during clarification |
| Cloudinary | Central image library with automatic AVIF/WebP and resizing (SC-004) | Next's built-in image optimizer is enough for a small catalog; kept as fallback if Cloudinary is dropped |
| Resend | Reliable transactional email to the company inbox (FR-008) | Self-hosted SMTP is harder to maintain and deliver |
| GA4 via Tag Manager | Business needs visit and lead analytics | Loaded deferred with no extra package; can be dropped if analytics is not required |
| Next.js + React (vs plain HTML) | Server rendering, revalidation, Metadata API, routing, middleware for staff area | Plain static HTML cannot serve an editable catalog or protected area; user-selected |
| `zod` | Shared client/server form validation with clear messages | Hand-written validation is longer and error-prone |
