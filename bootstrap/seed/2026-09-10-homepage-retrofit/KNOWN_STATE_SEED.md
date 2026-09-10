# Known State Signals — Must Be Independently Verified

Prior inspection found:

- Current site is a lightweight static HTML/CSS/JS application.
- `js/script.js` loads `data/quotes_hidden_words.json` through a single hard-coded `QUOTES_PATH`.
- Quotes are filtered by a word-count ceiling and selected deterministically from Gregorian day-of-year modulo eligible list length.
- Local caching is keyed by local date and, when available, Badíʿ day key.
- Badíʿ date initialization is location-aware/sunset-aware through an external date library, with graceful failure messaging.
- Current UI includes today’s passage, author/source, copy, Badíʿ date/Gregorian reveal, Yesterday, dark/light theme, retry/error behavior, reduced-motion handling, and accessibility fixes from a 2026 audit.
- Repo also contains wallpaper work, an iOS widget, old multi-faith scraper/datasets, and documentation whose aspirational roadmap may no longer match current intent.
- Historical work included significant visual refinement in June 2025 and reliability/accessibility/caching corrections in January 2026.

The agent must classify every meaningful artifact as production/current, support tooling, experimental, abandoned/stale, data-only, or unknown — with evidence.
