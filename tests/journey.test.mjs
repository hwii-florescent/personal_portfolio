// Run: npm test
import assert from "node:assert/strict";
import { chapters, LAST, progress, journeyAt, introAt, revealAt, cabinAt, clock, phase, hologramsAt, ROOM, DESK, TABLE, SITES, INTRO, LIFT, BEATS } from "../src/lib/journey.ts";
import { skyAt, sample } from "../src/scene/sky-model.ts";
import { flipPath } from "../src/lib/flip.ts";
import { emphasize } from "../src/lib/emphasize.ts";
import { ground, inland, PLACES, polar } from "../src/scene/terrain.ts";

// Scroll mapping: starts at 0, each chapter takes over when its heading is 40% up the viewport, ends exactly at LAST.
const vh = 800;
const tops = [0, 900, 1800, 4000, 6000, 7000, 8000];
assert.equal(progress(0, tops, vh), 0);
assert.equal(progress(900 - 320, tops, vh), 1);
assert.equal(progress(8000 - 320, tops, vh), LAST);
assert.equal(progress(99999, tops, vh), LAST);
assert.equal(progress(-50, tops, vh), 0, "rubber-band overscroll must not go negative");
let last = -1;
for (let y = 0; y <= 8000; y += 37) { const u = progress(y, tops, vh); assert(u >= last, "progress never runs backwards"); last = u; }
assert.equal(progress(100, [0], vh), 0, "a single chapter cannot divide by zero");
assert.equal(progress(10, [0, 0, 0], vh), 2, "zero-height chapters are skipped, not NaN");

// The night only moves forward, and the camera rests exactly on each chapter.
chapters.forEach((c, i) => {
  if (i) assert(c.hour > chapters[i - 1].hour, `${c.id} must be later than the chapter before it`);
  const j = journeyAt(i);
  assert.deepEqual(j.pos.map((v) => +v.toFixed(6)), [...c.pos]);
  assert.equal(+j.hour.toFixed(6), c.hour);
});
assert.deepEqual(journeyAt(-3), journeyAt(0));
assert.deepEqual(journeyAt(99), journeyAt(LAST));
assert(Number.isFinite(journeyAt(2.5).fov));

assert.equal(clock(19.7), "19:42");
assert.equal(clock(25.5), "01:30");
assert.equal(clock(23.9999), "00:00", "rounding up must roll the hour, never print 23:60");
assert.equal(phase(19.7), "Blue hour");
assert.equal(phase(30.4), "Sunrise");

assert.deepEqual(sample([[0, 0], [10, 100]], 2.5), [25]);
assert.deepEqual(sample([[0, 0], [10, 100]], -5), [0]);
assert.deepEqual(sample([[0, 0], [10, 100], [20, 0]], 99), [0]);

// Sky: sun under the horizon all night and above it at the end; one key light that is never negative or NaN.
assert(skyAt(19.7).sunDir[1] < 0 && skyAt(25).sunDir[1] < -0.5 && skyAt(30.4).sunDir[1] > 0);
assert(skyAt(19.7).sunDir[0] < 0 && skyAt(30.4).sunDir[0] > 0, "sets in the west, rises in the east");
for (let h = 19; h <= 31; h += 0.05) {
  const s = skyAt(h);
  for (const v of [...s.sunDir, ...s.moonDir, s.moon, ...s.zenith, ...s.horizon, ...s.glow, ...s.sun, ...s.cloud, ...s.key, ...s.keyDir, s.stars, s.ambient, s.lamps, s.lit]) assert(Number.isFinite(v));
  for (const v of [...s.key, ...s.zenith, s.stars, s.lit]) assert(v >= 0);
  assert(s.keyDir[1] > 0, "the key light always shines from above");
}
assert.deepEqual(skyAt(20).key, [0, 0, 0], "no direct light at dusk: neither sun nor moon");
assert(skyAt(25).key[2] > skyAt(25).key[0], "moonlight is cool");
assert(skyAt(30.4).key[0] > skyAt(30.4).key[2], "sunlight is warm");

// Metric highlighting: numbers that carry meaning, never digits inside product names.
const parts = (s) => emphasize(s).filter((p) => p.strong).map((p) => p.text);
assert.deepEqual(parts("for 120k+ experiments with 27k+ searches/day"), ["120k+", "27k+"]);
assert.deepEqual(parts("at 99.8% completion"), ["99.8%"]);
assert.deepEqual(parts("cut agent context 50%, measuring 94% precision and 86% recall"), ["50%", "94%", "86%"]);
assert.deepEqual(parts("AWS EC2, WSO2 and OAuth2 with YOLOv8 on S3"), []);
assert.deepEqual(parts("from 2h to 15min across 20+ EC2 instances"), ["2h", "15min", "20+"]);
assert.deepEqual(parts("improving response time by 20ms"), ["20ms"]);
assert.deepEqual(parts("consolidate 1K+ per-frame reconstructions, 90%+ completeness"), ["1K+", "90%+"]);
assert.deepEqual(parts("exposing 7 experiment-management tools"), ["7"]);
assert.equal(emphasize("a 50% b").map((p) => p.text).join(""), "a 50% b", "no text is lost or reordered");
assert.deepEqual(emphasize(""), []);

