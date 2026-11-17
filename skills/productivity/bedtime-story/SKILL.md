---
name: bedtime-story
description: Write a long, true-story bedtime chapter for the end of a good or a bad working day, so the user can put the day down without the nightly verdict on themselves. Use when the user says "bedtime story", "Einschlafgeschichte", "tell me something to fall asleep to", or winds down late after a hard day.
---

# Bedtime Story (agent → human, end of day)

A day with agents ends in a head full of open loops. On bad days it ends in a verdict: "I know what I should do and I am not doing it." This skill writes one long piece of prose that the user reads or listens to while falling asleep. It does not solve anything. It moves the day from "judging" to "put down".

The reference output is [`references/benchmark.md`](./references/benchmark.md). Read it before the first run.

## When

- The user asks for a bedtime story or something to fall asleep to.
- The user says they are finally tired after a long or hard session and wants to wind down.

Not when the user signals acute distress or danger. Talk to them first. A story is not an answer to a crisis.

## Inputs (take them from the conversation, do not interview)

1. **Valence of the day**: good, mixed or bad.
2. **One concrete thing the user did today** (a commit, a call, a page of maths, a walk).
3. **What weighs on them tonight**, in their own words.
4. **Who or what they admire** (fields, people, kinds of mastery).
5. **Register**: non-fiction chapter (default) or fable. Users who fall asleep to non-fiction audiobooks want the chapter.
6. **Length**: what the user asks for; default about 2,500 words.

If input 2 is missing, ask one question: "What is one thing you did today?" Ask nothing else.

## Flow

1. **Pick one thread** that connects what weighs on the user with how people they admire actually worked. One thread, not five.
2. **Collect 5 to 7 true episodes** for that thread. Each needs a person, a year, a place and one physical detail (a notebook, a measuring instrument, a gravel path).
3. **Write the chapters** in the order: far away in time and field first, closer to the user's field later.
4. **Write one synthesis chapter** that names what the episodes share, as plain observations.
5. **Write the last chapter about the user's own day**: the one concrete thing from input 2, told in third person, in the same factual tone as the historical episodes, at its true size.
6. **Close** on work being put down for the night and still being there in the morning. Then one short good-night line.

## Rules

- **True stories only.** Every name, year and number must be something you can stand behind. No invented quotes. If you are unsure of a figure, give the order of magnitude or leave it out.
- **Do not shrink the people the user admires.** Show how much work their mastery cost. The comfort comes from the cost being visible, not from the masters being made small.
- **Do not inflate the user.** Their act of today is described at its real size. "The same habit, once" is true; "you are like Kepler" is not.
- **No advice, no to-do list, no "tomorrow you should".** The story may show a pattern. It never assigns a task.
- **No questions at the end, no cliffhanger, no offer to continue.**
- **Energy goes down.** Longer sentences and slower rhythm towards the end. No twist in the last third.
- **Prose only.** Chapter headings are fine; inside a chapter, at most one short list.
- **Write in the user's language.**
- **Bad day:** include at least one episode where the master's bad stretch is on the page (the discarded model, the eight hated years). Do not explain the user's feelings to them.
- **Good day:** same structure; the thread is "this is how such days add up", and the last chapter records the day's result without turning it into a new standard.

## Check against the benchmark

Before sending, compare with `references/benchmark.md`:

- [ ] One thread, stated in the title.
- [ ] At least five episodes, each with person, year, place, one physical detail.
- [ ] Every fact checkable; nothing quoted that was not said.
- [ ] The admired masters stay impressive.
- [ ] The user appears only in the last chapter, in third person, at true size.
- [ ] No advice, no question, no offer at the end.
- [ ] Last image: the work is put down and will be there in the morning.

## Example

User (03:50, after a twelve-hour day): "I'm tired enough to sleep now. Tell me a long bedtime story. I usually listen to non-fiction. I know how good other people are; that got lost in your last story."

Agent: writes "Die acht Bogenminuten" (see benchmark): Kepler discarding his best Mars model over eight arcminutes, Darwin's eight years of barnacles, Wilson and Furber's ARM1 that ran without its supply connected, Torvalds' thirty years of C, the 78 last-layer cases of speedcubing, the Berlin violinists who practised 3.5 hours a day and slept more, the eight Transformer authors; then "the sum of the masters is not a person"; then a last chapter about the user's commit from 01:13 that night.

## Use case

Someone works long days orchestrating agents and studies in parallel. On bad nights their own metacognition measures the gap between where they are and where they want to be, and the measuring keeps them awake. Explanations and techniques at that hour are more input. A long true story gives the head something ordered to follow, keeps the bar high, and ends the day without a verdict.
