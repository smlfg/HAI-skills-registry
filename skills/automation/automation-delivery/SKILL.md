---
name: automation-delivery
description: Implement or extend an automation as small, complete functions, from verified current state through technical acceptance, with one writer per artifact and a rollback path. Use when building or extending a workflow automation (Power Automate, n8n, Zapier, scripts, cloud functions).
---

# Automation Delivery

Deliver one observable result at a time, from the real trigger to the business effect. Standalone; the verification and handover skills are optional companions.

## Outcome and current state

- Before implementing, state the trigger, the expected effect and checkable acceptance criteria. Ask only for essential missing information; use existing authorisation rather than inventing new approval steps.
- Use documents for domain knowledge, but label **historical claims, current measurements, assumptions and planned changes** separately. Read the existing implementation and relevant live state before replacing anything. **A status file does not prove an automation works today.**
- Check the available browser/API/MCP capabilities, the signed-in identity and the target environment specifically. Being signed in to one tool doesn't prove you're signed in to another. Keep credentials out of evidence. Derive limits for accounts, permissions, external recipients and production from the current assignment; a test-only authorisation doesn't extend them.

## Implementation and roles

- Work in the order **spec → implementation → verification → rework**. If roles or sub-agents are assigned and available, separate spec, implementation and independent verification. If delegation isn't available, say so, continue yourself and label it self-verification. There is no general duty to use three agents.
- Assign **exactly one writer** per shared artifact and cloud object. Hand the verifier concrete changes and evidence; parallel readers must not treat a changing intermediate state as finished proof.
- Back up the relevant prior state and keep a rollback path proportional to the risk. Implement the smallest complete scope. Track **definition** and **effective state after publishing** separately: a local draft, a saved draft and the active version can all differ.

## Acceptance and follow-up

- Verify a real trigger, a correlated execution, and an independent readback of the target effect. Choose retry, failure, recovery and stop tests by consequence. **HTTP success or a green overall run alone does not prove the business effect.** Fix relevant errors before technical acceptance.
- After each implementation step, update the agreed work log: what and why, files/system objects, expected vs observed, evidence, open/unverified, rollback.
- Report **implemented, tested and activated** separately. Technical acceptance, user handover and production release are different states. Bundle explanation and visible demo per coherent function; don't interrupt the user for every technical step.
- In a shared browser, hand over control explicitly. While the user is typing or testing, browser calls and changes to the object they're looking at pause until they hand back. Independent local work may continue.

## Example

```text
Function: "new invoice email → row in Invoices list"
Criteria: 1 row per email; amount parsed; attachment link opens.
Prior state: flow v3 exported to backups/flow-v3.zip (rollback).
Implemented: parse step + dedupe key (message-id).
Verified: real test email 10:42 → run #118 → row id 57, amount 120.00, link opens. Re-sent same email → still 1 row.
State: implemented ✓ tested ✓ activated ✗ (awaiting handover)
```

## Use case

You're automating an office process for a client. This skill keeps the agent from declaring victory on a green run: it proves each step end-to-end against the real target, keeps a rollback, and reports "tested" separately from "live".
