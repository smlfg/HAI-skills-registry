# HAI Skills Registry

Agent skills I use every day to run AI agents like a team, not like a slot machine.

By **Samuel Fleig** / [Human Agent Interface](https://human-agent-interface.com).

These skills are small, plain-Markdown, and model-agnostic. Each one is a `SKILL.md` that any skill-capable agent (Claude Code, Codex, Cursor, OpenCode, Gemini CLI, Hermes Agent, …) can load. Most of them encode one hard-won rule: **evidence over status reports, one gate at a time, and the human stays the owner.**

Every skill contains the instructions, an **Example** and a **Use case**. Take them, adapt them, make them yours.

## Installation

<details>
<summary><strong>Any agent via skills.sh</strong></summary>

```bash
npx skills@latest add smlfg/HAI-skills-registry            # pick skills interactively
npx skills@latest add smlfg/HAI-skills-registry -a cursor  # or: claude-code, codex, opencode, ...
```

</details>

<details>
<summary><strong>Manual (copy one skill)</strong></summary>

```bash
git clone https://github.com/smlfg/HAI-skills-registry.git
cp -r HAI-skills-registry/skills/engineering/prior-art-search ~/.claude/skills/   # Claude Code
cp -r HAI-skills-registry/skills/engineering/prior-art-search ~/.codex/skills/    # Codex
```

Any agent that reads a folder of `SKILL.md` files works the same way.

</details>

Then type `/<skill-name>` (e.g. `/brief`, `/prior-art-search`), or let the agent pick a skill when its description matches the task.

## Layout

```text
skills/
  <bucket>/
    README.md          # bucket index
    <skill-name>/
      SKILL.md         # frontmatter (name, description) + instructions + Example + Use case
      scripts/         # optional helpers, only where the skill needs them
```

Buckets: [Engineering](./skills/engineering/README.md), [Orchestration](./skills/orchestration/README.md), [Automation](./skills/automation/README.md), [Learning](./skills/learning/README.md), [Productivity](./skills/productivity/README.md).

## Skills

<!-- INDEX:START -->

### Engineering

| Skill | What it does |
|---|---|
| [`prior-art-search`](./skills/engineering/prior-art-search/SKILL.md) | Mandatory reuse gate before building any new tool, script, agent, hook, integration, workflow or architecture. Searches internally, in official docs, and externally, then decides REUSE / INTEGRATE / ADAPT / BUILD LAST. Use before starting or dispatching a build. |
| [`agentic-gate-verification`](./skills/engineering/agentic-gate-verification/SKILL.md) | Decide whether agentic work may proceed, be marked done, merge, or spawn more work. |
| [`commit`](./skills/engineering/commit/SKILL.md) | Create atomic git commits with a secrets/artifact safety check, green tests, and explicit human approval per commit. |
| [`eval`](./skills/engineering/eval/SKILL.md) | Run real tests or evals against a plan file, store results per version and compare with the previous baseline. |
| [`skilleval`](./skills/engineering/skilleval/SKILL.md) | Run the same task through several models or agents and score the artifacts against a pre-agreed, machine-checkable quality axis. |
| [`cross-model-review`](./skills/engineering/cross-model-review/SKILL.md) | Get independent second, third and fourth opinions from different model families on a problem or solution, then synthesise convergence (validated) versus divergence (real decisions/upgrades). |
| [`archify-swarm`](./skills/engineering/archify-swarm/SKILL.md) | Map a repository's architecture with several cheap/free models in parallel, verify every claimed file:line deterministically against the committed code, and compose ONE architecture map from the verified claims. |
| [`subprocess-cli-pitfalls`](./skills/engineering/subprocess-cli-pitfalls/SKILL.md) | Diagnose Linux CLI commands that run in milliseconds in a terminal but hang or crawl when called via Python subprocess (or any non-TTY caller like cron or an agent). Root cause is almost always paginator behaviour, TTY detection, or output buffering. |
| [`github-community-checklist`](./skills/engineering/github-community-checklist/SKILL.md) | Audit a GitHub repo's community health files (description, README, license, code of conduct, contributing, security policy, issue/PR templates). |

### Orchestration

| Skill | What it does |
|---|---|
| [`brief`](./skills/orchestration/brief/SKILL.md) | Turn a short, vague ask into a complete task contract (objective, artifact, done_criteria, non_goals, constraints, next_step, return_format, parking_lot) with strict cardinality rules. |
| [`thin-orchestrator-routing`](./skills/orchestration/thin-orchestrator-routing/SKILL.md) | Keep an expensive chat agent a thin orchestrator (intent, brief, quality gate) and route heavy multi-step work to cheaper worker harnesses on an always-on host. |
| [`tiered-delegation`](./skills/orchestration/tiered-delegation/SKILL.md) | Token-gated multi-agent orchestration. A top-tier model handles intent, personalisation and the quality gate; a builder model produces the volume from a validated spec; the cheapest executor does mechanical work. |
| [`agent-directory-lookup`](./skills/orchestration/agent-directory-lookup/SKILL.md) | Pick a delegation target only via a curated agent directory with tiers and allowed/forbidden capabilities, never by guessing from profile names. |
| [`opencode-go-delegation`](./skills/orchestration/opencode-go-delegation/SKILL.md) | Delegate coding tasks to OpenCode (CLI or MCP) with deliberate model routing and a mandatory verification step. |
| [`hermes-doctor`](./skills/orchestration/hermes-doctor/SKILL.md) | Diagnose and fix Hermes Agent provider / fallback-chain outages (no answer, 401/429 errors, stale or conflicting keys, misspelled provider aliases) across many profiles. |
| [`skill-import-from-machines`](./skills/orchestration/skill-import-from-machines/SKILL.md) | Import your own agent skills from several machines and harnesses (Claude Code, Codex, Hermes, others) into one shared skill library. Packs only known personal roots, stages them, filters personal vs marketplace, runs a secrets pass, and writes only after explicit approval. |
| [`skill-corpus-review`](./skills/orchestration/skill-corpus-review/SKILL.md) | Review an imported skill corpus across harnesses for coverage gaps, reusable patterns, and what's worth promoting to a shared library. Use after a multi-harness skill import, or when asked what's interesting or missing in a skill collection. |

### Automation

| Skill | What it does |
|---|---|
| [`automation-delivery`](./skills/automation/automation-delivery/SKILL.md) | Implement or extend an automation as small, complete functions, from verified current state through technical acceptance, with one writer per artifact and a rollback path. |

<!-- INDEX:END -->

## Principles behind these skills

- **Evidence over claims.** A green run, a status file or a worker's self-report is not proof. Read back the real effect.
- **One gate at a time.** An approval covers exactly the step it names.
- **Reuse before build.** Search for prior art before writing new tools.
- **Thin orchestrator, cheap workers.** Spend premium tokens on intent and judgement, not on volume.
- **The human owns the decision.** Agents block and explain; they don't silently pick defaults.

## Contributing

Issues and pull requests are welcome. Keep skills small, generic, and free of personal data; every skill needs an Example and a Use case.

## License

[MIT](./LICENSE) © Samuel Fleig
