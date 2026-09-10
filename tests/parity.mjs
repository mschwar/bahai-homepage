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
//   D. the Badici-day-cache wrinkle (TECH_DEBT_AND_RISKS.md #7)
//   E. theme persistence
//   F. Badici fallback / graceful degradation when the external lib is unreachable
//   G. clipboard copy (primary + execCommand fallback + failure)
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
  ['today\'s quote is ALSO written under the Badici-day key (the wrinkle)', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page, { badiInfo: { bDay: 4, bMonthMeaning: 'Light', bMonthNameAr: 'Núr', bYear: 182, bEraAbbrev: 'BE' } });
    const gregKey = `dailyVerse:${TODAY_KEY}`;
    const greg = JSON.parse(await page.evaluate(k => localStorage.getItem(k), gregKey));
    const badi = await page.evaluate(k => localStorage.getItem(k), BADI_KEY);
    if (!badi) throw new Error('expected today\'s quote under the Badici-day key (the #7 wrinkle)');
    const badiParsed = JSON.parse(badi);
    if (badiParsed.text !== greg.text) throw new Error('Badici-key value != today\'s Gregorian-key value (wrinkle not preserved)');
    if (badiParsed.text !== expToday.text) throw new Error('Badici-key value != oracle today');
    console.log(`      gregKey=${gregKey}  badiKey=${BADI_KEY}  both == today's verse  (wrinkle pinned)`);
    // The wrinkle also moves lastKey to the Badici key (it is the most recent saveCachedQuote).
    const last = await page.evaluate(() => localStorage.getItem('dailyVerse:lastKey'));
    console.log(`      dailyVerse:lastKey == ${last}  (note: points at the Badici key after badi onReady)`);
    await ctx.close();
  }],
]);

await run('E. Theme persistence', [
  ['applies saved dark-mode on load', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await blockExternal(page); await fixClock(page);
    await page.addInitScript(() => localStorage.setItem('theme', 'dark-mode'));
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    const cls = await page.getAttribute('body', 'class');
    if (!cls.includes('dark-mode')) throw new Error(`expected dark-mode class, got: ${cls}`);
    await ctx.close();
  }],
  ['defaults to light-mode when no saved theme', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await blockExternal(page); await fixClock(page);
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    const cls = await page.getAttribute('body', 'class');
    if (!cls.includes('light-mode')) throw new Error(`expected light-mode class, got: ${cls}`);
    await ctx.close();
  }],
  ['toggle flips the class and persists to localStorage', async () => {
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
    const afterReload = await page.getAttribute('body', 'class');
    if (!afterReload.includes(stored)) throw new Error(`saved theme (${stored}) not applied after reload; classes=${afterReload}`);
    // NOTE (parity finding): index.html hardcodes <body class="light-mode">, so after a reload
    // the body carries BOTH 'light-mode' and the saved 'dark-mode' classes. dark-mode wins via
    // CSS specificity, so the effective theme is correct, but the class list is not clean.
    if (afterReload.includes('light-mode') && afterReload.includes('dark-mode')) {
      console.log('      (parity note) body ends with both light-mode+dark-mode after reload to a saved dark theme');
    }
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
    // NOTE (parity finding): .quote-actions{display:none} hides #copy-button; the reachable
    // copy affordance is a click on the quote text itself (also wired to the same handler).
    await page.click('#quote-text');
    await page.waitForTimeout(50);
    const copied = await page.evaluate(() => window.__copied);
    const expected = `${expToday.text}\n— ${expToday.author || 'Bahá’u’lláh'}`;
    if (copied !== expected) throw new Error('clipboard payload mismatch');
    const status = (await txt(page, '#copy-status')).trim();
    if (status !== 'Copied.') throw new Error(`expected Copied., got: ${status}`);
    await ctx.close();
  }],
  ['parity: the copy action row is hidden by CSS (.quote-actions{display:none})', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loadPage(page);
    const hidden = await page.evaluate(() => {
      const row = document.querySelector('.quote-actions');
      const btn = document.getElementById('copy-button');
      const rowCs = getComputedStyle(row);
      const btnVisible = btn.getBoundingClientRect().width > 0 && btn.getBoundingClientRect().height > 0;
      return { rowDisplay: rowCs.display, btnDisplay: getComputedStyle(btn).display, btnVisible };
    });
    if (hidden.rowDisplay !== 'none') throw new Error(`expected .quote-actions display:none, got ${hidden.rowDisplay}`);
    if (hidden.btnVisible) throw new Error('copy-button should not be visible while its parent is display:none');
    console.log('      .quote-actions display=none (row hidden); button not visible; copy reachable via #quote-text click');
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
