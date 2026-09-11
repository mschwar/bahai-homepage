# Work Queue

Canonical forward plan for `bahai-homepage`. Supersedes `PROJECT_ROADMAP.md` and
`docs/audit/2026-09-10/QUEUE_PROPOSAL.md` (the latter is historical input; this file is the plan of record).

## Semantics

- **States:** `pending` · `in-progress` · `blocked` · `done`.
- **Owner gate:** `agent` = agent-executable once its contract exists; `human` = requires owner judgment
  and sign-off.
- **Evidence is a field, not a vibe.** A unit is `done` only with recorded command output. A unit that
  cannot be proven is reported `OPEN`, never `done`.
- **Standing rule:** provenance / copyright / canonical-text / curation questions are **human-gated
  research**. Contract design and code are **agent-executable**. A unit enters the queue only with a named
  contract **and** a gate.

---

## Priority order

Open units in execution order; closed units are listed in their own sections. Every unit below is
**owner-gated** except `H2B`, whose gate is `agent` once the data contract is written.

| # | Unit | What it is | Gate |
|---|---|---|---|
| 1 | `C4` | Dependabot has no stated policy for major-version bumps | human — CI configuration |
| 2 | `C5` | Three super-linter settings announce checks that do not run | human — CI configuration |
| 3 | `C7` | Saved dark theme leaves the body carrying *both* theme classes | human — frozen `index.html` / `js/script.js` |
| 4 | `C6` | The designed copy affordance is invisible (`.quote-actions{display:none}`) | human — frozen `css/*` / `index.html` |
| 5 | `C9` | The Badíʿ date never resolves on the live site (the vendor library's mixed-content call) | human — frozen files and/or product doctrine |
| 6 | `H2B` | Collection / source abstraction | agent, after the data contract is written |

`R1` is BLOCKED (human) behind `H2B` + a rights/provenance review; `H3` is BLOCKED behind `R1`. Ordering
rationale: the two CI-configuration units are first because neither changes a product file and `C4` guards a live
update path; the two frozen-file units follow as a pair, each needing `make parity` before and after; `C9` is the
last of the defects because every one of its options is a product change; `H2B` is last because it must wait for a
contract that does not exist yet.

Closed: `H1`, `H2A`, `C1`, `C2`, `C3`, `C8`.

---

## H1 — agent-first repo retrofit · **done** · gate: agent · accepted 2026-09-10

Units H1.1–H1.9 (`bootstrap/packets/2026-09-10-phase1-agent-first-retrofit/workunits/H1_AGENT_FIRST_RETROFIT.md`)
plus H1C (`…/H1C_ORPHAN_UNPUBLISH.md`).

**Exit gate:** the ten gates in `SCOPE_AND_GATES.md` closed with pasted command output, then owner review of
`docs/history/PHASE1_HANDOFF.md`. **Closed:** the owner accepted H1 on 2026-09-10 (in-session, recorded in
`docs/history/PHASE1_HANDOFF.md` §9). Gate 3's deviation D-A was closed before acceptance by delivering the root
`AGENTS.md` (§8), so all ten gates stand as recorded.

**Evidence:** `docs/history/PHASE1_HANDOFF.md` (per-gate command output, plus §8 closure note and §9 acceptance
record) — moved to `docs/history/` by `C2` (D14). `H1.2` is complete; `H1.10` was a separate owner-gated unit
below, closed 2026-09-10 as option (b) (D14).

**H1.2 closure — 2026-09-10, post-handoff (deviation D-A closed).** The root `AGENTS.md` now exists, with
content byte-identical to the retired `README.md` Appendix A, and the appendix is gone. Alongside it: the three
`README.md` pointer references and `docs/RUNBOOK.md`'s header now name `AGENTS.md`; `CONTRIBUTING.md`'s broken
commands were fixed (`python` → `python3`; unpinned `pip install requests beautifulsoup4 lxml` →
`pip install -r requirements-dev.txt`) because bare `python` is the pyenv failure mode `RUNBOOK.md` §7 already
records; and `docs/history/PHASE1_HANDOFF.md`'s deviation section carries an append-only closure note.

## H1.10 — on-page link to the ambient surfaces · **done (option (b): no link)** · gate: human · decided 2026-09-10

Owner decision Q1 was "document + link" for the wallpaper and widget; H1 links them from the docs only,
because an on-page link would edit `index.html`. The owner closed this unit on 2026-09-10 by taking **option (b):
no on-page link**. The wallpaper and the iOS widget stay reachable by URL and documented in `README.md` /
`AGENTS.md`, and are deliberately **not** linked from `index.html`.

*Why:* the product doctrine is "one passage, not a feed" (D1) — an on-page link to a second surface pulls
directly against it, and D3 already covers discoverability by documenting both surfaces. Option (b) needs no
product-file change, so the one sanctioned exception to the freeze is not taken.

**Evidence:** owner decision in-session 2026-09-10, recorded as `docs/DECISIONS.md` **D14**. No frozen file was
modified, so the unit's own before/after screenshots and re-run sha256s do not apply.

## H2A — live-site refactor / parity · **done** · gate: agent (H1 accepted 2026-09-10 → gate satisfied; refactor half owner-authorized 2026-09-10)

**Authorization (2026-09-10).** H2A has two halves with different authority. The parity suite (first half)
was covered by H1's gate; the refactor half changes frozen files and, per `AGENTS.md`, needed its own
"owner decision and parity evidence". The owner granted that authorization in-session on 2026-09-10, and the
decision is recorded as **D11** — which supersedes D8's byte-identical freeze for exactly the files H2A
touched. An executor reading this later must not infer authority from the satisfied gate alone: D11 is the
authority, and it is scoped to this refactor.

Contract: **write behavioral parity tests first, change implementation second.** The parity set must cover
deterministic day-of-year selection, today/yesterday match, cache-by-date **including the Badíʿ-day-cache
wrinkle** (`TECH_DEBT_AND_RISKS.md` #7 — today's quote is written under the Badíʿ-day key), theme
persistence, the Badíʿ fallback path, clipboard copy, and reduced-motion.

**First half — parity suite written and green (2026-09-10).** `tests/parity.mjs` drives the *live* page
(`index.html` + `js/script.js` + `js/badi-init.js`) in headless Chromium via Playwright 1.59.1 (global
install, bundled Chromium; no new manifest — the file self-hosts a static server so `fetch()` works under a
real origin). Run: `make parity` (alias `node tests/parity.mjs`). Result: **18 passed, 0 failed**. Raw output
recorded verbatim in `docs/audit/2026-09-10/H2A_PARITY_SUITE_RUN.txt`. Coverage:

- A. deterministic `dayOfYear % len` selection over the ≤75-word subset (oracle reimplemented in the test);
- B. today/yesterday relationship + the "Yesterday" reveal (aria-expanded + hidden toggle);
- C. cache-by-date (Gregorian `dailyVerse:YYYY-MM-DD`): offline cache-boot on fetch failure + write-through +
  `lastKey`;
- D. **the #7 wrinkle, pinned**: `saveCachedQuote(pendingBadiKey, todayObj)` writes today's verse under the
  Badíʿ-day key `dailyVerse:badi:<y>-<m>-<d>` (prefix is applied by `saveCachedQuote`), and `lastKey` then
  points at the Badíʿ key — confirming the latent correctness smell is present in the current implementation;
- E. theme persistence (saved `theme` applied on load, default light-mode, toggle flips + persists across
  reload). Parity note: `index.html` hardcodes `<body class="light-mode">`, so after reload to a saved dark
  theme the body carries *both* classes (dark-mode wins via specificity);
- F. Badíʿ graceful degradation (unreachable lib → "unavailable" + "Enable location" guidance; happy path
  renders "Day 4, Núr (light) / 182 BE");
- G. clipboard copy (primary `navigator.clipboard` payload `<text>\n— <author>`, execCommand fallback,
  all-fail → "Copy failed."). Parity note: `.quote-actions{display:none}` hides the copy row, so the
  reachable copy affordance is a click on the quote text itself (wired to the same handler);
- H. reduced-motion scroll (`behavior: auto` under `prefers-reduced-motion: reduce`, `smooth` otherwise).

**First half carried no frozen-file change.** `tests/parity.mjs`, the `parity` Makefile target, and the run
log were the only additions.

**Second half — the refactor · executed 2026-09-10** (branch `refactor/h2a-shared-quote-core`)

Executed as the packet ordered, behavior-preserving, no framework/bundler/build step:

- **Selection/collection logic extracted** into `js/quote-core.js` (new) — the single JavaScript source of
  truth for `MAX_QUOTE_WORDS`, `QUOTES_PATH`, the word-count filter, day-of-year selection, the date and
  cache-key helpers, the corpus fetch, and a `createQuoteCache(prefix[, lastKeyKey])` factory.
  `js/script.js` and `js/wallpaper.js` consume it; each keeps its own cache namespace (`dailyVerse:` /
  `dailyWallpaper:`) and only `script.js` records a `lastKey`, so both caches behave exactly as before.
- **Debt `#11` closed** — `js/badi-init.js` builds the two-line Badíʿ label from text nodes + `<br>` instead
  of `el.innerHTML`. Same rendering, no HTML parsing of the value.
- **Run docs normalized** — `docs/RUNBOOK.md` §§1, 3, 6, 8, including a run-record format the new log follows.

**Not done, deliberately:** `ios/widget/QuoteStore.swift` is unchanged. The packet forbids unifying the
Swift reimplementation in H2A and defers it to `H2B`; a JS module cannot be shared with Swift in any case.
Debt `#1`'s "three places" is therefore now **two** (`js/quote-core.js`, `ios/widget/QuoteStore.swift`),
and `docs/RUNBOOK.md` §8 says so. Closing the remaining one is `H2B`'s job.

**No framework adoption**, no new runtime dependency, no new manifest. The wallpaper surface is on the
refactor's blast radius but off the parity path, so it was verified separately (headless: shared core
loaded, canvas painted, no console/page errors).

**Exit gate — closed, and landed.** Parity suite green *before* and *after*: `18 passed, 0 failed` both
times, the two raw outputs byte-identical. The refactor is proven on `refactor/h2a-shared-quote-core` and
merged to `main` via PR #9. The one thing that briefly held the landing — PR #9's lint going red on four
never-before-exercised CI categories — was resolved the same day as `C8`/`D12`, without touching a product
file.
**Evidence:** `docs/audit/2026-09-10/H2A_PARITY_SUITE_RUN.txt` (first-half run, 18/0) and
`docs/audit/2026-09-10/H2A_REFACTOR_PARITY_RUN.txt` (both halves of this unit — the before/after runs,
the frozen-file sha256 sets, and the separate wallpaper-surface check). The frozen-file hashes are recorded
in that second file and in `docs/DECISIONS.md` **D11**.

## H2B — collection / source abstraction · **pending** · gate: agent (after the data contract is written)

Acceptance criteria (preserved verbatim from the seed):

- Hidden Words remains the default and behaves identically.
- A tiny deterministic test fixture / second collection can be selected.
- Selection is deterministic within a collection.
- Collection/source metadata and provenance have an **explicit** contract.
- The selector is deliberately low-weight and does not turn the page into a settings dashboard.

Also in scope: a single source of truth for the corpus (the root and `ios/widget/` copies are byte-identical
today with no regeneration step — `TECH_DEBT_AND_RISKS.md` #4), and an explicit schema/version/provenance
header.

Depends on the data/provenance contract, **not** on Ruhi.
**Evidence:** the written contract + the fixture-selection test output + Hidden Words parity before/after.

## R1 — Ruhi Book 1 memorization collection · **BLOCKED** · gate: human

Blocked by **(a)** H2B's collection contract and **(b)** a rights/provenance review. **No timeline** (owner
decision Q4) — the gate is generated by H2B, not by a date.

Research task: determine which Book 1 passages are actually designated for memorization; map to
`bahai-quote-ledger`; distinguish occurrence identity from passage/content identity; verify authoritative
citations and text; document selection criteria; review redistribution/copyright; emit a versioned export
conforming to the homepage collection contract.

**Explicit guard:** do **not** substitute "all direct quotations in Book 1". Confirmed: no Ruhi data exists
in this repo (correctly absent).

**Unblock evidence required:** H2B contract merged + a recorded rights/provenance review outcome.

## H3 — first real additional collection · **BLOCKED (behind R1)** · gate: agent after R1 passes

Add the verified Ruhi memorization export as a real collection; exercise the selector in normal daily use.
**Evidence:** the loaded collection + a day-of-year selection check + Hidden Words parity unchanged.

---

## Candidate units — documented defects

Found during the post-handoff review of `docs/history/PHASE1_HANDOFF.md`, the appendix retirement and the CI
repair. Each names a contract and a gate. Units arrive here as workstreams find them; a unit named by another
workstream but not listed below is **pending** — not scheduled and not authorized — until its contract and gate
are written into this section.

**Open now:** `C11` — agent-gated.
**Closed:** `C1` (D10), `C2` (D14), `C3`, `C4` (D18), `C5` (D17), `C6` (D16), `C7` (D16), `C8` (D12), `C9` (D13),
`C10` (D19).

Provenance, so the two sets above stay auditable: `C1`, `C2` and `C3` came from the post-handoff review;
`C4` and `C5` from the review of the `actions/checkout` bump (D10, third addendum); `C6` and `C7` from the
parity-suite review that closed H2A's first half; `C8` from the first CI run whose changed set contained a
product file (PR #9, H2A's refactor), closed the same day on the owner's option (a) and recorded as D12;
`C9` from the post-deploy live verification of H2A and **corrected the same day** — first filed as "the Badíʿ
date never resolves on the live site", which the owner disputed and re-testing disproved, then executed on the
owner's option (a) and recorded as D13; `C10` from the owner's 2026-09-10 decision to strip the auto-merge
question out of `C4` and record it as its own unit (D18); `C11` from the D17 linter-policy review, where the
single Python linter of record was run directly and does not pass on `scripts/`.


### C1 — CI is red on `main`: Super Linter's natural-language rules reject the docs' own vocabulary · **done** · gate: human (authorized 2026-09-10)

**Outcome (executed 2026-09-10, contract option (a)):** CI now runs `super-linter/super-linter@v8.7.0`, pinned
by commit SHA; the natural-language category is off; markdownlint stays on and the 13 real MD040 findings are
fixed; the formatter/duplication categories that would rewrite frozen files or append-only records are off; and
zizmor's unpinned-action finding is fixed with SHA pins plus a Dependabot config that keeps them fresh.
**Evidence:** PR #4, run [`34527479040`](https://github.com/mschwar/bahai-homepage/actions/runs/34527479040) —
`success`, all sixteen categories `pass`. Full rationale, including the first attempt's six failures, is
`docs/DECISIONS.md` D10.

---

**The original diagnosis (kept as the executed contract):**

**Evidence (2026-09-10):** `gh run list --workflow "Lint Code Base"` returns `failure` for the HEAD commit
(`docs: add PHASE1_HANDOFF.md with gate evidence`, run `34524938962`, 1m57s) and for both Phase 0 doc commits.
The only post-H1 success is the code-only unpublish commit. Root cause from `gh run view --log-failed`: the
`textlint` terminology rule rejects the words this project documents itself with — `repo` → `repository`,
`build system` → `build tool` — in `README.md`, `docs/history/PHASE1_HANDOFF.md`, `docs/RUNBOOK.md` and the Phase 0 audit
docs. Secondary: `.github/workflows/super-linter.yml` pins `github/super-linter@v4` (superseded/archived
upstream) and the run logs `Failed to call GitHub Status API` (curl 403) noise before exiting.

**Correction (added 2026-09-10, after the fix):** "the only post-H1 success" was wrong as a measure of
coverage. Two further runs on `main` — the merge-commit pushes `d4e1d30` and `a8bf7e5` — also reported
`success`, but they linted **nothing** (`No files were found in the GITHUB_WORKSPACE to lint!`). Only PR runs
and plain pushes lint their changed files. See `C3`.

**Why it is a defect, not cosmetics:** the default branch advertises a failing check to every cold-start agent,
while `README.md` and `docs/RUNBOOK.md` both claim CI is "hygiene only, does not gate or deploy". A red check
everyone has learned to ignore is worse than no check — and it trains agents to dismiss red before they can
tell the two kinds apart.

**Contract:** pick exactly one and record it in `docs/DECISIONS.md` —
(a) keep Super Linter but disable the natural-language/terminology rules for markdown (`.textlintrc` /
`FILTER_REGEX_EXCLUDE`), on a supported action version;
(b) adopt the rule's vocabulary project-wide (~30+ replacements across 5+ docs — manual rewrites of the
prohibitions in `AGENTS.md` / `DECISIONS.md` are explicitly not acceptable collateral); or
(c) delete the workflow and let `make validate` be the one documented check.
**Exit gate:** the resulting run on `main` is green, and the choice is recorded.
**Gate:** human — CI configuration is outside the agent autonomy boundary (`AGENTS.md`: "Do not add CI/deploy
changes … as a side effect").

### C2 — Root docs are unmapped: live docs, spent residue, and history are indistinguishable · **done** · gate: agent

**Outcome (executed 2026-09-10).** All eight root `.md` files now carry exactly one status in `README.md`
("Where the truth lives"; decision `D14`):

- **live** (stay at the root): `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`.
- **bootstrap** (stays at the root, spent): `START_HOMEPAGE_RETROFIT.md`.
- **historical** (moved with `git mv` to `docs/history/` behind a SUPERSEDED banner, the D5 mechanism):
  `AUDIT_NOTES.md`, `HANDOFF.md`, `PHASE1_HANDOFF.md`.

`CONTRIBUTING.md` and `SECURITY.md` stay at the root deliberately: GitHub recognises those names **only** at the
repository root, so moving them would silently disable its contributing and security-policy features. Nothing was
deleted, and no frozen file was touched. Filenames were kept rather than date-prefixed (as D5 did) so that
references in the append-only ledger and in immutable records stay resolvable by their historical names.

**Evidence:** the classified map in `README.md`; `git ls-files '*.md'` before/after and `git status` in the PR
body, showing the three moves as renames.

---

**The original diagnosis (kept as the executed contract):**

**Evidence:** `README.md`'s "Where the truth lives" list and its three status bands do not name
`AUDIT_NOTES.md`, `CONTRIBUTING.md`, `HANDOFF.md`, `PHASE1_HANDOFF.md`, `START_HOMEPAGE_RETROFIT.md` or
`SECURITY.md`, and all six sit in the publicly served root. Two are spent by construction:
`START_HOMEPAGE_RETROFIT.md` is a launcher whose "first authorized task" is the Phase 0 archaeology prompt
(executed), and `AUDIT_NOTES.md` is dated 2026-01-31 and is not reconciled with the Phase 0 audit that
superseded it — its recorded decisions are not cited anywhere in `docs/DECISIONS.md`.

**Why it is a defect:** H1's stated purpose was that a cold-start agent can tell what is current. Six root
markdown files with no declared status leave the reader to guess which are live, which are historical, and
which are the bootstrap that produced this phase.

**Contract:** classify each root `.md` as live / historical / bootstrap, state the classification in
`README.md` ("Where the truth lives"), and move the historical ones under `docs/history/` behind a SUPERSEDED
banner using the D5 mechanism. Non-destructive: nothing is deleted, and no frozen file is touched.
**Evidence:** the classified map in `README.md` + `git ls-files '*.md'` before/after.
**Gate:** agent — documentation only.

### C3 — CI linted nothing on two merge-commit pushes (v4) · **done** · gate: human (no configuration change was needed)

**Outcome (2026-09-10): closed as a v4 artifact, on the retest the contract asked for.** No CI configuration was
touched, so nothing crossed the autonomy boundary this unit's gate exists to protect — the retest is an
observation and the closure is documentation.

**Evidence (2026-09-10), all nine runs examined:**

| Run | Head | How it reached the runner | Super Linter | Result |
|---|---|---|---|---|
| `34524824941` | `ebe5b78` | plain push | v4 | linted its files, success |
| `34524938962` | `20bfe1a` | plain push | v4 | linted its files, **failure** (the C1 bug) |
| `34525756201` | `d4e1d30` | local `git merge --no-ff`, pushed | v4 | **`No files were found … to lint!`**, success |
| `34526018773` | `a8bf7e5` | local `git merge --no-ff`, pushed | v4 | **`No files were found … to lint!`**, success |
| `34527479040` | `f67f470` | pull request | v8 | linted its files, success |
| `34528462515` | `acf706d` | pull request | v8 | linted its 8 files (named in the log), success |
| `34528829696` | `a5c046b` | merge commit created by GitHub's PR merge | v8 | linted its 8 files (named in the log), success |
| `34531219266` | `d094517` | merge commit created by GitHub's PR merge | v8 | linted its file (named in the log), success |
| `34531596264` | `1ea76c5` | **local `git merge --no-ff`, pushed** | v8 | linted its 2 files, named in the log, success |

**The answer the unit was waiting for.** Run `34531596264` is the local merge path — the one that produced both
empty-set runs under v4. It gathered a non-empty file list and named what it read:

```text
No merge conflicts found in /github/workspace/docs/DECISIONS.md /github/workspace/docs/queue.md
```

So the empty set was a **v4** behaviour, as the correction above suspected, and it does not reproduce on v8 on
any path this repository uses. `docs/RUNBOOK.md` §5 no longer carries the unresolved-caveat sentence.

**Why it was worth resolving rather than documenting again:** the failure mode is silent — the job reports
`success` having checked nothing — which is how C1 hid for three commits. "Green on `main`" only means something
if the run actually read the files, and on this repository's most common landing path that had been assumed
rather than observed.

### C4 — Dependabot has no stated policy for major-version bumps · **done** · gate: human (authorized 2026-09-10)

**Outcome (executed 2026-09-10, contract options (c)-then-(a)).** `.github/dependabot.yml` now suppresses
semver-major updates for the `github-actions` ecosystem (`ignore`), so majors are performed **by hand** as a
deliberate decision; and it groups patch and minor updates into one PR (`groups.actions-patch-minor`) that the
owner merges. Auto-merge is deliberately **not** part of this change — the owner stripped it out and recorded
it as `C10` below. Decision: `docs/DECISIONS.md` **D18**. No product file was touched.

**Evidence.** `.github/dependabot.yml` declares one ecosystem (`github-actions`), a monthly schedule, a
seven-day cooldown and `open-pull-requests-limit: 3`. It says nothing about which update types this repository
wants. PR #5 raised `actions/checkout` from v6 to v7.0.1 — a semver-major — and looked exactly like a patch
bump: one line, every check green, nothing in the title or the checks marking it as a decision. It was merged
only after owner authorization (D10, third addendum), which is correct, but the entire gate rested on a human
reading the diff closely enough to notice the word "major".

**Why it is a defect, not cosmetics.** The care in this repository is concentrated in the SHA pin. The update
path added to keep that pin from rotting (D10 §5) is unsupervised in precisely the case that can break a
workflow, and its output is indistinguishable from routine maintenance.

**Contract:** pick exactly one and record it in `docs/DECISIONS.md` —
(a) `ignore` semver-major updates for actions in `.github/dependabot.yml`, so majors are performed deliberately;
(b) keep majors in the PR stream and state in `docs/RUNBOOK.md` §5 that a major Dependabot bump is owner-gated,
so whoever reads the PR can see the rule; or
(c) allow auto-merge for patch and minor updates only.
**Exit gate:** the chosen policy is recorded, and the next Dependabot PR is handled consistently with it.
**Gate:** human — CI configuration.

### C5 — Three super-linter settings announce checks that do not run · **done** · gate: human (authorized 2026-09-10)

**Outcome (executed 2026-09-10, contract option: turn each off explicitly, or configure it to run for real).**
All three are resolved at their cause in `.github/workflows/super-linter.yml`, none by muting a warning:
commitlint is off explicitly (`VALIDATE_GIT_COMMITLINT: false`) because the repository's commit discipline
lives in the append-only ledger, not in a linter; the summary pair is off
(`ENABLE_GITHUB_ACTIONS_STEP_SUMMARY: false`, `ENABLE_GITHUB_PULL_REQUEST_SUMMARY_COMMENT: false`), which makes
the flag set consistent with `SAVE_SUPER_LINTER_SUMMARY` and with the job's permissions block; and Black is off
(`VALIDATE_PYTHON_BLACK: false`, `VALIDATE_PYTHON_RUFF_FORMAT: false`), which is what removes the Black-vs-Ruff
conflict. The same change turns off CSS (`VALIDATE_CSS`, `VALIDATE_CSS_PRETTIER`) and the three redundant Python
linters (`VALIDATE_PYTHON_FLAKE8`, `VALIDATE_PYTHON_ISORT`, `VALIDATE_PYTHON_PYLINT`), leaving Ruff as the single
Python linter of record, and opens `C11` for the file that Ruff does not pass. Decision: `docs/DECISIONS.md`
**D17**.
**Evidence:** the run on this branch with no warning of the commitlint / summary / Black-vs-Ruff class and a
named non-empty file set, quoted in the pull request; `make parity` 19 passed / 0 failed and `make validate`
153 checked / 0 / 0 / 0, both unchanged; the raw `uvx ruff check .` output (**8 errors**) recorded in D17 and in
`C11`.

**The original diagnosis (kept as the executed contract).**
**Evidence (2026-09-10).** Identical warnings in v8's first run (`34527479040`, 20:38–20:39Z) and in the
post-merge run for the checkout bump (`34531219266`):

```text
[WARN] Git commit message validation with commitlint is enabled, but no commitlint configuration file is
       available. Disabling commitlint.
[WARN] ENABLE_GITHUB_ACTIONS_STEP_SUMMARY is set to true, ENABLE_GITHUB_PULL_REQUEST_SUMMARY_COMMENT is set
       to true, but SAVE_SUPER_LINTER_SUMMARY is set to false.
[WARN] Black and Ruff are both enabled, and might conflict with each other.
```

**Why it is a defect.** This is `C1`'s class one notch quieter: a check that presents itself as active while
doing nothing, and a set of defaults that contradict each other. Commit messages are load-bearing evidence in
this repository, so "commitlint is on" is a claim a reader may rely on. The summary pair is a plain
misconfiguration — two flags enable a summary that a third prevents from existing.

**Contract:** for each of the three, either configure it to run for real or turn it off explicitly in
`.github/workflows/super-linter.yml`, with the reason written beside it in the style of the existing
`VALIDATE_*: false` block. Disabling a check purely to silence a warning is not an acceptable outcome.
**Exit gate:** a run on `main` with no warning of this class, and each of the three choices recorded in
`docs/DECISIONS.md`.
**Gate:** human — CI configuration.

### C6 — The designed copy affordance is invisible: `.quote-actions{display:none}` hides the copy row · **done** · gate: human (authorized 2026-09-10)

**Outcome (executed 2026-09-10, contract option (a)):** `css/style.css` restores the row
(`display:flex`, matching the sibling `.status-row`), so the designed copy control is visible and
discoverable below the attribution. The clipboard handler and both fallbacks were already present
and are untouched. Recorded as `docs/DECISIONS.md` **D16**; evidence in
`docs/audit/2026-09-10/C6_C7_DEBT7_RUN.txt`, with `C6-before-copy-affordance.png` /
`C6-after-copy-affordance.png`.

**A second, hidden defect was found while verifying the first, and fixed.** Restoring the row was
not sufficient: the button rendered `#EFEBE9` on a `#EFEBE9` background — **contrast 1:1**, an
invisible white rectangle that occupied 120×45 px. `.button` (declared later at equal specificity)
was overriding `.button-inline` and applying the dark `.panel-buttons` palette to the light
jumbotron. Scoping the rule to `.quote-jumbotron .button-inline` fixes the cascade; contrast is now
**12.85:1 in both themes**. The first attempt's checks (not `display:none`, non-zero box, enabled)
are all true of an invisible control — *presence is not perceivability* — so section G now asserts
contrast, and that assertion was verified to fail at 1:1 against the un-fixed CSS.
**Exit gate — closed.** A visible, perceivable copy control plus `make parity` green (19/0).
**Gate:** human — modifies `css/*`.

### C7 — Saved dark theme leaves the body carrying *both* theme classes · **done** · gate: human (authorized 2026-09-10)

**Outcome (executed 2026-09-10, contract option (a)):** `js/script.js` removes both theme classes
before adding the saved (or default) one, so the body carries exactly one of
`light-mode`/`dark-mode` on load, on default, and after a reload to a saved theme. `index.html` is
untouched. Section E now *asserts* the single-class invariant instead of logging a note about the
dual-class one — logging was not pinning. Recorded as `docs/DECISIONS.md` **D16**.
**Exit gate — closed.** `make parity` green and exactly one theme class after reload to a saved
dark theme.
**Gate:** human — modifies `js/script.js`.

### C8 — The first change to touch the product files turned CI red on four categories that only ever target those files · **done** · gate: human (authorized 2026-09-10)

**Outcome (executed 2026-09-10, contract option (a)):** the four categories are off in
`.github/workflows/super-linter.yml` — `VALIDATE_HTML`, `VALIDATE_HTML_PRETTIER`, `VALIDATE_JAVASCRIPT_ES`,
`VALIDATE_JAVASCRIPT_PRETTIER` — each with its reason recorded beside it in the D10 block's style, and the
decision is `docs/DECISIONS.md` **D12**. The trade is stated there plainly: CI now runs no static analysis over
the served site at all, and `make parity` (18 behavioral assertions) plus `make validate` are the product's
checks of record. Turning the categories off followed the D10 precedent rather than reformatting frozen product
files to satisfy a default config this repository never adopted.
**Exit gate — closed.** With the categories muted, the run whose changed set contains every product file is
green: PR #9 run [`34538252976`](https://github.com/mschwar/bahai-homepage/actions/runs/34538252976),
`run-lint` **pass**, all eleven remaining categories `pass`. The log was read rather than the badge — the four
flags arrive as `false`, and the job's file set names `index.html`, `wallpaper.html` and all four `js/*.js`, so
it is not the empty-set green of `C3`. Recorded in `docs/DECISIONS.md` D12's addendum.
**Evidence:** the red run that exposed it (`34536775907`, PR #9) is in the diagnosis below; the closing run is
`34538252976`.

**The original diagnosis (kept as the executed contract).** Evidence (2026-09-10, PR #9, run
[`34536775907`](https://github.com/mschwar/bahai-homepage/actions/runs/34536775907)) — the first run in this
repository's history whose changed set contains `index.html` or `js/*`. `run-lint` failed on four categories,
and **not one finding is caused by the H2A refactor**:

- `HTML` (htmlhint 1.9.2) — 2 errors in `index.html`, both pre-existing: L69 `id="badiDate"` and L77 `id="gregorianDatePanel"` violate `id-class-value` ("must be in lowercase and split by a dash" — these are camelCase ids).
- `HTML_PRETTIER` — `index.html` and `wallpaper.html` are not prettier-formatted.
- `JAVASCRIPT_ES` (eslint 9.39.4 on its default config) — `js/badi-init.js`: `initializeBadiCalendar`
  reported unused (it is called from `js/script.js`), `BadiDateToday` and `BadiDateLocationChoice`
  reported undefined (the former is the external library, the latter a global the library sets), plus an
  unused catch binding.
- `JAVASCRIPT_PRETTIER` — all four `js/*.js` files are not prettier-formatted.

**Why it is a defect, not cosmetics.** This is `C1`'s class exactly. `docs/DECISIONS.md` D10 turned off the
categories whose only targets here are frozen files (`BIOME_FORMAT`, `BIOME_LINT`, `MARKDOWN_PRETTIER`,
`JSCPD`) — but the four above were left on, because until now no change had ever included a product file, so
they were **never exercised** and their "pass" on every previous run was vacuous. The first legitimate
product-file change therefore lands as a red check on `main`, with sixteen green categories beside four red
ones whose findings predate the change and would be dismissed by any reader as noise. That is precisely the
state C1 existed to remove.

**Why it is not fixable inside H2A.** The two available fixes are both outside the refactor's authorization:
silencing the categories is a CI configuration change, which `AGENTS.md` puts behind owner sign-off (and
forbids "as a side effect"); making the files satisfy them means either a prettier reformat of all four
`js/*` files plus both HTML files, or adding an eslint config, either of which is the "tidying of working
code" `AGENTS.md` forbids as a side effect. Neither is H2A's to take.

**Contract:** pick exactly one and record it in `docs/DECISIONS.md` —
(a) turn the four categories off for this repository, following the D10 precedent and recording why per category (HTML/ESLint have no config here; prettier's targets are frozen product files) — the cheapest fix, and consistent with what D10 already did to four sibling categories;
(b) make the product files satisfy them — a one-off reformat pass over `index.html`, `wallpaper.html` and `js/*` plus an `id-class-value` fix, accepted knowingly as a product-file change because the frozen hashes would move again; or
(c) keep the four categories on, accept that every product-file PR is red, and record that in `docs/RUNBOOK.md` §5 as the intended state.
**Exit gate:** a run whose changed set includes a product file is green, with each of the four categories either passing or explicitly off for a recorded reason.
**Gate:** human — CI configuration; option (b) additionally modifies frozen files.

### C9 — Badíʿ date: the *declined-location* path rendered nothing · **done** · gate: human (authorized 2026-09-10)

**Outcome (executed 2026-09-10, contract option (a)):** `js/badi-init.js` now keeps the
location-accurate path and, if it has not answered within the 4 s guard, **downgrades** — it
re-invokes the library with `ignoreLocation`, which uses the default 6:30 sunset and needs no
network and no permission, so the date always renders. A first-time visitor who declines the
location prompt now gets a Badíʿ date instead of "unavailable", while a permitted or returning
visitor still gets the sunset-accurate one. Decision: `docs/DECISIONS.md` **D13**; full evidence,
both hash sets, the three-case TLS run and the before/after screenshots are in
`docs/audit/2026-09-10/C9_LOCATION_DOWNGRADE_RUN.txt`.
**Evidence:** `make parity` **19 passed, 0 failed** (one assertion *added* — section F now pins
the downgrade as `attempts=[3,1]` — not re-pinned); real-vendor end-to-end over TLS with
nothing stubbed (declined → resolves; granted → resolves, no downgrade; cached → resolves, no
downgrade); exactly one frozen file moved (`js/badi-init.js` `5831f0e9…` → `80eb5e3f…`).
**Caveat reconciled in the run record:** the C6/C7/debt-#7 workstream also moves the frozen
baseline, so this set is authoritative for this branch only and a combined baseline must be
recorded on `main` once both have landed.

**The corrected diagnosis this fix addresses.** C9 was first filed as "the Badíʿ date never
resolves on the live site" and that claim was WITHDRAWN (see below). What is real and narrow: a
first-time visitor who *declines* the location prompt gets no Badíʿ date, because the vendor's
no-location fallback requests `http://ipinfo.io/geo?json` (blocked as mixed content on HTTPS) and
its XHR sets `ontimeout` but **no `onerror`**, so it never reports the block and never continues.
Our own 4 s guard was the only thing ending that wait, and it rendered "unavailable" — the guard
remains load-bearing, which is why the fix routes through it rather than around it.

**Correction (2026-09-10, appended — the original claim below is WITHDRAWN, not tidied away).** This unit was
first filed as "the Badíʿ date never resolves on the live site" and was escalated to the owner on that basis.
That claim was wrong. The owner disputed it; re-testing with the browser's location permission granted shows the
date resolving normally:

| Live-origin test (headless Chromium) | `#badiDate` | Verdict |
|---|---|---|
| A. geolocation granted | ``Day 3, `Izzat (might)183 B.E.`` | RESOLVED, ~0 ms |
| B. returning visitor, location already in `localStorage` | same | RESOLVED, ~0 ms, no prompt |
| C. geolocation denied **and** no cached location | `Badíʿ date unavailable.` | FALLBACK, ~3500 ms |

Case C is what the first test did — a headless browser with no geolocation permission — and the original entry
generalised from that one case to production. The generalisation was unwarranted. **Case B is why the feature
has worked for over a year**: the vendor library caches a granted location in `localStorage` (`lat`/`long`) and
reuses it on every later visit (vendor source `BadiDateToday.v1.js` v1.09, lines 541–548), so any user who has
ever allowed the prompt — and the owner certainly has — never touches the broken path again.

**What is actually broken (narrow, and real).** A first-time visitor who *declines* the location prompt — and
only that visitor — gets no Badíʿ date. Two distinct causes, both in the interaction between our wrapper and the
vendor library:

1. **The vendor's no-location fallback is HTTPS-dead.** With no cached location it falls back to
   `guessUserLocation`, which requests `http://ipinfo.io/geo?json` (vendor line 573) — blocked as mixed content
   on an HTTPS page.
2. **The vendor never recovers from that block.** The request sets `ontimeout` but has **no `onerror`** (vendor
   lines 575–586), so a blocked request fires neither, and the library never continues. What actually rescues
   the page is *our* wrapper: `js/badi-init.js` carries its own 4 s guard, which is why the fallback appears at
   ~3.5 s. Without that guard the element would hang on "Loading Badíʿ Date…" indefinitely. Our guard is
   load-bearing for a vendor failure mode, which is worth knowing before anyone "simplifies" it.

**History that makes this a traded-away behaviour, not a new breakage.** The repo has been here before: commit
`9d3df3c` (2025-06-03) is titled "Fix: Resolve mixed content error by setting BadiDateToday locationMethod" and
set `locationMethod` to `BadiDateLocationChoice.ignoreLocation` precisely to avoid the ipinfo request. Commit
`d73b2d0` (same day) changed it to `askForUserLocation` for sunset accuracy. So the current state knowingly
traded a working no-location path for accuracy, and the denied path has been broken since — a trade nobody
re-examined. **H2A did not cause it, and no user who has ever granted location is affected.**

**Contract (superseding the withdrawn one).** Pick exactly one and record it in `docs/DECISIONS.md` —
(a) keep `askForUserLocation`, and add a graceful downgrade: if geolocation fails or the wrapper's guard fires,
re-invoke with `ignoreLocation` so the date falls back to the library's default 6:30 sunset instead of
"unavailable". Accurate when permitted, a sane date when not, never dark;
(b) revert to `ignoreLocation` unconditionally — always renders, no network, no permission prompt, but every
user gets a 6:30-sunset approximation, losing the accuracy `d73b2d0` was after;
(c) keep the current behaviour, accept that a first-time visitor who declines sees the Gregorian date only, and
record the trade (plus the reliance on our own 4 s guard) so it is a decision rather than an accident.
**Exit gate:** whichever option, the live check is re-run and its output recorded; if the behaviour changes,
`tests/parity.mjs` section F is re-checked (it blocks the vendor entirely, so it should stay green) and the
frozen-file hashes move again.
**Gate:** human — (a) and (b) modify frozen files (`js/badi-init.js`, `index.html`) and are product changes;
(c) touches product doctrine.

**The original diagnosis (WITHDRAWN — kept only so the error is auditable).** Asserted that the Badíʿ date
never resolves on the live site, on the strength of a single headless run whose browser had no geolocation
permission. The mixed-content console error and the failed `http://ipinfo.io/geo?json` request it quoted are
real and reproducible — but they are observations of case C, the declined-location path, not of production. No
page error and no failed request originates from this repository's own code, which was correct and remains so.

### C10 — Dependabot auto-merge: a spoofable-bot guard in a write-permissioned workflow · **done** · gate: human

**Evidence.** A prior attempt at a Dependabot auto-merge workflow gated its trigger with
`if: github.actor == 'dependabot[bot]'` in a job holding `contents: write` and `pull-requests: write`. zizmor's
`bot-conditions` audit rejects that condition as spoofable, because the **actor** is not the **PR author**:
anything (a workflow, a second user, a compromised token) that presents the username `dependabot[bot]` as the
actor would pass the guard and reach a job with write permissions. The canonical, non-spoofable form tests the
pull request's author instead: `github.event.pull_request.user.login`.

**Why it is a defect.** The guard sits on a job with write permissions, so a spoofed trigger is a real
privilege-escalation path, not a lint nit. Two further constraints make auto-merge fragile here even with a
correct guard: (1) it depends on a repository setting that cannot be set from a pull request — "Settings >
General > Allow auto-merge" — so the workflow alone cannot enable it; and (2) if the super-linter job is not a
REQUIRED check under branch protection, an auto-merge can complete before lint runs, so the gate is illusory —
the run reports success but the merge is not actually gated on it.

**Contract:** pick exactly one and record it in `docs/DECISIONS.md` —
(a) fix the guard to the canonical form (`github.event.pull_request.user.login`), set the "Allow auto-merge"
repository setting, and make the lint check required under branch protection, then land it — a real, working
auto-merge, at the cost of more moving parts;
(b) drop auto-merge entirely and rely on the grouped patch/minor PR that `C4`/D18 now produces and that the
owner merges by hand — the simplest, and a monthly grouped PR for a single dependency ecosystem may make
auto-merge unnecessary; or
(c) something else, with the trade-offs stated.
**Exit gate:** the choice is recorded in `docs/DECISIONS.md`, and the next Dependabot PR is handled
consistently with it.
**Gate:** human — CI configuration; option (a) additionally touches branch protection and repository settings.

**Closed 2026-09-10.** The owner picked option (b): drop auto-merge entirely and rely on D18's grouped
patch/minor PR, merged by hand. No auto-merge workflow file existed to remove. Decision:
`docs/DECISIONS.md` **D19**.

---

### C11 — `scripts/scrape_hidden_words.py` is not clean under the Python linter of record · gate: agent

**Evidence.** With `C5`/`D17` leaving Ruff as the single Python linter, `uvx ruff check .` was run directly
against the repository on 2026-09-10. `--show-files` confirms the only `.py` in the tree are the two
`scripts/*.py`, and the run reports **8 errors**:

```text
I001 [*] Import block is un-sorted or un-formatted  --> scripts/scrape_hidden_words.py:1:1
SIM102   Use a single `if` statement instead of nested `if` statements --> scripts/scrape_hidden_words.py:56:13
F541 [*] f-string without any placeholders          --> scripts/scrape_hidden_words.py:104:11
SIM113   Use `enumerate()` for index variable `candidate_idx` in `for` loop --> scripts/scrape_hidden_words.py:113:9
F541 [*] f-string without any placeholders          --> scripts/scrape_hidden_words.py:130:19
F541 [*] f-string without any placeholders          --> scripts/scrape_hidden_words.py:137:19
UP024 [*] Replace aliased errors with `OSError`     --> scripts/scrape_hidden_words.py:185:12
BLE001   Do not catch blind exception: `Exception`  --> scripts/validate_quotes.py:14:12

Found 8 errors.
[*] 5 fixable with the `--fix` option.
```

Seven findings are in `scripts/scrape_hidden_words.py`; the eighth is in `scripts/validate_quotes.py`
(`BLE001`, the deliberate blind `except` around the JSON parse). The scraper's only lint attention so far was
an out-of-scope edit in a **closed** PR (#14), which put the file into the changed set and turned the three
redundant Python linters red for the first time in the repository's history — a finding that was never
reconciled, only unblocked (`docs/DECISIONS.md` D17).

**Why it is a defect, not cosmetics.** `scripts/scrape_hidden_words.py` is the script that regenerates the
corpus (`docs/RUNBOOK.md` §4), so it is live dev tooling, and it is now the one file that will go red the first
time anyone legitimately touches it — because Ruff is the linter of record and the file does not pass it. This
is `C1`/`C8`'s class again: a check whose result is not currently knowable from the file itself, and a red that
would arrive attached to an unrelated change and be dismissed as noise. It is recorded here rather than fixed
inside the CI-policy change so that the policy change stays what it is and this repair gets its own evidence.

**Contract:** bring `scripts/` clean under Ruff. Pick exactly one and record it in `docs/DECISIONS.md` —
(a) fix the findings: `ruff check --fix` for the five autofixable ones (`I001`, three `F541`, `UP024`), and
hand-edit the three that are not (`SIM102`, `SIM113`, `BLE001`), preserving the script's output exactly;
(b) narrow the rule set with a `ruff.toml` selecting only the rule families this repository intends to hold, and
record which families are deliberately not adopted; or
(c) apply a per-finding `# noqa` with a written reason, so the exclusions are visible in the file.
This changes a dev-only script, not the served site: no file under `index.html` / `css/*` / `js/*` / `data/*` /
`ios/widget/*` is touched, so no frozen hash moves.
**Exit gate:** `uvx ruff check scripts/` clean, and `make validate` still **153 checked / 0 errors / 0 warnings /
0 duplicate texts**.
**Gate:** agent — dev tooling; no frozen file, no product path.

---

## Tech-debt ledger — closures since the Phase 0 audit

`docs/audit/2026-09-10/TECH_DEBT_AND_RISKS.md` is the immutable Phase 0 record (D10), so closures are
recorded here rather than by rewriting it. Its item numbers are referenced throughout this queue.

| # | Item | State |
|---|---|---|
| 1 | Hard-coded corpus path + implicit contract | **Partly closed by H2A** — one JS source of truth (`js/quote-core.js`); the remaining copy is `ios/widget/QuoteStore.swift`, which is `H2B`'s seam. |
| 2 | ~10 MB orphaned multi-faith payload served publicly | **Closed by H1C / D4** — unpublished from `main`, retained on `archive/legacy-multifaith`. |
| 3 | Experimental surfaces undocumented and unlinked | **Closed by H1 / D3** — documented as experimental ambient surfaces; `H1.10` decided to leave them unlinked. |
| 4 | Duplicate corpus copies, no regeneration step | **Open — `H2B`.** |
| 5 | Stale, misleading roadmap | **Closed by D5** — archived to `docs/history/` under a SUPERSEDED banner. |
| 6 | Toolchain mismatch (`python`, unpinned dev deps) | **Closed in H1** — `PYTHON ?= python3`, `requirements-dev.txt`. |
| 7 | `saveCachedQuote(pendingBadiKey, …)` writes today's verse under the Badíʿ-day key | **Closed 2026-09-10 (D16)** — the write is removed; the Gregorian key is the only authoritative read source. Parity section D re-pinned from the defect to the corrected behaviour. |
| 8 | No tests beyond `validate_quotes.py` | **Closed by H2A** — `tests/parity.mjs` (now 19 assertions). |
| 9 | No pinned external deps / integrity pins | **Open** — and now concrete: the Badíʿ vendor CDN is implicated in `C9`'s declined-location path. Not scheduled. |
| 10 | ES tooling absent locally | **Open, by decision** — D12 turned off the unconfigured product-file checks; `make parity` + `make validate` are the product's checks of record. |
| 11 | `index.html` used `innerHTML` for the Badíʿ string | **Closed by H2A** — now text nodes + `<br>`. |

---

## Deferred / never (recorded, not schedulable)

- Multi-faith data integration — **abandoned; do not resurrect** (D2).
- Wallpaper / widget fate — **resolved**: experimental ambient surfaces (D3).
- Orphaned KJV/Dhammapada/Gita cleanup — **resolved by H1C** (D4).
- Runtime AI, journaling, streaks, recommendation feeds — doctrine non-goals.
- Font/CDN version-pinning pass — noted in `TECH_DEBT_AND_RISKS.md` #9; not scheduled.
- Reshaping `ios/widget/` into a real Xcode project — out of scope until an owner asks.
