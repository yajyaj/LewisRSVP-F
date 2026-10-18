# Under the Sea — 1st Birthday RSVP Frontend Redesign Plan

> **Status:** Frontend implementation complete; checklist reconciled with verified work on 2026-10-18. See `REDESIGN_QA_REPORT.md` for current evidence and remaining live-backend/physical-device checks. User authorized continued work without phase approval pauses and capped image generation at 10 total.
> **Audience:** GPT-6.1 Sol Light / VS Code coding assistant acting as a senior frontend engineer, senior UI/UX designer, accessibility reviewer, and performance engineer.
> **Visual reference:** `a_bright_whimsical_colorful_mockup_concept_boa.png` (the previously generated concept board). Place the image in the project or attach it to the coding assistant if it cannot access this conversation.
> **Goal:** Redesign the existing frontend *in place* into a cohesive, responsive, interactive pastel underwater storybook, preserving existing RSVP functionality and visual identity.

## 0. Non-negotiable operating instructions

1. **Inspect before editing.** Identify the actual frontend root, routes, components, styles, package dependencies, images, tests, and API client. Do not assume filenames or architecture.
2. **Preserve the existing application.** Keep Laravel API contracts, existing RSVP fields and validation, data flow, guest count rules, navigation, security, authentication, CSRF, and all working behavior intact. Do not modify the backend unless the user explicitly approves.
3. **Keep secrets secure.** Never print, copy, commit, or expose `.env` values, application keys, session tokens, or credentials. Keep Sanctum cookie-based SPA authentication, `credentials: 'include'`, CSRF-cookie initialization, and `XSRF-TOKEN` behavior intact wherever currently implemented. Do not introduce Bearer tokens or localStorage auth.
4. **No wholesale rebuild.** Reuse existing components and CSS/Tailwind conventions, improving one section at a time.
5. **Remove `.hero::before`.** Delete the `.hero::before` rule and related overlay usage; verify hero layout, contrast, and stacking without it. Do not indiscriminately delete other pseudo-elements.
6. **Preserve current text and event data.** Never invent the birthday boy's name, dates, venue, photos, or RSVP details. Use existing content, or clearly labeled placeholders only if absent.
7. **No decorative images in header or footer.** Keep both clean, navigable, and accessible.
8. **No repeated seaweed motifs.** Use varied, carefully placed assets; do not tile the same illustration or repeat it in every section.
9. **Readable text everywhere.** Artwork must never compromise foreground contrast, form clarity, or interactive hit targets.
10. **Use image generation for the new artwork** if the current assistant has a real image-generation tool. If it does not, stop the asset-generation step, list exact missing assets/prompts, and ask the user to generate/provide them; **do not pretend images were created** or substitute random stock images.
11. **Do not use a real child's likeness without a provided reference image.** Until one is supplied, generated baby-boy characters are generic illustrations, not portraits of the actual celebrant.
12. **Deliver in reviewable stages.** First produce an audit and implementation checklist; do not immediately refactor the entire app.
13. **Reversible redesign is mandatory.** Before ANY modification, establish and verify a restorable baseline. If I reject a design or ask to revert, restore only the changes from the rejected redesign phase, without losing my pre-existing work or unrelated later edits. See Section 9.

## 1. Creative direction and hierarchy

**Design story:** Visitors descend through a magical, warm, inviting ocean to celebrate a child's first birthday. The experience feels like a carefully art-directed digital storybook, not a noisy game or generic landing page.

**Keywords:** dreamy, premium, cheerful, welcoming, child-friendly, pastel, 3D storybook illustration, airy, luminous, whimsical, cohesive, accessible.

