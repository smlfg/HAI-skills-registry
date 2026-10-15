---
name: cross-model-review
description: Get independent second, third and fourth opinions from different model families on a problem or solution, then synthesise convergence (validated) versus divergence (real decisions/upgrades). Use when a decision, architecture or fix matters and being silently wrong is expensive.
---

# Cross-Model Review

Have several models **from different families independently** solve the same problem, then synthesise. **Convergence = validated. Divergence = a real decision or upgrade.** No self-deception through a single model, including the one you are talking to.

Not the same as a persona council (many personas, *one* model) or delegation (getting something *built*). This is independent verification.

## Default mode: blind and independent

Give the models **only the problem, not your solution.** Ask each: "How would *you* solve this?" No anchoring, so that convergence is real evidence and not nodding along. Point them at the repo read-only and keep the prompt self-contained.

`--review` (optional): hand them an existing solution or diff and ask them to find holes. Faster, but prone to rubber-stamping. Use deliberately.

## Roster: different families = real independence

Use **at least 3 different families**. Never the same family twice; never only yourself. Typical routes:

- **OpenAI family** via the Codex CLI or MCP server, `sandbox: read-only`. Often the most reliable code reviewer. Long runs (>2 min) go to the background.
- **Google family** via Gemini CLI or an equivalent wrapper. If it cannot read local files reliably, paste the facts into the prompt.
- **A third route** such as `cursor-agent -p --mode ask --workspace <repo> "$(cat prompt.md)"` (write the prompt to a file to avoid quoting issues).
- **Optional, best-effort**: an open-weight model via OpenCode or similar. If it returns empty text, drop it rather than fight it.

Check each route with a one-line ping first; dead routes are excluded without a quality verdict.

## Procedure

1. **Write one problem brief** reusable for all: problem in 2–3 sentences, verifiable facts (paths, current state), clear task along the axes below. "Be brief and concrete; change nothing."
2. **Fire in parallel** at ≥3 families. Background the long runs; keep working.
3. **Collect** results.
4. **Synthesise.** Never dump raw outputs on the user.

## Default axes for the brief

1. **Correctness**: does it really solve the problem, idempotently?
2. **Robustness**: what breaks on edge cases, format changes, repetition?
3. **Visibility**: will a *future* break be reported, or will it die silently? (Often the actual failure.)

## Synthesis (the valuable part, never skip)

- **Convergence first**: where do ≥N/M agree? That is the high-confidence core.
- **Divergence as upgrades**: where do they differ from each other or from the existing approach? Highlight concrete findings (numbers, real bugs).
- **Tier into MUST / LATER** so the user is not buried in ten suggestions.
- **Feed MUST items back** to whoever is building before they finalise.
- **Add an empirical check** where possible: observe real end-to-end behaviour, not just opinions.

## Anti-patterns

- Anchoring by revealing your solution in default mode.
- Counting two models of the same family as two perspectives.
- Getting stuck on a flaky route.
- Passing 3–4 raw outputs to the user instead of a synthesis.

## Example

```text
Problem: nightly import job silently stopped for 5 weeks; proposed fix adds a retry.
Families: OpenAI, Google, Anthropic (3/3 responded)

Converged (3/3): retry alone is insufficient; add a heartbeat file + alert when stale > 26h.
Diverged: one model flags that the source changed its date format -> real root cause.
MUST: heartbeat + alert; parse both date formats.
LATER: move job from cron to a supervised service.
```

## Use case

You are about to ship a fix for an automation that already failed silently once. Before merging, run a blind cross-model review: three families independently propose fixes, and the one point they all agree on (make failure visible) becomes the non-negotiable part of your change.
