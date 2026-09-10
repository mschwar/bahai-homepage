# PHASE1_HANDOFF — Phase 1 · H1 Agent-First Repo Retrofit (`bahai-homepage`)

**Date:** 2026-09-10 · **Executor:** Hermes home-steward agent (CLI) · **Branch:** `main`
**Base commit:** `3a30b2b` (packet commit) → **Head:** `ebe5b78` (H1C) + this closeout commit · **Authorization:** `bootstrap/packets/2026-09-10-phase1-agent-first-retrofit/01_PROMPT.txt`
**Status:** H1 (H1.1–H1.9) + H1C **EXECUTED**. Ten acceptance gates closed below; **one explicit deviation**
(AGENTS.md delivery — see §4). **STOPPED** as instructed: H2A / H2B / R1 / H3 not begun.

---

## 1 · What changed

Eleven commits on `main`, plus one retention branch. **No production asset was touched** — the freeze (D8)
held, proven by hash in §3 gate 1.

| # | Commit | Unit |
|---|---|---|
| 1 | `docs: rewrite README as canonical cold-start entry` | H1.1 |
| 2 | `docs: add AGENTS.md agent contract (via README appendix fallback)` | H1.2 |
| 3 | `docs: link the 2026-09-10 audit as canonical orientation` | H1.3 |
| 4 | `docs: archive superseded roadmap and updates notes to docs/history` | H1.4 |
| 5 | `docs: land work queue as docs/queue.md` | H1.5 |
| 6 | `docs: add decision ledger docs/DECISIONS.md` | H1.6 |
| 7 | `docs: add operational runbook docs/RUNBOOK.md` | H1.7 |
| 8 | `chore: make validate green on python3 and pin dev-only scraper deps` | H1.8 |
| 9 | `docs: document wallpaper and iOS widget as experimental surfaces` | H1.9 |
| 10 | `docs: add archive branch README explaining retention of the abandoned multi-faith payload` | H1C step 2 (`archive/legacy-multifaith`) |
| 11 | `chore: unpublish orphaned multi-faith payload (kept on archive/legacy-multifaith)` | H1C steps 4–6 |

**Files created:** `docs/queue.md`, `docs/DECISIONS.md`, `docs/RUNBOOK.md`, `docs/history/README.md`,
`docs/history/2025-06-roadmap.md` (moved), `docs/history/2025-06-updates.md` (moved),
`requirements-dev.txt`, `PHASE1_HANDOFF.md`. Plus `archive/README.md` on the archive branch.
**Files modified:** `README.md`, `Makefile`, `HANDOFF.md` (append-only note).
**Files deleted from `main`:** the 7 owner-named paths only (held on the archive branch).
**Branch created and pushed:** `archive/legacy-multifaith` @ `8d0f545` (never merge).

## 2 · Why

The Phase 0 audit (`docs/audit/2026-09-10/`) found that a cold-start agent could not reliably answer *what
this product is, what must not change, how to run/validate it, and what is deferred*: the README omitted the
ambient surfaces and the residue, no `AGENTS.md` or doc index existed, `PROJECT_ROADMAP.md` actively
contradicted the product (it presented the abandoned multi-faith sprint as current intent), there was no queue
semantics, no decision ledger, and `make validate` — the one documented check — was red on this host.

H1 fixes exactly that: canonical entry, agent contract, queue, ledger, runbook, working validation, honest
data-contract documentation, and the owner-approved unpublish of ~10 MB of publicly-served dead payload.

## 3 · Gate evidence (raw command output)

### Gate 1 — Parity, frozen files · **PASS**

```console
$ git diff --stat 3a30b2b..HEAD -- index.html css js data/quotes_hidden_words.json ios/
(no output — empty)
```

```console
$ shasum -a 256 index.html css/style.css js/script.js js/badi-init.js data/quotes_hidden_words.json
0d1a6f0ff7b8b3ff1f715da90e998d3a1949814f7c271814dd5aa69acb0b36c5  index.html
2a08588cc93767af4a82028114bbfc505539085bfadb48b8c5a29e75ebf56de7  css/style.css
11f88eb2bbab951d13bc43502c16b23ba8719284b5e26f0bbd3b79514f4798c8  js/script.js
3bfd20540065efb1e4cfd422cddd11f60a32fa4ea7f371a09bbe0a712502509a  js/badi-init.js
fdcd492d5d0bd1dbf8f7326a81f5da7bd5ba2356c804f392115496e1fefaaea4  data/quotes_hidden_words.json
```