**Composition rules:**
- Prioritize a single focal point per section; use an alternating image/text rhythm.
- Reserve calm, low-detail zones behind headlines and paragraphs.
- Use visual depth in three layers: distant underwater light gradients, midground reef silhouettes, and foreground isolated characters/coral clusters.
- Avoid giant full-bleed illustration layers behind text unless contrast is verified.
- Keep 3D characters consistent in eye shape, rounded forms, shadows, rendering, lighting direction, and pastel palette.
- Use a maximum of 1–2 prominent character illustrations per section; small accents are optional.
- Design the page as a coherent narrative with gentle organic transitions between sections.

### Suggested palette (adjust to existing branding after inspection)

| Role | Suggested color | Usage |
|---|---|---|
| Deep ocean text | `#164C70` | Body/headings on light surfaces |
| Ocean teal | `#1F9FB1` | Primary CTA and focus accents |
| Soft aqua | `#DDF8F8` | Light section surfaces |
| Sky blue | `#B8EAF6` | Gradient backgrounds |
| Cream pearl | `#FFF8EF` | Seashell cards and form surfaces |
| Coral pink | `#FFB6AA` | Starfish and warm highlights |
| Sand gold | `#F8D78C` | Birthday number and small accents |
| Lavender | `#D9C9F3` | Minor decorative highlights |

Use CSS custom properties or existing Tailwind theme tokens; do not hardcode slightly different blues in dozens of files. Verify WCAG AA text contrast (4.5:1 normal text; 3:1 large text and meaningful UI boundaries).

### Typography

- Pair **one friendly rounded display face** with **one highly legible sans-serif** for body/form text; prefer fonts already installed. Load only needed weights.
- Display headline: responsive `clamp(...)`, readable on 320px widths, with careful line breaks.
- Section titles: consistent scale and spacing; avoid text shadows that blur letterforms.
- Body: generally 16–18px with 1.5–1.7 line height; form labels at least 14–16px.
- Use visible labels, not placeholder-only inputs. Never render critical event information as text baked into images.

### Spacing and geometry

- Use an 8px-based spacing system and a consistent max-width content container (~1120–1200px).
- Desktop sections: generous vertical rhythm (~80–120px depending on content).
- Mobile sections: compact but breathable (~48–72px), no fixed heights for text-heavy blocks.
- Buttons: min-height 44px, clearly visible hover/focus/pressed/disabled states.
- Seashell motifs may influence card silhouette but must not create irregular clipping or inaccessible controls.

## 2. Asset-generation pipeline — images included in redesign

### 2.1 First inspect existing assets

Scan `src/assets/images` (or discovered actual equivalent). Inventory each file: filename, dimensions, format, transparency, file size, and usage. Reuse high-quality existing images where appropriate. Do not overwrite originals. Avoid generating duplicates of usable assets.

### 2.2 Image generation responsibility

If the assistant can access an image-generation tool, generate original assets **as separate images**, not as one collage. If generation yields a contact sheet, split/export only if quality is adequate and rights/tools allow. Save optimized copies in a clear subfolder such as `src/assets/images/underwater/` and document attribution/licensing where applicable. Do not assume a text-only coding model can generate PNGs by writing prompts alone.

**Global generation art direction:**

> Original premium 3D storybook illustration for a baby's first-birthday underwater invitation; friendly round shapes, oversized expressive eyes, gentle smiles, pastel turquoise/aqua/sky blue/coral pink/peach/cream/gold, soft cinematic underwater light, subtle depth, smooth high-quality textures, clean isolated silhouette, professional character consistency, age-appropriate, charming, not frightening, no words, no logos, no watermark. Transparent background for isolated assets. Entire subject visible, ample safe padding. Do not imitate a specific studio or copyrighted character.

**Required asset inventory** (generate only those not already available):

