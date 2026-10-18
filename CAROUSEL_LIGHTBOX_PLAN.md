# Clickable carousel photos and full-image viewer

Status: implemented; TypeScript and production build pass. Browser interaction and responsive verification remain pending.

Implementation note: the native dialog renders through a portal into `document.body` to avoid the invitation's existing descendant-positioning and reveal styles. No dependency was added.

## Senior developer implementation expectations

When implementation is requested, act as a senior React and TypeScript developer responsible for delivering and verifying this feature end to end. Use the following concrete standards to guide decisions.

1. Inspect applicable repository instructions, the relevant master-plan requirements, current components, styles, and package scripts before editing. Treat this document as feature guidance and reconcile it with the actual code rather than assuming the code is unchanged.
2. Preserve existing user changes. Keep the implementation focused on the carousel viewer and preserve the invitation design, photo data, preview behavior, and RSVP interactions.
3. Use the simplest maintainable solution: typed component props, one source of truth for selection, native browser capabilities, and small components with clear responsibilities. Avoid new dependencies or broad refactors unless a demonstrated requirement justifies them.
4. Review interaction behavior before coding, including tap versus swipe, event propagation, modal focus, autoplay timing, and zero or changing photos. Address these explicitly rather than relying on the happy path.
5. Keep React effects safe under Strict Mode and repeated open/close cycles. Clean up timers, listeners, dialog state, and scroll locks, and avoid stale state or out-of-range photo reads during rendering.
6. Verify native dialog behavior in supported browsers before adding custom focus handling. Use a portal only if the actual layout requires it; explain material architectural choices in the completion report.
7. Preserve performance by reusing existing image sources and loading full-size viewer content on demand. Do not preload the entire collection or introduce unnecessary repeated image requests.
8. Perform a focused self-review of the final diff for correctness, accessibility, responsive layout, cleanup, and unintended changes. Run the production build and the applicable interaction checks below; distinguish checks performed from checks that remain unverified.
9. Resolve routine implementation choices autonomously within this scope. Ask for clarification only when a material product ambiguity or blocker cannot be resolved from the repository and this plan.
10. Finish with a concise report of changed files, delivered behavior, validation results, and any remaining limitations. Do not claim completion based only on a successful build if key browser interactions remain unverified.

This document establishes implementation standards and acceptance criteria; its wording alone cannot guarantee implementation quality. Completion requires evidence from the resulting code and verification.

## Intended behavior

Keep the existing carousel. Clicking or tapping its displayed photo opens a modal image viewer (lightbox) showing the complete photo without cropping. Visitors can browse all carousel photos inside the viewer, one at a time, and close it to return to the invitation.

Interpretation: “show the whole images” means showing each complete image, including portions currently cropped in the carousel. The viewer also provides access to every photo; it does not display a thumbnail grid.

## Current implementation

- `src/InvitationPage.tsx` defines `BABY_PHOTOS` and passes it to `BabyPhotoCarousel`.
- `src/components/BabyPhotoCarousel.tsx` renders the active photo, previous/next buttons, pagination, touch swipes, and five-second autoplay.
- Each `BabyPhoto` provides `src`, `alt`, and optional `focalPosition`. The current image data is sufficient for this feature.
- `src/styles.css` contains the invitation and carousel styles.

## Implementation steps

### 1. Make the carousel photo interactive

- Wrap the displayed image in a native button with a descriptive accessible name, such as “Open full photo: Baby smiling”.
- Add a visible keyboard focus indicator and a subtle “View full photo” hint that also works on touch screens.
- Support mouse click, touch tap, Enter, and Space.
- Keep the previous/next controls outside the photo button to avoid nested buttons.
- Distinguish a tap from a swipe: completing or cancelling a drag must not accidentally open the viewer.

### 2. Add a reusable full-image viewer

