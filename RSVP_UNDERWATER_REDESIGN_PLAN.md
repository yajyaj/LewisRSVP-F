# RSVP Underwater Redesign Plan
## React + TypeScript + Vite — visual redesign only

> **Primary instruction for Copilot:** Follow this plan before editing code. The goal is to give the existing RSVP frontend a fresh, cohesive underwater storybook design while preserving the current landing page, wave reveal, bubbles, all RSVP behavior, and the admin experience. Use small, targeted changes to conserve Copilot Free usage.

## 1. Project facts confirmed from the repository

- Frontend root: `frontend/`
- Stack: React 19, TypeScript 6, Vite 6, Tailwind CSS 4 (`@tailwindcss/vite`).
- Main entry: `src/main.tsx` → `src/App.tsx`.
- Public invitation flow: `src/App.tsx` → `src/InvitationExperience.tsx` → `src/InvitationPage.tsx`.
- Admin routes are selected in `src/App.tsx` when the pathname starts with `/admin`.
- Existing bubble implementation: `src/BubbleField.tsx`; it is rendered by `InvitationPage.tsx`.
- Global styles, including the landing, wave, bubble, invitation, and admin styles: `src/styles.css`.
- Existing landing and wave state/behavior: `src/InvitationExperience.tsx`.
- Event and RSVP API calls/types: `src/api.ts` and `src/types.ts`.
- Available local artwork in `src/assets/images/`:
  - `ocean-background.jpg`
  - `bluewhale.jpg`
  - `crab.jpg`
  - `green-turtle.jpg`
  - `jelly-fish.jpg`
- `src/assets/images/ocean-background.jpg` is currently imported by `InvitationExperience.tsx` for the landing background. The four animal images should be inspected and reused in the invitation page where they fit.
- The project already contains `.github/rsvp-redesign.prompt.md` and `.github/RSVP_BUBBLE_WAVE_COPILOT_PLAN.md`. Read this plan alongside them. This plan adds a full visual refresh to the existing invitation content; it does **not** authorize rebuilding the app or replacing the existing effects implementation.

## 2. Design direction: “Pastel Underwater Storybook”

Create a polished, friendly, hand-painted ocean invitation. It should feel like a layered watercolor storybook, not a generic dashboard or a flat blue template.

### Visual system

- **Backgrounds:** pale sea-glass, soft aqua, misty sky blue, and warm ivory. Use subtle gradients and the existing ocean background image where suitable.
- **Primary colors:** ocean blue and muted indigo/periwinkle.
- **Accent colors:** pastel coral/peach, lavender, seafoam, and a small amount of sandy cream.
- **Cards:** generous rounded corners, thin translucent borders, soft blue-tinted shadows, and clear spacing. Avoid heavy outlines or overly dark panels.
- **Typography:** keep the existing system/serif fallback stack unless a font is already available locally. Use the serif stack for invitation titles and section headings; use the sans-serif stack for form labels, descriptions, and controls.
- **Decorations:** bubbles, gentle wave curves, small coral/sea-plant accents, and the local sea-animal artwork. Keep all decoration behind text and controls.
- **Overall feel:** warm, playful, calm, readable, and suitable for a family celebration.

### Reuse the local images

Use the existing image assets; do not download new artwork or add image libraries.

- `ocean-background.jpg`: landing backdrop and/or a subtle background texture. Keep text contrast strong with a soft overlay.
- `bluewhale.jpg`: a small decorative illustration near the hero or a later storybook section.
- `green-turtle.jpg`: a decorative accent for event details or the transition between content sections.
- `jelly-fish.jpg`: a light, floating accent near the welcome or gallery area.
- `crab.jpg`: a small accent near the RSVP area or footer.

