# Under the Sea RSVP — Frontend Enhancement Plan (v2)

> **Purpose:** Implement an interactive, mobile-responsive enhancement of the **existing** RSVP website. This is an implementation specification for Codex / GitHub Copilot Agent, based on inspection of the uploaded `frontend(1).zip`. **Do not rebuild the application, alter its business logic, or replace its visual identity.**

## 1. Verified current project architecture

- React **19** + TypeScript (`.tsx`), Vite **6**, Tailwind CSS **4** via `@tailwindcss/vite`, with substantial custom CSS in `src/styles.css`.
- `src/App.tsx` routes `/admin` to `AdminApp` and public pages to `InvitationExperience`.
- `src/InvitationExperience.tsx` renders the underwater landing/reveal experience, including `ocean-background.jpg`, floating landing bubbles, and transition into `InvitationPage`.
- `src/InvitationPage.tsx` renders the public invitation, including navigation, hero, welcome, countdown, details, existing event gallery, venue, RSVP, and footer.
- `src/BubbleField.tsx` implements animated page bubbles and RSVP bubble bursts; review and reuse rather than replacing.
- `src/api.ts` owns API requests, CSRF cookie handling, and session credentials.
- `src/AdminApp.tsx`, `src/EventEditor.tsx`, and `src/types.ts` support existing admin/event management.
- `src/assets/images/` contains: `bluewhale.png`, `calm.png`, `castle.png`, `corals.png`, `crab.png`, `green-turtle.png`, `jelly-fish.png`, `ocean-background.jpg`, `octopus.png`, `seahorse.png`, `starfish.png`, `treasure.png`.
- **No baby photos are included in the inspected ZIP.** Do not invent image paths that already exist or use unrelated stock images.
- Existing scripts in `package.json`: `npm run dev`, `npm run build`, `npm run preview`. No lint/test scripts were identified in this package manifest.

## 2. Non-negotiable preservation requirements

1. Preserve the existing watercolor/pastel underwater visual identity, ocean background, color palette, serif/sans typography, invitation landing/reveal flow, existing card layouts, and general section order. Improve polish without redesigning from scratch.
2. Preserve public invitation loading via the URL `?invite=` token and the existing slug-based event route. **Never drop, overwrite, regenerate, expose in logs, or repurpose the invitation token.** Maintain the token when navigating within the invitation.
3. Preserve the existing invitation-specific RSVP endpoint `/api/invitations/{encodedInvitationToken}/rsvp` and public slug endpoint `/api/events/{encodedPublicSlug}/rsvps`, and their current conditional selection.
4. Preserve the existing public `response_key` idempotency/returning-response behavior (`localStorage` key `rsvp-response:${event.public_slug}`); **this response key is not an admin Bearer token**. Do not clear, rename, or replace it. Do not change its generation or storage logic.
5. Preserve `src/api.ts` session authentication: CSRF cookie bootstrap, `XSRF-TOKEN` / `X-XSRF-TOKEN`, and `fetch` with `credentials: 'include'`. Do not move admin credentials to localStorage or introduce Bearer-token auth.
6. Preserve all existing API request/response contracts, form fields, validation, disabled preview/sample mode, admin authentication, admin dashboard, event editing, and RSVP submission/confirmation.
7. Preserve `event.cover_image_url` and `event.gallery_urls` functionality; the new baby carousel must be **independent** of existing event gallery behavior unless a future explicit product decision changes that.
8. Do not edit backend code, database schemas, environment variables, or auth configuration. Do not print secrets or token values in output.
9. Do not change links to `/` or `/admin` without checking routing implications. Preserve published invitation link behavior.

## 3. Targeted CSS cleanup: REMOVE `.hero::before` completely

**File:** `src/styles.css`

The inspected stylesheet contains these relevant selectors:
- Base: `.hero::before, .hero::after { ... }` and `.hero::after { ... }` near the beginning.
- Mobile: `.hero::before { ... }` and `.hero::after { ... }` in a `max-width: 600px` media query.
- Invitation overrides: `.invitation .hero::before, .invitation .hero::after { ... }` in more than one later block.

