# archive/legacy-multifaith — retention branch (NEVER MERGE INTO `main`)

This branch exists for **one reason**: to retain the bytes of the abandoned 2025 multi-faith data payload
after it was unpublished from `main`.

## What is here

The abandoned multi-faith direction's data + scrapers, kept exactly as they were on `main` at
`1daf5fd` (the last `main` commit before the removal):

| Path | Size | Records |
|---|---|---|
| `data/quotes_kjv_bible.json` | 10,023,950 B | 24,930 |
| `data/quotes_dhammapada.json` | 116,467 B | 405 |
| `data/quotes_gita_arnold.json` | 204,562 B | 275 |
| `data/quotes.json` | 889 B | 4 |
| `scripts/scrape_kjv_bible_pg.py` | 10,947 B | — |
| `scripts/scrape_dhammapada_pg.py` | 8,546 B | — |
| `scripts/scrape_gita_arnold_pg.py` | 7,690 B | — |

None of these was ever referenced by any code path. They were created in 2025-06 as part of a multi-faith
"settings drawer" vision whose loader was never built. The direction is **abandoned** (decision D2 in
`docs/DECISIONS.md`) — this branch is preservation, not a roadmap step.

## Why a branch and not a directory

GitHub Pages for this repo is `build_type: legacy` with `source: main / /`, and `.nojekyll` disables
Jekyll's ignore rules — **the whole of `main` is publicly served**. Moving these files into an
`archive/` directory *inside `main`* would have left them just as publicly fetchable. Only removal from
`main` actually unpublishes them (decision D4, 2026-09-10).

## Rules

- **Never merge this branch into `main`.** Doing so re-publishes ~10 MB of dead-provenance payload to the
  public web in one commit.
- **Never delete this branch** while the restore path is still referenced by `docs/DECISIONS.md` (D4).
- Restoring is a one-line checkout, not a merge — there is no need to ever merge.

## Restore (from `main`)

```
git checkout archive/legacy-multifaith -- \
  data/quotes_kjv_bible.json data/quotes_dhammapada.json data/quotes_gita_arnold.json data/quotes.json \
  scripts/scrape_kjv_bible_pg.py scripts/scrape_dhammapada_pg.py scripts/scrape_gita_arnold_pg.py
```

Confirm the restored bytes against the baseline sha256s recorded in `PHASE1_HANDOFF.md` (gate 9 evidence).