| Asset / suggested filename | Description | Export guidance |
|---|---|---|
| `whale-hero.webp` | Smiling pastel blue baby whale, 3/4 angle, dynamic but gentle pose, splash accents | Transparent, 1600px+ wide source |
| `starfish-happy.webp` | Peach/coral starfish with rosy cheeks, five clear arms | Transparent, 1000px+ |
| `seahorse-friendly.webp` | Mint/turquoise and pale gold smiling seahorse, curled tail | Transparent, 1000px+ |
| `baby-waving.webp` | Generic 1-year-old boy illustration, blue ocean-themed outfit | Transparent, 1200px+ |
| `baby-starfish.webp` | Same generic baby-boy design interacting with starfish | Transparent, 1200px+ |
| `baby-seahorse.webp` | Same generic baby-boy design with seahorse | Transparent, 1200px+ |
| `baby-whale.webp` | Same generic baby-boy design sitting safely with smiling whale | Transparent, 1600px+ |
| `baby-cake.webp` | Same generic baby-boy design beside first-birthday cake with number 1 | Transparent, 1600px+ |
| `coral-left.webp` | Asymmetric coral, shells, sea plants composition for left edge | Transparent, 1000px+ |
| `coral-right.webp` | Distinct coral arrangement for right edge; NOT mirrored repetition | Transparent, 1000px+ |
| `shell-card.webp` | Soft pearlescent seashell frame/surface, minimal detail in text area | Transparent, 1200px+ |
| `treasure-chest.webp` | Open cheerful treasure chest, soft golden glow, no text | Transparent, 1400px+ |
| `ocean-backdrop-desktop.webp` | Subtle distant ocean light shafts, gradients and soft reef, clear center | Wide background, 1920px+ |
| `ocean-backdrop-mobile.webp` | Simplified, vertically composed ocean background with empty text-safe center | Portrait, 900px+ |
| `memory-placeholder-01.webp` through `06.webp` | Six **distinct** consistent ocean birthday illustrations used until real photographs are supplied | 4:5 or 1:1, 1000px+ each |

**Carousel requirement:** The six generated placeholders must be visually distinct and clearly marked as illustrations, not presented as real photographs of the child. Preserve an easy swap-in mechanism for real images later.

**Consistency process:** Generate a character reference sheet first if supported, then reuse it as reference for individual scenes. Keep baby hair, outfit, proportions, palette, and face consistent. When a real photo is provided, request explicit confirmation before using it as a likeness reference.

**Asset optimization:** Prefer WebP/AVIF for photo-like art; use PNG/WebP with alpha where supported. Keep original source exports separate if necessary. Use descriptive filenames, explicit dimensions/aspect ratios, responsive `srcSet` where useful, and lazy-load below-the-fold images. Never stretch or crop faces.

### 2.3 Fallback if image generation is unavailable

Produce `IMAGE_GENERATION_PROMPTS.md` containing one complete prompt per missing asset, aspect ratio, transparency, intended section, and suggested filename. Report clearly that actual asset creation remains pending. Build layout with existing images or neutral temporary placeholders only after user approval; never claim to have generated assets.

## 3. Section-by-section design specification

### 3.1 Header / navigation

- Minimal sticky or static header according to existing layout; no sea creature or decorative image in header.
- Clear brand/title text, compact links to existing sections, visible RSVP CTA.
- Mobile accessible menu with close behavior, focus management, and keyboard support.
- Ensure no content is hidden under a sticky header; use scroll-margin for anchors.
- Use translucent or solid contrast-safe background, not a heavy glass effect that reduces readability.

### 3.2 Hero — magical first impression

**Desktop:** Two-column composition: headline/event introduction and CTA on one side, smiling whale and generic baby illustration on the other. A large decorative numeral “1” may appear only if the actual age is one; use real HTML text for important headings. Use light rays and coral at the edges, never behind body copy.

**Mobile:** Stack headline, short introduction, CTA, then scaled illustration; maintain visible above-the-fold information. Avoid giant fixed-height hero and image overflow.

**Motion:** Whale floats vertically ~6–10px over 5–8 seconds; occasional bubbles rise independently, without accumulating DOM nodes or accelerating over time. Respect reduced motion.

**Explicit removal:** Delete `.hero::before`; use a controlled background layer or CSS background on the hero container instead, with no overlay blocking pointer interactions.

