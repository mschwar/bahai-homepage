# Owner Decisions — Answers to `HANDOFF.md` §8

**Decided:** 2026-09-10, at the Phase 0 human review gate.
**Decided by:** repo owner (mschwar), recorded by the review agent.
**Effect:** these answers are binding input for the Phase 1 packet
(`bootstrap/packets/2026-09-10-phase1-agent-first-retrofit/`). Executors must not re-litigate them.

---

## Q1 — Wallpaper & iOS widget fate → **KEEP BOTH AS EXPERIMENTAL (document + link)**

**Answer:** Keep `wallpaper.html` / `js/wallpaper.js` / `css/wallpaper.css` and `ios/widget/*.swift` in
place. Document them as **ambient experimental surfaces** and link their locations (live URLs) from the
canonical docs. No code change, no deletion, no Xcode project invented.

**Why:** both are unlinked-but-live (`/wallpaper.html` → HTTP 200, verified) and share the same daily verse;
they are harmless as long as a cold-start agent can tell they are experimental and out of the parity path.
Deleting them destroys in-flight intent; building them out is unjustified churn.

**Boundary recorded for executors:** "link them" in docs = list the live URLs + status in `README.md` /
`AGENTS.md`. **Do not edit `index.html`** to add an on-page link in H1 — that is a user-visible production
change and, if wanted, is a separate owner-visible unit with screenshot evidence (see `QUEUE_SEED.md` · H1.10).

**Consequence:** the widget remains **not buildable in-repo** (no `.xcodeproj`); docs must say so explicitly
so no agent claims to have built/tested it.

---

## Q2 — Orphaned multi-faith data + scrapers + root `quotes.json` → **UNPUBLISH, KEEP IN GIT**

**Answer:** Stop *serving* them; keep the bytes in git. Delete from the published `main` tree and retain them
on a pushed, never-merged, never-published branch (`archive/legacy-multifaith`).

**In scope for removal from `main`:**

| Path | Size | Evidence it is unreferenced |
|---|---|---|
| `data/quotes_kjv_bible.json` | 9.6 MB (24,930 recs) | served live: `/data/quotes_kjv_bible.json` → 200, 10,023,950 B |
| `data/quotes_dhammapada.json` | 116 KB | no code reference |
| `data/quotes_gita_arnold.json` | 200 KB | no code reference |
| `data/quotes.json` | 889 B | no code reference |
| `scripts/scrape_kjv_bible_pg.py` | — | scraper for the dead feature |
| `scripts/scrape_dhammapada_pg.py` | — | scraper for the dead feature |
| `scripts/scrape_gita_arnold_pg.py` | — | scraper for the dead feature |

**Explicitly KEPT:** `data/quotes_hidden_words.json`, `scripts/scrape_hidden_words.py`,
`scripts/validate_quotes.py`, `ios/widget/quotes_hidden_words.json`.

**Mechanism correction (important — the naive plan does not work):** GitHub Pages for this repo is
`build_type: legacy`, `source: {branch: main, path: /}` (verified via the Pages API). Pages serves the whole
branch, and `.nojekyll` disables the Jekyll ignore rules — so **moving the files into a repo subdirectory
such as `archive/` would NOT unpublish them**. The only mechanism that actually stops serving is
**removal from `main`**. Retention then comes from a pushed archive branch, not a directory.

**Restoration is one command** (recorded in `docs/DECISIONS.md` and the archive branch README):

```
git checkout archive/legacy-multifaith -- data/quotes_kjv_bible.json data/quotes_dhammapada.json \
  data/quotes_gita_arnold.json data/quotes.json scripts/scrape_kjv_bible_pg.py \
  scripts/scrape_dhammapada_pg.py scripts/scrape_gita_arnold_pg.py
```

**Why this shape:** it satisfies both constraints at once — the ~10 MB dead-provenance payload leaves the
*served* surface (GHG/dead-weight win, no abandoned multi-faith direction visible to the public), and the
bytes are recoverable without archaeology. Nothing is destroyed; git history also retains every version.

