// tests/visual-contract.mjs
// V1 responsive-typesetting / visual-normalization contract.
//
// Default mode is structural and deterministic: external fonts and the Badíʿ vendor
// are blocked and "now" is pinned, so layout results are reproducible across runs.
// It proves that layout is expressed in CSS pixels and relationships, not physical
// pixels, across representative viewport sizes and DPRs.
//
// `--live-fonts` leaves Google Fonts reachable and additionally requires the exact
// requested Cormorant Garamond 400 and Source Sans Pro 300 faces to load. This mode
// is intentionally network-dependent and must not replace the hermetic structural run.
//
// Optional evidence (write screenshots OUTSIDE the repo by default — `main` is publicly
// served, so committing PNGs into docs/audit/ needs its own explicit reason):
//   VISUAL_EVIDENCE_DIR=/tmp/v1-evidence node tests/visual-contract.mjs --live-fonts

import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const LIVE_FONTS = process.argv.includes('--live-fonts');
const EVIDENCE_DIR = process.env.VISUAL_EVIDENCE_DIR || '';

// Pin "now" so day-of-year selection, cache keys and any date-derived text cannot vary
// between runs (the same reason tests/parity.mjs fixes the clock).
const TODAY = new Date(2026, 5, 15, 12, 0, 0);

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path === '/') path = '/index.html';
    const file = join(ROOT, normalize(path));
    if (!file.startsWith(ROOT)) {
      res.writeHead(403);
      res.end();
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const BASE = `http://127.0.0.1:${server.address().port}`;

let passed = 0;
let failed = 0;
const failures = [];
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`PASS  ${name}`);
  } catch (error) {
    failed++;
    failures.push({ name, error });
    console.log(`FAIL  ${name}\n      ${error.message}`);
  }
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
const close = (a, b, tolerance = 0.75) => Math.abs(a - b) <= tolerance;
const countWords = text => (text || '').trim().split(/\s+/).filter(Boolean).length;

// Wait until a CSS transition has settled: two consecutive polls agree. A theme swap
// animates (body{transition:background .3s,color .3s}), so reading colours immediately
// after the class change lands mid-interpolation and yields a meaningless ratio.
async function settled(page, selector) {
  await page.waitForFunction(sel => {
    const element = document.querySelector(sel);
    const key = `${getComputedStyle(element).color}|${getComputedStyle(document.body).backgroundColor}`;
    window.__v1Settle = window.__v1Settle || {};
    const previous = window.__v1Settle[sel];
    window.__v1Settle[sel] = key;
    return previous === key;
  }, selector, { timeout: 5000, polling: 120 });
}

// Legibility, not layout. An element can be visible, non-zero-box and enabled while being
// the same colour as its background — this repo's recorded defect class. Resolve the
// element's colour against the first opaque ancestor background and compute the WCAG 2.x
// contrast ratio, so "the attribution recedes but stays readable" is falsifiable.
async function legibility(page, selector) {
  return page.evaluate(sel => {
    const parse = value => {
      const match = /rgba?\(([^)]+)\)/.exec(value || '');
      if (!match) return null;
      const parts = match[1].split(',').map(part => parseFloat(part.trim()));
      return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
    };
    // The declared colour is usually translucent, so composite it over its backdrop first;
    // otherwise the ratio is computed against a colour nothing actually paints.
    const composite = (fg, bg) => ({
      r: fg.a * fg.r + (1 - fg.a) * bg.r,
      g: fg.a * fg.g + (1 - fg.a) * bg.g,
      b: fg.a * fg.b + (1 - fg.a) * bg.b,
    });
    const channel = value => {
      const s = value / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const luminance = c => 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
    const ratio = (a, b) => {
      const la = luminance(a);
      const lb = luminance(b);
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    };

    const element = document.querySelector(sel);
    const textRaw = parse(getComputedStyle(element).color);
    // Resolve the background by walking ancestors: the element itself paints none.
    let node = element;
    let backdrop = null;
    while (node && !backdrop) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg && bg.a >= 0.999) backdrop = bg;
      node = node.parentElement;
    }
    if (!backdrop) backdrop = { r: 255, g: 255, b: 255, a: 1 };
    const text = textRaw ? composite(textRaw, backdrop) : backdrop;
    return {
      color: getComputedStyle(element).color,
      backdrop: `rgb(${Math.round(backdrop.r)}, ${Math.round(backdrop.g)}, ${Math.round(backdrop.b)})`,
      theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light',
      ratio: ratio(text, backdrop),
    };
  }, selector);
}

const collection = JSON.parse(
  await readFile(join(ROOT, 'data/collections/hidden-words.json'), 'utf8')
);
const maxWords = collection.default_eligibility.max_words;
const eligible = collection.items.filter(item => countWords(item.text) <= maxWords);
const longest = eligible.reduce((best, item) =>
  countWords(item.text) > countWords(best.text) ? item : best
);

