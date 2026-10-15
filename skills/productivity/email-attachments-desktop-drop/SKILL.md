---
name: email-attachments-desktop-drop
description: When an email needs attachments, put the real files into a clearly named Desktop folder for drag-and-drop instead of pushing large base64 payloads through an email MCP/connector. Use for any outbound email or draft with non-trivial attachments, or when connector uploads are flaky.
---

# Email Attachments via Desktop Drop

Pushing files through an email connector as base64 burns tokens and often fails. Let the human drag and drop.

## When

Any outbound email or draft needing attachments larger than a few KB, or whenever attachment upload via the connector is flaky.

## Steps

1. Collect the real attachment files on disk.
2. On the user's computer, create a clearly named Desktop folder, e.g. `Desktop/<Topic>_attachments/`.
3. Copy the files in with short numbered names (`1_…`, `2_…`) so the drag order is obvious.
4. Open the folder (`open …` on macOS, `xdg-open …` on Linux).
5. Create or point to the email draft (text body via the connector is fine).
6. Tell the user: drag the files onto the draft, then send.
7. Don't retry large base64 uploads through the connector unless the user explicitly asks.

## Success

Folder open on the Desktop with the real files; draft ready; the user only drags, drops and hits Send.

## Example

```text
Created ~/Desktop/Application_ACME_attachments/
  1_CV.pdf  2_Cover_letter.pdf  3_Certificate.pdf
Draft "Application – Data Engineer" is ready in your mail client.
→ Drag the 3 files onto the draft and send.
```

## Use case

You ask your agent to email three PDFs and it spends minutes and thousands of tokens failing to upload them. With this skill it drafts the text, lays the files out on your Desktop in order, and you finish in ten seconds.
