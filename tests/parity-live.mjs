// tests/parity-live.mjs
// LIVE-mode behavioral check for the DEPLOYED bahai-homepage site (queue unit C9, now closed).
//
// WHY THIS EXISTS. `tests/parity.mjs` is hermetic by design: it blocks every external host
// (wondrous-badi.today, fonts.googleapis.com, fonts.gstatic.com) so day-of-year selection and
// cache keys are reproducible. That is correct for the suite, and it means the DEPLOYED path —
// real HTTPS, real CDN, real vendor library, real browser security rules — had NO automated
// coverage at all. A hand-written live check first surfaced the Badíʿ date element falling back
// to "unavailable" while the vendor library requests an insecure http://ipinfo.io endpoint that
// the browser blocks as mixed content. That finding was filed as C9, escalated, corrected, and
// closed with a fix: a declined-location visitor now downgrades to the default sunset. The
// mixed-content block is still observable here, by design — see the REPORT lines below.
//
// NON-BLOCKING BY DESIGN. `make parity-live` is deliberately a SEPARATE target from `make
// parity`. It talks to the public internet, so it is expected to be flaky during an outage or a
// Pages rebuild. It must never make `make parity` — the hermetic behavioral proof of record —
// intermittently red.
//
// WHAT IT ASSERTS (exit non-zero on failure):
//   1. the deployed homepage reaches a settled state (#quote-text leaves its loading placeholder);
//   2. the rendered verse equals the selection oracle computed from the LOCAL corpus for the
//      real current date (the same oracle logic tests/parity.mjs uses);
//   3. the shared core loaded (window.QuoteCore exists and exposes its expected exports);
//   4. no page error (an uncaught exception in the page).
//
// WHAT IT ONLY REPORTS (never fatal). The Badici outcome is environment-dependent — it depends on
// whether the browser was granted geolocation — so asserting one outcome here would make this
// target red for a reason that has nothing to do with the deployed code. It reports instead:
//   * the Badíʿ element's settled state: RESOLVED vs FALLBACK, with the reason observed, the
//     #location-message text, and — when it DOES resolve — the element's exact innerHTML and
//     childNode shape, so a regression in the two-line label is visible;
//   * every console error/warning and every failed request with its URL, so a mixed-content,
//     vendor or CDN failure is visible in the output rather than silent.
//
// Usage:
//   node tests/parity-live.mjs                            # a visitor with NO geolocation permission
//   node tests/parity-live.mjs --geolocation              # grant geolocation at a fixed coordinate
//   node tests/parity-live.mjs --geolocation --no-coords  # grant the permission but supply no coordinates
//   LIVE_GEO="51.5074,-0.1278" node tests/parity-live.mjs --geolocation
//   LIVE_ORIGIN="https://example.test/" node tests/parity-live.mjs
//
// The three geolocation modes exist to make C9's cause adjudicable: "granted" isolates a
// visitor who both permits location and has a position, while "--no-coords" separates the
// permission from the coordinates.
//
// Dev-only. No package manifest and no new dependency: it uses the same globally installed
// playwright + bundled Chromium as tests/parity.mjs.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const ORIGIN = process.env.LIVE_ORIGIN || 'https://mschwar.github.io/bahai-homepage/';
const GRANT_GEO = process.argv.includes('--geolocation');
const WITH_COORDS = GRANT_GEO && !process.argv.includes('--no-coords');
const GEO_LABEL = !GRANT_GEO ? 'NOT granted (plain visitor)'
  : WITH_COORDS ? 'GRANTED with coordinates'
    : 'GRANTED, coordinates NOT supplied';
const GEO = (process.env.LIVE_GEO || '51.5074,-0.1278')
  .split(',').map(Number);
const QUOTE_PLACEHOLDER = 'Loading Sacred Verse…';
const BADI_PLACEHOLDER = 'Loading Badíʿ Date…';

// ---- The same local oracle the hermetic suite uses (reimplemented independently of the page) ----
const countWords = t => (t || '').trim().split(/\s+/).filter(Boolean).length;
const dayOfYear = d => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 8.64e7);
const shortQuotes = corpus => corpus.filter(q => countWords(q.text) <= 75);
const expectFor = (corpus, date) => {
  const s = shortQuotes(corpus);
  return s[dayOfYear(date) % s.length];
};

// ---- Tiny runner: FATAL (sets the exit code) vs REPORT (never does) ----
let passed = 0, failed = 0;
const failures = [];
const reports = [];
async function check(name, fn) {
  try { await fn(); passed++; console.log(`PASS    ${name}`); }
  catch (e) { failed++; failures.push({ name, e }); console.log(`FAIL    ${name}\n        ${e.message}`); }
}
function report(name, detail) {
  reports.push({ name, detail });
  console.log(`REPORT  ${name}`);
  for (const line of String(detail).split('\n')) console.log(`        ${line}`);
}