- Create `src/components/BabyPhotoLightbox.tsx` with the photo list, selected index, selection callback, and close callback as props.
- Use a native modal `<dialog>` opened with `showModal()` for focus containment and a backdrop. Give the dialog an accessible name.
- Open at the clicked photo. Show the image, a close button, previous/next controls, and a “Photo X of Y” counter.
- Display images with `object-fit: contain` and responsive maximum dimensions. Preserve their aspect ratio and show every edge; do not apply carousel cropping or `focalPosition` in the viewer.
- Fit the viewer within the available viewport, including mobile browser controls and safe areas. Keep controls visible with at least 44px touch targets.
- Use the existing visual palette and respect reduced-motion preferences.
- Show a useful loading or error state if a photo is slow to load or unavailable, while keeping navigation and close controls usable.

### 3. Connect viewer state and navigation

- Track whether the viewer is open in `BabyPhotoCarousel.tsx`; use the carousel's active index as the shared selection so both views remain synchronized.
- Pause carousel autoplay for the entire time the viewer is open. On close, restart the existing manual-interaction pause before autoplay can resume, subject to the existing hover, focus, visibility, and reduced-motion rules.
- Support previous/next buttons and Left/Right keys while the viewer is open, wrapping from the last photo to the first and back.
- Prevent modal keyboard navigation from also triggering the carousel's keyboard handler.
- Hide browsing controls for a single photo; preserve the current empty state for zero photos.
- Handle a changed photo list by keeping the selected index valid and closing the viewer if the list becomes empty.

### 4. Implement dismissal and accessibility

- Close with the close button, Escape, or a click directly on the backdrop. Clicking the photo or viewer controls must not dismiss it.
- Keep Tab and Shift+Tab inside the open dialog, place initial focus on the close button, and return focus to the photo trigger when the dialog closes.
- Lock background scrolling while open and restore the previous scroll behavior on close or unmount.
- Reuse each photo's meaningful `alt` text and announce manual selection changes politely.
- Ensure effect cleanup closes the dialog and restores page state when navigating away.

### 5. Add scoped styles and integrate

- Add invitation-scoped photo-button and lightbox styles in `src/styles.css`.
- Reuse `BABY_PHOTOS` without changing image imports or requiring backend/API work.
- Keep this change focused on the photo-opening interaction and its viewer.

## Files expected to change

| File | Purpose |
| --- | --- |
| `src/components/BabyPhotoCarousel.tsx` | Add the photo trigger, viewer state, and autoplay coordination |
| `src/components/BabyPhotoLightbox.tsx` | Implement the modal viewer and its controls |
| `src/styles.css` | Style the trigger, backdrop, full-image layout, and responsive controls |

Paths above are relative to `frontend/`. `src/InvitationPage.tsx` should require no changes unless integration reveals a specific need.

## Validation and acceptance criteria

1. Click a carousel photo: the viewer opens on that exact photo and shows the entire image without cropping or distortion.
2. Browse multiple portrait and landscape photos using buttons and Left/Right keys; the counter and carousel selection stay synchronized.
3. Close using each dismissal method; focus returns to the trigger and page scrolling works again.
4. Verify Enter/Space opening, contained Tab navigation, visible focus, accessible names, and Escape dismissal.
5. Verify a carousel swipe changes photos without opening the viewer, while a tap opens it.
6. Confirm autoplay remains paused throughout viewing and resumes only when the existing pause conditions allow it.
7. Check empty, single-photo, multiple-photo, broken-image, and changing-photo-list cases.
8. Check mobile and desktop layouts at approximately 320, 390, 768, and 1440px widths, plus mobile landscape; confirm photos and controls fit without horizontal overflow.
9. Check reduced motion, invitation preview, and the RSVP form after closing the viewer.
10. Run `npm run build` from `frontend/` to verify TypeScript and production bundling. The frontend currently has no automated test script; report manual checks actually performed and add interaction tests only if an appropriate test setup is introduced as part of implementation.

## Completion condition

The feature is complete when visitors can open any carousel photo, view it in full, browse the remaining photos, and return to the invitation using mouse, touch, or keyboard, with the checks above passing.
