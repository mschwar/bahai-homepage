# What “Agent-First Retrofit” Means — Target for the NEXT Phase, Not This Audit

The later retrofit should make it possible for a cold-start agent to determine, without chat history:

- what the product is for and what must not change;
- canonical documentation and source-of-truth locations;
- current architecture and runtime/deployment topology;
- setup/run/validate/test commands;
- data/corpus contracts and provenance expectations;
- how to distinguish research tasks from implementation tasks;
- how work enters queues and what states/gates exist;
- what can be done autonomously versus what requires human judgment;
- how to return evidence and a handoff;
- what work is explicitly deferred.

Likely durable artifacts include some combination of `AGENTS.md`, product doctrine, architecture map, operator/deployment runbook, test/validation commands, decision records, queue/work-unit contract, and CI. The audit must recommend the minimum justified set; do not blindly create everything.
