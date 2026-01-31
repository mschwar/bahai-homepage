# Contributing

Thanks for considering improvements!

## Run locally

Use a simple static server (do not use `file://`):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Update quotes data

1. Install scraper dependencies:

```bash
pip install requests beautifulsoup4 lxml
```

2. Run the scraper:

```bash
python scripts/scrape_hidden_words.py
```

3. Validate the JSON:

```bash
make validate
```

## Pull requests

- Keep changes small and focused.
- Note any behavior changes (especially around location handling and caching).
- Update `README.md` if the behavior or commands change.
