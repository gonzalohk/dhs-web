# Contract: Staff Editor

All routes are under `/admin`, `noindex`, excluded from the sitemap, and protected by `proxy.ts`
(signed-out requests redirect to `/admin/login`). Every Server Action re-checks the session.
UI labels are Spanish; identifiers are English.

## Routes
| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard: links to editors and inquiries, list of fields still holding a placeholder, latest changes |
| `/admin/company` | Edit the company data record |
| `/admin/texts` | Edit page texts (Home, About, Delivery) generated from the registry; shows allowed tokens |
| `/admin/categories`, `/admin/products` | List with show/hide, reorder, add, edit, delete; image upload |
| `/admin/faqs`, `/admin/testimonials` | List with show/hide, reorder, add, edit, delete |
| `/admin/history` | Change log; "Restore previous value" on the latest change of each item |
| `/admin/inquiries` | Unchanged from feature 001 |

## Server Actions (`src/app/admin/content-actions.ts`)
| Action | Input | Result |
|--------|-------|--------|
| `saveCompany(state, formData)` | company fields, `updatedAt` | `{ ok: true }` or `{ ok: false, errors, conflict? }` |
| `saveText(state, formData)` | `key`, `value`, `updatedAt` | same |
| `saveItem(entity, state, formData)` | entity (`category` \| `product` \| `faq` \| `testimonial`), fields, optional `id` and `updatedAt` | same |
| `setVisibility(entity, id, published)` | | `{ ok }` |
| `moveItem(entity, id, direction)` | `up` \| `down` | `{ ok }` |
| `deleteItem(entity, id)` | | `{ ok }` |
| `uploadImage(entity, formData)` | `file`, `alt` | `{ ok: true, path }` or `{ ok: false, error }` |
| `restoreChange(changeId)` | | `{ ok }`; fails if a newer change exists for that item |

## Common rules
- **Validation**: zod schemas in `content-schemas.ts`; errors keyed by field name with Spanish messages that
  name the field; nothing is saved when any field is invalid (FR-009).
- **Conflict**: if the row's `updated_at` differs from the submitted `updatedAt`, return `{ ok: false,
  conflict: true }`; nothing is written and the typed values are kept (FR-013).
- **Publish**: every successful write calls `revalidatePath("/", "layout")` (FR-004, SC-003).
- **Authorization**: no session → redirect to `/admin/login`; writes also enforced by Row Level Security.
- **Images**: accepts JPEG, PNG, WebP, AVIF up to 5 MB; `alt` required; error messages say whether the file
  was too large or the wrong type and the existing image stays.

## Preview (FR-011)
The editor's preview panel renders the public components with the current unsaved values; it never writes.
