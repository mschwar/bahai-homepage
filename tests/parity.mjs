// tests/parity.mjs
// Behavioral parity suite for the live bahai-homepage site (queue unit H2A, first half).
//
// This is DEV tooling only. It is NOT part of the served site and adds no runtime
// dependency. It drives the real page (index.html + js/script.js + js/badi-init.js)
// in headless Chromium via Playwright, self-hosting a static HTTP server so the
// page's fetch() of data/quotes_hidden_words.json works under a real origin.
//
// Purpose: pin the CURRENT (pre-refactor) behavior so a later refactor can prove it
// did not change anything. Coverage (docs/queue.md H2A contract):
//   A. deterministic day-of-year selection over the <=75-word subset
//   B. today / yesterday relationship
//   C. cache-by-date (Gregorian key) incl. boot-from-cache + lastKey
//   D. cache hygiene: today's verse is stored under the Gregorian key only; the Badíʿ-day
//      key is NOT written (TECH_DEBT_AND_RISKS.md #7, fixed) so a cache hit can't mismatch
//   E. theme persistence: body carries exactly one of light-mode/dark-mode (queue C7)
//   F. Badici fallback / graceful degradation when the external lib is unreachable
//   G. clipboard copy (primary + execCommand fallback + failure); copy row is visible (C6)
//   H. reduced-motion scroll behavior
//
// Run:   node tests/parity.mjs   (uses the globally-installed playwright + bundled
//                                Chromium; no package manifest is added to the repo)
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

