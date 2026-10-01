# Feature Specification: Editable Content and Company Data

**Feature Branch**: `002-editable-content-company-data`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "Necesito que el contenido pueda ser editado así mismo tener variables que permitan definir datos de mi distribuidora. Distribuidora: DHS. Teléfono y WhatsApp: 57734924. Email: distribuidoradhs2026@gmail.com"

## Clarifications

### Session 2026-09-30

- Q: Where should staff edit the content? → A: In a protected editing area inside the website itself (the existing staff area), not only in the database dashboard
- Q: Is the phone number 57734924 valid, given that it starts with 5? → A: Yes; Bolivian mobile numbers may now start with 5, so any 8-digit number after +591 is valid

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Define company data once and see it everywhere (Priority: P1)

The owner of the distribution company (DHS) defines the company's basic data in one place: name, phone,
WhatsApp number, email, address, business hours, tagline, service areas, delivery schedule, and minimum
order. Every page, link, and contact action on the website uses these values, so the data is never
typed twice and never goes out of date in one place only.

**Why this priority**: Right now the site shows placeholder company data. Replacing it with DHS's real
data, consistently, is required before the site can be published.

**Independent Test**: Set the company data to DHS's values, then open every public page and check the
name, phone, WhatsApp link, and email; all show the DHS values and none shows placeholder data.

**Acceptance Scenarios**:

1. **Given** the company data is set to name "DHS", phone and WhatsApp "57734924", and email
   "distribuidoradhs2026@gmail.com", **When** a visitor opens any public page, **Then** the header,
   footer, contact page, and page titles show "DHS" and the same contact details, and no placeholder
   company name or contact detail appears anywhere.
2. **Given** the company data is set, **When** a visitor taps a phone, WhatsApp, or email action on any
   page, **Then** it opens the phone dialer, a WhatsApp chat, or the email app with the DHS values.
3. **Given** search engines read the site, **When** they read the structured business information,
   **Then** it contains the same name, phone, email, and address as the visible pages.
4. **Given** the owner changes one company data value, **When** the change is saved, **Then** every
   place that shows that value reflects the new one without further edits.

---

### User Story 2 - Edit website content without a developer (Priority: P1)

Authorized staff edit the website's content themselves: page texts (home, about, delivery), product
categories, products (name, description, image, optional price), frequently asked questions, and
testimonials. They can add, change, hide, reorder, and remove items, and see the result on the public
site shortly after saving.

**Why this priority**: The owner explicitly needs to manage the content; without it every change needs
a developer.

**Independent Test**: A staff member changes a product price, adds a new product, and hides a FAQ, then
verifies the three changes on the public site.

**Acceptance Scenarios**:

1. **Given** a signed-in staff member, **When** they edit a product's name, description, price, or
   image and save, **Then** the public category page shows the change within 5 minutes.
2. **Given** a signed-in staff member, **When** they add a new product to a category, **Then** it
   appears on that category's page; **When** they hide or delete it, **Then** it no longer appears.
3. **Given** a signed-in staff member, **When** they edit page texts, FAQs, or testimonials and save,
   **Then** the public pages show the new text within 5 minutes.
4. **Given** a staff member leaves a required field empty or enters an invalid value (for example a
   malformed email or phone), **When** they try to save, **Then** they see a clear message naming the
   field and nothing is saved.
5. **Given** a visitor who is not signed in, **When** they try to reach the editing area, **Then** they
   are asked to sign in and cannot see or change any content.

---

### User Story 3 - Edit safely and recover from mistakes (Priority: P2)

Staff can review what they changed before it goes live and undo a mistaken edit, so a typo or a wrong
price does not stay on the public site.

**Why this priority**: Content is public and affects customers; mistakes must be easy to spot and fix,
but the site works without this.

**Independent Test**: Change a product price, preview it, publish it, then restore the previous value.

**Acceptance Scenarios**:

1. **Given** a staff member is editing, **When** they request a preview, **Then** they see the page as
   visitors will see it, before the change is public.
2. **Given** a change was published by mistake, **When** the staff member restores the previous value,
   **Then** the public site shows the previous value again within 5 minutes.

---

### Edge Cases

- A required company value (name, WhatsApp number, or email) is removed; the system refuses to save
  so the site never shows a missing contact detail.
- Two staff members edit the same item at nearly the same time; the later save does not silently
  overwrite the earlier one without warning.
- A staff member uploads a very large or unsupported image; they get a clear message and the existing
  image stays.
- A category has all its products hidden; it disappears from public listings instead of showing an
  empty page.
- A staff member loses connection while saving; they are told the save failed and their typed text is
  kept so they can retry.
- A very long text is entered; the public page keeps a readable layout with no horizontal scrolling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST store the company data in a single place: name, tagline, phone, WhatsApp
  number, email, address, city, business hours, service areas, delivery schedule, minimum order, and
  ordering steps.
