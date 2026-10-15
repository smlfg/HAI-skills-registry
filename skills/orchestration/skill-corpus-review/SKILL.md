---
name: skill-corpus-review
description: Review an imported skill corpus across harnesses for coverage gaps, reusable patterns, and what's worth promoting to a shared library. Use after a multi-harness skill import, or when asked what's interesting or missing in a skill collection.
---

# Skill Corpus Review

## What to look for

1. **Harness coverage**: per harness (e.g. Claude Code, Codex, Hermes, your agent platform), what is live in the library vs only staged?
2. **Personal vs marketplace**: separate user-authored skills from bundled marketplace trees and third-party copies.
3. **Patterns that matter.** Prefer skills that encode:
   - fail-closed gates (one approval ≠ the next gate)
   - evidence over status files
   - single-objective discipline (one next action, a clear done)
   - anti-patterns the author already knows about their own failure modes
4. **Gaps**: name the largest missing harness or category without dumping the inventory.
5. **Favourite pick**: one concrete favourite with a reason (structure, rarity, honesty), not a top ten.

## Output shape

- Short coverage table by harness
- 2–4 pattern observations
- One favourite + why
- Optionally one concrete next import offer

## Do not

- Recite every skill name.
- Count marketplace bulk or copied third-party skills as the user's originality.
- Leak private absolute paths, tenants or secrets from skill bodies into the review.

## Example

```text
| harness | live | staged | personal |
| claude  |  18  |   4    |   16     |
| codex   |   5  |   2    |    5     |
| hermes  |  22  |  90    |   12     |

Patterns: 9 skills encode fail-closed gates; 4 separate "tested" from "activated".
Gap: no skill for incident post-mortems.
Favourite: agentic-gate-verification — it refuses to treat green tests as proof of semantic claims.
```

## Use case

After importing 70 skills from three tools, you want to know what you actually have. This skill produces a one-screen review: coverage, the patterns that make your skills distinctive, one gap, and one favourite.
