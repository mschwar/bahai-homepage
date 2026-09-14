// tests/collections-live-check.mjs (ad-hoc, /Users/mschwar for playwright resolution)
// Live verification that the DEPLOYED origin renders a verse for each NON-default
// collection (garden-homepage-preview, words-of-the-spirit) via the real
// selectedCollection path. Oracle = local collection file's eligible items
// (default_eligibility.max_words filter) indexed by dayOfYear % len — the exact
// selection logic of quote-core.js loadCollection() + selectForDate().
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const ORIGIN = process.env.LIVE_ORIGIN || 'https://mschwar.github.io/bahai-homepage/';
const PLACEHOLDER = 'Loading Sacred Verse…';
const countWords = t => (t || '').trim().split(/\s+/).filter(Boolean).length;
const dayOfYear = d => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 8.64e7);

const NOW = new Date();
let failed = 0;
const failures = [];

async function check(name, fn) {
  try { await fn(); console.log(`PASS    ${name}`); }
  catch (e) { failed++; failures.push(name); console.log(`FAIL    ${name}\n        ${e.message}`); }
}

console.log('== LIVE COLLECTIONS CHECK — deployed origin ==');
console.log(`origin: ${ORIGIN}`);
console.log(`date:   ${NOW.toString()} (dayOfYear ${dayOfYear(NOW)})`);
console.log('');

const COLLECTIONS = [
  { id: 'garden-homepage-preview', file: 'garden-homepage-preview.json' },
  { id: 'words-of-the-spirit', file: 'words-of-the-spirit.json' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext();

for (const c of COLLECTIONS) {
  console.log(`--- collection: ${c.id} ---`);
  const raw = JSON.parse(await readFile(join(ROOT, 'data/collections', c.file), 'utf8'));
  const rule = raw.default_eligibility;
  const eligible = raw.items.filter(i => countWords(i.text) <= rule.max_words);
  const oracle = eligible[dayOfYear(NOW) % eligible.length];
  console.log(`    local oracle: items=${raw.items.length} eligible=${eligible.length} idx=${dayOfYear(NOW) % eligible.length}`);

  const page = await ctx.newPage();
  // Set the persisted selection BEFORE the page's script reads it.
  await page.addInitScript(([key, id]) => {
    try { localStorage.setItem(key, id); } catch (e) {}
  }, ['selectedCollection', c.id]);

  let reached = false;
  try {
    await page.goto(ORIGIN, { waitUntil: 'load', timeout: 45000 });
    reached = true;
  } catch (e) {
    console.log(`FAIL    reach ${ORIGIN}\n        ${e.message.split('\n')[0]}`);
    failed++;
    failures.push('reach ' + c.id);
  }

  if (reached) {
    await check(`[${c.id}] homepage settles (#quote-text leaves placeholder)`, async () => {
      await page.waitForFunction(
        ph => { const t = document.getElementById('quote-text'); return !!t && !!t.textContent && t.textContent.trim() !== ph; },
        PLACEHOLDER, { timeout: 20000 }
      );
    });

    await check(`[${c.id}] rendered verse matches the collection oracle`, async () => {
      const got = (await page.textContent('#quote-text')).trim();
      if (got !== oracle.text.trim()) {
        throw new Error(`oracle mismatch: expected ${JSON.stringify(oracle.text.slice(0,60))}…, got ${JSON.stringify(got.slice(0,60))}…`);
      }
      console.log(`        verse == collection oracle: ${JSON.stringify(got.slice(0, 60))}…`);
    });

    await check(`[${c.id}] source selector marks it selected`, async () => {
      const sel = await page.evaluate((id) => {
        const btn = document.querySelector(`[data-source="${id}"]`);
        if (!btn) return { found: false, pressed: null };
        return { found: true, pressed: btn.getAttribute('aria-pressed') };
      }, c.id);
      if (!sel.found) throw new Error(`no [data-source="${c.id}"] button on the page`);
      console.log(`        [data-source="${c.id}"] found (aria-pressed=${sel.pressed})`);
    });

    await check(`[${c.id}] no uncaught page error`, async () => {
      const errs = [];
      page.on('pageerror', e => errs.push(e.message || String(e)));
      await page.waitForTimeout(300);
      if (errs.length) throw new Error(`${errs.length} page error(s): ${JSON.stringify(errs)}`);
      console.log('        page errors: 0');
    });
  }
  await page.close();
}

await ctx.close();
await browser.close();

console.log('');
console.log(`== RESULT: ${failed === 0 ? 'PASS' : 'FAIL'} (${failed} failed) — ${COLLECTIONS.length} collections verified on the live origin ==`);
if (failed > 0) { for (const f of failures) console.log(`  - ${f}`); process.exit(1); }
