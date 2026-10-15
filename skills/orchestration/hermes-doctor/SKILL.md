---
name: hermes-doctor
description: Diagnose and fix Hermes Agent provider / fallback-chain outages (no answer, 401/429 errors, stale or conflicting keys, misspelled provider aliases) across many profiles. Use when "Hermes doesn't respond" or the whole fallback chain fails at once.
---

# Hermes Doctor

For [Hermes Agent](https://github.com/NousResearch/hermes-agent) setups with many profiles (`~/.hermes/profiles/*/`), each with its own `config.yaml`, `.env` and `auth.json`. Broken keys or typos tend to get copied into every profile and only surface when the **entire** fallback chain dies at once. Work systematically; don't guess.

## Step 1: Reproduce

```bash
timeout 30 hermes -p <profile> chat -q "Reply only with PONG." -Q -v 2>&1 | tail -40
```

`-v` shows the whole fallback chain and where it breaks. Without it you only see the last error.

## Step 2: Overview

```bash
hermes status                  # API keys + auth providers at a glance
hermes auth list               # credential pool with exhaustion/error status
hermes auth status <provider>  # single provider
```

`rate-limited` (429, temporary, recovers by itself) is not `auth failed` (401, needs intervention). Don't confuse them; 429 just means wait.

## Step 3: On 401, test the key in isolation against the real API

A 401 has three possible causes with very different fixes:

1. **The key is really dead.** Test directly against the provider, e.g. an Anthropic-wire-compatible endpoint:
   ```bash
   curl -s -o /tmp/test.json -w "HTTP:%{http_code}\n" \
     -X POST "https://<provider-endpoint>/v1/messages" \
     -H "x-api-key: $KEY" -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"<model>","max_tokens":16,"messages":[{"role":"user","content":"ping"}]}'
   ```
   200 = key alive, problem is in Hermes. 401 = key dead; get a new one from the provider console.
2. **Stale exhaustion cache.** A key that once returned 401 stays marked `exhausted` even after it works again. Fix: `hermes auth reset <provider>`.
3. **Two conflicting keys for one provider.** A working one in the pool and a dead one set as an env var in `.env` that takes precedence. Check distinct values without printing them:
   ```bash
   grep -h "^<PROVIDER>_API_KEY=" ~/.hermes/profiles/*/.env | sort -u | wc -l
   ```
   More than one → replace the dead value with the verified one in all affected `.env` files, then `hermes auth reset <provider>`.

**Before accepting a "new" key from the user**, compare its prefix with the stored one (`hermes auth list` shows a token prefix). People often re-copy the same dead key from a provider console.

## Step 4: Config alias bugs

If `-v` shows `unknown provider 'X'` or `provider not configured` although X has credentials, the name in `fallback_providers:` doesn't match a known alias. Look up valid aliases in the Hermes source (`agent/auxiliary_client.py`), then bulk-fix:

```bash
grep -rl "<wrong-name>" ~/.hermes/profiles/*/config.yaml ~/.hermes/config.yaml \
  | xargs sed -i 's/<wrong-name>/<correct-alias>/g'
```

## Step 5: Verify after EVERY change

Never stack several fixes without testing in between. A new fallback entry without valid credentials can break the chain **harder** (a 401 kills the chain; "not configured" is skipped). After each change, repeat step 1 until a real answer comes through.

## When everything is dead at once

Several links can be exhausted simultaneously (one provider 429, another monthly cap, a real 401). Use `hermes auth list` to separate "recovers by itself" (429 with reset time) from "needs intervention". Only the latter is a blocker.

## Rules

- Never print, log or paste full key values. Compare prefixes or counts.
- Never commit `.env` or `auth.json`.

## Example

```text
$ hermes -p research chat -q "PONG" -Q -v
  provider-a: 401 auth failed
  provider-b: 429 rate-limited (reset 14:05)
  provider-c: unknown provider 'gemini-cli'
Diagnosis: provider-a key valid via curl (200) → stale cache → `hermes auth reset provider-a`;
provider-c alias typo copied into 23 profiles → bulk sed to the correct alias. PONG returns.
```

## Use case

You run dozens of Hermes profiles and one morning none of them answers. This skill walks the agent from a verbose repro to the actual cause (stale cache, duplicate key, or alias typo), fixes it across all profiles, and verifies after each step.
