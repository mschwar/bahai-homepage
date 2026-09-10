# Work Unit H1C — Unpublish the Orphaned Multi-Faith Payload (owner-approved)

**Gate:** agent-executable **and** explicitly approved by the owner (Q2). **Blocks nothing else** — H1.1–H1.9
can land first. **Reversibility:** required; nothing may be destroyed.

**Owner ruling:** "Move them out of the served root so Pages stops serving them, keep the files in git."

---

## The mechanism (read this before touching anything)

Pages for this repo is `build_type: legacy`, `source: {branch: main, path: /}`, and `.nojekyll` disables
Jekyll's ignore rules. **The whole branch is served.** Therefore:

- Moving the files to `archive/legacy-multifaith/` **inside `main` would still serve them** and satisfies
  nothing. *(This corrects the literal wording of the earlier plan; the policy — unpublished, retained — is
  unchanged. State this correction in the handoff.)*
- The only way to stop serving is **removal from `main`**.

## Steps

1. **Freeze the baseline** for the paths in scope (sha256 + sizes) so the archive is provably lossless:
   `data/quotes_kjv_bible.json`, `data/quotes_dhammapada.json`, `data/quotes_gita_arnold.json`,
   `data/quotes.json`, `scripts/scrape_kjv_bible_pg.py`, `scripts/scrape_dhammapada_pg.py`,
   `scripts/scrape_gita_arnold_pg.py`.
2. **Create the retention branch** from current `main`:
   `git checkout -b archive/legacy-multifaith main`; add `archive/README.md` explaining what this branch is
   (abandoned 2025 multi-faith direction: 3 datasets + 3 scrapers + starter `quotes.json`; unreferenced by any
   code; unpublished from Pages 2026-09-10 per decision D4; restore command below; **never merge this branch
   into main**). Commit and **push it to `origin`** (`git push -u origin archive/legacy-multifaith`).
3. **Verify retention before removal:** on that branch, confirm all 7 paths hash identically to the baseline.
4. **Remove from `main`** (back on `main`): `git rm` exactly those 7 paths — nothing else. Commit:
   `chore: unpublish orphaned multi-faith payload (kept on archive/legacy-multifaith)`.
5. **Confirm nothing referenced them** before/after:
   `grep -rn "quotes_kjv_bible\|quotes_dhammapada\|quotes_gita_arnold\|quotes\.json" --include='*.js' --include='*.html' --include='*.py' --include='*.swift' --include='Makefile' .`
   must show only `scripts/scrape_hidden_words.py`-adjacent hidden-words references and the new archive
   README on the archive branch — never a live code path on `main`.
6. **Push `main`** and wait for the Pages build (`gh api repos/mschwar/bahai-homepage/pages` → `status`).
7. **Verify unpublish, with a cache-buster:**
   `curl -s -o /dev/null -w '%{http_code}\n' -L "https://mschwar.github.io/bahai-homepage/data/quotes_kjv_bible.json?v=$(date +%s)"`
   → expect **404**. Re-check the same endpoint for the two other datasets and `data/quotes.json`.
8. **Verify the product is untouched:** live `index.html` and `data/quotes_hidden_words.json` still **200** and
   sha256-identical to the pre-H1C baseline (gate 2).
9. **Record** in `docs/DECISIONS.md` (D4) and `docs/RUNBOOK.md`: what was unpublished, why, the retention
   branch, and the one-line restore command.

## KEPT — do not remove

`data/quotes_hidden_words.json` (the product corpus), `scripts/scrape_hidden_words.py`,
`scripts/validate_quotes.py`, `ios/widget/*` (including the widget's own byte-identical corpus copy, which is a
separate H2B concern), and everything else in the repo.

## Restore command (record verbatim in D4)

```
git checkout archive/legacy-multifaith -- \
  data/quotes_kjv_bible.json data/quotes_dhammapada.json data/quotes_gita_arnold.json data/quotes.json \
  scripts/scrape_kjv_bible_pg.py scripts/scrape_dhammapada_pg.py scripts/scrape_gita_arnold_pg.py
```

## Evidence required

Baseline hashes · archive-branch hashes (identical) · `git push` output for the branch · the `git rm` commit ·
Pages status · the 404 curl output for each named path · the 200 + matching-hash curl output for the homepage ·
`validate_quotes.py` still 153 / 0 / 0 / 0.

## Failure modes

- **Endpoint still 200 after 15 min** → gate OPEN; report exact output; keep the branch; do **not** escalate to
  a hard delete.
- **Cannot push the branch** → history-only fallback: remove from `main`, record the restoring commit SHA, and
  declare the deviation in `PHASE1_HANDOFF.md` (see `../RECOVERY.md`).
- **Anything outside the 7 named paths is about to be deleted** → stop; the owner approved 7 files, not a cleanup.