First inspect the assets’ appearance, dimensions, and crop. Do not assume they are transparent PNG illustrations; they are JPG files and may include their own backgrounds. Use `object-fit`, `object-position`, rounded clipping, and/or a soft frame only when it looks good. Avoid placing an image behind text unless contrast remains accessible. Import assets using the existing Vite asset-import pattern and avoid constructing asset URLs manually.

Use the images selectively. Each image should support the composition, not compete with the event title or RSVP form. Do not force all four animal images into the hero if the visual result becomes crowded.

## 3. Required experience: preserve these elements

### Landing page — keep it

Keep the existing landing-first experience in `InvitationExperience.tsx`:
- Keep the invitation landing screen as the first view.
- Keep the existing “You Are Invited” button label and its mouse, touch, and keyboard behavior.
- Keep the landing text and event flow unless a copy change is explicitly approved.
- Restyle the card, overlay, bubbles, and image composition to match the new underwater storybook design.
- Reuse `ocean-background.jpg`; incorporate the animal artwork only if it improves the landing composition.
- Keep the button’s hover, focus-visible, active, and disabled states.

Do not bypass the landing page, reveal the RSVP automatically, or make the invitation button navigate to another route.

### Wave reveal — keep the existing transition

Preserve the current React-state-driven transition in `InvitationExperience.tsx`:
- Keep the layered water/foam wave reveal and the `wave-sweep` animation.
- Keep the single-activation guard and disabled button while opening.
- Keep the reveal timer/fallback so the page cannot get stuck if an animation event fails.
- Keep the immediate/short reveal behavior for `prefers-reduced-motion`.
- Keep the RSVP content mounted behind the landing screen so event loading/form state is not unnecessarily reset.
- After reveal, preserve scroll-to-top and focus movement to the invitation heading/navigation target.
- Restyle wave colors and timing only as a focused visual adjustment. Do not replace the transition with a new library, route navigation, or a large new animation system.

### Bubbles — keep and refine the current component

Preserve `src/BubbleField.tsx` and its integration in `InvitationPage.tsx`.
- Keep bubbles decorative, behind content, and non-interactive.
- Preserve the full-page behavior, responsive limits, depth variation, burst feedback, cleanup, tab-visibility behavior, and reduced-motion handling already implemented.
- Keep the existing RSVP success/decline burst behavior.
- Refine the bubble color and glow to fit the pastel watercolor palette, but do not rewrite the bubble engine as part of a general styling pass.
- Do not add a second bubble implementation or a second script.
- Do not let bubbles intercept clicks, form inputs, links, or touch scrolling.

Before changing bubble code, inspect its full implementation and compare it with the current CSS. Only change it if the visual redesign reveals a specific defect. A visual refresh should mainly use targeted CSS changes.

## 4. Invitation page redesign

Redesign the public invitation content in `src/InvitationPage.tsx` and `src/styles.css`. Keep the current content order and functionality, but improve the visual hierarchy and underwater storytelling.

### A. Navigation

- Keep the existing `gather.` brand and sample/preview note.
- Use a light, translucent sea-glass navigation surface with readable contrast.
- Preserve the preview “Back to dashboard” action.
- Avoid adding navigation items that do not already exist.

### B. Hero section

- Make the event title the strongest visual element.
- Use a layered ocean gradient or the event’s existing cover image when present.
- Keep the event title, occasion labels, formatted date, and “Kindly reply” anchor exactly connected to the existing event data.
- Use a subtle wave/sea-glass motif and, if composition permits, one local sea-animal image as a decorative accent.
- Do not cover the title or CTA with images or animated elements.
- Preserve the existing dynamic cover-image behavior and overlay for `event.cover_image_url`.

### C. Welcome section

- Present the host welcome message as a calm storybook note on a warm ivory or pale seafoam surface.
- Keep the existing fallback message and exact event-provided text.
- Use comfortable line length and generous vertical spacing.

### D. Event details

