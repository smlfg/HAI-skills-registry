#!/usr/bin/env bash
# Smoke-Test des Modell-Rosters, BEVOR die volle Aufgabe laeuft.
# Ein Einzeiler pro Modell kostet Sekunden und deckt tote Zugaenge auf:
# leeres Guthaben, abgelaufener Key, Free-Tier-Quota. Kein Qualitaetsurteil.
#
#   probe.sh                 -> alle freien Modelle testen
#   probe.sh <modell> ...    -> genau diese testen
set -uo pipefail
OC="${OPENCODE_BIN:-$HOME/.opencode/bin/opencode}"
[ -x "$OC" ] || { echo "opencode nicht gefunden: $OC" >&2; exit 1; }

if [ $# -gt 0 ]; then
  MODELS=("$@")
else
  # Roster ueber die ECHTEN Kosten aus dem Modell-Katalog, nicht ueber Namensmuster:
  # Namen aendern sich, ein Preisfeld von 0 nicht. Namensmuster nur als Notnagel.
  mapfile -t MODELS < <("$OC" models 2>/dev/null | python3 -c '
import json, os, sys
avail = [l.strip() for l in sys.stdin if l.strip()]
cat_path = os.path.expanduser("~/.cache/opencode/models.json")
free = set()
try:
    cat = json.load(open(cat_path))
    for prov, pdata in cat.items():
        for mid, m in (pdata.get("models") or {}).items():
            cost = m.get("cost")
            if isinstance(cost, dict) and cost and all(float(v or 0) == 0 for v in cost.values()):
                free.add(f"{prov}/{mid}")
except Exception:
    pass
hits = [m for m in avail if m in free]
if not hits:                      # Katalog fehlt oder Schema geaendert
    print("WARN: Kostenfilter lieferte nichts, falle auf Namensmuster zurueck", file=sys.stderr)
    hits = [m for m in avail if m.endswith("-free")]
print("\n".join(sorted(hits)))
')
fi
[ ${#MODELS[@]} -gt 0 ] || { echo "kein Modell im Roster" >&2; exit 1; }

alive=(); dead=()
for m in "${MODELS[@]}"; do
  out=$(cd /tmp && timeout 90 "$OC" run --format json --model "$m" \
        "Antworte mit genau einem Wort: bereit" 2>&1)
  if grep -q '"type":"error"' <<<"$out"; then
    reason=$(grep -oE '"message":"[^"]{0,70}' <<<"$out" | head -1 | cut -c13-)
    printf '%-46s TOT      %s\n' "$m" "${reason:-unbekannt}"
    dead+=("$m")
  else
    cost=$(grep -oE '"cost":[0-9.]+' <<<"$out" | tail -1 | cut -d: -f2)
    printf '%-46s LEBT     cost=%s\n' "$m" "${cost:-0}"
    alive+=("$m")
  fi
done

echo
echo "LEBEND: ${alive[*]:-keine}"
[ ${#dead[@]} -gt 0 ] && echo "TOT (kein Qualitaetsurteil): ${dead[*]}"
[ ${#alive[@]} -gt 0 ] || exit 2
exit 0
