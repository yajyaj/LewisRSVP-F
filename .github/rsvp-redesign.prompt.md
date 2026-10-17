# TASK: Redesign My Existing RSVP Website — Underwater Watercolor Theme

You are my senior frontend developer. I am using **GitHub Copilot Free in VS Code**.

My existing technology stack is:
- React
- TypeScript
- Vite
- Tailwind CSS

## 1. Read the project instructions

First, locate and read `RSVP_UNDERWATER_REDESIGN_PLAN.md` in my project root.

Treat this file as the main design and implementation specification. Follow its requirements.

If the file cannot be found, tell me instead of pretending you have read it.

## 2. Understand my existing project

Before editing any files, inspect the relevant parts of my project.

Identify:
- The React entry point and main application component.
- The current RSVP page and its components.
- Existing TypeScript types and state management.
- The installed Tailwind CSS version and configuration.
- Existing stylesheets, images, and other assets.
- RSVP fields, validation, and form submission logic.
- Existing API endpoints, backend services, and database integrations.
- Existing success, error, and loading states.
- Existing package scripts and available tests.

Do not expose secrets or environment-variable values.

Do not read every file unnecessarily. Start with `package.json`, the app entry point, the relevant components, and the files connected to the RSVP flow.

## 3. Design objective

Redesign the website using the visual theme of my underwater invitation reference image.

Ignore all text and event details in the reference image.

Use these visual elements:
- Soft blue watercolor ocean backgrounds.
- Muted indigo and periwinkle shapes.
- Pastel coral, peach, lavender, and seafoam accents.
- Friendly whales, turtles, jellyfish, crabs, stingrays, and starfish.
- Floating bubbles, coral, and sea plants.
- Rounded invitation cards, soft shadows, and hand-painted textures.
- A gentle, playful, family-friendly atmosphere.

Keep the interface elegant and readable. Marine illustrations must not cover the RSVP form or important text.

## 4. Build the interactive landing page

Create a welcoming landing screen before the existing RSVP content.

Requirements:
- Fill the screen with the underwater watercolor theme.
- Add a prominent button labeled exactly: "You Are Invited".
- Include subtle decorative bubbles and marine illustrations.
- Give the button a gentle hover, focus, and click effect.
- Make the button work with a mouse, touchscreen, and keyboard.

Do not duplicate the existing RSVP form.

## 5. Implement the wave reveal

When a guest activates "You Are Invited":

1. Trigger a smooth ocean-wave animation.
2. Let the wave rise from the bottom or sweep across the screen.
3. Cover the landing screen briefly.
4. Reveal the existing RSVP website.
5. Finish the animation cleanly so the guest can interact with the form.

Technical requirements:
- Use React state and typed components.
- Prefer CSS animations or lightweight SVG.
- Use the existing Tailwind CSS setup and custom CSS only when needed.
- Do not install unnecessary packages.
- Do not reload the page just to reveal the RSVP.
- Do not accidentally reset form state or lose guest input.
- Prevent repeated clicks while the transition is running.
- Respect `prefers-reduced-motion`.
- Keep the animation smooth on mobile devices.

Keep the animation logic separate from form submission logic.

## 6. Redesign the existing RSVP content

Once the wave finishes, display my existing RSVP website with the new underwater theme.

Improve:
- Colors and typography.
- Spacing and responsive layout.
- Invitation cards and section backgrounds.
- Buttons and form controls.
- Focus states and validation messages.
- Marine illustrations and decorative details.
- Loading, success, and error states.

Use Tailwind CSS according to the version already installed in the project.

Do not invent event details. Keep the existing event name, date, time, venue, address, and other content.

## 7. Critical preservation rules

This is a visual redesign, NOT a new application.

You MUST preserve:
- Existing RSVP fields and field names.
- Existing form validation.
- Existing submission handlers.
- Existing API request formats and endpoints.
- Existing backend and database integrations.
- Existing confirmation and error behavior.
- Existing routing, authentication, admin features, and other working functionality.
- Existing environment configuration and package dependencies unless a change is necessary and approved.

Never replace real functionality with fake data, a demo form, `alert()` calls, or a mock success message.

Never hardcode secrets or expose environment-variable values.

If a proposed change may affect guest data or submission behavior, stop and ask me first.

## 8. Token-saving workflow for Copilot Free

Work in the following phases.

### Phase A — Inspect only
Read the Markdown plan and inspect the relevant files.

Return a concise report containing:
- Current architecture.
- Existing RSVP submission flow.
- Files that need changes.
- Risks to existing functionality.

Do not edit files yet.

### Phase B — Plan
Propose a minimal file-by-file implementation plan.

Explain what each file needs to change and how you will preserve the existing RSVP flow.

Do not repeat the entire Markdown plan.

### Phase C — Implement
After I approve the plan, make focused edits.

Implement the landing screen first, then the wave animation, then the visual redesign.

Avoid rewriting entire files when a smaller change is sufficient.

Do not modify unrelated files.

### Phase D — Verify
Use the project's existing scripts to check the implementation.

Verify:
- The landing page renders.
- The "You Are Invited" button works.
- The wave animation reveals the RSVP content.
- Reduced-motion preferences are respected.
- All existing RSVP fields remain present.
- Validation still works.
- Existing submission requests still work.
- Success and error states remain functional.
- Mobile layouts do not overflow.
- No new TypeScript, build, or browser-console errors have been introduced.

Do not claim a test passed unless you actually ran it or verified it.

### Phase E — Report
Provide a short summary of:
- Files changed.
- Features completed.
- Checks performed and results.
- Any remaining tasks.

## 9. Final instructions

- Keep responses concise to conserve my Copilot Free usage.
- Inspect before editing.
- Work incrementally.
- Use the existing React + TypeScript + Vite + Tailwind CSS stack.
- Follow `RSVP_UNDERWATER_REDESIGN_PLAN.md`.
- Ask before risky changes.
- Preserve all existing RSVP functionality.

**START WITH PHASE A ONLY. Inspect my project and report your findings. Do not edit any files until you have completed the inspection and proposed the plan.**