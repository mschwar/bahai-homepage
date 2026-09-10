# Runbook — run, validate, deploy, recover

Operational companion to `README.md` (product) and `AGENTS.md` (contract). All commands below were executed on
this host on 2026-09-10; the output recorded here is the output they produced.

## 1 · Runtime topology

There is no server-side runtime. Everything happens in the browser:

```
browser ──index.html──▶ data/quotes_hidden_words.json          (fetch, no-store)
   │                    js/script.js  (selection + cache + copy + theme + yesterday)
   ├──▶ https://wondrous-badi.today/scripts/BadiDateToday.v1.js  (Badíʿ date library)
   ├──▶ https://fonts.googleapis.com/... (Source Sans Pro / Source Serif Pro)
   └── (experimental, unlinked) /wallpaper.html ─▶ React 18 UMD (unpkg) ─▶ same corpus
```

| External dependency | Used by | Failure mode |
|---|---|---|
| Google Fonts | `index.html`, `wallpaper.html` | fallback fonts; text stays readable |
| `BadiDateToday.v1.js` (Glen Little) | `js/badi-init.js` | 4 s timeout → "Badíʿ date unavailable" + Gregorian-only; the daily verse is never blocked |
| React 18 / ReactDOM UMD (unpkg) | **only** `wallpaper.html` | wallpaper app does not mount; homepage unaffected |

Reachability spot-check (2026-09-10):

```
fonts.googleapis.com css                        http=200
BadiDateToday.v1.js                             http=200
unpkg react@18 umd                              http=200
live /                                          http=200
```

Browser capabilities the code assumes: `fetch`, `localStorage`, `navigator.clipboard` (with an
`execCommand('copy')` fallback), `CanvasRenderingContext2D` (wallpaper), `matchMedia('prefers-reduced-motion')`.
No transpilation — ES2017-ish source served as authored.

## 2 · Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

**Never use `file://`** — the page `fetch()`es JSON and needs a real origin. Verified:
`http://localhost:8123/` → 200 and `http://localhost:8123/data/quotes_hidden_words.json` → 200.

## 3 · Validate

```bash
make validate                                  # PYTHON defaults to python3
python3 scripts/validate_quotes.py data/quotes_hidden_words.json
```

Expected and observed output:

```
Quotes checked: 153
Errors: 0
Warnings: 0
Duplicate texts: 0
```

`validate_quotes.py` checks only the data shape: list-of-objects, non-empty `text` and `source`, `author`
as a warning, and duplicate texts. **There is no behavioral/UI test yet** — that is the first step of queue
unit `H2A`, and until it exists any JS change is unverified by construction.

## 4 · Regenerate the corpus (dev-only)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt       # requests, beautifulsoup4, lxml — dev-only
python3 scripts/scrape_hidden_words.py
python3 scripts/validate_quotes.py data/quotes_hidden_words.json
```

These dependencies are **not** runtime dependencies of the served site. After regenerating, remember that
`ios/widget/quotes_hidden_words.json` is a separate byte-identical copy with no sync step — regenerating one
does not update the other (`TECH_DEBT_AND_RISKS.md` #4, queue unit `H2B`).

## 5 · Deploy

Deployment **is** `git push` to `main`. GitHub Pages rebuilds from the branch; there is no Actions deploy
step and no build artifact.

```bash
git push origin main
gh api repos/mschwar/bahai-homepage/pages --jq '{status,source,build_type}'
```

Observed Pages configuration (2026-09-10):

```json
{"build_type":"legacy","html_url":"https://mschwar.github.io/bahai-homepage/","https_enforced":true,
 "public":true,"source":{"branch":"main","path":"/"},"status":"built"}
```

**The entire branch is served publicly.** With `build_type: legacy`, source `main` / `/`, and `.nojekyll`
(which disables Jekyll's ignore rules), every committed file becomes fetchable by URL whether or not the
homepage links it. Before pushing, ask whether each new file belongs on the public internet. If it must be
retained but not served, it goes on an `archive/*` branch — **not** into a subdirectory of `main`.

CI is Super Linter v4 on push/PR to `main` (`VALIDATE_ALL_CODEBASE: false`). It is hygiene only: it does not
gate merges and does not deploy.

## 6 · Rollback / recovery

- **Bad doc or tooling commit:** `git revert <sha>` and push. Docs-only changes cannot break the site.
- **Bad change to a frozen file:** `git checkout <last-good-sha> -- index.html css js data/quotes_hidden_words.json`
  then push. The frozen-file sha256s live in `PHASE1_HANDOFF.md` and `docs/DECISIONS.md` (D8).
- **Accidentally published a payload:** delete it from `main` (a subdirectory move unpublishes nothing),
  confirm the live URL 404s with a cache-buster, and keep the bytes on an `archive/*` branch. This is exactly
  what D4/H1C did for the orphaned multi-faith data; the restore command is in `docs/DECISIONS.md` (D4).
- **Pages rebuild lag:** a just-pushed change may stay stale for minutes; re-curl with
  `?v=$(date +%s)` and check `gh api .../pages` → `status` before concluding anything is wrong.

## 7 · Known failure modes

| Symptom | Cause | Handling |
|---|---|---|
| `make validate` → `pyenv: python: command not found` (exit 127/2) | `make` invoked a bare `python`, which on this host resolves to a pyenv shim with no global version | **Fixed in H1**: the Makefile now uses `PYTHON ?= python3` |
| Badíʿ date stuck / blank | location denied, or `BadiDateToday.v1.js` unreachable | by design: 4 s timeout, message, Gregorian-only; the verse still renders |
| Verse does not load | corpus `fetch()` failed | status message + Retry button + cached copy if available |
| Page renders blank or fetch fails | opened via `file://` | serve it over HTTP instead |
| Scraper `ImportError` | dev deps not installed | `pip install -r requirements-dev.txt` in an activated venv |
| Wallpaper page blank | React CDN unreachable | experimental surface; not a product incident |
| iOS widget "won't build" | there is no `.xcodeproj` in the repo | expected — it is source-only (`README.md`, D3) |

## 8 · Data contract reality (until `H2B` lands)

One corpus, `data/quotes_hidden_words.json` (153 records, `{text, source, author}`). The path and the
`MAX_QUOTE_WORDS = 75` cap are hard-coded in **three** places — `js/script.js`, `js/wallpaper.js`,
`ios/widget/QuoteStore.swift` — and each reimplements the same selection/caching logic. No schema version, no
provenance record. Changing the corpus today means changing all three copies. This is honest debt, not a
contract; do not document it as one.
