---
name: experiment-to-project
description: Turn an AI/agent experiment with several failed or half-working attempts into an evaluated, measurable project. Runs a grill-me post-mortem of the failed attempts, fixes one primary metric plus guardrails that must stay at zero, builds the test bench before the prototype, then iterates one change per measured run. Use before building yet another prototype, or when asked to "grill me", evaluate, make it SMART or professional.
---

# Experiment to Project

Core rule: **be able to measure before you build.** If nobody can say how improvement will be recognised, it is still a try-out session.

Roles: the human owns the goal, the hard limits, the ground truth and real trade-offs. The agent reads old attempts, builds the bench, measures, classifies findings and reports. Never ask the human what you can find out yourself.

## Phase 0: post-mortem of the failed attempts (grill me)

For every earlier attempt, ideally questioned by a second agent or person who keeps digging:

1. What was it supposed to do, in one sentence?
2. Where exactly did it fail? Observation, not guess.
3. Why? Keep asking until the cause is something you can change.
4. What follows: a hard limit, a rule, a test case, or "never try again"?

Output: a table *attempt → cause → consequence* and a list of hard limits (what must never happen). Every failed attempt becomes a test case.

## Phase 1: define success (SMART)

| Question | Answer must be |
|---|---|
| What does the human notice when it works? | one sentence from the user's side |
| **Primary metric** | exactly one, with a target (e.g. hit rate ≥ 90 %) |
| **Guardrails** | counts that must stay 0 and are never traded against the primary metric |
| **Cost** | seconds per run, money per day, quota |
| Scope and date | which cases, by when |

## Phase 2: test bench before prototype

1. **Test set**: synthetic cases for breadth, real cases for truth; every Phase 0 failure is in it.
2. **Ground truth per case**: what the right outcome is. No truth, no measurement.
3. **Scoring**: fixed outcome categories (hit, miss, critical, unsolicited …), never "looks good".
4. **Simulation**: the real system runs against a stand-in of its environment, so the live system and the human are not disturbed.
5. **Baseline**: measure the simplest possible solution first.

## Phase 3: smallest measurable prototype

Only as much as the bench can measure. Risky actions (write, send, delete, restart) sit behind guard checks with a kill switch before they run for the first time.

## Phase 4: the loop

1. One change, one run.
2. Read results **verbatim**, not only the numbers.
3. Attribute every finding to a cause: model, rule/code, or **the measurement itself**. A number that improves because the scorer is broken is not progress.
4. Fix the cause, log it in a findings table (round, finding, cause, fix).
5. Repeat until the targets are met or it is clear the approach does not carry.

## Phase 5: stages into reality

Simulation → replay of real data → supervised use (e.g. three clean runs) → autonomous. Each stage has a gate: the Phase 1 metrics.

## Phase 6: show what is proven

One page with the metrics across rounds, the findings table, and an honest *proven / not proven* table.

## Warning signs: still a try-out session

- Nobody can name the primary metric.
- "It worked" rests on a single attempt.
- Testing happens directly on the live system.
- Every new attempt starts from zero instead of analysing the last one.
- A model is swapped without rerunning the same test set.

## Project card

```text
Project:
What the human notices when it works:
Failed attempts (cause → consequence):
Hard limits:
Primary metric + target:
Guardrails (= 0):
Cost (time, money, quota) + limit:
Test set (synthetic / real), truth from:
Baseline:
Stages + gate per stage:
Status (date, round, numbers):
```

## Example

```text
Project: handwriting tutor agent on an e-ink tablet
Failed attempts: 8 reading variants, e.g. geometric line cut merged 8 lines into 4 (slanted writing)
  → read the whole page, snap model boxes to the real ink
  file write with UI restart logged the user out → hard limit: no restart while writing
Primary metric: hit rate on lines that need a reaction, target ≥ 90 %
Guardrails: false green on a mistake = 0, unsolicited help = 0, logouts = 0
Cost: ≤ 10 s per round, max 20 s
Round 3: 7/8 hits, 0 critical, 0 unsolicited, 7.2 s; one "miss" was a scoring bug, not the agent
```

## Use case

You have tried a project five times with different agents and each attempt "almost worked". Instead of attempt six, `/experiment-to-project` turns the five into a cause table and hard limits, fixes one number that decides success, builds a simulation that measures it, and only then lets the next prototype run, one measured change at a time.
