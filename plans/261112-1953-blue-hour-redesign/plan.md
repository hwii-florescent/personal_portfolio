# Blue Hour redesign

Status: done (uncommitted) · Branch: `redesign/blue-hour` (from `origin/main` a25711d)

## Outcome
Replace the Stark/K.A.R.E.N. hologram desk with one coherent, original identity: a realistic
rain-wet rooftop at blue hour (a Spider-Man rooftop rather than a Stark workshop). Scrolling the résumé
moves a camera around the roof and advances the sky from dusk through night to sunrise.
All content is real, readable DOM over the scene.
Follow-up (same day, owner feedback): the roof also carries the Stark-style hologram workspace of the old design,
redesigned as three projections tied to the content (systems graph, route map, skills stack), then pushed further:
floating displays and a floor ring at the desk, clickable callouts pinned to the holograms, HUD chrome on the page.

## Constraints
- Content facts come only from `src/data/portfolio.ts`; no invented claims.
- First screen answers who / what / how to reach, with no intro to sit through.
- Readable and navigable without WebGL, without JS animation, at 375px, and with reduced motion.
- No new dependencies; no model or image textures for the scene (procedural geometry and GLSL).
- Next 16.4 framework surface stays what the repo already uses (fonts, metadata, OG image, dynamic import).

## Non-goals
- Keeping the hologram desk, layout editor, or J.A.R.V.I.S./K.A.R.E.N. themes (they remain on `main`).
- CMS, blog, per-project pages, analytics.

## Acceptance criteria
1. `npm run build`, `tsc`, `eslint` clean; pure-logic checks pass (`npm test`).
2. Hero shows name, role line, résumé and contact links above the fold at 1440x900 and 390x800.
3. Scene time and camera follow scroll; sky reaches sunrise at Contact; header clock matches.
4. Text contrast >= 4.5:1 over the scene at every chapter; no horizontal scroll at 375px.
5. Reduced motion: no camera travel or ambient animation; content unchanged.
6. No console errors; scene degrades (resolution, AO) on slow GPUs and the page works if WebGL fails.

## Phases
1. Data + journey logic (chapters, hours, camera keyframes, scroll mapping) with a runnable check.
2. Scene: sky + IBL, wet roof with planar reflection, skyline, props and practical lights, post grade.
3. Page: header, hero title card, sections, contact, scene-only mode; responsive + a11y.
4. Verify in headless Chrome (desktop, mobile, reduced motion), tune, update `docs/NOTES.md`.

## Follow-up (2026-11-13): San Francisco panorama
Request: replace the generic skyline with San Francisco / the Bay Area, and make the backdrop sharper and more detailed.
- Done: bay panorama seen from Nob Hill (`src/scene/terrain.ts`, `bay.ts`, rewritten `city.ts`); rooftop water tank removed; moon path and two camera shots re-aimed.
- Done: the soft look was a pacing bug (half-rate drawing tripped the quality monitor); fixed, and every tier now keeps antialiasing.
- Open: geography is compressed and downtown is shifted north; Alcatraz is small in the Experience shot; untested on a real phone or a slow GPU.
