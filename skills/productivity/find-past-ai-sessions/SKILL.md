---
name: find-past-ai-sessions
description: Hunt down an old ChatGPT, Claude, voice-recorder or agent session from fuzzy memory (a phrase, a person, a month) instead of a known URL. Connectors and full-text search first, UI scraping last. Use when the user remembers roughly what was said but not where.
---

# Find Past AI Sessions

For when the user wants an old AI conversation or recording and only remembers a phrase, a person, a vibe, or a rough date.

## Order of attack (stop as soon as you have the artifact)

1. **Ask for one hard anchor while starting**: a person's name, an exact phrase, a month, or which machine. Don't wait until title search fails.
2. **Connectors first, UI last**: cloud-drive full-text search, voice-recorder transcripts, email, local project notes, agent transcripts. Prefer indexed full text over clicking through UIs.
3. **Browser history titles are weak.** Auto-generated chat titles rarely match the user's memory. Also search history for **names and rare phrases**, not just the remembered title.
4. **Never use the chat composer to search history.** Use the app's dedicated "search chats" feature. Typing into the composer creates a new chat.
5. **A logged-out agent browser is not the user's session.** If your browser isn't signed in, use the user's own browser profile or ask them to sign in once. Don't pretend a logged-out browser can search history.
6. **Multiple machines**: if one machine's history has a gap around the remembered date, say so and ask about the other machine instead of thrashing the same database.
7. **Desktop automation is brittle**: focus the correct window, click the page body, clear the clipboard, then copy. Prefer exports over UI scraping when stuck.
8. **Side finds**: when the target is still missing, surface 2–5 nearby artifacts so the user can steer with a better anchor.

## Success criteria

- Deliver the file, chat URL, or a short list with source links.
- If not found: report which surfaces were searched, the date/machine gap, and **one** concrete next anchor, not another 20 minutes on the same path.

## Example

```text
Anchor: "the chat where we named the project with the octopus metaphor, around March"
Searched: drive full-text "octopus" (2 docs), chat export search (0), browser history Mar 1–31 (gap Mar 10–24)
Found nearby: doc "naming-brainstorm.md" (Mar 9) mentions "tentacle architecture"
Next anchor: was it on your other laptop between Mar 10–24?
```

## Use case

You remember a brilliant prompt from a chat months ago but not which tool or device. This skill searches indexed sources in a sensible order, names the gaps it hit, and stops with a concrete next clue instead of burning your evening.
