---
name: agentic-gate-verification
description: Decide whether agentic work may proceed, be marked done, merge, or spawn more work. Use when verifying a gate (PR merge, kanban verifier, mission/owner decision, Git-hygiene checkpoint, completion proof) instead of trusting a worker's summary.
---

# Agentic Gate Verification

A gate is a yes/no decision about whether work may move on. This skill makes that decision against primary evidence, never against the previous worker's report.

## Procedure

1. **Name the gate before judging it.** Classify it as one of: owner decision, schema/metadata truth, PR merge readiness, Git-hygiene checkpoint, mission/session authorization, or completion proof.
2. **Find the source of authority.** Use primary repo docs, code, config and tests, not the previous worker summary. For docs/schema work, identify the file that defines the truth before reading generated output.
3. **Check presence and correctness separately.** First prove the artifact exists; then prove its values are true against the source of authority. Tests that prove keys exist or booleans are typed do not prove the booleans are correct.
4. **Block on owner-marked questions.** If a value, trade-off, scope, merge or override must be decided by the owner, do not choose for them. Add concise context and block.
5. **Separate concept value from merge readiness.** Output can be valuable raw material and still be "do not merge" because it is draft, stale, conflicting, generated from an old baseline, or rewrites canonical docs from obsolete facts.
6. **Use Git dirtiness as a checkpoint gate, not a takeover.** Broad uncommitted state may pause new missions or agents, but the gate must never auto-commit, auto-stash, push or reset.
7. **Lead with the verdict.** `merge`, `do not merge`, `block`, `continue`, or `checkpoint first`, then one or two decisive reasons and a salvage path if there is one.

## Concrete checks

### PR merge triage

Metadata before taste:

```bash
gh pr view <N> --json number,title,state,isDraft,mergeable,mergeStateStatus,headRefName,baseRefName,statusCheckRollup,updatedAt,body,files
gh pr diff <N> --name-only
gh pr diff <N>
```

Default to **not merge yet** when the PR is draft, conflicting, stale against current main, has a body that does not match its files, contains unreproducible generated artifacts, or preserves outdated claims.

### Kanban / verifier gate

A verifier must say what it verified against. Good verifier output lists: source files read, exact declared values checked, presence checks, semantic findings, and whether owner decisions remain open. "Tests pass", "keys exist" or "schema has all fields" alone is an incomplete gate for declarative or policy work.

### Git-hygiene gate

The client gathers and filters `git status` and reports file paths; the policy kernel only classifies `continue`, `warn`, `pause` or `override`. It should not shell out to Git itself.

```yaml
git_hygiene:
  mode: advisory          # off | advisory | required
  warn_uncommitted_files: 8
  pause_uncommitted_files: 15
  allowed_during_pause:
    - summarize_diff
    - propose_commit
    - checkpoint
    - owner_override
```

Fail-closed rules for `required` mode:

- Missing telemetry is blocked, not clean. An empty object, a missing/null file list, or an override-only payload counts as missing. Only an explicitly supplied empty list is a clean tree; otherwise the gate is bypassable by sending nothing.
- Validate `override_reason` as a non-empty string. Truthy coercion lets booleans, ints or arrays override a pause.
- Return policy constants as tuples or fresh copies so callers cannot mutate global policy.

## Pitfalls

- Verifying only artifact presence. Presence catches missing work, not wrong claims.
- Letting green tests certify assertions no test encodes. Report the gap instead.
- Answering owner questions inside a headless worker. Output a block plus a decision table.
- Merging valuable-but-stale PRs. Salvage the idea onto current main.
- Making Git discipline destructive.

## Example

> **User:** Worker says PR #42 is done, all tests green. Merge?
>
> **Agent:** `do not merge`. The PR is 31 commits behind `main` and rewrites `docs/gates.md` with the old 3-gate model, while `src/policy.py` on main defines 4 gates. Tests only check that the doc's YAML parses. Salvage: cherry-pick the new validator in `src/validate.py` onto a fresh branch.

## Use case

You run several coding agents in parallel and a supervisor agent marks tickets "done". Before anything merges, run this skill as the final gate: it re-derives truth from the repo, separates "useful" from "mergeable", and kicks owner-only decisions back to a human instead of silently picking a default.
