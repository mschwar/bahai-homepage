// tests/wallpaper-check.mjs
// Headless check of the e-ink lock-screen PNG (D25).
//
// DEV-ONLY. Not part of the served site. Unlike tests/parity.mjs this does
// NOT abort Google Fonts or unpkg: the image must paint Cormorant Garamond,
// and the page mounts React 18 from the CDN.
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

const PAPER = [239, 232, 214]; // #efe8d6

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
      words: Number(c.dataset.words || 0),
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

await page.evaluate(async () => {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  if (document.fonts && document.fonts.load) {
    await document.fonts.load('400 48px "Cormorant Garamond"');
    await document.fonts.load('italic 400 24px "Cormorant Garamond"');
  }
});

await page.waitForFunction(() => {
  const c = document.querySelector('.preview-canvas');
  if (!c || c.width < 100) return false;
  const d = c.getContext('2d').getImageData(8, 8, 1, 1).data;
  return d[0] === 239 && d[1] === 232 && d[2] === 214 && d[3] === 255;
}, { timeout: 20000 });

await test('e-ink paper fill is rgb(239, 232, 214) and flat', async () => {
  const s = await sampleCanvas(page);
  if (!s) throw new Error('preview canvas missing');
  if (s.width !== 1170 || s.height !== 2532) {
    throw new Error(`expected default 1170x2532, got ${s.width}x${s.height}`);
  }
  rgbEq(s.tl, PAPER, 'paper top-left');
  rgbEq(s.bl, PAPER, 'paper bottom-left');
  console.log(`      paper corners rgb(${s.tl[0]}, ${s.tl[1]}, ${s.tl[2]})`);
});

await test('verse is ≤35 words and author is right-aligned Cormorant', async () => {
  const s = await sampleCanvas(page);
  if (s.words < 1 || s.words > 35) {
    throw new Error(`lock-screen verse must be 1–35 words, got ${s.words}`);
  }
  if (s.align !== 'right') {
    throw new Error(`expected author textAlign=right, got ${s.align}`);
  }
  if (!/cormorant garamond/i.test(s.font)) {
    throw new Error(`expected Cormorant Garamond on the canvas, got ${s.font}`);
  }
  console.log(`      words=${s.words} align=${s.align} font=${s.font}`);
});

await test('Download PNG is a non-empty image/png data URL', async () => {
  const s = await sampleCanvas(page);
  if (!s.png || !s.png.startsWith('data:image/png')) {
    throw new Error(`toDataURL was not image/png (prefix=${(s.png || '').slice(0, 32)})`);
  }
  if (s.png.length < 1000) {
    throw new Error(`PNG data URL implausibly short (${s.png.length} chars)`);
  }
  console.log(`      png chars=${s.png.length}`);
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
