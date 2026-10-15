#!/usr/bin/env bash
# Startet N Modelle parallel auf denselben Brief. Getrennte Ausgaben, gleiche Aufgabe.
#
#   fanout.sh <repo> <generated-dir> <prefix> <modell> [<modell> ...]
#
# Erzeugt <generated-dir>/<prefix>.<slug>.{json,html} und Logs unter <generated-dir>/.logs/
set -uo pipefail
REPO="${1:?repo fehlt}"; GEN="${2:?generated-dir fehlt}"; PREFIX="${3:?prefix fehlt}"; shift 3
[ $# -gt 0 ] || { echo "kein Modell angegeben" >&2; exit 1; }

OC="${OPENCODE_BIN:-$HOME/.opencode/bin/opencode}"
ARCHIFY="${ARCHIFY_HOME:-$HOME/.claude/skills/archify}"
TPL="$(dirname "$0")/brief.template.md"
TIMEOUT="${FANOUT_TIMEOUT:-2400}"

REV=$(git -C "$REPO" rev-parse HEAD 2>/dev/null) || { echo "kein git-Repo: $REPO" >&2; exit 1; }
mkdir -p "$GEN/.logs"

# opencode darf nur innerhalb EINES Verzeichnisses lesen und schreiben. Es muss also
# Repo UND Ausgabeordner umfassen: der kleinste gemeinsame Vorfahre. "dirname $REPO"
# reicht nicht — liegt GEN woanders, werden alle Schreibzugriffe auto-rejected; ist
# der Korridor breiter als noetig, kartiert ein Modell den Nachbarordner statt das Ziel
# (beides in der Praxis beobachtet). Die Lesegrenze steht im Brief.
WORKDIR=$(python3 -c 'import os,sys; print(os.path.commonpath([os.path.realpath(sys.argv[1]),os.path.realpath(sys.argv[2])]))' "$REPO" "$GEN")
echo "Arbeitsverzeichnis (opencode --dir): $WORKDIR"

for m in "$@"; do
  slug=$(printf '%s' "$m" | sed 's#.*/##; s/-contributor-free$//; s/-free$//; s/[^A-Za-z0-9._-]/-/g')
  out="$GEN/$PREFIX.$slug"
  sed -e "s#{{REPO}}#$REPO#g" -e "s#{{ARCHIFY}}#$ARCHIFY#g" \
      -e "s#{{REV}}#$REV#g" -e "s#{{OUT}}#$out#g" "$TPL" > "$GEN/.logs/$slug.brief.md"
  nohup timeout "$TIMEOUT" "$OC" run --format json --dir "$WORKDIR" \
    --model "$m" "$(cat "$GEN/.logs/$slug.brief.md")" \
    > "$GEN/.logs/$slug.run.json" 2> "$GEN/.logs/$slug.err" &
  echo "gestartet  $m  ->  $out.{json,html}   (pid $!)"
done

echo
echo "Revision: $REV"
echo "Logs:     $GEN/.logs/"
echo "Warten:   wait   |   Fortschritt: ls -l $GEN/$PREFIX.*.json"