const indexHtml = await readFile(join(ROOT, 'index.html'), 'utf8');
const stylesheet = await readFile(join(ROOT, 'css/style.css'), 'utf8');

// These two are fast source PRE-CHECKS, not rendering proof: a byte match cannot tell a
// real 300 face from a synthesized one. Only --live-fonts proves the face resolves.
await test('PRE-CHECK (source grep, not rendering): font request includes the real Source Sans Pro 300 face', async () => {
  assert(
    indexHtml.includes('Source+Sans+Pro:300,400,700'),
    'index.html does not request Source Sans Pro weight 300'
  );
});
await test('PRE-CHECK (source grep, not rendering): quote and attribution disable synthetic font weights', async () => {
  const matches = stylesheet.match(/font-synthesis:none/g) || [];
  assert(matches.length >= 2, `expected >=2 font-synthesis:none declarations, got ${matches.length}`);
});

const CASES = [
  { name: 'phone-390x844-3x', width: 390, height: 844, dpr: 3 },
  { name: 'laptop-1280x800-1x', width: 1280, height: 800, dpr: 1 },
  { name: 'laptop-1440x900-1x', width: 1440, height: 900, dpr: 1 },
  { name: 'laptop-1440x900-2x', width: 1440, height: 900, dpr: 2 },
  { name: 'desktop-1920x1080-1x', width: 1920, height: 1080, dpr: 1 },
  { name: 'desktop-1920x1080-2x', width: 1920, height: 1080, dpr: 2 },
  { name: 'large-2560x1440-2x', width: 2560, height: 1440, dpr: 2 },
  { name: '4k-3840x2160-1x', width: 3840, height: 2160, dpr: 1 },
];

const browser = await chromium.launch();
const measurements = new Map();

async function preparePage(spec) {
  const context = await browser.newContext({
    viewport: { width: spec.width, height: spec.height },
    deviceScaleFactor: spec.dpr,
  });
  const page = await context.newPage();

  await page.route('https://wondrous-badi.today/**', route => route.abort());
  if (!LIVE_FONTS) {
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('https://fonts.gstatic.com/**', route => route.abort());
  }

  await page.clock.install({ time: TODAY });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => {
    const node = document.getElementById('quote-text');
    return node && node.textContent && node.textContent !== 'Loading Sacred Verse…';
  }, { timeout: 10000 });

  // Visual QA must prove the content envelope, not whichever verse today's date happens to select.
  await page.evaluate(({ text, author }) => {
    document.getElementById('quote-text').textContent = text;
    document.getElementById('quote-author').textContent = author;
  }, { text: longest.text, author: longest.author });

  if (LIVE_FONTS) {
    await page.evaluate(() => document.fonts.ready);
  }

  return { context, page };
}

