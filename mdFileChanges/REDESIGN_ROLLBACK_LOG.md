# Underwater redesign rollback log

## Final QA document/screenshot refresh

- Verified SHA-256 documentation restore point: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\qa-refresh-20261018-154301`.
- Updated QA report, original plan Phase H checklist, implementation notes, this log, and regenerated QA screenshots/results. No application source changes. All invitation/landing/countdown/divider checks passed again.
- To undo this refresh independently, reverse only its documentation additions against this backup after inspecting later edits; regenerate or retain QA artifacts as needed. Preserve the independently backed-up alignment fix and all event information.

## Independent Birthday Party divider alignment fix

- Verified SHA-256 restore point: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\birthday-divider-alignment-20261018-153731`. Existing earlier restore points remain intact.
- Modified only `frontend/src/components/EventDetails.tsx` and `frontend/src/invitation-foundation.css` in application source. Added a content-track count and desktop shared subgrid rows; grouped timezone with its existing final time entry. Shared 1px border styling and stacked layout remain unchanged.
- Added `frontend/design-source/divider-alignment-qa.cjs` plus dedicated measurements/screenshots in `frontend/design-source/qa-results/`; updated notes/log.
- Build and six-width Edge validation passed. At-rest Venue/Time divider delta is 0px at 1024 and 1440px; the four narrower requested widths use the existing stacked arrangement with matching border width/color/style and margin/padding. Extra-long venue reflow remains aligned. Existing hover animation intentionally remains unchanged; resting coordinates are measured outside hover.
- To revert independently: inspect later edits, reverse only this fix in the two source files using this verified backup, and remove its dedicated QA artifacts and note/log additions if unused. Do not restore any other redesign phase or personalized event information.

## Plan follow-through

- Verified SHA-256 restore point: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\plan-followthrough-20261018-153210` for the original plan, QA report, browser harness, notes, and log.
- Updated those documentation/harness files and regenerated current screenshots/results using existing Edge tools. No application code changes or new image generation. Original plan now distinguishes completed items from historical baseline screenshots and pending real-device/live verification.
- Final follow-through: 25 invitation browser checks, seven landing viewport checks plus opening/focus behavior, and 4 countdown tests passed. Optional axe installation was declined; automated scanning remains unverified.
- To revert this follow-through, reverse only its documentation/harness changes against the verified backup after inspecting later edits; QA artifacts may be regenerated. Preserve the actual source redesign and personalized event details.

## Remove duplicate Find Your Way section

- Verified SHA-256 restore point: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\remove-duplicate-venue-20261018-152955`.
- Removed only the EventVenues import/render from InvitationPage; updated the existing QA missing-map selector and notes/log. All the little details retains both locations, times, and map links. Existing unused component/assets remain on disk and are not rendered.
- Build and targeted Edge section/content/map/responsive checks passed. To undo, restore only the removed import/render and QA selector against the backup after inspecting later edits; preserve all other changes.

## Two-venue celebration schedule

- Verified SHA-256 restore point: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\two-venues-20261018-152430` for InvitationPage, EventDetails, foundation CSS, notes, and this log.
- Created `frontend/src/eventVenues.ts` and `frontend/src/components/EventVenues.tsx`; updated the three backed-up source files. Sample schedule shows christening at the supplied basilica from 10–11 AM and birthday party at the existing Peri-Peri Taytay venue/time. Each stop has its own links. January 9 countdown now starts at 10 AM. Existing API event data uses a single-stop fallback without changing contracts or storage.
- Build, dedicated two-stop/map/countdown/four-width checks, all 21 Edge regression checks, and whitespace validation passed. No new assets/dependencies or backend changes.
- To revert only this change, inspect subsequent edits; reverse its changes in the three existing source files using this restore point, remove the two new files if unused, and remove only its notes/log additions. Preserve the date, Peri-Peri address, landing redesign, and other approved work.

## Landing screen redesign

- Verified SHA-256 restore point: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\landing-20261018-152034`; contains InvitationExperience, invitation foundation CSS, notes, and this log.
- Modified `frontend/src/InvitationExperience.tsx` and `frontend/src/invitation-foundation.css`: responsive whale/card scene, existing optimized ocean backgrounds, cream/teal typography and CTA, short-screen scroll, reduced-motion float fallback, and opening announcement. Reveal/focus/API/event behavior preserved. No new generated assets.
- Created `frontend/design-source/landing-qa.cjs`, two landing screenshots under `frontend/design-source/qa-results/`, and `frontend/mdFileChanges/LANDING_REDESIGN_REVIEW.md`; updated notes/log.
- Production build and all seven viewport/CTA checks passed, as did keyboard, inertness, scroll unlock, both reveal modes, click guard, header focus, and JS-error checks. Screenshots reviewed.
- To revert only the landing redesign, inspect later edits and reverse its changes in the two source files against the backup. Remove only its QA/review artifacts and note/log additions if unused. Preserve the January 9 date, updated Taytay venue, and all other redesign phases.