- **FR-002**: Every public page, link, contact action, page title, social preview, and structured
  business data MUST read the company data from that single place; no company value may be duplicated
  elsewhere.
- **FR-003**: The company data MUST initially contain DHS's real values: name "DHS", phone and WhatsApp
  "57734924" (Bolivian number, country code +591), and email "distribuidoradhs2026@gmail.com". Remaining
  values keep clearly marked placeholders until the owner supplies them.
- **FR-004**: Authorized staff MUST be able to edit the company data and see the change on every
  public page within 5 minutes of saving.
- **FR-004a**: The editing area MUST be part of the website (the existing protected staff area), so staff
  can manage all editable content and company data without using any other tool.
- **FR-005**: Authorized staff MUST be able to add, edit, hide, reorder, and delete product categories
  and products, including name, description, image, and optional public price with sales unit.
- **FR-006**: Authorized staff MUST be able to add, edit, hide, reorder, and delete frequently asked
  questions and testimonials.
- **FR-007**: Authorized staff MUST be able to edit the main texts of the Home, About, and Delivery &
  Ordering pages (headings, introductions, story, mission, values, and benefits).
- **FR-008**: Authorized staff MUST be able to upload and replace images, with a clear message when a
  file is too large or not an accepted image type.
- **FR-009**: The system MUST validate every edit before saving: required fields present, email and
  phone in valid format (Bolivian phone: any 8 digits after +591, including numbers starting with 5), prices positive, and a unit whenever a
  price is set. Invalid edits MUST NOT be saved and MUST show a message naming the field.
- **FR-010**: Only signed-in authorized staff MUST be able to view the editing area or change content;
  the area MUST NOT be indexed by search engines or linked from public pages.
- **FR-011**: Staff MUST be able to preview a change before it becomes public. (Priority P2)
- **FR-012**: Staff MUST be able to restore the previous value of a published edit. (Priority P2)
- **FR-013**: The system MUST warn a staff member who saves an item that someone else changed since they
  opened it, instead of silently overwriting.
- **FR-014**: Changes MUST NOT break SEO, performance, accessibility, or responsive behavior defined for
  the public site; pages remain fully readable by search engines after any edit.

### Key Entities *(include if feature involves data)*

- **Company data**: Single record with name, tagline, phone, WhatsApp number, email, address, city,
  business hours, service areas, delivery schedule, minimum order, ordering steps, certifications, and
  client types.
- **Page text**: Editable headings and paragraphs for the Home, About, and Delivery & Ordering pages.
- **Product category**: Name, description, image, order, visibility.
- **Product**: Name, description, image, optional price and sales unit, category, order, visibility.
- **FAQ entry**: Question, answer, topic, order, visibility.
- **Testimonial**: Author (client name or business type), quote, visibility.
- **Staff member**: Company-authorized person who can sign in and edit.
- **Change record**: Previous and new value of an edit, who made it, and when (supports restore).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After the owner sets the company data once, 100% of pages show the same name, phone,
  WhatsApp, and email, and no placeholder company data remains on any page.
- **SC-002**: A staff member without technical knowledge can change a product's price in under 2
  minutes on their first attempt.
- **SC-003**: 95% of content changes appear on the public site within 5 minutes of saving.
- **SC-004**: Changing the company phone number requires editing it in exactly one place and updates
  100% of phone and WhatsApp links on the site.
- **SC-005**: 100% of invalid edits are rejected with a message naming the problem field, and 0
  invalid values reach the public site.
- **SC-006**: After any edit, every public page keeps a search-engine optimization score of 100 and
  performance, accessibility, and best-practices scores of at least 90.
- **SC-007**: 0 content changes are possible without signing in.

## Assumptions

- This feature builds on the existing website (feature 001): the public pages, the staff sign-in, and
  the stored content already exist; this feature makes all of that content and the company data
  editable by staff.
- The company is DHS, operating in Bolivia. The phone and WhatsApp number "57734924" is an 8-digit
  Bolivian number with country code +591 (full number +591 57734924), confirmed valid by the owner.
- The editing area is part of the website itself: the existing protected staff area is extended with
  editors for company data, page texts, categories, products, images, FAQs, and testimonials. Editing
  directly in the database dashboard is still possible but is not the supported way for staff.
- The website content stays in Spanish only; the editing area labels are in Spanish for the staff.
- Fewer than 10 staff members use the editing area; all have the same permissions (no separate roles).
- A restore (FR-012) is available for the most recent published change of each item; a full change
  history browser is out of scope.
- Editing layout, colors, and the structure of pages is out of scope: staff edit content and data, not
  design.
- Multi-language content, scheduled publishing, and approval workflows are out of scope.
- Address, business hours, service areas, and delivery details for DHS are provided by the owner later;
  placeholders are marked until then.
