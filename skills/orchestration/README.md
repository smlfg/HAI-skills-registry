# Orchestration

Skills for running several agents: briefs, routing, delegation, harness health, skill libraries.

- **[brief](./brief/SKILL.md)**: Turn a short, vague ask into a complete task contract (objective, artifact, done_criteria, non_goals, constraints, next_step, return_format, parking_lot) with strict cardinality rules.
- **[thin-orchestrator-routing](./thin-orchestrator-routing/SKILL.md)**: Keep an expensive chat agent a thin orchestrator (intent, brief, quality gate) and route heavy multi-step work to cheaper worker harnesses on an always-on host.
- **[tiered-delegation](./tiered-delegation/SKILL.md)**: Token-gated multi-agent orchestration. A top-tier model handles intent, personalisation and the quality gate; a builder model produces the volume from a validated spec; the cheapest executor does mechanical work.
- **[agent-directory-lookup](./agent-directory-lookup/SKILL.md)**: Pick a delegation target only via a curated agent directory with tiers and allowed/forbidden capabilities, never by guessing from profile names.
- **[opencode-go-delegation](./opencode-go-delegation/SKILL.md)**: Delegate coding tasks to OpenCode (CLI or MCP) with deliberate model routing and a mandatory verification step.
- **[hermes-doctor](./hermes-doctor/SKILL.md)**: Diagnose and fix Hermes Agent provider / fallback-chain outages (no answer, 401/429 errors, stale or conflicting keys, misspelled provider aliases) across many profiles.
- **[skill-import-from-machines](./skill-import-from-machines/SKILL.md)**: Import your own agent skills from several machines and harnesses (Claude Code, Codex, Hermes, others) into one shared skill library. Packs only known personal roots, stages them, filters personal vs marketplace, runs a secrets pass, and writes only after explicit approval.
