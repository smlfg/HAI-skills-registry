---
name: exam-drill-site
description: Build or extend a static, offline, interactive exam-practice website from existing course material, one gated builder run per artifact. Each task is a micro-drill with progressive unlocking, two hint levels, exactly one named wrong path, and a "new numbers" generator. Use when the user wants an interactive practice site per course.
---

# Exam Drill Site

The orchestrating agent writes the contract and gates quality; a coding agent builds. One artifact per run; next run only when the gate is green.

## Core method: orchestrate → gate → ONE artifact per run

The orchestrator writes no large code itself. Per artifact: one builder run with the full contract in the prompt; then the orchestrator reads the diff and checks against the gate checklist. Fix errors in the **same builder thread** (no restart, no churn).

## Build contract (verbatim in EVERY builder prompt)

1. Each task: its own folder `task-XX/` with `index.html` + `task.js` + `task.css`, linking `../styles.css`.
2. Vanilla JS as an **IIFE**. No build step, framework, CDN, remote font, iframe or **network request**. Runs directly via `file://`.
3. Numbers **only** from the named local primary source. Anything unverified shows a visible `⚠ unverified` box and is never graded as "correct".
4. State: one flat `localStorage` key (e.g. `<course>-state-v1`, `state.taskXX` + `state.evidence.taskXX`). Side modes (drill, glossary) get their **own** key. All storage access in `try/catch`.
5. One step at a time: locked sections carry `.locked`; `unlock()` frees only the next. At least 2 hints; model solution only after an own attempt.
6. **Exactly one named wrong path** (`data-route="wrong"`) that blocks progress and explains mechanically what's wrong; the right path leads to a visible exam-style completion.
7. Numeric checks with tolerance (±0.01) via an `ok()` helper, not regex.
8. "Shaky" can be saved anytime; "Solid" stays locked until `evidence.taskXX.completed`.
9. Real buttons/inputs/labels, `aria-live="polite"`, visible `:focus-visible`, colour never the only signal, responsive to 1024 px, no horizontal overflow.
10. Overview page counts tasks dynamically via `tasks.length`; never hard-code the count.

Name a reference task explicitly (e.g. `task-08/`) so the builder copies instead of inventing.

## Three upgrades that make it effective

1. **"Again, new numbers" generator.** `generate()` rolls clean parameters, a pure `calculate()` derives the expected values, and `ok()` uses the **same** function (single source of truth, no hard-coded answers). The first case stays the canonical exam example. Don't randomise tasks bound to a fixed exam PDF.
2. **Tutor-agent anchor per task.** A copyable prompt that forces check mode: "Give me a structurally identical task with new numbers, let ME calculate, then check step by step and name the error concretely. Don't solve it for me."
3. **Media slot per task (offline-safe).** `<section class="media-anchor">` with `<video preload="none">` on a local path plus a fallback text; hidden when the file is missing. Filled later by `spoiler-free-shorts`.

## Gate checklist (after each run)

1. **Offline**: `grep -rniE "https?://|cdn|fetch\(|@import url\(http" <artifact>` is empty.
2. **Contract**: storage in try/catch, `aria-live`, `.locked` unlocking, exactly one blocked wrong path, own state key for side modes.
3. **Numbers**: recompute every expected value yourself against the primary source. Render image-only PDFs with `pdftoppm -r 150 -png` and read them.
4. **Syntax**: `node --check` on EVERY created/changed `.js` (catches unescaped quotes in embedded data, the most common break).
5. **Links**: all referenced local files exist; overview lists every task; prev/next chain is intact.
6. **No regression**: existing tasks and the start page still load cleanly.
7. **Manual smoke**: click one task + "again", console clean, no overflow at 1024 px.

## Lessons

- **One artifact per run + gate beats batching.** A syntax error caught by `node --check` would have drowned among five other files.
- **Check for duplicates before building.** Map every exercise PDF to existing tasks. No clean unused source? Don't force an artifact; say so and name the next real source.
- **Weave in what exists.** Glossary cards → searchable glossary; flashcards → drill mode; diagrams → topic links. Usually the biggest lever.
- **Builder fallback without churn.** If the main builder hits its usage cap, do small mechanical edits yourself and send larger builds to another coding agent.
- **Don't trust the builder's self-report.** The gate is yours.

## Procedure

1. **Scan** the target site + course folder for ready, unused material; read an existing `BUILD_CONTRACT.md` (it's binding).
2. **Map** exercise sources to existing tasks; mark duplicates and ⚠ cases. Ambiguous direction → ask (2 options).
3. **Sequence**: repair/consolidate → new tasks from unused sources → side modes → integration (start page, nav, contract update).
4. **Per artifact**: builder run → gate → green → next.
5. **Close**: full offline check + `node --check` on all new JS + link check. No commit without explicit approval.

## Example

```text
Run 3/7 — task-11 "cache address split" from exercise-04.pdf
Builder: coding agent, workspace-write, contract + task-08 as reference
Gate: offline ✓ contract ✓ numbers ✓ (tag/index/offset recomputed: 18/10/4)
      node --check ✗ → glossary-data.js:212 unescaped quote → fixed in same thread → ✓
Next: run 4 (glossary mode, own state key)
```

## Use case

You learn best by doing small calculations with instant feedback. Point this skill at your course folder: it builds an offline practice site where every task unlocks step by step, blocks the classic mistake with an explanation, and gives you fresh numbers on demand.
