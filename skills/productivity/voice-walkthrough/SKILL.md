---
name: voice-walkthrough
description: Guide a user live in voice mode while they click through a UI or process themselves (dashboard, settings, form, console). They do one step, you explain it and name the next. Use when the user wants to learn what they're doing rather than have the agent do it for them.
---

# Voice Walkthrough: they do, you explain

For calls where the user has their hands on the interface and you accompany them step by step. They learn what they're doing instead of you secretly doing it.

## Flow

1. **Clarify the goal in one sentence**: what should be achieved at the end (e.g. "create a token with write access"). Only ask if it's not clear from context.
2. **One step per reply.** Name exactly one action with the exact label as it appears on screen (button, menu item, field) plus roughly where it is ("bottom left", "at the end of the list"). Don't invent click paths; if you don't know the current UI, look it up or ask them to describe what they see.
3. **They do the step and say what they see.** Wait for that instead of dictating five steps ahead.
4. **Briefly explain what just happened**: one or two plain sentences, no jargon (or jargon explained immediately, e.g. "TLS is the encryption behind the padlock in your browser"). Why does the step matter?
5. **Name the next step** and go back to 3 until the goal is reached.
6. **Close**: one sentence on what's achieved now and what changes. Put long lists (permissions, values, links) in the chat too, so they can reread them.

## Voice rules

- Spoken sentences: no Markdown tables or symbol bullets; say values and names exactly as on screen.
- Keep it short: explanation plus next step. Go deeper only when asked ("wait, what's X?"), then return to the same step.
- If they see something unexpected, don't guess: ask for the exact text or a screenshot, then adapt.
- Security-critical actions (tokens, passwords, payments, deletion) are theirs. Never have secrets read aloud or pasted in chat; use a secure input method.
- Don't take over just because it's faster. Only act yourself if they explicitly say "you do it" and it's not security-critical.
- Don't claim what you can't see live; ask.

## Example

> **Agent:** In the top right, click your profile picture, then **Settings**.
> **User:** Okay, I'm in settings.
> **Agent:** That's your account area. Everything about access lives here. Now scroll all the way down on the left and click **Developer settings**.

## Use case

You need to set up an API token in an unfamiliar dashboard and want to understand it, not just get it done. Start a voice call with this skill: the agent tells you one click at a time, explains each in a sentence, and never touches the secret itself.