async function measure(page) {
  return page.evaluate(() => {
    const rect = element => {
      const r = element.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    };
    const hero = document.getElementById('main-jumbotron');
    const wrapper = hero.querySelector('.quote-content-wrapper');
    const quote = document.getElementById('quote-text');
    const author = document.getElementById('quote-author');
    const arrow = document.getElementById('scroll-down-arrow');
    const quoteStyle = getComputedStyle(quote);
    const authorStyle = getComputedStyle(author);

    return {
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      hero: rect(hero),
      wrapper: rect(wrapper),
      quote: rect(quote),
      author: rect(author),
      arrow: rect(arrow),
      fontSize: parseFloat(quoteStyle.fontSize),
      lineHeight: parseFloat(quoteStyle.lineHeight),
      rootFont: parseFloat(getComputedStyle(document.documentElement).fontSize),
      quoteFamily: quoteStyle.fontFamily,
      quoteWeight: quoteStyle.fontWeight,
      authorFamily: authorStyle.fontFamily,
      authorWeight: authorStyle.fontWeight,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
}

for (const spec of CASES) {
  await test(`${spec.name}: visual contract`, async () => {
    const { context, page } = await preparePage(spec);
    try {
      if (LIVE_FONTS) {
        const fonts = await page.evaluate(() => ({
          quote: document.fonts.check('400 32px "Cormorant Garamond"'),
          author: document.fonts.check('300 20px "Source Sans Pro"'),
        }));
        assert(fonts.quote, 'Cormorant Garamond 400 did not load');
        assert(fonts.author, 'Source Sans Pro 300 did not load');
      }

      const m = await measure(page);
      measurements.set(spec.name, m);

      const widthRatio = m.wrapper.width / m.viewport.width;
      const measureInEm = m.wrapper.width / m.fontSize;
      const leftSpace = m.wrapper.left;
      const rightSpace = m.viewport.width - m.wrapper.right;

      assert(m.authorWeight === '300', `author weight=${m.authorWeight}, expected 300`);
      assert(m.quoteWeight === '400', `quote weight=${m.quoteWeight}, expected 400`);
      assert(m.quoteFamily.includes('Cormorant Garamond'), `quote family=${m.quoteFamily}`);
      assert(m.authorFamily.includes('Source Sans Pro'), `author family=${m.authorFamily}`);

      assert(widthRatio >= 0.30 && widthRatio <= 0.90,
        `wrapper/viewport ratio=${widthRatio.toFixed(3)} outside 0.30..0.90`);
      assert(measureInEm >= 15 && measureInEm <= 36.2,
        `line measure=${measureInEm.toFixed(2)}em outside 15..36.2em`);
      assert(Math.abs(leftSpace - rightSpace) <= 1.25,
        `wrapper not centered: left=${leftSpace.toFixed(2)}, right=${rightSpace.toFixed(2)}`);

      // Relational composition (VISUAL_CONTRACT.md invariant 3): the wrapper is
      // min(88vw, clamp(43rem, 45vw, 80rem)). Pinning the RELATION rather than today's
      // pixels is what makes a fixed-ceiling regression (the pre-V1 700px composition)
      // fail at 1280/1440/1920 too, and not only at the 2560/4K extremes.
      const expectedWidth = Math.min(
        0.88 * m.viewport.width,
        Math.min(Math.max(43 * m.rootFont, 0.45 * m.viewport.width), 80 * m.rootFont)
      );
      assert(Math.abs(m.wrapper.width - expectedWidth) <= 1.5,
        `wrapper width=${m.wrapper.width.toFixed(1)}px, expected ${expectedWidth.toFixed(1)}px ` +
        `from min(88vw, clamp(43rem,45vw,80rem)) at root ${m.rootFont}px`);

      assert(m.fontSize >= 20 && m.fontSize <= 38,
        `quote font-size=${m.fontSize}px outside 20..38px`);
      assert(m.lineHeight / m.fontSize >= 1.45 && m.lineHeight / m.fontSize <= 1.55,
        `line-height ratio=${(m.lineHeight / m.fontSize).toFixed(3)} outside 1.45..1.55`);

      assert(m.quote.left >= -0.5 && m.quote.right <= m.viewport.width + 0.5,
        `quote overflows horizontally: ${JSON.stringify(m.quote)}`);
      assert(m.author.right <= m.viewport.width + 0.5,
        `author overflows horizontally: ${JSON.stringify(m.author)}`);
      assert(m.hero.height >= m.viewport.height - 1,
        `hero height=${m.hero.height}, viewport=${m.viewport.height}`);
      assert(m.arrow.top >= 0 && m.arrow.bottom <= m.viewport.height + 0.5,
        `scroll arrow is outside the first viewport: ${JSON.stringify(m.arrow)}`);
      assert(m.author.bottom < m.arrow.top - 12,
        `longest eligible passage collides with scroll arrow: author.bottom=${m.author.bottom}, arrow.top=${m.arrow.top}`);
      assert(m.scrollWidth <= m.viewport.width + 1,
        `horizontal document overflow: scrollWidth=${m.scrollWidth}, viewport=${m.viewport.width}`);

      // Legibility (invariant 2), light theme. Weight and geometry cannot see colour:
      // weight 300 at --text-color-light must still clear 4.5:1 against the page beige.
      await settled(page, '#quote-author');
      const lightQuote = await legibility(page, '#quote-text');
      const lightAuthor = await legibility(page, '#quote-author');
      assert(lightQuote.ratio >= 4.5,
        `light-theme passage contrast=${lightQuote.ratio.toFixed(2)}:1 < 4.5:1 (${lightQuote.color} on ${lightQuote.backdrop})`);
      assert(lightAuthor.ratio >= 4.5,
        `light-theme attribution contrast=${lightAuthor.ratio.toFixed(2)}:1 < 4.5:1 (${lightAuthor.color} on ${lightAuthor.backdrop})`);

      if (EVIDENCE_DIR) {
        await mkdir(EVIDENCE_DIR, { recursive: true });
        const mode = LIVE_FONTS ? 'live-fonts' : 'structural';
        await page.screenshot({
          path: join(EVIDENCE_DIR, `${mode}-${spec.name}.png`),
          fullPage: false,
        });
      }

      // The palette resolves per theme, so a ratio that is correct in light can be 1:1 in
      // dark. Toggling the class changes colour only, never geometry.
      await page.evaluate(() => document.body.classList.add('dark-mode'));
      await settled(page, '#quote-author');
      const darkQuote = await legibility(page, '#quote-text');
      const darkAuthor = await legibility(page, '#quote-author');
      assert(darkQuote.theme === 'dark' && darkAuthor.theme === 'dark', 'dark theme did not apply');
      assert(darkQuote.ratio >= 4.5,
        `dark-theme passage contrast=${darkQuote.ratio.toFixed(2)}:1 < 4.5:1 (${darkQuote.color} on ${darkQuote.backdrop})`);
      assert(darkAuthor.ratio >= 4.5,
        `dark-theme attribution contrast=${darkAuthor.ratio.toFixed(2)}:1 < 4.5:1 (${darkAuthor.color} on ${darkAuthor.backdrop})`);

      if (EVIDENCE_DIR) {
        await page.screenshot({
          path: join(EVIDENCE_DIR, `dark-${spec.name}.png`),
          fullPage: false,
        });
      }

      console.log(
        `      width=${m.wrapper.width.toFixed(1)}px (${(widthRatio * 100).toFixed(1)}vw), ` +
        `measure=${measureInEm.toFixed(1)}em, quote=${m.fontSize.toFixed(1)}px, dpr=${m.viewport.dpr}; ` +
        `contrast light ${lightQuote.ratio.toFixed(2)}/${lightAuthor.ratio.toFixed(2)}:1, ` +
        `dark ${darkQuote.ratio.toFixed(2)}/${darkAuthor.ratio.toFixed(2)}:1 (passage/attribution)`
      );
    } finally {
      await context.close();
    }
  });
}

await test('CSS geometry is invariant between 1x and 2x at 1440x900', async () => {
  const one = measurements.get('laptop-1440x900-1x');
  const two = measurements.get('laptop-1440x900-2x');
  assert(one && two, 'missing 1440x900 measurement pair');
  assert(close(one.wrapper.width, two.wrapper.width), `wrapper widths differ: ${one.wrapper.width} vs ${two.wrapper.width}`);
  assert(close(one.wrapper.left, two.wrapper.left), `wrapper left differs: ${one.wrapper.left} vs ${two.wrapper.left}`);
  assert(close(one.fontSize, two.fontSize, 0.05), `font sizes differ: ${one.fontSize} vs ${two.fontSize}`);
  assert(close(one.lineHeight, two.lineHeight, 0.05), `line heights differ: ${one.lineHeight} vs ${two.lineHeight}`);
});

await test('CSS geometry is invariant between 1x and 2x at 1920x1080', async () => {
  const one = measurements.get('desktop-1920x1080-1x');
  const two = measurements.get('desktop-1920x1080-2x');
  assert(one && two, 'missing 1920x1080 measurement pair');
  assert(close(one.wrapper.width, two.wrapper.width), `wrapper widths differ: ${one.wrapper.width} vs ${two.wrapper.width}`);
  assert(close(one.wrapper.left, two.wrapper.left), `wrapper left differs: ${one.wrapper.left} vs ${two.wrapper.left}`);
  assert(close(one.fontSize, two.fontSize, 0.05), `font sizes differ: ${one.fontSize} vs ${two.fontSize}`);
  assert(close(one.lineHeight, two.lineHeight, 0.05), `line heights differ: ${one.lineHeight} vs ${two.lineHeight}`);
});

await test('fluid quote scale grows monotonically and caps', async () => {
  const phone = measurements.get('phone-390x844-3x');
  const laptop = measurements.get('laptop-1280x800-1x');
  const desktop = measurements.get('desktop-1920x1080-1x');
  const large = measurements.get('4k-3840x2160-1x');
  assert(phone && laptop && desktop && large, 'missing scale measurements');
  assert(phone.fontSize <= laptop.fontSize, `${phone.fontSize} !<= ${laptop.fontSize}`);
  assert(laptop.fontSize <= desktop.fontSize, `${laptop.fontSize} !<= ${desktop.fontSize}`);
  assert(desktop.fontSize <= large.fontSize, `${desktop.fontSize} !<= ${large.fontSize}`);
  // Derive the cap from the token rather than hardcoding today's pixel value: the bound is
  // 2.35rem, so an unrelated root font-size change must not read as a scale regression.
  const cap = 2.35 * large.rootFont;
  assert(large.fontSize <= cap + 0.02,
    `4k font-size=${large.fontSize}px did not respect the 2.35rem cap (${cap.toFixed(2)}px at root ${large.rootFont}px)`);
});

await browser.close();
await new Promise(resolve => server.close(resolve));

console.log('');
console.log(`== VISUAL CONTRACT RESULT: ${passed} passed, ${failed} failed (${LIVE_FONTS ? 'live fonts' : 'structural'}) ==`);
if (failed) {
  for (const { name, error } of failures) console.log(`  - ${name}: ${error.message}`);
  process.exit(1);
}
