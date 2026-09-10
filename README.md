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

- `docs/audit/2026-09-10/` — the Phase 0 archaeology audit (orientation).
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
