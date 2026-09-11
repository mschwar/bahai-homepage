// tests/wallpaper-check.mjs
// Headless check of the wallpaper generator PNG (queue C12 option b).
//
// DEV-ONLY. Not part of the served site and adds no runtime dependency.
// Drives wallpaper.html in headless Chromium via Playwright, self-hosting a
// static HTTP server so the page's fetch() of the corpus works under a real
// origin. Unlike tests/parity.mjs, this does NOT abort Google Fonts or unpkg:
// the generated image must paint with Cormorant Garamond, and the page mounts
// React 18 from the CDN.
//
// Run:   node tests/wallpaper-check.mjs
//        make wallpaper-check
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path === '/') path = '/index.html';
    const file = join(ROOT, normalize(path));
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    res.writeHead(404); res.end('not found');
  }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

let passed = 0, failed = 0;
const failures = [];
async function test(name, fn) {
  try { await fn(); passed++; console.log(`PASS  ${name}`); }
  catch (e) { failed++; failures.push({ name, e }); console.log(`FAIL  ${name}\n      ${e.message}`); }
}

const LIGHT = [247, 244, 240];
const DARK = [26, 38, 57];

function rgbEq(got, expected, label) {
  const [r, g, b, a] = got;
  const [er, eg, eb] = expected;
  if (r !== er || g !== eg || b !== eb || a !== 255) {
    throw new Error(`${label}: expected rgb(${er}, ${eg}, ${eb}) got rgba(${r}, ${g}, ${b}, ${a})`);
  }
}

async function sampleCanvas(page) {
  return page.evaluate(() => {
    const c = document.querySelector('.preview-canvas');
    if (!c) return null;
    const ctx = c.getContext('2d');
    const at = (x, y) => {
      const d = ctx.getImageData(x, y, 1, 1).data;
      return [d[0], d[1], d[2], d[3]];
    };
    return {
      width: c.width,
      height: c.height,
      tl: at(8, 8),
      bl: at(8, c.height - 8),
      font: ctx.font,
      align: ctx.textAlign,
      png: c.toDataURL('image/png'),
    };
  });
}

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const pageErrors = [];
const consoleErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

await page.goto(`${BASE}/wallpaper.html`, { waitUntil: 'networkidle', timeout: 30000 });

await page.waitForFunction(() => {
  const c = document.querySelector('.preview-canvas');
  if (!c || c.width < 100) return false;
  const d = c.getContext('2d').getImageData(8, 8, 1, 1).data;
  return d[3] === 255 && (d[0] + d[1] + d[2] > 0);
}, { timeout: 20000 });

await page.evaluate(async () => {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  if (document.fonts && document.fonts.load) {
    await document.fonts.load('400 48px "Cormorant Garamond"');
    await document.fonts.load('400 24px "Source Sans Pro"');
  }
});

// Re-wait after fonts: the page itself draws on document.fonts.ready.
await page.waitForFunction(() => {
  const c = document.querySelector('.preview-canvas');
  if (!c || c.width < 100) return false;
  const d = c.getContext('2d').getImageData(8, 8, 1, 1).data;
  return d[0] === 247 && d[1] === 244 && d[2] === 240 && d[3] === 255;
}, { timeout: 15000 });

await test('light canvas fill is rgb(247, 244, 240) and flat (no gradient)', async () => {
  const s = await sampleCanvas(page);
  if (!s) throw new Error('preview canvas missing');
  if (s.width !== 1170 || s.height !== 2532) {
    throw new Error(`expected default 1170x2532, got ${s.width}x${s.height}`);
  }
  rgbEq(s.tl, LIGHT, 'light top-left');
  rgbEq(s.bl, LIGHT, 'light bottom-left');
  console.log(`      light corners rgb(${s.tl[0]}, ${s.tl[1]}, ${s.tl[2]}) / rgb(${s.bl[0]}, ${s.bl[1]}, ${s.bl[2]})`);
});

