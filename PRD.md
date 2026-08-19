# akach Personal Homepage — PRD

## 1. Overview

| Item | Current decision |
| --- | --- |
| Site name | `akach` (always lowercase) |
| Public address | `aaaaakach.github.io` |
| Product type | Personal homepage / landing page |
| Current status | First static framework; content is intentionally provisional |
| Primary language | English + Simplified Chinese |
| Primary message | `Construction zone / 建设中` |
| Reference | [Yuri.WG Portfolio](https://yuri-wg-portfolio.pages.dev/) — use its information rhythm only, not its content or assets |

## 2. Product goal

Create a calm, memorable personal homepage that introduces `akach` and provides a durable shell for future work. The first release is deliberately sparse: it establishes navigation, hierarchy, and visual identity without pretending that the destination content already exists.

### Success criteria for v1

- The name `akach` is immediately visible in the upper-left corner.
- A visitor can understand that the site is under construction in both languages.
- The page exposes four clear navigation destinations: Home and three future detours.
- The design feels intentional on desktop and mobile without animation, a content management system, or a JavaScript build step.
- The site can be published by uploading the files in this directory to the root of the GitHub Pages repository.

## 3. Scope

### Included in v1

- One responsive static homepage.
- Header navigation.
- Hero / construction-zone message.
- Three placeholder content entrances.
- Simple footer.
- Keyboard-visible focus states and semantic landmarks.

### Explicitly excluded from v1

- Motion, scroll effects, cursor effects, or other animation.
- Avatar, portrait, social links, email, contact form, or project links.
- Individual pages for the three detours.
- CMS, analytics, backend, packages, frameworks, and build tooling.
- A dark-mode switch or language switcher.

Add any excluded item only after the site owner confirms it.

## 4. Target audience and intent

The initial audience is people who arrive through the personal URL. They should leave with three impressions:

1. This is akach's personal space.
2. The site is actively being made.
3. More distinct work or directions will appear here later.

There is no conversion goal yet. The visual experience and a clear future-facing structure are the goal.

## 5. Information architecture

```text
Home
├── Home (#home)
├── DETOUR 1 (#detour-1)   — placeholder
├── DETOUR 2 (#detour-2)   — placeholder
└── DETOUR 3 (#detour-3)   — placeholder
```

The hash links are deliberate placeholders. When real destinations exist, replace each target with its final URL or page path. Do not create empty pages early.

## 6. Content inventory

| Area | English | 中文 | Status |
| --- | --- | --- | --- |
| Wordmark | `akach` | — | Final for v1 |
| Browser title | `akach — Construction zone` | — | Provisional |
| Hero headline | `akach` | — | Final for v1 |
| Hero message | `Construction zone` | `建设中` | Provisional |
| Status label | `WORK IN PROGRESS` | — | Provisional |
| Scroll cue | `explore below` | — | Provisional |
| Navigation | `Home`, `DETOUR 1`, `DETOUR 2`, `DETOUR 3` | — | Provisional except Home |
| Each detour subtitle | `Coming soon` | `即将开放` | Placeholder |
| Footer | `© 2026 akach` | `More coming soon. / 更多内容即将到来。` | Provisional |

## 7. Page specification

### 7.1 Header

- Sits at the top of the page, separated from the content by a thin line.
- The left-most item is the `akach` wordmark and links to Home.
- Navigation is centered on wide screens.
- The active Home item has a dark underline.
- On narrow screens, the header becomes two rows: wordmark first, horizontally scrollable navigation second.

### 7.2 Hero

- Fills at least the remaining viewport height after the header on desktop.
- Uses a near-white background overlaid with a very light blue-grey square grid.
- Contains a small `WORK IN PROGRESS` status at the upper-left.
- Places a very large `akach` headline at the visual center.
- Places `Construction zone / 建设中` at the right side of the headline area.
- Ends with a text-only downward exploration cue.
- Contains no animation and no decorative image assets.

### 7.3 Detour list

- Appears directly beneath the hero.
- Has three full-width rows numbered `01`–`03`.
- Every row contains the detour name, bilingual coming-soon text, and an arrow.
- Hover and keyboard focus add only a subtle pale-blue background and spacing change.
- Rows are placeholders, not promises of a final content taxonomy.

### 7.4 Footer

- Displays copyright and a short bilingual future-facing message.
- Stacks vertically on small screens.

## 8. Visual direction

### Principles

- Minimal, open, slightly technical, and editorial.
- High whitespace-to-content ratio.
- Soft grid structure rather than illustrative decoration.
- Typography is the main visual anchor.
- Reference the rhythm of the cited inspiration: wordmark + navigation, a large quiet hero, then numbered content directions. Do not reproduce its dot-matrix treatment, flowers, copy, icons, or other brand-specific elements.

### Tokens

| Token | Value | Use |
| --- | --- | --- |
| Page background | `#fcfcfb` | Main canvas |
| Main text | `#161616` | Headings and primary navigation |
| Secondary text | `#777777` | Supporting content |
| Divider | `#e9e9e9` | Header and row rules |
| Grid | `#dfe7ff` | Hero structure |
| Hover fill | `#f5f7ff` | Detour interaction |
| Display font | Space Grotesk | Headlines and interface text |
| Mono font | DM Mono | Wordmark, labels, footer |

Fonts are loaded from Google Fonts with system-font fallbacks. If external font loading is unavailable, the page remains legible.

## 9. Technical specification

### Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and content |
| `style.css` | All layout, typography, colors, responsiveness, and hover styles |
| `PRD.md` | This product specification |
| `AGENTS.md` | Instructions for future contributors and agents |

### Implementation choices

- Plain HTML and CSS only.
- No JavaScript.
- No npm packages, framework, build process, or generated assets.
- Native anchors provide navigation and scrolling.
- GitHub Pages can serve the site directly.

## 10. Accessibility and quality requirements

- Use semantic `header`, `nav`, `main`, `section`, and `footer` elements.
- Provide descriptive navigation labels and a wordmark accessible name.
- Keep keyboard focus visible for links.
- Maintain readable text contrast against the background.
- Preserve page usability at small widths; navigation must not clip.
- Keep the core page usable when Google Fonts cannot load.
- Do not add visual-only controls that cannot be used with a keyboard.

## 11. Future decisions (require owner approval)

- Replace `Construction zone / 建设中` with a final personal statement.
- Decide the meaning and final names of the three detours.
- Add or remove detours.
- Add an About section, photo, bio, work samples, email, or social channels.
- Choose whether the site should become bilingual per section, per page, or via a language switcher.
- Add motion only if it supports the content rather than merely decorates it.
- Add individual detour pages only once they contain real material.

## 12. Publishing checklist

1. Copy `index.html`, `style.css`, `PRD.md`, and `AGENTS.md` into the root of `aaaaakach.github.io`.
2. Commit and push to the default branch configured for GitHub Pages.
3. In GitHub repository settings, ensure Pages deploys from that branch and the repository root.
4. Visit `https://aaaaakach.github.io/` after deployment and check the desktop and mobile layouts.
5. Before replacing placeholders or adding features, ask the owner for approval.

## 13. Personal Space Expansion

### 13.1 Personal Space Direction

The homepage is the entry point to `akach` as a personal space rather than a traditional portfolio or resume website.

The three detours on the homepage are top-level entrances to future independent spaces. They are replaceable placeholders rather than a fixed information architecture.

### 13.2 PHD APPLICATION

`DETOUR 1` is replaced by `PHD APPLICATION`.

Clicking `PHD APPLICATION` opens a separate next-level webpage dedicated to managing the user's PhD application process.

The PHD APPLICATION page uses a two-column layout:

- Left column: persistent navigation
- Right column: corresponding content area

### 13.3 PHD APPLICATION Navigation

The left navigation contains:

1. Overview
2. Deadlines
3. Programs
4. Professors
5. Outreach
6. Documents

`Interviews` is not included in the current navigation.

The right content area changes according to the selected navigation item.

### 13.4 PHD APPLICATION Content Direction

The PHD APPLICATION space is intended for the user's own application management rather than public presentation.

Examples of information to be managed include:

- Application deadlines for different programs
- Program information
- Professor information
- Outreach / cold-email records and follow-up history
- Application documents and related materials

The detailed fields and interaction design for each section will be defined separately before implementation.

### 13.5 Markdown Files

Markdown files such as `PRD.md` and `AGENTS.md` are planning and instruction documents only. They are not runtime data sources for the website and should not be read or rendered by the website as part of its functionality.

## 14. Maps Expansion

### 14.1 Approved destination

One remaining Detour placeholder is assigned to **Maps**. Its homepage label becomes `Maps` and links to the independent `/maps/` subpage while retaining the same hierarchy, typography, hover/focus treatment, and responsive behavior as sibling entrances.

### 14.2 Scope boundary

Maps is part of the same personal website, but its detailed product, interaction, data, motion, accessibility, security, and performance requirements live in [`MAPS_PRD.md`](MAPS_PRD.md). That document is authoritative for Maps-specific decisions; this `PRD.md` remains the website-level product specification.

Maps is an approved exception to the v1 exclusions for an individual subpage, JavaScript/WebGL, motion, backend services, authentication, storage, and narrowly necessary dependencies. The exception applies only to Maps and shared administrator-session behavior explicitly described in `MAPS_PRD.md`; it does not silently expand the scope of Home or other detours.

### 14.3 Integration constraints

- Preserve the existing global wordmark, navigation language, visual tokens, accessibility baseline, and responsive behavior.
- Load Maps-only code, geographic data, WebGL, and media after entering `/maps/`; Home must remain lightweight.
- Administrator authentication begins from the site-level `akach` identity entry and is shared with Maps. Successful authorized login changes the global label from `akach` to `me` as specified in `MAPS_PRD.md`.
- Do not use either Markdown document as runtime content or configuration.
