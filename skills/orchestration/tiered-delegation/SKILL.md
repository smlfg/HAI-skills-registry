---
name: tiered-delegation
description: Token-gated multi-agent orchestration. A top-tier model handles intent, personalisation and the quality gate; a builder model produces the volume from a validated spec; the cheapest executor does mechanical work. Use when the user wants something substantial and repeatable built (e.g. the same artifact for many items) without churn.
---

# Tiered Delegation

Goal: step-by-step, skill-based multi-agent orchestration that produces **no churn** and a **high return on tokens** for the human.

## Role hierarchy (and why the cut is there)

**Top-tier model: orchestrator + personalisation + quality gate.** The only layer that knows the user (preferences, context, taste). It understands intent, scouts material, extracts the validated spec/template, drafts the verification mandate, writes short delegation prompts, and checks the result. It writes **no bulk code**.

**Builder model (e.g. a coding agent CLI): builder / middle manager.** Takes spec + reference files + sources and builds the mass autonomously in the background. Can delegate further down.

**Cheapest executor: mechanical volume.** Be honest about which hops are actually wired and tested in your setup; encode the pattern, but don't pretend an untested hop works.

## Principle: return on tokens

Each sub-task flows to the layer that does it **best AND cheapest**.

- **Personalisation cannot flow down**; only the top has the context.
- **Execution should flow down**; the more mechanical, the lower.
- **Measure RoT, don't assert it**: check cost/tool stats after the run.

## Churn guards

1. **Validate first, then delegate.** Never delegate an unproven format. Prove one instance works, then replicate.
2. **Extract the spec/template once** (a build contract + reference files) so the executor copies instead of inventing.
3. **Short, self-contained delegation prompts**: reference paths, sources, exact output folder, scope, constraints. No follow-up questions needed.
4. **Build a verification mandate into the delegation** (check against the source, flag uncertainty).
5. **Scope it** (~7 items, not 17). Bounded work lands; unbounded work churns.
6. **Run in the background** while the human does something else.
7. **Read the report and spot-verify the high-stakes items** before "done". Say openly what the executor's sandbox could not verify (e.g. no browser screenshots).

## Guard against self-deception

Orchestration *feels* like leverage. It only pays when it produces a **validated, reused** artifact, not as a substitute for the human's own hard work. Building the machine ≠ using it.

## Honest edges

- More layers = more coordination surface = more churn risk. Add a layer only when volume justifies it.
- RoT is a hypothesis to measure, not a guarantee.

## Example

```text
Validated: 1 interactive practice page (manually built, works).
Spec extracted: BUILD_CONTRACT.md + task-01/ as reference.
Delegation (builder, background): "Build tasks 02–07 from sources/*.md following
BUILD_CONTRACT.md; copy task-01 structure; flag any number you can't verify; run
node --check on all JS; don't commit."
Gate: spot-check tasks 03 and 06 numbers against sources; styles.css byte-identical.
Result: 6 pages, one shot, no back-and-forth.
```

## Use case

You need the same kind of artifact for twelve topics. Instead of having your most expensive model write all twelve, it builds and validates one, extracts the contract, and lets a coding agent replicate the rest in the background, then checks the riskiest two.
