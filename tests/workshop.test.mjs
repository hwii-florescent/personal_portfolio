// Run: node tests/workshop.test.mjs
// Check the actual scene geometry and saved layout without a browser or WebGL.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';

const require = createRequire(import.meta.url);
const effects = [];
let reducedMotion = false;
const lettering = [];
const context = new Proxy({}, { get: (_, key) => key === 'fillText' ? text => lettering.push(text) : () => {} });
const react = { useMemo: fn => fn(), useEffect: fn => effects.push(fn), useCallback: fn => fn,
  useRef: value => ({ current: value }), useState: value => [typeof value === 'function' ? value() : value, () => {}] };
function compile(path, extra = '', imports = {}) {
  const sandboxModule = { exports: {} };
  const source = readFileSync(new URL(path, import.meta.url), 'utf8') + extra;
  const compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  runInNewContext(compiled, {
    module: sandboxModule, exports: sandboxModule.exports,
    require: name => name === 'react' ? react : name === 'three' ? THREE : imports[name] ?? require(name),
    document: { createElement: () => ({ getContext: () => context }) },
    matchMedia: () => ({ matches: reducedMotion }),
  });
  return sandboxModule.exports;
}
const props = compile('../src/components/props.tsx');
const portraitTexture = new THREE.Texture();
const workshop = compile('../src/components/Workshop.tsx', '\nexport { Bench, Wall, CeilingLed, WallFrame, LED };', {
  './props': props,
  './LayoutEditor': { Editable3D: p => p.children },
  '@react-three/drei': { RoundedBox: 'roundedBox', Text: () => null, useTexture: () => portraitTexture },
  'three/addons/lights/RectAreaLightUniformsLib.js': { RectAreaLightUniformsLib: { init() {} } },
});
function scene(element) {
  if (!element || typeof element !== 'object') return null;
  if (typeof element.type === 'function') return scene(element.type(element.props));
  const p = element.props;
  const object = element.type === 'mesh' || element.type === 'roundedBox' ? new THREE.Mesh() : new THREE.Group();
  object.name = p.name ?? '';
  if (p.ref && typeof p.ref === 'object') p.ref.current = object;
  if (p.position) object.position.fromArray(p.position);
  for (const axis of ['x', 'y', 'z']) if (p[`position-${axis}`] !== undefined) object.position[axis] = p[`position-${axis}`];
  if (p.rotation) object.rotation.fromArray(p.rotation);
  for (const axis of ['x', 'y', 'z']) if (p[`rotation-${axis}`] !== undefined) object.rotation[axis] = p[`rotation-${axis}`];
  if (p.scale !== undefined) {
    if (Array.isArray(p.scale)) object.scale.fromArray(p.scale);
    else object.scale.setScalar(p.scale);
  }
  if (element.type === 'roundedBox') object.geometry = new THREE.BoxGeometry(...p.args);
  for (const child of [p.children].flat(Infinity)) {
    if (!child) continue;
    if (typeof child.type === 'string' && child.type.endsWith('Geometry')) {
      object.geometry = new THREE[child.type[0].toUpperCase() + child.type.slice(1)](...child.props.args);
    } else if (child.type === 'meshStandardMaterial' || child.type === 'meshBasicMaterial') {
      object.userData.material = child.props;
    } else {
      const node = scene(child);
      if (node) object.add(node);
    }
  }
  return object;
}
const palette = { accent: '#00E5FF', primary: '#CC0000', gold: '#FFD700' };
const bench = scene(workshop.Bench({ p: palette }));
bench.updateMatrixWorld(true);
const top = bench.getObjectByName('tabletop');
const bounds = new THREE.Box3().setFromObject(top);
const insert = bench.getObjectByName('square-projection-insert');
assert.equal(insert.geometry.parameters.width, insert.geometry.parameters.height, 'The projector must be square');
assert.equal(top.userData.material.metalness, 0, 'The tabletop must be wood, not the old steel slab');
assert(bounds.getSize(new THREE.Vector3()).x < 10, 'The finite desk must not become an endless slab again');
assert(Math.abs(bounds.max.y) < 1e-6, 'Keep the shared desk plane at y=0 for pads and editable props');
const whole = new THREE.Box3().setFromObject(bench);
assert(whole.min.y < -2, 'The table must have real legs');
const room = scene(workshop.Wall({ p: palette }));
assert(room.getObjectByName('left-window').position.x < 0, 'Window belongs to the chair-side left');
assert(room.getObjectByName('right-figure-cabinet').position.x > 0, 'Figures belong to the chair-side right');
assert(room.getObjectByName('wood-plank-floor'), 'Visible table legs need a floor beneath them');
assert(lettering.includes('HWIII / HOLOGRAPHIC WORKSPACE'), 'Tabletop must use the HWIII workspace lettering');
const laptopRoom = scene(workshop.Wall({ p: palette, desktop: true }));
assert.equal(room.getObjectByName('right-figure-cabinet').position.y, 0, 'Mobile shelf must keep its original height');
assert.equal(laptopRoom.getObjectByName('right-figure-cabinet').position.y, -0.55, 'Laptop shelf must be lowered');
const workshopSource = readFileSync(new URL('../src/components/Workshop.tsx', import.meta.url), 'utf8');
assert(!workshopSource.includes('SHIP IT') && !workshopSource.includes('while (alive)'), 'Remove both wall slogans');
assert(workshopSource.includes('<WallFrame at={[-2.05, 1.4, -4.69]} />'), 'Lower the portrait without changing its crop or size');
// Ceiling LED: four thin strips forming a rectangle ~70-80% of the room interior (15.4 x 10, walls top out at y=4.6), no hanging fixture.
const led = scene(workshop.CeilingLed());
const strips = []; led.traverse(n => n.name === 'led-strip' && strips.push(n));
assert.equal(strips.length, 4, 'Ceiling LED is four strips');
led.updateMatrixWorld(true);
const ledBox = new THREE.Box3().setFromObject(led).getSize(new THREE.Vector3());
assert(ledBox.x / 15.4 >= 0.7 && ledBox.x / 15.4 <= 0.8 && ledBox.z / 10 >= 0.7 && ledBox.z / 10 <= 0.8, 'LED outline must be 70-80% of the floor');
assert(ledBox.y < 0.1 && workshop.LED.y > 4.4 && workshop.LED.y <= 4.6, 'LED is a flat line stuck to the ceiling');
assert(!workshopSource.includes('DeskLight'), 'The hanging lamp is gone');
const portrait = scene(workshop.WallFrame({ at: [-2.05, 1.4, -4.69] }));
let crop;
portrait.traverse(node => { if (node.userData.material?.map) crop = node.userData.material.map; });
assert(crop && crop !== portraitTexture, 'Crop a cloned texture, never mutate the cached original photo');
assert.equal(crop.repeat.x, crop.repeat.y, 'Portrait crop must preserve the photo aspect ratio');
assert(crop.repeat.x <= 0.5, 'Portrait must zoom in on the face');
assert(new THREE.Box3().setFromObject(portrait).getSize(new THREE.Vector3()).x >= 1.8, 'Portrait frame must be enlarged');

