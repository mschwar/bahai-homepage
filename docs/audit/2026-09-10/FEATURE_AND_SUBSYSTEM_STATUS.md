# Feature & Subsystem Status

Each meaningful subsystem: current status + evidence. Observation vs interpretation vs proposed
change is kept distinct.

## Homepage core (production/current)
- **Surface:** `index.html`, `css/style.css`, `js/script.js`.
- **What it does (observed in source):** loads `data/quotes_hidden_words.json` via hard-coded
  `QUOTES_PATH`; filters to `MAX_QUOTE_WORDS = 75`; picks quote `quotes[dayOfYear % len]` for today and
  yesterday; caches in `localStorage` keyed by Gregorian date and (when Badíʿ ready) a Badíʿ-day key;
  renders author/source; whole-quote click + Copy button → clipboard; Yesterday jumbotron reveal;
  Badíʿ-date click/Enter → toggle Gregorian; floating light/dark theme toggle persisted in
  `localStorage['theme']`; status/error message + Retry; `prefers-reduced-motion` respected;
  aria-live/aria-expanded/keyboard handlers.
- **Deployment check (live):** deployed `index.html` size == repo (4701 bytes); title "Daily Sacred
  Verse"; deployed `js/script.js` `QUOTES_PATH = 'data/quotes_hidden_words.json'`. **Live == `main`.**
- **Status:** **CURRENT** — this is the product.

## Badíʿ date (production/current)
- **Surface:** `js/badi-init.js` + external `https://wondrous-badi.today/scripts/BadiDateToday.v1.js`
  (Glen Little). Verified reachable (HTTP 200).
- **Behavior:** location/sunset-aware when permission granted (`BadiDateLocationChoice.askForUserLocation`);
  4 s timeout + `onFailure`; degrades to "Badíʿ date unavailable" + Gregorian-only messaging; Daily verse
  never blocked by it.
- **Status:** **CURRENT** (external-dependency risk — see TECH_DEBT).

## Hidden Words corpus (current data) + its scraper (support tooling)
- **Surface:** `data/quotes_hidden_words.json` (153 records: Arabic + Persian, `{text, source, author}`)
  and `scripts/scrape_hidden_words.py` (scrapes bahai.org Hidden Words page).
- **Verified:** `validate_quotes.py` → 153 checked, 0 errors, 0 warnings, 0 duplicates. Deployed copy
  byte-identical (60,008 = 60,008).
- **153 = 71 Arabic + 82 Persian**, matching the classic Hidden Words partition.
- **Status:** corpus = **CURRENT**; scraper = **SUPPORT** (the only scraper feeding a live dataset).

## Reliability / caching / a11y layer (current)
- localStorage daily-verse cache (Gregorian + Badíʿ-day keys), retry, error status, single `h1`,
  reduced-motion, focus/keyboard handling. Added 2026-01-31, still current.

## Wallpaper app (experimental)
- **Surface:** `wallpaper.html`, `css/wallpaper.css`, `js/wallpaper.js`; loads React 18 + ReactDOM via
  `unpkg.com` CDN.
- **What it does:** pick device size, appearance, font scale, show-author; renders today's Hidden Words
  onto a `<canvas>`; Download PNG + Refresh quote; caches under `dailyWallpaper:`.
- **Dependency / reachability:** **not linked from `index.html`** (grep confirms no cross-link). It is
  reachable at `/wallpaper.html` on the live Pages site (HTTP 200) but a user cannot get there from the homepage.
- **Status:** **EXPERIMENTAL** — deployed-but-unlinked ambient surface. Does not affect the running product.

## iOS widget (experimental)
- **Surface:** `ios/widget/DailyVerseWidget.swift`, `ios/widget/QuoteStore.swift`,
  `ios/widget/quotes_hidden_words.json` (bundle copy). WidgetKit + SwiftUI; families inline/rectangular/small;
  day-of-year deterministic selection; refresh at next midnight.
- **Reality:** **no `.xcodeproj`/`.xcworkspace` scaffold in-repo** → as committed it is source + data only,
  **not buildable in-repo**. `QuoteStore` duplicates the selection logic and the `75`-word cap.
- **Status:** **EXPERIMENTAL** (incomplete surface). Duplicate logic + duplicate JSON = drift risk.

## Old multi-faith datasets + scrapers (abandoned/residue)
- `data/quotes_dhammapada.json` (405, has `tradition`), `data/quotes_gita_arnold.json` (275, richer schema),
  `data/quotes_kjv_bible.json` (24,930, 10,023,950 bytes), `scripts/scrape_dhammapada_pg.py`,
  `scripts/scrape_gita_arnold_pg.py`, `scripts/scrape_kjv_bible_pg.py`.
- **Evidence of abandonment:** no JS/HTML references any of these files (grep confirmed only
  `quotes_hidden_words.json` is fetched); the settings-drawer/loader promised in the roadmap was never
  implemented; the running app is Hidden-Words-only.
- **Status:** **STALE / ABANDONED**. KJV is a 10 MB operational liability in a Pages repo.

## Root `data/quotes.json` (legacy)
- 4-passage starter dataset; **no code references it**. **Status:** **STALE** (historical).

## Validation script (`scripts/validate_quotes.py` + `Makefile validate`) — SUPPORT/CURRENT
- Checks list shape, required `text`/`source`/`author`, duplicate texts. Passes on hidden-words (0
  issues) and on KJV (0 issues). Note: Makefile invokes `python`; on this machine `python3` is required
  (see VALIDATION_EVIDENCE).

## CI — `.github/workflows/super-linter.yml` — CURRENT
- GitHub Super Linter (v4) on push/PR to `main`, `VALIDATE_ALL_CODEBASE: false`. Hygiene only.

## `.nojekyll`, `.gitignore`, docs — CURRENT support
- `.nojekyll` required for GH Pages; `.gitignore` blocks `.DS_Store`/`.obsidian`/venv/node_modules.
- `README.md` documents run + update; **does not cover** wallpaper/widget/CI/multi-faith residue (gap).

## Stale docs (STALE)
- **`PROJECT_ROADMAP.md`**: last touched 2025-06-07; describes the abandoned multi-faith "next sprint";
  never reconciled with 2026 reliability work or the wallpaper/widget experiments. **Contradicts** the
  current minimalist single-source intent. Not a current roadmap.
- **`Updates.md`**: a single historical note; incomplete as a changelog.
- **`AUDIT_NOTES.md`**: accurate archive of the 2026-01-31 audit; historical by design, not stale.