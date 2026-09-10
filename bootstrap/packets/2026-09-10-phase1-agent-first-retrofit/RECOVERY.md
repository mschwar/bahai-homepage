# Recovery — Phase 1 · H1

## If the executor edits production assets

`index.html`, `css/*`, `js/*`, `data/quotes_hidden_words.json`, or `ios/widget/*` changed:
**stop immediately**, do not commit, `git checkout -- <paths>` (or `git restore` from the H1 base commit),
re-verify the baseline hashes, and report the drift. H1's entire value is that the product is untouched; a
"small" improvement folded in is still a scope violation.

## If live and repo diverge

If the live file hash already differs from the repo before H1 starts, or diverges after the push for reasons
unrelated to H1: treat it as a **deployment-state finding**. Do not "fix" it by editing the site, and do not
tune the repo to match the live site. Record both hashes, timestamps, and the URL, then report.

## If the orphaned endpoint is still HTTP 200 after the push

GitHub Pages rebuild + CDN caching can lag. Wait, re-curl with a cache-busting query
(`?v=$(date +%s)`) and check the Pages API build status. If it is still 200 fifteen minutes after the push:
mark gate 9 **OPEN**, report the exact curl output, and **keep `archive/legacy-multifaith`** — do not escalate
to a hard delete to force the outcome.

## If `make` or the toolchain misbehaves

`make validate` currently fails via pyenv's bare-`python` shadowing. If the fix (`PYTHON ?= python3`) does not
make it green on this host, report the actual error rather than adding a workaround that hides it — a Makefile
that "works" by depending on an unavailable interpreter is worse than one that fails loudly.

## If the archive branch cannot be pushed

Fall back to the git-history-only form: commit the removal on `main` and record, in `docs/DECISIONS.md`, the
exact restoring commit SHA (`git show <sha>:data/quotes_kjv_bible.json`). Files are then retained by history
alone. State this fallback explicitly in the handoff as a deviation from `OWNER_DECISIONS.md` Q2's mechanism
(the *policy* — unpublished but retained — is unchanged).

## If a write to `AGENTS.md` is blocked

Writing works in this repo (probe verified). If a runtime ever blocks it: land the file's full text verbatim as
a README appendix, add an explicit manual step to create the file, and say so in the handoff. Never silently
skip the agent contract, and never invent a third location for it.

## If the executor finishes the docs and wants to keep going

That is the expected failure mode. H2A (parity tests) and H2B (collection contract) require their own
authorization; R1 requires a human rights/provenance review. Stop at `PHASE1_HANDOFF.md`, push, and report.
