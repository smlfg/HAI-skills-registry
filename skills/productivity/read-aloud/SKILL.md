---
name: read-aloud
description: Read text aloud with a local neural TTS (Piper) instead of printing it, after converting it into speakable prose. Use when the user says "read this aloud", "read it to me", "TTS", or "speak this".
---

# Read Aloud (local Piper TTS)

Local neural text-to-speech with [Piper](https://github.com/rhasspy/piper) and a voice model of your choice (e.g. German `de_DE-thorsten-high`, English `en_US-lessac-high`).

## When

Immediately on: "read aloud", "read this to me", "speak this", "TTS".

## Modes

If the agent is in a read-only plan/ask mode, switch to a mode that can run local commands first. No plain-text fallback, no "can't do that here".

## Flow

1. **Pick the text**: user text, a chat answer, a file or a selection. For files, read only the relevant part.
2. **Make it speakable** (keep it short):
   - clear sentences in the target language
   - no Markdown (`#`, backticks, `*`), no code blocks, no raw URLs
   - shorten long lists/tables into a few sentences
   - drop or verbalise URLs and paths ("file main dot py")
3. **Speak**:

```bash
printf '%s' "$TEXT" | piper --model ~/.local/share/piper/<voice>.onnx --output-raw \
  | aplay -r 22050 -f S16_LE -t raw -      # Linux
# macOS: write a wav with --output_file /tmp/say.wav, then afplay /tmp/say.wav
```

   Optionally wrap this in a small `speak` script on your PATH.
4. **Long texts** (>~30 s of audio): start in the background, confirm "reading now", don't wait.
5. **Short texts**: play blocking, then one line of confirmation.

## Rules

- Don't mirror the text back into the chat as a big block if the user only wanted it read.
- Never read secrets or tokens aloud.
- Missing binary or voice model: say so and point to the Piper install and the expected model path.

## Smoke test

```bash
printf '%s' "Hello, this is a test." | piper --model ~/.local/share/piper/<voice>.onnx --output-raw | aplay -r 22050 -f S16_LE -t raw -
```

## Example

> **User:** read me the summary
> **Agent:** (strips Markdown, turns the 5-bullet list into three sentences, pipes to Piper) "Reading now — about 40 seconds."

## Use case

You'd rather listen than read a long agent answer while cooking. Say "read it aloud": the agent turns its Markdown into natural sentences and plays them through a local voice, with nothing sent to a cloud TTS.