const NOW = new Date();
const corpus = JSON.parse(await readFile(join(ROOT, 'data/quotes_hidden_words.json'), 'utf8'));
const shortLen = shortQuotes(corpus).length;
const oracle = expectFor(corpus, NOW);

console.log('== LIVE PARITY — deployed origin ==');
console.log(`origin:      ${ORIGIN}`);
console.log(`date:        ${NOW.toString()} (dayOfYear ${dayOfYear(NOW)}, short-subset len ${shortLen}, idx ${dayOfYear(NOW) % shortLen})`);
console.log(`geolocation: ${GEO_LABEL}${WITH_COORDS ? ` (${GEO[0]},${GEO[1]})` : ''}`);
console.log('');

const browser = await chromium.launch();
const ctx = await browser.newContext();
if (GRANT_GEO) {
  await ctx.grantPermissions(['geolocation'], { origin: new URL(ORIGIN).origin });
  if (WITH_COORDS) await ctx.setGeolocation({ latitude: GEO[0], longitude: GEO[1] });
}
const page = await ctx.newPage();

// ---- Observability: record everything the live page says, without asserting any of it ----
const consoleMsgs = [];
const failedReqs = [];
const pageErrors = [];
page.on('console', m => {
  const type = m.type();
  if (type === 'error' || type === 'warning') {
    consoleMsgs.push({ type, text: m.text(), url: (m.location() || {}).url || '' });
  }
});
page.on('requestfailed', r => {
  failedReqs.push({ url: r.url(), error: (r.failure() || {}).errorText || 'failed' });
});
page.on('response', r => {
  if (r.status() >= 400) failedReqs.push({ url: r.url(), error: `HTTP ${r.status()}` });
});
page.on('pageerror', e => pageErrors.push(e && e.message ? e.message : String(e)));

// ---- 0. Reach the deployed origin ----
let reachable = false;
try {
  await page.goto(ORIGIN, { waitUntil: 'load', timeout: 45000 });
  reachable = true;
} catch (e) {
  console.log(`FAIL    the deployed origin responded\n        ${e.message.split('\n')[0]}`);
  failed++;
  failures.push({ name: 'the deployed origin responded', e });
}