**Hard gate on evidence:** if `/data/quotes_kjv_bible.json` still returns 200 fifteen minutes after the push
(Pages rebuild + CDN cache), the unit is **NOT done** — report it, do not claim success, do not delete the
archive branch.

**Do NOT resurrect multi-faith integration.** Archiving is preservation, not a roadmap step.

---

## Q3 — `PROJECT_ROADMAP.md` → **ARCHIVE, DO NOT REWRITE IN PLACE**

**Answer:** Move it to `docs/history/2025-06-roadmap.md` under a "SUPERSEDED — historical only" banner;
same for `Updates.md`. The doctrine-aligned *current* plan lives in the new `README.md` + `docs/queue.md` +
`docs/DECISIONS.md`, i.e. the roadmap is replaced by the queue + doctrine, not by a new roadmap document.

**Why:** the file is not merely stale, it is *actively misleading* (`TECH_DEBT_AND_RISKS.md` #5 — it presents
the abandoned multi-faith sprint as current intent). Preserving it under `docs/history/` keeps the historical
record honest; leaving no live doc asserting the aborted direction is the actual fix. Creating a second
"roadmap" alongside a queue would be duplicate authority — rejected.

---

## Q4 — Ruhi Book 1 (`R1`) → **STAYS BLOCKED; NO REVIEW SCHEDULED**

**Answer:** `R1` remains **BLOCKED** with no timeline. It stays blocked behind (a) H2B's collection contract
and (b) a rights/provenance review. Confirmed: it is **not** "all 71 direct quotes in Book 1", and **no Ruhi
data exists in this repo** (correctly absent).

**Why:** the contract that would consume the export does not exist yet, so a rights review now would have no
acceptance target. The gate is generated by H2B, not by a date.

**Standing rule recorded in the ledger:** provenance / copyright / canonical-text / curation questions are
**human-judgment research tasks**; contract + code are **agent-executable**. R1 is research and therefore
never agent-completable on its own.

---

## Q5 — `AGENTS.md` writability → **NO WORKAROUND NEEDED; CREATE IT DIRECTLY**

**Answer:** `AGENTS.md` **can** be created normally in this repo — the README-appendix + manual-step fallback
is **not required**. Verified by probe on this host: writing `AGENTS.md` at the repo root returned exit 0,
the file existed, and it was removed again (probe left no trace; `git status` clean).

**Consequence for H1:** deliver a real root `AGENTS.md`. If a future runtime *does* block the write, the
executor must fall back to the README appendix + manual step **and say so explicitly** in the handoff — it
must never silently skip the contract.

---

## Ledger entries these answers create (to be committed by H1)

| ID | Decision | Status |
|---|---|---|
| D1 | Product is the minimalist single-passage Hidden Words daily-verse homepage; doctrine reconstructed in `PRODUCT_DOCTRINE_RECONSTRUCTION.md` is canonical. | accepted |
| D2 | Multi-faith direction (Dhammapada/Gita/KJV) is **abandoned** — do not resurrect. | accepted |
| D3 | Wallpaper + iOS widget are **experimental ambient surfaces**: documented + doc-linked, not on the parity path. | accepted (Q1) |
| D4 | Orphaned multi-faith data + its 3 scrapers + root `data/quotes.json`: **unpublished from `main`, retained on `archive/legacy-multifaith`**. | accepted (Q2) |
| D5 | `PROJECT_ROADMAP.md` + `Updates.md` **archived to `docs/history/`** as superseded; queue + doctrine replace them as forward plan. | accepted (Q3) |
| D6 | Ruhi Book 1 (`R1`) **stays BLOCKED** pending H2B contract + rights review; not a date-driven gate. | accepted (Q4) |
| D7 | `AGENTS.md` is the agent contract and is creatable in-repo (probe verified). | accepted (Q5) |
| D8 | Live homepage behavior is frozen for H1: `index.html`, `css/*`, `js/*`, `data/quotes_hidden_words.json`, `ios/widget/*` must be byte-identical at H1 close. | accepted |
