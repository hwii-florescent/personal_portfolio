// Run: node tests/figures.test.mjs
// Checks the actual JSX geometry without a browser, WebGL, or a test framework.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';

const require = createRequire(import.meta.url);
const effects = [];
const context = new Proxy({}, { get: (_, key) => key === 'canvas' ? {} : () => {} });
const sandboxModule = { exports: {} };
const source = readFileSync(new URL('../src/components/props.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
runInNewContext(compiled, {
  module: sandboxModule, exports: sandboxModule.exports,
  require: name => name === 'react' ? {
    useMemo: fn => fn(), useEffect: fn => effects.push(fn), useCallback: fn => fn,
  } : name === 'three' ? THREE : require(name),
  document: { createElement: () => ({ getContext: () => context }) },
});

function scene(element) {
  if (!element || typeof element !== 'object') return null;
  if (typeof element.type === 'function') return scene(element.type(element.props));
  const p = element.props;
  const object = element.type === 'mesh' ? new THREE.Mesh() : new THREE.Group();
  object.name = p.name ?? '';
  if (p.position) object.position.fromArray(p.position);
  if (p.rotation) object.rotation.fromArray(p.rotation);
  if (p['rotation-y'] !== undefined) object.rotation.y = p['rotation-y'];
  if (p['rotation-z'] !== undefined) object.rotation.z = p['rotation-z'];
  if (p.scale !== undefined) {
    if (Array.isArray(p.scale)) object.scale.fromArray(p.scale);
    else object.scale.setScalar(p.scale);
  }
  for (const child of [p.children].flat(Infinity)) {
    if (!child) continue;
    if (typeof child.type === 'string' && child.type.endsWith('Geometry')) {
      const name = child.type[0].toUpperCase() + child.type.slice(1);
      object.geometry = new THREE[name](...child.props.args);
    } else if (child.type === 'meshStandardMaterial' && child.props.map) {
      object.userData.texture = child.props.map;
    } else {
      const node = scene(child);
      if (node) object.add(node);
    }
  }
  return object;
}

const disposed = [];
const signature = { miles: 'spider-emblem', luffy: 'straw-hat', zoro: 'three-swords', chopper: 'chopper-hat' };
for (const [character, accessory] of Object.entries(signature)) {
  const root = scene(sandboxModule.exports.Figure({ at: [0, 0, 0], character, h: 0.58 }));
  root.updateMatrixWorld(true);
  assert(root.getObjectByName(accessory), `${character}: missing recognizable accessory`);
  const bounds = new THREE.Box3().setFromObject(root);
  assert(Math.abs(bounds.min.y) < 0.0001, `${character}: plinth must rest on the shelf`);
  assert(bounds.max.y > 0.53 && bounds.max.y <= 0.61, `${character}: must fit the existing shelf gap`);
  assert(bounds.getSize(new THREE.Vector3()).x < 0.5, `${character}: must not overlap adjacent figures`);
  const head = root.getObjectByName('painted-head');
  assert(head.userData.texture.colorSpace === THREE.SRGBColorSpace, `${character}: painted colors must use sRGB`);
  head.userData.texture.addEventListener('dispose', () => disposed.push(character));
  // The middle of the painted face (u/v = 0.5) must face +Z, not the wall.
  const positions = head.geometry.attributes.position;
  const uv = head.geometry.attributes.uv;
  let facePoint;
  for (let i = 0; i < uv.count; i++) {
    if (Math.abs(uv.getX(i) - 0.5) < 0.001 && Math.abs(uv.getY(i) - 0.5) < 0.001) {
      facePoint = new THREE.Vector3().fromBufferAttribute(positions, i).applyEuler(head.rotation);
      break;
    }
  }
  assert(facePoint?.z > 0.12, `${character}: face texture is pointing backward`);
  let meshes = 0;
  root.traverse(node => { if (node.isMesh) { meshes++; node.geometry.dispose(); } });
  assert(meshes < 70, `${character}: shelf collectible exceeded mesh budget`);
}
assert.equal(effects.length, 4, 'Every face texture must register unmount cleanup');
for (const effect of effects) {
  const cleanup = effect();
  assert.equal(typeof cleanup, 'function');
  cleanup();
}
assert.equal(disposed.length, 4, 'Unmount must release all four GPU textures');
console.log('PASS: all four character signatures, shelf bounds, face orientation, texture cleanup, and mesh budget');
