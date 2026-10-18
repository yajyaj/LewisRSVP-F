# Carousel transitions, image fitting, and lightbox entrance

Status: implemented. TypeScript and Vite production build pass; browser visual and interaction checks remain pending.

Implementation: `src/components/usePhotoTransition.ts` coordinates requested/committed selection, image decoding, stale-load cancellation, two-layer transitions, and retry errors. Carousel sizing uses contain; CSS animates the existing dialog panel and backdrop without delaying modal activation. No dependencies added. The existing three-second timings are preserved.

## Outcome and design decisions

Make photo changes feel smooth, show complete photos within the carousel frame, and introduce the lightbox with a short fade and scale entrance. Preserve the invitation's existing visual design and interactions.

Interpret “fit the section” as fitting the entire image inside the carousel's reserved photo frame without distortion or cropping. Use `object-fit: contain`, centered positioning, and the existing soft background for any unused space. Mixed portrait and landscape photos cannot both fill one fixed frame without cropping; intentional background space is the chosen behavior. Keep the surrounding section's headings, artwork, and spacing intact.

Interpret “before it popup” as an entrance animation beginning immediately when the lightbox opens. Do not add an artificial delay before opening the modal or moving focus into it.

## Current code and constraints

- `src/components/BabyPhotoCarousel.tsx` uses a keyed image replacement, shared carousel/lightbox selection, touch swipe handling, and three-second autoplay/manual-pause intervals.
- `src/styles.css` currently applies `baby-photo-enter` for 420ms to the incoming image only. The outgoing image disappears immediately, so this is not a crossfade.
- The frame is 4:3 on desktop and 4:5 at widths up to 600px. Carousel images use `object-fit: cover` and optional `focalPosition`, which can crop faces.
- `src/components/BabyPhotoLightbox.tsx` opens a native dialog through a body portal, contains full images, and restores focus and scroll behavior on unmount. It has no entrance animation.
- Existing global reduced-motion CSS shortens animations; the carousel also disables autoplay for reduced motion. New transition state must work even when animations are skipped.

## Senior frontend implementation standards

- Reinspect repository instructions, current code, relevant existing plans, and working changes before editing. This plan extends the implemented lightbox plan for the animation and image-fitting scope.
- Use typed React state, CSS animations, and native dialog behavior. Add no animation library unless a concrete requirement cannot be met with existing tools.
- Keep one authoritative selected photo index; presentation layers may track outgoing content but must not create competing navigation state.
- Preserve user edits, existing three-second timings, pause rules, keyboard controls, swipe-versus-tap handling, photo imports, and RSVP behavior.
- Keep animation effects and cleanup safe under Strict Mode, rapid navigation, image loading failures, list changes, and component unmounting.
- Animate opacity and transform only. Avoid animating frame dimensions, page layout, or large blurred backgrounds. Keep resource use bounded and do not preload the complete photo collection.
- Self-review the final diff and report actual verification results. A successful build verifies bundling and types; it does not verify browser interactions or visual quality.

## 1. Fit photos within a stable frame

1. Keep the current responsive aspect ratios initially to reserve space and prevent page jumps.
2. Make the slide, photo trigger, and image layers fill the reserved frame with explicit sizing. Check percentage-height resolution and flex/grid minimum sizes in the actual browser layout.
3. Use `object-fit: contain` and `object-position: center` for the visible carousel photos. Keep the `focalPosition` data field for compatibility, but do not use its crop positioning in contain mode.
4. Preserve rounded frame clipping and the existing background. Keep controls and the “View full photo” hint readable over both photos and empty frame space.
5. Keep lightbox images contained within the space between its toolbar and navigation, including mobile landscape and safe areas.

## 2. Animate carousel image switching

Recommended transition: a 320ms crossfade with a gentle incoming scale from 1.01 to 1, using ease-out timing. Clip the small temporary scale inside the frame; the settled photo must show every edge.

