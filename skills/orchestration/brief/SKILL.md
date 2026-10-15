---
name: brief
description: Turn a short, vague ask into a complete task contract (objective, artifact, done_criteria, non_goals, constraints, next_step, return_format, parking_lot) with strict cardinality rules. Use with /brief, or before handing work to a sub-agent.
---

# Brief

The user types one sentence. You turn it into the complete assignment. They shouldn't have to prompt; they should say what they want.

## Procedure

1. Take the user's raw text as is.
2. If needed, look briefly at the working directory to understand what it's about. Don't guess.
3. Output the brief below.
4. Log the run (see below).

At most **one** clarifying question, and only if a wrong assignment would result otherwise. Otherwise make an assumption and make it visible under `constraints`.

## Output format

Always exactly these fields, in this order, as Markdown:

```markdown
**objective** — exactly one sentence. What is true at the end, not what gets done.
**artifact** — the one file / thing that results. Concrete path.
**done_criteria** — 2–4 checkable points, each answerable yes/no.
**non_goals** — what explicitly does not happen. At least one.
**constraints** — paths that may be touched; assumptions made.
**next_step** — exactly one action. The first.
**return_format** — field names the answer must contain.
**parking_lot** — everything from the raw text that doesn't belong to this objective.
```

## Hard rules

- **Exactly one `objective`.** No "and", no semicolon, no list.
- **Exactly one `next_step`.** One action, not a chain.
- Everything else goes to `parking_lot`. Nothing is silently dropped, nothing smuggled in.
- `done_criteria` must be checkable. "works well" isn't; "`pytest` is green" is.
- `non_goals` is never empty. If you can't think of one, the objective is too broad.

## Logging

After each brief, write `~/.briefs/<YYYY-MM-DD>-<short-slug>.json`:

```json
{
  "raw": "<the user's sentence, verbatim>",
  "brief": { "objective": "...", "artifact": "...", "done_criteria": ["..."],
             "non_goals": ["..."], "constraints": ["..."],
             "next_step": "...", "return_format": ["..."], "parking_lot": ["..."] },
  "was_useful": null
}
```

`was_useful` stays `null` and is set to `true`/`false` by hand later. This collection is the dataset for later prompt optimisation; without it there is nothing to optimise. Don't skip it, not even for small briefs.

## When the brief goes to a sub-agent

Pass the brief verbatim as the prompt and append `return_format` as a "Return format" section, adding: a missing field makes the answer invalid. If the answer comes back incomplete, **don't fill it in yourself**. Ask the agent again, naming the missing field. Make the failure visible.

## Example

Raw: *"make the export thing faster and also maybe add csv"*

```markdown
**objective** — Exporting 10k rows via `export.py` completes in under 5 s.
**artifact** — `src/export.py`
**done_criteria** — `python bench/export_bench.py` reports < 5 s; existing export tests pass.
**non_goals** — no new export formats in this task.
**constraints** — touch only `src/export.py` and `bench/`; assumed "export thing" = `export.py`.
**next_step** — run `bench/export_bench.py` to get the current baseline.
**return_format** — baseline_s, after_s, change_summary, tests_passed
**parking_lot** — add CSV export.
```

## Use case

You fire off half-sentences to agents and get half-right work back. Prefix them with `/brief`: every ask becomes one objective with checkable done-criteria, and the "also maybe" parts land in a parking lot instead of derailing the task.
