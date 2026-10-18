# Phase B asset review

Status: 10 generated images saved and optimized; ready for review before Phase C. Generation cap: **10 total**, including every image already generated. No additional variants, replacements, or placeholder generations are authorized.

Generated with the built-in imagegen tool from the approved concept board. Exact prompts: [IMAGE_GENERATION_PROMPTS.md](IMAGE_GENERATION_PROMPTS.md). Original exports: `../design-source/underwater/`. Machine-readable dimensions, source/export sizes, and SHA-256 hashes: [asset-manifest.json](../design-source/underwater/asset-manifest.json).

## Optimized exports

All dimensions are actual output dimensions, not assumed prompt dimensions. All WebP exports were decoded successfully, preserve source dimensions, and preserve transparent alpha pixels exactly. Quality 88, WebP method 6. PNG source masters remain separate and are not imported into the application.

| Asset | Actual dimensions | KiB | Alpha | Intended usage |
| --- | --- | ---: | --- | --- |
| [whale-hero.webp](../src/assets/images/underwater/whale-hero.webp) | 1568 x 1003 | 252.5 | Yes | Hero companion |
| [starfish-happy.webp](../src/assets/images/underwater/starfish-happy.webp) | 1254 x 1254 | 146.7 | Yes | Welcome accent |
| [seahorse-friendly.webp](../src/assets/images/underwater/seahorse-friendly.webp) | 1024 x 1536 | 173.0 | Yes | Unique details/form accent |
| [baby-waving.webp](../src/assets/images/underwater/baby-waving.webp) | 1254 x 1254 | 155.7 | Yes | Generic illustrated host beside RSVP |
| [coral-left.webp](../src/assets/images/underwater/coral-left.webp) | 1254 x 1254 | 243.6 | Yes | Left scene edge |
| [coral-right.webp](../src/assets/images/underwater/coral-right.webp) | 1254 x 1254 | 219.5 | Yes | Distinct right scene edge |
| [shell-card.webp](../src/assets/images/underwater/shell-card.webp) | 1536 x 1024 | 81.5 | Yes | Decorative shell surface; live HTML content |
| [treasure-chest.webp](../src/assets/images/underwater/treasure-chest.webp) | 1536 x 1024 | 188.5 | Yes | Confirmed RSVP success |
| [ocean-backdrop-desktop.webp](../src/assets/images/underwater/ocean-backdrop-desktop.webp) | 1672 x 941 | 126.4 | No | Wide ocean background |
| [ocean-backdrop-mobile.webp](../src/assets/images/underwater/ocean-backdrop-mobile.webp) | 1024 x 1536 | 68.8 | No | Portrait mobile background |

## Reuse and placement decisions

- Preserve the four current carousel illustrations and their imports. They provide baby/whale, baby/starfish, baby/seahorse, and birthday/cake scenes; no replacement collection was generated.
- Existing unused Canva files are standalone starfish/seahorse illustrations, not extra baby poses. Keep them as existing alternatives; do not delete them.
- All generated baby artwork is a generic fictional character, consistent with the existing illustrated baby; no real-child likeness was used.
- Keep artwork out of the header/footer. Use coral clusters in selected scene edges, not repeated per-section motifs.
- Never bake event data into imagery. The shell is decorative; build a solid readable CSS card underneath live text and controls rather than clipping a form to the shell silhouette.

## Visual review and limitations

- Reviewed the 10 individual generated outputs for subject, palette, text-free composition, and usable silhouettes. Left/right coral arrangements differ; backgrounds provide clear center space. Existing originals are untouched.
- Seahorse, shell, and treasure exports include soft semitransparent glow beyond their silhouettes. Verify them over the actual aqua/cream surfaces during implementation; do not claim pixel-perfect alpha edges on every background.
- The whale is 1568px wide and the desktop backdrop is 1672px wide, below the plan's suggested 1600px/1920px source targets. Retained at native resolution without artificial upscaling or further generation. Check sharpness at desktop display sizes; prefer constrained artwork and a CSS base gradient.
- Browser layout, contrast, responsive rendering, and visual performance remain unverified until assets are integrated in approved phases.
- No additional image generation will occur without a new explicit change to the 10-image cap.

## Reproducibility

`../design-source/underwater/prepare_assets.py` exports these same PNG masters using Pillow, with assertions for exactly 10 images, output dimensions, expected transparency, and identical alpha channels. Pillow was installed only into a temporary tools folder; project package dependencies were not changed. No third-party license/attribution metadata was supplied by the generation tool; no exclusivity claim is made.
