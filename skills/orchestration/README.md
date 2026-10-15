# Orchestration

Skills for running several agents: briefs, routing, delegation, harness health, skill libraries.

- **[brief](./brief/SKILL.md)**: Turn a short, vague ask into a complete task contract (objective, artifact, done_criteria, non_goals, constraints, next_step, return_format, parking_lot) with strict cardinality rules.
- **[thin-orchestrator-routing](./thin-orchestrator-routing/SKILL.md)**: Keep an expensive chat agent a thin orchestrator (intent, brief, quality gate) and route heavy multi-step work to cheaper worker harnesses on an always-on host.
- **[tiered-delegation](./tiered-delegation/SKILL.md)**: Token-gated multi-agent orchestration. A top-tier model handles intent, personalisation and the quality gate; a builder model produces the volume from a validated spec; the cheapest executor does mechanical work.
- **[agent-directory-lookup](./agent-directory-lookup/SKILL.md)**: Pick a delegation target only via a curated agent directory with tiers and allowed/forbidden capabilities, never by guessing from profile names.
