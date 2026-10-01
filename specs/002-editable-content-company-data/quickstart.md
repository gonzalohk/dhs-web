# Quickstart: Validation Guide

Builds on [feature 001's quickstart](../001-food-distribution-website/quickstart.md) (Supabase project,
staff user, `.env.local`).

## Prerequisites
- Feature 001 running with Supabase configured and one staff user created.
- Apply the new migrations in order, **before** deploying the code (the code reads the renamed `image_path` column) in the Supabase SQL editor: `0004_editable_content.sql`,
  `0005_editor_policies.sql`, `0006_company_data_dhs.sql`.
- Remove `NEXT_PUBLIC_CLOUDINARY_CLOUD` from `.env.local` (no longer used).
- Authentication > Sign In / Providers: public sign-up disabled; create each staff member in Authentication > Users.
- Placeholders: fields that still say "[Pendiente]" are hidden on the public site and listed on the staff dashboard.

## Run
```bash
npm install
npm run dev     # http://localhost:3000, sign in at /admin/login
```

## Validate
1. **Company data (US1)**: `/admin/company` shows DHS, +591 57734924, and the DHS email. Open every public
   page: header, footer, contact page, WhatsApp links, page titles, and view-source JSON-LD all show those
   values and no placeholder company data. Change the phone once; every page updates (SC-004).
2. **Variables in texts**: in `/admin/texts` use `{companyName}` in a text; the public page shows "DHS". An
   unknown token such as `{foo}` is rejected with a message.
3. **Edit content (US2)**: change a product price, add a product (with an image and alt text), hide a FAQ;
   confirm each on the public site within seconds. Invalid input (bad email, price without unit, empty
   name) is rejected with a message naming the field.
4. **Images**: upload a PNG under 5 MB (accepted); a 6 MB file and a PDF are rejected with clear messages
   and the previous image stays.
5. **Access control (SC-007)**: signed out, every `/admin/*` URL redirects to sign-in; a signed-out Server
   Action call writes nothing.
6. **Preview and restore (US3)**: use "Vista previa" while editing a product; save a wrong price, then use
   `/admin/history` → "Restore previous value" and confirm the public price returns.
7. **Concurrency**: open the same product in two browsers, save in one, then save in the other; the second
   shows a conflict warning and keeps the typed text.
8. **Quality gates (SC-006)**: after editing, run `npm run build && npm run test:lighthouse`; SEO stays 100
   and the other categories ≥ 90.
9. **Automated**: `npm test` (unit tests plus the database rules, which run the real migrations in
   memory), `npm run test:e2e` (signed-in editor flows run only with Supabase and `E2E_STAFF_EMAIL` /
   `E2E_STAFF_PASSWORD` set).
