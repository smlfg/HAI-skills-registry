---
name: m365-pilot-browser-ops
description: Run gated synthetic Microsoft 365 / Power Automate pilots in an existing signed-in browser session: inspect, connections, draft, publish, activate, test, one individually authorised gate at a time. Use when operating a non-production M365 pilot through the browser.
---

# M365 Pilot Browser Ops

Run a synthetic M365 pilot as a sequence of individually authorised gates. An approval applies **only** to the gate it names; never bundle publish, activation, communication, run, commit and push.

## Before the first gate

1. Read the project rules and determine from authoritative project sources: allowed identity, tenant/environment, test site or other target surface, data classification, active/parked work, and Git rules. Don't invent values.
2. Confirm only synthetic data and a non-production target are used. Unclear identity, a production target or conflicting rules: stop.
3. Always separate **project state** (from project sources) from **technical findings**. A technically built draft doesn't lift `PARKED`. Use provable technical states like `INSPECTED / NOT_DECISIVE`, `CONNECTIONS_CONNECTED`, `DRAFT_BUILT`; never claim a higher state from intention or UI proximity.

## Tool boundary

- Use an existing project-bound MCP for suitable semantic read-only queries.
- Use browser control for Power Automate / M365 surfaces, existing signed-in sessions, and steps the MCP doesn't cover. Never silently switch to another browser, account, tenant, admin tool or broader API.
- Passwords, MFA, tokens, consent and other credentials stay with the human. Never ask for them in chat, files, prompts or logs.
- If the authoritative DLP/admin view isn't reachable or isn't conclusive, the DLP gate stays `INSPECTED / NOT_DECISIVE`, never `PASS`. That blocks publish, activate, communication, run and any gate whose safety depends on DLP.
- A separately authorised, unpublished design-time connection/setting/draft step may happen despite `NOT_DECISIVE` if project rules and the target allow it. It's neither a DLP go nor a pass and opens no further gate.

## Roles

Three separate roles: exactly **one browser operator** using the existing session, serially (never parallel browser agents); a bounded **evidence writer** briefed with Goal, Non-goal, Boundaries, DoD and Stop criterion; an independent **read-only verifier** who changes neither browser, files nor Git.

## Gate protocol

Only as far as assigned:

1. **Inspect**: environment, licence hints, DLP view, existing target resources, read-only.
2. **Connection**: check existing connections; creating or re-authenticating is its own mutation within this named gate.
3. **User setting / config**: each setting is a separately approved mutation.
4. **Draft build**: only the described synthetic draft; save it.
5. **Publish**: only the evidenced draft.
6. **Activate**: only the published flow.
7. **Communication / test mail**: only the approved synthetic message; read back recipient, sender and marker first.
8. **Run**: exactly one approved synthetic run.
9. **Readback / acceptance**: read-only against defined criteria; derive no fixes.
10. **Recovery**: only the named, reversible recovery.
11. **Evidence**: log observed state and non-actions.
12. **Commit**: only the named evidence files.
13. **Push**: only after a separate push go.

Before each mutation, read back target account, tenant/environment, object name, object ID if it exists (for a new flow, record `no persistent ID yet`) and the exact change. After each mutation, read the same fields and visible status again; after saving a new flow, flow ID and URL are mandatory. Stop on any deviation, unexpected dialog, auth prompt, missing permission, production data, irreversible side effect, or when the next action belongs to an unapproved gate.

After each gate report briefly: observed state, change made, follow-up actions explicitly **not** taken, next closed gate. Never assume the next approval.

## Example

```text
Gate 4 DRAFT_BUILD — done
Account: pilot-user@<test-tenant> · Env: Pilot-Sandbox · Flow: "Synthetic Intake v1"
Change: created draft with 3 actions (trigger: new item in Test List)
Readback: saved; flow ID 3f…c2; URL recorded; status Off
Not done: publish, activate, test mail, run
Next closed gate: 5 PUBLISH (needs explicit go)
```

## Use case

You're piloting a Power Automate flow in a client's sandbox tenant with an agent driving the browser. This skill ensures "build the draft" never quietly becomes "publish, activate and send a test mail", and that each step leaves a readback trail.
