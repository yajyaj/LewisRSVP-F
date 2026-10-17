---
mode: agent
description: Port the existing vanilla-JavaScript bubble system and wave transition to React + TypeScript + Tailwind CSS without rebuilding the RSVP frontend.
---

# Copilot Free Plan — React + TypeScript Bubbles and Wave

## Goal

Use the supplied `script.js` and `style.css` as the source of truth to recreate the **bubble effects and landing-to-RSVP wave transition** in the existing React + TypeScript + Vite + Tailwind CSS frontend.

The bubbles must cover the **entire RSVP page content**, including sections below the first viewport, while staying behind the content and never blocking clicks or form inputs.

**This is a focused effects migration, not an app rebuild.** Keep the current layout, event details, RSVP form and all working features. Do not replace the app with the vanilla HTML implementation or rewrite unrelated logic.

## Source behavior to preserve

### Bubbles (`script.js` + `style.css`)

- Reusable bubble pool; mobile cap: 20; desktop cap: 30.
- Normal pool starts at roughly 80% of the cap, with at least 4 bubbles; reduced-motion mode uses 4 static bubbles.
- Bubble sizes: 8–42 px. Rise speed: 100–140 px/second.
- Bubble rise distance is based on the **full RSVP content height** plus the viewport height.
- Three visual depth layers (`far`, `mid`, `near`) with different opacity/scale.
- Pointer proximity dodge radius: 90 px; use throttled/requestAnimationFrame work rather than running heavy calculations for every pointer event.
- Periodic extra bubbles can originate around `.page-seaweed` every 4–6 seconds.
- Background taps can create a small cluster (3–5 bubbles), but clicks on buttons, links, fields, labels, or the RSVP content container must not trigger it.
- Temporary bubbles and burst bubbles are capped; expired temporary bubbles are cleaned up.
- First reveal burst is up to 12 bubbles. Existing RSVP success/decline feedback also triggers a burst; preserve that behavior if it currently exists in the app.
- Pause bubble animations while the browser tab is hidden.
- Respect `prefers-reduced-motion`: show a few static bubbles and disable moving, dodging, and burst effects.
- The bubble layer is decorative: `pointer-events: none`, `aria-hidden="true"`, and positioned behind all interactive content.

### Wave transition

- Show the existing invitation landing screen first.
- Clicking the existing continue/invitation button starts the transition only once and disables the button while it runs.
- Use the two layered wave shapes and `wave-sweep` motion already described in `style.css`; preserve their colors, stagger, upward sweep, and overall timing by reusing/adapting the existing styles.
- Reveal the RSVP page after the transition, remove/hide the landing screen, scroll to the top, and move keyboard focus to the RSVP heading.
- Under reduced motion, reveal promptly without requiring the full animation.
- Keep this as an in-page state change; do not introduce a route change unless the current app already requires one.

## Phase 0 — Inspect only (no edits)

1. Inspect the repository and locate the actual frontend root (expected to be `frontend/`).
2. Read its `package.json`, `src/` entry points, existing app/layout/page components, global CSS, Tailwind configuration, and current routing.
3. Identify the installed Tailwind version and follow that version's syntax. **Do not upgrade Tailwind, add animation libraries, or change build configuration** for this task.
4. Locate the current landing screen, RSVP content wrapper, heading, decorative seaweed, and any existing bubble/wave code.
5. Determine whether `script.js` and `style.css` are reference files or currently loaded in production. Do not load the old script alongside React components.
6. Find all existing RSVP behavior before making changes, especially submission/API calls, validation, guest counts, success/error states, gallery/lightbox, countdown, calendar download, and directions.
7. Report a short plan listing the exact files to edit/create and how existing behavior will be protected. **Stop and wait for approval.**

## Phase 1 — Minimal implementation after approval

Prefer small, separate components rather than one large file:

- `BubbleField.tsx` — decorative, full-content bubble layer and lifecycle.
- `WaveTransition.tsx` — two-layer wave overlay, if keeping the transition separate improves integration.
- A small hook such as `useReducedMotion` only if the project does not already have one.
- A minimal edit to the existing landing/app component to connect the existing continue button to the wave and RSVP reveal.
- A focused CSS file such as `bubble-effects.css` only if Tailwind utilities alone cannot reasonably express the keyframes. Keep complex bubble keyframes and custom properties in CSS; use Tailwind for layout and standard styling.

**Do not create these files blindly.** Reuse existing component and style conventions if equivalents already exist.

### Bubble implementation rules

