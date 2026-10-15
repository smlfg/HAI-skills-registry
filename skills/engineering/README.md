# Engineering

Skills for code work: reuse gates, verification, evals, commits, architecture maps, debugging.

- **[prior-art-search](./prior-art-search/SKILL.md)**: Mandatory reuse gate before building any new tool, script, agent, hook, integration, workflow or architecture. Searches internally, in official docs, and externally, then decides REUSE / INTEGRATE / ADAPT / BUILD LAST. Use before starting or dispatching a build.
- **[agentic-gate-verification](./agentic-gate-verification/SKILL.md)**: Decide whether agentic work may proceed, be marked done, merge, or spawn more work.
- **[commit](./commit/SKILL.md)**: Create atomic git commits with a secrets/artifact safety check, green tests, and explicit human approval per commit.
- **[eval](./eval/SKILL.md)**: Run real tests or evals against a plan file, store results per version and compare with the previous baseline.
- **[skilleval](./skilleval/SKILL.md)**: Run the same task through several models or agents and score the artifacts against a pre-agreed, machine-checkable quality axis.
- **[cross-model-review](./cross-model-review/SKILL.md)**: Get independent second, third and fourth opinions from different model families on a problem or solution, then synthesise convergence (validated) versus divergence (real decisions/upgrades).
- **[archify-swarm](./archify-swarm/SKILL.md)**: Map a repository's architecture with several cheap/free models in parallel, verify every claimed file:line deterministically against the committed code, and compose ONE architecture map from the verified claims.
