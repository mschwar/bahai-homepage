# Collection Contract (H2B-A)

**Status:** proposed, contract-only. No real second collection is wired by this document. This
is the seam `H2B-B` (and, later, `R1`/`H3`) implement against — it does not itself change
`js/quote-core.js`, `js/script.js`, `index.html`, or any frozen file.

## Why this exists

Today the "collection" is implicit: one hard-coded path (`data/quotes_hidden_words.json`), one
hard-coded eligibility rule (`countWords <= 75`), one cache-key scheme, and a Swift
reimplementation that duplicates all of it (`TECH_DEBT_AND_RISKS.md` #1/#4). The source-toggle
chrome shipped in D22/D23 already presents "The Hidden Words" / "Coming later" to the visitor —
it has nowhere to point yet. This document is where it points.

## Design principles carried over from doctrine

- **One passage, not a feed** (README "must-not-change invariants"). The contract adds a second
  *collection*, never a second simultaneous *passage*, list view, or settings surface.
- **Deterministic selection**, no randomness, ever.
- **No framework, build system, bundler, or runtime dependency.** The contract is plain JSON
  consumed by the existing vanilla-JS core; nothing here requires a schema-validation library at
  runtime (see Validation below — validation is a dev-time/CI-time script, not a page dependency).
- **Producer-agnostic.** Nothing below names Garden or Ruhi in a required field. Both are future
  producers of a collection file shaped like this contract, not special cases of it.
- **Hidden Words is the default and its current behavior is preserved exactly** — see Migration.

## Collection-level fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `collection_id` | string, `[a-z0-9-]+` | yes | Stable, URL/localStorage-key-safe. Never reused for a different collection once shipped. |
| `label` | string | yes | Human-facing name shown in the source menu (e.g. `"The Hidden Words"`). |
| `version` | integer | yes | Bumped whenever `items` content changes meaningfully (a new/edited/removed item, not a metadata typo fix). Independent of `schema_version`. |
| `schema_version` | integer | yes | Version of *this contract* the file conforms to. Starts at `1`. A consumer that doesn't recognize a `schema_version` must refuse to load the collection (see Validation) rather than guess. |
| `description` | string | yes | One or two sentences, purpose/character of the collection. Not shown in the lightweight selector today; exists for provenance and for a future non-dashboard surface if ever justified. |
| `producer` | string | yes | Where the collection file comes from. For Hidden Words: `"bahai-homepage (built-in)"`. For a future Garden export: an identifier like `"garden-of-wisdom"`. Free text, not a code path. |
| `provenance_note` | string | yes | Where the text itself comes from (e.g. bahai.org authoritative-texts page). Carries forward what `DATA_AND_PROVENANCE_MAP.md` currently keeps only in a doc, not in data. |
| `rights_note` | string | yes | Redistribution/rights posture in one sentence. Required so a future producer can't ship a collection with silently unresolved rights status. |
| `default_eligibility` | object | yes | See **Eligibility rules** below. |
| `items` | array of item objects | yes | See **Item-level fields**. May be empty (see Empty-collection behavior), but must be present. |

## Item-level fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `item_id` | string | yes | Stable within the collection, unique. Never reused for different text once shipped, even if the item is later removed. |
| `text` | string | yes | Passage text, exactly as the runtime should render it. |
| `author` | string | no | Falls back to `QuoteCore.DEFAULT_AUTHOR` (today: `"Bahá'u'lláh"`) if absent — **only** for the Hidden Words collection. A future collection with a different default author must set `author` on every item explicitly; `DEFAULT_AUTHOR` is not renamed or made collection-aware in this phase. |
| `source_ref` | string | yes | Human-readable citation, shown today as `quote-source-full` (e.g. `"The Hidden Words, From the Arabic #1"`). |
| `source_url` | string (URL) or `null` | yes (may be `null`) | Authoritative source URL when one exists. `null`, not an empty string, when there isn't one. |
| `item_type` | enum | yes | `full-passage` \| `excerpt` \| `paraphrase` \| `oral-attribution` \| `unknown`. Same vocabulary as Garden's `docs/data/DATA_CONTRACT.md` in `Garden-of-Wisdom`, chosen deliberately so a future Garden export needs no relabeling. |
| `verification_state` | enum | yes | `unverified` \| `verified` \| `disputed`. Same vocabulary as Garden. |
| `tags` | array of strings | no | Defaults to `[]`. Curation metadata only; the runtime does not filter or search by tag (no browse/search UI — doctrine). |
| `upstream_id` | string or `null` | no | Identifier for the record in the *producer's own* system (e.g. a Garden `quotes.csv` `id`), so a re-export can be diffed against the last one. `null`/absent for the Hidden Words collection, which has no upstream system. |

## Eligibility rules (`default_eligibility`)

A small, declarative, data-only rule object — not a code hook, so no collection file can smuggle
in behavior the runtime doesn't already know how to interpret. `schema_version: 1` defines exactly
one rule shape:

```json
{ "max_words": 75 }
```

meaning: an item is eligible iff `countWords(item.text) <= max_words`. This is exactly today's
Hidden Words rule, preserved. A future rule shape (e.g. `"verification_state_in": ["verified"]`)
would require bumping `schema_version` and adding a case to the (still tiny) eligibility
evaluator — not opening this up to arbitrary predicates.

Selection is always computed over **the eligible subset**, never the full `items` array — this is
what "today/yesterday" has always meant for Hidden Words (153 items, some filtered by the 75-word
cap before selection), and the contract keeps that semantics rather than changing it for other
collections.

## Runtime semantics

### Deterministic selection

Unchanged: `eligible[dayOfYear(date) % eligible.length]`. `QuoteCore.selectForDate` already does
this; it does not need to change shape, only to be called with a collection's eligible-subset
array and the currently selected collection's rule applied first.

### Collection-scoped cache keys

Current: `dailyVerse:<YYYY-MM-DD>`, plus `dailyVerse:lastKey`.

Proposed: `dailyVerse:<collection_id>:<YYYY-MM-DD>`, plus `dailyVerse:lastKey:<collection_id>`.

Examples:
- Hidden Words, 2026-09-11 → `dailyVerse:hidden-words:2026-09-11`
- Fixture collection, 2026-09-11 → `dailyVerse:fixture-a:2026-09-11`

**Migration of existing cached keys:** old-format keys (`dailyVerse:2026-09-10`, no collection
segment) are never rewritten. They simply stop being read once the collection-scoped scheme
ships — worst case a returning visitor loses one day of offline cache on the day this ships,
which self-heals on the next successful fetch. Not worth a migration script for a client-side
cache that is only ever a same-day convenience.

### Selected-collection persistence

New `localStorage` key: `selectedCollection`, storing a bare `collection_id` string. Absent (new
visitor, or key cleared) → default is `hidden-words`. This mirrors how `theme` already persists
(`js/script.js` lines 51–64) — same mechanism, new key, no new persistence pattern invented.

### Today/yesterday relationship after switching collections

Both "today" and "yesterday" are always computed **within the currently selected collection**.
Switching collections recomputes both from the new collection's eligible set; it does not attempt
to show "yesterday in the old collection, today in the new one" — that would be a second implicit
feed axis, against doctrine. This matches the existing behavior of computing `todayObj`/`yestObj`
together in `initPage()`.

### Unavailable / invalid / empty collection

If `selectedCollection` in storage names a `collection_id` that cannot be loaded (fetch fails,
fails schema validation, `schema_version` unrecognized, or `items` filtered-to-eligible is empty):
fall back to `hidden-words` and clear the invalid `selectedCollection` value, so the failure
doesn't repeat on every load. Surface this the same lightweight way the Badíʿ degradation and
fetch-failure paths already do — reuse `setStatus`/`setLocationMessage`-shaped inline text, not a
new banner/dialog pattern. No collection may ever leave the page showing "No verse available"
when Hidden Words itself is healthy.

### Migration from `quotes_hidden_words.json`

Current shape: a bare array of `{text, source, author}`, no `collection_id`, no `item_id`, no
`schema_version`.

Proposed mapping (for `H2B-B` to execute — **not done in this phase**, `data/quotes_hidden_words.json`
stays byte-identical):

- Collection-level: `collection_id: "hidden-words"`, `label: "The Hidden Words"`, `version: 1`,
  `schema_version: 1`, `description` drawn from the existing README doctrine line, `producer:
  "bahai-homepage (built-in)"`, `provenance_note` and `rights_note` drawn from
  `DATA_AND_PROVENANCE_MAP.md`'s existing prose, `default_eligibility: {"max_words": 75}`.
- Item-level: `text` ← `text` (unchanged), `author` ← `author` (unchanged, still falls back to
  `DEFAULT_AUTHOR` when absent), `source_ref` ← `source` (renamed field, same content),
  `source_url: "https://www.bahai.org/library/authoritative-texts/bahaullah/hidden-words/hidden-words.xhtml"`
  for every item (the scraper's single source page — no more granular per-item URL exists today),
  `item_type: "full-passage"` for every item (Hidden Words passages are complete numbered
  passages, not excerpts), `verification_state: "verified"` for every item (this is the
  authoritative bahai.org text, already the product's trusted corpus — unlike Garden, where
  everything is currently `unverified`), `item_id` ← a slug derived from `source` (e.g. `"The
  Hidden Words, From the Arabic #1"` → `arabic-1`; `"…, From the Persian #34"` → `persian-34`),
  `tags: []`, `upstream_id: null`.
- The resulting file is a **new top-level shape** (an object with `items`, not a bare array), so
  this is a breaking format change, not an additive one. `H2B-B` must decide whether to migrate
  `data/quotes_hidden_words.json` in place (frozen-file change, needs an owner decision per
  `AGENTS.md`) or introduce a new path (e.g. `data/collections/hidden-words.json`) and retire the
  old path deliberately. **This choice is listed as an unresolved human decision below** — H2B-A
  does not pick one, since both are legitimate and the tradeoff (one more frozen-file diff vs. one
  more file to keep in sync) is a product call, not a technical one.

## Validation

A dev-time script (not a runtime dependency — parallel to `scripts/validate_quotes.py`) should
check, for any collection file:

- required collection-level fields present and correctly typed;
- `schema_version` is a version this validator/runtime recognizes;
- `default_eligibility` is one of the recognized rule shapes;
- every item has all required item-level fields;
- `item_id` values are unique within the collection;
- `item_type` and `verification_state` values are in their enums;
- no exact-duplicate `text` within the collection (warning, not hard failure — mirrors
  `validate_quotes.py`'s existing duplicate-text check);
- `source_url` is `null` or a well-formed URL string.

This is a **new script** (`H2B-B`'s to write, e.g. `scripts/validate_collection.py`), not a
retrofit of `scripts/validate_quotes.py` — the existing validator's `{text, source, author}` shape
check stays exactly as-is for backward compatibility until/unless the migration above actually
lands.

## Multi-surface recommendation

- **Root web corpus stays the source of truth.** Whatever file(s) `H2B-B` lands under `data/`
  (or `data/collections/`) are canonical; the wallpaper and iOS widget are downstream consumers,
  never independent sources.
- **Wallpaper** (`wallpaper.html`/`js/wallpaper.js`): already shares `js/quote-core.js` with the
  homepage after H2A. It should consume the same collection-selection API once `H2B-B` adds it,
  but — per D3, and this document does not propose changing that — it stays off the parity path
  and is not required to expose a source selector of its own; defaulting to Hidden Words is
  sufficient for an experimental, unlinked surface.
- **iOS widget**: cannot share JS. Recommend closing tech-debt #4 by writing one small
  regeneration script that emits *both* the web collection file and
  `ios/widget/quotes_hidden_words.json` (or its post-migration equivalent) from one canonical
  source in one run, rather than two independently-maintained copies. `QuoteStore.swift`'s
  `DailyQuote` struct would need the same field rename (`source` → `source_ref`) if the migration
  above is adopted; this is explicitly **not solved by sharing code** — a mechanical, small,
  parallel Swift struct update.

## Fixture proposal (design only — not wired into `tests/parity.mjs` in this phase)

A tiny, obviously-non-production fixture collection, to later prove: two collections coexist,
selection differs deterministically, persistence works, Hidden Words stays default, and cache
keys don't collide.

```json
{
  "collection_id": "fixture-a",
  "label": "Fixture Collection A (test only)",
  "version": 1,
  "schema_version": 1,
  "description": "Synthetic fixture for H2B parity tests. Not a real collection.",
  "producer": "bahai-homepage (test fixture)",
  "provenance_note": "Fabricated text for testing only; not a real source.",
  "rights_note": "N/A — test fixture, never deployed to a served page.",
  "default_eligibility": { "max_words": 75 },
  "items": [
    {
      "item_id": "fixture-1",
      "text": "This is fixture passage one, used only to prove selection determinism.",
      "author": "Fixture Author",
      "source_ref": "Fixture Source, Item 1",
      "source_url": null,
      "item_type": "unknown",
      "verification_state": "unverified",
      "tags": [],
      "upstream_id": null
    },
    {
      "item_id": "fixture-2",
      "text": "This is fixture passage two, distinct from passage one for the same reason.",
      "author": "Fixture Author",
      "source_ref": "Fixture Source, Item 2",
      "source_url": null,
      "item_type": "unknown",
      "verification_state": "unverified",
      "tags": [],
      "upstream_id": null
    },
    {
      "item_id": "fixture-3",
      "text": "This is fixture passage three, completing a small three-item eligible set.",
      "author": "Fixture Author",
      "source_ref": "Fixture Source, Item 3",
      "source_url": null,
      "item_type": "unknown",
      "verification_state": "unverified",
      "tags": [],
      "upstream_id": null
    }
  ]
}
```

`H2B-B` would place this under a clearly test-only path (e.g. `tests/fixtures/fixture-a.json`,
**never** under `data/`, so it is never accidentally served as product data — see the README's
"whole branch is public" warning) and add `tests/parity.mjs` assertions that: (1) selecting
`fixture-a` renders a different verse than `hidden-words` on the same date whenever their
day-of-year-mod-length values diverge, (2) `localStorage['selectedCollection']` round-trips
across reload, (3) `dailyVerse:hidden-words:*` and `dailyVerse:fixture-a:*` keys never collide in
the same storage, (4) a corrupted/missing `selectedCollection` value falls back to `hidden-words`
without an error.

## Compatibility notes for future producers

- **Garden-of-Wisdom** (`~/Developer/Garden-of-Wisdom`): its own `docs/data/DATA_CONTRACT.md`
  (2026-09-11 retrofit) already uses the same `item_type` and `verification_status` vocabulary as
  this contract — that alignment was deliberate on the Garden side. A future Garden export would
  map Garden's `id` → `upstream_id`, `quote_text` → `text`, `tradition` → (not a field here; out
  of scope for a homepage that is not multi-faith — see doctrine "do not resurrect multi-faith"),
  `source_ref` → `source_ref` (same name), `author` → `author`, `item_type` → `item_type`,
  `verification_status` → `verification_state` (name differs by one word; not reconciled here,
  flagged as a **deviation** below), `source_id`-resolved `sources.csv` title → `source_url` where
  a real URL exists (many of Garden's sources are print-only, so `source_url` would often be
  `null`). Garden explicitly proposed this shape in its own Phase 0 handoff
  (`GARDEN_PHASE0_HANDOFF.md` §12) without knowing this document's exact field names in advance;
  the overlap is close but not perfect — see Deviations.
- **Ruhi/quote-ledger**: no data exists yet (confirmed absent, `docs/queue.md` `R1`). This
  contract does not add any Ruhi-specific field, per the constraint in
  `H2B_A_COLLECTION_CONTRACT.md`.

## Unresolved human decisions

1. **Migrate `data/quotes_hidden_words.json` in place, or introduce a new path?** In-place is a
   frozen-file, breaking-format change (needs an owner decision + parity evidence, per `AGENTS.md`);
   a new path keeps the old one around (or requires deliberately retiring it) but avoids touching
   a frozen file. Both are legitimate; H2B-A does not pick one.
2. **Is `verification_state: "verified"` the right default for all 153 Hidden Words items?** They
   are the product's own trusted, already-shipped corpus, so this document assumes yes — but it is
   a provenance/curation judgment call, which `AGENTS.md`'s autonomy boundary reserves for the
   owner, not an agent.
3. **`item_type: "full-passage"` for all 153 items** — same reasoning and same reservation.
4. **Naming: `verification_status` (Garden) vs. `verification_state` (this contract).** Left
   intentionally as a live discrepancy rather than silently renamed on either side — an owner (or
   a cross-repo frontier-review pass) should decide whether to reconcile the name before any real
   export is built, since a silent rename now could look like a typo later.
5. **Whether the iOS widget regeneration script belongs in this repo or is invoked from a
   separate tooling repo** — not decided; `H2B-B`'s problem once schema migration is chosen.

## Deviations from the H2B-A prompt / cross-repo principles doc

- `CROSS_REPO_COLLECTION_PRINCIPLES.md` doesn't name a field for schema/format versioning
  separate from content versioning; this contract adds `schema_version` distinct from `version`
  because "the file format changed" and "a new passage was added" are different kinds of change
  with different consumer implications (an unrecognized `schema_version` should hard-fail; a
  content `version` bump should not).
- Field name `verification_state` here vs. Garden's `verification_status` — see unresolved
  decision 4 above; not reconciled in this pass.
- The prompt's eligibility semantics section asked for "eligibility rules / word-length policy";
  this document generalizes that into a small declarative rule-object scheme (`default_eligibility`)
  rather than hard-coding `max_words` as the only possible rule, so a future collection whose
  eligibility criterion isn't word-count (e.g. "only verified items") doesn't require a contract
  rewrite — only a `schema_version` bump and one more evaluator case.
