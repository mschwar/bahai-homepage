# Repo Map — classification of every meaningful component

**Method:** file inventory + `git log` origin tracing + live-site verification. Status legend:
**CURRENT** = production/actively used · **SUPPORT** = tooling that serves a current artifact ·
**EXPERIMENTAL** = built, deployed-but-unlinked / not integrated · **STALE** = abandoned or
superseded · **UNKNOWN** = cannot classify from available evidence.

## Root files

| Path | What it is | Why it exists | Dependents | Status |
|---|---|---|---|---|
| `index.html` | The live homepage (single jumbotron + scroll sections) | Core product | GH Pages (`index` at `/`) | **CURRENT** |
| `css/style.css` | Homepage styles + theme modes | Core product | `index.html` | **CURRENT** |
| `js/script.js` | Quote fetch/select/cache, theme, copy, yesterday, Badíʿ wiring, a11y | Core product | `index.html` | **CURRENT** |
| `js/badi-init.js` | Badíʿ calendar init wrapper (timeout + graceful failure) | Badíʿ date feature | `index.html` | **CURRENT** |
| `wallpaper.html` | Standalone React wallpaper generator app | Ambient "same verse, as iPhone wallpaper" extension | **nothing** (not linked from `index.html`) | **EXPERIMENTAL** |
| `wallpaper.css` | Wallpaper app styles | `wallpaper.html` | — | **EXPERIMENTAL** |
| `Makefile` | `make validate` → `scripts/validate_quotes.py` | Hygiene | dev workflow | **SUPPORT/CURRENT** |
| `README.md` | Project overview + run/update instructions | Docs | humans/agents | **CURRENT** (incomplete — omits wallpaper/widget/CI/residue) |
| `PROJECT_ROADMAP.md` | June-2025 aspirational roadmap | Original vision | **nothing** (never updated past 06-07) | **STALE** |
| `AUDIT_NOTES.md` | 2026-01-31 reliability/a11y audit record | Archive of that audit | docs | **SUPPORT/STALE-by-nature** (historical record) |
| `CONTRIBUTING.md` | Contributor guide | Governance | dev workflow | **CURRENT** |
| `SECURITY.md` | Security policy (static site, no backend) | Governance | humans | **CURRENT** |
| `LICENSE` | License (MIT-style header; see file) | Governance | legal | **CURRENT** |
| `Updates.md` | Brief changelog: added Gregorian date, design from "Splode's sensible words" template | Historical note | docs | **STALE** (one entry, incomplete history) |
| `START_HOMEPAGE_RETROFIT.md` | Phase 0 entry pointer (installed by retrofit seed) | Agent-first retrofit gate | — | **SUPPORT** (seed) |
| `.nojekyll` | Tells GH Pages to serve source untouched | Deployment requirement | GH Pages | **CURRENT** |
| `.gitignore` | Ignores `.DS_Store`, `.obsidian/`, pycache, venv, node_modules, parcel | Hygiene | dev | **CURRENT** |

## Directories

| Path | Contents | Dependents | Status |
|---|---|---|---|
| `css/` | `style.css`, `wallpaper.css` | index / wallpaper | CURRENT + EXPERIMENTAL |
| `js/` | `script.js`, `badi-init.js`, `wallpaper.js` | index / wallpaper | CURRENT + EXPERIMENTAL |
| `data/` | `quotes_hidden_words.json` (loaded), `quotes.json`, `quotes_dhammapada.json`, `quotes_gita_arnold.json`, `quotes_kjv_bible.json` | only hidden-words loaded by JS | see DATA map |
| `assets`-equivalent `img/` | `favicon.png`, `downArrow-01.png` | index/theme | **CURRENT** |
| `ios/widget/` | `DailyVerseWidget.swift`, `QuoteStore.swift`, `quotes_hidden_words.json` (copy) | nothing in-repo (no `.xcodeproj`) | **EXPERIMENTAL** |
| `scripts/` | `scrape_hidden_words.py`, `scrape_dhammapada_pg.py`, `scrape_gita_arnold_pg.py`, `scrape_kjv_bible_pg.py`, `validate_quotes.py` | hidden-words → live corpus; others → abandoned datasets; validate → hygiene | **SUPPORT** (hidden_words+validate) / **STALE** (other 3) |
| `.github/workflows/` | `super-linter.yml` (GitHub Super Linter on push/PR to `main`) | CI | **CURRENT** |
| `bootstrap/seed/2026-09-10-homepage-retrofit/` | This retrofit seed (docs + Phase 0 prompt) | Agent-first retrofit | **SUPPORT** (seed) |
| `docs/audit/2026-09-10/` | This audit output set | Phase 0 deliverable | **SUPPORT** (new) |
| `.venv/` | Python virtualenv (gitignored, local only) | local dev scrape/validate | local |

## External runtime dependencies (client-side, from source)

- Google Fonts `Source Sans Pro` / `Source Serif Pro` (index + wallpaper) — internet required for styled rendering; text still renders with fallback fonts offline.
- `https://wondrous-badi.today/scripts/BadiDateToday.v1.js` (Badíʿ date library by Glen Little) — loaded `defer`; code has 4 s timeout + graceful fallback.
- React 18 + ReactDOM via `unpkg.com` — **only** in `wallpaper.html`.

## Blanks to call out (things that do **not** exist)

- No `AGENTS.md`, no `.cursorrules`/`.claude`/agent contract.
- No build system, no package manifest (`package.json`/`pyproject.toml`) — Python scrapers use plain stdlib + `requests`/`bs4`/`lxml`, `make validate` calls `python`.
- No tests beyond `scripts/validate_quotes.py`.
- No XML/Xcode project for the iOS widget.
- No ADRs, no changelog, no release/tag history (`git tag` = empty).