// ---- Minimal static server (real origin so fetch works) ----
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
const PORT = 0; // ephemeral
await new Promise(r => server.listen(PORT, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

// ---- Tiny test runner ----
let passed = 0, failed = 0;
const failures = [];
async function test(name, fn) {
  try { await fn(); passed++; console.log(`PASS  ${name}`); }
  catch (e) { failed++; failures.push({ name, e }); console.log(`FAIL  ${name}\n      ${e.message}`); }
}
async function run(section, fns) {
  console.log(`\n## ${section}`);
  for (const [name, fn] of fns) await test(name, fn);
}

// ---- Shared fixtures / helpers ----
// Deterministic "today" for the whole suite (local time; page and node share the TZ).
const TODAY = new Date(2026, 5, 15, 12, 0, 0); // 2026-06-15 12:00 local
const YESTERDAY = new Date(TODAY); YESTERDAY.setDate(TODAY.getDate() - 1);

function loadCorpus() {
  return readFile(join(ROOT, 'data/quotes_hidden_words.json'), 'utf8').then(JSON.parse);
}
const countWords = t => (t || '').trim().split(/\s+/).filter(Boolean).length;
const dayOfYear = d => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 8.64e7);
const shortQuotes = corpus => corpus.filter(q => countWords(q.text) <= 75);
// Expected selection for a given date, reimplemented independently (the parity oracle).
const expectFor = (corpus, date) => {
  const s = shortQuotes(corpus);
  return s[dayOfYear(date) % s.length];
};

// Block the external Badici lib + fonts so the suite is fully deterministic/offline.
async function blockExternal(page) {
  await page.route('https://wondrous-badi.today/**', r => r.abort());
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
}

// Install a fake BadiDateToday that resolves synchronously with a known Badici date.
async function stubBadi(page, info) {
  await page.addInitScript(({ info: di }) => {
    window.__badiInfo = di;
    window.BadiDateToday = (opts) => {
      if (opts && typeof opts.onReady === 'function') opts.onReady(window.__badiInfo);
    };
  }, { info });
}

// Capture scrollIntoView behavior for the reduced-motion test.
async function captureScrollBehavior(page) {
  await page.addInitScript(() => {
    const orig = Element.prototype.scrollIntoView;
    window.__scrollBehaviors = [];
    Element.prototype.scrollIntoView = function (o) {
      window.__scrollBehaviors.push(o && o.behavior ? o.behavior : 'undefined');
      orig.call(this, o);
    };
  });
}

// Fix "now" to TODAY via the Playwright clock (Date + Date.now + setTimeout/requestAnimationFrame).
async function fixClock(page) {
  await page.clock.install({ time: TODAY });
}

// Common page load: block externals, fix the clock, navigate, wait for fetch to settle.
async function loadPage(page, { badiInfo = null, captureScroll = false, reducedMotion = false } = {}) {
  await blockExternal(page);
  if (badiInfo) await stubBadi(page, badiInfo);
  if (captureScroll) await captureScrollBehavior(page);
  if (reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixClock(page);
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  // wait for the quote fetch to land (quote-text stops being the loading placeholder)
  await page.waitForFunction(() => {
    const t = document.getElementById('quote-text');
    return t && t.textContent && t.textContent !== 'Loading Sacred Verse…';
  }, { timeout: 10000 });
  return page;
}
const txt = (page, sel) => page.textContent(sel);
const attr = (page, sel, name) => page.getAttribute(sel, name);

const corpus = await loadCorpus();
const shortLen = shortQuotes(corpus).length;
const expToday = expectFor(corpus, TODAY);
const expYest = expectFor(corpus, YESTERDAY);
const TODAY_KEY = '2026-06-15';
// saveCachedQuote prepends CACHE_PREFIX ('dailyVerse:') to the key, so the Badici-day
// wrinkle stores today's quote under dailyVerse:badi:<year>-<month>-<day>.
const BADI_KEY = 'dailyVerse:badi:182-Núr-4';

const browser = await chromium.launch();

// ===============================  SUITE  ===============================
await run('A. Deterministic day-of-year selection over the <=75-word subset', [
  ['selects the expected verse for "today"', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page);
    const got = (await txt(page, '#quote-text')).trim();
    if (got !== expToday.text) throw new Error(`expected today text (index ${dayOfYear(TODAY) % shortLen}) but got a different text`);
    if (expToday.text.length < 10) throw new Error('oracle produced an implausibly short quote');
    console.log(`      dayOfYear=${dayOfYear(TODAY)} shortSubsetLen=${shortLen} idx=${dayOfYear(TODAY) % shortLen}`);
    await ctx.close();
  }],
  ['selection is stable across reloads (same fixed day)', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page);
    const a = (await txt(page, '#quote-text')).trim();
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.getElementById('quote-text').textContent !== 'Loading Sacred Verse…');
    const b = (await txt(page, '#quote-text')).trim();
    if (a !== b) throw new Error('reload changed today\'s verse');
    if (a !== expToday.text) throw new Error('reload did not match oracle');
    await ctx.close();
  }],
  ['today is distinct from yesterday when dayOfYear differs', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page);
    const gotToday = (await txt(page, '#quote-text')).trim();
    const gotYest = (await txt(page, '#quote-text-yesterday')).trim();
    if (gotToday !== expToday.text) throw new Error('today mismatch');
    if (gotYest !== expYest.text) throw new Error('yesterday mismatch: expected a different verse');
    console.log(`      yesterday idx=${dayOfYear(YESTERDAY) % shortLen}`);
    await ctx.close();
  }],
]);

await run('B. Today / yesterday relationship', [
  ['yesterday button reveals the yesterday section with yesterday\'s verse', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page);
    if ((await attr(page, '#yesterday-jumbotron-display', 'hidden')) === null) throw new Error('yesterday section should start hidden');
    await page.click('#yesterday-button');
    if (await attr(page, '#yesterday-jumbotron-display', 'hidden')) throw new Error('yesterday section did not unhide');
    if ((await attr(page, '#yesterday-button', 'aria-expanded')) !== 'true') throw new Error('aria-expanded not true');
    const yt = (await txt(page, '#quote-text-yesterday')).trim();
    if (yt !== expYest.text) throw new Error('yesterday text mismatch');
    await ctx.close();
  }],
]);

