#!/usr/bin/env python3
"""Evidenzbasierter Merge mehrerer Archify-Kandidaten zu einer verifizierten Befundtabelle.

Kein Modell beteiligt. Cluster-Schluessel ist die Codestelle, nicht das Label:
zwei Karten reden ueber dieselbe Sache, wenn sie auf denselben Code zeigen.
Jede Stelle wird gegen den committeten HEAD geprueft.
"""
import argparse, collections, json, os, re, subprocess, sys, glob


def norm_path(path, repo):
    """Manche Modelle schreiben absolute Pfade. git show braucht repo-relative.
    Ohne diese Normalisierung faellt jeder Beleg des Modells als 'unbelegt' durch
    und das Null-Beitrag-Gate verbannt es zu Unrecht."""
    if repo and path.startswith(repo.rstrip("/") + "/"):
        return path[len(repo.rstrip("/")) + 1:]
    return path.lstrip("/") if path.startswith("/") else path


def load_claims(gen_dir, prefix, repo="", exclude=()):
    """(modell, knotenlabel, pfad, zeile, beleglabel) aus allen Kandidaten."""
    claims, empty = [], []
    paths = sorted(glob.glob(os.path.join(gen_dir, f"{prefix}.*.json")))
    bare = os.path.join(gen_dir, f"{prefix}.json")
    if os.path.exists(bare):
        paths.insert(0, bare)
    for path in paths:
        base = os.path.basename(path)
        model = base[len(prefix) + 1:-5] or "base"
        if any(s in model for s in ("visual-check", "claims", "composed")):
            continue
        if model in exclude:
            print(f"  ausgeschlossen: {model}", file=sys.stderr)
            continue
        try:
            doc = json.load(open(path, encoding="utf-8"))
        except Exception as exc:
            print(f"  uebersprungen (unlesbar): {base} — {exc}", file=sys.stderr)
            continue
        n = 0
        for comp in doc.get("components", []):
            for src in comp.get("sources", []):
                if src.get("line"):
                    claims.append((model, comp.get("label", "?"),
                                   norm_path(src["path"], repo),
                                   int(src["line"]), src.get("label", "")))
                    n += 1
        if n == 0:
            empty.append(model)
    return claims, empty


def cluster(claims, window):
    """Gleicher Pfad, Zeilen innerhalb +-window -> ein Konzept."""
    by_file = collections.defaultdict(list)
    for c in claims:
        by_file[c[2]].append(c)
    out = []
    for path, items in by_file.items():
        items.sort(key=lambda x: x[3])
        cur = [items[0]]
        for it in items[1:]:
            if it[3] - cur[-1][3] <= window:
                cur.append(it)
            else:
                out.append((path, cur))
                cur = [it]
        out.append((path, cur))
    return out


SYMBOL_PATTERNS = [
    r"^\s*def\s+([A-Za-z_]\w*)",
    r"^\s*class\s+([A-Za-z_]\w*)",
    r"^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$]\w*)",
    r"^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$]\w*)\s*=",
    r"^\s*([A-Z][A-Z0-9_]{2,})\s*=",
]
TEST_MARKERS = ("test", "spec", "__mocks__", "fixtures", "conftest")


def symbol_at(body):
    """Symbolnamen aus den ersten Codezeilen ziehen. Dekoratoren/Imports -> None."""
    for raw in body.splitlines()[:3]:
        for pat in SYMBOL_PATTERNS:
            m = re.match(pat, raw)
            if m:
                return m.group(1)
    return None


SOURCE_EXT = (".py", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".go", ".rs",
              ".rb", ".java", ".kt", ".sh", ".sql", ".vue", ".svelte", ".php")


