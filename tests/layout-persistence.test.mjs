// Run: npm run test:layout-persistence
// Uses an isolated source copy: never edits the real saved layout or stops your dev server.
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, writeFile, symlink, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(join(root, '.shots'), { recursive: true });
const listener = createServer();
listener.listen(0, '127.0.0.1');
await once(listener, 'listening');
const port = listener.address().port;
await new Promise(resolve => listener.close(resolve));
const sandbox = await mkdtemp(join(root, '.shots/layout-persistence-'));
const url = `http://127.0.0.1:${port}`;
let server, log = '';
async function stop() {
  if (!server || server.exitCode !== null) return;
  const exited = once(server, 'exit');
  server.kill('SIGTERM');
  await exited;
}
async function start() {
  server = spawn(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', String(port)], { cwd: sandbox, env: { ...process.env, NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  for (const stream of [server.stdout, server.stderr]) stream.on('data', chunk => { log = (log + chunk).slice(-16000); });
  for (let i = 0; i < 120; i++) {
    if (server.exitCode !== null) throw new Error(log);
    try { const response = await fetch(url, { signal: AbortSignal.timeout(3000) }); if (response.ok) return; } catch {}
    await delay(250);
  }
  throw new Error('Server did not become ready: ' + log);
}
async function pageContains(expected) {
  const response = await fetch(url, { cache: 'no-store' });
  assert.equal(response.status, 200);
  const html = await response.text();
  const flight = [...html.matchAll(/self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)/g)].map(match => JSON.parse(match[1])).join('');
  const marker = flight.indexOf('"layout":{');
  if (marker < 0) throw new Error('No layout prop in server response');
  const start = marker + '"layout":'.length;
  let depth = 0, end = start;
  do { if (flight[end] === '{') depth++; if (flight[end] === '}') depth--; end++; } while (depth && end < flight.length);
  const loaded = JSON.parse(flight.slice(start, end));
  // Bundled JSON can round floating-point literals differently; compare at editor precision.
  const stable = value => JSON.stringify(value, (_, n) => typeof n === 'number' ? Number(n.toFixed(12)) : n);
  return stable(loaded) === stable(expected);
}
try {
  for (const file of ['src', 'package.json', 'package-lock.json', 'tsconfig.json', 'next-env.d.ts']) await cp(join(root, file), join(sandbox, file), { recursive: true });
  for (const dir of ['node_modules', 'public']) await symlink(join(root, dir), join(sandbox, dir), 'dir');
  const config = (await readFile(join(root, 'next.config.ts'), 'utf8')).replace('turbopack: {', 'turbopack: { root: ' + JSON.stringify(root) + ',');
  await writeFile(join(sandbox, 'next.config.ts'), config);
  const original = JSON.parse(await readFile(join(sandbox, 'src/data/layout.json'), 'utf8'));
  await start();
  assert(await pageContains(original), 'Initial page must load saved layout');
  console.log('PASS: initial page loads saved layout');
  const changed = {
    ...original,
    profile: { ...original.profile, rotation: Math.PI / 3, width: 1.35, height: 0.9 },
    'section-mug': { position: [-1, 0.1, 2], scale: 1.5, rotation: Math.PI / 2 },
    'section-keyboard': { position: [2, 0, -1], scale: 0.8, rotation: -Math.PI / 3 },
    'camera-home': { position: [2, 4.8, 10.8], scale: 1 },
    'camera-section': { position: [-3, 4.5, 8], scale: 1 },
  };
  const response = await fetch(url + '/api/dev-layout', { method: 'POST', headers: { 'content-type': 'application/json', origin: url }, body: JSON.stringify(changed) });
  assert.equal(response.status, 200, await response.text());
  assert.deepEqual(JSON.parse(await readFile(join(sandbox, 'src/data/layout.json'), 'utf8')), changed);
  console.log('PASS: Save writes all layout fields to the source JSON');
  const immediate = await pageContains(changed);
  console.log('Fresh request immediately after save:', immediate ? 'PASS' : 'STALE');
  await delay(2000);
  const settled = await pageContains(changed);
  console.log('Fresh request after watcher settles:', settled ? 'PASS' : 'STALE');
  await stop();
  await start();
  const restarted = await pageContains(changed);
  console.log('After restarting server:', restarted ? 'PASS' : 'STALE');
  assert(immediate && settled && restarted, 'Saved changes must persist in new requests and after restart');
} catch (error) {
  console.error(log);
  throw error;
} finally {
  await stop();
  await rm(sandbox, { recursive: true, force: true });
}