**Primary action:** “RSVP Now” scrolls/focuses the actual RSVP section; preserve current routing if different.

### 3.3 Countdown

- Four pearl or seashell-like counters for days, hours, minutes, seconds.
- Use existing event date and event timezone; do not hardcode a sample date.
- Correctly handle expiration (e.g., event started / celebration underway), cleanup intervals, and hydration if relevant.
- Accessible labels and readable numbers; do not announce every second to screen readers.
- On narrow screens, 2x2 grid if four-across becomes cramped.

### 3.4 Invitation / welcome

- Warm headline, concise invitation message, one starfish or seahorse accent, generous whitespace.
- Text sits on calm cream/aqua surface; decorative images anchored to the edges and not repeated.
- Optional entrance animation: fade/translate on first viewport entry, one time only.

### 3.5 Event details

- Three seashell-inspired cards: Date, Venue, Time, populated from existing event data.
- Use semantic HTML, accessible icons, and clear labels; cards must remain readable even without image assets.
- Do not invent addresses or link destinations. Only show map/directions CTA if the project has a valid destination.
- Desktop: 3 columns; tablet: adaptable; mobile: single column or sensible 2+1 layout.
- Cards should have consistent internal padding, subtle elevation, and visible text contrast.

### 3.6 Little Ocean Explorer / memory gallery

- New **4–6 image** carousel (initially use six generated illustration placeholders unless existing actual photos are available).
- Autoplay interval: 5 seconds; manual previous/next arrows, pagination indicators, touch swipe, keyboard controls, and clear accessible slide labels.
- Pause on hover and focus, when tab/page is hidden, and when reduced motion is preferred; provide an explicit pause/play control.
- Manual interaction resets autoplay timer; never create duplicate intervals or event listeners.
- Avoid layout shift: use a consistent aspect-ratio frame and responsive `object-fit`.
- Desktop: prominent central slide with restrained neighboring previews only if readable; mobile: one slide per view.
- Do not silently replace user photographs with AI-generated illustrations.

### 3.7 RSVP form

- Keep all **existing** fields, conditional logic, validation, guest limits, API endpoints, success/error responses, and submission semantics.
- Present form in a cream pearlescent card with subtle seashell outline; no busy illustration directly behind input labels.
- Clear labels, helpful descriptions, required indicators, inline errors, loading/disabled state, and error recovery.
- Submit button is a prominent ocean-teal pill, but ensure 44px+ target and keyboard focus visibility.
- Decorative baby/starfish/seahorse illustration may sit beside the form on desktop and below/above it on mobile without obscuring fields.
- Keep existing Sanctum session/CSRF handling and secure API client unchanged.
- Prevent accidental double submissions and retain typed values when requests fail.

### 3.8 RSVP success / celebration

- On **confirmed server success only**, show a brief celebratory treasure-chest reveal, friendly message, and existing confirmation information.
- No false success animation before API confirmation.
- Animation lasts roughly 1–2 seconds, with optional light particles; no full-screen blocking overlay or excessive motion.
- Offer a static accessible confirmation under reduced-motion settings.
- Preserve existing duplicate RSVP behavior and server responses.

### 3.9 Footer

- Minimal typography and useful existing links only.
- **No whale, starfish, seahorse, seaweed, coral, or background image in footer.**
- Clear contrast and enough space for mobile safe-area insets.

## 4. Motion and interaction system

Use CSS transitions/keyframes for simple movement; use existing animation libraries only if already installed and justified. Avoid unnecessary dependencies.

| Interaction | Suggested behavior | Guardrail |
|---|---|---|
| Whale idle | 6–10px float, 5–8s ease-in-out | transform-only, no layout reflow |
| Starfish | slight rotate on hover/tap | no continuous spinning |
| Seahorse | short drift on section entry | avoid constant crossing over text |
| Bubbles | sparse, staggered float | cap count; cleanup; no acceleration |
| Cards | 2–4px hover lift | keyboard focus equally clear |
| Scroll reveal | opacity + translateY ~12–20px | once; reduced-motion fallback |
| Carousel | 400–650ms slide/crossfade | no autoplay when paused/hidden |
| RSVP success | subtle treasure chest glow | only after API success |