await run('C. Cache-by-date (Gregorian key)', [
  ['boots from cache when the quote fetch fails (offline cache-boot)', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const sentinel = { text: 'CACHED QUOTE SENTINEL FOR PARITY', author: 'Test', source: 'Test Source' };
    await blockExternal(page); await fixClock(page);
    await page.addInitScript(({ key, quote }) => localStorage.setItem(key, JSON.stringify(quote)), {
      key: `dailyVerse:${TODAY_KEY}`, quote: sentinel,
    });
    // Simulate offline: the corpus fetch must fail.
    await page.route('**/data/quotes_hidden_words.json', r => r.abort());
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.getElementById('quote-text').textContent !== 'Loading Sacred Verse…');
    const got = (await txt(page, '#quote-text')).trim();
    if (got !== sentinel.text) throw new Error(`expected cached sentinel on offline boot, got: ${got}`);
    // error status should be shown (fetch failed) but cached verse stays rendered
    const status = (await txt(page, '#status-message')).trim();
    if (!status.includes('Unable to load verses')) throw new Error(`expected load-error status, got: ${status}`);
    await ctx.close();
  }],
  ['after a fresh load, today\'s verse is cached under dailyVerse:<todayKey> and lastKey is set', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page);
    const cached = await page.evaluate((key) => localStorage.getItem(key), `dailyVerse:${TODAY_KEY}`);
    if (!cached) throw new Error('today not cached under Gregorian key');
    const parsed = JSON.parse(cached);
    if (parsed.text !== expToday.text) throw new Error('cached today mismatch');
    if (parsed.text !== (await txt(page, '#quote-text')).trim()) throw new Error('cached != rendered');
    const last = await page.evaluate(() => localStorage.getItem('dailyVerse:lastKey'));
    if (last !== TODAY_KEY) throw new Error(`lastKey expected ${TODAY_KEY}, got ${last}`);
    await ctx.close();
  }],
]);

await run('D. Badici-day-cache wrinkle (TECH_DEBT_AND_RISKS.md #7)', [
  ['today quote is NOT written under the Badici-day key (wrinkle fixed; Gregorian key is authoritative for reads)', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page, { badiInfo: { bDay: 4, bMonthMeaning: 'Light', bMonthNameAr: 'Núr', bYear: 182, bEraAbbrev: 'BE' } });
    const gregKey = `dailyVerse:${TODAY_KEY}`;
    const greg = JSON.parse(await page.evaluate(k => localStorage.getItem(k), gregKey));
    const badi = await page.evaluate(k => localStorage.getItem(k), BADI_KEY);
    const last = await page.evaluate(() => localStorage.getItem('dailyVerse:lastKey'));
    // The wrinkle (TECH_DEBT_AND_RISKS.md #7) wrote today's verse ALSO under the Badíʿ-day key,
    // and lastKey ended up pointing there. Nothing ever reads that key, and a later Badíʿ cache
    // hit could render a mismatched verse. The fix (option (a)) stops writing it entirely; the
    // Gregorian key is the only authoritative read source. Re-pinned here to the corrected behavior.
    if (badi !== null) throw new Error("expected NO quote under the Badici-day key after the fix");
    if (last !== TODAY_KEY) throw new Error(`expected lastKey to point at the Gregorian key, got '${last}'`);
    if (greg.text !== expToday.text) throw new Error('Gregorian-key value mismatch with oracle today');
    if (greg.text !== (await txt(page, '#quote-text')).trim()) throw new Error('Gregorian cache != rendered');
    console.log(`      gregKey=${gregKey}  lastKey==${TODAY_KEY}  badiKey=absent  (wrinkle fixed & pinned)`);
    await ctx.close();
  }],
]);

