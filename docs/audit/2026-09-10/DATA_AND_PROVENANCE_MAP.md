# Data & Provenance Map

The **only** corpus the running product loads is `data/quotes_hidden_words.json`. Everything else is
orphaned, legacy, or an experimental copy and must not be treated as live product data.

## Live corpus

| File | Records | Schema | Provenance (source of truth) | Authoritative source URL | Verifier |
|---|---|---|---|---|---|
| `data/quotes_hidden_words.json` | 153 | `{ text, source, author }` | `scripts/scrape_hidden_words.py` scraping bahai.org | `https://www.bahai.org/library/authoritative-texts/bahaullah/hidden-words/hidden-words.xhtml` | `scripts/validate_quotes.py` — 153 check, 0 errors/warnings, 0 dups |
| Deployed copy (GH Pages) | 153 | same | same, via `main` commit | — | byte-identical to repo (60,008 B = 60,008 B) |

- Selection contract (implicit, in `js/script.js`): `countWords(text) <= MAX_QUOTE_WORDS(75)` → then
  `list[dayOfYear(Gregorian) % list.length]`, cached by local date + Badíʿ day key.
- **No explicit collection/provenance contract exists in the repo.** "Collection identity," versioning,
  provenance fields, and citation policy are *implicit* in a single hard-coded path — this is exactly the
  seam the future H2B collection/source abstraction should make explicit.

## Orphaned data (NOT loaded by any code)

| File | Records | Size | Keys | Provenance | Status |
|---|---|---|---|---|---|
| `data/quotes_dhammapada.json` | 405 | 116,467 B | `text, source, author, tradition` | `scripts/scrape_dhammapada_pg.py` | **STALE/abandoned** |
| `data/quotes_gita_arnold.json` | 275 | 204,562 B | `text, source, author, speaker, translator, tradition, book, reference` | `scripts/scrape_gita_arnold_pg.py` | **STALE/abandoned** |
| `data/quotes_kjv_bible.json` | 24,930 | **10,023,950 B** | `text, source, author, tradition, book, reference` | `scripts/scrape_kjv_bible_pg.py` | **STALE/abandoned** — largest liability |
| `data/quotes.json` (root) | 4 | 889 B | `text, source, author` | hand-authored starter (Gleanings ×2, Paris Talks ×1, Hidden Words ×1) | **STALE/legacy** |

**Why these exist (observation):** they were created on day 1 (2025-06-03) as part of the original
multi-faith vision and a roadmap whose "settings drawer / dataset loader" was never built. **Richer
schemas** (`tradition`, `book`, `reference`, `speaker`, `translator`) exist only in the abandoned files;
the live corpus keeps the minimal `{text, source, author}` shape.

## Duplicated corpus

- `ios/widget/quotes_hidden_words.json` — a **copy** of the Hidden Words corpus for the widget bundle
  (byte-size 60,008 = identical to `data/` copy). This is a drift risk: two physical copies, one
  generation process.

## Provenance / attribution notes

- **Hidden Words text** is the English translation from bahai.org's authoritative-texts page (identified
  by the scraper's source URL). The `source` field stores "The Hidden Words, From the Arabic #N" / "… Persian #N".
  The scraper does not record a translation-edition/publisher citation — an important provenance gap if
  this corpus is ever redistributed or curated further.
- **Old multi-faith files** came from Project Gutenberg (dhammapada/gita/kjv scrapers target `_pg` =
  Project Gutenberg) with no license/edition metadata stored.
- The **Ruhi Book 1 memorization collection** mentioned in `WORKSTREAMS_AND_QUEUE_SEEDS.md` **does not
  exist in this repo** — no such data file is present. It is a future, **blocked** work unit only (see
  QUEUE_PROPOSAL).

## Operational liabilities from data
| Item | Size/Impact | Why it matters |
|---|---|---|
| `data/quotes_kjv_bible.json` ~10 MB | Served by GH Pages as `data/quotes_kjv_bible.json` (HTTP 200 confirmed) | Bloats repo/site for a dead feature; not linked anywhere |
| Duplicated hidden-words JSON (data + ios/widget) | Two copies | Drift risk if corpus regenerated |
| No provenance/version/collection contract | Implicit single path | Blocks any safe corpus addition/selector (Ruhi, future collections) |