1. Replace the current single-image entry keyframe with two bounded visual layers: outgoing and incoming. Apply the same transition to autoplay, arrows, dots, and touch swipes.
2. Retain the visible outgoing photo while loading/decoding the requested incoming image. Start the transition only after the incoming photo is ready; handle cached images and rejected decoding without hanging.
3. Distinguish the requested selection from the committed visible photo during loading. The photo trigger's accessible name and lightbox opening target must match the committed visible photo. Update the shared selected index, counter, and announcement when the visible selection commits.
4. During rapid input, use the latest requested target and discard stale image-load completions. After a crossfade has started, finish that short transition and then process the latest pending target. Do not accumulate navigation jobs or more than two rendered photo layers.
5. Keep the outgoing visual layer decorative with empty alternative text and `aria-hidden`. Give only the committed photo meaningful alternative text. Keep controls outside animated layers so focus never moves with a remounted image.
6. On load failure, retain the last successful photo and show a concise accessible error with retry or another navigation action. Clear obsolete loading/error state when a newer request succeeds.
7. Ignore requests for the already selected image. Resolve any in-progress transition safely if photos change, the viewer opens, or the component unmounts. Cancel pending loads on viewer opening so late completions cannot change the modal's photo unexpectedly.
8. Use transition completion events with a cleanup-safe fallback; do not depend solely on an event firing. Immediately commit without animation when reduced motion is requested, including preference changes during a transition.
9. Remove the old `baby-photo-enter` rule after replacing its behavior, avoiding stacked entrance effects.

## 3. Add the lightbox entrance animation

Recommended entrance: backdrop opacity fades in over 180ms; the panel fades from 0 to 1 and scales from 0.97 to 1 over 220ms with ease-out timing. No bounce or overshoot.

1. Call `showModal()` immediately as today, lock background scrolling, and focus the close button. Animate the visible `[open]` panel and `::backdrop` with CSS keyframes.
2. Keep the dialog shell fixed and full viewport; animate its inner panel so dismissal hit testing and backdrop placement remain stable.
3. Run the entrance once per open, including repeated close/reopen cycles. Navigating photos inside an already open viewer must not replay the panel entrance.
4. Keep loading and error messages inside the animated panel so slow images do not delay access to close or navigation controls.
5. Allow immediate Escape, close-button, and backdrop dismissal during the animation. Preserve focus restoration and scroll cleanup if dismissed or unmounted mid-animation.
6. For reduced motion, render the final visible panel/backdrop immediately with no scale or fade. Do not wait for an animation event to enable interaction.
7. Keep the existing immediate close behavior for this change. Exit animation and animated photo switching inside the lightbox are separate future enhancements.

## 4. Files and implementation order

Paths are relative to `frontend/`.

| File | Planned change |
| --- | --- |
| `src/components/BabyPhotoCarousel.tsx` | Bounded transition layers, loading coordination, safe navigation, and matching click target |
| `src/components/BabyPhotoLightbox.tsx` | Add entrance-specific hooks/classes only if CSS on the existing open dialog is insufficient |
| `src/styles.css` | Contain sizing, crossfade rules, dialog/backdrop entrance, and reduced-motion overrides |
| `CAROUSEL_ANIMATION_AND_IMAGE_FIT_PLAN.md` | Record implementation status and verified/pending checks |
| `../IMPLEMENTATION_NOTES.md` | Record delivered behavior, decisions, commands, and limitations |

Implement stable image fitting first, then carousel transitions, then lightbox entrance. Recheck the combined behavior after integration. Extract a small typed transition helper only if component complexity justifies it.

## 5. Acceptance and verification

- Portrait, landscape, square, and small images show completely at rest without stretching, layout shifts, or horizontal overflow. Inspect 320, 390, 600, 601, 768, and 1440px widths plus mobile landscape.
- Every navigation method produces one smooth switch with no blank flash. Controls, hint, focus ring, selected dot, and lightbox opening target agree with the visible photo.
- Rapid next/previous/dot input and first/last wrapping settle on the latest intended target. No stale image replaces a newer selection.
- Slow, cached, and broken images recover without freezing navigation or removing the last successful photo. Exercise zero, one, multiple, shrinking, and emptying photo lists.
- Autoplay retains its current interval and pause conditions; transitions do not create duplicate timers. Opening the lightbox stops pending carousel work and autoplay.
- Lightbox entrance runs on every open and only once per open. Immediate close, Escape, backdrop dismissal, and reopen work during and after the animation.
- Keyboard navigation, contained focus, focus return, meaningful image alternatives, and manual-change announcements remain usable. Decorative transition copies are absent from the accessibility tree.
- Reduced motion skips animation and does not leave either component in a loading/transition state; test changing the preference while an animation runs.
- Check the invitation reveal/section animations, admin preview, and RSVP form for regressions. Inspect browser console errors and image requests during repeated use.
- Run `npm.cmd run build` from `frontend/` and inspect the final diff. If interaction test tooling is available, add focused coverage for stale loads, rapid navigation, reduced-motion completion, and modal interruption; avoid adding a new test framework solely for styling.

Completion requires verified visual and interaction behavior as well as a passing production build. Clearly record any checks that cannot be performed.
