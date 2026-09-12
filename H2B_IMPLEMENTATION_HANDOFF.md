# H2B Implementation Handoff — 2026-09-11

Executed against
`bootstrap/packets/2026-09-11-h2b-collection-contract/prompts/02_H2B_IMPLEMENT_WITH_VERIFIED_GARDEN_EXPORT.txt`
on branch `feat/h2b-collection-switching`, based on `main` at `0283f62`.

All three entry conditions were true before work started:

1. H2B-A collection contract accepted (D27, PR #25).
2. A verified Garden-of-Wisdom Bahá'í preview export exists and conforms to that contract
   (`exports/bahai-homepage-preview/v1/collection.json`, producer commit `affa328`).
3. The owner supplied the exact payload path in-session.

## Files changed

| File | Change |
|---|---|
| `data/collections/hidden-words.json` | **new** — generated contract-shaped Hidden Words collection (153 items, 128 eligible) |
| `data/collections/garden-homepage-preview.json` | **new** — vendored byte-identically from the producer payload (4 items) |
| `js/quote-core.js` | **frozen, owner-authorized** — `COLLECTIONS` allow-list, `loadCollection`, eligibility evaluator, failure classification, selected-collection persistence, collection-scoped cache-key helpers. Legacy `fetchQuotes`/`filterShort`/`QUOTES_PATH` retained for the wallpaper. |
| `js/script.js` | **frozen, owner-authorized** — source menu wired to switch collections in place; per-collection cache; fallback classification; citation reads `source_ref` |
| `index.html` | **frozen, owner-authorized** — second menu item is now the real collection (`data-source="garden-homepage-preview"`) |
| `tests/parity.mjs` | sections C/D/I re-pinned; **new sections J (10 assertions on the second collection) and K (fallback semantics)**; new helpers |
| `tests/parity-live.mjs` | exporter list extended with the new core surface (it asserted an exact key list) |
| `scripts/build_collections.py` | **new** — generates the collection file and the widget's bundled corpus from the one raw corpus; `--check` mode |
| `scripts/import_collection.py` | **new** — SHA-256-gated import of a producer payload; filename derived from the payload's own `collection_id` |
| `scripts/validate_collection.py` | **new** — contract validator for collection files |
| `Makefile` | `validate-collections`, `collections`, `check-collections` targets |
| `docs/architecture/COLLECTION_IMPORTS.md` | **new** — import provenance record |
| `docs/DECISIONS.md` | D28 — H2B-B executed; five D26 decisions resolved; both D27 follow-ups carried |
| `docs/queue.md` | H2B closed; priority table, R1 block, tech-debt #1/#4 updated |
| `docs/RUNBOOK.md` | §1 topology, §3.0 collection validation, §8 data-contract reality rewritten |
| `AGENTS.md`, `README.md` | data-contract reality, structure table, collections section |
| `docs/audit/2026-09-11/*` | evidence: baseline run, verification run, 6 visual-QA screenshots |

`css/*`, `js/badi-init.js`, `js/wallpaper.js`, `data/quotes_hidden_words.json` and all three `ios/widget/`
files are **byte-identical** to `main` (hashes in the verification run).

## Collection contract version

`schema_version: 1` — the contract as accepted in D27, unchanged in shape. No field was added, renamed or
removed by this unit. The one contract-level question D27 left open (the verification field name) is now
closed: **`verification_state` is canonical** (D28, decision 4).

## Garden export version/source commit

- Producer: `mschwar/Garden-of-Wisdom`, `exports/bahai-homepage-preview/v1/collection.json`
- Commit `affa3283e852f60a6fd675aeca8e35762fa19cf0` (landed via merge `8405856`, branch
  `feat/g4-homepage-preview-export`)
- `collection_id` `garden-homepage-preview`, `version` 1, `schema_version` 1, 4 items
  (`garden-3`, `garden-12`, `garden-15`, `garden-26`), all `excerpt` / `verified`
- sha256 `85fa2f6b2882633a683b7449f9e4daf650f78b5ee28faf9e59dbff52222d6bd5` — enforced at import time
  (`--expected-sha256`), re-asserted by parity section J on every run, and `cmp`-proven byte-identical
- Not exported: donor `30` (rejected by the producer's own verification). Substitution was forbidden.

## Hidden Words parity evidence — before/after

- Baseline (`main` @ `0283f62`): `make validate` 153/0/0/0; `make parity` **24 passed, 0 failed** —
  `docs/audit/2026-09-11/H2B_B_BASELINE_MAIN_RUN.txt`.
- This branch: `make validate` 153/0/0/0; `make parity` **34 passed, 0 failed** —
  `docs/audit/2026-09-11/H2B_B_VERIFICATION_RUN.txt`.
- Sections A–H (day-of-year selection, today/yesterday, cache-by-date, the #7 wrinkle, theme, Badíʿ
  fallback, clipboard, reduced-motion) are unchanged and green. The suite **grew by 10 assertions** and
  **re-pinned exactly two** (the cache-key scheme and the menu's second option) — both are behavior this
  unit deliberately changed, per the accepted contract. No existing assertion was weakened or deleted.
- The Hidden Words oracle still reads the **raw corpus**, not the generated collection file, so section A/B
  now additionally prove the generated file is faithful (section J, assertion 1).

## Second-collection deterministic-selection evidence

Fixed suite date is 2026-06-15 (dayOfYear 166). Hidden Words eligible = 128 → index 38; Garden eligible = 4
→ index 2 → `garden-15`, "Regard man as a mine rich in gems of inestimable value." (Gleanings CXXII). Parity
J asserts the rendered verse equals the test's independent oracle over the collection's eligible subset, that
it differs from the Hidden Words selection, that a reload reproduces it, and that `today`/`yesterday` are both
drawn from the selected collection.

## Cache / persistence evidence

Rendered `localStorage` after switching to Garden (visual QA run):

```text
dailyVerse:garden-homepage-preview:2026-09-11
dailyVerse:hidden-words:2026-09-11
dailyVerse:lastKey:garden-homepage-preview
dailyVerse:lastKey:hidden-words
selectedCollection
```

No unscoped `dailyVerse:<date>` key is written. Parity J3 asserts both scoped keys exist with their own
texts, that the texts differ (no collision), that each `lastKey` points at its own collection, and that the
legacy unscoped key is absent. Persistence round-trips across reload (J4, and screenshot 5).

## Fallback semantics evidence (D27 follow-up 1)

Parity section K, three cases, all green:

- unknown `collection_id` → Hidden Words renders, stored value **cleared**, status says "is unavailable",
  `aria-current` falls back, zero page errors;
- structurally invalid file (unrecognized `schema_version`, route-mocked) → same, stored value **cleared**;
- **transient fetch failure (aborted request) → stored value KEPT**, Hidden Words renders, status says
  "could not be loaded", zero page errors.

## Selector UX / a11y evidence

- The D23 disclosure pattern is intact: `aria-haspopup`/`aria-expanded`/`aria-controls`, Escape closes,
  click-outside closes, `focusout` closes, focus returns to the toggle after a pick (parity I).
- `aria-current="true"` marks the active collection and moves on switch, including after a reload (J4).
- Menu labels are asserted to equal the collection files' own `label` fields, so a label can't drift
  from the descriptor (I).
- Two deletions of note: none — no CSS change was needed, the existing `min-width: 11em` menu holds the
  two-line `Garden of Wisdom (preview)` label legibly (screenshot 2).
- No new on-page surface: the menu holds exactly two items, one per collection.

## Visual QA

`docs/audit/2026-09-11/H2B-B-{1..6}-*.png` — default (Hidden Words), menu open, Garden selected (light),
Garden selected (dark), after reload (Garden persists), back to Hidden Words. Rendered over a local origin
with the Google Fonts and Badíʿ vendor requests deliberately blocked, so the "Badíʿ date unavailable" note in
those images is the expected hermetic state, not a defect.

## Live/local verification instructions

```bash
cd /Users/mschwar/Developer/bahai-homepage
python3 -m http.server 8000          # never file://
# open http://localhost:8000/ -> top-right ☰ menu (under the theme toggle)

make validate && make validate-collections && make check-collections
make parity                          # 34 passed, 0 failed
make wallpaper-check                 # 4 passed, 0 failed
```

## Multi-surface status

- **Wallpaper** — unchanged and still reads the legacy raw corpus through the shared core. It does **not**
  expose a source selector, per the contract's multi-surface recommendation and D3. Verified by
  `make wallpaper-check` (4/4) because the shared JS it loads changed. (It is off the homepage parity path.)
- **iOS widget** — **source untouched.** Its bundled `ios/widget/quotes_hidden_words.json` is now *generated*
  from the one canonical corpus (so the two copies can no longer drift), and the regeneration step emits
  byte-identical output — verified by hash. `QuoteStore.swift` still decodes the legacy `source` field; its
  `source` → `source_ref` rename is a **separate, owner-gated unit** because `ios/widget/` has no
  `.xcodeproj` and cannot be built or tested in this repo. Nothing here claims the widget was built or run.

## Exact remaining gate for R1 / Ruhi

**R1 remains BLOCKED.** Its former blocker (a) — the H2B collection contract — is now closed; blocker (b)
alone remains: a recorded **rights/provenance review** outcome. No Ruhi research was begun and no Ruhi data
was added. H3 remains blocked behind R1.

## Deviations

1. **No synthetic test fixture.** The H2B-A contract proposed `tests/fixtures/fixture-a.json`. It was not
   created: the owner supplied a real second collection and this packet says "do not add any third
   collection". The invalid/empty negative cases are instead exercised against a route-mocked bad payload
   and an unknown `collection_id` — no committed fixture is needed for them.
2. **D26 decision 1 resolved as "new path"**, not in-place migration. Frozen-file risk was the deciding
   factor; see D28. Consequence: two Hidden Words files exist, one raw (frozen, canonical) and one generated
   (contract shape, what the page loads), with `make check-collections` preventing drift.
3. **D26 decision 5 answered as a location, not a widget change.** The regeneration script lives here and
   emits the widget's *data*; the widget's *source* is deliberately not modified.
4. **`tests/parity-live.mjs` touched.** It asserted an exact list of `QuoteCore` exports; the collection
   surface additions required updating that list. It is dev-only and network-dependent, and it was **not**
   run as part of this unit (it drives the *deployed* origin, which does not carry this change until merge +
   Pages rebuild). This is stated rather than implied — no live-run claim is made for it.
5. **Theme-toggle screenshots are dark-on-light pairs only** (light default, dark after toggle); no OS-level
   dark-mode emulation was exercised beyond the parity suite's saved-theme path.
6. **CI scope changed, by owner decision (D29).** PR #26's first CI run went red on `JSON_PRETTIER` and
   `SPELL_CODESPELL`, both triggered by the new `data/` files for the first time. The owner chose a narrow path
   exclusion (`FILTER_REGEX_EXCLUDE: "(^|/)data/"` in `.github/workflows/super-linter.yml`) rather than
   reformatting the audited vendored payload or reworking canonical scripture, so `data/**` is no longer run
   through the code formatters/spell-checker. The recorded cost (a change touching only `data/` leaves those
   categories vacuous) and the substitute checks of record are stated in D29. A third red category,
   `PYTHON_MYPY`, was a genuine finding in a new file and was fixed in `5079fdc`, not exempted.
7. **`make parity-live` was not run** and no claim is made about it; it drives the *deployed* origin, which
   will not carry this change until after merge and the Pages rebuild.

## STOP

Per the packet's stop condition: H2B is implemented, validated and handed off. No Ruhi research begun, no
third collection added.
