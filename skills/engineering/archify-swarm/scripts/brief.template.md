Erzeuge mit dem Archify-Skill die Architektur-Karte des Repos {{REPO}}.

SKILL: {{ARCHIFY}}/SKILL.md — lies das ZUERST und folge dem "Fast authoring path" GENAU
(passendes Schema in schemas/ + ein Beispiel in examples/ lesen, Kandidat-JSON schreiben,
dann validate, dann deliver).
CLI: node {{ARCHIFY}}/bin/archify.mjs

Wenn du {{ARCHIFY}}/SKILL.md oder die Archify-CLI wegen Sandbox/Permission nicht lesen bzw.
ausfuehren darfst: schreibe KEIN Fantasie-Ergebnis, sondern melde BLOCKED in deinem Run-Log und
beende. Das ist Infrastruktur, kein Qualitaetsurteil ueber dein Modell.

TASK:
1. Analysiere {{REPO}} so weit noetig, um die Laufzeit-Architektur zu verstehen: Entry Points,
   Haupt-Ausfuehrungspfad, persistenter State, externe Dienste, Trigger/Hooks, Trust Boundaries.
   Ignoriere .venv, node_modules, Caches, Logs, Build- und Medien-Artefakte.
2. Optimiere fuer menschliches Verstaendnis, NICHT Vollstaendigkeit: 8-12 Hauptknoten,
   ein klarer Hauptpfad, sparsame Labels.
3. Fuelle components[].sources mit ECHTEN, im Code nachgeprueften path/line/label-Angaben.
   Setze meta.repository mit url/provider/revision auf den committeten HEAD {{REV}}.
   Erfinde nichts. Was du nicht belegen kannst, lass weg statt zu raten.
   Verifiziere gegen den committeten HEAD, nicht gegen den dirty Working-Tree.
4. Validiere mit: node {{ARCHIFY}}/bin/archify.mjs validate architecture <kandidat.json>
   --quality showcase --repo-root {{REPO}} --json — bis 9/9 Checks, 0 errors, 0 warnings.
5. deliver nach {{OUT}}.html, Kandidat-JSON daneben als {{OUT}}.json
   (deliver braucht ebenfalls --repo-root {{REPO}}, sobald das Diagramm Evidenz deklariert).
   Danach visual-check auf das gelieferte HTML.

VERIFIKATION: der deliver-Receipt muss checksPassed 9/9, errors 0, warnings 0 zeigen; das JSON
muss meta.repository.revision und mindestens 8 components[].sources-Eintraege enthalten.

ARBEITSWEISE: Schreibe FRUEH einen ersten Kandidaten auf die Platte und speichere Zwischenstaende.
Ein Abbruch darf nicht die ganze Arbeit vernichten.

SCOPE / NICHT ANFASSEN:
- Aendere NICHTS in {{REPO}}. Nur lesen. Kein git commit, kein checkout.
- LIES AUSSCHLIESSLICH Dateien unterhalb von {{REPO}}. Dein Arbeitsverzeichnis ist breiter
  als das Ziel, damit du in den Ausgabeordner schreiben kannst — Geschwisterordner sind
  FREMDE PROJEKTE. Jeder Beleg muss ein Pfad relativ zu {{REPO}} sein; ein Beleg, der aus
  einem anderen Ordner stammt, macht die ganze Karte wertlos.
- Sieh dir NICHT die anderen Dateien im Ausgabeordner an — das sind Vergleichslaeufe anderer
  Modelle und wuerden das Verfahren zerstoeren. Bilde deine eigene Vorstellung aus dem Code.
- Schreibe nur deine Output-Dateien plus visual-check-Sidecars.
- Keine Subagents/Task-Delegation, kein zweiter Scout, kein breites Lesen ausserhalb von {{REPO}}
  und {{ARCHIFY}}. Du bist selbst der isolierte Scout.

REPORT: Output-Pfade, Receipt, Knoten als Liste mit ihren file:line-Belegen, Hauptpfad,
Anzahl validate-Runden, und ehrlich was du NICHT belegen konntest.
