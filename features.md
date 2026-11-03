# Dishionary — Feature Specifications & User Stories

> **Document Status:** Living Document (v1.1.0 — Phase 1 Complete)  
> **Last Updated:** 2026-11-03

---

## 1. User Personas

1. **The Everyday Home Cook (Primary):** Wants a fast, clean digital binder for family recipes that doesn't jump around with ads while their hands are covered in flour. Relies heavily on mobile/tablet viewports, fullscreen reading mode, and quick sidebar switching between main and side dishes.
2. **The Culinary Collector & Sharer:** Curates dozens of detailed Markdown recipes with custom photography, organizes them by tags/collections, and regularly exports/imports recipes with friends and family.

---

## 2. Epic & Feature Breakdown

### Epic 1: Authentication & User Accounts

#### Story 1.1: Email & Password Registration

- **As a** new user,
- **I want to** register with my name, email address, and a strong password,
- **So that** I can create my private, independent cookbook.
- **Acceptance Criteria:**
  - Password must be at least 8 characters and include uppercase, lowercase, and a number/symbol.
  - Passwords are never stored or cached in frontend storage (`localStorage`/`sessionStorage`).
  - Submitting registration triggers a verification email via Supabase Auth / Resend and directs the user to `/verify-email`.

#### Story 1.2: Google OIDC Single Sign-On

- **As a** user,
- **I want to** sign in or sign up with one click using my Google account (OIDC),
- **So that** I can access Dishionary without managing another password.
- **Acceptance Criteria:**
  - Clicking "Continue with Google" initiates the OAuth 2.0 / OIDC PKCE flow.
  - Upon callback at `/auth/callback`, a corresponding `profiles` record is automatically provisioned via PostgreSQL trigger if it is the user's first login.

#### Story 1.3: Account Updates & Email Notifications

- **As a** registered user,
- **I want to** update my display name, avatar, email address, or password in `/settings` and receive email confirmation when sensitive account details change,
- **So that** my account stays accurate and I am alerted to any unauthorized changes.
- **Acceptance Criteria:**
  - Changing email requires verification of the new address.
  - Changing password or email dispatches a formatted security notification email to the user.
  - Each user's cookbook remains strictly isolated from all other users.

---

### Epic 2: Recipe CRUD & Hybrid Markdown Authoring

#### Story 2.1: Create & Edit Recipes via Modern Form Fields

- **As a** user,
- **I want to** create and edit recipes using intuitive form inputs combined with a clean Markdown editor,
- **So that** entering ingredients and cook times is structured and effortless while my cooking steps remain richly formatted.
- **Acceptance Criteria:**
  - **Structured Metadata Fields:** Title (required), Short Summary, Prep Time (mins), Cook Time (mins), Servings, Difficulty (`Easy`, `Medium`, `Hard`), Category, and custom Tags.
  - **Recipe Image Input:** Users can either upload an image file (JPEG, PNG, WebP up to 5MB) to Supabase Storage OR provide a direct HTTPS image URL, with instant visual preview.
  - **Dynamic Ingredient Builder:** Users can add, reorder, or remove ingredient rows (`Amount`, `Unit`, `Ingredient Name`, `Optional Prep Note`).
  - **Markdown Instructions Editor:** Includes a formatting toolbar (H2, H3, Bold, Italic, Ordered List, Bullet List, Blockquote/Chef Tip) and a toggleable Live Markdown Preview.
  - All inputs validate via Zod with clear inline error states.

#### Story 2.2: Safe & Typeset Markdown Rendering

- **As a** user reading a recipe,
- **I want** my recipe instructions rendered in clean, readable Markdown typography,
- **So that** multi-part recipes, bolded temperatures, and step-by-step lists are easy to follow from across the counter.
- **Acceptance Criteria:**
  - Supports GitHub Flavored Markdown (GFM): headings, bold/italic, numbered steps, bullet points, tables, and blockquotes.
  - Sanitizes all rendered HTML (`rehype-sanitize`) to block XSS vectors.
  - Long recipes scroll smoothly within both the Quick View drawer and the Fullscreen Cookbook Reader.

#### Story 2.3: Delete & Favorite Recipes

- **As a** user,
- **I want to** mark recipes as Favorites or permanently delete recipes I no longer want,
- **So that** my cookbook stays organized.
- **Acceptance Criteria:**
  - Favoriting toggles instantaneously (optimistic UI update).
  - Deleting a recipe prompts a confirmation dialog and removes associated storage images if uploaded to the user's bucket.

---

### Epic 3: Dashboard Discovery, Grid/List Views & Quick View

#### Story 3.1: Grid & List View of Recipe Cards

- **As a** logged-in user on the Dashboard,
- **I want to** toggle between a visual Grid view and a compact List view of my recipes,
- **So that** I can browse by dish photography or scan a large collection by title and cook time.
- **Acceptance Criteria:**
  - **Grid View Card:** Displays recipe image (configurable as top card cover or subtle full-card background with readable scrim), title, summary, total cook time (`prep + cook`), category badge, favorite SVG icon, and action triggers.
  - **List View Card:** Displays thumbnail, title, tags, total time, difficulty, and quick actions in a horizontal row.
  - User's preferred view mode persists across sessions.

#### Story 3.2: Scrollable Quick View vs. Fullscreen Reader

- **As a** user browsing my recipes,
- **I want to** open a recipe in a Quick View overlay or launch it in Fullscreen mode,
- **So that** I can either peek at ingredients quickly or immerse myself in cooking.
- **Acceptance Criteria:**
  - Clicking **Quick View** on any recipe card opens a responsive, independently scrollable slide-over drawer/modal showing the full recipe image, metadata, ingredients, and Markdown instructions.
  - Clicking **Open Full View** (or **Fullscreen Mode**) transitions to the full viewport reader with optional Distraction-Free Fullscreen toggle.

