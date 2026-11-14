import { DUSK } from "./journey";

/** Written by the page (scroll, pointer, intro, scene-only mode), read by the scene every frame. No React state on purpose. */
export const live = {
  u: 0, // position along the night, see lib/journey progress()
  scrub: null as number | null, // scene-only mode: hour picked on the slider, overrides the scroll clock
  pointerX: 0, pointerY: 0, // -1..1
  look: 0.25, // how far the camera follows the pointer
  motion: true, // false under prefers-reduced-motion
  touched: 0, // performance.now() of the last scroll/pointer input, for frame pacing
  hour: DUSK as number, // what the scene is showing right now (after damping)
  intro: 1, // the flight in: 0 = still outside, 1 = standing in the room (see journey introAt)
};