**Performance constraints:** Avoid animating `top/left`, heavy filters, huge box-shadows, and multiple full-screen parallax layers. Never use unbounded timers or repeated RAF loops. Respect `prefers-reduced-motion: reduce`.

## 5. React and Tailwind implementation guidance

- Discover existing component organization first. Suggested *logical* components only (do not force renames): `HeroSection`, `Countdown`, `InvitationSection`, `EventDetails`, `MemoriesCarousel`, `RsvpForm`, `RsvpSuccess`, `SiteHeader`, `SiteFooter`.
- Keep presentation separate from API/domain logic. Do not rewrite RSVP submission hooks/services merely for appearance.
- Centralize design tokens; prefer existing Tailwind utilities and small reusable styles.
- Use real `<img>` with meaningful alt text for content images and empty alt for decorative art; hide purely decorative animated layers from assistive technology.
- Ensure semantic headings, logical tab order, visible focus, keyboard carousel/menu interaction, accessible error association, and reduced-motion support.
- If React Strict Mode is active, effects and timers must clean up correctly; ensure carousel/bubbles do not speed up after navigation or rerenders.
- Preserve existing lint/build scripts and use them after each stage.

## 6. Responsive specifications

Test at **320, 375, 390, 768, 1024, 1440px** and at least one landscape mobile viewport.

| Width | Layout expectation |
|---|---|
| 320px | no clipping, no horizontal scroll, compact hero, single-column cards, accessible controls |
| 375–390px | mobile storybook layout, one gallery slide, contained decorative art |
| 768px | balanced tablet spacing; 1–2 columns as content permits |
| 1024px | transition to spacious desktop sections without awkward gaps |
| 1440px | constrained content width, strong hierarchy, intentional whitespace |

Check zoom to 200%, long names/labels, slow image loading, keyboard-only use, and touch targets. Never hide essential event/RSVP information on mobile.

## 7. Delivery phases and approval gates

### Phase A — Audit and plan (NO CODE CHANGES)

- [x] Inspect actual repository structure and assets.
- [x] Record existing components, styles, and API dependencies.
- [ ] Take baseline screenshots of current desktop and mobile layouts if browser tools are available. Unavailable during Phase A; verified original source backups were used. Current screenshots are available.
- [x] Compare current layout with the generated concept board.
- [x] Identify existing visual assets that can be reused.
- [x] Report risks, unanswered content questions, and proposed file changes.
- [x] Ask for approval before implementing. Received; user subsequently authorized continuing all phases.

### Phase B — Generate/prepare assets

- [x] Confirm whether a real image-generation tool is available.
- [x] Generate separate, consistent original character and background assets (or produce prompts if unavailable). Exactly 10 generated; existing four carousel illustrations reused.
- [x] Optimize/export images into the correct assets directory.
- [x] Create an asset manifest with filename, dimensions, intended usage, and status.
- [x] Verify alpha edges, image quality, and visual consistency. Export alpha is preserved exactly; size/glow limitations are documented in the asset manifest.

### Phase C — Design foundation

- [x] Introduce/align color, typography, spacing, and elevation tokens.
- [x] Set global layout container and responsive rules.
- [x] Ensure readability and remove accidental horizontal overflow.
- [x] Keep header/footer minimal.

### Phase D — Hero and countdown

- [x] Remove `.hero::before` safely. Already absent at audit; remains absent.
- [x] Redesign hero to match visual concept.
- [x] Integrate whale/baby imagery without covering text.
- [x] Polish responsive countdown. Current sample target: January 9, 2027, 10 AM Asia/Manila.
- [x] Test desktop/mobile and reduced motion.

