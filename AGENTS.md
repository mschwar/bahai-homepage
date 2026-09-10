# AGENTS.md — agent contract for `bahai-homepage`

## Purpose

A quiet, deterministic, **single-passage** daily verse homepage: one Hidden Words passage per Gregorian
day-of-year from the ≤75-word subset, plus the Badíʿ date, a light "Yesterday" recall, click-to-copy, and a
persistent theme. Static, client-side, GitHub Pages. Read `README.md` first for the full product doctrine.

## What must not change

- **Frozen files (byte-identical):** `index.html`, `css/*`, `js/*`, `data/quotes_hidden_words.json`,
  `ios/widget/*`. A change here is a product change; it needs an owner decision and parity evidence.
- **No framework, build system, bundler, package manifest, or runtime dependency** for the served site.
- **One passage, not a feed.** No settings drawer, dashboard, feed, streak, or recommendation surface.
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

There is exactly **one corpus**, `data/quotes_hidden_words.json` (153 records, `{text, source, author}`).
Its path and the `MAX_QUOTE_WORDS = 75` cap are **hard-coded in two places** — `js/quote-core.js` (the shared
JS source of truth, consumed by both `js/script.js` and `js/wallpaper.js` after H2A) and
`ios/widget/QuoteStore.swift` (a Swift reimplementation, deliberately not unified). There is **no schema
version and no provenance record**, and `ios/widget/quotes_hidden_words.json` is a byte-identical copy with
no regeneration step.

Until the collection contract lands (queue unit `H2B`), changing the corpus means changing both copies.
Do not pretend the contract exists.

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
