# Food distribution company website

Marketing and lead-generation site for a Bolivian food distributor: company information, product
catalog with optional prices in Bs, WhatsApp-first contact, contact form, and a protected staff area
for managing inquiries.

- Stack: Next.js 16 (App Router), Tailwind CSS 4, Supabase, Resend, Supabase Storage, GTM (optional).
- Specification, plan and tasks: [specs/001-food-distribution-website/](specs/001-food-distribution-website/).
- Setup, content editing and validation: [quickstart.md](specs/001-food-distribution-website/quickstart.md).

```bash
cp .env.example .env.local   # fill in; works without Supabase using placeholder content
npm install
npm run dev
npm test && npm run test:e2e && npm run build && npm run test:lighthouse
```
