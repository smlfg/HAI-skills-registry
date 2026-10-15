---
name: automation-handover
description: Hand a verified automation over to its users with a short explanation, a visible demo through the real UI, a demonstrated stop path, and one small user action they perform themselves. Use when an automation is technically accepted and needs to be handed to the people who'll run it.
---

# Automation Handover

Hand over one coherent function in the agreed scope after its technical verification. Standalone. Unverified parts stay explicitly open; a demo doesn't replace missing technical acceptance. A guided user action is not a general approval gate for technical work.

## Explanation and visible demo

- Briefly explain: what triggers the function, what the background service does, where the user sees the result. Read the explanation aloud if wanted and a speech capability is available; otherwise say so and provide a short speakable text. Use the existing environment; don't require a specific local program.
- Bring the right page and area visibly to the front. Announce scrolls and tab changes concretely. Show one proven test case through the actual UI to a usable result. Really open linked originals and relevant files: message text, file name and an opened attachment are different evidence.
- Explanation and browser control follow one flow: explain the section, show the matching action, leave the result readable. With several agents, agree on one speaker and one browser driver.
- Show one relevant, documented failure and explain detection, effect and proven recovery. An existing error view may suffice; don't re-provoke side effects just for the demo. Without a safe real failure test, label the behaviour unverified.

## Stop and own operation

- Show the actual stop path. Explain separately whether it prevents new triggers, ends running work, or only pauses. For an agreed stop demo, read the state back, check open work separately, and restore the agreed end state. Claim catch-up of missed events only with evidence.
- Provide one small user action with a recognisable result (open an original, trigger an approved test case). Say beforehand how they'll recognise success. Hand over the browser explicitly and pause your browser calls and changes to the observed object until they report done. A generic "ok" doesn't prove a successful action; check the result where access and scope allow.

## Operating guide and close

- Leave a short guide with actual paths: start/trigger, check success, recognise and fix errors, stop, restart, known limits. Link existing evidence instead of scattering internals into the guide.
- Record technical acceptance, demo shown, user action successfully performed, and production activation separately. While an agreed user action or other criterion is missing, that part stays open; independent work may continue.

## Example

```text
Explain (30 s): "New invoice mail arrives → flow parses it → row appears in Invoices."
Demo: sent test mail 14:02 → row 61 visible → attachment opened.
Failure: run #120 (malformed PDF) → alert mail → manual re-run fixed it.
Stop: Flow → Turn off. Prevents new triggers; running run #121 finished normally.
Your turn: forward test-invoice.eml to the inbox. Success = a new row within 2 min.
Status: tech-accepted ✓ demo ✓ user action ✓ production ✗ (owner decides)
```

## Use case

You built an automation for a non-technical colleague. Instead of a link and "it's live", this skill runs a short guided handover: they see it work, see it fail and recover, learn how to stop it, and do one real action themselves.
