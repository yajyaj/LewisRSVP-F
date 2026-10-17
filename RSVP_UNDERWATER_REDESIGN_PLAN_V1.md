# Interactive RSVP Frontend Enhancement Plan

## 1. Project Objective

Enhance my existing React + TypeScript RSVP frontend with a modern, interactive underwater theme.

**Main requirements:**
- Preserve the existing landing page.
- Preserve the wave transition.
- Preserve existing bubble animations.
- Reuse images from `src/assets/images/`.
- Add a live countdown to January 3, 2027.
- Add venue details and direct Google Maps directions.
- Improve animations, scrolling, and user interactions.
- Enhance the RSVP form's visual design.
- Preserve existing API, event data, and admin functionality.

**Important:** Modify the existing project. Do not rebuild it.

## 2. Token Optimization Rules — Highest Priority

I am using GitHub Copilot Free. Minimize token consumption throughout this task.

1. Read only files relevant to the current task.
2. Do not scan the entire project unnecessarily.
3. Do not repeatedly read unchanged files.
4. Never output complete source files in chat.
5. Apply targeted edits instead of rewriting components.
6. Reuse existing components, functions, and CSS classes.
7. Avoid unnecessary explanations and repeated summaries.
8. Do not install new packages unless absolutely required.
9. Do not create unnecessary files or abstractions.
10. Do not modify unrelated code.
11. Implement one feature at a time.
12. Use existing project dependencies.
13. Do not run the same build or test repeatedly without a reason.
14. Return short reports containing only changed files, results, and errors.
15. Never sacrifice correctness or existing functionality to reduce token usage.

**Preferred response format:**

- Files changed
- Changes made
- Verification result
- Issues, if any

Maximum five concise bullets per implementation phase.

## 3. Files to Inspect

Inspect only the necessary files.

| File | Purpose |
|---|---|
| `src/InvitationPage.tsx` | Countdown, venue, event details, RSVP |
| `src/InvitationExperience.tsx` | Landing and wave |
| `src/BubbleField.tsx` | Existing bubbles |
| `src/styles.css` | Visual styling |
| `src/types.ts` | Existing event data fields |
| `src/api.ts` | API preservation |
| `package.json` | Existing scripts and dependencies |

Read other files only when required.

## 4. Interactive Underwater Design

Use a pastel underwater storybook theme.

**Colors:** ocean blue, aqua, seafoam, lavender, pastel coral, and ivory.

**Design enhancements:**
- Smooth section transitions.
- Subtle scroll-reveal effects.
- Floating underwater decorations.
- Responsive interactive cards.
- Button hover, focus, and tap effects.
- Soft shadows and rounded corners.
- Gentle image movement where appropriate.
- Consistent typography and spacing.

Use existing images:

- `ocean-background.jpg`
- `bluewhale.jpg`
- `green-turtle.jpg`
- `jelly-fish.jpg`
- `crab.jpg`

Inspect actual image appearance before placement.

Keep animations lightweight using CSS and existing React functionality.

Respect `prefers-reduced-motion`.

Do not introduce excessive animations or new animation libraries.

## 5. Preserve Existing Animations

### Landing page

Keep the landing page as the first screen.

Preserve the “You Are Invited” button and its current behavior.

Improve styling only.

### Wave animation

Keep the existing wave implementation, animation handlers, fallback timers, and state transitions.

Do not rewrite the animation engine.

### Bubble animation

Keep `BubbleField.tsx`.

Preserve bubble movement, cleanup, responsiveness, and existing RSVP burst effects.

Only change bubble styling unless a specific bug is identified.

Decorative elements must never block user interactions.

## 6. Live Countdown Section

Create an interactive countdown to:

**January 3, 2027**

Display:

- Days
- Hours
- Minutes
- Seconds

### Requirements

