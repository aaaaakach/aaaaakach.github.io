# akach Personal Website — PRD

## 1. Overview

| Item | Current decision |
| --- | --- |
| Site name | `akach` (always lowercase) |
| Public address | `aaaaakach.github.io` |
| Planned custom domain | `vegfish.top` (configuration and publishing are still pending) |
| Product type | Static multi-page personal website |
| Current status | Home, PHD APPLICATION, MAPS, and private BLOG are implemented |
| Primary language | English + Simplified Chinese |
| Primary message | `Construction zone / 建设中` |
| Reference | [Yuri.WG Portfolio](https://yuri-wg-portfolio.pages.dev/) — use its information rhythm only, not its content or assets |

## 2. Product goal

Create a calm, memorable personal website that introduces `akach` and connects visitors to the owner's current workspaces: PHD APPLICATION, MAPS, and BLOG. Home provides the shared identity, navigation, and visual language for these destinations.

### Current success criteria

- The name `akach` is immediately visible in the upper-left corner.
- A visitor can understand that the site is under construction in both languages.
- Every page exposes the same four global navigation destinations: Home, PHD APPLICATION, MAPS, and BLOG.
- Home links to the three implemented destinations below its hero.
- The design feels intentional on desktop and mobile without a frontend framework or build step.
- GitHub Pages serves the static site from the repository root.

## 3. Scope

### Current scope

- Shared responsive navigation and visual styles.
- Home hero and three links to current site destinations.
- PHD APPLICATION workspace.
- Interactive MAPS page with Supabase-backed data and administrator editing.
- Private BLOG with Supabase authentication, posts, comments, search, and Markdown export.
- Keyboard-visible focus states and semantic landmarks across pages.

### Not part of the current site scope

- A new site-wide motion system; page-specific interactions remain governed by their own requirements.
- Avatar, portrait, social links, email, contact form, or project links.
- A frontend framework or build pipeline.
- A dark-mode switch or language switcher.

Changes to product scope, external services, or dependencies require owner approval.

## 4. Target audience and intent

The initial audience is people who arrive through the personal URL. They should leave with three impressions:

1. This is akach's personal space.
2. The site is actively being made.
3. More distinct work or directions will appear here later.

There is no conversion goal. The visual experience and clear access to the current site sections are the goal.

## 5. Information architecture

```text
Home
├── PHD APPLICATION → phd-application.html
├── MAPS             → maps/
└── BLOG             → blog.html
```

The global navigation links to Home and these same three current destinations. The Home hero's scroll cue leads to the destination list below it.

## 6. Content inventory

| Area | English | 中文 | Status |
| --- | --- | --- | --- |
| Wordmark | `akach` | — | Final for v1 |
| Browser title | `akach — Construction zone` | — | Provisional |
| Hero headline | `akach` | — | Final for v1 |
| Hero message | `Construction zone` | `建设中` | Provisional |
| Status label | `WORK IN PROGRESS` | — | Provisional |
| Scroll cue | `explore below` | — | Provisional |
| Navigation | `HOME`, `PHD APPLICATION`, `MAPS`, `BLOG` | — | Current |
| Home destination links | PHD APPLICATION, MAPS, BLOG | — | Current |
| Footer | `© 2026 akach` | `More coming soon. / 更多内容即将到来。` | Current; retain |

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

### 7.3 Home destinations

- Appears directly beneath the hero.
- Has three full-width rows numbered `01`–`03`.
- Each row links to one implemented site destination and may include a short subtitle.
- Hover and keyboard focus add only a subtle pale-blue background and spacing change.
- These rows are actual navigation entrances, not placeholders.

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
| Hover fill | `#f5f7ff` | Home destination interaction |
| Display font | Space Grotesk | Headlines and interface text |
| Mono font | DM Mono | Wordmark, labels, footer |

Fonts are loaded from Google Fonts with system-font fallbacks. If external font loading is unavailable, the page remains legible.

## 9. Technical specification

### Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and content |
| `personal.html` | Personal identity and sign-in entry |
| `phd-application.html` | PHD APPLICATION workspace |
| `maps/index.html`, `maps/maps.js` | MAPS page and interactions |
| `blog.html`, `blog.css`, `blog.js` | Private BLOG page and interactions |
| `style.css` | All layout, typography, colors, responsiveness, and hover styles |
| `admin.js`, `supabase-config.js` | Shared sign-in and browser client configuration |
| `PRD.md` | This product specification |
| `AGENTS.md` | Instructions for future contributors and agents |

### Implementation choices

- Plain HTML, CSS, and JavaScript; no frontend framework or build process.
- Supabase JS is loaded from a CDN for authentication and data access; MAPS also loads Globe.GL.
- Native anchors provide page navigation and in-page scrolling.
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
- Decide whether to add any new site destination or major section.
- Add an About section, photo, bio, work samples, email, or social channels.
- Choose whether the site should become bilingual per section, per page, or via a language switcher.
- Require owner approval for new site-wide motion. Page-specific behavior remains governed by its product requirements.

## 12. Publishing checklist

1. Publish the complete site from the repository root so all current pages, scripts, styles, data, and assets are included.
2. Commit and push to the default branch configured for GitHub Pages.
3. In GitHub repository settings, ensure Pages deploys from that branch and the repository root.
4. Visit `https://aaaaakach.github.io/` after deployment and check the desktop and mobile layouts.
5. Obtain owner approval before publishing or changing repository settings.

## 13. Personal Space Expansion

### 13.1 Personal Space Direction

Home is the entry point to `akach` as a personal space rather than a traditional portfolio or resume website. Its three destination rows link to PHD APPLICATION, MAPS, and BLOG.

### 13.2 PHD APPLICATION

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

The Home destination list and global navigation link to **Maps** at `/maps/`, retaining the site's shared hierarchy, typography, hover/focus treatment, and responsive behavior.

### 14.2 Scope boundary

Maps is part of the same personal website, but its detailed product, interaction, data, motion, accessibility, security, and performance requirements live in [`MAPS_PRD.md`](MAPS_PRD.md). That document is authoritative for Maps-specific decisions; this `PRD.md` remains the website-level product specification.

Maps has an approved scope for its JavaScript/WebGL, motion, Supabase data, authentication, storage, and narrowly necessary dependencies. Blog and shared administrator-session behavior are described in `BLOG_HANDOFF.md` and `MAPS_PRD.md`. These features do not authorize unrelated frameworks, dependencies, or build tooling.

### 14.3 Integration constraints

- Preserve the existing global wordmark, navigation language, visual tokens, accessibility baseline, and responsive behavior.
- Load Maps-only code, geographic data, WebGL, and media after entering `/maps/`; Home must remain lightweight.
- Administrator authentication begins from the site-level `akach` identity entry and is shared with Maps. Successful authorized login changes the global label from `akach` to `me` as specified in `MAPS_PRD.md`.
- Do not use either Markdown document as runtime content or configuration.
