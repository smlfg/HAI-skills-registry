---
name: pdf-to-md
description: Convert PDFs (lecture slides, scripts, books) into clean Markdown/text an agent can read and search, with automatic fallback to Tesseract OCR for scanned PDFs. Use when a PDF should become agent-readable, single or in bulk.
---

# PDF to Markdown

Turns `.pdf` files into clean `.md` for agent-friendly reading and search. Helper: [`scripts/clean_markdown.py`](scripts/clean_markdown.py) (control chars, ligatures, NFKC normalisation, whitespace).

## Prerequisites (once)

```bash
sudo apt install poppler-utils tesseract-ocr tesseract-ocr-deu   # add the language packs you need
```

## Step 1: Does the PDF have a text layer?

```bash
pdftotext -layout input.pdf - 2>&1 | head -5
```

Text → step 2a. Empty or error → scanned PDF → step 2b.

If you only need some chapters, find page boundaries first (table of contents, `pdfinfo`, then `pdftotext -f <first> -l <last>`).

## Step 2a: Text PDF

```bash
pdftotext -layout input.pdf - | python3 scripts/clean_markdown.py > input.md
```

## Step 2b: Scanned PDF (OCR)

```bash
pdftoppm -r 300 input.pdf page -png
for png in page*.png; do tesseract "$png" "${png%.png}" -l deu+eng; done
cat page*.txt | python3 scripts/clean_markdown.py > input.md
rm page*.png page*.txt
```

For PDFs over ~50 MB, OCR in 10-page chunks to save memory.

## Bulk: a whole folder

```bash
for pdf in ./*.pdf; do
  pdftotext -layout "$pdf" - | python3 scripts/clean_markdown.py > "${pdf%.pdf}.md"
  echo "✓ ${pdf%.pdf}.md"
done
```

## Step 3: Check the output

`head -20 input.md; wc -l input.md`. Expect more than 10 lines, no control characters, no "Error" strings. Too little text from a text PDF → switch to OCR.

## Naming convention (suggested)

`{COURSE}_{TOPIC}_{YYYYMMDD}.md`, e.g. `ALGO_Complexity_20260413.md`.

## Limits

| Problem | Workaround |
|---|---|
| Math formulas | extracted as Unicode, not LaTeX; readable but imperfect |
| Scanned formulas | OCR is approximate |
| Encrypted PDFs | can't convert; report "PDF is encrypted" |
| Tables | come out as space-separated columns; still agent-readable |

## Troubleshooting

- `Unable to parse` → non-standard or encrypted PDF; try OCR.
- `tesseract: command not found` → install it.
- Gibberish → bad encoding; `clean_markdown.py` normalises and resolves ligatures.

## Example

```bash
pdftotext -layout lecture-05-pipelining.pdf - | python3 scripts/clean_markdown.py > lecture-05-pipelining.md
wc -l lecture-05-pipelining.md   # 812
```

## Use case

You have a semester's worth of slide PDFs and want a study agent to answer questions from them. Run this skill over the folder once; scanned handouts fall back to OCR automatically, and the agent now greps Markdown instead of choking on PDFs.