## January 9 event-date change

- Verified pre-change backup: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\event-date-20261018-151711` (SHA-256 manifest).
- Changed sample event_date in InvitationPage, browser QA fixture, countdown test assertion, and notes/log. All sample date displays/countdown share January 9, 2027; existing time/timezone preserved. No API/database/deadline changes.
- To revert only this update, reverse the date/fixture/assertion and its note/log additions against this backup, preserving unrelated later edits.

## Approved baseline

- Reference: `a_bright_whimsical_colorful_mockup_concept_boa.png`; user approved the redesign on 2026-10-18.
- Scope authorized: continue all remaining frontend redesign phases, asking only for essential clarification (user instruction after Phase E began). Keep per-phase restore points; generation remains capped at 10 images. This instruction supersedes the earlier approval gates.
- Existing Git branch: `main`; HEAD: `a757142b78980597ca2a3f7449a3602d5429a58c`.
- The working tree already contains modified/untracked frontend files and unrelated backend changes/deletions. These are pre-existing work; HEAD is not the current design baseline.
- Verified backup: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\baseline-20261018-143344`.
- Backup contains 40 files: existing frontend source/assets, package/lock/config files, implementation notes, and the design specification. No environment files, credentials, build output, or dependencies were copied.
- `manifest.json` records relative paths and SHA-256 hashes. Every saved file matched its source; a second copy into `restore-verification/` also matched every manifest hash. No live source files were overwritten during verification.
- Browser baseline screenshots unavailable: no browser automation tool is available in this session.

## Restoration procedure

1. Identify the requested phase and inspect its recorded file list plus current diffs. Preserve unrelated changes made after this baseline.
2. Read `manifest.json` from the backup location and verify the selected backup files using `Get-FileHash -Algorithm SHA256` before restoring.
3. For a file containing only rejected redesign changes, use `Copy-Item -LiteralPath <backup-file> -Destination <workspace-file>`. For mixed changes, apply only the phase's reverse diff after inspecting context; do not overwrite later edits.
4. Remove only assets/files listed as newly created by the rejected phase and confirmed unused elsewhere. Never delete a directory recursively to revert a phase.
5. For existing files, verify restored hashes against the baseline when no unrelated later edits must remain. Rebuild and compare the UI when browser tools are available.
6. Do not reset/clean the repository or restore backend/database/authentication state. Request filesystem escalation if restoring requires access outside the writable workspace.

## Phase B

Prepared exactly 10 generated images, capped by the user's subsequent instruction. No application code or existing images changed. Existing carousel illustrations remain in place.

Created files:

- `frontend/src/assets/images/underwater/`: 10 WebP files named in `UNDERWATER_ASSET_MANIFEST.md`.
- `frontend/design-source/underwater/`: 10 corresponding PNG masters, `prepare_assets.py`, and `asset-manifest.json` (source/export hashes).
- `frontend/mdFileChanges/UNDERWATER_ASSET_MANIFEST.md`.
- `frontend/mdFileChanges/IMAGE_GENERATION_PROMPTS.md`.
- This rollback log, `frontend/mdFileChanges/REDESIGN_ROLLBACK_LOG.md`.

Modified: `IMPLEMENTATION_NOTES.md` by appending the Phase B record; preserve all prior notes. No npm dependency changes. Pillow is a temporary external export tool only.

To reject Phase B, remove only the individually listed newly created files after checking they remain unused, and remove only its added implementation-note section. Retain the external baseline backup. Source application files need no restoration because Phase B did not change them.

Checks: exactly 10 exports, successful WebP decoding, source/output dimension equality, expected transparency, and byte-for-byte alpha equality passed. Build and source-baseline comparison results are recorded in the completion notes. Browser screenshots/visual integration remain pending.

