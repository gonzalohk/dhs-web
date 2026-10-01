# Quickstart: Validation Guide

## Prerequisites
- Node.js 20+ (tested with Node 24).
- For production: a Supabase project, a Resend API key, and optionally a Cloudinary cloud name and a
  Google Tag Manager container ID.
- Copy `.env.example` to `.env.local` and fill it in. Never commit `.env.local`.

Without Supabase the site still runs with placeholder content from `src/content/placeholder.ts`; in
development (and in e2e tests with `E2E=1`) contact inquiries are logged to the server console instead
of being stored. In production without Supabase the contact form reports an error.

## Supabase setup
1. Run the SQL files in `supabase/migrations/` in order (`0001_schema.sql`, `0002_rls.sql`,
   `0003_seed.sql`) in the Supabase SQL editor.
2. Authentication > Sign In / Providers: disable "Allow new users to sign up".
3. Authentication > Users > Add user: create one account (email + password) per staff member.
4. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

## Editing content (non-technical staff)
All public content is edited in the Supabase dashboard, Table Editor:
- `settings`: company name, texts, phone, WhatsApp (+591…), address, hours, service areas, delivery info.
- `categories` and `products`: name, description, order (`sort_order`), visibility (`published`).
  A product shows its price when `price_bob` and `unit` are filled; leave `price_bob` empty to show
  "Solicitar cotización". Categories without published products are hidden.
- `faqs` (topic: ordering, payment, delivery, returns, other) and `testimonials`.
- Images: upload to Cloudinary and put the image's public id in `image_public_id`.
Changes appear on the site within one hour (pages revalidate every 3600 seconds).

## Run
```bash
npm install
npm run dev                 # http://localhost:3000
npm run build && npm start  # production build
```

## Validate
1. **Pages**: every route in [contracts/public-routes.md](contracts/public-routes.md) loads; an unknown URL shows the 404 page.
2. **Catalog**: edit a product in Supabase; after revalidation it appears on its category page.
3. **Contact form**: submit valid data → confirmation, row in `inquiries`, email received. Submit invalid
   data → per-field errors with input kept. See [contracts/contact-form.md](contracts/contact-form.md).
4. **WhatsApp**: on mobile, every page shows a sticky WhatsApp button opening `wa.me/591…` with a pre-filled message.
5. **Staff area**: `/admin/inquiries` redirects to sign-in when signed out; after sign-in the submitted
   inquiry is listed and can be marked handled. See [contracts/staff-area.md](contracts/staff-area.md).
6. **Responsive**: check 320, 768, 1280 px — no horizontal scroll, tap targets ≥ 44 px.
7. **SEO**: view-source shows full content; `/sitemap.xml` and `/robots.txt` exist; JSON-LD validates.
8. **Automated**:
   - `npm test` — unit tests (Vitest).
   - `npm run test:e2e` — Playwright at 320/768/1280 px (first run: `npx playwright install chromium`).
     The signed-in staff test runs only with Supabase configured and `E2E_STAFF_EMAIL` /
     `E2E_STAFF_PASSWORD` set.
   - `npm run test:lighthouse` — run after `npm run build`; asserts SEO = 100 and performance,
     accessibility, best practices ≥ 90 on mobile and desktop, LCP ≤ 2.5 s, CLS ≤ 0.1.