await run('E. Theme persistence', [
  // After queue C7 the body must carry EXACTLY ONE of light-mode/dark-mode, on first load
  // and after a reload to a saved theme (previously it could carry both, with correctness
  // resting on CSS specificity). The hardcoded <body class="light-mode"> default is replaced
  // on init (js/script.js: classList.remove both, then add the saved/default one).
  ['applies saved dark-mode on load, body carries exactly one theme class', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await blockExternal(page); await fixClock(page);
    await page.addInitScript(() => localStorage.setItem('theme', 'dark-mode'));
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    const cls = await page.getAttribute('body', 'class');
    if (!cls.includes('dark-mode')) throw new Error(`expected dark-mode class, got: ${cls}`);
    if (cls.includes('light-mode')) throw new Error('dark and light both present on load');
    if (cls.trim().split(/\s+/).filter(Boolean).length !== 1) throw new Error(`expected exactly one theme class, got: ${cls}`);
    await ctx.close();
  }],
  ['defaults to light-mode when no saved theme, exactly one theme class', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await blockExternal(page); await fixClock(page);
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    const cls = await page.getAttribute('body', 'class');
    if (!cls.includes('light-mode')) throw new Error(`expected light-mode class, got: ${cls}`);
    if (cls.includes('dark-mode')) throw new Error('dark present when no theme saved');
    if (cls.trim().split(/\s+/).filter(Boolean).length !== 1) throw new Error(`expected exactly one theme class, got: ${cls}`);
    await ctx.close();
  }],
  ['toggle flips the class and persists; reload to a saved theme leaves exactly one theme class', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await blockExternal(page); await fixClock(page);
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    const before = await page.getAttribute('body', 'class');
    await page.click('#theme-toggle-button');
    const after = await page.getAttribute('body', 'class');
    if (before === after) throw new Error('class did not change on toggle');
    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    if (!after.includes(stored)) throw new Error(`localStorage theme (${stored}) not reflected in body class (${after})`);
    // survives reload: the saved theme is still the effective theme after reload
    await page.reload({ waitUntil: 'domcontentloaded' });
    const afterReload = (await page.getAttribute('body', 'class')).trim();
    if (!afterReload.includes(stored)) throw new Error(`saved theme (${stored}) not applied after reload; classes=${afterReload}`);
    const themeTokens = afterReload.split(/\s+/).filter(t => t === 'light-mode' || t === 'dark-mode');
    if (themeTokens.length !== 1) throw new Error(`after reload to a saved theme the body must carry exactly one theme class (C7); got: ${afterReload}`);
    await ctx.close();
  }],
]);

await run('F. Badici fallback / graceful degradation', [
  ['shows unavailable text + guidance when the external lib is unreachable', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page, { badiInfo: null }); // BadiDateToday blocked + not stubbed
    const badi = (await txt(page, '#badiDate')).trim();
    if (!badi.includes('Badíʿ date unavailable.')) throw new Error(`expected unavailable text, got: ${badi}`);
    const loc = (await txt(page, '#location-message')).trim();
    if (!loc.includes('Enable location')) throw new Error(`expected location guidance, got: ${loc}`);
    await ctx.close();
  }],
  ['renders the Badici date when the lib resolves (happy path)', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page, { badiInfo: { bDay: 4, bMonthMeaning: 'Light', bMonthNameAr: 'Núr', bYear: 182, bEraAbbrev: 'BE' } });
    const badi = (await txt(page, '#badiDate')).trim();
    if (!badi.includes('Day 4, Núr (light)')) throw new Error(`expected Day 4 Núr, got: ${badi}`);
    if (!badi.includes('182 BE')) throw new Error(`expected 182 BE, got: ${badi}`);
    await ctx.close();
  }],
  ['declined location: downgrades to the default sunset instead of rendering nothing', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await blockExternal(page);
    await page.addInitScript(() => {
      window.BadiDateLocationChoice = { ignoreLocation: 1, guessUserLocation: 2, askForUserLocation: 3 };
      window.__badiLocationMethods = [];
      window.BadiDateToday = (opts) => {
        window.__badiLocationMethods.push(opts.locationMethod);
        // Model the vendor's declined-location behaviour faithfully: the accurate path
        // never answers (it falls through to an HTTP ipinfo request that HTTPS blocks and
        // that its XHR reports as neither success, timeout nor error), while the
        // ignoreLocation path resolves at once from the default 6:30 sunset.
        if (opts.locationMethod === 3) return;
        if (typeof opts.onReady === 'function') {
          opts.onReady({ bDay: 4, bMonthMeaning: 'Light', bMonthNameAr: 'Núr', bYear: 182, bEraAbbrev: 'BE' });
        }
      };
    });
    await fixClock(page);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.getElementById('quote-text').textContent !== 'Loading Sacred Verse…');
    const pending = await txt(page, '#badiDate');
    if (!pending.includes('Loading')) throw new Error(`expected the accurate attempt to still be pending, got: ${pending}`);
    // Let the accuracy window elapse; the wrapper must then downgrade rather than give up.
    await page.clock.runFor(5000);
    const badi = (await txt(page, '#badiDate')).trim();
    if (!badi.includes('Day 4, Núr (light)')) throw new Error(`expected the downgraded date, got: ${badi}`);
    if (!badi.includes('182 BE')) throw new Error(`expected 182 BE after downgrade, got: ${badi}`);
    const methods = await page.evaluate(() => window.__badiLocationMethods);
    if (methods.length !== 2 || methods[0] !== 3 || methods[1] !== 1) {
      throw new Error(`expected attempts [3,1] (accurate, then default sunset), got ${JSON.stringify(methods)}`);
    }
    console.log(`      attempts=${JSON.stringify(methods)} (accurate -> default sunset); date rendered, not blank`);
    await ctx.close();
  }],
]);

