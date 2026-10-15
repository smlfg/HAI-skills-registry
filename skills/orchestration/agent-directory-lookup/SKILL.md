---
name: agent-directory-lookup
description: Pick a delegation target only via a curated agent directory with tiers and allowed/forbidden capabilities, never by guessing from profile names. Use when delegating a task to another agent profile among many.
---

# Agent Directory Lookup

When delegating to another agent profile, choose the target **only** through this procedure. Don't guess profiles from names, don't use memorised lists; they go stale.

## Procedure

1. Read the agent directory (e.g. `AGENT_DIRECTORY.md` in your harness config).
2. Candidates are only entries with `Tier: T1`.
   - `Tier: T2` only if the user named that profile explicitly.
   - Entries without a `Tier:` line count as T1 until the directory is fully annotated.
   - Profiles not in the directory, or in an archive folder, are **not** delegation targets.
3. Match on `Role:` and `May:` / `May not:`, not on the name.
4. No matching T1 profile? Don't delegate. Ask the user or do it yourself. Don't create a new profile ad hoc (that has its own process).

## Why

With dozens of equal-rank profiles, every delegation decision is expensive and error-prone ("wrong profile selected" is a classic failure). A T1 filter keeps the choice set small (~15). A periodic audit job can propose demotions; the human decides.

## Directory entry format

```markdown
### research
Tier: T1
Role: web and doc research with cited sources
May: browse, read repos, write markdown reports
May not: send messages, push code, spend money
```

## Example

> Task: "summarise the last 20 issues in repo X and draft a triage table".
> Directory: `research` (T1, may read repos, write reports) vs `repo-ops` (T2, may push).
> → delegate to `research`. `repo-ops` is T2 and wasn't named by the user.

## Use case

You run many specialised agent profiles and your orchestrator keeps handing tasks to a stale or over-privileged one. With this skill it always consults the directory, filters to tier-1, and matches on capabilities, so delegation stays predictable.