assert.deepEqual(journeyAt(0, true).pos, [...chapters[0].tall.pos], "portrait screens get the re-framed opening shot");
assert.deepEqual(journeyAt(1, true), journeyAt(1), "and the ordinary shot wherever there is no re-framed one");

// Holograms: the desk projects exactly one thing at every chapter, the route map only for Projects, the skills board from Skills on.
const up = (u) => Object.entries(hologramsAt(u)).filter(([, p]) => p > 0.99).map(([k]) => k).join();
assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(up), ["systems", "systems", "systems", "route", "board", "systems,board", "systems,board"]);
for (let u = 0; u <= LAST; u += 0.01) { const h = hologramsAt(u); for (const p of Object.values(h)) assert(p >= 0 && p <= 1); assert(h.systems + h.route <= 1.001, "one projection at a time over the desk"); }

// The room: every place the camera stands, on a wide screen or a tall one, is inside the walls at head height and
// clear of the desk and the table; both projectors stand on their furniture.
const inside = ([x, y, z], margin = 0.3) => x > ROOM.w + margin && x < ROOM.e - margin && z > ROOM.n + margin && z < ROOM.s - margin && y > 1 && y < ROOM.h - 0.5;
for (let u = 0; u <= LAST; u += 0.02) for (const tall of [false, true]) {
  const { pos } = journeyAt(u, tall);
  assert(inside(pos), `the camera leaves the room at ${u.toFixed(2)}`);
  for (const thing of [DESK, TABLE]) assert(Math.hypot(pos[0] - thing.x, pos[2] - thing.z) > thing.r, `the camera walks through furniture at ${u.toFixed(2)}`);
}
assert(Math.abs(SITES.a[0] - DESK.x) < 0.4 && Math.abs(SITES.a[2] - DESK.z) < 1 && SITES.a[1] === DESK.top, "projector A stands on the desk");
assert(Math.hypot(SITES.b[0] - TABLE.x, SITES.b[2] - TABLE.z) < 0.45 && SITES.b[1] === TABLE.top, "projector B stands on the table");

// The intro: a lift behind the room's south door. The camera starts inside the cabin facing its doors, the floors count up
// one at a time to the top, the doors open only there and before the camera moves, it walks out through the doorway into
// the room and ends exactly on the opening shot; the room only starts to be built once the camera is inside it.
const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-9);
const inCabin = ([x, y, z]) => Math.abs(x - LIFT.x) < LIFT.width / 2 - 0.2 && z > LIFT.front + 0.3 && z < LIFT.front + LIFT.depth - 0.3 && y > 0.7 && y < LIFT.height - 0.3;
const inRoom = ([x, y, z]) => x > ROOM.w && x < ROOM.e && z > ROOM.n && z < ROOM.s && y > 0.7 && y < ROOM.h - 0.2;
assert(Math.abs(LIFT.x - 2.85) < 1e-9 && LIFT.front > ROOM.s, "the lift stands behind the south door, outside the room");
for (const tall of [false, true]) {
  for (const key of ["pos", "look"]) assert(near(introAt(1, tall)[key], journeyAt(0, tall)[key]), "the intro lands exactly on the opening shot");
  assert(inCabin(introAt(0, tall).pos), "the intro starts inside the cabin");
  let before = introAt(0, tall).pos;
  for (let t = 0; t <= 1; t += 0.001) {
    const { pos } = introAt(t, tall);
    assert(inCabin(pos) || inRoom(pos) || (Math.abs(pos[0] - LIFT.x) < LIFT.door / 2 - 0.1 && pos[2] > ROOM.s - 0.2 && pos[2] < LIFT.front + 0.3), "the camera is in the cabin, in the doorway or in the room");
    if (before[2] > ROOM.s && pos[2] <= ROOM.s) assert(Math.abs(pos[0] - LIFT.x) < LIFT.door / 2 - 0.1 && cabinAt(t).door > 0.99, "it leaves through the doorway, with the doors open");
    before = pos;
  }
}
// It walks at a person's pace and never walks and turns at once (until the last move, which is one motion on purpose; the
// ride's hum jitters the camera, so start after it); it holds still while the room is built, and the build is nine tenths
// done when that last move begins.
const yawOf = ({ pos, look }) => Math.atan2(pos[0] - look[0], pos[2] - look[2]);
const [walkStart, turnEnd, moveStart] = [BEATS.walk[0] / INTRO.seconds, BEATS.turn[1] / INTRO.seconds, BEATS.move[0] / INTRO.seconds];
for (const tall of [false, true]) {
  let p = introAt(walkStart - 0.01, tall);
  for (let t = walkStart; t <= 1; t += 0.001) {
    const c = introAt(t, tall), step = Math.hypot(c.pos[0] - p.pos[0], c.pos[2] - p.pos[2]);
    assert(step / (INTRO.seconds * 0.001) < (t < moveStart ? 1.8 : 2.4), "it never moves faster than a brisk walk");
    if (t < moveStart) assert(!(step > 1e-4 && Math.abs(yawOf(c) - yawOf(p)) > 1e-4), "it never walks and turns at once");
    p = c;
  }
  const held = introAt(turnEnd, tall);
  for (let t = turnEnd; t <= moveStart; t += 0.01) assert(near(introAt(t, tall).pos, held.pos) && near(introAt(t, tall).look, held.look), "it holds still between the turn and the last move");
}
const speed = (sec, tall) => { const [p, q] = [sec, sec + 0.01].map((x) => introAt(x / INTRO.seconds, tall).pos); return Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) / 0.01; };
for (const tall of [false, true]) for (const sec of [BEATS.walk[0] + 0.01, BEATS.walk[1] - 0.02, BEATS.move[0] + 0.01, BEATS.move[1] - 0.02]) assert(speed(sec, tall) < 0.15, "every walk and the last move start and stop at rest, with no jolt");
assert(revealAt(moveStart) > 0.88 && revealAt(turnEnd) < 0.1, "the room is built while the camera holds, nine tenths done when the last move begins");
let ride = { floor: 1, door: 0 };
assert(cabinAt(0).floor === 1 && cabinAt(1).floor === INTRO.floors && cabinAt(0).door === 0 && cabinAt(1).door === 1, "the lift starts on the first floor with its doors shut and ends at the top with them open");
for (let t = 0; t <= 1; t += 0.001) {
  const c = cabinAt(t);
  assert(c.floor >= ride.floor && c.floor - ride.floor <= 1, "the floors count up one at a time");
  assert(c.door >= ride.door - 1e-12, "the doors only open");
  assert(c.door === 0 || c.floor === INTRO.floors, "the doors open only at the top floor");
  ride = c;
}
assert(revealAt(0) === 0 && revealAt(1) === 1, "the room is a skeleton at first and built at the end");
for (let t = 0.001, r0 = 0; t <= 1; t += 0.001) {
  const r = revealAt(t);
  assert(r >= r0 - 1e-12 && r <= 1, "the room only ever builds");
  if (r > 0) assert(inRoom(introAt(t).pos), "the room is built only once the camera is inside it");
  r0 = r;
}

