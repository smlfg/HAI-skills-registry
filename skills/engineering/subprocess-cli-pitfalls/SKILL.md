---
name: subprocess-cli-pitfalls
description: Diagnose Linux CLI commands that run in milliseconds in a terminal but hang or crawl when called via Python subprocess (or any non-TTY caller like cron or an agent). Root cause is almost always paginator behaviour, TTY detection, or output buffering. Use when a shell command times out in an agent context or a wrapper suddenly needs 60s+.
---

# subprocess-cli-pitfalls

A class of bugs that bites every agent that wraps Linux diagnostic commands in `subprocess.run(...)`. The same command is fast in a terminal and slow or stuck in a subprocess. The difference is not the command, it is how the command detects its environment.

## The pattern

```text
$ time some-display-tool list            # 2 ms
$ time journalctl -b --no-pager          # 12 ms
$ time ./my-wrapper status               # 58 seconds (!)
```

Anything over ~10× the direct-CLI time is a paginator / TTY-detection issue, not a real workload.

## Why this happens

From a terminal the command gets a real TTY and may launch a pager, throttle output for humans, or probe the controlling terminal. Under `subprocess.run(..., capture_output=True)` stdout is a pipe, and some tools take a *slower* non-TTY path.

`--no-pager` is **not** a universal fix: it only removes the literal `less`. Journald query latency, udev probes and hardware re-enumeration are unaffected.

## Common offenders

| Command | Why | Cheap fix |
|---|---|---|
| `journalctl -b --no-pager` | full boot-log scan | `-n 200`, `--since "1 hour ago"`, `-k`, or `-g "<regex>"` |
| `git log` | pager on big histories | `git --no-pager log -n 50` |
| `man <topic>` | pager | `man -P cat <topic>` |
| `apt-cache policy` / `apt list` | interactive paths | `apt-get -s` for dry runs |
| `systemctl status` | pager | `systemctl status --no-pager` |
| `dmesg` | ring-buffer read | `dmesg --since "10 minutes ago"` |
| `lsblk`, `lspci`, `lsusb` | udev probes | wrap in `timeout 5` |

### Picking the right `journalctl` cap

- `-n N`: last N lines of a scope. Safe default without a known pattern.
- `--since`: a temporal slice.
- `-k`: kernel messages only (link training, GPU, USB hotplug). Skips userspace entirely.
- `-g <regex>`: server-side filter for a known diagnostic pattern. Often orders of magnitude faster.

Never fix it with `| head -N` after the call; you already paid for the full read. Bound at the source.

## Defensive patterns

1. Cap output with the tool's own limit (`-n`, `--lines`, `--max-count`).
2. Force the non-pager path: `env={**os.environ, "PAGER": "cat", "TERM": "dumb"}`.
3. Always pass `timeout=`.
4. Prefer targeted filters (`journalctl -b -p err --since "1 hour ago"`).
5. For udev/dbus-heavy tools, query `udevadm info --query=all` directly.

## Diagnostic recipe

```python
import subprocess, time
for cmd in [["journalctl", "-b", "--no-pager"],
            ["journalctl", "-b", "-n", "200", "--no-pager"]]:
    t = time.time()
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        print(cmd, "->", round(time.time() - t, 3), "s, rc=", r.returncode)
    except subprocess.TimeoutExpired:
        print(cmd, "-> TIMEOUT")
```

**Where did it hang?** Run the script unbuffered: `timeout 20 python3 -u ./my-wrapper status`. Without `-u` a hung Python process can show zero output even after printing 30 lines internally.

**Exit 124 is a triage signal.** The outer `timeout` is rarely the bug. Run the inner command directly, bisect with `time` per external call, and do not lower the outer timeout to hide it.

## Defensive `run()` wrapper (recommended baseline)

```python
import shlex, subprocess

class CommandError(RuntimeError):
    pass

def run(argv, *, check=False, timeout=None):
    printable = " ".join(shlex.quote(a) for a in argv)
    try:
        result = subprocess.run(argv, text=True, capture_output=True,
                                check=False, timeout=timeout)
    except FileNotFoundError as exc:
        raise CommandError(f"Command not found: {argv[0]}") from exc
    except subprocess.TimeoutExpired as exc:
        raise CommandError(f"{printable} timed out after {timeout}s") from exc
    if check and result.returncode != 0:
        detail = (result.stderr or result.stdout).strip() or f"exit code {result.returncode}"
        raise CommandError(f"{printable} failed: {detail}")
    return result
```

Keyword-only `timeout=` documents every call site; translating `TimeoutExpired` into the helper's own error gives callers one exception to handle; the message carries the command and timeout so a 3 a.m. cron log is triageable.

## Pitfalls

- Assuming `--no-pager` solves everything.
- Assuming the slow script is the slow command; time each inner call.
- Switching to `shell=True` (injection risk plus another TTY layer).
- Lowering the timeout to "fix" the symptom.
- Writing a cron-callable helper without a `timeout`.
- Inventing plausible stdout when a command truly hangs.

## Example

A cron job exits 124 after 60 s. `python3 -u` shows the status report printed fully, then stalls in a function that calls `journalctl -b --no-pager` (415k lines). Fix: `journalctl -b -k -g "link training|failed" -n 50 --no-pager` with `timeout=5`. Wallclock drops from ~58 s to 0.3 s with identical matches.

## Use case

Your agent's health-check script works perfectly when you run it by hand but times out every night in cron. Load this skill: it walks the agent through timing each inner call, finds the unbounded log read, and patches the helper so the bug can't come back silently.
