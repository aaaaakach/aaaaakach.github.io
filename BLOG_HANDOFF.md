# Blog handoff

Updated: 2026-10-09

Use this note to continue the Blog work in a new conversation without needing this chat history.

## Project

- Repository: `https://github.com/aaaaakach/aaaaakach.github.io`
- Local checkout: `C:\Users\caiyu\Documents\Codex\2026-08-14\ponytail\outputs\aaaaakach.github.io-git`
- Branch: `main`
- Blog implementation commit: `8cfeb55` (`Add private Blog timeline`)
- Live route: `https://aaaaakach.github.io/blog.html`
- The site is a static GitHub Pages site using plain HTML, CSS, and JavaScript. There is no frontend framework or build step.

## Current state

- Blog code and navigation changes have been pushed to GitHub.
- The owner reports the Blog Supabase SQL completed successfully (`Success. No rows returned`).
- The owner added `https://aaaaakach.github.io/blog.html` to Supabase Auth Redirect URLs.
- The owner has done an initial live test and reports that the main flow works; some visual and interaction details still need adjustment.
- The owner requested a local refinement pass; these edits are not yet committed or pushed.
- No automated tests or browser preview were run by the coding agent.
- Supabase migration has already been applied. **Do not run `blog/supabase-schema.sql` again**: it creates policies without `IF NOT EXISTS` and is intended as a one-time migration.
- A second additive SQL migration exists at `blog/migrations/002-local-entry-time-and-immutable-posts.sql`. It has **not** been run. Run it once in Supabase before deploying the latest local code. It adds local publication time/timezone fields and disables post updates while preserving existing post dates.

## Confirmed product decisions

- The module is named **Blog** and is a peer destination to PhD Application and Maps.
- Classic personal-blog presentation: each post has its own bordered box with title, date, and plain-text body.
- The main timeline scrolls continuously and groups posts by date. Multiple posts on the same date share a date heading but each post has its own box.
- Desktop has a persistent left date navigator organized by year, month, and dates that have posts. Clicking a date scrolls to it and the current date is highlighted.
- Mobile uses a collapsible date navigator above the timeline.
- Comments appear directly below each post.
- No images, image uploads, image fields, or draft box. The editor publishes a post or clears/discards the unsaved text. Posts cannot be edited after publication; only Maps administrators can delete them.
- The post date, local time, and timezone offset are captured when the administrator publishes. China timezones display local time without an offset; other timezones show `GMT+n` (or the applicable negative/half-hour offset).
- Any signed-in account can read posts/comments and add comments. Signed-out users see a Google sign-in prompt and cannot read Blog data.
- Comments are collapsed by default. `COMMENTS (n)` opens the list; the `COMMENT` button at the right opens the composer. All signed-in users may read and add comments; only Maps administrators may delete any post or comment.
- Signed-in users can export selected posts as Markdown, selecting all dates in a year, a month, or individual days. Exports include post title/date/time/body and all comments for selected posts.
- On desktop, the left year/month/day navigator is resizable with a draggable separator and keyboard controls; it stacks above the timeline on mobile.
- Use the existing English navigation and visual language: near-white background, black/grey text, subtle blue-grey grid, thin dividers, whitespace, Space Grotesk / DM Mono with fallbacks.

## Relevant files

- `blog.html` — Blog page, sign-in gate, editor, export selector, timeline shell.
- `blog.css` — Blog-specific layout, resizable date navigator, and responsive styles; imports shared design through `style.css`.
- `blog.js` — Session gate, Supabase reads/writes, local publication timestamps, date grouping/navigation, collapsible comments, Markdown export, and admin actions.
- `blog/supabase-schema.sql` — One-time schema, grants, and RLS migration. Requires the existing `public.is_map_admin()` function.
- `index.html`, `personal.html`, `phd-application.html`, `maps/index.html` — shared navigation links to Blog; the home page's former Detour 3 now links to Blog.
- `admin.js` — existing shared Google OAuth / Supabase session and Maps admin check. Blog reuses `window.AKACH_ADMIN.client` and its `adminchange` event.
- `supabase-config.js` — existing public Supabase browser configuration. Never add service-role keys or credentials here.
- `AGENTS.md` — project instructions and owner approval / publishing rules. Read it before editing. Its design-contract text may still describe the old Detour 3 placeholder and has not been updated for Blog.

## Database and access notes

The Blog migration creates `public.blog_posts` and `public.blog_comments`, enables RLS, and does not create a Storage bucket. Reads require the `authenticated` role. Post mutations and comment deletion rely on `public.is_map_admin()`. Comment inserts set `created_by` to the signed-in user via `auth.uid()`.

The migration only applies to Blog tables. Maps tables and the Maps photo bucket have their own policies and should not be changed as part of Blog polish.

## Preserve existing repository work

At the last status check, these files were already untracked in the local checkout and were deliberately not included in the Blog commit:

- `maps/HANDOFF.md`
- `maps/plane.svg`
- `maps/supabase-schema.sql`

Do not stage, overwrite, or delete them when making Blog changes.

## Suggested continuation

1. Review `git diff` for the current local refinement and preserve the unrelated untracked Maps files listed below.
2. Before deploying, run the pending additive migration `blog/migrations/002-local-entry-time-and-immutable-posts.sql` once in Supabase. Do not rerun the initial schema.
3. The owner must explicitly approve any GitHub push or deployment.

The `file://` local preview does not support Google OAuth return navigation. The owner chose to leave dynamic local-port OAuth setup for later; production Redirect URL configuration is in place.