const layout = JSON.parse(readFileSync(new URL('../src/data/layout.json', import.meta.url), 'utf8'));
const ids = ['experience', 'projects', 'skills', 'leadership', 'contact'];
for (let i = 0; i < ids.length; i++) {
  const t = layout[ids[i]], k = i - 2;
  const x = k * 1.25 + t.position[0], z = -Math.abs(k) * 0.3 - 0.2 + t.position[2];
  const radius = 0.84 * 0.7 * t.scale;
  assert(Math.abs(x) + radius < 2.6 && Math.abs(z) + radius < 2.6, `${ids[i]} emitter must fit the square insert`);
}
const camera = new THREE.PerspectiveCamera(48, 1440 / 960, 0.1, 100);
const panelSource = readFileSync(new URL('../src/data/layout.ts', import.meta.url), 'utf8');
const cam = JSON.parse(panelSource.match(/export const CAM = (\{[^;]+\}) as const/)[1].replace(/(pos|at):/g, '"$1":'));
camera.position.fromArray(cam.pos); camera.lookAt(new THREE.Vector3(...cam.at)); camera.updateMatrixWorld();
for (const x of [bounds.min.x, bounds.max.x]) for (const z of [bounds.min.z, bounds.max.z]) {
  const point = new THREE.Vector3(x, 0, z).project(camera);
  assert(Math.abs(point.x) < 0.96 && Math.abs(point.y) < 0.85, 'Chair-side camera must show all four tabletop corners');
}
// The section monitor must stay camera-facing after changing yaw, not keep the old world-aligned pose.
const settings = compile('../src/data/layout.ts');
const sections = compile('../src/data/sections.ts');
const doc = compile('../src/data/doc.ts', '', { './portfolio': {} });
const panelFrames = [];
let panelEditing = false;
const panels = compile('../src/components/HtmlPanel.tsx', '\nexport { focusPose, HoloPanel };', {
  '@react-three/fiber': { useFrame: fn => panelFrames.push(fn) }, '@/lib/quad': compile('../src/lib/quad.ts'), '@/data/doc': doc, '@/data/sections': sections,
  '@/data/layout': settings, './PanelShell': {}, './Hud': {}, './ResumeMonitor': {},
  './LayoutEditor': {
    useLayout: () => ({ layout, editing: panelEditing }),
    Editable3D: p => {
      const t = layout[p.id] ?? settings.identity;
      return { type: 'group', props: { position: p.position, children: {
        type: 'group', props: { position: t.position, scale: t.scale, 'rotation-y': t.rotation ?? 0, children: p.children },
      } } };
    },
  },
});
for (const eye of [[0, 4.8, 10.8], [3, 5, 9], [-3, 4.5, 8]]) {
  const pose = panels.focusPose(1440 / 960, doc.RESUME_PANEL.w, doc.RESUME_PANEL.h, eye);
  camera.position.fromArray(eye); camera.lookAt(new THREE.Vector3(...cam.at)); camera.updateMatrixWorld();
  const rotation = new THREE.Euler(pose.monitor.lean, pose.monitor.yaw, pose.monitor.roll);
  const size = [doc.RESUME_PANEL.w * 1.8 / doc.PANEL.w, doc.RESUME_PANEL.h * 1.8 / doc.PANEL.w];
  const corners = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    corners.push(new THREE.Vector3(sx * size[0] / 2, sy * size[1] / 2, 0).applyEuler(rotation)
      .add(new THREE.Vector3(...pose.monitor.pos)).project(camera));
  }
  assert(Math.abs(corners[0].x - corners[1].x) < 1e-6, 'Monitor must have vertical edges at any camera angle');
  assert(Math.abs(corners[0].y - corners[2].y) < 1e-6, 'Monitor must have horizontal edges at any camera angle');
  assert(Math.abs(corners[0].x + corners[3].x) < 1e-6, 'Reading monitor must be centered');
  assert(corners.every(c => Math.abs(c.x) <= 0.92 && Math.abs(c.y) <= 0.82 + 1e-6), 'Reading monitor stays within the HUD');
  for (const pad of pose.pads) assert(Math.abs(pad[1]) < 1e-6, 'Section pads must still rest on the desk plane');
}
// The real viewport-aware flight lands at one CSS pixel per source pixel, not an oversized fit-to-HUD scale.
const nativePose = panels.focusPose(1440 / 960, doc.RESUME_PANEL.w, doc.RESUME_PANEL.h, camera.position.toArray(), 960);
const nativeRotation = new THREE.Euler(nativePose.monitor.lean, nativePose.monitor.yaw, nativePose.monitor.roll);
const nativeCorners = [-1, 1].map(s => new THREE.Vector3(s * doc.RESUME_PANEL.w * 1.8 / doc.PANEL.w / 2, s * doc.RESUME_PANEL.h * 1.8 / doc.PANEL.w / 2, 0)
  .applyEuler(nativeRotation).add(new THREE.Vector3(...nativePose.monitor.pos)).project(camera));
