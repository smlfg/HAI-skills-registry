---
name: prior-art-search
description: Mandatory reuse gate before building any new tool, script, agent, hook, integration, workflow or architecture. Searches internally, in official docs, and externally, then decides REUSE / INTEGRATE / ADAPT / BUILD LAST. Use before starting or dispatching a build.
---

# Prior Art Search (Reuse Gate)

Principle: **Search → Evaluate → Reuse → Adapt → Build last.** Building your own is the last option, not the default.

## Steps

1. **State the problem generically**, in one sentence, without tool names.
   - Bad: "My orchestrator can't read the coding agent's tmux output."
   - Good: "An orchestrator needs a signal when a coding agent finishes, plus its last answer."
2. **Search internally** (avoid duplicate work): current repo and its state/notes files, the owner's other repos, installed skills and plugins, installed packages (`pip list`, `npm ls -g`), running services, shared notes/wiki, earlier attempts and agent transcripts.
3. **Search official sources**: docs of the tool you already use. Hooks, `--json` / `--output-format` flags, SDK/API, plugins/connectors, config options, native OS features. This is the most frequently missed hit.
4. **Search externally**: 2–4 searches with different wording (GitHub, PyPI/npm, "<problem> open source"), including the general pattern, not just keywords. **Open** every candidate; only link what actually exists.
5. **Evaluate** at most 3 realistic candidates: coverage · maintenance (last commit/release) · license · security · integration effort · running cost.
6. **Decide** in this order: (A) enable an existing feature → (B) `REUSE` a component → (C) `INTEGRATE` / configure → (D) `ADAPT` minimally → (E) `BUILD LAST`. Anything beyond a thin glue layer under `BUILD LAST` needs one sentence on why the best candidates fall short, and an owner gate before new architecture.
7. **Verify** the reuse solution with one real end-to-end case. Installation alone is not success.

## Output

Write into the repo's state file under `## Prior Art`, or into the worker brief / report. Max 15 lines:

```markdown
## Prior Art
Problem: <generic sentence>
Searched: internal ✓ · official ✓ · external ✓ (<search terms>)
Candidates:
- <name> — <link/path> — covers <x>, lacks <y>
Decision: REUSE | INTEGRATE | ADAPT | BUILD LAST
Saved: <what we don't have to build/maintain>
Residual risk: <what still needs an E2E test>
```

In voice mode, say only decision, saving and residual risk; never read link lists aloud.

## Stay proportional

- Small change in existing code → steps 2–3 only, five minutes.
- New agent / tool / workflow / architecture → all steps with an explicit candidate comparison.
- Found a fit → take it, stop searching.
- No access to web/code/docs → say so; never claim there is no prior art.

## Example

```markdown
## Prior Art
Problem: An orchestrator needs a signal when a coding agent finishes, plus its last answer.
Searched: internal ✓ · official ✓ · external ✓ ("agent stop hook", "tmux agent manager")
Candidates:
- Claude Code Stop hook — official docs — covers completion signal + last message, lacks multi-agent view
- agent-deck — GitHub — covers session list, lacks structured last answer
Decision: INTEGRATE (Stop hook writes JSON; orchestrator tails it)
Saved: no custom terminal parser or supervisor daemon
Residual risk: hook payload format across CLI versions
```

## Use case

Your agent is about to spend an evening writing a custom watcher daemon. Running this gate first finds the CLI already ships a hook for exactly that signal, and the "project" shrinks to a 20-line glue script.
