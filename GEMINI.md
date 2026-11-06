# GEMINI.md — Dishionary Project Context & State Tracker

> **Purpose:** This file serves as the persistent memory and single source of truth for the **Dishionary** project across sessions. Update this file at the completion of every task, bugfix, or implementation phase.

---

## 1. Current Project State

- **Current Phase:** **Phase 2 Complete** (Ready to begin **Phase 3: Recipe CRUD Engine, Image Storage & Hybrid Markdown Form**)
- **Active Branch Target:** `dev` (for feature implementation) -> `main` (production CI/CD)
- **Last Updated:** 2026-11-03

### Phase Progress Tracker

- [x] **Phase 0: Architecture & Design Documentation** (`PRD.md`, `features.md`, `security.md`, `README.md`, `GEMINI.md`)
- [x] **Phase 1: Project Foundation, Design System & CI/CD Pipeline** (Next.js 16.4.4 App Router, Tailwind CSS v4 warm theme, Custom SVG Logo, Landing Page, Error/404 boundaries, Prettier 3.5.3, Vitest 5.1.0, GitHub Actions, 0 npm vulnerabilities)
- [x] **Phase 2: Database Schema, Supabase Auth, Google OIDC & Transactional Emails** (Drizzle ORM schema & SQL RLS migration runner, `@supabase/ssr` HTTP-only cookie `src/proxy.ts`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/auth/callback`, Resend email notifications with CID logo, 20 passing unit tests)
- [ ] **Phase 3: Recipe CRUD Engine, Image Storage & Hybrid Markdown Form** (`/cookbook/new`, `/cookbook/[recipeId]/edit`, Supabase Storage, Zod validation, sanitized Markdown)
- [ ] **Phase 4: User Dashboard, Grid/List Views, Filtering & Quick View Modal** (`/dashboard`, `<RecipeCard />`, `<RecipeQuickView />`, Collections & Tags)
- [ ] **Phase 5: "My Cookbook" Conversation-Style Sidebar & Fullscreen Reader** (`/cookbook` split-pane layout, persistent recipe switcher sidebar, fullscreen cooking toggle)
- [ ] **Phase 6: Recipe Portability (Export & Import via `.dishionary.json` & Share Links)** (`/cookbook/import`, `/share/[token]`, portable JSON serializer/validator)
- [ ] **Phase 7: Account & App Settings, Observability & Production Hardening** (`/settings`, email notifications on account change, Pino structured logger, final audit)

---

## 2. Locked-In Architectural & Design Decisions

1. **Core Tech Stack:**
   - **Frontend & Full-Stack Framework:** Next.js 16 (App Router) + TypeScript 5 + Tailwind CSS v4 + Lucide SVG Icons.
   - **Backend & Database:** Supabase PostgreSQL + Drizzle ORM + Row-Level Security (RLS).
   - **Authentication:** Supabase Auth (`@supabase/ssr`) with Email/Password (server-side hashing, HTTP-only cookies—never stored in frontend storage) + Google OIDC.
   - **Image Storage:** Supabase Storage (`recipe-images` bucket) + support for external `https://` image URLs.
   - **Transactional Emails:** Resend + React Email (using User's Cloudflare custom domain, integrated with Supabase Auth for verification and account update alerts).
   - **Testing & CI/CD:** Vitest + React Testing Library + GitHub Actions (`ci.yml`) + Vercel (`dev` preview, `main` production).
2. **UI/UX Guardrails (Strict):**
   - **Zero Emojis:** Never use emojis anywhere in UI components, placeholders, toast alerts, or empty states. Use clean 1.75px stroke SVGs and the custom Dishionary SVG logo.
   - **Warm Color Palette & No Extreme Gradients:** Use solid warm surfaces (`#FAF7F2` parchment in light mode, `#161311` espresso in dark mode, `#C85A32` / `#E07A5F` terracotta primary, `#4A6B53` sage accent) with subtle 1px borders (`#E5DDD3` / `#332D29`).
   - **Responsive Viewports:** Every view must be tested across Mobile (`<640px`), Medium/Tablet (`640px–1024px`), and Desktop (`>1024px`).
3. **Recipe Authoring & Portability:**
   - **Hybrid Editor:** Structured inputs for metadata, times, servings, tags, image, and ingredient rows + Markdown editor with toolbar and sanitized live preview for instructions.
   - **Dual Portability:** Support both `.dishionary.json` file export/import AND tokenized read-only share links (`/share/[token]`) with one-click cloning into the recipient's cookbook.

---

## 3. Working Guidelines for Future Sessions

1. **One Phase at a Time:** Implement only the active phase. Document why each method/approach was used, write unit tests for important features in that phase, verify all tests pass, and update this `GEMINI.md` file before moving to the next phase.
2. **Keep Documentation Synchronized:** Whenever a schema, route, or security rule evolves during implementation, update `PRD.md`, `features.md`, `security.md`, and `README.md` alongside `GEMINI.md`.
