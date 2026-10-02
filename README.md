# DHS food distribution website


Website for DHS, a food distributor in Bolivia: company information, product catalog by category (with
optional prices in Bs), WhatsApp-first contact, a contact form, and a protected staff area where the
company edits its own data and content without a developer.

- **Public site** (Spanish, `es-BO`): Home, About, Products, Delivery & Ordering, FAQ, Contact.
- **Staff area** (`/admin`): company data, page texts, categories, products, images, FAQs, testimonials,
  change history with restore, and the inquiries received through the contact form.
- **Stack**: Next.js 16 (App Router, React 19, TypeScript), Tailwind CSS 4, Supabase (PostgreSQL, Auth,
  Storage), Resend (email), Google Tag Manager (optional).
- **Quality gates**: Lighthouse SEO 100 and ≥ 90 for the other categories, tested at 320, 768 and 1280 px.

> **Next.js 16 note**: this version has breaking changes (for example `middleware` is now `proxy`, and
> `params`/`searchParams` are async). Read the guides in `node_modules/next/dist/docs/` before changing
> framework-level code (see [AGENTS.md](AGENTS.md)).

## Contents

1. [Quick start](#1-quick-start)
2. [Environment variables](#2-environment-variables)
3. [Database and Supabase setup](#3-database-and-supabase-setup)
4. [Email (Resend)](#4-email-resend)
5. [Run locally](#5-run-locally)
6. [Debug](#6-debug)
7. [Test](#7-test)
8. [Build](#8-build)
9. [Deploy](#9-deploy)
10. [Editing content (staff)](#10-editing-content-staff)
11. [Project structure](#11-project-structure)
12. [Development workflow (Spec Kit)](#12-development-workflow-spec-kit)
13. [Troubleshooting](#13-troubleshooting)

## 1. Quick start

Requirements: **Node.js 20.9 or newer** (tested with Node 24) and npm.

```bash
npm install
cp .env.example .env.local      # optional for a first look: the site runs without any variables
npm run dev                     # http://localhost:3000
```

Without Supabase the site runs with placeholder content from `src/content/placeholder.ts`: DHS contact
data, categories and products without prices, and no FAQs or testimonials. Values still marked
`[Pendiente]` are hidden from visitors. In this mode the contact form only logs the inquiry to the
terminal, and `/admin` shows "not configured". To get the full app (staff area, stored inquiries, email),
complete sections 2 to 4.

## 2. Environment variables

Copy [.env.example](.env.example) to `.env.local` (never commit it; it is git-ignored).

| Variable                                | Required             | Purpose                                                                                                                               |
| --------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                  | Production           | Public URL, used for canonical links, Open Graph, and the sitemap. Example: `https://www.example.com`                                 |
| `SUPABASE_URL`                          | For the full app     | Project URL, for example `https://abcdefgh.supabase.co`. Also read **at build time** to allow uploaded images (see [Build](#8-build)) |
| `SUPABASE_ANON_KEY`                     | For the full app     | Public (anon) key. Used for reading published content and for staff sign-in                                                           |
| `SUPABASE_SERVICE_ROLE_KEY`             | For the contact form | Secret key that bypasses Row Level Security. Used only on the server to store inquiries. **Never expose it**                          |
| `RESEND_API_KEY`                        | For email            | Resend API key                                                                                                                        |
| `CONTACT_TO_EMAIL`                      | For email            | Inbox that receives new inquiries                                                                                                     |
| `CONTACT_FROM_EMAIL`                    | For email            | Sender address. Defaults to `onboarding@resend.dev` (testing only, see [Email](#4-email-resend))                                      |
| `IP_HASH_SALT`                          | Recommended          | Random secret used to hash visitor IPs for the rate limit (5 inquiries per hour per IP). Generate one with `openssl rand -hex 32`     |
| `NEXT_PUBLIC_GTM_ID`                    | Optional             | Google Tag Manager container ID (for GA4). Loaded after the page is interactive                                                       |
| `E2E_STAFF_EMAIL`, `E2E_STAFF_PASSWORD` | Tests only           | Staff account used by the signed-in editor e2e tests                                                                                  |

Where to find the Supabase values: **Project Settings → API** (URL, `anon` key, `service_role` key).

Variables set automatically by the test tooling (do not set them yourself): `E2E=1` (the contact form
accepts inquiries without a database) and `E2E_DEMO=1` (demo prices, FAQs and testimonials over the
placeholders).

## 3. Database and Supabase setup

Do this once per environment (a separate Supabase project for production is recommended).

### 3.1 Create the project

1. Create a project at [supabase.com](https://supabase.com) (choose the region closest to your users).
2. Copy the API values into `.env.local` (section 2).

### 3.2 Apply the migrations, in order

Open **SQL Editor** and run each file from [supabase/migrations/](supabase/migrations/) **in this
order**. Each one runs once.

| File                        | What it does                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `0001_schema.sql`           | Tables: `settings` (one company record), `categories`, `products`, `faqs`, `testimonials`, `inquiries`                                           |
| `0002_rls.sql`              | Row Level Security: visitors read published content only; inquiries are private                                                                  |
| `0003_seed.sql`             | Demo categories and products (replaced by your content later)                                                                                    |
| `0004_editable_content.sql` | `updated_at` versioning, `page_texts`, change log (`content_changes`) with triggers, renames `image_public_id` to `image_path`                   |
| `0005_editor_policies.sql`  | Staff permissions to edit content, public image bucket `site-images`                                                                             |
| `0006_company_data_dhs.sql` | Loads DHS data (name, phone and WhatsApp +591 57734924, email), marks missing data `[Pendiente]`, unpublishes demo testimonials, FAQs and prices |

Important:

- Apply `0004`–`0006` **before** deploying a version of the code that reads `image_path`; otherwise the
  public site fails to load the catalog.
- Migrations are not idempotent. To start over on a throwaway project, reset the database from the
  Supabase dashboard and run them again.
- When you add a migration, name it `000N_description.sql` and keep it small. `tests/db/migrations.test.ts`
  applies all migrations in memory, so run `npm test` to catch mistakes before touching Supabase.

### 3.3 Authentication (staff accounts)

1. **Authentication → Sign In / Providers → Email**: keep email + password enabled and **turn off
   "Allow new users to sign up"**. Staff accounts are created only by the company.
2. **Authentication → Users → Add user**: create one user (email + password, mark as confirmed) for each
   staff member (fewer than 10). All staff have the same permissions.
3. Staff sign in at `/admin/login`.

### 3.4 Storage

Migration `0005` creates the public bucket `site-images`. Staff upload category and product images from
the editors (JPG, PNG, WebP or AVIF, up to 5 MB, with alt text). Check **Storage** in the dashboard if
uploads fail.

### 3.5 Check the setup

- `settings` has one row with `company_name = DHS`.
- Open the site: Home shows DHS data; sections that depend on `[Pendiente]` fields are hidden.
- Sign in at `/admin/login`, open `/admin/company`, and complete the pending fields.

## 4. Email (Resend)

1. Create an account at [resend.com](https://resend.com) and an API key (`RESEND_API_KEY`).
2. Set `CONTACT_TO_EMAIL` to the inbox that should receive inquiries.
3. For production, **verify the sending domain** in Resend and set `CONTACT_FROM_EMAIL`, for example
   `DHS <no-reply@yourdomain.com>`. The default `onboarding@resend.dev` can only deliver to the email
   address of your own Resend account.

If the email fails, the inquiry is still stored and visible in `/admin/inquiries`, and the visitor sees a
success message.

## 5. Run locally

```bash
npm run dev          # development server with hot reload on http://localhost:3000
npm run lint         # ESLint
npx tsc --noEmit     # type check
npm run format       # Prettier
```

Useful local checks:

- Home, About, Products, Delivery, FAQ, Contact, and an unknown URL (404 page).
- Resize to 320, 768 and 1280 px: no horizontal scrolling and tap targets of at least 44 px.
- Contact form: valid data shows a confirmation; invalid data shows messages naming each field.
- `/admin` redirects to `/admin/login` when signed out.

## 6. Debug

**Server code** (Server Components, Server Actions, `proxy.ts`): output appears in the terminal that runs
`npm run dev`. Inquiries received without Supabase are logged there as
`Inquiry received (not stored, Supabase not configured)`.

**Step debugging**:

```bash
NODE_OPTIONS='--inspect' npm run dev      # then attach: Chrome chrome://inspect, or VS Code "Attach"
```

In VS Code, add a launch configuration of type `node` with `request: "attach"` and port `9229`, or use
the built-in **JavaScript Debug Terminal** and run `npm run dev` from it.

**Browser code** (forms, editors, preview): use the browser dev tools. React errors from Server Actions
show in both the terminal and the browser.

**Tests**:

```bash
npx vitest                                   # unit tests in watch mode
npx vitest run tests/unit/tokens.test.ts     # one file
npx playwright test --ui                     # Playwright UI mode (time travel, locators)
npx playwright test --headed --project=mobile-320 tests/e2e/contact.spec.ts
npx playwright test --debug                  # step through with the inspector
npx playwright show-report                   # HTML report of the last run
```

**Lighthouse**: after `npm run test:lighthouse`, reports are in `.lighthouseci/` (open the `.html`
files). `node tests/lighthouse/summary.mjs` prints the scores.

**Database**: in the Supabase dashboard use **Logs** (API, Postgres, Auth) and the **Table Editor**. The
`content_changes` table shows every edit with the previous and new values.

**Reset local build state** when behavior looks stale: stop the server and run `rm -rf .next`.

## 7. Test

| Command                                    | What it runs                                                                                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                 | Vitest: unit tests and **database tests** (`tests/db`) that apply the real migrations in memory (PGlite) and check permissions, triggers, the change log, and locking |
| `npm run test:e2e`                         | Playwright at 320, 768 and 1280 px. It builds the site and starts it on port 3100 by itself                                                                           |
| `npm run build && npm run test:lighthouse` | Lighthouse CI on mobile and desktop for every public page. Fails below SEO 100 or below 90 in the other categories, LCP over 2.5 s, or CLS over 0.1                   |

First time with Playwright: `npx playwright install chromium`. Lighthouse needs a Chrome or Chromium
(set `CHROME_PATH` if it is not found).

The editor e2e tests (`tests/e2e/editor.spec.ts`, and the signed-in part of `admin.spec.ts`) are skipped
unless Supabase and a staff account are configured (`SUPABASE_*`, `E2E_STAFF_EMAIL`,
`E2E_STAFF_PASSWORD`). Run them against a **test** Supabase project, because they create and change data.

Before opening a pull request or deploying, run:

```bash
npm run lint && npx tsc --noEmit && npm test && npm run test:e2e && npm run build && npm run test:lighthouse
```

## 8. Build

```bash
npm run build      # production build; public pages are prerendered and revalidate every hour
npm start          # serves the production build on http://localhost:3000
```

Notes:

- `SUPABASE_URL` and the `NEXT_PUBLIC_*` variables are read **at build time** (the allowed image host and
  the site URL are baked into the build). If you change them, **rebuild/redeploy**.
- Public pages are static with `revalidate = 3600`. Saving in the staff area revalidates the whole site
  immediately; edits made directly in the Supabase dashboard appear within one hour.
- `/admin` pages are always dynamic (they depend on the signed-in session).

## 9. Deploy

The recommended setup is **Vercel** (hosting) with **Cloudflare** (DNS and CDN, optional) and
**Supabase** (data). Any host that runs Next.js 16 on Node 20.9+ also works.

### 9.1 Before the first deploy

1. Supabase production project created, migrations `0001`–`0006` applied, sign-up disabled, staff users
   created (section 3).
2. Resend account with a verified domain (section 4).
3. The code is pushed to GitHub (`main` branch).

### 9.2 Vercel

1. **Add New → Project**, import the repository. Framework preset: Next.js (default build command
   `next build`, no output directory changes).
2. Add the environment variables from section 2 for **Production** (and Preview if you want previews to
   use a test Supabase project). Set `NEXT_PUBLIC_SITE_URL` to the final public URL.
3. Deploy. Every push to `main` deploys to production; other branches get preview URLs.
4. **Settings → Domains**: add your domain and follow the DNS instructions.

### 9.3 Cloudflare (optional)

Point the domain's nameservers to Cloudflare, add the records Vercel asks for (set them to **DNS only**
unless you know you need the proxy), and enable HTTPS (Full strict). If you enable the proxy, keep
Vercel as the origin and do not cache `/admin/*`.

### 9.4 Analytics (optional)

Set `NEXT_PUBLIC_GTM_ID` (for example `GTM-XXXXXXX`) and redeploy. Configure GA4 inside Tag Manager. The
script loads after the page is interactive to protect performance. Before launch, confirm with your legal
advisor whether a cookie notice is needed.

### 9.5 After every deploy

- `https://your-domain/` loads with the DHS name, phone, and WhatsApp link.
- `/sitemap.xml` and `/robots.txt` respond, and `/admin` is disallowed.
- Send a test message through the contact form: it appears in `/admin/inquiries` and in the inbox.
- Sign in at `/admin/login`, edit a text, and see it on the public page.
- Run Lighthouse against production (SEO must be 100).
- Submit the sitemap in Google Search Console.

### 9.6 Releasing changes

1. Develop on a branch, run the full check from section 7, open a pull request.
2. If the change includes a **migration**, apply it to production Supabase **before** merging when the
   code depends on it (new columns, renames), and after merging when the migration only removes things the
   code no longer uses.
3. Merge to `main`; Vercel deploys. To roll back, use **Deployments → Promote** on a previous deployment
   (database changes are not rolled back automatically).

## 10. Editing content (staff)

Sign in at `/admin/login`. No developer is needed for day-to-day changes:

| Section              | What you can do                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Company data         | Name, tagline, phone, WhatsApp, email, address, hours, service areas, delivery terms. Written once and used everywhere                           |
| Page texts           | Headlines and introductions. Variables: `{companyName}` `{tagline}` `{phone}` `{whatsapp}` `{email}` `{address}` `{city}` `{hours}`              |
| Categories, Products | Add, edit, show/hide, reorder, delete, upload images. A product shows its price when it has a price and a unit; otherwise "Solicitar cotización" |
| FAQs, Testimonials   | Add, edit, show/hide, reorder, delete. Publish only real testimonials                                                                            |
| History              | Restore the previous value of the latest change of any item                                                                                      |
| Inquiries            | Messages from the contact form; mark them as handled                                                                                             |

Fields that still say `[Pendiente]` are hidden from the public site and listed on the dashboard
(`/admin`). Changes appear on the public site within seconds.

## 11. Project structure

```text
src/
├── app/                    # routes (public pages, /admin, sitemap, robots, 404)
│   └── admin/              # staff area: editors, history, inquiries, Server Actions
├── components/             # public components; components/admin = editor building blocks
├── content/                # placeholder content, demo content (tests only), page text registry
├── lib/                    # content queries, validation schemas, editing rules, SEO, formatting
└── proxy.ts                # protects /admin/* and refreshes the staff session
supabase/migrations/        # SQL migrations (apply in order)
tests/                      # unit/, db/ (migrations in memory), e2e/, lighthouse/
specs/                      # Spec Kit: specification, plan, tasks per feature
.specify/, .claude/         # Spec Kit templates, scripts, and slash commands
```

Where to change things:

- A page's text → the page text registry [src/content/page-texts.ts](src/content/page-texts.ts), or edit it in `/admin/texts`.
- Business rules for editing (validation, conflicts, restore) → [src/lib/content-service.ts](src/lib/content-service.ts).
- Contact form rules → [src/lib/inquiry.ts](src/lib/inquiry.ts) and [src/lib/schema.ts](src/lib/schema.ts).
- Database → a new file in `supabase/migrations/`.

## 12. Development workflow (Spec Kit)

Features are specified and planned with [Spec Kit](https://github.com/github/spec-kit) using the slash
commands in Claude Code: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` →
`/speckit-analyze` → `/speckit-implement`. The project rules live in
[.specify/memory/constitution.md](.specify/memory/constitution.md): simple code, minimal dependencies,
SEO (non-negotiable), tests, responsive mobile-first, and English documentation.

| Feature                               | Folder                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| 001 Food distribution website         | [specs/001-food-distribution-website/](specs/001-food-distribution-website/)         |
| 002 Editable content and company data | [specs/002-editable-content-company-data/](specs/002-editable-content-company-data/) |

Documents, code comments, and commit messages are written in English; text shown on the website and in
the staff area is Spanish.

## 13. Troubleshooting

| Symptom                                                                  | Likely cause and fix                                                                                               |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `/admin` shows "not configured"                                          | `SUPABASE_URL` and `SUPABASE_ANON_KEY` are missing. Set them and restart `npm run dev`                             |
| Sign-in says wrong email or password                                     | The staff user does not exist or is unconfirmed. Create it in Supabase **Authentication → Users**                  |
| Catalog fails to load after a deploy: column `image_path` does not exist | Migration `0004` was not applied before deploying. Apply `0004`–`0006`                                             |
| `permission denied for table …`                                          | Migrations `0002` or `0005` were not applied, or the staff user is not signed in                                   |
| Uploaded images do not show, or Next.js says the host is not configured  | `SUPABASE_URL` was not set at build time. Set it and redeploy                                                      |
| Image upload fails                                                       | File over 5 MB or not JPG/PNG/WebP/AVIF; or the `site-images` bucket is missing (re-run `0005`)                    |
| Contact form says it could not send                                      | `SUPABASE_SERVICE_ROLE_KEY` is missing or wrong (inquiries are stored through it)                                  |
| Inquiries are stored but no email arrives                                | Check `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and that `CONTACT_FROM_EMAIL` uses a domain verified in Resend         |
| "Too many messages" in the contact form                                  | The IP reached 5 inquiries in one hour (rate limit)                                                                |
| A section is missing on the public site                                  | Its data still says `[Pendiente]` or is empty. Complete it in `/admin/company`                                     |
| A dashboard edit does not appear on the site                             | Wait up to one hour (revalidation), or save it from the staff area, which updates immediately                      |
| "Someone else saved changes" in an editor                                | Another person edited the same item. Reload the page and apply your change again; what you typed stays in the form |
| Playwright cannot start the browser                                      | Run `npx playwright install chromium`                                                                              |
| Lighthouse cannot find Chrome                                            | Install Chrome or Chromium, or set `CHROME_PATH`                                                                   |
| Weird behavior after switching branches                                  | Stop the server, `rm -rf .next`, run again                                                                         |