assert(Math.abs((nativeCorners[1].x - nativeCorners[0].x) * 1440 / 2 - doc.RESUME_PANEL.w) < 1e-6, 'Flight endpoint width matches the flat reading box');
assert(Math.abs((nativeCorners[1].y - nativeCorners[0].y) * 960 / 2 - doc.RESUME_PANEL.h) < 1e-6, 'Flight endpoint height matches the flat reading box');
// The actual reading group cancels the saved wrapper yaw, not just the default focus pose.
camera.position.fromArray(layout['camera-section'].position);
camera.lookAt(new THREE.Vector3(...cam.at)); camera.updateMatrixWorld();
const readingPose = panels.focusPose(camera.aspect, doc.RESUME_PANEL.w, doc.RESUME_PANEL.h, camera.position.toArray());
const readingPanel = panels.HoloPanel({
  p: palette, position: [2, 1, -1], yaw: -0.4, lean: -0.4, open: true,
  focus: readingPose.monitor, faceRef: { current: null }, documentSize: [doc.RESUME_PANEL.w, doc.RESUME_PANEL.h],
});
const readingRoot = scene(readingPanel);
for (const fn of panelFrames) fn({ camera, size: { width: 1440, height: 960 } }, 10);
readingRoot.updateMatrixWorld(true);
const readingGroup = readingPanel.props.children.props.ref.current;
assert(readingGroup.getWorldQuaternion(new THREE.Quaternion()).angleTo(camera.quaternion) < 1e-6,
  'Reading projection is flat to the viewer even with a saved monitor yaw');