- Restyle the date, time, venue, and location cards as a cohesive set of soft, rounded “shell/glass” cards.
- Keep the existing values, date/time formatting, venue, address, and directions/map link behavior.
- Use small icons or local artwork only as supporting decoration; do not replace functional links.
- Make the grid collapse cleanly on mobile.

### E. Cover image and gallery

- Preserve the event’s uploaded cover image and gallery URLs.
- Preserve current image fallback behavior and lightbox interactions, including keyboard behavior, if present.
- Local marine artwork can decorate section edges, but must not replace event-uploaded gallery content.
- Keep image crops responsive and avoid layout shifts when images load.

### F. RSVP form

- Make the RSVP form the clearest, easiest-to-use part of the page.
- Use a high-contrast light card, readable labels, comfortable input spacing, clear selected states, and visible keyboard focus.
- Preserve every current field, name, required/optional status, attendance choice, guest-count behavior, guest-name field, notes, and message field.
- Preserve validation messages, loading/submitting state, success state, error state, and sample/preview warning.
- Do not alter the form handler, request payload, API endpoint, response-key/localStorage behavior, or reset behavior for styling purposes.
- Ensure decorative animals and bubbles never overlap labels, values, buttons, or error messages.

### G. Footer and responsive layout

- Preserve the existing footer copy and links.
- Use gentle wave-like section transitions only if they can be implemented with CSS and do not cause clipping or horizontal overflow.
- Check 320px mobile width, common phone widths, tablet, and desktop.
- Avoid fixed-width layouts and excessive decorative images on small screens.
- Maintain readable contrast and sufficiently large tap targets.

## 5. Files and scope

### Expected files to inspect first

1. `package.json` — confirm available scripts and installed dependencies.
2. `src/main.tsx` and `src/App.tsx` — entry point and route split.
3. `src/InvitationExperience.tsx` — landing, wave transition, reveal state.
4. `src/InvitationPage.tsx` — public event page and RSVP behavior.
5. `src/BubbleField.tsx` — bubble lifecycle and bursts.
6. `src/styles.css` — current design tokens, landing/wave/bubble styles, responsive rules, and admin styles.
7. `src/types.ts` and `src/api.ts` — read only to understand data/API contracts; do not modify for a visual redesign.
8. `src/assets/images/*` — inspect existing image content and usage.

### Expected edit scope

Prefer changing only:
- `src/styles.css` for design tokens, public invitation styling, image placement, and responsive refinements.
- `src/InvitationPage.tsx` only if a small JSX change is necessary to place the local images or add semantic decorative wrappers. Preserve all event and form logic.
- `src/InvitationExperience.tsx` only if a small JSX/style adjustment is necessary for the landing visual design. Preserve the existing state machine and wave event/timer fallback.
- `src/BubbleField.tsx` only if inspection finds a specific visual or behavior bug that cannot be solved with CSS.

Do not create new components/files unless the existing component structure cannot support a clean, maintainable solution. If a new component is necessary, explain why first and keep it narrowly scoped.

Do not edit `AdminApp.tsx`, `EventEditor.tsx`, `api.ts`, `types.ts`, `main.tsx`, Vite configuration, TypeScript configuration, backend files, environment files, or package dependencies unless inspection proves it is required and the user explicitly approves it.

## 6. Non-negotiable preservation rules

This task is a visual redesign, **not a functional rewrite**.

Do not change:
- API routes, HTTP methods, request headers, payload keys/types, or response handling.
- Event/invitation loading, invitation token or slug parsing, or authentication.
- RSVP form field names, attendance status values, guest count limits, validation, and error handling.
- `response_key` creation/storage or the `rsvp-response:*` localStorage key.
- RSVP success/decline state, form reset behavior, or bubble burst trigger/count.
- Event date/time formatting, timezone handling, occasion labels, cover/gallery URLs, or map link.
- Admin routing, login, event creation/editing, event preview, or dashboard behavior.
- Dependencies, package versions, build tooling, or Tailwind version.
- Existing event data by replacing it with hard-coded sample data.

