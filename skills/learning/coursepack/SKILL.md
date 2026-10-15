---
name: coursepack
description: Push an entire course folder into Google NotebookLM and generate prioritised study media (audio, video, study guide) per topic and per exercise sheet, driven by the learner's real gaps and exam dates. Use when the user wants "everything from this course" turned into a learning pack.
---

# Coursepack: course folder → NotebookLM → prioritised study media

Works for any course folder (lecture slides, scripts, exercise sheets, notes, code).

Tools: a NotebookLM MCP server (`notebook_list`, `notebook_create`, `source_add`, `notebook_get`, `studio_create`, `studio_status`).

## Before the run

1. **Check auth.** On error, ask the user to run the CLI login (e.g. `nlm login`).
2. **Clarify scope** if not already given: (a) upload only course-relevant material vs. really everything; (b) new notebook vs. extend an existing one; (c) which media (default: audio + video + study guide). If the user already said "everything", don't ask again.

## Step 1: Find or create the notebook

**Never blindly create.** Run `notebook_list` and look for a notebook for the same course (also with different titles). Found → reuse it and add sources there, even for partial material (one mock exam, one sheet). Only if none exists: `notebook_create(title="<COURSE> — full course folder")`.

## Step 2: Scan and categorise

`find <folder> -type f`, decide per extension:

- **Upload directly** (`source_type="file"`): pdf, txt, md, docx, csv, epub, audio, mp4, images.
- **Paste as text** (`source_type="text"`, title = relative path): html, source code, json, ics, extensionless text. Use raw `cat`, not line-numbered tool output.
- **SVG / Excalidraw**: don't paste raw markup; extract only text labels and add 1–2 sentences of context.
  - SVG: `grep -oP '<text[^>]*>\K[^<]*(?=</text>)' file.svg`
  - Excalidraw: `python3 -c "import json;d=json.load(open('f.excalidraw'));[print(e['text']) for e in d['elements'] if e.get('type')=='text']"`
- **Large generated HTML** (>2000 lines): extract the didactic content (headings, paragraphs, code, quiz questions) instead of dumping CSS/JS.
- **Skip** (and list in the report): `.git/`, compiled binaries (`file <path>`), raw test data, web-scrape assets, empty files, archives without plausible learning content (`unzip -l` first).

## Step 3: Upload

Batches of ~8 in parallel. On `status:"error"` retry once, then record as failed instead of looping.

## Step 4: Didactics: ask the learner's own rules

If the user has a tutor agent or a learning-preferences file, read it and follow it. Don't guess what "didactically good" means for this learner. Typical high-value rules:

- **Coach mode by default**: diagnose → mini-explanation → next small step → learner's turn. No full solution unless explicitly requested.
- **Active retrieval beats passive media**: concrete example → own attempt → recall/explain-back → check → transfer. Media that only reads facts aloud isn't effective.

## Step 5: Derive topics from the material

Read status/todo files, session notes, glossary cards, self-assessments. Build a topic list (typically 5–8 per course). **A spoken or written self-assessment ("I get X, I don't get Y") is gold**: extract it verbatim as a gap list and correct wrong statements in it.

## Step 6: Prioritised topic list

One task per topic, prioritised: (1) upcoming exams/deadlines first, (2) diagnosed gaps, (3) the rest in course order. Each task names at least three concrete media aspects tailored to the known gaps.

## Step 7: Generate

- **Whole-notebook artifacts** (default: audio deep dive, explainer video, study guide) without `source_ids`.
- **Per exercise sheet**: find numbered PDFs and pass `source_ids=[<that sheet>]` so the artifact is focused. Always set a `title` ("Sheet 3 — Podcast") or the studio panel becomes unreadable.
- **Always fill `custom_prompt` / `focus_prompt`** with the didactics: "Coach mode: ask a short comprehension question after each concept; don't read out a finished solution; explain along the known gaps; example → own reasoning step → resolution." For exercise sheets: "Don't pre-empt the solution; teach the approach."

## Step 8: Async

`studio_create` returns `in_progress` immediately. Don't poll in a tight loop. Start all generations, then check `studio_status` later (15–25 min) and report title, status, link.

## Lesson from practice

Pre-rendered podcasts/videos are good for **review**, weak for **first understanding**: they can't wait for the learner's answer. What actually makes concepts click is a live **micro-drill**: one tiny task → learner answers → immediate Right / Almost / Not yet → next task with the same structure and new numbers. After each generated piece, follow with a short live micro-drill on the same concept before calling the topic done.

## Principles

- Never guess course topics; derive them from the material.
- Self-assessments are the most important prioritisation source.
- Exam dates beat course chronology.
- Content over raw format for SVG/HTML.

## Example

```text
Notebook: "ALGO — full course folder" (reused, +37 sources; 4 skipped: .git, 2 binaries, empty file)
Topics (prio): 1 Recurrences (exam in 9 days, self-assessed gap) 2 Heaps 3 Hashing ...
Generated: audio deep dive (coach prompt), explainer video, study guide,
           Sheet 1–6 × {podcast, video} with source_ids scoped to each sheet
Status: 15 in progress → check after 20 min
```

## Use case

Two weeks before an exam you have a messy course folder of slides, sheets and notes. Run `/coursepack`: everything lands in one NotebookLM notebook, topics are ranked by your actual gaps and exam date, and each sheet gets focused media that teach the approach without giving away the answers.
