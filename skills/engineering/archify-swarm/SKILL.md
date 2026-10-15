---
name: archify-swarm
description: Map a repository's architecture with several cheap/free models in parallel, verify every claimed file:line deterministically against the committed code, and compose ONE architecture map from the verified claims. Use when you want a trustworthy architecture diagram of a repo, not just a pretty one.
---

# archify-swarm

Read wide and cheap → verify deterministically against the code → compose once, expensively.

This skill **orchestrates** the upstream [archify](https://github.com/tt-a1i/archify) skill (interactive, validated architecture diagrams); it does not replace it. Install archify first.

## Why the detour

Lessons from a reference run (one repo, 7 models):

- **All candidates reported `9/9 green`.** One had zero evidence and omitted the central node. The validator checks presentation consistency, not understanding.
- **Price does not predict quality.** A free model ranked second on verified evidence.
- **Models almost never contradicted each other.** They saw different true parts of the same system.
- **~55% of the substance was found by only 1–2 models**, including the audit chain. Majority voting would have deleted the most valuable findings. **Consensus is not a truth function.**
- **Composing from a ~10 KB claims table cost ~114k tokens** versus ~390k for reading the repo directly, with equivalent results. The expensive step's input is capped by the table, not by repo size.

## Procedure

### 1. Preflight (always first)

```bash
scripts/preflight.sh <repo>   # exit 0 = go | 1 = blocker | 2 = warning, owner decides
```

`merge.py` later verifies via `git show <rev>:<path>`. If code is not committed, every claim comes back "unverified" and the whole run is silently worthless. Preflight checks for git, a HEAD commit, enough source files, and the share that is tracked (threshold 80%). For untracked code: commit, or map a throwaway one-commit copy. Reject empty scaffolds and check same-named sibling folders; the live code is often elsewhere. On a dirty tree, verify against HEAD and say so.

### 2. Probe the roster

```bash
scripts/probe.sh                       # all zero-cost models in the OpenCode catalog
scripts/probe.sh provider/model-id     # specific ones
```

One-line ping per model; exposes dead routes (empty credit, expired key, free-tier quota). **Dead models leave the run without a quality verdict.** The roster comes from the catalog's real cost fields, not from name patterns. Subscription plans can show `cost: 0`; report them separately as paid capacity.

### 3. Fan out

```bash
scripts/fanout.sh <repo> <generated-dir> <prefix> <model> [<model> ...]
```

Identical brief from `scripts/brief.template.md`, separate outputs, in parallel. The brief carries the isolation rule (don't look at other outputs), the evidence duty, and "write a candidate to disk early". `ARCHIFY_HOME` points at your archify install (default `~/.claude/skills/archify`). Wait for all processes (`wait` / `pgrep -f "opencode run"`) before merging; partial JSONs during the run are intermediate state.

### 4. Merge, without a model

```bash
scripts/merge.py --generated-dir <dir> --prefix <prefix> --repo <repo> --rev <rev>
scripts/merge.py ... --exclude modelA,modelB   # keep baseline maps out of the merge
```

The cluster key is **the code location, not the label**: two maps talk about the same thing when they point at the same code. (In the reference run one `paths.py:47` carried five different names.)

Output `<stem>.claims.md`: per concept the code location, `gefunden_von: n/N` (found by), **`erreichbarkeit`** (reachability), labels, real code. Plus the 2×2 on stdout. Reachability answers what "verified" doesn't: the line exists, but is it used? Determined via `git grep` on the symbol (docs/logs don't count as callers; calls in the same file do). Values: `aufgerufen` (called), `NUR TESTS` (tests only), `KEINE AUFRUFER` (no callers), `unbestimmt` (not measurable). *Script output and field names are in German.*

`claims.md` is a first-class result: it holds more than any map can show.

| | verified | unverified |
|---|---|---|
| **many models** | forced skeleton | **shared hallucination, check!** |
| **few models** | rare real insight | noise |

### 5. Compose

A **separately started, capable composer worker** builds the final map from `claims.md` using `scripts/composer.template.md` (placeholders `{{REPO}} {{REV}} {{CLAIMS}} {{ARCHIFY}} {{OUT}}`). Resolve the exact provider/model ID from your local CLI catalog; never invent IDs. Set a finite timeout and record PID, model, log and exit status. The orchestrator never writes or rewrites the composition itself.

Mandatory in the composer brief:

> Never merge concepts with different reachability into one node, even if labels sound alike. `KEINE AUFRUFER` and `NUR TESTS` are existing but unused code; mark them as dead if shown.
> `found_by 5/5` means easy to see, not important. Choose by architectural significance. Invent no evidence; only locations from claims.md.

If the composer fails, keep claims + scout maps as a partial result. No automatic full rerun.

### 6. Deliver and actually look

`--repo-root <repo>` is required once the diagram declares evidence. After `deliver`, always run `visual-check` **and look at the screenshots**: a green receipt once coexisted with an 80 px overflow. Repair only the diagnosed spot; if the error count rises two rounds in a row, revert to the last green state and report honestly.

### 7. Report

Contribution per model, agreement/divergence list, the 2×2, tokens/cost per stage, and what the composer left out. Divergence is either an open design decision in the project or a model's omission; the evidence axis separates them.

## Gates

- **Zero-contribution gate**: a model with 0 verified claims leaves the roster for future runs.
- **Access is not quality**: billing/auth/quota failures are reported separately. Same error twice → stop.

## Scope

Target repo is **read-only**. No commit, no branch switch. All artifacts in one `generated/` folder with a per-repo prefix. The owner decides which map counts.

## Example

```bash
scripts/preflight.sh ~/code/payments-api           # OK — 96% tracked
scripts/probe.sh                                    # 9 alive, 3 dead (quota)
scripts/fanout.sh ~/code/payments-api generated payments.architecture m1 m2 m3 m4
wait
scripts/merge.py --generated-dir generated --prefix payments.architecture \
  --repo ~/code/payments-api --rev $(git -C ~/code/payments-api rev-parse HEAD)
# -> generated/payments.claims.md : 38 concepts, 2x2, per-model contribution
```

## Use case

You inherit a 40k-line service and want an onboarding diagram you can trust. Instead of asking one model for a map, run four free models as scouts, keep only claims that verify against HEAD, and let one capable model compose the final map, with dead code flagged instead of wired into the main path.
