# AGENTS.md

## Project

This is the personal GitHub Pages homepage for `akach` at `aaaaakach.github.io`.

The homepage is intentionally a tiny static site:

- `index.html` — content and structure
- `style.css` — all presentation
- No JavaScript, package manager, framework, or build step for the homepage by default

The Maps subpage is an approved scoped exception. Read `MAPS_PRD.md` before any Maps work. Maps may use JavaScript/WebGL, map data, Supabase, authentication, storage, and narrowly chosen dependencies when they are necessary for the approved experience. These exceptions do not change the default rules for Home or other detours.

## Owner approval rule

Before changing any page content, design direction, navigation, dependency, asset, publishing configuration, or repository state, describe the proposed change and ask the owner for approval.

Read-only inspection, explaining options, and drafting a proposal are allowed without approval. Do not treat a request for an idea or critique as permission to implement it.

## Current design contract

- The wordmark is always lowercase: `akach`.
- Header layout: wordmark at upper-left; centered `Home / DETOUR 1 / DETOUR 2 / DETOUR 3` navigation on desktop.
- The main message is bilingual: `Construction zone / 建设中`.
- Keep the visual language sparse: near-white canvas, black/grey text, very subtle blue-grey grid, thin dividers, large type, and ample whitespace.
- Detours remain placeholders unless a product document assigns them. `PHD APPLICATION` and `Maps` are approved destinations; Maps uses `/maps/` and is specified in `MAPS_PRD.md`.
- Do not copy text, visual assets, icons, or distinctive treatments from the reference site. Only its broad page rhythm was used as inspiration.
- Do not add animation unless the owner explicitly approves it. The spatial and feedback animations specified in `MAPS_PRD.md` are already approved for Maps only.

## Implementation rules

- Prefer native HTML and CSS. Do not add a library, framework, or build tool for a feature that CSS or a small amount of plain markup can handle.
- Keep changes small and local. Do not add abstractions for future possibilities.
- Maintain semantic landmarks and keyboard-visible focus states.
- Keep the page responsive without JavaScript.
- Preserve bilingual text where it already exists; ask before choosing new Chinese or English copy.
- Use system fallbacks for typography; external fonts must never be required for basic readability.

## Maps-specific implementation rules

- Keep Maps isolated from the homepage. Load WebGL, geographic data, photos, and other heavy resources only after entering `/maps/`.
- Preserve the existing header, wordmark, design tokens, responsiveness, semantic structure, keyboard-visible focus, and readable fallbacks unless `MAPS_PRD.md` explicitly requires a scoped variation.
- Prefer the smallest viable dependency set. Technology suggestions in `MAPS_PRD.md` are options, not permission to add all listed libraries.
- Treat region records and Pin records as separate data models. Do not infer visited state or statistics from Pins.
- Never put administrator email allowlists, service-role keys, secrets, or write authorization solely in client-side code. Enforce writes with Supabase Auth, Row Level Security, and Storage policies.
- Use reliable geographic data and document its source and license. The China view must follow the geographic coverage specified in `MAPS_PRD.md`.
- Implement mouse, touch, and keyboard-equivalent access where applicable. Honor `prefers-reduced-motion` and keep core actions usable without hover or full motion.
- Do not refactor unrelated Home or PHD APPLICATION code while implementing Maps.

## Verification

After an approved change:

1. Check that the HTML still has one `h1`, meaningful landmarks, and usable links.
2. Check desktop and narrow mobile widths.
3. Check keyboard focus visibility and text legibility.
4. Confirm no unapproved content, dependencies, or external services were added.

For approved Maps changes, also verify desktop/touch behavior, keyboard access, reduced-motion behavior, lazy loading, WebGL fallback behavior, authorization boundaries, and that Home loading is not materially regressed.

## Publishing

GitHub Pages should serve `index.html` from the repository root. Do not push, deploy, modify repository settings, or upload files without explicit owner approval.
