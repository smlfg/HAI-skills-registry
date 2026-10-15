---
name: spoiler-free-shorts
description: Add a short (60–90 s) NotebookLM video to each task of an existing interactive learning page, using a parallel example so the short never solves the task, then embed and verify it. Use when the user wants per-task explainer shorts on an existing practice site.
---

# Spoiler-Free Shorts

Downstream of a course notebook: media per **single task**, embedded into a page that already exists. Never build a new page; always dock onto the existing one.

Tools: NotebookLM MCP (`notebook_get`, `studio_create`, `studio_status`, `download_artifact`) or its CLI, `ffprobe`/`ffmpeg`, a headless browser (e.g. Playwright).

## Three insights that carry it

### 1. Spoiler guard: ALWAYS a parallel example

A short that walks through the task's own numbers **destroys the task**. If the task is `f = 3n+17, g = 2n` → `c = 2, n₀ = 17`, the short shows `f = 2n+5, g = n` → `c = 3, n₀ = 5`: same mechanics, different numbers. Transfer remains the learner's job.

Read the task **and the model solution**, write both into a `spoiler_guard` ("Forbidden: …"), invent a parallel example, and forbid explicitly in the prompt: *"The expressions 3n+17 and 2n must not appear."*

### 2. Put the language instruction in the prompt, not just the parameter

`language=<x>` alone sometimes flips to English for short videos. Start every `focus_prompt` with an explicit language rule covering speech, subtitles and on-screen labels. Tolerate established technical terms; don't regenerate for them.

### 3. Real gaps beat sheet structure

Building shorts in sheet order is obvious and misses the point. If you have a transcript or notes from a study session, extract what's **solid vs shaky**, and turn the learner's most expensive mistakes into their own shorts. Those are worth more than any sheet-order short.

## Prompt contract: a director's plan, not a keyword

- **Exactly one concept.** Name forbidden extras ("no master theorem", "no second formula").
- **One continuous mini example** with real numbers, step by step.
- **Large visible states**, short labels, no definition dump.
- **A closing question, left unanswered** (becomes the page's recall box).
- For error repair: show the wrong way **crossed out**, then the right one.

Keep prompts in a queue JSON (`id`, `task`, `output_path`, `spoiler_guard`, `focus_prompt`): documentation plus cheap re-runs.

## Procedure

1. **Get task cores** (delegate reading many HTML pages to a cheap scout): title, topic, real numbers, solution values (= spoiler guard).
2. **Scope source IDs narrowly**: the relevant sheet PDF plus context/preferences, not all 120 sources.
3. **One test run** first; check language, format, spoilers. Then the rest.
4. **Batches of 5–6.** After that expect a rate-limit error; wait a few minutes. Not a bug.
5. **Poll in a loop that also reports failures**, not just success.
6. **Download + poster**: `ffmpeg -ss 3 -i short.mp4 -frames:v 1 poster.webp`. Never take the poster from the result frame. File size says nothing about an empty frame; look at it.
7. **Embed** and **verify** (below).

Field-name trap: MCP returns `artifact_id`; some CLI JSON returns `id` in a top-level array. Status is `unknown` while generating, `completed` after.

## Embedding

Place after the page header, before the task section:

```html
<section class="media-pre">
  <h2>Watch first</h2>
  <p>Different numbers from your task, on purpose. You transfer the mechanics.</p>
  <video class="short-player" controls preload="metadata"
         poster="../media/posters/task-03.webp" src="../media/task-03-short.mp4">
    Your browser does not support video.</video>
  <div class="recall-box"><strong>Instant recall</strong> &lt;the short's closing question&gt;</div>
</section>
```

Respect the site's build contract: CSS goes into the task's own `task.css`, never the shared stylesheet; no CDNs; never touch `task.js` or storage keys. Cross-cutting shorts go as links on an overview/roadmap page. **An orphaned MP4 is not a result**; only report done after embedding.

## Verification, and two false alarms

Headless browser checks: video loaded and **portrait** (`videoHeight > videoWidth`), poster set, recall box present, no console errors, task state still saves. Resolve relative paths with `ls` first; the `../` depth is the most common error.

- **False alarm 1: `net::ERR_ABORTED` on the MP4.** Not a 404; `preload="metadata"` aborts the rest on purpose. If `videoWidth` is set, it loads.
- **False alarm 2: state doesn't save.** The save button is usually gated by design (checkboxes, proofs). Tick prerequisites first; read `task.js` before calling it a bug.

## Stance

Absence of evidence in the chat is not evidence of absence. The learner may have worked for an hour on paper. Don't accuse them of procrastinating. The line isn't "media vs no media" but *media that pull you into the task* vs *systems that replace it*.

## Example

```text
task-03 (Big-O proof): spoiler_guard = "3n+17", "2n", "c=2", "n0=17"
parallel example: f=2n+5, g=n → c=3, n0=5
focus_prompt: "LANGUAGE: entire short in English incl. labels. One concept: finding c and n0 …
               Forbidden: 3n+17, 2n. End with an unanswered question."
→ media/task-03-short.mp4 (1:09, 406×720), poster at 3 s, embedded, verified
```

## Use case

You built a practice site and want a quick visual primer on every task, without the video giving away the answer. This skill generates each short from a parallel example, embeds it above the task with an unanswered recall question, and verifies it actually plays.