All five match the packet's recorded baseline exactly (`index.html 0d1a6f0f…b36c5`,
`css/style.css 2a08588c…f56de7`, `js/script.js 11f88eb2…9c8c8`, `js/badi-init.js 3bfd2054…2509a`,
`data/quotes_hidden_words.json fdcd492d…aea4`).

### Gate 2 — Parity, live site · **PASS**

```console
$ curl -s -o /tmp/live_index.html -L .../index.html && shasum -a 256 /tmp/live_index.html
http=200 size=4701
0d1a6f0ff7b8b3ff1f715da90e998d3a1949814f7c271814dd5aa69acb0b36c5  /tmp/live_index.html

$ curl -s -o /tmp/live_chw.json -L .../data/quotes_hidden_words.json && shasum -a 256 /tmp/live_chw.json
http=200 size=60008
fdcd492d5d0bd1dbf8f7326a81f5da7bd5ba2356c804f392115496e1fefaaea4  /tmp/live_chw.json
```

Re-run after the H1C push (cache-busted) — identical both times: live `index.html` HTTP 200 with sha256
`0d1a6f0f…b36c5` and live corpus HTTP 200 with sha256 `fdcd492d…aea4`, i.e. **live == repo == baseline**.

### Gate 3 — Orientation exists · **PASS (with deviation — see §4)**

`README.md` is canonical: doctrine, must-not-change invariants, the three status bands (current / experimental
/ archived), exact run and validate commands (all executed in this session), dev-only scraper setup, the
deploy/whole-branch-is-public warning, "where the truth lives", and the deferred list. It links
`docs/audit/2026-09-10/` with an explicit one-line identity (*the reconstructed state of the repo as of
2026-09-10; historical, evidence-backed, not a live spec*).

`AGENTS.md` **as a root file does not exist** — the runtime refused the write (§4). Its full text is present
verbatim in `README.md` **Appendix A** (purpose, must-not-change invariants, read-first order, commands,
honest data-contract note, experimental surfaces, autonomy boundary, forbidden/blocked list, evidence
convention), with a one-time manual step to create the file.

### Gate 4 — No live doc lies · **PASS on substance; literal grep deviation (see §4)**

```console
$ git ls-files 'PROJECT_ROADMAP.md' 'Updates.md'
(no output — both gone from the root)

$ grep -rniE "multi-?faith|multi-?tradition" --include='*.md' . \
    | grep -v -e docs/history -e docs/audit -e bootstrap/
./README.md:130:- Multi-faith data integration — **abandoned; do not resurrect**.
./README.md:227:- **Do not resurrect the multi-faith direction.** The Dhammapada/Gita/KJV datasets are abandoned residue.
./HANDOFF.md:15:*same* daily verse on other devices; the original **multi-faith** vision (Dhammapada/Gita/KJV) was planned and
./HANDOFF.md:32:| Multi-faith datasets + 3 scrapers (Dhammapada/Gita/KJV) | **STALE/ABANDONED** — unreferenced by code (KJV ≈**10 MB/24,930 recs**) |
./HANDOFF.md:34:| `PROJECT_ROADMAP.md`, `Updates.md` | **STALE docs** — assert the abandoned multi-faith plan; never updated past 2025-06-07 |
./HANDOFF.md:39:- `PROJECT_ROADMAP.md` (live doc) claims a **multi-faith settings-drawer sprint** as the current/next direction;
./HANDOFF.md:40:  the actual product is single-corpus Hidden Words and the multi-faith datasets are orphaned. **Doc contradicts
./HANDOFF.md:80:2. **Orphaned multi-faith data (≈10 MB) + 3 scrapers + root `quotes.json`:** OK to **delete / stop serving** on Pages,
./HANDOFF.md:93:multi-faith data + wallpaper/widget decision. Then H2A (parity-first refactor) and H2B (collection/source
./HANDOFF.md:112:2. **Orphaned multi-faith data (≈10 MB) + 3 scrapers + root `quotes.json` → UNPUBLISH, KEEP IN GIT.**
./HANDOFF.md:113:   from `main`, retained on a pushed never-merged `archive/legacy-multifaith` branch.
```

**The substantive requirement is met:** `PROJECT_ROADMAP.md` and `Updates.md` are gone from the root and live
under `docs/history/` under SUPERSEDED banners, and **no remaining repo doc asserts the abandoned direction as
current intent**. Every residual match above is either a *prohibition* ("abandoned; do not resurrect" — the
text that makes D2 binding) or the Phase 0 record (`HANDOFF.md`, whose wording this packet's `SCOPE_AND_GATES`
table requires to be preserved un-rewritten and appended-to only). The literal grep cannot return empty
without deleting the record of the owner's own decision, or rewording the prohibitions so the gate would no
longer detect a real regression. See §4 for the recorded deviation.