## Phase C — design foundation

- Approved after Phase B review. Pre-phase backup: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\phase-c-before`.
- Verified source/backup SHA-256 equality for `frontend/src/main.tsx`, `frontend/src/styles.css`, `IMPLEMENTATION_NOTES.md`, and this log. The backup's `manifest.json` lists their hashes. `styles.css` was included defensively but was not edited.
- Created `frontend/src/invitation-foundation.css`; modified `frontend/src/main.tsx` to import it after existing styles. Updated implementation notes and this log.
- Foundation covers public-only tokens, system typography, responsive gutters/spacing, card geometry, form legibility, focus indicators, and clean header/footer framing. Preserve event theme variants. Body-portal lightbox receives the same tokens explicitly. No external fonts/dependencies or additional images.
- Keeping the foundation separate avoids changing shared admin rules; section-specific legacy styling remains for the relevant later phase rather than broad CSS deletion.
- Checks: TypeScript/Vite build passed; whitespace check passed; existing source files except the authorized `main.tsx` import match the original baseline. Calculated contrast: body/pearl 8.66:1; muted/pearl 5.77:1; white/teal CTA 4.91:1; white/themed CTAs at least 5.72:1; input border/white 3.55:1. These checks cover specified solid colors, not full rendered-page contrast.
- Browser screenshots, breakpoint/zoom checks, font appearance on target devices, and interaction regression remain pending; no browser automation is available in this session.
- To revert only Phase C: remove the foundation import from `main.tsx`, remove the newly created stylesheet if unused, and remove only Phase C note/log additions. If no later edits exist, restore `main.tsx` from `phase-c-before` and verify its manifest hash. Preserve Phase B assets and all other user work. Do not restore the entire original baseline for a Phase C-only rollback.

## Phase D — hero and countdown

- Approved after Phase C. Verified pre-phase SHA-256 backup: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\phase-d-before`. Manifest covers `frontend/src/InvitationPage.tsx`, `frontend/src/invitation-foundation.css`, `IMPLEMENTATION_NOTES.md`, and this log.
- Created `frontend/src/components/EventHero.tsx`, `frontend/src/components/EventCountdown.tsx`, `frontend/src/eventCountdown.ts`, and `frontend/tests/eventCountdown.test.mjs`.
- Modified `InvitationPage.tsx` to use the new hero/countdown, remove the old hardcoded timer, and allow the hero CTA to focus the RSVP heading. Moved countdown immediately after hero to match the approved reference sequence. Removed its old decorative starfish import; original image remains on disk.
- Modified `invitation-foundation.css` with a responsive split hero, existing baby/whale composite, generated desktop/mobile backgrounds, a reduced-motion-aware 8px float, and pearl-like countdown cards. A provided event cover takes priority in the hero art area and is shown without cropping. No text/event data was invented or rendered into artwork. `.hero::before` was already absent and remains absent.
- Updated notes/log only; no API client, authentication, backend, package dependencies, or carousel changes. Generation count remains exactly 10.
- Validation: `npm.cmd run build` passed; `node --test tests/eventCountdown.test.mjs` passed all 4 tests (timezone/seconds/fractional offsets; DST gaps/overlaps; invalid/missing values; rollover/expiration). Browser responsiveness, cover-photo appearance, focus/anchor behavior, motion, and live RSVP checks remain pending without browser tools.
- Timezone policy: missing/invalid start time or zone and nonexistent DST wall times display a static explanatory fallback rather than an invented target. Repeated DST wall times resolve to the earlier instant. The timer is isolated from the parent invitation, stops at expiration, and cleans up on unmount/target change. Seconds use a non-live timer region.
- To revert only Phase D: inspect later diffs; restore only its changes in `InvitationPage.tsx` and `invitation-foundation.css` using the phase backup, and remove the four newly created files if unused. Remove only Phase D note/log additions. Preserve approved Phase B/C changes and unrelated work.

## Phase E — welcome and event details