Do not add mock data, fake success messages, `alert()` calls, new API requests, or backend changes. Do not read or print secrets from `.env` files. Do not replace the React app with a static HTML implementation.

## 7. Token-saving workflow for GitHub Copilot Free

Work in short phases and request concise outputs. Do not ask Copilot to explain or print entire files.

### Phase A — Inspection only (no edits)

1. Read this plan and the existing `.github/rsvp-redesign.prompt.md` and `.github/RSVP_BUBBLE_WAVE_COPILOT_PLAN.md`.
2. Inspect only the files listed in Section 5 and the five local image assets.
3. Report:
   - current component/data flow;
   - which assets are suitable and where;
   - exact files proposed for modification;
   - risks to landing, wave, bubbles, RSVP behavior, and admin functionality.
4. Stop and wait for approval. Do not edit any files in this phase.

### Phase B — Minimal visual implementation

After approval:
1. Make a small set of CSS design-token and public-page style changes first.
2. Preview the result and determine whether minimal JSX changes are needed for local images.
3. Restyle the landing page without changing its behavior.
4. Refine wave colors only if needed, keeping the existing animation and fallback.
5. Refine bubble appearance through CSS first; touch `BubbleField.tsx` only for a verified defect.
6. Make mobile and focus-state refinements.
7. Do not rewrite entire files. Show a compact diff summary after each batch.

### Phase C — Verify

Run the existing project build from `frontend/` using the script actually present in `package.json` (`npm run build`, which runs TypeScript checking and Vite build). Do not invent lint or test commands that are not configured.

Verify as much as the available environment permits:
- Landing page is still the first screen.
- “You Are Invited” still triggers the wave and reveals the existing invitation.
- Transition cannot be activated repeatedly and reduced-motion mode reveals promptly.
- Bubbles remain behind the page content and do not block controls.
- All existing RSVP fields, labels, and attendance options remain.
- API paths, payload construction, response-key handling, validation, success/error handling, and reset logic are unchanged.
- Event cover/gallery images and map/directions links still use existing data.
- Admin path still routes to the existing admin application.
- No TypeScript/build errors and no new missing local image imports.
- Layout has no horizontal overflow at mobile widths.

Do not send a real RSVP during testing. Do not claim browser-level checks were completed unless they were actually performed.

### Phase D — Final report

Return only:
- files changed;
- key design changes;
- build/check result;
- any remaining issues.

## 8. First Copilot prompt (copy and paste)

> Read `RSVP_UNDERWATER_REDESIGN_PLAN.md`, `.github/rsvp-redesign.prompt.md`, and `.github/RSVP_BUBBLE_WAVE_COPILOT_PLAN.md`. This is an existing React + TypeScript + Vite + Tailwind CSS 4 project.
>
> **Phase A only — inspection, no edits.** Inspect `package.json`, `src/App.tsx`, `src/InvitationExperience.tsx`, `src/InvitationPage.tsx`, `src/BubbleField.tsx`, `src/styles.css`, and only the relevant types/API files. Inspect the images in `src/assets/images/` (`ocean-background.jpg`, `bluewhale.jpg`, `crab.jpg`, `green-turtle.jpg`, `jelly-fish.jpg`).
>
> Propose a fresh pastel underwater storybook design for the existing invitation page. Keep the landing page, the “You Are Invited” button, the layered wave reveal, and the existing bubble effect. Use local images selectively. Preserve all RSVP behavior, API payloads/endpoints, event data, gallery, map links, and admin features.
>
> Report the current architecture, best image placements, exact minimal file list, and any risks in a concise summary. Do not print entire source files, install packages, or edit anything. Stop and wait for my approval.

## 9. Approval gate

**Do not implement until the user approves the inspection report and file list.** If Copilot finds that a visual change requires altering API/form logic, backend behavior, dependencies, or admin code, stop and ask first.
