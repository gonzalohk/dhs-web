# Contract: Contact Form Server Action

Action: `submitInquiry(formData)` in `src/app/contact/actions.ts`

## Input fields
| Field | Rule |
|-------|------|
| `name` | required, 1–100 chars |
| `email` | optional valid email; required if `phone` empty |
| `phone` | optional, 7–20 chars of digits/`+`/spaces/dashes; required if `email` empty; must normalize to a Bolivian number: `+591` followed by 8 digits (local 8-digit numbers get `+591` added) |
| `business_name` | optional, ≤ 120 chars |
| `message` | required, 10–2000 chars |
| `website` | honeypot; MUST be empty |
| `started_at` | timestamp; submissions faster than 3 s are rejected |

## Result
- Success: `{ ok: true }` — UI shows confirmation message.
- Validation error: `{ ok: false, errors: { <field>: "<friendly message>" } }` — input preserved.
- Rate limited or failure: `{ ok: false, formError: "<friendly message with phone/WhatsApp fallback>" }`.

## Behavior
1. Validate with zod. 2. Reject spam signals silently as success-looking (no details leaked).
3. Rate limit per hashed IP (max 5 per hour). 4. Insert into `inquiries`. 5. Send email via Resend to the
company address; set `email_sent`. 6. Email failure does not fail the request if the insert succeeded.
