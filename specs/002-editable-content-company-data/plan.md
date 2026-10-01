# Implementation Plan: Editable Content and Company Data

**Branch**: `002-editable-content-company-data` | **Date**: 2026-09-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-editable-content-company-data/spec.md`

## Summary

Extend the existing staff area so authorized staff can manage everything on the public site without a
developer: company data (a single `settings` record that every page reads), editable page texts with
company-data variables (`{companyName}`, `{phone}`, …), categories, products, images, FAQs, and
testimonials. Edits are validated server-side, saved with optimistic concurrency, published immediately
through on-demand revalidation, recorded in a change log that powers "restore previous value", and can be
previewed inside the editor with the same components visitors see. Images are uploaded to Supabase Storage
and served by Next's built-in optimizer, which lets this feature **remove** the Cloudinary dependency and
custom image loader. DHS's real data (name, phone/WhatsApp +591 57734924, email) is loaded as the initial
company data. No new npm dependencies.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+, Next.js 16 (App Router), React 19 (as in feature 001)

**Primary Dependencies**: existing only: `next`, `react`, `tailwindcss`, `@supabase/supabase-js`,
`@supabase/ssr`, `resend`, `zod`. **Removed**: Cloudinary usage (custom loader, env var, docs).

**Storage**: Supabase PostgreSQL (existing tables + `page_texts`, `content_changes`, `updated_at` columns,
audit triggers) and Supabase Storage (public bucket `site-images`)

**Testing**: Vitest (tokens, validation schemas, conflict detection, restore logic, image rules),
Playwright (editor flows; the signed-in flows run only with Supabase and `E2E_STAFF_*` set, as in 001),
Lighthouse CI (unchanged gates)

**Target Platform**: Modern browsers on phones and desktops (editors are responsive too); Vercel hosting

**Project Type**: web-application (single Next.js project, extends feature 001)

**Performance Goals**: public pages unchanged (LCP ≤ 2.5 s, CLS ≤ 0.1, Lighthouse gates); saved changes
visible on public pages in seconds (on-demand revalidation), always within 5 minutes (SC-003)

**Constraints**: only signed-in staff can read editors or write content (RLS plus checks in every Server
Action); admin routes `noindex`; images ≤ 5 MB, JPEG/PNG/WebP/AVIF; Server Action body limit raised for
uploads; no layout or design editing

**Scale/Scope**: fewer than 10 staff, fewer than 30 products, ~6 editors (company, texts, categories,
products, FAQs, testimonials)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simple, Readable Code | PASS | One generic editor pattern (Server Action + zod schema + form) reused per entity; text tokens are a 10-line replace function; change log is a DB trigger |
| II. Minimal Dependencies | PASS (improves) | No new packages; removes Cloudinary (previous plan's weakest justification) and its custom loader; uses existing Supabase Storage |
| III. SEO (NON-NEGOTIABLE) | PASS | Public pages stay statically rendered with metadata and JSON-LD fed from the single company record; `revalidatePath` after each save; editors `noindex`; image `alt` text required on upload |
| IV. Tested Code | PASS | Unit tests for every rule in FR-009/FR-013/FR-012; e2e for editors; Lighthouse gates re-run after edits |
| V. Responsive, Mobile-First | PASS | Editors are single-column forms that work at 320 px; touch targets ≥ 44 px; checked at 320/768/1280 |
| VI. English Documentation | PASS | All docs, code, identifiers in English; Spanish only for staff-facing and public UI text |

**Post-design re-check**: PASS. Item-level preview (not full-page) is a deliberate simplification, recorded
in research.md and Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-editable-content-company-data/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── staff-editor.md
└── tasks.md             # created later by /speckit-tasks
```

### Source Code (repository root; additions and changes to feature 001)

```text
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx                 # adds staff navigation (editors + inquiries)
│   │   ├── page.tsx                   # dashboard: links, pending placeholders, recent changes
│   │   ├── company/page.tsx           # company data editor
│   │   ├── texts/page.tsx             # page texts editor (generated from the text registry)
│   │   ├── categories/page.tsx        # list, add, edit, hide, reorder, delete
│   │   ├── products/page.tsx
│   │   ├── faqs/page.tsx
│   │   ├── testimonials/page.tsx
│   │   ├── history/page.tsx           # change log with "Restore"
│   │   └── content-actions.ts         # Server Actions: save/delete/reorder/restore/upload
│   └── (public pages)                 # now read texts via content.ts and revalidate on demand
├── components/admin/
│   ├── EditorForm.tsx                 # shared form shell: errors, conflict warning, preview slot
│   ├── ImageField.tsx                 # upload with alt text, size/type messages
│   └── Preview.tsx                    # renders public components with the unsaved values
├── content/
│   └── page-texts.ts                  # registry: key, page, label, default text, max length
├── lib/
│   ├── tokens.ts                      # renderText(): replaces {companyName}, {phone}, …
│   ├── content-schemas.ts             # zod schemas for every editable entity
│   ├── content-admin.ts               # framework-free save/conflict/restore logic (unit tested)
│   ├── images.ts                      # type and size rules, storage path builder
│   └── content.ts                     # extended: page texts, image URLs, token rendering
supabase/migrations/
├── 0004_editable_content.sql          # page_texts, updated_at, image_path rename, content_changes + triggers
├── 0005_editor_policies.sql           # staff write policies, storage bucket and policies
└── 0006_company_data_dhs.sql          # DHS company data; placeholders marked; invented claims unpublished
tests/
├── unit/                              # tokens, schemas, content-admin, images
└── e2e/editor.spec.ts
```

**Structure Decision**: Same single Next.js project. The editor logic that matters (validation, conflict
detection, restore) lives in framework-free modules so it is unit tested without Supabase, matching the
pattern used for inquiries in feature 001.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| DB trigger + `content_changes` table | Restore (FR-012) and an audit of who changed what; also captures edits made in the Supabase dashboard | Application-level logging misses dashboard edits and is easy to forget on new entities |
| Item-level preview instead of full-page preview | FR-011 is P2; renders the real public components with unsaved values, which shows staff what visitors will see for that item | A true draft/publish pipeline (draft copies of every table, preview routes) is much more code and state for fewer than 10 users |
| `@electric-sql/pglite` (dev dependency) | Runs the real SQL migrations in memory so Row Level Security, triggers, the change log, and locking are tested without a Supabase project | Without it those rules could only be verified by hand against a live project |
| Page text registry in code | Gives each editable text a label, default, and limit, and lets the editor and the public pages share one list | Free-form key/value texts invite typos and give no defaults |