// The panorama: our building and the towers stand on land, the island and the bridge spans over water, and the sun
// sets behind the Golden Gate and comes up behind the Bay Bridge.
assert(ground(0, 0) > 40 && ground(0, 0) < 60, "our building stands part of the way up Nob Hill");
for (const k of ["coit", "pyramid", "salesforce"]) assert(inland(...polar(...PLACES[k])) > 50, `${k} stands on land`);
assert(ground(...polar(...PLACES.coit)) > 70, "Coit Tower crowns Telegraph Hill");
assert(inland(...polar(...PLACES.alcatraz)) < -500, "Alcatraz is an island");
assert(inland(...polar(...PLACES.gate)) < 0, "the Golden Gate's main span is over water");
assert(inland(...polar(...PLACES.bayBridge[0])) < 0 && inland(...polar(...PLACES.bayBridge[1])) > 0, "the Bay Bridge runs from the island to the city");
assert.deepEqual(polar(90, 100).map((v) => Math.round(v) + 0), [100, 0], "bearing 90 is due east (+x)");
const bearing = ([x, , z]) => ((Math.atan2(x, -z) * 180) / Math.PI + 360) % 360;
assert(Math.abs(bearing(skyAt(19.7).sunDir) - PLACES.gate[0]) < 25, "the sun sets behind the Golden Gate");
assert(bearing(skyAt(30.4).sunDir) > PLACES.bayBridge[0][0] && bearing(skyAt(30.4).sunDir) < PLACES.bayBridge[1][0], "and rises behind the Bay Bridge");

// The intro board: a tile reaches a character through the ones before it on the drum, never by jumping.
assert.deepEqual(flipPath("A", "A"), [], "a tile already showing its character does not move");
assert.deepEqual(flipPath("A", "C"), ["B", "C"], "a close character is reached flap by flap");
const far = flipPath(" ", "S", 0);
assert(far.length === 3 && far.at(-1) === "S" && far.join("") === "QRS", "a far one shows only the last few flaps before it, ending on it");
assert.equal(flipPath("Z", "A", 2).at(-1), "A", "the drum wraps around");
assert.equal(flipPath("Z", "A", 2).length, 3 + ((2 * 7) % 5), "the flap count varies tile to tile");
assert.deepEqual(flipPath("A", "&"), ["&"], "a character not on the drum is just shown");

console.log("journey, room, intro, board, sky, panorama and emphasis checks passed");