- Verified SHA-256 restore point: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\phase-e-before`; contains InvitationPage, foundation CSS, notes, and this log.
- Created `frontend/src/components/EventWelcome.tsx` and `EventDetails.tsx`. Modified InvitationPage and foundation CSS. Existing artwork files retained; welcome now has one generated starfish, details use shell-inspired Date/Venue/Time cards and semantic icons. Details precede the carousel in the reference's narrative order. Event cover/gallery remain available and contained.
- Map links require valid HTTP(S) URLs or actual venue information; no generic placeholder destination is generated. Existing data/payload/authentication code unchanged.
- Build passed. Browser checks remain pending final QA. To revert: reverse only Phase E changes in the two modified source files using this phase backup, remove the two new components if unused, and remove only its notes/log additions; preserve later unrelated changes.

## Phase F — gallery controls

- Verified pre-phase source hashes at `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\phase-f-before` for InvitationPage, BabyPhotoCarousel, usePhotoTransition, foundation CSS, notes, and this log.
- Modified those four source files: preserve all four original illustration slides and lightbox; explicitly label illustrations; add pause/play, Home/End, counter, offscreen pause, and persistent pause after keyboard focus. Rotation/manual reset is now five seconds; crossfade is 480ms with a 560ms cleanup fallback. Existing swipe, reduced-motion, tab, focus, hover, modal and loading rules remain.
- No generated images/dependency changes. Production build passed. Browser timing/focus/interaction checks will run in Phase H with temporary Playwright tools using existing Edge.
- To revert, reverse only Phase F changes in its four source files against the phase backup after inspecting later diffs; preserve other phases and notes. No new application files were created.

## Phase G — RSVP form and confirmed success

- Verified SHA-256 restore point: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\phase-g-before` for InvitationPage, foundation CSS, notes, and log.
- Created `frontend/src/components/RsvpSuccess.tsx`; modified InvitationPage and foundation CSS. Added a generic waving baby beside the calm cream form, field-associated API validation messages, focusable error summary, required-name indication, synchronous duplicate-submission guard, stable response identity when storage is restricted, and a 1.4s reduced-motion-aware treasure reveal only after successful API resolution. Original fields, guest limits, endpoint/payload shapes, preview restrictions, and repeat-response behavior remain.
- Swapped legacy venue decorations for the generated distinct coral clusters. Existing source artwork is retained. API client/authentication/backend dependencies unchanged; no new generation.
- Production build passed. Temporary browser QA harness added at `frontend/design-source/underwater-qa.cjs`; tests mock API requests and never create real RSVPs. Initial browser run passed all seven layout widths and identified a modal Tab-wrap issue to correct in Phase H.
- To revert G, reverse only its InvitationPage/CSS changes with the phase backup and remove RsvpSuccess if unused; preserve other phases and later changes. Remove only the G note/log sections.

## Phase H — QA and corrections

- Verified pre-QA hashes at `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\phase-h-before`. Initial manifest includes InvitationPage, BabyPhotoLightbox, foundation CSS, notes, and log. EventHero, BubbleField, and BabyPhotoCarousel were individually added and hash-verified before correcting them.
- Modified those six source files: explicit dialog Tab wrap; hero scroll/focus without native anchor override; content-height-based bubble canvas; touch capture only on drag and pointer-up tap activation; visible wrapping section navigation; inline required indicator; lazy coral exports. No new generated images, API/backend changes, package changes, or unrelated file restoration.
- Added browser harness/results/screenshots under `frontend/design-source/` and `frontend/mdFileChanges/REDESIGN_QA_REPORT.md`; updated notes and this log. Browser QA found and verified the fixes above.
- Final production build passed; 4 countdown tests and 21 recorded Edge checks passed; no sample-page JS errors; whitespace checks passed. See QA report for exact scope and remaining live/device verification limits.
- To revert only H, inspect later changes and reverse H edits in the six source files using the phase manifest/backups; remove only newly added QA artifacts if unused and its note/log additions. Preserve approved B–G work. The QA harness was introduced while G validation began, so retain it if its earlier validation record is needed.

## Final local integration QA (2026-10-18)

- Four documentation snapshots hash-verified in `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\live-qa-final-20261018`.
- Added `frontend/design-source/live-backend-qa.cjs` and `qa-results/live-backend.json`; updated the QA report, plan, this log, and implementation notes. No application/backend code or package changes.
- Revert this follow-through independently by reviewing later edits and restoring only these four documentation files from this snapshot, then removing the two new QA artifacts if unused. Preserve all existing phase restore points. Disposable database/credentials live outside the repository and are cleaned up after the run.