Implementation:
1. Remove every `.hero::before` selector, including selectors prefixed by `.invitation`, and any dedicated declarations exclusively supporting it.
2. Split combined `::before, ::after` rules and retain the `::after` declarations **only if** they are necessary for the current design. Ensure `::after` has its own `content`, positioning, dimensions, and border properties after the split. The goal is to remove only the `::before` decorative ring, not accidentally erase the remaining visual style.
3. Do not reintroduce the removed ring through a renamed pseudo-element, extra DOM node, or background overlay.
4. Do **not** remove unrelated `.landing-scene::before` or `.bubble::after` rules; these are different effects.
5. Check all cascade overrides, mobile media queries, and `.hero-photo` behavior. Confirm cover image backgrounds, heading, and CTA still display correctly.
6. Final static search: no `.hero::before` or `.invitation .hero::before` selectors anywhere in frontend source.

## 4. Proposed page experience and sections

Keep the existing flow, with **one new section** inserted after the welcome/countdown area and before the event details, or another position justified by actual layout testing:

1. **Landing / reveal** (`InvitationExperience.tsx`): preserve opening invitation card, wave effects, background, and reveal behavior. Enhance button hover/focus, maintain motion-reduced behavior.
2. **Hero** (`InvitationPage.tsx`): preserve current typography, event title/date, background image fallback, and RSVP CTA; remove `.hero::before`; optionally add *subtle* entrance transitions without affecting content visibility.
3. **Welcome**: preserve message and existing whale/jellyfish decoration; use small, controlled motion only where it does not obstruct text.
4. **Countdown**: retain existing real event date/time logic; improve number transitions subtly if accessible, without rebuilding timer or creating extra intervals.
5. **NEW: Baby moments carousel**: heading such as **“Our Little Ocean Star”**; auto-advancing 4–6 baby photos when supplied; empty state now.
6. **Event details / existing event gallery**: preserve event date, time, venue, cover photo, and `gallery_urls` display. Keep existing turtle placement unless it causes mobile overlap.
7. **Venue / directions**: preserve map and directions links, content, and button behavior.
8. **RSVP**: preserve all fields, validation, request payload, success/error state, and bubble burst triggered **only after actual backend success**.
9. **Header and footer**: clean, text-only; **no decorative illustrations in either**. Preserve brand and navigation functionality.

## 5. New baby photo carousel: complete specification

**Create:** `src/components/BabyPhotoCarousel.tsx` (or adapt to existing folder conventions) and a scoped CSS module or section in `src/styles.css`.

**Images:** Reserve `src/assets/images/baby/` for 4–6 baby photos. No baby photos currently exist in the archive.

**Phase A: before images exist**
- Implement the reusable component and section layout now.
- Use a friendly, polished empty state: “Sweet memories coming soon” (or equivalent) without fake photos, broken images, blank sliders, or external stock photography.
- Hide carousel arrows/dots/autoplay when there are 0 or 1 images. Do not generate fake slide URLs.
- Do not ship imports to nonexistent `baby1.jpg` etc. because that would break the build.
- Optionally support a typed array of imported photos once files are added. If using `import.meta.glob`, verify Vite compatibility and use an explicit deterministic sort, e.g., numeric filename ordering; do not rely on arbitrary object enumeration. Make no assumptions about naming or file extensions.

**Phase B: when 4–6 real photos are provided**
- Show one primary photo per slide, aspect-ratio controlled with `object-fit: cover` and a configurable focal position to protect faces.
- Autoplay: **advance every 5 seconds**. Use one interval/timer only; clean up on unmount and when dependencies change. Never stack intervals or accelerate over time.
- Infinite wrap: last -> first, first <- last.
- Accessible Previous/Next buttons, active pagination dots, keyboard support, and touch swipe navigation.
- Pause autoplay on pointer hover, keyboard focus, tab hidden, and during swipe/manual interaction; resume after a sensible inactivity delay or when interaction ends. Do not autoplay when `prefers-reduced-motion: reduce`.
- Support keyboard focus, descriptive accessible labels, and meaningful alt text per photo. Announce slide changes only for **manual** navigation; avoid noisy live announcements for autoplay.
- Add optional subtle fade/slide transitions (around 350–600 ms) with stable layout and no motion-induced jank.
- Responsive: one full photo on narrow phones, optional adjacent previews on wider screens if visually consistent with existing layout; controls must remain reachable and at least ~44px touch targets.
- Use `loading="lazy"` for below-fold photos, appropriate `decoding`, and no image distortion. Avoid loading every full-resolution photo eagerly.
- Ensure the new gallery does not conflict with existing `.gallery` styles or `event.gallery_urls` and has scoped class names such as `.baby-carousel`.
- Do not create a backend uploader or alter the database for baby photos as part of this frontend-only task.

