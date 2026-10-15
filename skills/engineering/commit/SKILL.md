---
name: commit
description: Create atomic git commits with a secrets/artifact safety check, green tests, and explicit human approval per commit. Use when the user asks to commit current changes.
---

# Commit

## Setup

1. `git status`. If the tree is clean, say so and stop.
2. `git diff --stat` to understand the scope of changes.

## Safety check (before staging anything)

Scan changed files for `.env`, `*credentials*`, `*secret*`, `*.db`, `*.pyc`, `__pycache__/`, `.venv/`.

- Warn the user and refuse to stage these files.
- If `.gitignore` is missing entries for found artifacts, suggest adding them first.

## Plan atomic commits

Group changed files by logical change. One logical change = one commit. Ask the user whether the grouping looks right before proceeding.

## For each atomic commit

1. Stage only the files for this change. Never `git add -A` blindly.
2. Run the tests (`pytest`, `npm test`, or whatever the project uses). If red: **stop**, show the failure, do not proceed until fixed.
3. Draft a message: `type(scope): description`, max 72 chars, types `feat|fix|refactor|docs|test|chore`, in English, explaining *why* rather than *what*.
4. Show the user the staged files and the proposed message.
5. Wait for explicit approval. "Looks good" counts; silence does not.

## After approval

Commit with the approved message, then continue with the next atomic commit. When all are done, show `git log --oneline -5`.

## Hard rules

- Never push without explicit approval.
- Never commit on red tests.
- Never `git add -A` / `git add .` without reviewing what is included.
- The user decides when to commit. Never commit preemptively.

## Example

```text
Proposed commit 1/2
  staged: src/parser.py, tests/test_parser.py
  message: fix(parser): accept trailing commas so exported configs round-trip
  tests: 48 passed
Approve? (yes / edit / skip)
```

## Use case

You finished a messy afternoon session touching a parser, docs and a stray `.env`. Run `/commit`: the agent refuses the `.env`, proposes two commits (fix + docs), runs tests before each, and only commits after you say yes.
