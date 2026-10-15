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