await run('G. Clipboard copy', [
  ['copy via clicking today\'s quote text writes "<text>\\n— <author>" to navigator.clipboard', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page);
    await page.evaluate(() => {
      window.__copied = null;
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (t) => { window.__copied = t; } } });
    });
    // The copy row is visible (queue C6); the quote text is ALSO wired to the same handler.
    await page.click('#quote-text');
    await page.waitForTimeout(50);
    const copied = await page.evaluate(() => window.__copied);
    const expected = `${expToday.text}\n— ${expToday.author || 'Bahá’u’lláh'}`;
    if (copied !== expected) throw new Error('clipboard payload mismatch');
    const status = (await txt(page, '#copy-status')).trim();
    if (status !== 'Copied.') throw new Error(`expected Copied., got: ${status}`);
    await ctx.close();
  }],
  ['parity: the copy action row is VISIBLE and the copy button is a real, perceivable control', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page);
    const vis = await page.evaluate(() => {
      const row = document.querySelector('.quote-actions');
      const btn = document.getElementById('copy-button');
      const rowCs = getComputedStyle(row);
      const r = row.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      return { rowDisplay: rowCs.display, rowVisible: r.width > 0 && r.height > 0, btnVisible: b.width > 0 && b.height > 0, btnDisabled: btn.disabled };
    });
    if (vis.rowDisplay === 'none' || !vis.rowVisible) throw new Error(`copy row must be visible after C6, got display=${vis.rowDisplay} rowVisible=${vis.rowVisible}`);
    if (!vis.btnVisible) throw new Error('copy-button should be visible');
    if (vis.btnDisabled) throw new Error('copy-button should be enabled after quote load');
    // LAYOUT IS NOT PERCEIVABILITY. The row was restored to display:flex while the button's
    // label and border resolved to the same colour as the page background (the .button rule,
    // declared later at equal specificity, overrode .button-inline and applied the dark
    // .panel-buttons palette to the light jumbotron): a 1:1 ratio, i.e. an invisible control
    // that a size-based assertion happily passed. Pin the contrast, in both themes.
    const contrast = async () => page.evaluate(() => {
      const btn = document.getElementById('copy-button');
      const cs = getComputedStyle(btn);
      let el = btn, bg = 'rgba(0, 0, 0, 0)';
      while (el) {
        const c = getComputedStyle(el).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') { bg = c; break; }
        el = el.parentElement;
      }
      const nums = s => (s.match(/[\d.]+/g) || []).map(Number);
      const lum = c => {
        const [r, g, b] = nums(c).slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const a = lum(cs.color), b2 = lum(bg);
      return { color: cs.color, bg, ratio: +(((Math.max(a, b2) + 0.05) / (Math.min(a, b2) + 0.05)).toFixed(2)) };
    });
    const light = await contrast();
    if (light.ratio < 4.5) throw new Error(`copy-button label must be perceivable in light mode; contrast ${light.ratio}:1 (${light.color} on ${light.bg})`);
    // and the same in the dark theme, where the palette swaps
    const darkCtx = await browser.newContext();
    const darkPage = await darkCtx.newPage();
    await blockExternal(darkPage); await fixClock(darkPage);
    await darkPage.addInitScript(() => localStorage.setItem('theme', 'dark-mode'));
    await darkPage.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await darkPage.waitForFunction(() => document.getElementById('quote-text').textContent !== 'Loading Sacred Verse…', { timeout: 15000 }).catch(() => {});
    // The theme swap runs through a CSS transition (body: .3s, .button: .25s), so a colour read
    // taken immediately lands mid-interpolation and yields a meaningless ratio. Wait until the
    // computed colour stops changing before measuring -- polling for stability rather than
    // sleeping, so it does not depend on the faked clock's timer semantics.
    await darkPage.waitForFunction(() => {
      const btn = document.getElementById('copy-button');
      if (!btn) return false;
      const c = getComputedStyle(btn).color;
      if (window.__lastColor === c) return true;
      window.__lastColor = c;
      return false;
    }, { timeout: 5000 }).catch(() => {});
    const dark = await darkPage.evaluate(() => {
      const btn = document.getElementById('copy-button');
      const cs = getComputedStyle(btn);
      let el = btn, bg = 'rgba(0, 0, 0, 0)';
      while (el) {
        const c = getComputedStyle(el).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') { bg = c; break; }
        el = el.parentElement;
      }
      const nums = s => (s.match(/[\d.]+/g) || []).map(Number);
      const lum = c => {
        const [r, g, b] = nums(c).slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const a = lum(cs.color), b2 = lum(bg);
      return { color: cs.color, bg, ratio: +(((Math.max(a, b2) + 0.05) / (Math.min(a, b2) + 0.05)).toFixed(2)) };
    });
    if (dark.ratio < 4.5) throw new Error(`copy-button label must be perceivable in dark mode; contrast ${dark.ratio}:1 (${dark.color} on ${dark.bg})`);
    await darkCtx.close();
    console.log(`      .quote-actions visible (C6); copy button perceivable — light ${light.ratio}:1, dark ${dark.ratio}:1`);
    await ctx.close();
  }],
  ['falls back to execCommand copy when navigator.clipboard rejects', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page);
    await page.evaluate(() => {
      window.__textareaValue = null;
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } });
      document.execCommand = (cmd) => { if (cmd === 'copy') { const ta = document.querySelector('textarea[readonly]'); if (ta) window.__textareaValue = ta.value; return true; } return false; };
    });
    await page.click('#quote-text');
    await page.waitForTimeout(50);
    const ta = await page.evaluate(() => window.__textareaValue);
    const expected = `${expToday.text}\n— ${expToday.author || 'Bahá’u’lláh'}`;
    if (ta !== expected) throw new Error('execCommand fallback payload mismatch');
    const status = (await txt(page, '#copy-status')).trim();
    if (status !== 'Copied.') throw new Error(`expected Copied. via fallback, got: ${status}`);
    await ctx.close();
  }],
  ['reports "Copy failed." when both paths fail', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page);
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } });
      document.execCommand = () => { throw new Error('nope'); };
    });
    await page.click('#quote-text');
    await page.waitForTimeout(50);
    const status = (await txt(page, '#copy-status')).trim();
    if (!status.includes('Copy failed.')) throw new Error(`expected Copy failed., got: ${status}`);
    await ctx.close();
  }],
]);

await run('H. Reduced-motion scroll behavior', [
  ['uses behavior auto (instant) when prefers-reduced-motion: reduce', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page, { captureScroll: true, reducedMotion: true });
    await page.click('#scroll-down-arrow');
    const behaviors = await page.evaluate(() => window.__scrollBehaviors);
    if (!behaviors.includes('auto')) throw new Error(`expected scrollIntoView behavior auto, got: ${JSON.stringify(behaviors)}`);
    await ctx.close();
  }],
  ['uses behavior smooth when reduced-motion is not preferred', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page, { captureScroll: true, reducedMotion: false });
    await page.click('#scroll-down-arrow');
    const behaviors = await page.evaluate(() => window.__scrollBehaviors);
    if (!behaviors.includes('smooth')) throw new Error(`expected scrollIntoView behavior smooth, got: ${JSON.stringify(behaviors)}`);
    await ctx.close();
  }],
]);

await browser.close();
server.close();

console.log(`\n== RESULT: ${passed} passed, ${failed} failed ==`);
if (failed > 0) { for (const f of failures) console.log(`  - ${f.name}: ${f.e.message}`); process.exit(1); }
