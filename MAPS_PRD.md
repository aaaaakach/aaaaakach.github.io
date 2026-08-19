# Maps — Product Requirements Document

## 1. Product purpose

Maps is an independent second-level page within the akach personal website. It uses an interactive 3D globe to hold visited countries, visited Chinese provinces, meaningful coordinates, photographs, and short personal memories.

Maps should feel like a quiet personal travel memory, not a GIS product, check-in tool, game UI, or data dashboard.

Reference: https://github.com/binzek/pinglobe, for the broad globe-led concept only. Do not copy its identity, code, assets, or distinctive treatment.

## 2. Site integration

- Replace one unassigned Home Detour with Maps.
- Keep the entrance visually and behaviorally consistent with sibling entrances.
- Open an independent /maps/ page.
- Inherit the global header, lowercase akach wordmark, typography, base colors, transition language, responsive behavior, and accessibility baseline.
- Load Maps-only code, geographic data, WebGL, and media after entering /maps/. Home performance must not be materially affected.
- PRD.md remains the site-level PRD. This document is authoritative for Maps-specific behavior.

## 3. Scope

In scope:

- Interactive 3D globe with visited and unvisited countries.
- Country Memory Cards with an optional note and three representative photos.
- China as the only province-level view, with an animated transition and return.
- Province visited state and Province Memory Cards.
- Paper Plane workflow for adding a new visited country or province.
- Independent coordinate-based Pins with optional notes.
- Supabase persistence and Storage uploads.
- Google OAuth, administrator allowlist, Row Level Security, and inline Edit Mode.
- Desktop, touch/mobile, keyboard-aware behavior, reduced motion, and performance fallbacks.

Out of scope for the first release:

- City or district administrative drill-down.
- Multiple Pin categories, icons, or colors.
- Deriving visited regions or statistics from Pins.
- A dashboard or separate administrator backend.
- Repeatedly adding an already-visited region.
- Satellite, terrain, clouds, starfields, neon, particles, or game-like effects.

## 4. Visual direction

Keywords: Minimal / Light / Blue / Personal / Playful / Editorial.

- Use a near-white canvas, low-saturation clear blues, blue-grey boundaries, dark text, thin dividers, and generous whitespace.
- Visual priority is Globe, geography, personal memory, then editing controls.
- Do not use a traditional sidebar or dashboard.
- Avoid heavy shadows, large gradients, strong glow, or visual noise.
- Existing site tokens take precedence.

Temporary development colors:

| Role | Placeholder |
| --- | --- |
| Background | #F7F9FC |
| Ocean | #BDC6D9 |
| Unvisited | #E3E7F1 |
| Visited | #7391C8 |
| Visited hover | restrained darker blue |
| Border | #52688F |
| Text | #111111 |
| Secondary text | #7A838A |

## 5. World view and globe

- Center the globe as the page's primary focus, approximately 70–80% of viewport height on desktop.
- Keep substantial surrounding whitespace.
- Show a restrained lower-right statistic: Places / X countries · Y cities. Keep nearby space available for the future admin-only Pin control without rendering it before the Pin phase.
- Countries is authoritative and automatically equals the number of currently visited country records.
- Cities is a display statistic using administrator override when present, otherwise an automatic value derived from travel data: displayedCities = adminOverride ?? automaticallyDerivedCities.
- Pins remain independent and must not contribute to either statistic.
- Support pointer/touch drag, smooth rotation, country polygons and borders, hover/tap/click, coordinate positioning, Pin overlays, and animated camera positioning.
- The globe may rotate slowly by default, approximately one revolution per 30–45 seconds.
- Pointer entry pauses rotation gradually. Dragging has slight inertia. Rotation may resume after inactivity without abrupt starts.
- World and China use one shared flat palette: ocean #BDC6D9, unvisited land/provinces #E3E7F1, visited countries/provinces #7391C8, and borders #52688F.
- The Places block uses the same typography, color, opacity, spacing, size, and positioning logic in World and China views.
- Keep the globe flat, clean, and editorial rather than glossy or realistic.
- Do not use realistic earth textures, terrain, clouds, atmosphere glow, or starfields.
- Three.js, Globe.GL/react-globe.gl, and GeoJSON/TopoJSON are possible tools, not a requirement to add every dependency.