def reachability(repo, rev, path, line, body):
    """Deterministisch: wird das Symbol irgendwo AUFGERUFEN, oder existiert es nur?

    Ohne diese Spalte kennt die Tabelle nur "existiert", nicht "wird benutzt" — und
    ein Aggregator verschmilzt dann lebenden mit totem Code, sobald die Labels
    aehnlich klingen. Beobachteter realer Fehlerfall.

    Zwei Faellen wurde beim Bau nachgegangen:
    - Erwaehnungen in Doku/Logs sind KEINE Aufrufe -> nur Quelldateien zaehlen.
    - Ein Symbol kann in seiner eigenen Datei aufgerufen werden -> Definitionsdatei
      nicht pauschal ausschliessen, sondern nur die Definitionszeile.
    """
    sym = symbol_at(body)
    if not sym:
        return "unbestimmt", "kein Symbol an dieser Zeile (Dekorator, Import, Ausdruck)"
    try:
        out = subprocess.run(
            ["git", "-C", repo, "grep", "-n", "-w", "-e", sym, rev],
            capture_output=True, text=True, timeout=25).stdout.splitlines()
    except Exception:
        return "unbestimmt", "git grep nicht ausfuehrbar"

    live, tests, docs = set(), set(), set()
    for ln in out:
        parts = ln.split(":", 3)          # rev:pfad:zeile:inhalt
        if len(parts) < 3:
            continue
        f, no = parts[1], parts[2]
        if f == path and no.isdigit() and abs(int(no) - line) <= 2:
            continue                       # das ist die Definition selbst
        if not f.lower().endswith(SOURCE_EXT):
            docs.add(f)                    # Erwaehnung in Doku ist kein Aufruf
        elif any(m in f.lower() for m in TEST_MARKERS):
            tests.add(f)
        else:
            live.add(f)

    if live:
        where = "derselben Datei" if live == {path} else f"{len(live)} Quelldatei(en)"
        return "aufgerufen", f"`{sym}` wird in {where} referenziert"
    if tests:
        extra = f", plus {len(docs)} Doku-Erwaehnung(en)" if docs else ""
        return "nur-tests", f"`{sym}` nur von {len(tests)} Testdatei(en) referenziert{extra}"
    if docs:
        return "keine-aufrufer", f"`{sym}` nur in {len(docs)} Doku-Datei(en) erwaehnt, nie aufgerufen"
    return "keine-aufrufer", f"`{sym}` wird im HEAD nirgends referenziert"


