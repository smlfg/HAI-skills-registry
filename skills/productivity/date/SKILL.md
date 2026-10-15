---
name: date
description: Anchor every relative time expression to the real system clock (date, time, ISO week, day of year, timezone) before answering. Use whenever the user says today, yesterday, tomorrow, this/next/last week, a weekday, morning/evening, or similar.
---

# Date

Models guess dates. This skill makes the agent read the clock instead.

## Triggers

today, now, current · yesterday, the day before · tomorrow, the day after · Monday…Sunday · this/last/next week, month, year · morning, noon, evening, tonight · term start/end, exam period (or any calendar term the user uses)

## What to do

Run:

```bash
date '+%Y-%m-%d %H:%M:%S %Z (week %V, day %j)'
```

Then answer with:

```text
📅 DATE: <YYYY-MM-DD>
🕐 TIME: <HH:MM:SS>
📆 ISO WEEK: <WW>
📆 DAY OF YEAR: <DDD>
🌍 TIMEZONE: <TZ>
💬 MEANING: <what "yesterday" etc. concretely resolves to>
```

## Rules

- ALWAYS run `date` first. Never assume.
- Translate relative expressions into concrete dates.
- Mind the user's timezone if it differs from the machine's.

## Example

> **User:** What did I plan for next Tuesday?
>
> **Agent:** (runs `date` → 2026-10-15, Thu, week 42) "Next Tuesday" = **2026-10-20** (week 43). Looking up your plan for that date…

## Use case

Your agent keeps confusing "next Friday" with "this Friday" or assumes the training-cutoff year. With this skill, every time-relative request starts from the real clock and states the resolved date explicitly.
