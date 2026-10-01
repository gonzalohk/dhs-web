<!--
Sync Impact Report (temporary; remove before committing)
- Version change: 1.0.0 → 1.1.0
- Modified principles: none
- Added sections: Principle VI (English Documentation)
- Removed sections: none (language bullet in Technical Standards folded into Principle VI)
- Deferred items: none
-->

# Proyectos Constitution

## Core Principles

### I. Simple, Readable Code
Code MUST be easy to understand by a developer new to the project. Functions and
components MUST do one thing and use descriptive names. Clever tricks, deep
abstractions, and premature generalization are prohibited. Any complexity beyond the
simplest working solution MUST be justified in writing in the plan.
Rationale: code is read far more often than it is written; simple code is cheaper to
maintain, test, and change.

### II. Minimal Dependencies
A new dependency MUST NOT be added unless the same result cannot be reasonably achieved
with the platform or standard library in a small amount of code. Each dependency MUST be
justified in the plan (what it does, why the platform is not enough, its size and
maintenance status). Unused dependencies MUST be removed.
Rationale: every dependency adds weight, security exposure, and upgrade work.

### III. Search Engine Optimization (NON-NEGOTIABLE)
Every public page MUST be built for a high SEO score:
- Semantic HTML (one `h1`, ordered headings, landmarks, meaningful `alt` text).
- Unique `title` and meta `description` per page, canonical URL, and Open Graph tags.
- Content rendered on the server or at build time so crawlers receive full HTML.
- Clean, descriptive URLs, a `sitemap.xml`, and a `robots.txt`.
- Structured data (JSON-LD) where a matching schema exists.
- Core Web Vitals targets: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms.
- Lighthouse SEO score of 100 and Performance/Accessibility/Best Practices ≥ 90 before
  a feature is considered done.

### IV. Tested Code
Every feature MUST have automated tests covering its main behavior and key edge cases.
Tests MUST be written before or together with the implementation and MUST pass before
merging. Tests MUST be readable and independent of each other. Bug fixes MUST include a
test that fails without the fix. SEO-critical output (titles, meta tags, structured data)
MUST be covered by tests.

### V. Responsive, Mobile-First
All interfaces MUST work on mobile and desktop. Layouts MUST be designed mobile-first and
verified at common widths (320, 768, and 1280 px). Touch targets MUST be at least
44×44 px, text MUST remain readable without zooming, and there MUST be no horizontal
scrolling. The viewport meta tag is required.

### VI. English Documentation
All specifications (`spec.md`, including Clarifications and Assumptions), plans, research,
data models, contracts, quickstarts, tasks, checklists, code comments, commit messages,
pull request descriptions, and this constitution MUST be written in English. Identifiers
in code (variables, functions, files, database tables and columns) MUST also be in English.
The only exception is user-facing website content, which is written in the language of the
target audience (Spanish for this project) and MUST be quoted as-is when a spec refers to it.
Rationale: one working language keeps the documents consistent, searchable, and readable by
any contributor or tool.

## Technical Standards

- Prefer plain HTML, CSS, and standard-library or platform features; add a framework
  only when the plan justifies it under Principles I and II.
- Images MUST be optimized, sized explicitly, and lazy-loaded when below the fold.
- Accessibility (keyboard navigation, sufficient contrast, labels) is required because
  it directly supports SEO and mobile usability.

## Development Workflow

- Work follows the Spec Kit flow: specify → plan → tasks → implement.
- Every plan MUST include a Constitution Check against Principles I–VI.
- Changes MUST be small and reviewable; each change leaves tests passing.
- Before completion, run the test suite, a Lighthouse audit, and a manual check at mobile
  and desktop widths.

## Governance

This constitution supersedes other practices. Amendments require a documented change,
a version bump, and a review of open specs and plans for impact. Versioning follows
semantic versioning: MAJOR for removed or redefined principles, MINOR for added or
materially expanded guidance, PATCH for clarifications. Every plan and review MUST verify
compliance, and any violation MUST be justified in the plan's complexity tracking.

**Version**: 1.1.0 | **Ratified**: 2026-09-30 | **Last Amended**: 2026-09-30
