# Runbook — run, validate, deploy, recover

Operational companion to `README.md` (product) and `AGENTS.md` (the agent contract). All commands below were executed on
this host on 2026-09-10; the output recorded here is the output they produced.

## 1 · Runtime topology

There is no server-side runtime. Everything happens in the browser:

```text
browser ──index.html──▶ data/quotes_hidden_words.json          (fetch, no-store)
   │                    js/quote-core.js (selection + caching, shared)
   │                    js/script.js  (render + copy + theme + yesterday)
   ├──▶ https://wondrous-badi.today/scripts/BadiDateToday.v1.js  (Badíʿ date library)
   ├──▶ https://fonts.googleapis.com/... (Source Sans Pro / Source Serif Pro)
   └── (experimental, unlinked) /wallpaper.html ─▶ React 18 UMD (unpkg) ─▶ js/quote-core.js ─▶ same corpus
```

| External dependency | Used by | Failure mode |
|---|---|---|
| Google Fonts | `index.html`, `wallpaper.html` | fallback fonts; text stays readable |
| `BadiDateToday.v1.js` (Glen Little) | `js/badi-init.js` | 4 s timeout → "Badíʿ date unavailable" + Gregorian-only; the daily verse is never blocked |
| React 18 / ReactDOM UMD (unpkg) | **only** `wallpaper.html` | wallpaper app does not mount; homepage unaffected |

Reachability spot-check (2026-09-10):

