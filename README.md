# Bahá’í Daily Homepage

A minimalist personal homepage that displays the current Badíʿ date and a daily selection from *The Hidden Words* by Bahá’u’lláh. It is designed to support spiritual reflection and a centered start to digital interactions.

## Live demo

https://mschwar.github.io/bahai-homepage/

## Key features

- Daily verse from *The Hidden Words*
- Badíʿ date display (sunset-accurate when location is available)
- Deterministic daily selection (no randomness)
- Lightweight static site (HTML/CSS/JS + JSON)

## Run locally

Use a simple static server (do not use `file://`):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Daily selection logic

1. The quotes JSON is fetched and filtered by the `MAX_QUOTE_WORDS` limit in `js/script.js`.
2. The remaining list is indexed by the Gregorian day-of-year (`1–366`), using a modulo on the list length.
3. The selected quote is cached in `localStorage` keyed by:
   - the local date (`YYYY-MM-DD`), and
   - the Badíʿ day key if available.
4. Cached content renders immediately, then refreshes in the background.

## Location behavior (Badíʿ date)

- If location permission is granted, the Badíʿ date is calculated using sunset-aware rules.
- If location is denied or unavailable, the site shows a clear message and continues to display the Gregorian date.
- Daily verses are not blocked by the Badíʿ date calculation.

## Update quotes data

Install dependencies:

```bash
pip install requests beautifulsoup4 lxml
```

Run the scraper:

```bash
python scripts/scrape_hidden_words.py
```

Validate the JSON:

```bash
make validate
```

## Project structure

- `index.html` – page structure
- `css/style.css` – styles
- `js/script.js` – quote selection, caching, and UI logic
- `js/badi-init.js` – Badíʿ date initialization
- `data/quotes_hidden_words.json` – cached quotes

## Acknowledgements

The Badíʿ date functionality uses `BadiDateToday.js` by Glen Little.
