#!/usr/bin/env python3
"""Phase 2 — place each converted meeting/research doc into its segment folder, with front-matter + a
   context line, deduping identical content by hash. Reads the manifest (from convert_manifest.py) and a
   classification.json you author (schema in references/method.md §2). Emits placements.json for the
   INDEX builder.

Usage: python place.py --staging STAGING_DIR --classification classification.json --out ARCHIVE_DIR
"""
import argparse, os, re, json


def slug(s):
    return re.sub(r"-{2,}", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")[:48]


def match(name, table):
    for k, v in table.items():
        if k in name:
            return v
    return None


def doctype(name, body):
    n = name.lower()
    if "testimonial" in n:
        return "Testimonial", "-testimonial"
    # "Transcript" only if the filename says so, OR the body is transcript-FIRST (a transcript heading
    # with NO Summary/Details before it). A Gemini "Notes by Gemini" doc embeds its transcript BELOW the
    # Summary/Details, so that heuristic keeps it labelled as notes (consolidate_transcripts handles the pair).
    is_tr = "transcript" in n
    if not is_tr:
        m = re.search(r"(?im)^#{1,3}\s.*\btranscript\b.*$", body[:1500])
        if m and not re.search(r"(?im)^#{2,3}\s*(summary|details)\b", body[:m.start()]):
            is_tr = True
    if is_tr:
        return "Transcript", "-transcript"
    if "discovery summary" in n:
        return "Discovery summary", ""
    if "interview" in n:
        return "Interview", ""
    if "notes by gemini" in n:
        return "Gemini meeting notes", ""
    return "Document", ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--staging", required=True)
    ap.add_argument("--classification", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    recs = json.load(open(os.path.join(a.staging, "manifest.json")))
    C = json.load(open(a.classification))
    blurb = C.get("internal_blurb", "")
    rep = C.get("internal_rep", "the internal rep")
    seg_labels = C.get("segment_labels", {})
    dmap = C.get("domain_map", {})
    os.makedirs(a.out, exist_ok=True)

    seen, placed, excluded, unclassified = set(), [], [], []
    order = sorted(recs, key=lambda x: (x["date"] or "zz", 0 if x.get("src_root", "").find("drive") >= 0 else 1, x["orig_name"]))
    for r in order:
        if r["excluded"]:
            continue
        if r["chash"] in seen and r["chash"] != "empty":
            continue
        name = r["orig_name"]
        ex = match(name, C.get("exclude", {}))
        if ex:
            excluded.append((name, ex)); seen.add(r["chash"]); continue
        if r["wc"] < 5:
            seen.add(r["chash"]); continue
        seen.add(r["chash"])
        body = open(os.path.join(a.staging, r["stage"])).read()
        dt, suffix = doctype(name, body)
        # date resolution
        dov = match(name, C.get("date_override", {}))
        date = r["date"] or dov or "undated"
        prob = match(name, C.get("probable", {})) if date == "undated" else None
        prob_date, prob_basis = (prob[0], prob[1]) if prob else ("", "")

        research = match(name, C.get("research", {}))
        meeting = match(name, C.get("meetings", {}))
        if not meeting and not research:  # fall back to domain map (company+segment); derive a name from the email
            internal = C.get("internal_domain")
            ext_emails = [e for e in r.get("emails", []) if e.split("@")[-1] != internal]
            ext_domains = [e.split("@")[-1] for e in ext_emails]
            hit = next((dmap[d] for d in ext_domains if d in dmap), None)
            if hit:
                who = ext_emails[0].split("@")[0].replace(".", " ").title() if ext_emails else hit["company"]
                meeting = {"segment": hit["segment"], "company": hit["company"], "person": who}
        if research:
            folder = research["folder"]; title = research["title"]; person = company = seg = None
        elif meeting:
            folder = meeting["segment"]; person = meeting["person"]; company = meeting["company"]
            seg = seg_labels.get(folder, folder); title = f"{rep} × {person} — {company}"
        else:
            unclassified.append(name); continue

        d = os.path.join(a.out, folder); os.makedirs(d, exist_ok=True)
        if meeting:
            base = "-".join(x for x in [date, slug(person.split("&")[0].split("(")[0]), slug(company.split("(")[0])] if x) + suffix
        else:
            base = slug(title)
        base = re.sub(r"-{2,}", "-", base).strip("-")
        path = os.path.join(d, base + ".md"); i = 2
        while os.path.exists(path):
            path = os.path.join(d, f"{base}-{i}.md"); i += 1

        fm = ["---", f'title: "{title}"']
        if date != "undated":
            fm.append(f"date: {date}")
        elif prob_date:
            fm += [f'date_probable: "{prob_date}"', f'date_basis: "{prob_basis}"']
        if seg:
            fm.append(f"segment: {seg}")
        if company:
            fm.append(f'company: "{company}"')
        if meeting:
            fm += [f"internal: {rep}", f'external: "{person}"']
        fm += [f"doc_type: {dt}", f'source: "{name}"', "---\n"]
        if meeting:
            dstr = f" · {date}" if date != "undated" else (f" · ≈{prob_date} _(probable — {prob_basis})_" if prob_date else "")
            ctx = f"> **Context.** {blurb}\n>\n> **{dt}** — {rep} × **{person}** of **{company}**; segment: _{seg}_{dstr}.\n"
        else:
            ctx = f"> **Context.** Reference / research document. {blurb}\n"
        open(path, "w").write("\n".join(fm) + "\n" + ctx + "\n" + body.strip() + "\n")
        placed.append({"src": name, "path": os.path.relpath(path, a.out), "date": date,
                       "date_probable": prob_date, "date_basis": prob_basis, "segment": seg or folder,
                       "company": company, "person": person, "doc_type": dt, "folder": folder})

    json.dump({"placed": placed, "excluded": excluded}, open(os.path.join(a.out, ".placements.json"), "w"), indent=1)
    print(f"placed {len(placed)}  |  excluded {len(excluded)}  |  UNCLASSIFIED {len(unclassified)}")
    for u in unclassified:
        print("  UNCLASSIFIED:", u)
    print("Placements written to .placements.json (used by build_index.py).")


if __name__ == "__main__":
    main()