```text
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

```text
Quotes checked: 153
Errors: 0
Warnings: 0
Duplicate texts: 0
```

`validate_quotes.py` checks only the data shape: list-of-objects, non-empty `text` and `source`, `author`
as a warning, and duplicate texts. It says nothing about behavior.

### 3.1 · Parity (behavioral) check — `make parity`

The behavioral proof of record. It drives the **real** page in headless Chromium (Playwright) and pins
selection, today/yesterday, caching, theme, the Badíʿ fallback, clipboard copy and reduced-motion. A JS
change is unverified by construction until this is green.

```bash
make parity                 # alias: node tests/parity.mjs
```

Expected: `== RESULT: 18 passed, 0 failed ==` and exit code 0. Dev-only: needs the global `playwright` +
its bundled Chromium (`npx playwright install chromium`); it adds no manifest and touches no frozen file.
**Any change to `js/*`, `index.html` or the corpus must show this green *before* and *after*.**

**Run-record format.** A recorded run is a plain-text file under `docs/audit/<date>/` with this exact header
block, followed by the verbatim command output:

```text
command: <the command run>
cwd: <absolute working directory>
date: <ISO-8601 UTC timestamp>
playwright: <version>
node: <version>
=== raw output ===
<verbatim stdout, including the == RESULT line ==>
```

Record the run as produced — do not tidy, trim or re-wrap it. The `== RESULT` line is the evidence; a run
recorded without it proves nothing.

#### `make parity-live` — the deployed path

`make parity` is hermetic by construction: it blocks `wondrous-badi.today`, `fonts.googleapis.com` and
`fonts.gstatic.com` so selection and cache keys are reproducible. The cost of that determinism is that the
**deployed** path — real HTTPS, the real vendor library, the real CDN, the browser's real security rules —
had no automated coverage, which is why queue candidate `C9` (the Badíʿ date falling back on the live site)
was invisible to the suite.

```bash
make parity-live            # alias: node tests/parity-live.mjs
```

It drives `https://mschwar.github.io/bahai-homepage/` and asserts only the unambiguous things: the homepage
reaches a settled state, the rendered verse equals the selection oracle computed from the **local** corpus
for the **real current date**, `window.QuoteCore` exposes its expected exports, and no uncaught page error
occurred. It **reports** — never asserts — whether `#badiDate` settled to `RESOLVED` or `FALLBACK` with the
reason observed, the resolved label's exact `innerHTML` when there is one, and every console error and
failed request with its URL. `C9` is OPEN, so asserting the resolved outcome would leave this red for a
reason nobody has adjudicated yet.

Expected shape of a healthy run: `== RESULT: 4 passed, 0 failed, 3 reported ==`. **Network-dependent:** it
is expected to be flaky-on-outage, and it is deliberately **not** part of `make parity`, so a live failure
can never make the hermetic suite intermittently red. **Run it after any deploy.** Two further modes exist
to help adjudicate `C9`: `node tests/parity-live.mjs --geolocation` (grant geolocation at a fixed
coordinate) and the same command with `--no-coords` (permission granted, no position supplied).

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

CI is Super Linter on push/PR to `main`, at `super-linter/super-linter@v8.7.0` pinned by commit SHA, linting
only the files a change touches (`VALIDATE_ALL_CODEBASE: false`). It is hygiene only: it does not gate merges
and does not deploy. Both actions are SHA-pinned because the job runs the `zizmor` audit, which fails on
unpinned uses; `.github/dependabot.yml` keeps those pins fresh (monthly, with a cooldown). What the categories
mean here, and which ones are off, is recorded in `docs/DECISIONS.md` D10 and D12 — in short: markdownlint,
YAML, secrets, spelling and workflow security are on; the natural-language style glossary, the formatters that
would rewrite frozen product files or append-only records, and the four checks that target the served site
(`HTML`, `HTML_PRETTIER`, `JAVASCRIPT_ES`, `JAVASCRIPT_PRETTIER`) are off.

**The served site is not linted — `make parity` is its check of record.** The four checks above were turned
off on 2026-09-10 (queue `C8`, decision D12) because they run with super-linter's default config, which this
repository has never adopted, and their only targets are frozen product files. Before that, they had never
actually run: `VALIDATE_ALL_CODEBASE: false` lints only the changed set, and no change had ever included
`index.html` or `js/*`, so their `pass` was vacuous until the first product-file change exposed them. Do not
read a green lint as evidence about the site. `make parity` and `make validate` are that evidence.

**Where lint coverage actually comes from — read the log, not the badge.** The job can report `success` having
checked nothing: two Super Linter **v4** runs on `main` did exactly that — merge commits created locally with
`git merge --no-ff` and pushed (`No files were found in the GITHUB_WORKSPACE to lint!`, runs `34525756201` and
`34526018773`) — which is how a red lint failure went unnoticed for three commits. That behaviour does not
reproduce on **v8**: a merge commit created by GitHub's PR merge named its eight files (run `34528829696`), and
the **local `git merge --no-ff` + push** path was retested on 2026-09-10 (`1ea76c5`, run `34531596264`) and
named the two files it read. No landing path in use here is currently known to lint nothing. Keep reading the
log rather than the badge when coverage matters — confirm the run names your files (queue `C3`, closed on that
evidence).

A red run is a defect to fix, not noise to scroll past. Between the Phase 0 audit and the H1 handoff this job
failed on three consecutive doc commits and nobody noticed, because the docs said it was "hygiene only". If it
is red, either fix the finding or change this configuration on purpose and record why.

**Expected noise, not a failure:** the log ends with `Failed to call GitHub API (…/issues/<n>/comments) … 403`
and `Error while posting pull request summary`. That is the summary *comment* failing because the job
deliberately does not hold `pull-requests: write`; every per-linter result still appears as its own status
check on the PR.

## 6 · Rollback / recovery

- **Bad doc or tooling commit:** `git revert <sha>` and push. Docs-only changes cannot break the site.
- **Bad change to a frozen file:** `git checkout <last-good-sha> -- index.html css js data/quotes_hidden_words.json`
  then push. The frozen-file sha256s live in `docs/history/PHASE1_HANDOFF.md` (H1 baseline) and `docs/DECISIONS.md`
  (**D8** for the H1 baseline, **D11** for the H2A refactor baseline and the authority that superseded it).
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
| CI fails on "Incorrect usage of the term: repo → repository" | `VALIDATE_NATURAL_LANGUAGE` was turned back on; textlint's `terminology` glossary disagrees with this repo's vocabulary | turn it off again — it is off on purpose (D10) |

## 8 · Data contract reality (until `H2B` lands)

One corpus, `data/quotes_hidden_words.json` (153 records, `{text, source, author}`). The path and the
`MAX_QUOTE_WORDS = 75` cap now live in **two** places: `js/quote-core.js` (the single JS source of truth
shared by `index.html` and `wallpaper.html` after H2A) and `ios/widget/QuoteStore.swift` (a Swift
reimplementation, deliberately not unified — see queue `H2A`/`H2B`). No schema version, no provenance
record. Changing the corpus today means changing the JS core and the Swift copy. This is honest debt, not a
contract; do not document it as one.