- Use React rendering and state/refs; never use `document.createElement`, `replaceChildren`, or manual DOM insertion to build the bubbles.
- Use a stable, bounded array of bubble descriptors and stable React keys. Avoid creating unbounded state updates or rerendering the whole RSVP app for each animation frame.
- Prefer CSS keyframes for the rise/burst animation. Use refs and a throttled pointer handler only if pointer dodge is implemented.
- Make the bubble field a single absolute/fixed decorative layer that covers the **measured full height of the RSVP content**, not only `100vh`. Use `ResizeObserver` if already supported/appropriate; otherwise update dimensions on resize and after content reveal. Clean up observers/listeners on unmount.
- Check stacking contexts carefully. The bubble layer must be behind content, but must not be hidden behind the page background. Do not add `overflow: hidden` to the full RSVP wrapper if it clips the long-page bubbles.
- Avoid layout shifts. The layer must not affect document flow.
- Keep animation values close to the reference settings above and in `style.css`.
- Cap temporary bubbles and clean them up. Avoid frequent interval-driven React rerenders; use CSS animation events and carefully cleaned-up timers where suitable.
- Implement click-generated bubbles only for true empty background clicks. Never interfere with buttons, links, form controls, keyboard navigation, or touch scrolling.
- Pause/resume and reduced-motion changes must be handled with cleanup-safe effects. Prevent duplicate listeners, timers, or animation loops during React Strict Mode.
- Mark purely decorative bubbles/waves as hidden from assistive technology.
- If exact pointer-dodge or burst behavior would make the component much more complex, report the trade-off first; do not silently omit required behavior.

### Wave implementation rules

- Drive the transition with React state, e.g. `isTransitioning` and `showRsvp`, not direct DOM class mutation.
- Prevent double activation.
- Reuse the existing wave colors, shape treatment, timing, and `wave-sweep` keyframes from `style.css`; do not invent a different transition without asking.
- Keep the RSVP content mounted if required by current state/form behavior. Hide it visually and accessibly until reveal rather than destroying form state.
- After reveal, focus the existing RSVP heading with an appropriate `tabIndex={-1}` if needed, and scroll to top without forced smooth motion for reduced-motion users.
- Ensure the transition works when animations are disabled or finish early; do not rely only on `transitionend` if that can leave the app stuck.

## Functionality preservation checklist

Before calling the task done, confirm that none of these changed unless the existing app has a documented reason:

- RSVP field names, values, validation rules, and error messages.
- Attendance choices and adult/child counters and their limits.
- Submit payload shape, API endpoint, fetch behavior, database integration, storage key, and submission timing/state.
- Success/decline feedback and failure states.
- Countdown date/time and labels.
- Calendar `.ics` generation/download.
- Directions link and event address.
- Gallery, lightbox, image fallback, and keyboard focus behavior.
- Existing routes, responsive layout, assets, page text, and event details.

Do not hard-code demo details from `script.js` into the React app if the existing app uses different event data. Do not change the backend or database for a visual-effects task.

## Phase 2 — Test and report

1. Run the existing lint/typecheck/test/build scripts from the correct frontend directory. Do not invent new scripts; inspect `package.json` first.
2. Check TypeScript errors, console errors, missing assets, and CSS stacking/overflow.
3. Verify mobile and desktop bubble caps and the full-page height.
4. Test normal motion and `prefers-reduced-motion`.
5. Test the invitation button once and verify the wave reveal and heading focus.
6. Test bubble behavior while scrolling, interacting with the form, resizing, switching tabs, and unmounting/reloading.
7. Complete one RSVP test only if it can be done safely without sending a real response; verify form logic and payload were not altered.
8. Report the exact files changed, behavior implemented, tests actually run, and any remaining gaps. Do not claim tests passed unless they were run.

## Copilot Free token-saving workflow

- **One phase per prompt.** Start with Phase 0 inspection only; wait for the report before approving edits.
- Ask Copilot to read this file and inspect only the files relevant to the task. Do not ask it to print entire source files.
- Request a short summary and exact file list, not a large explanation.
- Implement in small batches: (1) bubble component/CSS, (2) wave state/transition, (3) integration and cleanup, (4) tests.
- Reuse existing dependencies and styling. Do not install packages unless the inspection proves a package is necessary and you approve it.
- Avoid whole-file rewrites. Request targeted diffs and preserve unrelated code.
- If context is running low, ask for a concise handoff: current phase, files changed, decisions, tests run, and next step. Continue from that summary instead of repeating analysis.
- Do not let Copilot migrate the entire vanilla `script.js`; only port the bubble and wave behavior, while leaving unrelated RSVP features untouched.

## First Copilot Chat prompt (copy/paste)

Read and follow `.github/rsvp-redesign.prompt.md` and `RSVP_UNDERWATER_REDESIGN_PLAN.md` if those files exist. Also inspect the supplied `script.js` and `style.css` that define the bubble and wave effects.

My existing app uses React + TypeScript + Vite + Tailwind CSS and has a `frontend` folder. First locate the actual frontend root and the actual paths of the source files and plan documents.

**Inspection only: do not modify any files yet.** Identify how the bubble field and wave transition work in the reference files, locate the corresponding React components/styles, inspect the installed Tailwind version, and list the smallest set of files you propose to change. Explain how you will apply bubbles over the full height of the RSVP page while preserving all existing RSVP fields, validation, submission/API/backend behavior, success/error states, gallery, countdown, calendar, directions, routing, and event details. Keep the report concise and wait for my approval.

## Follow-up prompt after inspection approval

Implement only the approved bubble and wave plan. Use React + TypeScript and the installed Tailwind version. Keep the bubble layer behind the entire RSVP content and non-interactive; respect reduced motion, visibility changes, cleanup, and responsive limits. Reuse the reference wave shapes/keyframes. Do not rewrite unrelated files or alter form/backend behavior. Show a concise diff summary and run the existing checks.
