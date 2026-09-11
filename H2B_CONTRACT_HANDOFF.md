# H2B Contract Handoff

Executed against
`bootstrap/packets/2026-09-11-h2b-collection-contract/prompts/01_H2B_COLLECTION_CONTRACT_ONLY.txt`
(H2B-A: contract only) on branch `feat/h2b-collection-contract`, based on `main` at `9e77030`.

## Contract summary

Full spec: `docs/architecture/COLLECTION_CONTRACT.md`. In brief: a collection is a JSON object
with identity/version/provenance/rights fields plus an `items` array; each item has a stable
`item_id`, `text`, `author`, `source_ref`, `source_url`, `item_type`
(`full-passage`/`excerpt`/`paraphrase`/`oral-attribution`/`unknown` — same vocabulary as
Garden-of-Wisdom's independently-drafted contract), `verification_state`
(`unverified`/`verified`/`disputed`), optional `tags`, and `upstream_id`. Eligibility is a small
declarative rule object (today: `{"max_words": 75}`), not hard-coded logic. Selection stays
`eligible[dayOfYear % eligible.length]`, unchanged. Cache keys become collection-scoped
(`dailyVerse:<collection_id>:<date>`), and the selected collection persists under a new
`selectedCollection` localStorage key, defaulting to `hidden-words`.

## Hidden Words mapping

`data/quotes_hidden_words.json`'s current bare-array `{text, source, author}` shape maps to one
collection object: `collection_id: "hidden-words"`, `version: 1`, `schema_version: 1`,
`default_eligibility: {"max_words": 75}`, every item `item_type: "full-passage"` and
`verification_state: "verified"`, `source_url` fixed to the single bahai.org authoritative-texts
page for all 153 items (no more granular URL exists today), `item_id` derived from the existing
`source` string (e.g. `"…From the Arabic #1"` → `arabic-1`). Full detail and the two open
questions this raises (in-place migration vs. new path; whether `verified`/`full-passage` are the
right defaults) are in the contract doc.

## Fixture mapping

A 3-item synthetic `fixture-a` collection is fully specified (verbatim JSON) in the contract
doc's "Fixture proposal" section, deliberately **not committed as a file or wired into
`tests/parity.mjs`** — the prompt asked to specify a fixture, not to wire a real or synthetic
second collection into the live test suite yet. `H2B-B` places it under `tests/fixtures/`
(never `data/`, given the "whole branch is public" rule) and adds four parity assertions
(selection differs from Hidden Words on divergent dates, persistence round-trips, cache keys
don't collide, invalid `selectedCollection` falls back cleanly).

## Cache / persistence semantics

- Current: `dailyVerse:<YYYY-MM-DD>`, `dailyVerse:lastKey`.
- Proposed: `dailyVerse:<collection_id>:<YYYY-MM-DD>`, `dailyVerse:lastKey:<collection_id>`.
- Example: Hidden Words today → `dailyVerse:hidden-words:2026-09-11`; a fixture collection on the
  same date → `dailyVerse:fixture-a:2026-09-11` — no collision, verified by construction (the
  collection ID is part of the key, not appended after a shared prefix collision could occur).
- New `selectedCollection` key stores a bare `collection_id`; absent → default `hidden-words`,
  mirroring how `theme` already persists.
- Old-format cache keys are never migrated; they simply age out. Worst case is one lost day of
  offline cache on the day this ships.

## Selection semantics

Unchanged algorithm (`QuoteCore.selectForDate`), applied to the *eligible subset* of whichever
collection is selected, not the full `items` array. Today and yesterday are always computed
within the same currently-selected collection — switching collections recomputes both together,
never mixes collections across the two.

## Migration

See `docs/architecture/COLLECTION_CONTRACT.md` → "Migration from `quotes_hidden_words.json`".
Summary: field rename `source` → `source_ref`, new required fields added with the values above,
shape changes from a bare array to `{..., items: [...]}` — a breaking format change. **Not
performed in this phase**; `data/quotes_hidden_words.json` is untouched (confirmed: `make
validate` still reports 153/0/0/0 and no frozen-file hash moved).

## Validation

Proposed dev-time `scripts/validate_collection.py` (not written in this phase — H2B-B's task):
required-field/type checks, `schema_version` recognition, `default_eligibility` shape
recognition, `item_id` uniqueness, enum membership for `item_type`/`verification_state`,
duplicate-text warning, `source_url` well-formedness. Parallel to, not a replacement for,
`scripts/validate_quotes.py`.

## Wallpaper / iOS implications

- **Wallpaper**: already shares `js/quote-core.js`; should consume the same collection-selection
  API once built, but per D3 stays off the parity path and does not need its own source-selector
  UI — defaulting to Hidden Words is sufficient for an experimental, unlinked surface.
- **iOS widget**: cannot share JS with the web core. Recommend one regeneration script emitting
  both the web collection file and the widget's bundled JSON from a single canonical source
  (closes tech-debt #4). `QuoteStore.swift`'s `DailyQuote` struct needs a parallel field rename
  (`source` → `source_ref`) if migration is adopted — a small, mechanical, non-shared update, not
  an attempt to unify Swift and JS.

## Files H2B-B would later touch

- `data/quotes_hidden_words.json` (if in-place migration is chosen) **or** a new
  `data/collections/hidden-words.json` (if not) — frozen-file / owner-gated either way if the
  root path changes meaning.
- `js/quote-core.js` — add collection loading, eligibility evaluation, collection-scoped cache
  key helpers.
- `js/script.js` — wire the already-shipped source-menu chrome (`dom.sourceMenu`,
  `data-source` buttons) to actually switch `selectedCollection` and re-run `initPage()`.
- `ios/widget/QuoteStore.swift` + `ios/widget/quotes_hidden_words.json` — field rename, if
  migration is adopted.
- New: `scripts/validate_collection.py`, `tests/fixtures/fixture-a.json`, new `tests/parity.mjs`
  assertions (section J or similar).
- `docs/RUNBOOK.md` §8 ("Data contract reality") — rewritten once the contract is implemented,
  not just proposed.

## Garden / quote-ledger compatibility

Garden-of-Wisdom's independently-drafted `docs/data/DATA_CONTRACT.md` (same date, 2026-09-11)
already uses `item_type` with the identical five-value vocabulary. The one naming mismatch found:
Garden calls its column `verification_status`; this contract calls the equivalent field
`verification_state`. Not reconciled in this pass — recorded as unresolved decision 4 in the
contract doc, and worth resolving before any real Garden export is built, since a silent
one-word rename now would look like a bug later. No Ruhi/quote-ledger data exists anywhere yet
(confirmed absent), so nothing to reconcile there.

## Unresolved human decisions

1. Migrate `data/quotes_hidden_words.json` in place, or introduce a new path.
2. Whether `verification_state: "verified"` is the correct default for all 153 Hidden Words items.
3. Whether `item_type: "full-passage"` is correct for all 153 Hidden Words items.
4. `verification_status` (Garden) vs. `verification_state` (this contract) — reconcile or not.
5. Where an iOS-widget regeneration script should live.

Full reasoning for each is in `docs/architecture/COLLECTION_CONTRACT.md`.

## Validation output

```
$ make validate
python3 scripts/validate_quotes.py
Quotes checked: 153
Errors: 0
Warnings: 0
Duplicate texts: 0

$ make parity
[...]
== RESULT: 24 passed, 0 failed ==
```

Both identical to pre-change baseline — this phase changed no product file, so no parity or
data-validation drift is expected or found.

## Deviations

- The numbering collision flagged in an earlier draft of this handoff was real: this branch
  originally recorded its new entry as `D24`, but by the time it rebased onto `main`, branch
  `feat/eink-lock-wallpaper` had already merged (PR #24) using `D24` (commit `d34ed9d`, "docs:
  record D24 (C12 option b); close C12") and `D25` (commit `b5b7c58`, "docs: record D25; note C12
  superseded by the e-ink lock PNG") for unrelated wallpaper work. Fixed by rebasing this branch
  onto `main` and renumbering our entry to `D26`, the next free number after `main`'s `D25`; no
  other entry in `docs/DECISIONS.md` was touched.
- The prompt's fixture-design section says "specify... do NOT wire" — interpreted as: write the
  fixture's exact JSON in the contract doc, but do not create `tests/fixtures/*.json` or add
  `tests/parity.mjs` assertions in this phase. If "specify" was meant to include committing the
  fixture file (still inert, still not wired into the suite), that's a one-file follow-up, not a
  contract change.
- `default_eligibility` is generalized into a small rule-object scheme rather than a single
  hard-coded `max_words` field, so a future non-word-count eligibility rule doesn't force a
  contract rewrite. This is additive beyond the prompt's literal "word-length policy" ask; flagged
  in case the owner prefers the simpler literal field instead.

## STOP

Per the prompt's stop condition: this phase is complete. No Garden data was wired, no Ruhi
research was begun, and the source selector's production behavior is unchanged (still chrome-only,
verified by `make parity`'s section I). Next step is human/frontier review of this contract
alongside Garden's rehabilitated data model (`GARDEN_PHASE0_HANDOFF.md` in `Garden-of-Wisdom`).
