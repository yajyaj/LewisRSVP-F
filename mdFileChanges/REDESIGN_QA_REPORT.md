# Underwater redesign completion and QA

Date: 2026-10-18. Frontend Phases B–H implemented following the approved concept. The user's instruction to continue superseded per-phase approval pauses. Exactly **10** images were generated; no additional variants or replacements were generated.

Latest follow-through: checklist, browser results, and screenshots now reflect the aligned landing screen, January 9 date, christening at 10–11 AM, existing birthday-party time at 11:30 AM–3 PM, and removal of the duplicate venue section. Both locations/maps remain in All the little details. These personalized venue entries belong to the sample invitation; published events still use their saved Laravel data. Countdown targets the sample christening at 10 AM Asia/Manila.

## Delivered

- Scoped ocean design tokens and rounded system typography; minimal image-free navigation/footer with visible section links and 44px navigation targets.
- Responsive illustrated hero with separate calm text surface, existing event content, cover-image priority, existing baby/whale illustration, and optimized desktop/mobile ocean backgrounds. No `.hero::before`.
- Event-date/start-time/timezone countdown with DST validation, expiration fallback, isolated cleaned-up timer, and no per-second screen-reader announcements.
- Single-accent welcome section and responsive Date/Venue/Time cards; accurate data, semantic date/icons, safe map links, preserved event gallery.
- Four existing illustrated carousel slides, five-second autoplay, pause/play, persistent keyboard-focus pause, hover/offscreen/tab/modal/reduced-motion rules, keyboard/swipe controls, full-image viewer, and loading failure recovery.
- Readable RSVP card with one generic baby illustration, original fields/limits/conditional behavior, field-associated server errors, duplicate-request guard, repeat-response identity, and treasure reveal only after confirmed API success.
- Final QA fixes: lightbox Tab wrapping; reliable hero anchor focus; touch pointer-up activation after swipes; and bubble canvas sizing that shrinks correctly with content instead of leaving blank page space.

## Evidence

Final refresh after the Birthday Party divider fix (2026-10-18): all 25 invitation checks, seven landing viewport checks plus opening/focus checks, four countdown tests, and the dedicated six-width divider checks passed again. Current desktop/mobile screenshots were regenerated. No application source was changed during this QA refresh.

- Divider alignment: at-rest Venue/Time border coordinates differ by **0px** at 1024px and 1440px. At 320, 375, 390, and 768px the existing stacked layout retains identical 1px solid `rgb(193, 221, 228)` borders and matching 16px top margin/padding. Long-content reflow remains aligned. Measurement deliberately excludes the unchanged hover-lift animation.
- Alignment evidence: [measurements](../design-source/qa-results/divider-alignment.json), [desktop details](../design-source/qa-results/divider-alignment-1440.png), [mobile details](../design-source/qa-results/divider-alignment-390.png). Run `node frontend/design-source/divider-alignment-qa.cjs` with the existing temporary browser tools.

- Production build: `cd frontend; npm.cmd run build` passed after final source changes.
- Countdown unit checks: `node --test tests/eventCountdown.test.mjs` passed **4/4** tests, including event/visitor timezone independence, fractional offsets, DST gaps/overlaps, invalid/missing inputs, and expiration/rollover.
- Edge browser harness: `node frontend/design-source/underwater-qa.cjs` passed **25 recorded checks**. Details: [results.json](../design-source/qa-results/results.json). Added current-content assertions, form-label/alt/navigation-target checks, simulated hidden-document pause, and 4x CPU-throttled modal interaction/bubble-count checks.
- Landing harness: `node frontend/design-source/landing-qa.cjs` passed seven viewport/CTA checks plus reduced-motion/keyboard/inertness/scroll/focus and animated opening/guard/error checks.
- Responsive no-overflow checks: 320x800, 375x812, 390x844, 768x1024, 1024x900, 1440x1000, and mobile landscape 844x390.
- Browser checks cover modal keyboard/focus/scroll cleanup and backdrop dismissal; hero focus; failed incoming image retention/retry; 200% text scaling; error associations and retained fields; duplicate submission guard; no false success; plus-ones, decline, and repeat-response identity; private token endpoint/prefill; long content/missing venue/time/cover image; admin preview and return; actual emulated touch swipe/tap; five-second rotation/pause; offscreen pause; bounded bubble count under React Strict Mode; no sample-page JavaScript errors.
- The 25-check invitation harness uses intercepted API responses. Additional real Laravel HTTP checks below use disposable fixtures in a separate temporary SQLite database; no existing guest data was changed.
- SHA-256 comparison confirms `api.ts`, `AdminApp.tsx`, `EventEditor.tsx`, `types.ts`, `package.json`, and `package-lock.json` remain identical to the original baseline. Sanctum cookie/CSRF handling and API contracts remain intact in source.
- `git diff --check` passed.
- Calculated solid-color contrast: body/pearl 8.66:1, muted/pearl 5.77:1, white/teal CTA 4.91:1, themed CTAs at least 5.72:1, input border/white 3.55:1.

