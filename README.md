# akach Personal Website

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

From the repository root, run `py -m http.server 8000` and open
`http://localhost:8000/`. Local Google OAuth return URLs must be allowed in
Supabase for the chosen local address.

## Hosting

The current public address is `aaaaakach.github.io`. The planned custom domain
is `vegfish.top`; DNS, GitHub Pages, and Supabase redirect configuration must
be completed before using it publicly.
