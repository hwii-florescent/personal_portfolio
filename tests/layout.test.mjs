// Run: npm run test:layout
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { editableItems, validLayout, localEditorRequest, clampScale, idForView, viewOf } from "../src/data/layout.ts";

assert(validLayout({}));
for (const id of ["keyboard", "mouse", "headset", "duck", "mug", "pens"]) {
  assert.equal(idForView(id, false), id);
  assert.equal(idForView(id, true), `section-${id}`);
  assert.equal(viewOf(id), "home");
  assert.equal(viewOf(`section-${id}`), "section");
  const home = { position: [1, 2, 3], scale: 1, rotation: 0 };
  const section = { position: [-1, 0, 2], scale: 2, rotation: Math.PI / 2 };
  const layout = { [id]: home, [idForView(id, true)]: section };
  assert(validLayout(layout));
  assert.deepEqual(layout[idForView(id, false)], home);
  assert.deepEqual(layout[idForView(id, true)], section);
  delete layout[idForView(id, true)];
  assert.deepEqual(layout[id], home, "Resetting a section prop must preserve its home pose");
}
for (const id of ["profile", "monitor-open", "skills", "pad-skills", "section-mug"]) {
  assert.equal(idForView(id, true), id, "Non-prop and already-resolved IDs must stay unchanged");
}
assert(validLayout({ profile: { position: [1, -2, 0], scale: 1.25 } })); // legacy saved layouts
assert(validLayout({ profile: { position: [0, 0, 0], scale: 1, rotation: -Math.PI, width: 0.25, height: 3 } }));
for (const id of Object.keys(editableItems)) {
  assert(validLayout({ [id]: { position: [0, 0, 0], scale: 1, rotation: Math.PI } }), `${id} supports rotation`);
}
for (const [key, values] of Object.entries({ rotation: [NaN, Infinity, -Math.PI - 0.01, Math.PI + 0.01, "90", null], width: [NaN, Infinity, 0.2, 3.1, "1", null], height: [NaN, Infinity, 0.2, 3.1, "1", null] })) {
  for (const value of values) assert(!validLayout({ profile: { position: [0, 0, 0], scale: 1, [key]: value } }), `Reject invalid ${key}: ${value}`);
}
assert(!validLayout({ mug: { position: [0, 0, 0], scale: 1, width: 1 } }), "Only the monitor supports independent dimensions");
for (const value of [
  null, [], { unknown: { position: [0, 0, 0], scale: 1 } },
  { profile: { position: [NaN, 0, 0], scale: 1 } },
  { profile: { position: [0, Infinity, 0], scale: 1 } },
  { profile: { position: [21, 0, 0], scale: 1 } },
  { profile: { position: [0, 0], scale: 1 } },
  { profile: { position: [0, 0, 0], scale: 0 } },
  { profile: { position: [0, 0, 0], scale: 4 } },
  { profile: { position: [0, 0, 0], scale: 1, extra: "no" } },
  { "pad-skills": { position: [0, 0, 0], scale: 1, width: 1 } }, // only monitors have independent dimensions
  { "monitor-open": { position: [0, 0, 0], scale: 1, width: 0.2 } },
]) assert(!validLayout(value), JSON.stringify(value));
// section view has its own layout, separate from home
assert(validLayout({ "monitor-open": { position: [0, 0, 0], scale: 1, width: 1.6, height: 0.7, rotation: 0.2 }, "pad-skills": { position: [1, 0, 2], scale: 0.5, rotation: 1 } }));
const request = (host, origin) => new Request("http://localhost:3000/api/dev-layout", { headers: { host, ...(origin && { origin }) } });
assert(localEditorRequest(request("localhost:3000", "http://localhost:3000")));
assert(localEditorRequest(request("127.0.0.1:3000", "http://127.0.0.1:3000")));
assert(localEditorRequest(request("[::1]:3000", "http://[::1]:3000")));
assert(!localEditorRequest(request("localhost:3000", "https://evil.example")));
assert(!localEditorRequest(request("localhost:3000", "http://localhost:9999")));
assert(!localEditorRequest(request("portfolio.example", "https://portfolio.example")));
assert(!localEditorRequest(request("localhost:3000")));
assert(!localEditorRequest(request("localhost:3000", "null")));
assert.equal(clampScale(0), 0.25);
assert.equal(clampScale(10), 3);
assert(validLayout(JSON.parse(await readFile(new URL("../src/data/layout.json", import.meta.url), "utf8"))));
const css = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
assert(!css.includes("holo-flicker"), "Panels must not periodically dim");
const shader = await readFile(new URL("../src/components/Hologram.tsx", import.meta.url), "utf8");
assert(!shader.includes("sin(uTime * 41.0)"), "Holograms must not rapidly pulse");
assert(!shader.includes("rotation.y +="), "Holograms must not automatically spin");
const scene = await readFile(new URL("../src/components/Scene.tsx", import.meta.url), "utf8");
const label = scene.match(/<\/Editable3D>\s*\{\/\* World-space sibling:[\s\S]*?<Text\s+([\s\S]*?)>/)?.[1];
assert(label, "Section labels must be outside the editable rotation/scale wrapper");
assert(label.includes('fontSize={0.1}') && !/\bscale[=\s-]/.test(label), "Section labels keep a fixed text size");
assert(label.includes('rotation-x={-1.15}'), "Section labels keep their forward-facing desk angle");
assert(label.includes('material-depthTest={false}'), "Objects must not obscure section labels");
assert(scene.includes('grp.getWorldPosition(label.current.position)'), "Labels follow live pad movement, including gizmo drags");
assert(scene.includes('label.current.position.z += 0.85 * worldScale.x'), "Labels stay in front of resized pads without inheriting yaw");
console.log("Layout validation, rotation/dimensions, localhost boundary, saved layout, animation, and section label regression checks passed.");