## 6. Region Memory Cards

Only visited countries and provinces carry the primary memory interaction.

### 6.1 Preview

On desktop hover or keyboard focus:

1. Slightly deepen the visited region fill and clarify its boundary.
2. Extend a fine leader line toward the outside of the globe/map.
3. Show an editorial floating Memory Card as a temporary preview.

The card contains the country/province name, an optional short note, and three representative photos. Preferred photo layouts are one primary plus two smaller images, or three images in a row. Use a white or translucent pale surface, at most a light 1 px border, no prominent shadow, and generous whitespace.

Card entrance: opacity from 0 to 1 and vertical offset from 6 px to 0 over about 200–300 ms. Text may precede photos slightly.

### 6.2 Selection, dismissal, and switching

The shared Country/Province contract is:

**Hover = Preview → Click = Keep Open → Click Blank = Close**

- Clicking/tapping a visited region selects it.
- The selected region stays highlighted and its leader line and card remain visible after the pointer leaves, allowing interaction with the card.
- Clicking/tapping a non-interactive blank area of the globe/map or page clears the selection.
- Dismissal fades the card and line, clears the selected highlight, and restores the ordinary Globe or China Map state.
- Clicking/tapping another visited region closes the current card and selects/shows the new region.
- A prominent separate close button is not required. A small accessible/mobile affordance may exist, but blank-area dismissal must remain.
- Tap performs open/select on devices without hover.
- Escape clears the active selection when focus is within Maps.

### 6.3 Positioning and dragging

- Position cards dynamically instead of fixing them to the right.
- A left-side region points toward a card on the left; a right-side region points toward a card on the right.
- Keep cards inside the viewport and avoid covering the selected region where practical.
- During globe dragging, hide/fade cards and lines. After about 300 ms of settled state, a selected card may reappear in its recalculated position and previews may resume.

## 7. China province view

China is the only World region with another administrative level.

### 7.1 Entry

- The user must first click China on the globe. Provinces are never operated directly on the World globe.
- Rotate China to the camera, emphasize its polygon, move the globe slightly back, lift China from the globe, expand it, and morph/transition it into a centered 2D China map.
- Target duration is 700–1000 ms. Do not replace this with a hard page cut.

### 7.2 Map requirements

- Display the complete China map with mainland body, Hainan, Taiwan, South China Sea islands/related expression, and province-level boundaries.
- Use a reliable, documented, appropriately licensed geographic source.
- Provinces use the same unvisited/visited colors and Memory Card behavior as countries.
- Depth stops at World → China → Province. Cities and special places use Pins.

### 7.3 Return

Provide a minimal ← World control. Reverse the spatial relationship: China Map contracts into the globe's China polygon and restores World view.

## 8. Paper Plane

Paper Plane is the sole add-region entry in Edit Mode and should feel like part of the scene, not a conventional floating action button.

- A small plane floats near the globe with slow vertical movement of about ±2–4 px.
- Hover may cause a slight move/rotation suggesting takeoff; avoid strong bounce.
- Use ✈︎ as a placeholder until the final SVG/image arrives.

Clicking it opens a minimal letter/postcard-like input:

    TO:
    Where are we going?
    [ Destination ]
    Send ↗

- World destination means a not-yet-visited country.
- China destination means a not-yet-visited province and is available only inside China Map.
- Handle empty, unknown, or already-visited input without launching.

After Send:

1. Dismiss the panel and orient the globe/map toward the destination.
2. Detach the plane from its resting position.
3. Fly along a spatial Bezier/spline path: lift, curve, descend, enter target.
4. Scale approximately 1 → 0.7 → 0.35 → 0.05 → 0 and fade at the end.
5. Show a restrained blue ripple (● → ◉ → ◎) for about 400–600 ms.
6. Change the region from unvisited to visited blue over about 400 ms.

Do not use a straight screen-line flight, explosion, strong flash, or particle burst.

## 9. Pin system

Pins represent meaningful coordinates and remain logically and structurally independent from visited regions.

- Pins never determine visited state, city count, or travel history.
- First release uses one visual only: 📍 as placeholder, later replaced by one owner-selected asset.
- Do not add categories, colors, or type-based variants.

### 9.1 Add Pin

In Edit Mode only, show a small Pin entry beside Places. It requests required Latitude and Longitude plus an optional one-sentence Note.

- Validate coordinate ranges.
- On confirmation, orient the active view to the coordinate.
- Animate the Pin entering, sticking into the surface, and settling.
- The motion shares the scene's spatial language but is not a Paper Plane flight.

### 9.2 Display

- Pins remain visible to visitors.
- Hover/focus/tap a Pin with a Note to show a small floating label, such as “📍──────── Summer in Ann Arbor.”
- Do not display an empty label when Note is blank.

## 10. Data and photos

Deployment remains GitHub Pages. Persistent data uses Supabase Database; photos use Supabase Storage. Do not hard-code user-created travel data into the repository.

Logical Region fields:

- id, type (country/province), name, code, parent country for provinces, visited, note, three photo references, created/updated timestamps.

Logical Pin fields:

- id, latitude, longitude, optional note, created/updated timestamps.

The schema may normalize photos, but the visible behavior remains three representative photos per Region Card.

- Edit Mode uploads through Browser → Storage → stored URL/path → Database → Website.
- Normal photo updates require no Git commit.
- Use compressed thumbnails, lazy loading, correct aspect handling, and useful alt text or decorative designation.
- Define upload type/size and deletion behavior during implementation; Storage policies must match database authorization.

## 11. Authentication and shared identity

Authentication begins from the main site's upper-left akach, not from a separate Maps admin page.

1. Click/tap akach.
2. Blur and slightly desaturate/dim the current page.
3. Show centered “I'm” with a subtle typewriter effect.
4. Continue to Google OAuth through Supabase Auth.

Typing “蔡予” is not a password and must not grant permission through client-side logic.

- Only owner-specified Google accounts receive write access.
- Enforce rights with Supabase Auth, database RLS, and Storage policies.
- Never expose service-role keys or trust a client-only allowlist.
- Share the valid session across Home and Maps and retain it across refresh for its normal lifetime.
- After authorized login, transition the global label from akach to me using a subtle 300–500 ms crossfade/morph.
- Do not show “Admin”, “Administrator”, “Management”, or similar labels.
- Clicking me may reopen identity/session controls, including Exit Edit Mode.

## 12. Edit Mode

Visitors can explore, open cards, enter China view, and view Pins/notes, but cannot see or invoke mutations.

Only authorized Edit Mode shows:

- Paper Plane add-region interaction.
- Add Pin control.
- Edit, Delete, and upload controls.

An open Country/Province card receives a small Edit control and edits in place: display name, note, and three photos. Save returns to display mode without a separate admin page.

An administrator's Pin label receives a small Edit control for latitude, longitude, Note, and Delete. Saving updates immediately. Deletion requires explicit confirmation.

## 13. Responsive and accessibility behavior

- Desktop is primary; laptop must remain complete, tablet must not break, and mobile must remain browseable.
- Touch drag rotates the globe. Tap replaces hover for cards and Pins.
- Preserve semantic landmarks, visible focus, readable contrast, and accessible names.
- Every actionable pointer-only control needs a keyboard-usable equivalent.
- A selected card must allow focus to move into it without closing.
- With prefers-reduced-motion: stop auto-rotation; simplify/shorten Plane, Pin, China, ripple, and card motion; preserve all outcomes.
- Provide a graceful message/fallback when WebGL is unavailable.