## 6. Interactivity: restrained underwater storytelling

- Keep `BubbleField.tsx` as the existing source of page bubbles; audit for timer/animation-frame cleanup and any accidental acceleration. **Do not add a second full-page bubble system.**
- Enhance existing buttons/cards with gentle hover, focus-visible, and active feedback; ensure hover-only effects are not required on touch devices.
- Use Intersection Observer for section entrance reveal (opacity + translateY) with proper cleanup and a no-JavaScript/reduced-motion visible fallback. No content should stay invisible if observation fails.
- Gentle whale/jellyfish/turtle movement only where images already exist; no crowded animation layers or text obstruction.
- Keep countdown functioning with current event data; avoid duplicate timers.
- RSVP submission should show loading state, prevent repeated clicks, and preserve real server errors/success messages; preserve current response key and invitation token handling.
- Maintain smooth in-page scrolling and functional anchor targets; account for any sticky navigation if present.
- **Seaweed must not repeat:** no repeated seaweed image across sections, no CSS `background-repeat` for seaweed. The inspected archive does not contain a dedicated seaweed file, so **do not fabricate one**. If a seaweed asset is added later, allow it in one designated section only.
- No decorative images in header or footer.

## 7. Typography, color contrast, and accessibility

- Keep current fonts and ocean palette, adjusting only where necessary for legibility.
- All headings, body copy, dates, countdown numbers, RSVP labels, placeholders, help/error messages, and buttons must remain readable against their section backgrounds; target WCAG AA contrast (4.5:1 normal text, 3:1 large text).
- Preserve heading hierarchy and meaningful landmark labels; avoid adding decorative text as heading tags.
- Do not position artwork above text or interactive controls; manage z-index and `pointer-events: none` on decorations.
- Add visible keyboard focus indicators; keep form errors associated with relevant controls where feasible.
- Respect `prefers-reduced-motion` for floating creatures, bubbles, section reveals, carousel transitions, and autoplay.

## 8. Responsive implementation requirements

Verify at widths **320, 360, 375, 390, 430, 768, 1024, 1280, 1440 px** and relevant heights.

- No horizontal scrolling or content clipping; avoid fixed-width decorations extending the viewport.
- Use responsive type (`clamp`) and sufficient spacing; headings must wrap naturally.
- Keep image aspect ratio and prevent stretching, overflow, or overlap with text/buttons.
- On mobile, simplify or hide **nonessential** artwork while retaining core ocean identity and the baby carousel.
- Check the existing CSS rules that hide `.underwater-art` at `max-width: 600px` and whale/jellyfish at `max-width: 1000px`; preserve their mobile safety or improve with carefully tested placement, never force clutter.
- The carousel should be finger-friendly, no accidental page-wide horizontal swipe or scroll traps.
- Keep header/footer free of images at every breakpoint.

## 9. File-by-file implementation map

| File | Planned change | Risk / preservation |
| --- | --- | --- |
| `src/styles.css` | Remove **all** hero `::before` selectors; add scoped carousel/reveal/responsive styles; tune contrast | Preserve existing `::after`, landing-scene `::before`, theme and admin styles |
| `src/InvitationPage.tsx` | Insert baby carousel section; small optional interaction/accessibility refinements | Preserve invitation token, response key, API payload, RSVP form, cover and existing gallery |
| `src/components/BabyPhotoCarousel.tsx` | New typed, accessible carousel with empty state and 5-second autoplay | No nonexistent image imports; cleanup timers |
| `src/InvitationExperience.tsx` | Optional subtle landing interaction polish | Preserve reveal state, transition and ocean background |
| `src/BubbleField.tsx` | Review existing animations for stability and reduced-motion behavior | Avoid replacing logic or duplicate bubble effects |
| `src/api.ts` | **No changes expected** | Preserve CSRF/cookies/auth |
| `src/App.tsx`, `src/AdminApp.tsx`, `src/EventEditor.tsx`, `src/types.ts` | **No changes expected** unless strictly necessary and explained | Preserve routing/admin/event management |
| `src/assets/images/baby/` | Reserved for future real baby photos | No stock or fabricated images |

