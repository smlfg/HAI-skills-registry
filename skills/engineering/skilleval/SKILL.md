---
name: skilleval
description: Run the same task through several models or agents and score the artifacts against a pre-agreed, machine-checkable quality axis. Use when the user wants to compare models on a real task rather than by gut feeling.
---

# skilleval

Several models, one task, a verdict that holds.

The problem: agent artifacts almost always *look* good. If the target tool has its own validator, often *every* candidate reports green, including the ones that missed the point. Judging "by feel on screen" picks the prettier artifact, not the right one.

## Hard rule: no run without a rubric

**Before a single model starts, ONE machine-checkable quality axis must be fixed.** A valid axis is a command or script that extracts a number or pass/fail from the artifact without asking a model.

| Artifact | Axis |
|---|---|
| Architecture map | number of `file:line` claims that verify against the committed HEAD |
| Refactor | test suite green + number of changed public signatures |
| Research text | number of claims with a resolvable source (HTTP 200 + quote found) |
| Data extraction | field-by-field match against a hand-checked sample |
| Migration | row-count diff + old/new round-trip comparison |

If no such axis exists for the task: **stop and say so.** Do not fall back to "a model grades the results"; then you are evaluating the evaluator. The target tool's own validator is **never** the axis: it checks presentation consistency, not understanding.

## Procedure

1. **Fix the axis** as a command, not an intention. The owner confirms it when the choice materially changes the outcome.
2. **Write the brief once and reuse it verbatim.** Any deviation ruins the comparison.
3. **Enforce isolation.** The brief says explicitly: do NOT look at other candidates' outputs. Separate output paths per model (`<name>.<model>.<ext>`).
4. **Run in parallel** with a timeout (sub-agents for one vendor's tiers, a CLI such as OpenCode for other families).
5. **Measure the axis yourself.** Never copy the self-report.
6. **Look at visual artifacts.** Render a screenshot and inspect it; machine receipts miss things.
7. **Table + verdict + honest gaps**, including what each candidate left out.

## Self-reports are claims

A candidate reporting "12 claims, all verified" has proved nothing. Real failure modes seen in practice:

- metrics reported in chat that do not exist in the artifact;
- line numbers pointing at blank lines or imports;
- a step skipped (e.g. visual check) but reported as done.

A spot check of 6–8 claims per candidate against the source is enough to expose this.

## Report cost separately from quality

Measure tokens/cost per candidate but never mix it into the quality score. Price tier does not predict rank; in practice a cheap model can beat a mid-tier one on the evidence axis.

## Classify failures honestly

A candidate that failed on billing, auth or harness deserves **no quality verdict**; it never saw the task. Same error twice = deterministic: stop, report a hypothesis, no third attempt.

## Read divergence: the real yield

- **Agreement** = forced by the material. Nothing to decide.
- **Divergence** is one of two cases:
  1. **Genuine ambiguity**: several defensible readings because intent is not expressed in the material. That is a finding about the *project*: a design decision nobody made explicitly.
  2. **Omission**: clearly provable, one candidate missed it. A finding about the *model*.

The rubric axis separates them. Always include an agreement/divergence list, not just a ranking.

## Scope

Target repo/material is **read-only**. All artifacts go to one `generated/` folder with a run prefix. The result is a comparison; the owner chooses what to adopt.

## Example

```text
Axis: python verify_claims.py <map.json> --rev HEAD   (counts verified file:line claims)

model            verified  unverified  cost
model-a (large)      30          2     $1.90
free-model-x         26          1     $0.00
model-b (mid)        13          4     $0.40
model-c (small)       0          9     $0.05   -> zero-contribution, drop from roster

Agreement: ControlPlane, Store, OwnerGate (all 4)
Divergence (ambiguity): is projects.py its own concept?
Divergence (omission): audit chain missing in model-b, model-c
```

## Use case

You want to know which model to use for generating architecture maps of your repos. Instead of eyeballing four pretty diagrams, you define "verified `file:line` claims" as the axis, run all four once, and get a ranking plus the list of design questions your codebase never answered.
