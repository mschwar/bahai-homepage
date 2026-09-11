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

The full agent-facing contract is in **`AGENTS.md`** at the repo root: purpose, must-not-change invariants,
read-first order, commands, data-contract reality, autonomy boundary, and the forbidden/blocked list.

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
| `.github/workflows/super-linter.yml` + `.github/linters/.markdown-lint.yml` | Super Linter on push/PR to `main` — hygiene only, does not gate or deploy (D10) |
| `.nojekyll` | Required so Pages serves the raw JSON/JS without Jekyll processing |

### Experimental ambient surfaces (unlinked, off the parity path)

Neither is linked from `index.html` and neither is on the parity path — **a change to `js/script.js`
has no obligation to propagate to them.** That coupling is queue unit `H2B`'s problem, not a silent
expectation on every future change. After D25 the wallpaper is a lock-screen PNG over the ≤35-word
subset, so its “today” can differ from the homepage’s 75-word today.

| Surface | Live URL | Status |
|---|---|---|
| Lock-screen wallpaper | <https://mschwar.github.io/bahai-homepage/wallpaper.html> | `wallpaper.html` + `css/wallpaper.css` + `js/wallpaper.js`; React 18 from `unpkg.com`; e-ink paper PNG of today’s Hidden Word (≤35 words, D25); pick iPhone size, Download PNG. iOS draws its own clock — the file is blank stock in the top ~40%. **Deployed but unreachable from the homepage.** |
| iOS widget | *(no live URL — source only)* | `ios/widget/DailyVerseWidget.swift`, `ios/widget/QuoteStore.swift` and a bundled corpus copy. WidgetKit + SwiftUI, day-of-year selection, refresh at next midnight. |

**Honest status of the widget:** there is **no `.xcodeproj` / `.xcworkspace` in this repo**, so as committed it
is *source and data only* and **cannot be built or tested in-repo**. Any claim to have "built" or "tested" the
widget is false. `QuoteStore.swift` also duplicates the selection logic and the 75-word cap — the same
three-way duplication described in the agent contract (`AGENTS.md`).

Per owner decision D3 both surfaces are **kept**, not deleted and not built out; deleting them would destroy
in-flight intent, building them out would be unjustified churn. Adding an on-page link to them would edit
`index.html` and is therefore a separate, owner-visible unit (`H1.10` in `docs/queue.md`).

### Archived / historical

| Path | What it is |
|---|---|
| `docs/history/*` | Superseded docs behind a SUPERSEDED banner, kept for the record (`2025-06-roadmap.md`, `2025-06-updates.md`, `AUDIT_NOTES.md`, `HANDOFF.md`, `PHASE1_HANDOFF.md`) — see *Where the truth lives* |
| `docs/audit/2026-09-10/*` | The Phase 0 archaeology audit |
| `bootstrap/*` | The immutable retrofit seed + the Phase 1 execution packet |
| `START_HOMEPAGE_RETROFIT.md` | The bootstrap entry pointer (spent) — classified in *Where the truth lives* |

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
- `docs/queue.md` — the forward work queue (states, gates, evidence fields), including the open units in
  execution order.
- `docs/DECISIONS.md` — the decision ledger (append-only).
- `docs/RUNBOOK.md` — run / validate / deploy / recovery operational runbook.
- `AGENTS.md` — the agent contract (invariants, commands, data contract, autonomy boundary, forbidden list).
- `docs/history/` — superseded records behind a SUPERSEDED banner. Historical only; never guidance.

### The root markdown map — every root `.md` has exactly one status

Eight `.md` files sit at the repository root, and each is one of **live**, **bootstrap** or **historical** (queue
unit `C2`, decision `D14`). Nothing at the root is undeclared. The three historical files were moved with
`git mv` behind a SUPERSEDED banner (the D5 mechanism): nothing was deleted, and no frozen file was touched.

| File (current path) | Status | Why it sits where it does |
|---|---|---|
| `README.md` | **live** | Product doctrine — the first thing to read. |
| `AGENTS.md` | **live** | The agent contract; the README's binding counterpart. |
| `CONTRIBUTING.md` | **live** | GitHub reads `CONTRIBUTING.md` **only** at the repository root, so moving it would silently disable the contributing prompt. |
| `SECURITY.md` | **live** | The same root-only rule governs GitHub's security-policy discovery. |
| `START_HOMEPAGE_RETROFIT.md` | **bootstrap** | The retrofit seed's entry pointer. Its "first authorized task" is the executed Phase 0 archaeology prompt, so it is spent — it stays at the root as the bootstrap chain's first read, not as guidance. |
| `docs/history/AUDIT_NOTES.md` | **historical** | The 2026-01-31 reliability/a11y audit record, superseded by `docs/audit/2026-09-10/`. |
| `docs/history/HANDOFF.md` | **historical** | The Phase 0 repo-archaeology closeout; its §8 owner questions were answered in `OWNER_DECISIONS.md`. |
| `docs/history/PHASE1_HANDOFF.md` | **historical** | The Phase 1 / H1 closeout and its per-gate evidence — a record of a closed phase, not a live spec. |

`bootstrap/*` and `docs/audit/2026-09-10/*` are the immutable packet and the dated snapshot: historical by
construction, and never rewritten in place.

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
