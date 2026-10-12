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
  });
  return sandboxModule.exports;
}
const props = compile('../src/components/props.tsx');
const portraitTexture = new THREE.Texture();
const workshop = compile('../src/components/Workshop.tsx', '\nexport { Bench, Wall, DeskLight, WallFrame };', {
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
const ledElement = workshop.DeskLight();
const led = scene(ledElement);
const diffuser = led.getObjectByName('led-diffuser');
assert.equal(diffuser.geometry.parameters.width, diffuser.geometry.parameters.height, 'Task light must be a square LED');
const area = ledElement.props.children[1].props.children.find(child => child.type === 'rectAreaLight');
assert(area && area.props.width === area.props.height && area.props.intensity > 0, 'LED must actually illuminate the desk, not just glow');
led.updateMatrixWorld(true);
const direction = new THREE.Vector3(0, 0, 1).transformDirection(diffuser.matrixWorld);
assert(direction.y < -0.8 && direction.z > 0, 'Diffuser must aim down onto the table and toward the chair');
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
const panels = compile('../src/components/HtmlPanel.tsx', '\nexport { focusPose };', {
  '@react-three/fiber': {}, '@/lib/quad': {}, '@/data/doc': doc, '@/data/sections': sections,
  '@/data/layout': settings, './PanelShell': {}, './Hud': {}, './Sections': {},
  './LayoutEditor': {},
});
for (const eye of [[0, 4.8, 10.8], [3, 5, 9], [-3, 4.5, 8]]) {
  const pose = panels.focusPose(1440 / 960, doc.PANEL.w, doc.PANEL.h, eye);
  camera.position.fromArray(eye); camera.lookAt(new THREE.Vector3(...cam.at)); camera.updateMatrixWorld();
  const rotation = new THREE.Euler(pose.monitor.lean, pose.monitor.yaw, pose.monitor.roll);
  const size = [1.8, doc.PANEL.h * 1.8 / doc.PANEL.w];
  const corners = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    corners.push(new THREE.Vector3(sx * size[0] / 2, sy * size[1] / 2, 0).applyEuler(rotation)
      .add(new THREE.Vector3(...pose.monitor.pos)).project(camera));
  }
  assert(Math.abs(corners[0].x - corners[1].x) < 1e-6, 'Monitor must have vertical edges at any camera angle');
  assert(Math.abs(corners[0].y - corners[2].y) < 1e-6, 'Monitor must have horizontal edges at any camera angle');
  assert(Math.abs(corners[3].x - 0.94) < 1e-6, 'Monitor must keep its right-hand screen placement');
  for (const pad of pose.pads) assert(Math.abs(pad[1]) < 1e-6, 'Section pads must still rest on the desk plane');
}
// Raycast the real Slot targets at both proposed elevations, home and section views.
const frames = [];
let pose, rail;
// Custom pad offsets are calibrated for their saved camera, not every hypothetical test angle.
const defaultRail = Object.fromEntries(Object.entries(layout).filter(([id]) => !id.startsWith('pad-')));
const slots = compile('../src/components/Scene.tsx', '\nexport { Slot, Emitter };', {
  '@react-three/fiber': { useFrame: fn => frames.push(fn) },
  '@react-three/drei': { useGLTF: { preload() {} }, Text: () => null },
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
const emitter = scene(slots.Emitter({ p: palette, lit: true }));
let rings = 0;
emitter.traverse(node => {
  if (node.geometry?.type === 'RingGeometry') rings++;
  assert.notEqual(node.userData.material?.color, palette.primary, 'Emitter must not retain the red outer ring');
});
assert.equal(rings, 1, 'Keep only the accent ring');
const radius = 9;
for (const [width, height] of [[1440, 960], [1440, 806], [1024, 768], [768, 1024]]) {
  camera.aspect = width / height; camera.updateProjectionMatrix();
  for (const angle of [21, 30]) for (rail of [false, true]) {
    const elevation = THREE.MathUtils.degToRad(angle);
    const eye = [0, cam.at[1] + radius * Math.sin(elevation), radius * Math.cos(elevation)];
    camera.position.fromArray(eye); camera.lookAt(new THREE.Vector3(...cam.at)); camera.updateMatrixWorld();
    pose = panels.focusPose(camera.aspect, doc.PANEL.w, doc.PANEL.h, eye);
    frames.length = 0;
    const roots = ids.map((_, i) => scene(slots.Slot({ i, p: palette, active: null, onSelect() {}, motion: 0, focus: rail })));
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
console.log('PASS: laptop-only shelf lowering, portrait/copy changes, accent-only emitter ring, camera-facing labels, raycast targets, monitor fit and texture cleanup');
