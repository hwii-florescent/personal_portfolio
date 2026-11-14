# Room, match point of view and intro

Status: implemented and verified in headless Chrome (2026-11-13); uncommitted, awaiting the owner's review. Verification record: `docs/NOTES.md`. Follows `plans/261112-1953-blue-hour-redesign/plan.md`.

## Outcome
The portfolio takes place in Huy's room at night, a glass corner studio on Nob Hill with the San Francisco bay outside, instead of a bare rooftop. Visiting it feels like loading into a match: a short game-style intro, a first-person walk through the room and an original heads-up display. The résumé stays plain, short, server-rendered text.

## Decisions from the user (2026-11-13)
- Setting: "Your room at night", with the bay panorama kept as the view out of the window.
- Gaming (Valorant, CS2, TFT) is shown through point of view, art and style, never as text about the games.
- Preferred approach: "the view as if we are inside the game". Game props inside the scene are only worth it if the execution is excellent.
- Intro: flying in through the window is good; it can also read like the intro to a game. Short.

## Constraints
- Original artwork in the style of the genres only. No game logos, maps, characters, names or interface copies.
- Content facts come only from `src/data/portfolio.ts`. No ranks, stats or claims that are not there.
- The page reads without WebGL, without JavaScript, at 375 px and under reduced motion. The intro never blocks content: it is skippable on any input, plays once per browser session, and never shows without JavaScript, with a deep link, or under reduced motion.
- No new dependencies. Everything in the scene stays procedural.

## Non-goals
- A playable game, weapons, or a view model.
- Text sections about gaming.
- Changing résumé content.

## Acceptance criteria
1. `npm test`, `npx eslint src tests`, `npx tsc --noEmit` and `npm run build` pass.
2. Every chapter camera stands inside the room and clear of the furniture (asserted in `tests/journey.test.mjs`).
3. The opening shot shows the desk and monitors with the Golden Gate behind them; Contact shows the sunrise through the east glass.
4. The intro finishes in about three seconds, skips on key, click, wheel or touch, and does not replay in the same session.
5. Heads-up display: minimap that follows the camera, round counter, callouts. Hidden on phones where it would cover text.
6. Skills are shown as an auto-battler style board (3D) and trait list (page), generated from `portfolio.skills`.
7. No console errors; no horizontal scroll at 390 and 375 px; reduced motion and the no-WebGL fallback still work.

## Phases
1. Room: shell, glazing, floor reflection, desk and rig, lounge, lights (`src/scene/room.ts`, replaces `roof.ts` and `props.ts`).
2. Holograms on the desk and lounge table; hex board for Skills; our own building and nearer houses in `city.ts`.
3. Journey: new camera chapters, intro fly-in, tests.
4. Page: intro overlay, heads-up display, trait list, wording.
5. Verify in headless Chrome, tune, update `docs/NOTES.md`.