if (reachable) {
  // ---- 1. The homepage reaches a settled state ----
  let settled = false;
  await check('the homepage reaches a settled state (#quote-text leaves its loading placeholder)', async () => {
    await page.waitForFunction(
      ph => {
        const t = document.getElementById('quote-text');
        return !!t && !!t.textContent && t.textContent.trim() !== ph;
      },
      QUOTE_PLACEHOLDER,
      { timeout: 20000 }
    );
    settled = true;
    console.log(`        #quote-text settled: ${JSON.stringify((await page.textContent('#quote-text')).slice(0, 60))}…`);
  });

  // ---- 2. The rendered verse matches the local oracle for the real current date ----
  await check('the rendered verse matches the local oracle for the real current date', async () => {
    if (!settled) throw new Error('page never settled — cannot compare');
    const got = (await page.textContent('#quote-text')).trim();
    if (got !== oracle.text.trim()) {
      throw new Error(`oracle mismatch for ${NOW.toISOString().slice(0, 10)} ` +
        `(idx ${dayOfYear(NOW) % shortLen}): expected ${JSON.stringify(oracle.text.slice(0, 60))}…, ` +
        `got ${JSON.stringify(got.slice(0, 60))}…`);
    }
    console.log(`        verse == oracle (idx ${dayOfYear(NOW) % shortLen}): ${JSON.stringify(got.slice(0, 60))}…`);
  });

  // ---- 3. The shared core loaded and exposes its expected exports ----
  const EXPECTED_EXPORTS = [
    'MAX_QUOTE_WORDS', 'QUOTES_PATH', 'DEFAULT_AUTHOR', 'countWords', 'filterShort',
    'dayOfYear', 'selectForDate', 'getLocalDateKey', 'formatDateLabel', 'fetchQuotes',
    'createQuoteCache',
  ];
  await check('the shared core loaded (window.QuoteCore exposes its expected exports)', async () => {
    const probe = await page.evaluate(() => {
      const c = window.QuoteCore;
      if (!c) return { present: false, missing: null, maxWords: null, path: null };
      const expected = ['MAX_QUOTE_WORDS', 'QUOTES_PATH', 'DEFAULT_AUTHOR', 'countWords', 'filterShort',
        'dayOfYear', 'selectForDate', 'getLocalDateKey', 'formatDateLabel', 'fetchQuotes', 'createQuoteCache'];
      return {
        present: true,
        missing: expected.filter(k => !(k in c)),
        maxWords: c.MAX_QUOTE_WORDS,
        path: c.QUOTES_PATH,
      };
    });
    if (!probe.present) throw new Error('window.QuoteCore is not defined on the deployed page');
    if (probe.missing.length) throw new Error(`QuoteCore is missing exports: ${probe.missing.join(', ')}`);
    console.log(`        QuoteCore present with all ${EXPECTED_EXPORTS.length} exports ` +
      `(MAX_QUOTE_WORDS=${probe.maxWords}, QUOTES_PATH=${probe.path})`);
  });

  // ---- 4. Badíʿ element: REPORT only — RESOLVED vs FALLBACK and why ----
  let badiSettled = false;
  try {
    await page.waitForFunction(
      ph => {
        const el = document.getElementById('badiDate');
        return !!el && el.textContent.trim() !== ph;
      },
      BADI_PLACEHOLDER,
      { timeout: 15000 }
    );
    badiSettled = true;
  } catch (e) { /* leave it unsettled; reported below */ }

  const badi = await page.evaluate(() => {
    const el = document.getElementById('badiDate');
    const loc = document.getElementById('location-message');
    return {
      text: el ? el.textContent : null,
      innerHTML: el ? el.innerHTML : null,
      childNodeTypes: el ? Array.from(el.childNodes).map(n => n.nodeName) : [],
      locationMessage: loc ? loc.textContent : null,
      gregorian: (document.getElementById('gregorianDatePanel') || {}).textContent || '',
    };
  });

  const badiText = badi.text || '';
  const isFallback = badiText.includes('Badíʿ date unavailable.');
  const isPlaceholder = badiSettled && badiText.trim() === BADI_PLACEHOLDER;
  if (!badiSettled || isPlaceholder) {
    report('Badíʿ element state: UNSETTLED',
      `still showing its placeholder after 15s — innerHTML=${JSON.stringify(badi.innerHTML)}`);
  } else if (isFallback) {
    const mixed = [...consoleMsgs.map(c => c.text), ...failedReqs.map(r => `${r.url} (${r.error})`)]
      .filter(s => /ipinfo|mixed content/i.test(s));
    const reason = mixed.length
      ? `the page observed mixed-content/ipinfo evidence: ${JSON.stringify(mixed[0])}`
      : 'no mixed-content/ipinfo evidence observed in this run (timeout or library failure only)';
    report('Badíʿ element state: FALLBACK',
      `#badiDate == ${JSON.stringify(badi.text)}\n` +
      `reason observed: ${reason}\n` +
      `#location-message == ${JSON.stringify(badi.locationMessage)}\n` +
      `#gregorianDatePanel == ${JSON.stringify(badi.gregorian)}\n` +
      'NOTE: this target deliberately does not assert the outcome (it is environment-dependent); C9 is closed.');
  } else {
    const shapeOk = badi.childNodeTypes.join(',') === '#text,BR,#text';
    report('Badíʿ element state: RESOLVED',
      `#badiDate == ${JSON.stringify(badi.text)}\n` +
      `innerHTML == ${JSON.stringify(badi.innerHTML)}\n` +
      `childNodes == [${badi.childNodeTypes.join(', ')}] ${shapeOk ? '(expected two-line shape)' : '(SHAPE ANOMALY: expected #text,BR,#text)'}\n` +
      `#gregorianDatePanel == ${JSON.stringify(badi.gregorian)}`);
  }

  // ---- Report the console errors and failed requests, with URLs ----
  if (consoleMsgs.length) {
    report(`console errors/warnings observed (${consoleMsgs.length})`,
      consoleMsgs.slice(0, 12).map(m => `[${m.type}] ${m.text}${m.url ? ` — ${m.url}` : ''}`).join('\n'));
  } else {
    report('console errors/warnings observed (0)', 'none');
  }
  if (failedReqs.length) {
    const seen = new Set();
    const uniq = failedReqs.filter(r => !seen.has(r.url + r.error) && seen.add(r.url + r.error));
    report(`failed requests observed (${uniq.length} unique)`,
      uniq.slice(0, 12).map(r => `${r.url} — ${r.error}`).join('\n'));
  } else {
    report('failed requests observed (0)', 'none');
  }

  // ---- 5. Fatal: no uncaught page error ----
  await check('no uncaught page error', async () => {
    if (pageErrors.length) throw new Error(`${pageErrors.length} page error(s): ${JSON.stringify(pageErrors.slice(0, 3))}`);
    console.log('        page errors: 0');
  });
}

await ctx.close();
await browser.close();

console.log('');
console.log(`== RESULT: ${passed} passed, ${failed} failed, ${reports.length} reported ==`);
console.log('   (REPORT lines are observations, not assertions: the Badíʿ outcome depends on the');
console.log('    geolocation permission, and C9 is closed — a declined visitor now gets the default sunset.)');
if (failed > 0) {
  for (const f of failures) console.log(`  - ${f.name}: ${f.e.message}`);
  process.exit(1);
}