await test('Cormorant Garamond is loaded and used on the verse after fonts.ready', async () => {
  const fontState = await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const check = document.fonts.check('400 48px "Cormorant Garamond"');
    const loaded = [...document.fonts]
      .filter((f) => f.status === 'loaded')
      .map((f) => f.family);
    return { check, loaded };
  });
  if (!fontState.check) {
    throw new Error(`document.fonts.check(Cormorant Garamond) is false; loaded=${fontState.loaded.join(', ')}`);
  }
  if (!fontState.loaded.some((f) => /cormorant garamond/i.test(f))) {
    throw new Error(`Cormorant Garamond not in loaded faces: ${fontState.loaded.join(', ')}`);
  }

  // Last ctx.font after a verse-only redraw is the verse face.
  await page.uncheck('input[type="checkbox"]');
  await page.waitForFunction(() => {
    const c = document.querySelector('.preview-canvas');
    if (!c) return false;
    return /cormorant garamond/i.test(c.getContext('2d').font);
  }, { timeout: 10000 });
  const verse = await sampleCanvas(page);
  if (!/cormorant garamond/i.test(verse.font)) {
    throw new Error(`expected verse ctx.font to include Cormorant Garamond, got ${verse.font}`);
  }
  console.log(`      fonts.check=true ctx.font=${verse.font}`);

  await page.check('input[type="checkbox"]');
  await page.waitForFunction(() => {
    const c = document.querySelector('.preview-canvas');
    return c && c.getContext('2d').textAlign === 'right';
  }, { timeout: 10000 });
  const withAuthor = await sampleCanvas(page);
  if (withAuthor.align !== 'right') {
    throw new Error(`expected author textAlign=right, got ${withAuthor.align}`);
  }
  if (!/source sans pro/i.test(withAuthor.font)) {
    throw new Error(`expected author ctx.font to include Source Sans Pro, got ${withAuthor.font}`);
  }
});

await test('Download PNG is a non-empty image/png data URL', async () => {
  const s = await sampleCanvas(page);
  if (!s.png || !s.png.startsWith('data:image/png')) {
    throw new Error(`toDataURL was not image/png (prefix=${(s.png || '').slice(0, 32)})`);
  }
  if (s.png.length < 1000) {
    throw new Error(`PNG data URL implausibly short (${s.png.length} chars)`);
  }
  console.log(`      png bytes(approx)=${Math.round((s.png.length - 'data:image/png;base64,'.length) * 0.75)} chars=${s.png.length}`);
});

await test('dark canvas fill is rgb(26, 38, 57) and flat (no gradient)', async () => {
  const appearance = page.locator('select.control-select').filter({ has: page.locator('option[value="night"]') });
  await appearance.selectOption('night');
  await page.waitForFunction(() => {
    const c = document.querySelector('.preview-canvas');
    if (!c || c.width < 100) return false;
    const d = c.getContext('2d').getImageData(8, 8, 1, 1).data;
    return d[0] === 26 && d[1] === 38 && d[2] === 57 && d[3] === 255;
  }, { timeout: 10000 });
  const s = await sampleCanvas(page);
  rgbEq(s.tl, DARK, 'dark top-left');
  rgbEq(s.bl, DARK, 'dark bottom-left');
  console.log(`      dark corners rgb(${s.tl[0]}, ${s.tl[1]}, ${s.tl[2]}) / rgb(${s.bl[0]}, ${s.bl[1]}, ${s.bl[2]})`);
});

await test('wallpaper.html has no page or console errors', async () => {
  if (pageErrors.length) throw new Error(`pageerror: ${pageErrors.join(' | ')}`);
  if (consoleErrors.length) throw new Error(`console error: ${consoleErrors.join(' | ')}`);
});

await ctx.close();
await browser.close();
server.close();

console.log(`\n== RESULT: ${passed} passed, ${failed} failed ==`);
if (failed > 0) {
  for (const f of failures) console.log(`  - ${f.name}: ${f.e.message}`);
  process.exit(1);
}