def code_at(repo, rev, path, line, n=3):
    try:
        res = subprocess.run(["git", "-C", repo, "show", f"{rev}:{path}"],
                             capture_output=True, text=True, timeout=15)
        lines = res.stdout.splitlines()
        if 0 < line <= len(lines):
            return "\n".join(lines[line - 1:line - 1 + n])
    except Exception:
        pass
    return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--generated-dir", required=True)
    ap.add_argument("--prefix", required=True, help='z.B. "myrepo.architecture"')
    ap.add_argument("--repo", required=True)
    ap.add_argument("--rev", default="HEAD")
    ap.add_argument("--out", help="Standard: <generated-dir>/<prefix-stamm>.claims.md")
    ap.add_argument("--window", type=int, default=15, help="Zeilenfenster fuers Clustern")
    ap.add_argument("--exclude", default="", help="Modell-Slugs, kommagetrennt — z.B. eine "
                    "Baseline-Karte, die den Merge nicht speisen soll")
    args = ap.parse_args()

    rev = subprocess.run(["git", "-C", args.repo, "rev-parse", args.rev],
                         capture_output=True, text=True).stdout.strip() or args.rev
    short = rev[:7]
    out = args.out or os.path.join(args.generated_dir,
                                   args.prefix.split(".")[0] + ".claims.md")

    excl = tuple(x.strip() for x in args.exclude.split(",") if x.strip())
    claims, empty = load_claims(args.generated_dir, args.prefix, args.repo, excl)
    if not claims:
        print("Keine Belege gefunden — kein Kandidat hat components[].sources gefuellt.",
              file=sys.stderr)
        return 1
    models = sorted({c[0] for c in claims})
    total_models = len(models) + len(empty)

    rows, unverified = [], []
    for path, items in cluster(claims, args.window):
        found = sorted({i[0] for i in items})
        line = min(i[3] for i in items)
        body = code_at(args.repo, rev, path, line)
        reach, why = reachability(args.repo, rev, path, line, body) if body.strip() else ("", "")
        entry = (len(found), found, path, line,
                 sorted({i[1] for i in items}), body, reach, why)
        (rows if body.strip() else unverified).append(entry)
    rows.sort(key=lambda r: (-r[0], r[2], r[3]))

    doc = [f"# Verifizierte Architektur-Befunde: {os.path.basename(args.repo)} @ {short}\n",
           f"Zusammengefuehrt aus {len(models)} Karten mit Belegen: {', '.join(models)}."]
    if empty:
        doc.append(f"Ohne Belege und daher nicht beteiligt: {', '.join(sorted(empty))}.")
    doc += ["", "Merge-Schluessel ist die Codestelle, nicht das Label. Jede Zeile unten wurde",
            f"gegen den committeten HEAD `{rev}` geprueft.", "",
            f"**{len(rows)} belegte Konzepte.** `gefunden_von` = wie viele der {len(models)} "
            "Karten mit Belegen diese Stelle nannten.", "",
            "> Haeufigkeit ist kein Wichtigkeitsmass. Ein Konzept, das nur eine Karte fand,",
            "> kann der zentrale Befund sein — solange es belegt ist.", "",
            "> **erreichbarkeit** sagt, ob das Symbol an dieser Stelle im HEAD anderswo",
            "> referenziert wird. `KEINE AUFRUFER` und `NUR TESTS` sind Kandidaten fuer toten",
            "> Code: die Stelle existiert, wird aber nicht benutzt.", "",
            "> **Harte Regel fuer den Aggregator:** Konzepte mit unterschiedlicher",
            "> Erreichbarkeit NIEMALS zu einem Knoten verschmelzen, auch wenn ihre Labels",
            "> gleich klingen. Sonst erbt ein lebender Pfad Bausteine, die er nie aufruft.", ""]
    MARK = {"aufgerufen": "aufgerufen", "nur-tests": "NUR TESTS",
            "keine-aufrufer": "KEINE AUFRUFER", "unbestimmt": "unbestimmt"}
    for n, found, path, line, labels, body, reach, why in rows:
        doc += [f"## {path}:{line}",
                f"- gefunden_von: {n}/{len(models)} ({', '.join(found)})",
                f"- erreichbarkeit: {MARK.get(reach, reach)} — {why}",
                f"- vergebene Labels: {' | '.join(labels)}",
                "```", body, "```", ""]
    if unverified:
        doc += ["## Nicht verifizierbar (nicht verwenden)", ""]
        for n, found, path, line, labels, _, _r, _w in unverified:
            doc.append(f"- `{path}:{line}` — behauptet von {', '.join(found)}, "
                       "Stelle im HEAD leer oder nicht vorhanden")
        doc.append("")
    open(out, "w", encoding="utf-8").write("\n".join(doc))

    many = sum(1 for r in rows if r[0] >= 3)
    few = len(rows) - many
    mu = sum(1 for r in unverified if r[0] >= 3)
    fu = len(unverified) - mu
    print(f"{len(claims)} Belege aus {len(models)}/{total_models} Karten -> "
          f"{len(rows)} verifizierte Konzepte")
    print(f"geschrieben: {out} ({os.path.getsize(out)} Bytes)\n")
    print("2x2:")
    print(f"  viele (>=3) Modelle / belegt   : {many}")
    print(f"  wenige (<=2) Modelle / belegt  : {few}"
          + (f"   <- {round(100*few/len(rows))}% der Substanz" if rows else ""))
    print(f"  viele  Modelle / unbelegt      : {mu}"
          + ("   <- geteilte Halluzination, pruefen!" if mu else ""))
    print(f"  wenige Modelle / unbelegt      : {fu}")
    rc = collections.Counter(r[6] for r in rows)
    dead = rc["keine-aufrufer"] + rc["nur-tests"]
    print("\nErreichbarkeit:")
    print(f"  aufgerufen                     : {rc['aufgerufen']}")
    print(f"  nur Tests                      : {rc['nur-tests']}")
    print(f"  keine Aufrufer                 : {rc['keine-aufrufer']}")
    print(f"  unbestimmt                     : {rc['unbestimmt']}")
    if dead:
        print(f"  -> {dead} Konzept(e) existieren, werden aber nicht aufgerufen."
              " Nicht mit lebenden Stellen verschmelzen.")
    print("\nBeitrag je Karte (Cluster, davon nur von dieser Karte gefunden):")
    for m in models:
        mine = [r for r in rows if m in r[1]]
        solo = [r for r in mine if r[0] == 1]
        print(f"  {m:<24} {len(mine):>3} Cluster, {len(solo):>3} exklusiv")
    for m in sorted(empty):
        print(f"  {m:<24}   0 Cluster  <- Null-Beitrag-Gate: aus dem Roster nehmen")
    return 0


if __name__ == "__main__":
    sys.exit(main())
