# AGENTS.md — agent contract for `bahai-homepage`

## Purpose

A quiet, deterministic, **single-passage** daily verse homepage: one passage per Gregorian day-of-year from
the ≤75-word subset of the selected collection — **The Hidden Words by default**, with a low-weight source
menu offering one second collection — plus the Badíʿ date, a light "Yesterday" recall, click-to-copy, and a
persistent theme. Static, client-side, GitHub Pages. Read `README.md` first for the full product doctrine.

## What must not change

- **Frozen files (byte-identical):** `index.html`, `css/*`, `js/*`, `data/quotes_hidden_words.json`,
  `ios/widget/*`. A change here is a product change; it needs an owner decision and parity evidence.
- **No framework, build system, bundler, package manifest, or runtime dependency** for the served site.
- **One passage, not a feed.** No settings drawer, dashboard, feed, streak, or recommendation surface. The
  source menu is a two-item disclosure (which collection), never a browse/search/filter UI.
- **Deterministic selection.** `quotes[dayOfYear % len]` over the ≤75-word subset; no randomness.
- **Single `main` branch — and the whole branch is publicly served.** Pages is `build_type: legacy` with
  source branch `main` and path `/`, plus `.nojekyll`, so anything committed becomes reachable by URL. Never
  commit a payload that should not be publicly served; retain-not-serve means an archive branch, not a
  subdirectory of `main`.

## Read first

1. `README.md` → 2. `docs/audit/2026-09-10/` → 3. `docs/queue.md` → 4. `docs/DECISIONS.md` →
5. `docs/RUNBOOK.md`

`docs/audit/2026-09-10/` is the **canonical orientation**: the reconstructed state of the repo as of
2026-09-10. Historical, evidence-backed, and *not a live spec*.

## Commands

```bash
# run
python3 -m http.server 8000        # then open http://localhost:8000/  (never file://)

# validate (expected: 153 checked / 0 errors / 0 warnings / 0 duplicates)
make validate
python3 scripts/validate_quotes.py data/quotes_hidden_words.json
```

## Data contract — current reality

The collection contract exists and is implemented (queue `H2B`, decisions D27/D28):
`docs/architecture/COLLECTION_CONTRACT.md`. **The homepage loads `data/collections/<collection_id>.json`** —
`hidden-words.json` (generated from the raw corpus) and `garden-homepage-preview.json` (vendored
byte-identically from the Garden-of-Wisdom producer export; see
`docs/architecture/COLLECTION_IMPORTS.md`). The loaded collection is chosen by the `COLLECTIONS` allow-list in
`js/quote-core.js` plus the `selectedCollection` localStorage key; cache keys are
`dailyVerse:<collection_id>:<date>`.

`data/quotes_hidden_words.json` (153 records, `{text, source, author}`) remains the **canonical raw corpus**
and is byte-frozen: it is the scrape output, the generator's input, and the file the experimental wallpaper
still reads. `scripts/build_collections.py` derives both `data/collections/hidden-words.json` and
`ios/widget/quotes_hidden_words.json` from it (one regeneration step — `make check-collections`); the Swift
source `ios/widget/QuoteStore.swift` still reimplements the shape and still decodes the legacy `source` field,
a recorded owner-gated follow-up, not a thing to "fix" without an owner decision. **Never claim to have built
or tested the widget.**

To change Hidden Words: edit the raw corpus, `make collections`, then
`make validate validate-collections check-collections parity`.

## Experimental ambient surfaces (off the parity path)

Both are unlinked from `index.html` and neither is on the parity path — **a change to `js/script.js` has no
obligation to propagate to them**; that coupling is `H2B`'s problem, not a standing expectation.

- **Wallpaper** — `wallpaper.html` + `css/wallpaper.css` + `js/wallpaper.js`, live at
  <https://mschwar.github.io/bahai-homepage/wallpaper.html> (React 18 from `unpkg.com`). Deployed but
  unreachable from the homepage.
- **iOS widget** — `ios/widget/*.swift` + a bundled corpus copy. **No `.xcodeproj` exists, so it is source and
  data only and cannot be built or tested in-repo.** Never claim to have built or tested it.

Owner decision D3 keeps both. Adding an on-page link would edit `index.html` and is a separate owner-visible
unit (`H1.10` in `docs/queue.md`).

## Autonomy boundary

- **Agent-executable:** documentation, the queue/ledger, non-runtime dev tooling, refactors *after* parity
  tests exist, archive-branch housekeeping.
- **Human-gated:** deleting or unpublishing anything, rights / provenance / copyright / canonical-text
  curation, publishing a new collection, or any change to a frozen file.

Provenance, copyright, canonical-text and curation questions are **research tasks for the owner**;
contract design and code are agent-executable. A unit enters the queue only with a named contract + gate.

## Forbidden / blocked

- **Ruhi Book 1 (`R1`) is BLOCKED** — pending the `H2B` collection contract + a rights/provenance review.
  It is *not* "all direct quotations in Book 1"; there is no Ruhi data in this repo, correctly.
- **Do not resurrect the multi-faith direction.** The Dhammapada/Gita/KJV datasets are abandoned residue.
- **Do not modify the wallpaper or iOS widget** without an owner decision.
- Do not add CI/deploy changes, fonts/CDN pins, or "tidying" of working code as a side effect.

## Evidence / handoff convention

Every task ends with a handoff stating **what changed**, **why**, and the **raw command output** proving each
claim. Deviations from an authorized packet are stated explicitly, never silently. A gate that cannot be
closed is reported as OPEN, never as done.
