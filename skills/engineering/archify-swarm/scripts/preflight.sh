#!/usr/bin/env bash
# Preflight VOR dem Fanout. Prueft, ob der Merge spaeter ueberhaupt verifizieren kann.
#
#   preflight.sh <repo>
#
# exit 0 = Lauf kann starten | 1 = harter Blocker | 2 = Warnung, Owner entscheidet
set -uo pipefail
REPO="${1:?repo fehlt}"
[ -d "$REPO" ] || { echo "BLOCKER: Verzeichnis existiert nicht: $REPO" >&2; exit 1; }

TOP=$(git -C "$REPO" rev-parse --show-toplevel 2>/dev/null) || {
  echo "BLOCKER: kein git-Repo — merge.py kann nichts verifizieren." >&2
  echo "  Abhilfe: Wegwerf-Kopie als Ein-Commit-Repo anlegen und die kartieren." >&2; exit 1; }

REV=$(git -C "$REPO" rev-parse HEAD 2>/dev/null) || {
  echo "BLOCKER: kein Commit auf HEAD — jeder Beleg kaeme als 'unbelegt' zurueck," >&2
  echo "  das 2x2 waere stillschweigend wertlos." >&2; exit 1; }

PAT='\.(py|ts|tsx|js|mjs|cjs|go|rs|rb|java|kt|sh|sql)$'
mapfile -t WT < <(cd "$TOP" && find . -type f -not -path '*/.git/*' -not -path '*/node_modules/*' \
  -not -path '*/.venv/*' -not -path '*/venv/*' -not -path '*/dist/*' -not -path '*/build/*' \
  -not -path '*/.next/*' -not -path '*/generated/*' -not -path '*/__pycache__/*' \
  -not -path '*/out/*' -not -path '*/coverage/*' -not -path '*/.cache/*' \
  | sed 's#^\./##' | grep -E "$PAT" | sort)
mapfile -t TR < <(git -C "$TOP" ls-tree -r --name-only "$REV" | grep -E "$PAT" | sort)

nwt=${#WT[@]}; ntr=${#TR[@]}
[ "$nwt" -gt 0 ] || { echo "BLOCKER: keine Quelldateien gefunden — leeres Scaffold?" >&2; exit 1; }
tracked=$(comm -12 <(printf '%s\n' "${WT[@]}") <(printf '%s\n' "${TR[@]}") | wc -l)
pct=$(( tracked * 100 / nwt ))

echo "Repo:      $TOP"
echo "Revision:  $REV"
echo "Quelldateien im Working-Tree: $nwt"
echo "davon im HEAD-Commit:         $tracked  (${pct}%)"
dirty=$(git -C "$TOP" status --porcelain | wc -l)
[ "$dirty" -gt 0 ] && echo "dirty im Working-Tree:        $dirty  -> gegen HEAD verifizieren, nicht gegen den Tree"

if [ "$nwt" -lt 3 ]; then
  echo "BLOCKER: unter 3 Quelldateien — hier gibt es keine Laufzeit-Architektur zu kartieren." >&2
  echo "  Pruefe gleichnamige Nachbarordner; der lebende Code liegt oft woanders." >&2; exit 1
fi
if [ "$pct" -lt 80 ]; then
  echo "WARNUNG: nur ${pct}% der Quelldateien sind im Commit. Belege auf untracked Dateien" >&2
  echo "  kommen als 'unbelegt' zurueck und verfaelschen das 2x2." >&2
  echo "  Abhilfe: committen, oder eine Wegwerf-Kopie als Ein-Commit-Repo kartieren." >&2; exit 2
fi
echo "OK — merge.py kann gegen $REV verifizieren."
