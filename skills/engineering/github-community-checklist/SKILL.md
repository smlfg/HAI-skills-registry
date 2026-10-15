---
name: github-community-checklist
description: Audit a GitHub repo's community health files (description, README, license, code of conduct, contributing, security policy, issue/PR templates). Use when hardening a public repo or after a wave of pushes.
---

# GitHub Community Checklist

Run against one repo or a batch. Prefer public showcase repos first unless the user says otherwise.

## Checklist

For each repo, verify presence **and quality** of:

1. **Description**: short, accurate blurb in repo settings (not empty, not a placeholder like "Local project ...").
2. **README**: says what it is, why it exists, and how to run or use it.
3. **Code of conduct**: `CODE_OF_CONDUCT.md` or `.github/CODE_OF_CONDUCT.md`.
4. **Contributing**: `CONTRIBUTING.md` explaining how to propose changes.
5. **License**: `LICENSE` matching the intended terms. Never invent or change a license when commercial or dual-license constraints apply; ask first.
6. **Security policy**: `SECURITY.md` with how to report vulnerabilities.
7. **Issue templates**: `.github/ISSUE_TEMPLATE/`.
8. **PR template**: `.github/pull_request_template.md`.

## How to check

- Description from repo metadata; files via the default-branch tree or contents API (accept `.github/` variants).
- Report per repo: present / missing / placeholder-quality.
- Do not create or overwrite files until the user asks.

## Default priority

1. Description + README (always, for public repos)
2. License (when allowed)
3. Security policy for anything with users or secret risk
4. Contributing + templates for repos expecting outside contributions
5. Code of conduct for public, collaborative projects

## Example

| repo | desc | README | LICENSE | SECURITY | CONTRIB | CoC | issue tpl | PR tpl |
|---|---|---|---|---|---|---|---|---|
| `acme/cli` | OK | weak (no usage) | OK | missing | missing | missing | missing | missing |

Next actions (authorized gaps only): add usage section to README; add `SECURITY.md`.

## Use case

You just made five side projects public. Run this skill over all five to get one compact table of what is missing before you share the links.
