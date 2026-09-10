# Contributing

Thanks for considering improvements!

## Run locally

Use a simple static server (do not use `file://`):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Update quotes data

1. Install the pinned dev-only scraper dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

2. Run the scraper:

```bash
python3 scripts/scrape_hidden_words.py
```

3. Validate the JSON:

```bash
make validate
```

These dependencies are **not** runtime dependencies of the served site. See `docs/RUNBOOK.md` §4.

## Pull requests

- Keep changes small and focused.
- Note any behavior changes (especially around location handling and caching).
- Update `README.md` if the behavior or commands change.
