---
name: change-isolation
description: Prevent change-anything-change-everything failures in software, agent systems, automations and integrations. Freeze a proven path, define contracts and authoritative state at each boundary, isolate one change, replay regressions, then verify one real end-to-end case. Use when integrating many agents, refactoring a fragile pipeline, or when every fix breaks something else.
---

# Change Isolation

**Principle: change one thing without unknowingly changing everything.** The goal is not maximum architecture; it is a dependable user outcome with a small, known blast radius.

The human owns the purpose and acceptable trade-offs. The agent owns discovering the current code, testing boundaries and showing evidence. Do not convert a working user task into another architecture project.

## Procedure

1. **Name the user outcome first.** What should the human be able to do after this change? Name the smallest complete path that makes it possible.
2. **Locate the working baseline.** Inspect the actual entrypoint, running state, source code, tests and logs. Record the commit/config and one observed successful run. Documentation and agent self-reports are hypotheses until checked.
3. **Draw only the active path.** For each stage write: input → output → guarantee → source of truth → measurement → known failure. Distinguish a fast preview from authoritative persisted state; an event stream can include actions later undone.
4. **Choose ONE boundary.** Define its minimal input/output contract, errors, version/identity and who owns each side. Keep a single writer for shared state. A new event creates a new immutable input snapshot; late responses for older versions are discarded.
5. **Lock the baseline with a replay.** Turn at least one real success and every known failure into fixtures/regression tests. Keep private data out of Git. Test the boundary independently before changing it.
6. **Make the smallest change behind the contract.** Reuse existing implementations first (see `prior-art-search`). Use a branch/worktree for isolation when parallel development is useful. Multiple implementations may share one contract; they must not each reinvent the pipeline.
7. **Verify both levels.** Run targeted contract tests and existing regressions; then one actual user-visible end-to-end case. Read back the effect from the authoritative state. Green unit tests alone do not certify reality.
8. **Stop at the user outcome.** Report measured gains, regressions, unverified claims and rollback. Do not expand into tuning, new frameworks or eight branches unless the measured result requires them.

## Gates

- **No baseline?** Establish one before refactoring.
- **No agreed contract?** Do not fan out independent implementations.
- **Boundary violated, stale response, lost/overwritten human data?** Fail closed; do not silently continue.
- **Working vertical slice?** Prefer using it over extending the architecture. Parallel candidates come afterward.
- **Changed stage A but not B?** Recheck B's boundary; avoid claiming every component is verified.

## Output — one boundary card

```text
Human outcome:
Baseline (command, revision, observed result):
Active path:
Boundary: input -> output | errors | version
Source of truth (not just preview):
Change + owned path:
Replay/contract tests:
Real end-to-end proof:
Regressions / unresolved:
Rollback or stop path:
Next human action:
```

## Example

A handwriting application reads pen events instantly, renders an image and returns recognized text. The event stream is a useful live preview, but cannot know which strokes the user later undid. The engineer keeps ingestion untouched, adds a versioned image/text snapshot at its output, and allows several tutor strategies to read that same snapshot. A late tutor reply from an earlier snapshot is discarded. The engineer tests this with a recorded input stream, then verifies one real write → read → answer → user-continues cycle. No parallel rewrite of the pen reader.

## Use case

Four coding agents each propose their own parser, watcher and UI to add one feature. Invoke `/change-isolation`: identify the one proven pipeline, pin its input/output contract, give each worker an isolated implementation of **only** the missing stage, verify the same replay, then integrate one smallest working vertical slice.

**Related:** `prior-art-search` prevents duplicate builds; `agentic-gate-verification` judges whether evidence is sufficient to proceed; `experiment-to-project` is for projects that lack a measurable baseline.
