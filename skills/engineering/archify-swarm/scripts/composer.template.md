Komponiere aus verifizierten Schwarm-Befunden EINE finale Archify-Architekturkarte.

Du bist der separat gestartete Composer-Worker. Der Orchestrator uebernimmt
deine Komposition nicht. Deine Provider-/Modell-ID und Plan-Route werden vom
Orchestrator im Worker-Log nachgewiesen; erfinde dazu keine Angaben.

INPUTS:
- Repo: {{REPO}}
- Revision: {{REV}}
- Claims: {{CLAIMS}}
- Archify-Skill: {{ARCHIFY}}/SKILL.md
- Output-Stamm: {{OUT}}

REGELN:
1. Lies zuerst {{ARCHIFY}}/SKILL.md und folge dem Fast authoring path fuer architecture.
2. Lies {{CLAIMS}} vollstaendig. Das ist dein Hauptmaterial.
3. Du darfst nur gezielt belegbezogene Dateien aus {{REPO}} nachlesen; kein breites Repo-Scouting.
   Zaehle im Report, wie viele Zusatzdateien du geoeffnet hast.
4. Erfinde keine Belege. Verwende nur file:line-Stellen aus {{CLAIMS}} und setze sie in components[].sources.
5. Konzepte mit unterschiedlicher `erreichbarkeit` niemals zu einem Knoten verschmelzen. `KEINE AUFRUFER`
   und `NUR TESTS` nur zeigen, wenn sie als tot/test-only markiert sind.
6. `gefunden_von` ist Sichtbarkeit, nicht Wichtigkeit. Waehle nach architektonischer Bedeutung.
7. Ziel: 8-12 Hauptknoten, ein klarer Hauptpfad, kurze deutsche Labels, max. 5 Guided Views.
8. Schreibe {{OUT}}.json, validiere mit:
   node {{ARCHIFY}}/bin/archify.mjs validate architecture {{OUT}}.json --quality showcase --repo-root {{REPO}} --json
9. Liefere mit:
   node {{ARCHIFY}}/bin/archify.mjs deliver architecture {{OUT}}.json {{OUT}}.html --quality showcase --repo-root {{REPO}} --json
10. Danach:
   node {{ARCHIFY}}/bin/archify.mjs visual-check {{OUT}}.html --json
11. Schreibe {{OUT}}.composer-report.md mit: Hauptpfad, ausgelassene wichtige Claims, Zusatzdateienzahl,
    Validation/Deliver/Visual-Check-Status und bekannte Luecken.

SCOPE:
- Ziel-Repo nur lesen. Kein commit, checkout, branch switch, source edit.
- Schreibe nur {{OUT}}.* im Laufordner.
- Keine Subagents/Task-Delegation.

Wenn Archify oder Claims wegen Sandbox nicht lesbar sind: melde BLOCKED, kein Fantasie-Ergebnis.
