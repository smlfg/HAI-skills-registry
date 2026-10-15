---
name: automation-verification
description: Technically verify an automation against concrete criteria and current state, proving the real effect including retries, failures, recovery and stop behaviour, scaled to risk. Use when checking whether an automation actually works, as an independent verifier or as labelled self-verification.
---

# Automation Verification

Verify against concrete criteria and current state. Standalone. With separate implementation, the verifier reads independently and the named implementer makes the fixes. Label self-verification when no independent check is possible.

## Collect evidence

- Per criterion record: **expected, observed, timestamp, correlating ID, evidence, verdict** (passed / failed / unverified). Historical logs and implementer reports are hints; they don't replace a current independent readback.
- Check the chain **real user action or real input → corresponding run → target object.** Read relevant action branches and business fields: success of the overall call proves neither creation nor sending nor a status change. Proof of transport is partial while usability or business criteria are open.
- Count **all** hits of the exact test key, including pagination and unexpected duplicates. Limit printed content to the needed test data; an extra name filter must not hide bad hits. Prove original references by actually opening them. Visible text doesn't prove an attachment exists or is readable.

## Failures and repetitions

- Choose cases by risk: success; reprocessing the same event; a new event with the same business content; a relevant failure; recovery. Count **business effects**, not runs. A deliberately ignored filter case is not a technical failure.
- Test negative observations within a justified time window with proven active processing, with a positive control if needed. State the limit of the claim instead of inferring permanent absence from a short silence.
- When provoking failures: use bounded test objects, save original values, plan recovery **before** mutating. Check the actual error state and the absence of wrong effects. Restore the original and prove a successful restart. If a mutation's result is unclear, read first, then decide about repeating; if recovery fails, stop dependent tests.
- Where operationally relevant: check stop state and still-running work separately, then read back the agreed end state. A disabled trigger doesn't prove running work was cancelled or that missed events get processed later.

## Record the result

- After completed steps, log change/reason, affected files/systems, expected vs observed with evidence, open points and rollback. Store time-bound evidence so later tests don't overwrite it.
- Report implemented, tested, activated, technically accepted and handed over **separately**. Missing criteria stay open; installation or technical verification isn't a production release.
- For browser checks, take control first and hand it back explicitly. During a user action, browser and observed object stay untouched. Trigger tests only within the agreed scope and by the named actor.

## Example

| criterion | expected | observed | id | verdict |
|---|---|---|---|---|
| one row per email | 1 | 1 (and 1 after resend) | msg-7f3a | passed |
| attachment opens | PDF opens | link 404 | row 57 | failed |
| failure alert | mail to ops | not tested | — | unverified |

## Use case

An agent built a flow and says "works". Run this skill as the independent verifier: it re-triggers with a real input, counts business effects (not runs), tests duplicate handling, and produces a table where "unverified" is a first-class verdict.