- Update once per second.
- Use one timer with proper cleanup.
- Avoid negative values.
- Display a celebration message when the countdown reaches zero.
- Use the existing event start time and timezone if available.
- If no event time is configured, ask whether to use midnight or a specific time.
- Avoid timezone inconsistencies.
- Support mobile layouts.
- Use rounded underwater-themed countdown cards.
- Keep animations subtle and accessible.

Suggested heading:

**“The Ocean Adventure Begins In…”**

Place the countdown below the event hero.

## 7. Google Maps Venue Section

Add a section titled:

**“Find Your Way to the Celebration”**

Display existing event information:

- Venue name.
- Full address.
- Event date and time.
- Location instructions, if available.
- Google Maps directions button.

### Google Maps integration

Use existing venue data.

For a verified location:

`https://www.google.com/maps/search/?api=1&query=LATITUDE,LONGITUDE`

For directions:

`https://www.google.com/maps/dir/?api=1&destination=ENCODED_DESTINATION`

Use actual coordinates or a verified address. Properly encode destination values.

Never invent a location or coordinates.

If the location is unavailable, request the exact venue address or Google Maps pin.

### Interactive design

- Add a location card with a map-pin icon.
- Add an “Open Google Maps” button.
- Add a “Get Directions” button.
- Optionally include a responsive embedded map if it works without new credentials or dependencies.
- Keep all map actions accessible on mobile.

Do not add a paid Maps API or expose API keys.

## 8. Additional Event Details

Improve the invitation with optional sections.

### Event timeline

Show actual schedule information if available.

Examples of supported fields:
- Time
- Activity
- Description

Do not invent event activities.

### Guest information

Display existing details such as:

- Dress code.
- Parking information.
- Arrival instructions.
- What to bring.
- Contact information.
- RSVP deadline.

Only show sections supported by real event data.

Do not modify backend schemas without approval.

### Photo gallery

Preserve existing uploaded images and gallery behavior.

Improve spacing, responsiveness, and subtle hover effects.

## 9. RSVP Form Enhancement

Improve the existing form visually.

Add or refine:

- Clear attendance selection.
- Better input spacing.
- Focus and selected states.
- Loading indicators.
- Accessible validation messages.
- Success/error presentation.
- Mobile-friendly controls.

Preserve:

- Existing fields and values.
- Validation logic.
- Guest-count rules.
- API endpoints.
- Request payloads.
- Submission behavior.
- Response-key handling.
- LocalStorage behavior.
- Existing success/error logic.

Do not add fake submissions or change the backend contract.

## 10. Responsive Design

Support:

- Mobile: 320px–430px.
- Tablet.
- Desktop.

Ensure:

- No horizontal overflow.
- No overlapping elements.
- Responsive countdown.
- Accessible venue buttons.
- Readable event details.
- Functional RSVP inputs.
- Smooth scrolling.
- Reduced-motion accessibility.

## 11. Implementation Phases

### Phase 1 — Inspect

Read the relevant files.

Identify existing components, event fields, and possible issues.

**Do not edit anything yet.**

Wait for approval.

### Phase 2 — Countdown

Implement the countdown with minimal code changes.

Verify timer behavior and cleanup.

### Phase 3 — Venue and Maps

Use existing venue data.

Add direct Maps and directions links.

Do not invent coordinates.

### Phase 4 — Interactive UI

Enhance styling, transitions, event details, and image placement.

Preserve landing, wave, and bubbles.

### Phase 5 — RSVP Styling

Improve form appearance without changing submission behavior.

### Phase 6 — Verification

Run the existing build command, if configured.

Check:

- Landing and wave.
- Bubbles.
- Countdown.
- Google Maps links.
- RSVP behavior.
- Mobile responsiveness.
- TypeScript errors.
- Admin route preservation.

Do not submit a real RSVP during testing.

Report anything not verified.

## 12. Final Instructions

Prioritize:

1. Existing functionality.
2. Minimal code changes.
3. Interactive user experience.
4. Mobile responsiveness.
5. Token efficiency.

**Start with Phase 1 only. Inspect the necessary files, report the minimal changes required, and wait for approval.**