// The profile keeps its zoom flight while the flat résumé layer cross-fades in from mid-flight, then takes over exactly once.
let reveals = 0;
const fakeStyle = (o = {}) => Object.defineProperty(o, 'setProperty', { value(n, v) { this[n] = v; }, enumerable: false });
const layer = { style: fakeStyle(), classList: { contains: c => c === 'resume-layer' }, querySelector: () => ({ focus: () => reveals++ }) };
const faceRef = { current: { style: fakeStyle(), dataset: { reading: 'true' }, nextElementSibling: layer } };
panelFrames.length = 0;
scene(panels.HoloPanel({
  p: palette, position: [2, 1, -1], yaw: -0.4, lean: -0.4, open: true,
  focus: readingPose.monitor, faceRef, documentSize: [doc.RESUME_PANEL.w, doc.RESUME_PANEL.h],
}));
const flight = [], fade = [];
for (let frame = 0; frame < 240; frame++) {
  for (const fn of panelFrames) fn({ camera, size: { width: 1440, height: 960 } }, 1 / 60);
  flight.push(faceRef.current.style.transform);
  fade.push(Number(layer.style.opacity));
}
assert(flight[0].startsWith('matrix3d('), 'First frame must still fly from the home monitor');
assert.notEqual(flight[0], flight[1], 'Flight must animate over multiple frames');
assert(fade[0] === 0 && fade[30] === 0 && fade.at(-1) === 1, 'The profile flies alone first; the r\u00e9sum\u00e9 swaps in at the landing');
assert(fade.every((o, i) => !i || o >= fade[i - 1]), 'R\u00e9sum\u00e9 fade is monotonic');
const handoff = fade.findIndex(o => o >= 0.99);
assert(handoff >= 45 && handoff <= 1 * 60 + 2, 'R\u00e9sum\u00e9 is solid exactly when the 1s flight ends: no tail, no early pop');
assert(Number(faceRef.current.style['--profile-fade']) === 0 && faceRef.current.style.visibility === 'hidden', 'Profile is gone once the r\u00e9sum\u00e9 is solid');
assert.equal(faceRef.current.dataset.settled, 'true');
assert.equal(reveals, 1, 'One handoff, not repeated icon reveals');
const settledStyle = JSON.stringify(faceRef.current.style);
for (const active of ['experience', 'projects', 'contact']) {
  const face = panels.MonitorFace({ ref: faceRef, active, onCloseAction() {} });
  assert.equal(face.props.children[0].props.ref, faceRef, 'Chapter changes keep the same face node');
  for (let frame = 0; frame < 60; frame++) {
    for (const fn of panelFrames) fn({ camera, size: { width: 1440, height: 960 } }, 1 / 60);
    assert.equal(JSON.stringify(faceRef.current.style), settledStyle, 'Chapter changes never restart the flight');
  }
}
// Closing and layout editing still use remote main's existing projective renderer.
for (const [open, editing] of [[false, false], [true, true]]) {
  panelEditing = editing;
  delete faceRef.current.dataset.reading;
  faceRef.current.style = fakeStyle({ ...panels.MonitorFace({ ref: faceRef, active: open ? 'projects' : null, onCloseAction() {} }).props.children[0].props.style });
  panelFrames.length = 0;
  scene(panels.HoloPanel({
    p: palette, position: [2, 1, -1], yaw: -0.4, lean: -0.4, open,
    focus: readingPose.monitor, faceRef, documentSize: [doc.RESUME_PANEL.w, doc.RESUME_PANEL.h],
  }));
  for (const fn of panelFrames) fn({ camera, size: { width: 1440, height: 960 } }, 1 / 60);
  assert(faceRef.current.style.transform.startsWith('matrix3d('), 'Home/editor must not retain the flat reading transform');
}
panelEditing = false;
faceRef.current.dataset.reading = 'true';
faceRef.current.dataset.settled = 'true';
faceRef.current.style = fakeStyle(JSON.parse(settledStyle));
const staleFrameStyle = JSON.stringify(faceRef.current.style);
for (const fn of panelFrames) fn({ camera, size: { width: 1440, height: 960 } }, 1 / 60);
assert.equal(JSON.stringify(faceRef.current.style), staleFrameStyle, 'A stale Canvas callback cannot overwrite the new reading DOM');
// Reduced motion skips the flight and reveals the stable reading view immediately.
reducedMotion = true;
delete faceRef.current.dataset.settled;
panelFrames.length = 0;
scene(panels.HoloPanel({
  p: palette, position: [2, 1, -1], yaw: -0.4, lean: -0.4, open: true,
  focus: readingPose.monitor, faceRef, documentSize: [doc.RESUME_PANEL.w, doc.RESUME_PANEL.h],
}));
for (const fn of panelFrames) fn({ camera, size: { width: 1440, height: 960 } }, 1 / 60);
assert.equal(layer.style.opacity, '1');
assert.equal(faceRef.current.dataset.settled, 'true');
reducedMotion = false;
// The same résumé document stays mounted; navigation only scrolls its own content element.
const content = compile('../src/data/portfolio.ts');
const ResumeMonitor = compile('../src/components/ResumeMonitor.tsx', '', {
  '@/data/portfolio': content, './Sections': { SectionBody: () => null },
  './LayoutEditor': { useFlatLayout: () => ({ style: {}, handle: null }) },
}).default;
const resume = ResumeMonitor({ active: 'projects', onCloseAction() {} });
const workspace = resume.props.children.find(c => c?.props?.className === 'resume-workspace');
const [navigation, readingDocument] = workspace.props.children;
assert.equal(readingDocument.props.className, 'resume-document', 'Navigation and document are separate projections');
const scrollport = readingDocument.props.children.find(c => c?.props?.className === 'resume-scroll');
const links = navigation.props.children.flat().filter(c => c.props.href.startsWith('#resume-'));
assert.equal(links.length, sections.sections.length + 2, 'Navigation includes every section, About and Education');
assert.equal(scrollport.props.children.length, links.length, 'All résumé chapters render in one scrollport');
const requests = [];
scrollport.props.ref.current = { scrollTo: options => requests.push(options) };
scrollport.props.children.forEach((c, i) => c.props.ref({ offsetTop: i * 200 }));
links.find(c => c.props.href === '#resume-projects').props.onClick({ preventDefault() {} });
assert.equal(requests[0].top, 772, 'Projects link scrolls inside the monitor to its chapter');
assert.equal(requests[0].behavior, 'smooth', 'Chapter navigation scrolls smoothly');
scrollport.props.ref.current = null; // effects run later with no mounted scrollport
// Raycast the real Slot targets at both proposed elevations, home and section views.
const frames = [];
let pose, rail;
// Custom pad offsets are calibrated for their saved camera, not every hypothetical test angle.
const defaultRail = Object.fromEntries(Object.entries(layout).filter(([id]) => !id.startsWith('pad-')));
const introSettings = compile('../src/data/intro.ts', '', { './portfolio': {} });
const slots = compile('../src/components/Scene.tsx', '\nexport { Slot, Rig, Speech };', {
  '@react-three/fiber': { useFrame: fn => frames.push(fn), useThree: select => select({ camera }) },
  '@react-three/drei': { useGLTF: { preload() {} }, Text: () => null },
  '@/data/intro': introSettings,
  '@react-three/postprocessing': {}, '@/lib/timer': { timer: { getElapsed: () => 0 } },
  '@/data/layout': settings, '@/data/sections': sections, './Hologram': { default: () => null },
  './HtmlPanel': { useFocusPose: () => pose }, './Workshop': {},
  './LayoutEditor': {
    useLayout: () => ({ layout: rail ? defaultRail : layout }),
    Editable3D: p => {
      const t = (rail ? defaultRail : layout)[p.id] ?? settings.identity;
      return { type: 'group', props: { position: p.position, children: {
        type: 'group', props: { position: t.position, scale: t.scale, 'rotation-y': t.rotation ?? 0, children: p.children },
      } } };
    },
  },
});
const sceneSource = readFileSync(new URL('../src/components/Scene.tsx', import.meta.url), 'utf8');
assert(!sceneSource.includes('ringGeometry') && !sceneSource.includes('circleGeometry') && !sceneSource.includes('function Emitter'), 'No circular emitter lighting under text or section holograms');
// Speech stays at the pad center and rises vertically, without camera-facing orientation.
for (const height of Object.values(introSettings.SPEECH_HEIGHTS)) {
  frames.length = 0;
  const speech = slots.Speech({ text: 'Welcome', p: palette, instant: false, height });
  const lift = speech.props.children;
  lift.props.ref.current = new THREE.Group();
  lift.props.ref.current.position.y = lift.props['position-y'];
  for (const fn of frames) fn({}, 10);
  assert.deepEqual(Array.from(speech.props.position), [0, 0.025, 0], 'Project from the center of the pad');
  assert(Math.abs(lift.props.ref.current.position.y - height) < 1e-6, 'Speech uses its configured height');
  assert.equal(lift.props.ref.current.rotation.x, 0, 'Speech stays upright in world space');
}
// Intro changes only elevation; the module screen restores Home and section cameras stay saved.
for (const [intro, active, degrees] of [[true, null, 21], [false, null, 30], [false, 'projects', null]]) {
  frames.length = 0;
  slots.Rig({ intro, active, focus: !!active });
  for (const fn of frames) fn({ camera, pointer: { x: 0, y: 0 }, size: { width: 1440, height: 960 } }, 10);
  const saved = layout[active ? 'camera-section' : 'camera-home'].position;
  const distance = Math.hypot(camera.position.x, camera.position.y - cam.at[1], camera.position.z);
  assert(Math.abs(distance - Math.hypot(saved[0], saved[1] - cam.at[1], saved[2])) < 1e-6, 'Keep saved camera distance');
  if (degrees !== null) assert(Math.abs(THREE.MathUtils.radToDeg(Math.asin((camera.position.y - cam.at[1]) / distance)) - degrees) < 1e-5, 'Intro starts at 21 degrees, modules at 30');
  else saved.forEach((v, i) => assert(Math.abs(camera.position.toArray()[i] - v) < 1e-6, 'Section camera is unchanged'));
}
// Extreme mouse positions barely move the desk camera and never tilt the reading view.
for (const active of [null, 'projects']) {
  frames.length = 0;
  slots.Rig({ intro: false, active, focus: !!active });
  const saved = new THREE.Vector3().fromArray(layout[active ? 'camera-section' : 'camera-home'].position);
  for (const pointer of [-1, 1]) {
    for (const fn of frames) fn({ camera, pointer: { x: pointer, y: pointer }, size: { width: 1440, height: 960 } }, 10);
    const offset = camera.position.clone().sub(saved);
    assert(Math.abs(offset.x) <= 0.003501 && Math.abs(offset.y) <= 0.001201, 'Mouse movement is reduced by at least 99%');
    if (active) assert(offset.length() < 1e-6, 'Reading camera ignores mouse movement');
  }
}
const radius = 9;
for (const [width, height] of [[1440, 960], [1440, 806], [1024, 768], [768, 1024]]) {
  camera.aspect = width / height; camera.updateProjectionMatrix();
  for (const angle of [21, 30]) for (rail of [false, true]) {
    const elevation = THREE.MathUtils.degToRad(angle);
    const eye = [0, cam.at[1] + radius * Math.sin(elevation), radius * Math.cos(elevation)];
    camera.position.fromArray(eye); camera.lookAt(new THREE.Vector3(...cam.at)); camera.updateMatrixWorld();
    pose = panels.focusPose(camera.aspect, doc.PANEL.w, doc.PANEL.h, eye);
    frames.length = 0;
    const roots = ids.map((_, i) => scene(slots.Slot({ i, p: palette, active: null, onSelect() {}, motion: 0, focus: rail, show: true })));
    for (const fn of frames) fn({ camera }, 10);
    roots.forEach(root => root.updateMatrixWorld(true));
    for (const [i, root] of roots.entries()) {
      const label = root.getObjectByName(`label-${ids[i]}`);
      const orientation = rail ? camera.quaternion : new THREE.Quaternion();
      assert(label.quaternion.angleTo(orientation) < 1e-7, 'Section labels must face the camera; home engravings must keep their orientation');
    }
    const targets = roots.map((root, i) => root.getObjectByName(`target-${ids[i]}`));
    for (const target of targets) {
      assert(target.geometry.parameters.radiusTop <= 0.68 * 0.7, 'Hit target must fit inside its emitter rim');
      for (const x of [-0.2, 0, 0.2]) for (const y of [-0.2, 0, 0.2]) {
        const point = new THREE.Vector3(x, y, 0).applyMatrix4(target.matrixWorld).project(camera);
        const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(point.x, point.y), camera);
        assert.equal(ray.intersectObjects(targets, false)[0]?.object.name, target.name, `${width}×${height}, ${angle}°, ${rail ? 'section' : 'home'}, sample ${x}/${y}: neighbouring target must not steal ${target.name}; centres ${targets.map(t => t.getWorldPosition(new THREE.Vector3()).toArray()).join('; ')}`);
      }
    }
    // Large editor sizes must fit too: no arbitrary distance cap that clips the monitor.
    const enlarged = panels.focusPose(camera.aspect, doc.PANEL.w * 3, doc.PANEL.h * 3, eye);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const corner = new THREE.Vector3(sx * 1.8 * 3 / 2, sy * doc.PANEL.h * 1.8 / doc.PANEL.w * 3 / 2, 0)
        .applyEuler(new THREE.Euler(enlarged.monitor.lean, enlarged.monitor.yaw, enlarged.monitor.roll))
        .add(new THREE.Vector3(...enlarged.monitor.pos)).project(camera);
      assert(Math.abs(corner.x) <= 0.941 && Math.abs(corner.y) <= 0.881, 'Resized section monitor must fit the viewport');
    }
  }
}
let disposed = 0;
for (const root of [bench, room, laptopRoom, led, portrait]) root.traverse(node => {
  node.geometry?.dispose();
  const texture = node.userData.material?.map;
  texture?.addEventListener('dispose', () => disposed++);
});
for (const effect of effects) effect()?.();
assert(disposed >= 4, 'Procedural scene textures must release their GPU resources');
console.log('PASS: laptop-only shelf lowering, portrait/copy changes, no circular emitters, camera-facing labels, raycast targets, monitor fit and texture cleanup');
