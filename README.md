# Bahá’í Daily Homepage

**Live:** <https://mschwar.github.io/bahai-homepage/>

A quiet, deterministic, **single-passage** daily-sacred-verse homepage: one Hidden Words passage per
Gregorian day-of-year (drawn from the ≤75-word subset of the corpus), the Badíʿ date (location/sunset-aware
when the browser permits, degrading gracefully when it does not), a light "Yesterday" recall, click-to-copy,
and a persistent dark/light theme. It is static and client-side only, deployed on GitHub Pages, with
**no backend, database, build step, auth, or runtime AI**.

The product's job, in one line: *make encountering the Creative Word an ordinary, quiet part of opening a
device* — without adding cognitive weight.

Source of this doctrine: `docs/audit/2026-09-10/PRODUCT_DOCTRINE_RECONSTRUCTION.md` (reconstructed from
behavior + history, then tested against the seed doctrine claim by claim).

---

## Must-not-change invariants

These are the product. Changing them is a product change, not a refactor:

- **One passage, not a feed.** Today's verse is the hero; "Yesterday" is an opt-in reveal. No dashboard,
  no settings drawer, no timeline.
- **Selection is deterministic** — `quotes[dayOfYear % len]` over the ≤75-word subset. No randomness, and
  "today's verse" is stable across reloads.
- **Frozen files.** `index.html`, `css/*`, `js/*`, `data/quotes_hidden_words.json` and `ios/widget/*` are
  byte-identical to the last accepted release. Do not "tidy" working code.
- **No framework, no build system, no bundler, no runtime dependency** may be added to the served site.
- **Single `main` branch, and the whole branch is publicly served** (see *Deploy*).

The full agent-facing contract is `AGENTS.md`.

---

## Structure — three status bands

### Current / production

| Path | Role |
|---|---|
| `index.html` | Page structure (today jumbotron, date panel, yesterday jumbotron) |
| `css/style.css` | Styles, light/dark themes, reduced-motion handling |
| `js/script.js` | Corpus fetch, day-of-year selection, caching, copy, theme, yesterday |
| `js/badi-init.js` | Badíʿ date initialisation (4 s timeout, graceful degradation) |
| `data/quotes_hidden_words.json` | The live corpus — 153 passages, `{text, source, author}` |
| `scripts/validate_quotes.py` | Data-shape validator (the only automated check today) |
| `scripts/scrape_hidden_words.py` | Regenerates the corpus from bahai.org (dev-only tool) |
| `.github/workflows/super-linter.yml` | Super Linter v4 on push/PR to `main` — hygiene only, does not gate or deploy |
| `.nojekyll` | Required so Pages serves the raw JSON/JS without Jekyll processing |

### Experimental ambient surfaces (unlinked, off the parity path)

| Surface | Live URL | Status |
|---|---|---|
| Wallpaper generator | <https://mschwar.github.io/bahai-homepage/wallpaper.html> | `wallpaper.html` + `css/wallpaper.css` + `js/wallpaper.js`; React 18 via `unpkg.com`; deployed but **not linked from `index.html`** |
| iOS widget | — | `ios/widget/*.swift` + a bundled corpus copy; **source only, no `.xcodeproj`, not buildable in-repo** |

Both surface the *same* daily verse on other surfaces. Neither is on the parity path.

### Archived / historical

| Path | What it is |
|---|---|
| `docs/history/*` | Superseded docs, kept for the record (`PROJECT_ROADMAP.md`, `Updates.md`) |
| `docs/audit/2026-09-10/*` | The Phase 0 archaeology audit |
| `bootstrap/*` | The immutable retrofit seed + the Phase 1 execution packet |

---

## Run it

Use a real static server — not `file://` (the page `fetch()`es JSON and needs an origin):

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Validate it

```bash
make validate
# equivalent, explicit:
python3 scripts/validate_quotes.py data/quotes_hidden_words.json
```

Expected output: `Quotes checked: 153` / `Errors: 0` / `Warnings: 0` / `Duplicate texts: 0`.

## Scrapers (dev-only — NOT runtime dependencies)

The site never touches these. They exist so the corpus can be regenerated:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt   # requests, beautifulsoup4, lxml
python3 scripts/scrape_hidden_words.py
python3 scripts/validate_quotes.py data/quotes_hidden_words.json
```

`requirements-dev.txt` pins the scraper toolchain for development only. Nothing the served site references
depends on it.

## Deploy

Push to `main` → GitHub Pages rebuilds (<https://mschwar.github.io/bahai-homepage/>).

**The entire branch is publicly served.** Pages for this repo is `build_type: legacy` with
`source: {branch: main, path: /}`, and `.nojekyll` disables Jekyll's ignore rules — so *anything* committed
to `main` becomes reachable by URL, whether or not the homepage links it. Historically that meant a ~10 MB
abandoned dataset was publicly fetchable. Before committing anything, ask: *do I want this on the public
internet?* If it should be retained but not served, it must live on an archive branch, not in a
subdirectory of `main`.

## Where the truth lives

- `docs/audit/2026-09-10/` — **canonical orientation: the reconstructed state of the repo as of 2026-09-10.**
  Historical, evidence-backed, and *not a live spec* — read it to understand how the product got here.
- `docs/queue.md` — the forward work queue (states, gates, evidence fields).
- `docs/DECISIONS.md` — the decision ledger.
- `docs/RUNBOOK.md` — run / validate / deploy / recovery operational runbook.
- `AGENTS.md` — the agent contract (invariants, commands, autonomy boundary, forbidden list).

## Deferred

Recorded, not scheduled — see `docs/queue.md` for the detail:

- Multi-faith data integration — **abandoned; do not resurrect**.
- Ruhi Book 1 memorization collection (`R1`) — **BLOCKED** behind the collection contract + rights review.
- Font/CDN version pinning.
- Reshaping `ios/widget/` into a real Xcode project.
- Runtime AI, journaling, streaks, recommendation feeds — doctrine non-goals.

## Acknowledgements

The Badíʿ date functionality uses `BadiDateToday.js` by Glen Little
(<https://wondrous-badi.today/scripts/BadiDateToday.v1.js>).

## License

See `LICENSE`.

---

## Appendix A — `AGENTS.md` (requires a one-time manual step)

**Status: fallback in effect.** The Phase 1 packet (owner decision Q5 / `bootstrap/packets/2026-09-10-phase1-agent-first-retrofit/RECOVERY.md`)
specifies that if a runtime blocks writing `AGENTS.md`, the contract's full text must be preserved verbatim
and a manual step added — never silently skipped. That is what happened here: an agent-session write to
`AGENTS.md` is refused by this runtime's protected-agent-instruction-file policy. The contract below is
therefore **not yet a file in the repo**.

**Manual step (human, once, from the repo root):** create `AGENTS.md` and paste in everything between the
`==== BEGIN AGENTS.md ====` and `==== END AGENTS.md ====` markers below. Then delete this appendix section
and commit it as `docs: retire README AGENTS.md appendix now that the file exists`.

Until that step is done, **this appendix is the agent contract.**

==== BEGIN AGENTS.md ====

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
Its path and the `MAX_QUOTE_WORDS = 75` cap are **hard-coded in three places** — `js/script.js`,
`js/wallpaper.js`, `ios/widget/QuoteStore.swift` — and each of those reimplements the same
selection + caching logic. There is **no schema version and no provenance record**, and
`ios/widget/quotes_hidden_words.json` is a byte-identical copy with no regeneration step.

Until the collection contract lands (queue unit `H2B`), changing the corpus means changing all three copies.
Do not pretend the contract exists.

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

==== END AGENTS.md ====
