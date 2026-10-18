# RSVP: preserve design, add carousel and artwork

Status: plan only. Implement only when requested. This brief supersedes conflicting instructions in older plans.

## Scope
Keep the current layout, colors, fonts, hero, opening animation, countdown, cards, RSVP form, navigation, and footer. Add one carousel section and integrate existing artwork across content sections. Preserve admin styling, preview behavior, routes, API payloads, validation, and submission states. No redesign or extra interaction changes.

## Existing artwork
Base: `frontend/src/assets/images/`. Use all 14 images as page design elements, never as a carousel of ocean assets.

| Image | Placement |
| --- | --- |
| `ocean-background.jpg` | Keep opening background |
| `bluewhale.png` | Keep welcome illustration |
| `jelly-fish.png` | Keep welcome companion |
| `green-turtle.png` | Keep details illustration |
| `fish.jpg` | Small hero-side vignette, clear of title |
| `seahorse.jpg` | Welcome edge accent |
| `starfish.jpg` | Countdown accent outside timer cells |
| `calm.jpg` | Small details vignette; inspect subject before final positioning |
| `castle.jpg` | Location section illustration |
| `corals.jpg` | Location lower-edge vignette |
| `octopus.jpg` | Carousel section companion outside slides |
| `treasure.jpg` | RSVP introduction accent |
| `crab.png` | RSVP section companion, visible before submission |
| `seaweeds.png` | Single lower-content corner accent; no tiling |

Inspect artwork before implementation. Keep original files and proportions. JPG backgrounds are opaque: use matching inset surfaces or soft framed vignettes rather than pretending they are cutouts. Limit illustration sizes and reserve separate space so artwork never covers copy, controls, or photos. Keep navigation/footer free of illustrations. On mobile, place accents in normal flow at smaller sizes; retain all assets without clutter.

## New celebration carousel
Insert after event details and before location; preserve other section order. Title: “Moments worth keeping.” Match existing palette, typography, spacing, and card treatment.

- Create three temporary local SVG images in `src/assets/carousel/`: celebration cake, keepsake, and gathering. Match the ocean palette; clearly label them as sample illustrations. No fabricated personal photos. Create these during implementation, not during this planning task.
- Use unique `cover_image_url` + `gallery_urls` when provided; otherwise show the sample slides. Show each event photo once across the page, consolidating the existing photo gallery into this section. Keep the current cover-photo hero behavior.
- Auto-next every 5 seconds; wrap to first slide. Include Play/Pause, previous/next, selectors, and slide counter. Disable rotation for a single slide.
- Pause while hovered, focused, offscreen, or the tab is hidden. Keyboard focus stops rotation until explicit Play. Respect reduced motion by starting paused.
- Support touch swipe and keyboard Left/Right/Home/End. Use visible focus, meaningful image alternatives, 44px targets, and manual-change announcements; avoid announcements during autoplay.
- Reserve responsive image dimensions; lazy-load below-fold images. Keep text readable and avoid page jumps on slide changes or resize.

## Implementation and checks
1. Inspect current invitation/CSS; make additive, invitation-scoped changes. Preserve existing artwork positions where possible.
2. Create sample SVGs and reusable carousel; integrate in `src/InvitationPage.tsx`. Add scoped styles in `src/styles.css`; leave opening behavior intact.
3. Verify all 14 original assets appear on the page outside carousel slides; only samples/event photos rotate.
4. Run `npm run build` in `frontend`. Check 320/390/768/1440px, overflow, contrast, focus, swipe, timer wrapping, Play/Pause, reduced motion, hidden-tab behavior, and resize.
5. Check sample and real-photo fallback, preview restrictions, RSVP accept/decline/party limits/errors/success, and unchanged admin appearance. Report checks actually performed.

Keep execution concise: targeted reads, batched independent checks, no unrelated refactors or duplicate planning documents.