### Gate 5 — Queue landed · **PASS**

`docs/queue.md` exists with H1 (`in-progress` + exit gate), H1.10 (`pending`, human), H2A (`pending`, agent),
H2B (`pending`, agent), R1 (**BLOCKED**, human) and H3 (**BLOCKED behind R1**); each carries an explicit
`gate` and an `evidence` field, and R1 names both blocking conditions (H2B's collection contract + the
rights/provenance review) with no timeline.

### Gate 6 — Ledger landed · **PASS**

`docs/DECISIONS.md` records D1–D8, each dated 2026-09-10 with a one-line rationale and its named source
(Phase 0 audit section or owner-review answer Q1–Q5), plus the append-only format note and the D4 one-line
restoration command. D7 carries an appended executor note recording the AGENTS.md block (appended, not
edited — the ledger is append-only).

### Gate 7 — Validation is real · **PASS**

```console
$ make validate
python3 scripts/validate_quotes.py
Quotes checked: 153
Errors: 0
Warnings: 0
Duplicate texts: 0
exit=0

$ python3 scripts/validate_quotes.py data/quotes_hidden_words.json
Quotes checked: 153
Errors: 0
Warnings: 0
Duplicate texts: 0
exit=0
```

Before H1.8, on this host: `make validate` → `pyenv: python: command not found`, `make: *** [validate] Error
127`, exit 2. `requirements-dev.txt` pins `requests==2.34.2`, `beautifulsoup4==4.15.0`, `lxml==6.1.3` and states
in its header that they are dev-only; no served asset references it (`grep -rn "requirements-dev" index.html
css/ js/` → nothing).

### Gate 8 — Experimental surfaces documented · **PASS**

`README.md` §"Experimental ambient surfaces" and the AGENTS contract (Appendix A) both state what each surface
is, the wallpaper's live URL (`https://mschwar.github.io/bahai-homepage/wallpaper.html`, verified 200), that
neither is linked from `index.html` (`grep -n wallpaper index.html` → no match), that a change to
`js/script.js` carries no propagation obligation, and the honest note that there is **no `.xcodeproj`**, so the
widget cannot be built or tested in-repo (`find ios -name '*.xcodeproj' -o -name '*.xcworkspace'` → none).
`index.html` was not edited; an on-page link would be queue unit H1.10.

### Gate 9 — Orphaned payload unpublished · **PASS**

`main` pushed at `20:10:58Z`; Pages reported `status: built` and every orphaned endpoint was **404** at
`20:11:33Z` — 35 seconds after the push, far inside the 15-minute allowance:

```console
$ for p in data/quotes_kjv_bible.json data/quotes_dhammapada.json data/quotes_gita_arnold.json data/quotes.json; do
    curl -s -o /dev/null -w "%{http_code} $p\n" -L "https://mschwar.github.io/bahai-homepage/$p?v=$TS"; done
404 data/quotes_kjv_bible.json
404 data/quotes_dhammapada.json
404 data/quotes_gita_arnold.json
404 data/quotes.json
```

Retention proven **before** removal — the same 7 paths read back from the pushed branch:

```console
$ git show origin/archive/legacy-multifaith:<path> | shasum -a 256
35f1ea99452af12bdd7b0a4a2889ab84d7483a0e44229aebeb2c2ad86fcd8483  data/quotes_kjv_bible.json
9782888f9a742e5d5fdee96410451d9d3916d9ce128a3f193a36f66316be7a28  data/quotes_dhammapada.json
b18bcdde6c2a8d391c30142a270f3de6c28b31dc83f71607c665458e13f7662a  data/quotes_gita_arnold.json
92047be27db1698ba9c82d6e78d66a1d33f26363343804fced1248c4e2d090a1  data/quotes.json
4f0e050f1da68bce93765ffb759452dcd95003a38b0f9eb8b8f8e4f11aa684f0  scripts/scrape_kjv_bible_pg.py
67bd791cb5412ffd9a6d542bf5bc72e9d2e28435bf4e98d3788dbd238f39e000  scripts/scrape_dhammapada_pg.py
fbb06f711e281a04fe4766c326ca68755a47124ba0ef367d640c7196a0b86cd7  scripts/scrape_gita_arnold_pg.py
```