### Phase E — Invitation and event details

- [x] Redesign welcome section with unique creature accent.
- [x] Build seashell-like information cards.
- [x] Verify event data remains accurate and accessible. Two sample venues/schedules retained under All the little details; duplicate Find Your Way section removed as requested. API events retain their original data contract.

### Phase F — Gallery carousel

- [x] Add 4–6 slide carousel with auto-next every 5s.
- [x] Implement arrows, dots, pause/play, swipe, keyboard support.
- [x] Verify timer cleanup, hidden-tab pause, reduced motion, and image loading. Visibility pause checked through simulated document state; true background-tab/device verification remains pending.

### Phase G — RSVP form and success

- [x] Restyle form without changing its API contract or security.
- [x] Confirm validation, errors, loading, duplicate-submit protection through intercepted mock API responses.
- [x] Add celebration animation only after confirmed submission. Source guard and mocked successful/failed responses verified; real local Laravel submission and repeat-response persistence also passed against isolated SQLite. Production remains unverified.
- [x] Regression-test guest flows and existing admin flows if shared code changes. Mocked public/private and admin-preview paths passed.

### Phase H — Final QA

- [x] Follow-up Birthday Party divider alignment verified at all six required widths. Shared content-driven subgrid rows give 0px at-rest divider difference at 1024/1440px; narrower layouts retain consistent stacked spacing and border styling. Final invitation, landing, countdown, and alignment checks rerun successfully; screenshots/report refreshed.

- [x] Run available lint/typecheck/build/tests. Build/typecheck and tests pass; no lint script exists.
- [x] Verify all target breakpoints and no horizontal overflow.
- [x] Check color contrast, keyboard navigation, focus order, alt text. Solid-color/manual/browser checks completed; automated accessibility scan was not run because its optional installation was declined.
- [ ] Check low-end mobile performance and no runaway animations. Bounded animations and interactions passed a 4x CPU-throttled Edge simulation; physical low-end-device profiling remains pending.
- [x] Compare screenshots with design reference.
- [x] Document changed files, generated assets, tests, and known limitations.

## 8. Acceptance criteria — definition of done

The redesign is complete **only when**:

1. The website visually follows the reference's pastel underwater storybook direction while preserving its existing identity.
2. Each section has a clear focal point and text is readable without relying on overlays.
3. `.hero::before` is gone and the hero still works.
4. No decorative images are added to the header/footer; seaweed is not repeated as a tiled motif.
5. Required original illustrations are actually generated/imported **or explicitly reported as pending**; no fake file claims.
6. Carousel contains 4–6 slides and auto-advances correctly without accelerated timers; all manual/accessibility controls work.
7. RSVP and authentication remain functional, secure, and consistent with existing Laravel contracts.
8. Success feedback appears only after a real successful RSVP response.
9. No overflow/clipping at 320, 375, 390, 768, 1024, or 1440px.
10. Reduced-motion users receive a complete, usable experience.
11. No unapproved backend changes or unrelated refactors are introduced.
12. A final changelog and QA summary are provided.
13. A verified restore point and `REDESIGN_ROLLBACK_LOG.md` exist, and I can reject any phase or revert the entire redesign without losing unrelated work.

## 9. Mandatory backup, preview, approval, and rollback protocol

**User requirement:** I may dislike any redesigned section or the entire redesign. The coding assistant **must be able to revert to the original design on request**, without damaging the application or losing unrelated work.

### Before changing any file

