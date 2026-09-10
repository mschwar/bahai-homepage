# PACKET — Phase 1 · H1 Agent-First Repo Retrofit (`bahai-homepage`)

**Created:** 2026-09-10 (generated from the *accepted* Phase 0 audit — not from the pre-audit placeholder).
**Supersedes:** `bootstrap/seed/2026-09-10-homepage-retrofit/prompts/02_PHASE1_AGENT_FIRST_RETROFIT_BLOCKED.txt`
(the placeholder is now a pointer only — never run it).
**Gate status:** Phase 0 audit **ACCEPTED** at human review; `HANDOFF.md` §8 questions **ANSWERED** in
`OWNER_DECISIONS.md`. This packet is **authorized to run**.

---

## What this packet is

The exact, self-contained execution packet for **H1** (agent-first repo retrofit) of the 2026 Bahá'í Homepage
retrofit, including the owner-approved **H1C** orphaned-data cleanup. It is a *documentation + governance +
tooling* packet: **the live product does not change.**

## Contents

| File | Purpose |
|---|---|
| `01_PROMPT.txt` | The single copy-paste prompt given to the executing agent. Start here. |
| `OWNER_DECISIONS.md` | Binding answers to Phase 0 `HANDOFF.md` §8 (Q1–Q5) + the resulting decision ledger. |
| `SCOPE_AND_GATES.md` | In-scope / out-of-scope / forbidden, and the acceptance gates H1 must satisfy. |
| `RECOVERY.md` | What to do when the executor drifts, breaks parity, or cannot finish. |
| `QUEUE_SEED.md` | The forward queue (H1 · H1C · H2A · H2B · R1 · H3) with states and gates, to be landed as `docs/queue.md`. |
| `workunits/H1_AGENT_FIRST_RETROFIT.md` | H1 work breakdown (H1.1–H1.9), agent-executable. |
| `workunits/H1C_ORPHAN_UNPUBLISH.md` | Owner-approved unpublish of the orphaned multi-faith payload. |
| `workunits/H2A_PARITY_REFACTOR.md` | Next packet after H1 — **not authorized now**. |
| `workunits/H2B_COLLECTION_CONTRACT.md` | Next packet after H1 — **not authorized now**. |
| `workunits/R1_RUHI_RESEARCH_BLOCKED.md` | Human-gated research, **BLOCKED**. |
| `workunits/H3_FIRST_COLLECTION.md` | Post-R1 only, **BLOCKED**. |

## Inputs the executor must read first

1. `START_HOMEPAGE_RETROFIT.md`
2. `HANDOFF.md` (Phase 0 handoff) + `bootstrap/packets/2026-09-10-phase1-agent-first-retrofit/OWNER_DECISIONS.md`
3. `docs/audit/2026-09-10/` — all twelve audit documents (canonical orientation)
4. `bootstrap/seed/2026-09-10-homepage-retrofit/` — the original seed (historical input)
5. This packet, all of it

## Baseline facts captured at packet-creation time (2026-09-10, from a clean `main` @ `e8091cc`)

Executors should re-verify, not trust:

```
sha256 (live index.html)                       = 0d1a6f0ff7b8b3ff1f715da90e998d3a1949814f7c271814dd5aa69acb0b36c5
sha256 (live data/quotes_hidden_words.json)    = fdcd492d5d0bd1dbf8f7326a81f5da7bd5ba2356c804f392115496e1fefaaea4
  -> both byte-identical to the repo files (live == repo confirmed at Phase 0 and re-confirmed here)
Pages source                                   = branch main, path /, build_type legacy, public, https enforced
python3 scripts/validate_quotes.py <corpus>    = 153 checked / 0 errors / 0 warnings / 0 duplicates   (PASS)
make validate                                  = FAILS: pyenv "python: command not found" (exit 2)   <-- H1.8
orphaned payload                                = 10.0 MB, still served: /data/quotes_kjv_bible.json -> 200 (10,023,950 B)
/  and /wallpaper.html                          = 200 (wallpaper.html is live but unlinked from index.html)
.venv/                                          = exists, python 3.14.5, has requests + bs4 + lxml installed
AGENTS.md writable in-repo                      = YES (probe: write exit 0, file created, then removed; tree clean)
```

## Definition of done

All ten gates in `SCOPE_AND_GATES.md` pass **with recorded evidence**, the H1 commits are pushed, and
`PHASE1_HANDOFF.md` at the repo root tells a human what changed, what was verified, and what remains.
Then **STOP**: H2A/H2B/R1/H3 are separate, later authorizations.
