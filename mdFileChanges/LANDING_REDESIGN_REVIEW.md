# Landing screen redesign

Implemented 2026-10-18 using the existing underwater assets and invitation design tokens. No new image generation; the total remains 10.

## Changes

- Replaced the dark central panel with a spacious illustrated desktop composition: smiling whale on one side, cream invitation card on the other.
- Used the invitation's optimized aqua desktop/mobile backgrounds, rounded headings, deep ocean text, and teal pill CTA.
- Added a restrained whale float, four existing decorative bubbles, simple brand text, and an opening-status announcement.
- Mobile layout prioritizes the invitation and button, followed by the whale. Short screens can scroll within the landing screen while the underlying invitation remains locked and inert.
- Preserved button accessible name, opening guard, wave animation/completion fallback, reduced-motion immediate opening, scroll restoration, and header focus after reveal. No hardcoded event information was added to the generic landing screen.

## Validation

- `npm.cmd run build` passed.
- `node frontend/design-source/landing-qa.cjs` passed checks at 320x568, 375x812, 390x844, 768x1024, 1024x900, 1440x1000, and landscape 844x390. No horizontal overflow; the CTA remains reachable with a minimum 44px target.
- Verified keyboard opening, hidden invitation inertness, reduced-motion behavior, body scroll restoration, animated wave opening, duplicate-click guard, focus return to the revealed header, and no JavaScript errors.
- Reviewed [desktop screenshot](../design-source/qa-results/landing-1440.png) and [mobile screenshot](../design-source/qa-results/landing-390.png).
- Verification used headless Edge with temporary Playwright tooling. Physical devices, other browsers, and assistive-technology speech remain unverified. This change did not modify API or RSVP logic.

## Restore point

Verified SHA-256 backup: `C:\Users\Jayjay\Documents\WorkProjects\planned_rsvp-redesign-backups\landing-20261018-152034`. See [rollback log](REDESIGN_ROLLBACK_LOG.md) for selective restoration.
