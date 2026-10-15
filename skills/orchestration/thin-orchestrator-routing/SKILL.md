---
name: thin-orchestrator-routing
description: Keep an expensive chat agent a thin orchestrator (intent, brief, quality gate) and route heavy multi-step work to cheaper worker harnesses on an always-on host. Use when an agent is about to do bulk generation, deep research or multi-file rewrites inside the expensive chat, or when the user wants to save premium tokens.
---

# Thin Orchestrator Routing (Return on Tokens)

## Goal

Save premium-model tokens. The orchestrator stays thin: **intent + brief + quality gate** only. Volume and operator work run on a **worker harness** (e.g. Hermes Agent, OpenClaw, OpenCode, Codex) using cheaper models, on an **always-on host**.

Successful orchestration = short orchestrator turns + the worker does the work + a checkable report. Elegant prose without a live orchestrator → worker → report chain is failure.

## Host rule

- **Default worker host = an always-on machine** (a cloud box/VM the agent controls).
- Personal laptops are often offline. Do not make them the default worker host.
- Use a personal machine only when the lane *requires* something only there (a local browser session, local files), and say so in the brief, with a fallback or a "wait until online" gate.

## Stack

1. **Orchestrator agent**: clarifies intent, writes a tight brief, dispatches, spot-checks. No long codegen, no deep research loops, no multi-file rewrites inline.
2. **Shared layer**: specs, skills, contracts, an agent directory, shared notes, so workers don't invent.
3. **Worker harness on the host**: executes tools, browser, code, research with a cheaper model.
4. **Meta-mode**: workers may extend themselves (skills, routines); the orchestrator only gates.

## Minimum contract: orchestrator → worker → report

### Orchestrator sends (brief only)

- **Goal** + success criteria
- **Prior art** (mandatory before building any new tool/script/agent/workflow): result of `prior-art-search` with REUSE / INTEGRATE / ADAPT / BUILD LAST. No build dispatch without it.
- **Constraints** / out of scope
- Paths, accounts, skills to use
- **Lane + why**: which worker profile (from the agent directory, not a guess)
- **Host**: default the always-on box; name a personal machine only as a documented exception
- **Remaining budget**: tool calls used / threshold (e.g. `4/5 → hand off now`)
- **Return shape** (below)

Do not keep building in the same turn past the dispatch point.

### Worker does

- Receives the brief on the host (one-shot CLI call; no PTY wrappers).
- Works without asking back, except for blockers only the human can resolve.
- Returns a **short** result: status, artifact paths, what was checked, open risks.

### Orchestrator gates

- Spot-check against the brief only.
- Outcome: **DONE** / **REWORK → worker** / **NEEDS YOU** (human).
- No second worker loop on premium tokens.

### Report fields

1. Dispatched? yes/no + tool count at handoff
2. Which worker / harness / host / profile
3. Result: ok / rework / wrong lane

## Hard rule: dispatch threshold

**N = 5.** If a turn would need more than 5 tool calls, generate bulk text/code, or re-read large contexts: **stop and dispatch.** N=5 is an engineering brake, not an optimum; show the remaining budget in the brief. Exceptions: the user explicitly asks for inline work, or a one-shot read under 5 tools.

## Anti-patterns

- Re-reading huge contexts repeatedly in the orchestrator
- Fan-out that still burns premium tokens
- Using the orchestrator as builder "because it's already open"
- Ignoring N=5 "just this once"
- Blind handoff to "cheap" without lane + why
- Dispatching a build without a prior-art decision
- Routing the default worker to an often-offline laptop
- Polishing orchestrator skills while the worker path is not smoke-tested green

## Example

```text
BRIEF → worker:research (host: box)
Goal: compare 3 self-hosted vector DBs for 10M embeddings; table + recommendation.
Prior art: REUSE existing benchmark repo docs; no custom benchmark harness.
Out of scope: deploying anything.
Budget: orchestrator 3/5 → handing off.
Return: table (latency, RAM, license, ops effort), 1-line verdict, sources.
```

## Use case

Your premium chat agent keeps spending its weekly quota writing code. Load this skill so it stops at five tool calls, writes a brief, and hands the build to a worker harness on your always-on server, then spends only a few tokens checking the result.
