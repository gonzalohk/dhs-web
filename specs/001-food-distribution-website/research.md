# Research: Food Distribution Company Website

All technical unknowns are resolved; no NEEDS CLARIFICATION remain.

## Decisions

### Rendering strategy
- **Decision**: Static generation with on-demand/timed revalidation (1 h) for all public pages; Server
  Components by default.
- **Rationale**: Crawlers get full HTML (Principle III), fastest possible load, catalog edits in
  Supabase appear without redeploy.
- **Alternatives**: Full SSR per request (slower, costlier); client-side fetching (bad for SEO).

### SEO tooling
- **Decision**: Use Next.js built-in Metadata API, `sitemap.ts`, `robots.ts`, and hand-written JSON-LD
  component. Do **not** add `next-seo`.
- **Rationale**: `next-seo` targets the Pages Router; the App Router has native support. Fewer dependencies
  (Principle II).
- **Alternatives**: `next-seo` (redundant).

### Data in Supabase
- **Decision**: Tables for categories, products, faqs, testimonials, settings (company profile), and
  inquiries. Public read via Row Level Security for published content; inquiries are insert-only from the
  server using the service role key. Catalog reads happen on the server only.
- **Rationale**: Non-expert editing via Supabase table editor (FR-018); private inquiries.
- **Alternatives**: Markdown/JSON files (developer-only edits); headless CMS (extra dependency).

### Contact form
- **Decision**: Server Action with zod validation, honeypot field plus time-to-submit check and per-IP
  rate limit (counted in `inquiries`), then insert in Supabase and send email with Resend. If email
  fails the inquiry is still stored and the visitor sees success with a fallback phone/WhatsApp note only
  when storage fails as well.
- **Rationale**: Spam protection without puzzles (FR-009); no lost leads.
- **Alternatives**: CAPTCHA (hurts conversion); third-party form service (another dependency).

### WhatsApp
- **Decision**: Click-to-chat `https://wa.me/591<number>?text=...` as the primary contact action: a sticky
  button on mobile, a header button on desktop, with a pre-filled Spanish message that includes page context.
  No WhatsApp Business API integration in this version.
- **Rationale**: Delivers the contact benefit with zero dependency or cost; the Business API needs approval,
  hosting of webhooks, and is unnecessary for a brochure site.
- **Alternatives**: WhatsApp Cloud API (deferred; revisit if automated replies are required).

### Staff area (inquiry management)
- **Decision**: Supabase Auth (email + password); accounts are created by the company in the Supabase
  dashboard and public sign-up is disabled. `proxy.ts` protects `/admin/*`; pages are server-rendered
  with the staff session; status changes go through Server Actions. Pages are `noindex`, left out of the
  sitemap, disallowed in `robots.txt`, and never linked publicly.
- **Rationale**: Meets FR-017a/b with the smallest surface: no custom auth, no admin framework. Row Level
  Security lets `authenticated` users read inquiries and update their status only.
- **Alternatives**: Supabase dashboard only (rejected by user); third-party admin tool (new dependency);
  magic links (extra email flow).

### Prices and catalog size
- **Decision**: `products.price_bob` and `unit` are optional; a null price renders "Request a quote" (WhatsApp
  first). With fewer than 30 products, each category page lists all its products: no search, filters,
  pagination, or product pages.
- **Rationale**: Matches FR-005a and FR-006a; fewest routes and simplest UI.
- **Alternatives**: Product detail pages and search (deferred until the catalog grows).

### Bolivia localization
- **Decision**: `lang="es-BO"`, `og:locale` `es_BO`, phones stored in E.164 (+591), prices formatted as Bs
  with `Intl`, LocalBusiness JSON-LD with `addressCountry: BO` and `areaServed` per city/department. No
  i18n library. No cookie banner by default; the company confirms this legally.
- **Rationale**: FR-007, FR-019, FR-020.

### Images
- **Decision**: Cloudinary delivery URLs with `f_auto,q_auto` (AVIF/WebP) through a small URL helper and
  Next `Image` custom loader; explicit width/height, lazy loading below the fold, priority for LCP image.
- **Rationale**: Modern formats, no layout shift (SC-004).
- **Alternatives**: Next default optimizer (simpler, kept as fallback).

### Analytics and privacy
- **Decision**: GA4 through Google Tag Manager, loaded with `afterInteractive`/lazy strategy; consent
  banner kept minimal and only if required by the target market's law; privacy notice on the form (FR-019).
- **Rationale**: Protects Core Web Vitals.
- **Alternatives**: Privacy-friendly analytics (possible swap later).

### Hosting
- **Decision**: Vercel for the app, Cloudflare for DNS and CDN caching in front if desired.
- **Rationale**: First-class Next.js support, edge caching, preview deploys.

### Testing
- **Decision**: Vitest for units, Playwright for e2e and responsive checks, Lighthouse CI as a gate.
- **Rationale**: Covers Principles III, IV, and V with few tools.

### Design reference
- **Decision**: The reference site (cruzimex.com) was not reviewed in this session; layout follows common
  B2B distributor patterns (hero, categories, benefits, trust, CTA). It can be reviewed later to adjust style.
- **Rationale**: Access was not confirmed by the user.
