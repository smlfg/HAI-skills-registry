---
name: eval
description: Run real tests or evals against a plan file, store results per version and compare with the previous baseline. Use when the user wants to evaluate a version of a system rather than review its code.
---

# Eval

1. Read the plan file the user names.
2. **Always run actual tests** (pytest or the project's eval framework). Never evaluate by code review alone.
3. Write results into that version's eval folder (e.g. `evals/<version>/`).
4. Compare against the previous version's baseline and call out regressions first.
5. Commit the results with the message `eval: <version> - <summary>` (only if the user allows commits in this repo).

## Example

```text
evals/v0.4/results.json   42/50 pass (v0.3: 39/50)
Regressions: case_17 (date parsing), case_31 (empty input)
Improvements: case_02, case_09, case_22, case_40, case_44
```

## Use case

You iterate on a prompt pipeline and keep claiming "v4 feels better". `/eval plan.md` runs the same suite on v4, writes the numbers next to v3's, and tells you exactly which cases got worse.
