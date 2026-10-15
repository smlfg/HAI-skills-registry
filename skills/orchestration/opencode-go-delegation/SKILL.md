---
name: opencode-go-delegation
description: Delegate coding tasks to OpenCode (CLI or MCP) with deliberate model routing and a mandatory verification step. Use when a coding task should run on a cheaper open-weight model instead of the main agent.
---

# OpenCode Delegation

Delegate coding tasks to [OpenCode](https://opencode.ai). Works for any project.

## Models

Pick by task, not by habit. Check what your plan actually offers with `opencode models`; rate limits differ per model. A typical split:

| Kind of model | When |
|---|---|
| high-throughput model | swarm tasks, many small parallel jobs |
| solid default model | normal implementation tasks |
| alternative family | second opinion, or when the default fails |
| multimodal model | tasks involving screenshots/images |

## Delegation routes

### Direct CLI

```bash
opencode run \
  --format json \
  --dir <working-dir> \
  --model <provider>/<model> \
  "<prompt with clear task + verification>"
```

### Via MCP (if an OpenCode MCP server is running)

- `opencode_run`: send a task, wait for completion. Always pass `providerID` + `modelID`.
- `opencode_fire`: fire-and-forget for long tasks (10+ min).
- `opencode_check`: check progress (read-only, cheap).
- `opencode_review_changes`: inspect diffs after completion.
- `opencode_ask`: one-shot question.

## Prompt construction

Every delegated prompt MUST contain:

1. **Task**: exactly what to build or fix
2. **Context**: relevant files, architecture hints
3. **Verification**: how to check it works (test command, expected output)
4. **Scope**: what NOT to touch

## Workflow

1. User describes the task.
2. Main agent writes a clear prompt + verification.
3. Delegate via CLI or MCP.
4. Review output critically; never accept blindly.
5. Success → continue. Failure → refine the prompt or split the task.

## Rules

- **Always verification.** No task without a test criterion.
- **Don't code yourself** what OpenCode can do. Delegate.
- **Choose the model deliberately.**
- **After 3 failures**: cut the task smaller or switch model.
- **Parallelise** independent tasks.
- The user decides which route to use.

## Example

```bash
opencode run --format json --dir ./api --model <provider>/<default-model> \
"Task: add pagination (limit/offset, max 100) to GET /items in src/routes/items.ts.
Context: follow the pattern in src/routes/users.ts.
Verification: npm test -- items passes; curl '/items?limit=2' returns 2 items.
Scope: don't touch the DB schema or other routes."
```

## Use case

Your main agent runs on an expensive model and you have a flat-rate OpenCode plan. This skill makes it hand routine implementation tasks to OpenCode with a test command attached, and only review the diff.
