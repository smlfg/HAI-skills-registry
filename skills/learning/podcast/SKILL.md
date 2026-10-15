---
name: podcast
description: Produce an audio podcast from source material (doc, text, link, topic) via Google NotebookLM's MCP server. Use when the user asks for a podcast, an audio overview, or "turn this into audio".
---

# Podcast via NotebookLM

When the user wants a podcast, **always use NotebookLM** (via a NotebookLM MCP server, tools named like `notebook_create`, `source_add`, `studio_create`, `studio_status`, `download_artifact`). Never hand-roll audio.

## Before the run

**Check auth** (e.g. `server_info`). If not configured, ask the user to run the CLI login (e.g. `nlm login`) in a terminal, then continue.

## Steps

1. **Clarify the source.** Three cases:
   - Existing doc/file → use the path. **If it lives in a project folder, add the whole relevant folder** (all .md/.txt/.pdf) as sources, not just one file; more context makes NotebookLM better.
   - Topic without text → first write a short, speakable source text (~700–1000 words, `##` sections, honest, no marketing). For larger content, delegate the writing to a cheaper model.
   - Link / YouTube → URL source.
2. **Create a notebook**: `notebook_create(title=...)`, keep the `notebook_id`.
3. **Add sources**: `source_add(notebook_id, source_type=file|text|url, ..., wait=true)`.
4. **Generate audio**: `studio_create(notebook_id, artifact_type="audio", language="<lang>", custom_prompt="<goal, tone, honesty notes>", confirm=true)`. Default format is the two-voice deep dive; shorten via the length option.
5. **Poll** `studio_status(notebook_id)` until ready. Generation takes minutes; don't block the main session, check at intervals.
6. **Download**: `download_artifact(notebook_id, artifact_type="audio", output_path="<project>/<name>.m4a", wait=true)`.
7. **Report** the audio path and notebook URL.

## Principles

- **Delta, not recap.** The listener usually knows their own plans and documents. Always instruct: "The listener already knows the context; no retelling of the starting point; focus on what's new, decisions, conflicts, reasons, next steps." For recap podcasts choose a shorter length; 30 minutes is usually too long.
- **Honesty in content**: don't claim features or capabilities that don't exist (especially for onboarding/product podcasts).
- **Language**: use the user's preferred language by default.
- Clarify tone, length and focus briefly if unclear; don't guess.

## Example

```text
Source: docs/architecture/*.md (6 files)
custom_prompt: "Listener built this system. Skip the overview. Focus on the two
decisions made this week (queue → event log; drop the cache) and their trade-offs.
Max ~12 minutes. Don't claim the migration is finished — it isn't."
→ ./podcasts/arch-decisions-week-41.m4a + notebook URL
```

## Use case

You wrote a long design doc and want to absorb the decisions on a walk. Ask for a podcast: the agent loads the whole docs folder into NotebookLM, steers it toward "what changed and why", and drops an m4a next to the doc.
