#!/usr/bin/env python3
"""
clean_markdown.py — PDF-Text bereinigen für Agenten-Konsum

Liest rohen PDF-Text von stdin, gibt sauberes Markdown auf stdout aus.

Usage:
  pdftotext -layout input.pdf - | python3 clean_markdown.py > output.md
  cat raw.txt | python3 clean_markdown.py > clean.txt
"""

import sys
import re
import unicodedata


def clean_text(text: str) -> str:
    """Bereinigt PDF/Roh-Text für Markdown-Konsum durch Agenten."""

    # 1. Kontrollzeichen entfernen (aber \n \r \t behalten)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)

    # 2. Form-Feed (Seitenumbruch) → als --- markieren
    text = text.replace('\f', '\n\n---\n\n')

    # 3. CR-LF Normalisierung
    text = text.replace('\r\n', '\n').replace('\r', '\n')

    # 4. Unicode-Normalisierung (NFC → NFKC für konsistente Darstellung)
    text = unicodedata.normalize('NFKC', text)

    # 5. Langing/Leading Whitespace pro Zeile
    lines = []
    for line in text.split('\n'):
        line = line.strip()
        if line:
            lines.append(line)
    text = '\n'.join(lines)

    # 6. Mehrfache Leerzeichen zusammenfassen (aber Tab-Separation in Tabellen behalten)
    text = re.sub(r'[ \t]{3,}', '    ', text)  # 3+ spaces → 4-space indent (code block hint)
    text = re.sub(r' {2,}', ' ', text)  # 2+ spaces → single space

    # 7. Mehrfache leere Zeilen zusammenfassen
    text = re.sub(r'\n{4,}', '\n\n\n', text)

    # 8. "Error" oder "Warning" Strings die vom PDF-Export kommen → entfernen
    text = re.sub(r'^Error:.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^WARNING:.*$', '', text, flags=re.MULTILINE)

    # 9. Ligaturen auflösen (typische PDF-Exports)
    replacements = {
        'ﬁ': 'fi',
        'ﬂ': 'fl',
        'ﬀ': 'ff',
        'ﬃ': 'ffi',
        'ﬄ': 'ffl',
        'ﬅ': 'st',
        'ﬆ': 'st',
        'œ': 'oe',
        'Æ': 'AE',
        'æ': 'ae',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)

    # 10. Hyphenation am Zeilenende auflösen (typisch in PDF-Texten)
    # "Soft hyphen" (U+00AD) und "Non-breaking hyphen" (U+2011)
    text = text.replace('\xad', '').replace('\u2011', '-')

    # 11. Abschnitts-Trennung: Große Blocks in Code/Pre-Format für Lesbarkeit
    # Wenn eine Zeile sehr lang ist (>120 Zeichen) und viele Zahlen hat → als pre
    # ABER: Nur wenn es wie eine Tabelle oder Daten aussieht
    final_lines = []
    for line in text.split('\n'):
        # Zeilen die wie Tabellen-Köpfe aussehen behalten
        if re.match(r'^[\s\wäöüßÄÖÜ]+(\s{2,}[\s\wäöüßÄÖÜ]+)+$', line):
            # Tabelle: normale Behandlung
            final_lines.append(line)
        elif len(line) > 200 and line.count(' ') < 5:
            # Looks like garbled PDF text — keep but mark
            final_lines.append(f"> {line} *(PDF-Extraktions-Artefakt)*")
        else:
            final_lines.append(line)

    text = '\n'.join(final_lines)

    # 12. Trim
    text = text.strip()

    return text


def main():
    if len(sys.argv) > 1 and sys.argv[1] not in ('--help', '-h'):
        # CLI mode: datei als argument
        filepath = sys.argv[1]
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            raw = f.read()
    else:
        # Pipe mode
        raw = sys.stdin.read()

    cleaned = clean_text(raw)
    print(cleaned)


if __name__ == '__main__':
    main()
