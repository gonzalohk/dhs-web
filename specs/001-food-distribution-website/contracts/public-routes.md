# Contract: Public Routes

| Route | Purpose | Notes |
|-------|---------|-------|
| `/` | Home | Organization/LocalBusiness JSON-LD |
| `/about` | About | |
| `/products` | Category overview | ItemList JSON-LD |
| `/products/[category]` | Category with all its products on one page; price in Bs or "Request a quote" | BreadcrumbList + ItemList JSON-LD; unknown slug → 404 |
| `/delivery` | Delivery & Ordering | |
| `/faq` | FAQ | FAQPage JSON-LD |
| `/contact` | Contact form, details, map | WhatsApp primary, form and phone secondary |
| `/admin/login`, `/admin/inquiries` | Staff area | `noindex`, not in sitemap, disallowed in robots, see [staff-area.md](staff-area.md) |
| `/sitemap.xml` | All public routes | generated |
| `/robots.txt` | Crawl rules, sitemap link | generated |
| any other | Friendly not-found page | HTTP 404 |

Every page: unique `title` and `description`, one `h1`, canonical URL, Open Graph/Twitter tags, `lang="es-BO"`, and a sticky WhatsApp button (mobile) / header button (desktop).
