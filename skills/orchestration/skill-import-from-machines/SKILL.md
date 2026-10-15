---
name: skill-import-from-machines
description: Import your own agent skills from several machines and harnesses (Claude Code, Codex, Hermes, others) into one shared skill library. Packs only known personal roots, stages them, filters personal vs marketplace, runs a secrets pass, and writes only after explicit approval. Use when consolidating skills across machines.
---

# Skill Import from Machines

## Known roots

| Harness | Typical root | Skip |
|---|---|---|
| Claude Code | `~/.claude/skills` | — |
| Codex | `~/.codex/skills` | `.system` |
| Hermes Agent | `~/.hermes/skills` | `.archive`; offensive/exploit/red-team packs unless named; marketplace bulk unless asked |
| Your agent platform | its workflow/skill library | platform-managed skills |

Also include project `skills/` folders the user names.

## Preconditions

1. List connected machines. If a needed machine is offline, stop and name it.
2. Prefer the platform's registered-machine access over ad-hoc SSH.

## Do not

- Run a broad `find ~ -name skills` (node_modules/vendor folders inflate counts).
- Blind-import whole marketplace or bundled trees.
- Import secrets, credentials, or packs the user didn't ask for.

## Steps

1. Pack **known personal roots** only, on each connected machine.
2. Stage outside `/tmp`, in a user-writable folder.
3. Copy to the agent host and extract under a staging dir (e.g. `~/skill-import/`).
4. Scan for `SKILL.md`; build a manifest (slug, name, description, source machine, harness).
5. **Secrets pass** before any write: refuse bodies that look like keys/tokens (`.env` content, `API_KEY=`, `sk-…`, bearer tokens). Tell the user which skill was blocked.
6. Show the personal import set (slug + one-line why). Wait for an explicit yes. Then write into the shared library.
7. Leave marketplace bulk staged; promote only on explicit ask.
8. Optionally push a **private** archive sorted `by-harness/<harness>/` plus `sources/<machine>/`.

## Success

- Honest counts per harness (personal vs marketplace)
- Shared library not polluted with vendor bulk
- User told what is live vs staged

## Example

```text
laptop  claude: 24 personal, 3 marketplace (staged)
laptop  codex:   6 personal
desktop hermes: 31 personal, 120 marketplace (staged), 1 blocked (contains API_KEY=)
Proposed import: 61 skills (list attached). Write to library? [yes/no]
```

## Use case

You've written skills in three different agent tools on two laptops and can't remember which version is where. This skill gathers only your own skills, flags the one with a pasted key, and gives you a single library plus a private archive.
