// Run: node --experimental-strip-types tests/quad.test.mjs
// Optional real painting check (dev server running, existing Playwright install; no new project dependency):
// PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs node --experimental-strip-types tests/quad.test.mjs --browser
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { quadToCss } from "../src/lib/quad.ts";

// Apply a CSS matrix3d (column-major) to a box point, as the browser does with transform-origin 0 0.
const map = (css, x, y) => {
  const m = css.slice(9, -1).split(",").map(Number);
  const w = m[3] * x + m[7] * y + m[15];
  return [(m[0] * x + m[4] * y + m[12]) / w, (m[1] * x + m[5] * y + m[13]) / w];
};
const close = (a, b) => assert(Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-6, `${a} != ${b}`);
const W = 900, H = 600;
for (const quad of [
  [[0, 0], [W, 0], [W, H], [0, H]], // identity
  [[10, 20], [410, 60], [380, 360], [-20, 320]], // affine
  [[1000, 140], [1420, 190], [1400, 560], [990, 520]], // perspective (monitor seen at an angle)
]) {
  const css = quadToCss(W, H, quad);
  [[0, 0], [W, 0], [W, H], [0, H]].forEach(([x, y], i) => close(map(css, x, y), quad[i]));
  const [left, top] = quad[0];
  const local = quadToCss(W, H, quad.map(([x, y]) => [x - left, y - top]));
  [[0, 0], [W, 0], [W, H], [0, H]].forEach(([x, y], i) => {
    const p = map(local, x, y);
    close([p[0] + left, p[1] + top], quad[i]);
  });
}
assert(quadToCss(W, H, [[0, 0], [W, 0], [W - 0.01, H], [0, H]]).startsWith("matrix3d("),
  "Even mild real perspective must remain projective");
assert.equal(quadToCss(W, H, [[0, 0], [0, 0], [0, 0], [0, 0]]), null, "degenerate quad");
assert.equal(quadToCss(W, H, [[0, 0], [100, 0], [0, 100], [100, 100]]), null, "self-crossing quad");

// Scene.tsx clamps drei's Sparkles alpha by text replacement; fail loudly if a drei update changes that shader.
const sparkles = await readFile(new URL("../node_modules/@react-three/drei/core/Sparkles.js", import.meta.url), "utf8");
assert(sparkles.includes("0.05 / distanceToCenter - 0.1"), "drei Sparkles shader changed: update clampSparkles in Scene.tsx");
assert.equal(quadToCss(-W, H, [[0, 0], [W, 0], [W, H], [0, H]]), null, "negative box width");
assert.equal(quadToCss(W, H, [[NaN, 0], [W, 0], [W, H], [0, H]]), null, "nonfinite quad");
console.log("quad ok");

if (process.argv.includes("--browser")) {
  const { webkit, chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
  for (const engine of [webkit, chromium]) {
    const browser = await engine.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(process.env.URL ?? "http://localhost:3000", { waitUntil: "load" });
      const face = page.locator('section[aria-label="Profile"]').locator("..").locator("..").locator("..");
      await face.waitFor({ state: "visible" });
      await page.waitForTimeout(2500);
      const { css, left, top, w, h } = await face.evaluate((el) => ({
        css: el.style.transform, left: parseFloat(el.style.left), top: parseFloat(el.style.top),
        w: parseFloat(el.style.width), h: parseFloat(el.style.height),
      }));
      assert(css.startsWith("matrix3d("), "face must be projected");
      // Paint the real home projection in isolation, away from animation. Hit testing/bounding rects alone can pass while WebKit
      // paints the global homography as an invisible or edge-on sliver. Compare a small interior crop with the empty background.
      const [x, y] = map(css, w / 2, h / 2);
      const clip = { x: Math.floor(left + x - 5), y: Math.floor(top + y - 5), width: 10, height: 10 };
      await page.setContent('<body style="margin:0;background:black"></body>');
      const empty = await page.screenshot({ clip });
      await page.evaluate(({ css, left, top, w, h }) => {
        const el = document.createElement("div");
        Object.assign(el.style, {
          position: "absolute", left: `${left}px`, top: `${top}px`, width: `${w}px`, height: `${h}px`,
          transformOrigin: "0 0", transform: css, background: "cyan",
        });
        document.body.append(el);
      }, { css, left, top, w, h });
      assert(!empty.equals(await page.screenshot({ clip })), `${engine.name()}: projected home panel must actually paint`);
      console.log(`${engine.name()} home projection paints correctly`);
    } finally { await browser.close(); }
  }
}