These are byte-identical to the hashes taken from `main` before the removal. Branch pushed as
`archive/legacy-multifaith` → `8d0f545` (`git ls-remote --heads origin` confirms both `main` and the archive
branch on the remote). The homepage was unaffected by the removal, and `data/quotes_hidden_words.json`,
`scripts/*hidden*`, and `ios/widget/*` were left in place (nothing outside the 7 owner-named paths was
touched — the staged removal was exactly 7 files, 205,234 deletions).

### Gate 10 — Closeout · **PASS**

This file exists with per-gate command evidence, an explicit deviation section, the queue state, and the
deferred list; all H1/H1C commits are pushed to `main`; work stopped.

## 4 · Deviations from the packet (explicit, not silent)

**D-A · `AGENTS.md` was NOT created as a root file.** H1.2 and owner decision Q5 both expected a real root
`AGENTS.md`, and a `printf` probe during the packet's own baseline check (and re-run by this executor) returned
exit 0 — but the agent runtime's tool policy **refused** the write:

```text
BLOCKED: write to protected agent-instruction file(s) (AGENTS.md) approval prompt timed out
without a user response. Silence is not consent. ... Do NOT retry it or attempt the same edit
via another path (terminal, execute_code, etc.).
```

The documented fallback (`RECOVERY.md` §"If a write to `AGENTS.md` is blocked"; anticipated in Q5) was applied:
the contract's **full text verbatim** lives in `README.md` Appendix A, with a one-time manual step to create
the file. **Nothing about the contract is lost**; gate 3 is satisfied by the appendix. The bypass was not
attempted, per the block instruction. A human running one `cp`/paste completes H1.2 as originally specified.

