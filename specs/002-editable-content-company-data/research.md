# Research: Editable Content and Company Data

All technical unknowns are resolved; no NEEDS CLARIFICATION remain.

## Decisions

### Company data ("variables")
- **Decision**: Keep the single `settings` row from feature 001 as the one source of company data
  (FR-001/FR-002). Add an editor for it. Page texts may use tokens `{companyName}`, `{tagline}`, `{phone}`,
  `{whatsapp}`, `{email}`, `{address}`, `{city}`, `{hours}`; `renderText()` replaces them at render time. Unknown
  tokens are rejected when saving a text, so a typo never reaches the public site.
- **Rationale**: Directly satisfies "variables that define my company's data"; changing the phone in one
  place updates links, texts, metadata, and structured data (SC-004).
- **Alternatives**: Environment variables (need a redeploy to change, not editable by staff); duplicating
  values per page (violates FR-002).

### Page texts
- **Decision**: New `page_texts(key, value)` table plus a code registry (`src/content/page-texts.ts`) with
  key, page, staff-facing label, default text, and max length. Public pages call `getPageTexts()`; missing
  rows fall back to the default, so the site works before anything is edited.
- **Rationale**: Editors are generated from the registry; no free-form keys.
- **Alternatives**: Rich-text/CMS (new dependency, scope creep); markdown files (developer-only).

### Editing surface (clarified)
- **Decision**: Editors live in the existing staff area under `/admin/*`, each a server-rendered page with a
  small client form. All writes are Server Actions that re-check the staff session, validate with zod, and
  go through the staff Supabase client so Row Level Security is the final guard.
- **Rationale**: Clarification A; no new auth surface; reuses `proxy.ts` and the staff session.
- **Alternatives**: Supabase dashboard only (rejected in clarification).

### Images
- **Decision**: Upload to a public Supabase Storage bucket `site-images` from a Server Action (validates
  JPEG/PNG/WebP/AVIF and ≤ 5 MB; builds an `<entity>/<uuid>.<ext>` path; requires `alt` text). Store the
  path in `image_path`. Serve through Next's built-in optimizer with `images.remotePatterns` for the
  Supabase host, which produces AVIF/WebP and resized variants. Raise the Server Action body limit to 6 MB.
- **Rationale**: No new account or dependency; removes Cloudinary and the custom loader introduced in
  feature 001 (resolves the weak justification flagged in that feature's analysis). Original files are
  size-capped at upload, and the optimizer serves the right size per device.
- **Alternatives**: Cloudinary signed uploads (extra account, secrets, and code); direct browser upload to
  Storage (needs client-side Supabase and extra policies for little gain at this size).

### Concurrency (FR-013)
- **Decision**: Optimistic locking. Every editable table has `updated_at` (set by trigger). Forms carry the
  `updated_at` they loaded; saves use `update … where id = ? and updated_at = ?`. Zero rows updated means a
  conflict: nothing is overwritten and the staff member sees a warning with a "reload" action, and their
  typed text is kept.
- **Rationale**: Simple and reliable for a handful of users.
- **Alternatives**: Row locks or live collaboration (overkill).

### Change log and restore (FR-012)
- **Decision**: A generic trigger on the editable tables writes `content_changes(table_name, row_id, op,
  previous jsonb, new jsonb, changed_by, changed_at)` for insert, update, and delete. "Restore" applies the
  `previous` snapshot of the latest change of an item (re-inserting if it was deleted) through a Server
  Action, which itself creates a new change record. Only the latest change per item is restorable (matches
  the spec assumption).
- **Rationale**: Captures dashboard edits too; no per-entity code.
- **Alternatives**: Per-entity history tables (repetition); full versioning (out of scope).

### Preview (FR-011, P2)
- **Decision**: Each editor has a "Vista previa" panel that renders the real public components
  (`ProductCard`, `CategoryCard`, FAQ item, text block) with the unsaved form values, before saving.
- **Rationale**: Shows what visitors will see for that item at very low cost. It is not a full-page draft
  preview; this limitation is accepted for the P2 priority and fewer than 10 users.
- **Alternatives**: Draft/publish pipeline with preview routes (large); preview via a staging deploy (slow).

### Publishing
- **Decision**: After a successful save, restore, delete, or reorder, call `revalidatePath("/", "layout")`.
  The existing `revalidate = 3600` remains as a safety net for edits made directly in the database dashboard.
- **Rationale**: Changes are public within seconds (well inside SC-003's 5 minutes) while pages stay static.

### Initial DHS data and unverified claims
- **Decision**: Migration `0006` sets name `DHS`, phone and WhatsApp `+59157734924` (8 digits after +591,
  valid per clarification), email `distribuidoradhs2026@gmail.com`. Content that the owner did not provide
  (story, mission, certifications, client types, address, hours, service areas, delivery terms) becomes clearly
  marked placeholders ("[Pendiente] …"). The invented testimonials from feature 001's seed are set to
  `published = false`, and invented certifications are replaced by a placeholder, so no fabricated claim
  about DHS goes live. The admin dashboard lists fields that still contain a placeholder.
- **Rationale**: FR-003 and honesty toward visitors; avoids publishing fake endorsements.
- **Alternatives**: Keep demo content (misleading for a real company).

### Validation
- **Decision**: One zod schema per entity in `content-schemas.ts`, reusing `normalizeBoPhone` (any 8 digits
  after +591, including numbers starting with 5). Rules: required name, WhatsApp, and email; valid email;
  price > 0 and a unit whenever a price is set; slugs lowercase with hyphens and unique; text lengths from
  the registry; image alt required.
- **Rationale**: FR-009; identical rules in forms (messages) and Server Actions (enforcement).

### Testing
- **Decision**: Pure modules (`tokens`, `content-schemas`, `content-admin`, `images`) are unit tested with
  fakes. Editor e2e tests run only when Supabase and `E2E_STAFF_*` are configured, like the staff test in
  feature 001; the signed-out guard tests always run.
- **Rationale**: Keeps tests runnable without external services while covering the rules that matter.
