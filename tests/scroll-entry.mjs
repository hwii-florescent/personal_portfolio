// Run against a running site: PORTFOLIO_URL=http://localhost:3000 node tests/scroll-entry.mjs
// Uses an isolated headless Chrome and real wheel, touch and keyboard input (no added packages).
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const url = process.env.PORTFOLIO_URL ?? 'http://localhost:3000';
const chromePath = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const dir = await mkdtemp(join(tmpdir(), 'portfolio-scroll-'));
const chrome = spawn(chromePath, ['--headless=new', '--enable-unsafe-swiftshader', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${dir}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const sockets = [];
async function connect(endpoint) {
  const ws = new WebSocket(endpoint); sockets.push(ws);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0; const pending = new Map();
  ws.onmessage = ({ data }) => { const r = JSON.parse(data); const p = pending.get(r.id); if (!p) return; pending.delete(r.id); clearTimeout(p.timer); if (r.error) p.reject(Error(JSON.stringify(r.error))); else p.resolve(r.result); };
  return (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; const timer = setTimeout(() => reject(Error(`Timeout: ${method}`)), 20000); pending.set(n, { resolve, reject, timer }); ws.send(JSON.stringify({ id: n, method, params })); });
}
try {
  const endpoint = await new Promise((resolve, reject) => { let log = ''; const t = setTimeout(() => reject(Error('Chrome startup timeout')), 10000); chrome.stderr.on('data', b => { log += b; const m = log.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); resolve(m[1]); } }); });
  const browser = await connect(endpoint);
  const { targetId } = await browser('Target.createTarget', { url: 'about:blank' });
  const http = endpoint.replace('ws://', 'http://').split('/devtools/')[0];
  const target = (await (await fetch(`${http}/json/list`)).json()).find(t => t.id === targetId);
  const send = await connect(target.webSocketDebuggerUrl);
  const evaluate = async expression => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  const wait = condition => evaluate(`(async()=>{const end=Date.now()+40000;while(!(${condition})&&Date.now()<end)await new Promise(r=>setTimeout(r,40));if(!(${condition}))throw Error('Timed out: '+${JSON.stringify(condition)});return true})()`);
  const key = async (name, code, vk, text) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: name, code, windowsVirtualKeyCode: vk, ...(text ? { text, unmodifiedText: text } : {}) });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code, windowsVirtualKeyCode: vk });
  };
  const view = () => evaluate("document.querySelector('.portfolio-root').dataset.view");
  const theme = () => evaluate("document.querySelector('.portfolio-root').dataset.theme");
  const reading = "document.querySelector('.portfolio-root')?.dataset.view==='reading' && (document.querySelector('.mobile-resume') || (document.querySelector('.resume-layer') && getComputedStyle(document.querySelector('.resume-layer')).opacity==='1'))";
  const top = () => evaluate("document.querySelector('.resume-layer .resume-scroll')?.scrollTop ?? document.querySelector('.mobile-resume .resume-scroll')?.scrollTop");

  for (const [mobile, width, height] of [[false, 1440, 900], [true, 390, 844]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
    await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
    for (const wanted of ['jarvis', 'spidey']) {
      for (const input of mobile ? ['touch', 'ArrowDown', 'Space'] : ['wheel', 'PageDown', 'Space']) {
        await send('Page.navigate', { url });
        await wait("document.querySelector('.opacity-100 canvas') && document.querySelector('.portfolio-root')");
        if (await theme() !== wanted) await evaluate("document.querySelector('[aria-label^=\"Switch AI\"]').click()");
        await wait(`document.querySelector('.portfolio-root').dataset.theme===${JSON.stringify(wanted)}`);
        // Space belongs to the intro until it ends: it must advance the AI, never open the section view.
        if (input === 'Space') {
          await key(' ', 'Space', 32, ' ');
          await new Promise(r => setTimeout(r, 400));
          assert.equal(await view(), 'home', `${wanted}: Space during the intro must not open a section`);
          await key('Escape', 'Escape', 27);
          await wait("!document.body.innerText.toLowerCase().includes('scroll to begin')");
        } else {
          await wait("document.body.innerText.toLowerCase().includes('scroll to begin')");
        }
        await evaluate("document.activeElement?.blur(); true");
        if (input === 'wheel') await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: width * 0.3, y: height * 0.5, deltaX: 0, deltaY: 450 });
        else if (input === 'touch') await send('Input.synthesizeScrollGesture', { x: width * 0.3, y: height * 0.55, yDistance: -400, gestureSourceType: 'touch', speed: 700 });
        else if (input === 'PageDown') await key('PageDown', 'PageDown', 34);
        else if (input === 'ArrowDown') await key('ArrowDown', 'ArrowDown', 40);
        else await key(' ', 'Space', 32, ' ');
        await wait(reading);
        assert.equal(await top(), 0, `${wanted}/${input}: reader must open at the top`);
        assert.equal(await evaluate('scrollY'), 0, `${wanted}/${input}: room must not stay scrolled`);
        await key('Escape', 'Escape', 27);
        await wait("document.querySelector('.portfolio-root').dataset.view==='home'");
        await evaluate('scrollTo(0, 80); true');
        await new Promise(r => setTimeout(r, 250));
        assert.equal(await view(), 'home', `${wanted}/${input}: residual momentum after Back must not reopen the reader`);
        console.log('PASS', wanted, mobile ? 'mobile' : 'desktop', input);
      }
    }
  }
  await browser('Browser.close');
} finally {
  for (const ws of sockets) try { ws.close(); } catch { /* already closed */ }
  chrome.kill();
  await new Promise(resolve => chrome.exitCode !== null ? resolve() : chrome.once('exit', resolve));
  await rm(dir, { recursive: true, force: true });
}