1. Check whether this project uses Git (`git status --short`, current branch, current commit). Do not assume a clean working tree.
2. List all existing modified and untracked files. **Never overwrite, discard, reset, or commit my pre-existing uncommitted changes without my permission.** Never include `.env`, secrets, `node_modules`, build outputs, or credentials in backup commits.
3. Propose a safe restore point and get approval before proceeding. Prefer a dedicated `redesign/underwater-rsvp` branch and a verified baseline commit **only if** it can be created without accidentally including pre-existing work. Otherwise create an isolated worktree or a timestamped backup of only the files to be edited, with a manifest and SHA-256 hashes, outside the project source tree. Do not claim a backup exists until its contents and restore process are verified.
4. Record the baseline commit/branch or backup location, a list of affected files, and exact restoration instructions in `REDESIGN_ROLLBACK_LOG.md`. Avoid recording sensitive file contents.
5. Save a baseline screenshot at desktop and mobile widths when a browser/screenshot tool is available. Record what could not be captured.

### For every redesign phase

1. Implement only the approved phase. Keep changes small and reviewable.
2. Record modified/created/deleted files, newly generated image assets, and relevant dependencies in the rollback log.
3. Run available build/lint/tests and visually inspect responsive layouts.
4. Show me a before/after summary and request approval before starting the next phase.
5. If I say **"revert," "undo this design," "restore the original," or "I don't like it,"** ask only when the rollback scope is unclear (current section versus all redesign changes). Otherwise restore the requested scope immediately using the verified baseline and phase log.

### Safe rollback rules

- **Never use destructive blanket commands** such as `git reset --hard`, `git clean -fd`, or forced checkout of the entire working tree.
- Revert only the files and changes introduced by the selected redesign phase. Preserve any pre-existing modifications and unrelated work made after the baseline; inspect diffs and ask before resolving conflicts.
- Remove newly generated images/components/dependencies only when they were introduced solely by the reverted phase and are not used elsewhere.
- Do not roll back legitimate RSVP submissions, database records, Laravel backend changes, or authentication state. The redesign is frontend-only.
- After restoring, rerun relevant checks and compare the restored UI against the baseline screenshots where available.
- Report exactly what was restored, what remains changed, and any conflicts requiring my decision.

### Approval checkpoints

- **Approve design:** retain the current phase and proceed when requested.
- **Request changes:** revise only the current phase, keeping the restore point intact.
- **Revert current phase:** restore the preceding approved design.
- **Revert entire redesign:** restore the verified pre-redesign frontend baseline, preserving unrelated changes.

**Definition of rollback success:** The selected frontend design returns to its prior appearance and behavior, RSVP integration still works, and no unrelated user changes are lost.

## 10. Ready-to-run instruction for GPT-6.1 Sol Light


> Read `UNDERWATER_RSVP_FRONTEND_REDESIGN_PLAN.md` completely and inspect my existing frontend repository. Act as a senior frontend engineer and UI/UX creative director. Use the provided underwater concept board as the **visual reference**, not as an image to paste into the webpage. **First establish and verify a safe, non-destructive rollback strategy under Section 9, without discarding existing work. Start with Phase A only**: inventory the current components, CSS, images, API integration, and responsiveness; produce a concrete file-by-file implementation proposal and list any missing assets. Do not modify code yet. After I approve, execute one phase at a time and validate each phase before continuing. Generate the original image assets using an actual image-generation tool if available; otherwise provide individual production-ready prompts and clearly identify that generation is pending. Preserve existing tokens, Laravel Sanctum cookie/CSRF behavior, routes, RSVP logic, and event data. Remove `.hero::before` during the approved hero phase. Never claim to have created assets or tested functionality unless you actually did so.

---

**Scope note:** This document is a plan based on the supplied design concept and conversation requirements. It is not a source-code audit; adapt component names and exact implementation steps after inspecting the user's current frontend.

### Local integration QA follow-through (2026-10-18)

- [x] Existing Laravel suite: 17 tests, 92 assertions, isolated in-memory SQLite.
- [x] Seven real HTTP browser checks: login/session/CSRF, event publication, RSVP persistence/update, guest authorization, cleanup, and logout against disposable SQLite fixtures.
- [ ] Production deployment/MySQL and physical-device/cross-browser/assistive-technology validation remain pending; see REDESIGN_QA_REPORT.md for precise limits. No further image generation or dependency installation.
