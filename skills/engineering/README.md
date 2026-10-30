# Engineering

Skills for code work: reuse gates, verification, evals, commits, architecture maps, debugging.

- **[prior-art-search](./prior-art-search/SKILL.md)**: Mandatory reuse gate before building any new tool, script, agent, hook, integration, workflow or architecture. Searches internally, in official docs, and externally, then decides REUSE / INTEGRATE / ADAPT / BUILD LAST. Use before starting or dispatching a build.
- **[agentic-gate-verification](./agentic-gate-verification/SKILL.md)**: Decide whether agentic work may proceed, be marked done, merge, or spawn more work.
- **[change-isolation](./change-isolation/SKILL.md)**: Freeze a working path, define boundary contracts and authoritative state, isolate a change and replay regressions before integrating more agents.
- **[commit](./commit/SKILL.md)**: Create atomic git commits with a secrets/artifact safety check, green tests, and explicit human approval per commit.
- **[experiment-to-project](./experiment-to-project/SKILL.md)**: Turn an AI/agent experiment with several failed attempts into an evaluated, measurable project: grill-me post-mortem, one primary metric plus zero-guardrails, test bench before prototype, one change per measured run.
- **[eval](./eval/SKILL.md)**: Run real tests or evals against a plan file, store results per version and compare with the previous baseline.
- **[mlops-controlled-iteration](./mlops-controlled-iteration/SKILL.md)**: Change one ML/LLM pipeline factor per controlled experiment against frozen inputs, independent ground truth and measured quality/latency.
- **[skilleval](./skilleval/SKILL.md)**: Run the same task through several models or agents and score the artifacts against a pre-agreed, machine-checkable quality axis.
- **[cross-model-review](./cross-model-review/SKILL.md)**: Get independent second, third and fourth opinions from different model families on a problem or solution, then synthesise convergence (validated) versus divergence (real decisions/upgrades).
- **[archify-swarm](./archify-swarm/SKILL.md)**: Map a repository's architecture with several cheap/free models in parallel, verify every claimed file:line deterministically against the committed code, and compose ONE architecture map from the verified claims.
- **[subprocess-cli-pitfalls](./subprocess-cli-pitfalls/SKILL.md)**: Diagnose Linux CLI commands that run in milliseconds in a terminal but hang or crawl when called via Python subprocess (or any non-TTY caller like cron or an agent). Root cause is almost always paginator behaviour, TTY detection, or output buffering.
- **[github-community-checklist](./github-community-checklist/SKILL.md)**: Audit a GitHub repo's community health files (description, README, license, code of conduct, contributing, security policy, issue/PR templates).
