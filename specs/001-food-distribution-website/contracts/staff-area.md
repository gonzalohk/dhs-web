# Contract: Staff Area

Routes: `/admin/login`, `/admin/inquiries`. Not linked publicly, `noindex`, excluded from the sitemap.

## Access
- Only Supabase Auth users created by the company; public sign-up disabled.
- `proxy.ts` redirects any `/admin/*` request (except `/admin/login`) without a valid session to `/admin/login`.

## Server Actions (`src/app/admin/actions.ts`)
| Action | Input | Result |
|--------|-------|--------|
| `signIn(formData)` | `email`, `password` | redirect to `/admin/inquiries`, or `{ ok: false, formError }` (generic message) |
| `signOut()` | none | session ended, redirect to `/admin/login` |
| `setInquiryStatus(id, status)` | inquiry id, `new` or `handled` | `{ ok: true }` and updated `status`, `handled_at`, `handled_by`; fails if not signed in |

## Inquiries list
- Newest first; shows name, contact (email/phone), business, message, date, status.
- Filter by status (`all`, `new`, `handled`) via a query parameter.
