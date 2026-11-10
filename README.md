# vegfish Personal Website

Static multi-page personal website hosted on GitHub Pages. The shared top
navigation links to Home, PHD APPLICATION, MAPS, and BLOG. Home's three
destination rows link to the latter three pages.

## Pages and code

- `index.html` — Home and destination links
- `phd-application.html` — PhD application workspace
- `maps/index.html` and `maps/maps.js` — interactive travel map
- `blog.html`, `blog.css`, and `blog.js` — private Blog
- `style.css` and `admin.js` — shared presentation and sign-in state

The site uses plain HTML, CSS, and JavaScript without a package manager or
build step. Supabase provides authentication and persistent Blog/Maps data;
Maps also loads Globe.GL from a CDN.

## Local preview

Open PowerShell in the repository root (the folder containing `index.html`),
then run:

```powershell
py -m http.server 8000
```

Keep that PowerShell window open and visit `http://localhost:8000/index.html`.
For example, the current checkout is at
`C:\Users\蔡予\Documents\Codex\2026-08-14\ponytail\outputs\aaaaakach.github.io-git`.
Do not start the server from its parent folder, or it may serve the wrong
directory. Local Google OAuth return URLs must be allowed in Supabase; use a
browser private window or a separate browser profile to test another Google
account.

## Hosting

The primary public address is [`https://vegfish.top/`](https://vegfish.top/).
GitHub Pages remains the host. `https://www.vegfish.top/` is also configured;
the apex domain is the primary URL. Supabase authentication uses project
`bqiamnjnenlmgbrltqah`; see `HANDOFF.md` for the current URL settings and
verification notes.