**D-B · Gate 4's literal grep does not return empty.** As shown in gate 4: the residual matches are the
prohibitions that make D2 binding (in `README.md`, incl. the AGENTS contract text) and the append-only Phase 0
record (`HANDOFF.md`). `PROJECT_ROADMAP.md` — the one doc that actually asserted the abandoned sprint as
current intent — is gone from the root. The substantive requirement ("no remaining repo doc asserts the
abandoned multi-faith sprint as current intent") is met and was verified by reading every residual match. The
gate is recorded as **PASS on substance**, with this deviation stated rather than achieved by deleting the
record or by rewording the prohibitions until the pattern no longer matches.

**D-C · H1C's mechanism wording was corrected, per the packet's own instruction.** "Move them out of the
served root" is implemented as **removal from `main`**, because Pages serves the whole branch (`.nojekyll`
disables Jekyll's ignores). A directory move inside `main` would have unpublished nothing. The policy
(unpublished + retained) is unchanged; this matches `OWNER_DECISIONS.md` Q2's mechanism correction and is
recorded in `docs/DECISIONS.md` D4.

**D-D · Commit sequencing note (not a scope deviation).** H1.3 landed as its own commit by giving the audit
directory an explicit identity line in README and the AGENTS contract; H1.1 had already linked the path, since
a canonical entry that omits the audit would have been a worse README.

## 5 · Queue state after H1

| Unit | State | Gate | Evidence |
|---|---|---|---|
| H1 | done (this packet) | agent | §3 above; owner review pending |
| H1.10 — on-page link to ambient surfaces | pending (optional, owner-visible) | human | not started; would edit `index.html` |
| H2A — live-site parity refactor | pending | agent, after H1 accepted | not started |
| H2B — collection/source abstraction | pending | agent, after the data contract | not started |
| R1 — Ruhi Book 1 memorization collection | **BLOCKED** | human | blocked by H2B contract + rights/provenance review; no timeline (D6) |
| H3 — first real additional collection | **BLOCKED** (behind R1) | agent after R1 | not started |

## 6 · What remains deferred

- **H1.2 completion (manual):** create the root `AGENTS.md` from `README.md` Appendix A, then retire the
  appendix (D-A).
- **H1.10:** a real on-page link to the wallpaper/widget — owner-visible, edits a frozen file, needs its own
  authorization.
- **H2A / H2B / R1 / H3:** each gated by its own authorization, per `docs/queue.md`.
- **Never:** multi-faith resurrection (D2); runtime AI / journaling / streaks / feeds (doctrine non-goals).
- Font/CDN version pinning and an Xcode project for the widget remain recorded-but-unscheduled.

## 7 · Evidence notes (honesty about what was and was not measured)

Everything in §3 is raw output produced in this session on this host, in the order shown. Two notes:

- Gate 9's 404 confirmation came 35 s after the push (not a 15-minute wait) — the endpoint set was polled with
  a cache-buster against a `built` Pages status, so the 404 is real unpublish, not a cache artifact.
- The Phase 0 audit's claim that the React CDN dependency was "not re-verified" was closed here: all three
  external dependencies were re-checked live today (fonts 200, `BadiDateToday.v1.js` 200, unpkg react@18 200)
  and recorded in `docs/RUNBOOK.md`.

## 8 · Closure note (appended 2026-09-10, post-handoff — an append, not a rewrite)

Appended by the follow-up session that acted on §6's first item. The body above is unchanged apart from a
one-character typo fix in the header line (`**Authorization:***` → `**Authorization:**`).

**Gate 3 / deviation D-A is now closed.** A root `AGENTS.md` exists, with content byte-identical to the text
`README.md` Appendix A had preserved (extracted the marker segment programmatically and compared: identical).
The appendix is retired, and `README.md` (three pointers), `docs/RUNBOOK.md`, `CONTRIBUTING.md` and
`docs/queue.md` now reference `AGENTS.md`. Decision `D9` in `docs/DECISIONS.md` records it; D7's text is
untouched (the ledger is append-only).

**Gates 1, 2 and 7 re-verified at closure** — the freeze is intact and the site is unchanged:

```console
$ shasum -a 256 index.html css/style.css js/script.js js/badi-init.js data/quotes_hidden_words.json
0d1a6f0f…b36c5  index.html          2a08588c…f56de7  css/style.css
11f88eb2…9c8c8  js/script.js        3bfd2054…2509a  js/badi-init.js
fdcd492d…aea4   data/quotes_hidden_words.json

$ curl -sL ".../index.html?v=$TS" | shasum -a 256     → http=200 size=4701
0d1a6f0ff7b8b3ff1f715da90e998d3a1949814f7c271814dd5aa69acb0b36c5
$ curl -sL ".../data/quotes_hidden_words.json?v=$TS"  → http=200 size=60008
fdcd492d5d0bd1dbf8f7326a81f5da7bd5ba2356c804f392115496e1fefaaea4

$ make validate          → Quotes checked: 153 / Errors: 0 / Warnings: 0 / Duplicate texts: 0   (exit 0)
```

All three match the §3 baselines exactly, so `live == repo == baseline` still holds two commits later.

**One live discrepancy found, recorded rather than fixed (outside this unit's scope):** the Super Linter
workflow is **red on `main` at this handoff's own commit** (run `34524938962`,
`docs: add PHASE1_HANDOFF.md with gate evidence`) — `textlint`'s terminology rule rejects words the docs use
about themselves (`repo` → `repository`, `build system` → `build tool`). Read §3's gate 10 together with it:
the H1/H1C commits are pushed, but not green. Evidence, cause and a proposed contract are in `docs/queue.md` →
"Candidate units" `C1`; a second unit `C2` covers the unmapped root docs. Neither is scheduled, and neither
was authorized by this packet, so neither was touched.

**Still deferred, unchanged from §6:** H1.2 is now complete; H1.10, H2A, H2B, R1, H3 and the never-list stand.

## 9 · Owner acceptance (appended 2026-09-10) — H1 closed

The owner reviewed this handoff and **accepted H1** on 2026-09-10, in session. That closes §5's H1 exit gate and
this packet's stop condition, so H1 is `done` in `docs/queue.md` (its ten gates stand as recorded in §3, with
§4 D-A closed by §8 before acceptance and D-B/D-C/D-D recorded as deviations, not failures).

Two things acceptance does **not** do, stated so no downstream executor over-reads it:

- **It does not authorize the frozen-file half of `H2A`.** Acceptance satisfies H2A's documented precondition
  ("after H1 accepted"), which makes the *parity-suite* half executable. The refactor that suite would justify
  changes frozen files (`index.html`, `css/*`, `js/*`), and `AGENTS.md` requires an owner decision plus parity
  evidence for that. A satisfied precondition is not a frozen-file authorization.
- **It does not authorize `C1`.** CI stays red on `main` (see §8) until the owner rules on one of C1's three
  contracts in `docs/queue.md`.

**Queue state after acceptance:** H1 `done` · H1.10 `pending` (human, edits a frozen file) · H2A `pending`
(gate satisfied; parity-suite half agent-executable) · H2B `pending` · R1 `BLOCKED` (human) · H3 `BLOCKED`
(behind R1) · C1/C2 new candidate units, neither authorized.