#### Story 3.3: Search, Categories, Tags & Collections

- **As a** user with many recipes,
- **I want to** filter my cookbook by keyword search, category, tags, Favorites, or custom Collections,
- **So that** I can find the right dish in seconds.
- **Acceptance Criteria:**
  - Search filters by recipe title, summary, tags, and ingredient names.
  - Category and Collection filters combine cleanly with search queries.

---

### Epic 4: "My Cookbook" Conversation-Style Sidebar Navigation

#### Story 4.1: Persistent Sidebar Recipe Switcher

- **As a** user viewing a recipe in `My Cookbook` (`/cookbook/[recipeId]`),
- **I want** a conversation-style sidebar listing my other recipes,
- **So that** I can jump between multiple recipes (e.g., an entrée, a sauce, and a side dish) without returning to the Dashboard.
- **Acceptance Criteria:**
  - Sidebar displays a compact search input, filter tabs (`All`, `Favorites`, `Collections`), and a scrollable list of recipe items with miniature thumbnails and cook times.
  - The currently active recipe is visually highlighted in warm terracotta accent styling.
  - Clicking another recipe in the sidebar updates the main recipe reader pane while preserving the sidebar's scroll position and search filter.
  - On mobile viewports (`< 768px`), the sidebar collapses into a swipeable/toggleable slide-over drawer so the recipe content retains full screen width.

---

### Epic 5: Recipe Export & Import Portability

#### Story 5.1: Export Recipe as Portable `.dishionary.json` File

- **As a** user,
- **I want to** export any recipe into a portable file containing all metadata, ingredients, Markdown instructions, and image data/URL,
- **So that** I can send it to a friend or back it up locally.
- **Acceptance Criteria:**
  - Clicking **Export Recipe** downloads a validated `<recipe-slug>.dishionary.json` file.
  - File includes schema version, all structured fields, Markdown body, the canonical `imageUrl`, and an optional base64 thumbnail/image fallback.

#### Story 5.2: Import Recipe via File Upload or Shared Link

- **As a** user receiving a recipe from another user,
- **I want to** import their `.dishionary.json` file or open their shared recipe link and save it into my own cookbook,
- **So that** I get a complete, editable copy of their recipe (including its image) in my independent account.
- **Acceptance Criteria:**
  - `/cookbook/import` accepts `.dishionary.json` files via drag-and-drop or file picker, validates the payload with Zod, shows a rich preview of the recipe, and saves a new copy owned by the importing user.
  - Users can also generate a unique shareable link (`/share/[token]`). Anyone with the link can view a read-only preview and click **"Import to My Cookbook"** to clone the recipe into their own account.

---

### Epic 6: Visual Identity, Theme & Viewport Responsiveness

#### Story 6.1: Warm Light/Dark Theme & Zero-Emoji SVG UI

- **As a** user,
- **I want** a cohesive warm color palette with Light and Dark modes and crisp SVG icons (no emojis),
- **So that** the interface feels like a modern, bespoke editorial product in both bright kitchens and dim evening environments.
- **Acceptance Criteria:**
  - Light mode uses warm parchment/terracotta tones; Dark mode uses deep espresso/warm amber tones.
  - No extreme multi-color gradients are used anywhere in the UI.
  - Zero emojis exist in source code, UI labels, empty states, or toast messages; all visual indicators use custom or Lucide SVGs.
  - Responsive layout adapts cleanly across Mobile (`320px–639px`), Tablet/Medium (`640px–1023px`), and Desktop (`1024px+`).

---

## 3. Feature-to-Phase Traceability Matrix

| Feature ID | Feature Name                                                  | Priority | Target Phase | Status        | Unit Tested? |
| :--------- | :------------------------------------------------------------ | :------- | :----------- | :------------ | :----------- |
| **F-01**   | Warm Design System, Custom SVG Logo & Light/Dark Mode         | P0       | Phase 1      | **Completed** | Yes          |
| **F-02**   | Public Landing Page & Responsive App Shell                    | P0       | Phase 1      | **Completed** | Yes          |
| **F-03**   | Email/Password Auth, Google OIDC & Protected Routes           | P0       | Phase 2      | Pending       | Yes          |
| **F-04**   | Email Verification & Password Recovery Flows                  | P0       | Phase 2      | Pending       | Yes          |
| **F-05**   | Recipe CRUD (Create, Read, Update, Delete) & DB RLS           | P0       | Phase 3      | Pending       | Yes          |
| **F-06**   | Hybrid Recipe Form (Structured Inputs + Markdown Editor)      | P0       | Phase 3      | Pending       | Yes          |
| **F-07**   | Recipe Image Upload (Supabase Storage) & External URL Support | P0       | Phase 3      | Pending       | Yes          |
| **F-08**   | Dashboard Grid & List Card Views with Search/Tag Filtering    | P0       | Phase 4      | Pending       | Yes          |
| **F-09**   | Scrollable Recipe Quick View Drawer/Modal                     | P0       | Phase 4      | Pending       | Yes          |
| **F-10**   | Collections & Favorites Organization                          | P1       | Phase 4      | Pending       | Yes          |
| **F-11**   | "My Cookbook" Conversation-Style Sidebar & Fullscreen Reader  | P0       | Phase 5      | Pending       | Yes          |
| **F-12**   | Recipe Export & Import (`.dishionary.json` + Share Links)     | P0       | Phase 6      | Pending       | Yes          |
| **F-13**   | Account & App Settings + Security Email Notifications         | P0       | Phase 7      | Pending       | Yes          |
| **F-14**   | Structured Logging (Pino) & Error Boundary Telemetry          | P1       | Phase 7      | Pending       | Yes          |