## Screenshots and visual review

- [Desktop, 1440px](../design-source/qa-results/desktop-1440.png)
- [Mobile, 390px](../design-source/qa-results/mobile-390.png)
- [Landing desktop](../design-source/qa-results/landing-1440.png)
- [Landing mobile](../design-source/qa-results/landing-390.png)

Reviewed the desktop screenshot against the supplied board: aqua/pearl palette, rounded baby/ocean artwork, shell motifs, alternating content rhythm, and teal CTAs are retained with quieter text/form areas. The board is a design reference, not a background pasted into the page. Screenshots use reduced motion for stable capture. Pre-redesign browser screenshots were unavailable during Phase A; source backups provide the original restore baseline.

## Assets and performance

Ten alpha-preserving WebP exports total 1,695,694 bytes, about 88.5% smaller than PNG masters. Existing source photos/illustrations were not overwritten; below-fold artwork is lazy-loaded. Generated assets are imported selectively rather than loading every prepared alternative. The standalone whale is used on the landing screen, while the hero uses the existing cohesive baby/whale composite. No external fonts, animation library, or production dependencies were added. Temporary Pillow/Playwright tools are outside project package dependencies.

Actual generated sizes and glow/alpha considerations are listed in [UNDERWATER_ASSET_MANIFEST.md](UNDERWATER_ASSET_MANIFEST.md). Two source widths fall below suggested targets; no artificial upscaling or further generation was performed.

## Remaining verification limits

- Local Laravel HTTP integration now passes with isolated SQLite. Production deployment, MySQL, deployed CORS configuration, and live guest data remain outside this verification. Private invitation browser flows use mocked responses; existing Laravel feature tests additionally cover private access and revocation.
- Real iOS Safari/Android devices, Firefox, assistive-technology speech output, actual browser 200% zoom, true background-tab behavior, low-end hardware profiling, and production Lighthouse measurements remain unverified. Tested Edge touch emulation and 200% text scaling are not substitutes for every physical device or browser zoom mode.
- Automated axe scanning remains unverified: the optional temporary-tool installation was declined. Existing browser/manual semantic and contrast checks were completed instead; they do not constitute a full automated accessibility audit. CPU-throttled interaction checks are a desktop simulation, not physical-device profiling.
- No lint script exists in the project. Browser helper requires temporary Playwright and the existing Edge executable; it is not an added production dependency or a CI installation.

## Rollback

See [REDESIGN_ROLLBACK_LOG.md](REDESIGN_ROLLBACK_LOG.md). Verified original and per-phase backups are outside the source tree. Revert only the requested phase's changes after inspecting later diffs; never reset/clean the repository or overwrite unrelated user work.

## Final local integration follow-through

- Existing Laravel test suite passed: **17 tests, 92 assertions**, using SQLite in memory.
- [Real HTTP browser results](../design-source/qa-results/live-backend.json): **7 checks passed** against a separate temporary Laravel server and SQLite database, with CSRF middleware active (`APP_ENV=local`).
- Verified actual browser login, credentialed cross-origin requests, CSRF header and HttpOnly session cookie; missing-CSRF POST rejected with 419; event creation/publication; public RSVP persisted with two attendees; repeat response updated the same record; guest admin access rejected with 401; event deletion and logout/session invalidation.
- Harness: `frontend/design-source/live-backend-qa.cjs`. It requires a freshly provisioned isolated environment and a temporary credential-file argument; credentials are never stored in repository artifacts. Ports 8001/5174 were reserved for this run.
- No application or backend source changes were needed. No additional images, packages, or accessibility tooling were installed. Temporary servers and credentials are removed after verification; the existing preview is retained.
- Frontend implementation is complete. The physical-device, browser, accessibility, and production checks listed above remain explicit release-validation limits.