## 10. Implementation phases for the coding agent

### Phase 0 — Safeguard and audit
- Read all relevant files and `package.json` in the actual working tree; confirm they match the ZIP snapshot before applying changes.
- Check `git status` and recommend a commit/backup before editing. Do not overwrite unrelated uncommitted changes.
- Identify exact hero pseudo-element rules and relevant RSVP/token/auth paths.

### Phase 1 — Surgical hero cleanup
- Remove all `.hero::before` selectors; preserve hero design and correct `::after` behavior.
- Verify invitation hero on mobile and with optional cover photo.

### Phase 2 — Carousel section
- Add reusable carousel with zero-image empty state, typed image configuration, and 4–6 image support once assets arrive.
- Add scoped styling and insert section into public invitation only, including preview/sample handling.

### Phase 3 — Interactive polish
- Add modest scroll reveals, hover/focus treatments, and restrained existing-art animations.
- Avoid extra bubble pools and interval leaks.

### Phase 4 — Responsive and accessibility pass
- Check all target viewport widths, typography contrast, focus order, swipe behavior, reduced motion, and image boundaries.

### Phase 5 — Verification and handoff
- Run `npm run build` (runs TypeScript compiler + Vite build); fix introduced build/type errors.
- If no lint/test scripts exist, **do not claim they ran**; report their absence.
- Test invitation via token link and slug link, sample/preview behavior, event cover image, existing gallery, RSVP attending/declining paths, server error handling, success bubble burst, admin login/session, and carousel empty/photo states where test assets are available.
- Verify no CSS selector matching `.hero::before` remains.
- Summarize changed files, tested behaviors, remaining limitations, and exactly how to add baby images later.

## 11. Acceptance checklist

- [ ] Existing underwater styling, landing/reveal, and event layout are recognizable and intact.
- [ ] `.hero::before` is completely absent, including combined selectors and mobile overrides.
- [ ] Hero title, CTA, background, and optional event cover photo still work.
- [ ] New baby carousel section exists and renders gracefully with **zero** current photos.
- [ ] Adding 4–6 actual photos enables 5-second auto-next, wrapping, controls, dots, swipe, and pause behavior.
- [ ] Carousel autoplay has no timer stacking or acceleration and respects reduced motion.
- [ ] Existing event gallery still works separately.
- [ ] All invitation token / response key / Sanctum CSRF-cookie behavior is preserved.
- [ ] RSVP submission still uses the existing endpoints and backend-confirmed success.
- [ ] No repeating seaweed and no decorative images in header/footer.
- [ ] Text is readable; no artwork overlaps controls; responsive at all target widths.
- [ ] TypeScript + Vite build passes; any untested items are reported explicitly.

## 12. Ready-to-paste Codex / Copilot execution prompt

> Read `underwater_rsvp_redesign_v2.md` completely and inspect the existing frontend source before editing. Implement its phases directly in the existing React 19 + TypeScript + Vite + Tailwind 4 project. Preserve the current underwater design, invitation reveal, Laravel API integration, cookie-based Sanctum auth, `?invite=` token, and RSVP `response_key` behavior. Surgically remove every `.hero::before` CSS selector, including combined and mobile rules, without breaking `.hero::after` or unrelated pseudo-elements. Add an accessible, responsive 4–6 photo baby carousel with automatic next every 5 seconds, manual controls, swipe, pause behavior, and a beautiful empty state because no baby photos exist yet. Do not use fake photos or nonexistent imports. Keep seaweed non-repeating, header/footer image-free, text readable, and animations restrained. Implement in phases, run `npm run build`, verify responsive and token/RSVP behavior, and report all changed files and remaining manual steps. Do not rebuild the app or modify backend/auth contracts.