## 14. Performance and reliability

- Lazy-load Maps code, WebGL, geographic datasets, and media at /maps/.
- Control library bundle size, geographic data size, re-renders, and image memory.
- Lazy-load compressed thumbnails rather than original full-resolution photos.
- Avoid materially regressing Home load time.
- Define loading, empty, network-error, failed-upload, expired-session, and unauthorized-write states.
- Failed mutations must not leave the UI presenting unsaved data as persisted.

## 15. Motion principles

Motion is soft, natural, deliberate, and spatial:

- Globe: slow rotation and restrained inertia.
- China: lifts from and returns to the globe.
- Plane: travels through space to a destination.
- Pin: drops and sticks into a coordinate.
- Card: connects to its region with a leader line.

Avoid ubiquitous bounce/spring, flashing, glow, particle explosions, and overly fast transitions.

## 16. Development placeholders

- Plane: ✈︎.
- Pin: 📍.
- Photos: neutral placeholders.
- Data: a small mock set of countries, provinces, and Pins.
- Administrator accounts and Supabase values: environment/configuration placeholders; never committed secrets.

Missing final assets must not block structural development, but placeholders must be replaceable.

## 17. Delivery phases

1. Website integration: Detour → Maps, /maps/, inherited navigation and base layout.
2. Globe: polygons, borders, visited states, drag/touch, rotation, hover/focus.
3. Memory UI: leader lines, photos, notes, positioning, preview/selection/dismiss/switch states.
4. China: entry transition, complete province map, province states/cards, return.
5. Paper Plane: scene placement, input validation, flight, ripple, light-up.
6. Pins: coordinate entry, drop motion, labels, independent model.
7. Supabase: Regions, Pins, Storage, loading/error states, persistence.
8. Administrator: OAuth, allowlist/RLS/Storage policies, shared session, akach → me, edit controls.
9. Polish: timing, responsive behavior, accessibility, reduced motion, fallback, performance, final assets/data.

## 18. Acceptance criteria

1. Home assigns an approved Detour to Maps and links to /maps/.
2. Maps preserves the site's identity and loads heavy resources only on its route.
3. A centered draggable/touch-draggable globe shows borders and distinct visited/unvisited countries.
4. Hover/focus previews a visited Country/Province Card; click/tap keeps it open.
5. Blank click/tap or Escape dismisses the selected card and restores ordinary map state.
6. Selecting another visited region switches the persistent card and highlight.
7. Cards support an optional note and three photos and remain interactable after selection.
8. Clicking China performs the Globe-to-China transition before province interaction.
9. China Map contains the required geographic coverage and province boundaries, without city/district drill-down.
10. Province cards follow the country preview, selection, dismissal, and switching rules.
11. Edit Mode Paper Plane adds a valid unvisited country/province with curved flight, ripple, and light-up.
12. Pins remain independent and can be added from validated coordinates with an optional Note.
13. Visitors can view Pins and non-empty Pin notes; empty notes create no empty label.
14. Supabase persists Regions/Pins and Storage holds photos.
15. Google OAuth plus allowlist, RLS, and Storage policies prevent visitor writes.
16. Authorized login is shared site-wide and changes akach to me.
17. Edit Mode edits Region content and edits/deletes Pins without a separate backend page.
18. Failure states never misrepresent unsaved data as persisted.
19. Keyboard, touch, reduced-motion, mobile, and WebGL-unavailable behavior remain usable.
20. Home performance is not materially degraded.

## 19. Open inputs before production

- Final visited country/province list and Places counting rules.
- Final notes, photos, Plane asset, and Pin asset.
- Approved Google administrator accounts.
- Supabase configuration and deployment-domain OAuth settings.
- Final geographic datasets, attribution/license, and any required map-review/compliance decision.
- Final colors after comparison with the implemented Home design.
