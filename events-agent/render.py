# render.py
# Write the results three ways: events.json (full data), events.csv (spreadsheet),
# and events.html (a scannable, on-brand page with Register links).

import csv
import html
import json
import os
import shutil
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

PT = ZoneInfo("America/Los_Angeles")

# Momentum Mill brand palette.
IVORY = "#F6F1E7"; BISQUE = "#EBD6B4"; GOLD = "#D69946"
DEEP_GOLD = "#9C7128"; ESPRESSO = "#2B221D"; SOFT = "#5A4B3F"

CAT_COLOR = {
    "Pitch / Demo": GOLD,
    "Investor mixer": DEEP_GOLD,
    "Fundraising": "#7A5C2E",
    "Founder community": SOFT,
    "Other": "#9b9081",
}
EXCL_COLOR = "#B4452F"  # private / invite-only badge


def parse_dt(iso):
    if not iso:
        return None
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except ValueError:
        try:
            dt = datetime.fromisoformat(str(iso)[:10])  # date-only fallback
        except ValueError:
            return None
    if dt.tzinfo is None:  # naive (e.g. some Eventbrite dates) -> assume Pacific
        dt = dt.replace(tzinfo=PT)
    return dt


def local(dt, tzname=None):
    if not dt:
        return None
    zone = PT
    if tzname:
        try:
            zone = ZoneInfo(tzname)
        except Exception:
            zone = PT
    return dt.astimezone(zone)


def _fmt_day(dt):
    return dt.strftime("%a %b %-d") if dt else "Date TBD"


def _fmt_time(dt):
    if not dt:
        return "Time TBD"
    if dt.hour == 0 and dt.minute == 0:  # date-only (e.g. some Eventbrite) -> no fake midnight
        return "Time TBD"
    return dt.strftime("%-I:%M %p")


def write_json(events, path):
    clean = []
    for e in events:
        clean.append({k: v for k, v in e.items() if not k.startswith("_")})
    with open(path, "w") as f:
        json.dump(clean, f, indent=2, default=str)


def write_csv(events, path):
    cols = ["date", "time", "title", "category", "score", "city", "venue",
            "host", "sources", "guests", "going", "url"]
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(cols)
        for e in events:
            dt = local(parse_dt(e.get("start")), e.get("tz"))
            w.writerow([
                _fmt_day(dt) if dt else "",
                _fmt_time(dt) if dt else "",
                e.get("title", ""),
                e.get("category", ""),
                e.get("score", ""),
                e.get("city", "") or "",
                e.get("venue", "") or "",
                e.get("host", "") or "",
                " + ".join(e.get("sources", [])),
                e.get("guests", "") if e.get("guests") is not None else "",
                e.get("going", "") or "",
                e.get("url", "") or "",
            ])


def _chip(text, color, filled=False):
    if filled:
        return f'<span class="chip" style="background:{color};color:#fff;border-color:{color}">{html.escape(text)}</span>'
    return f'<span class="chip" style="color:{color};border-color:{color}">{html.escape(text)}</span>'


def _reg_status(e):
    """Short human note about how hard it is to get in / how full it is."""
    bits = []
    if e.get("require_approval"):
        bits.append("approval required")
    going = (e.get("going") or "").lower()
    if e.get("is_sold_out") or going in ("sold_out", "soldout"):
        bits.append("sold out")
    elif going == "waitlist":
        bits.append("waitlist")
    sr = e.get("spots_remaining")
    if isinstance(sr, int) and 0 < sr <= 15:
        bits.append(f"{sr} spots left")
    elif e.get("is_near_capacity"):
        bits.append("nearly full")
    return bits


def _card(e):
    dt = local(parse_dt(e.get("start")), e.get("tz"))
    cat = e.get("category", "Other")
    color = CAT_COLOR.get(cat, CAT_COLOR["Other"])
    title = html.escape(e.get("title") or "Untitled")
    url = e.get("url")
    when = f"{_fmt_time(dt)}" if dt else "Time TBD"
    loc_bits = [b for b in [e.get("venue"), e.get("city")] if b]
    if e.get("online"):
        loc_bits = ["Online"] + loc_bits
    where = html.escape(" · ".join(loc_bits)) if loc_bits else ""
    host = html.escape(e.get("host") or "")
    guests = e.get("guests")

    meta_line = []
    if where:
        meta_line.append(f'<span class="loc">{where}</span>')
    if guests:
        meta_line.append(f'<span class="g">{guests} going</span>')
    for s in _reg_status(e):
        meta_line.append(f'<span class="g warn">{html.escape(s)}</span>')

    # Chips: exclusivity first (it's the thing you asked to prioritize), then
    # category, then where it was found, then the matched keywords.
    chips = []
    for lbl in (e.get("exclusive_labels") or []):
        chips.append(_chip(lbl, EXCL_COLOR, filled=True))
    chips.append(_chip(cat, color, filled=True))
    for s in e.get("sources", []):
        if s.startswith("X @") and e.get("discovered_via"):
            chips.append(
                f'<a class="chip srcx" href="{html.escape(e["discovered_via"])}" '
                f'target="_blank" rel="noopener" style="color:{SOFT};border-color:{SOFT}">{html.escape(s)} ↗</a>'
            )
        else:
            chips.append(_chip(s, SOFT))
    matched = e.get("matched") or []
    if matched:
        chips.append(_chip("matched: " + ", ".join(matched[:4]), "#b0a594"))

    reg = f'<a class="reg" href="{html.escape(url)}" target="_blank" rel="noopener">Register ↗</a>' if url else ""
    excl = "1" if e.get("exclusive") else "0"

    return f"""
    <article class="card" data-prio="{e.get('priority',0)}" data-cat="{html.escape(cat)}" data-excl="{excl}">
      <div class="time">{when}</div>
      <div class="body">
        <h3>{title}</h3>
        <div class="host">{host}</div>
        <div class="meta">{' · '.join(meta_line)}</div>
        <div class="chips">{''.join(chips)}</div>
      </div>
      <div class="action">{reg}<div class="sc">priority {e.get('priority',0)}</div></div>
    </article>"""


def write_html(events, path, meta):
    # Private / invite-only events are pinned at the top (already in priority
    # order). The rest are grouped by day, chronologically.
    excl_events = [e for e in events if e.get("exclusive")]
    day_events = [e for e in events if not e.get("exclusive")]

    pinned = ""
    if excl_events:
        cards = "\n".join(_card(e) for e in excl_events)
        pinned = (
            '<section class="day pinned"><h2>★ Invite-only &amp; unlisted '
            f'<span class="n">{len(excl_events)}</span></h2>'
            '<p class="pinnote">The genuinely selective ones: the host says invite-only, '
            'or the event is unlisted on Luma. Heads up, truly private events never appear '
            'in any public listing, so this is usually short or empty. Everything below is '
            'public (some still need approval to attend).</p>'
            f'{cards}</section>'
        )

    groups = {}
    for e in day_events:  # day_events keep their incoming priority order
        dt = local(parse_dt(e.get("start")), e.get("tz"))
        key = dt.date().isoformat() if dt else "zzz-tbd"
        groups.setdefault(key, [dt, []])
        groups[key][1].append(e)

    sections = []
    for key in sorted(groups):
        dt, evs = groups[key]
        heading = _fmt_day(dt) if dt else "Date to be announced"
        cards = "\n".join(_card(e) for e in evs)
        sections.append(f'<section class="day"><h2>{html.escape(heading)} <span class="n">{len(evs)}</span></h2>{cards}</section>')

    gen = meta.get("generated", "")
    label = meta.get("label", "Events")
    n = len(events)
    n_excl = meta.get("n_exclusive", len(excl_events))
    n_x = meta.get("n_x", 0)
    src = html.escape(meta.get("sources_line", ""))
    cats = meta.get("cat_counts", {})
    cat_buttons = [f'<button class="f active" data-f="all">All <i>{n}</i></button>']
    if n_excl:
        cat_buttons.append(f'<button class="f excl" data-f="excl">★ Invite-only <i>{n_excl}</i></button>')
    for c in meta.get("category_order", []):
        if cats.get(c):
            cat_buttons.append(f'<button class="f" data-f="{html.escape(c)}">{html.escape(c)} <i>{cats[c]}</i></button>')

    return _write(path, f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(label)} · Momentum Mill</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Acme&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{{--ivory:{IVORY};--bisque:{BISQUE};--gold:{GOLD};--deep:{DEEP_GOLD};--esp:{ESPRESSO};--soft:{SOFT}}}
  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--ivory);color:var(--esp);font-family:'Hanken Grotesk',system-ui,sans-serif;line-height:1.45}}
  .wrap{{max-width:860px;margin:0 auto;padding:32px 20px 80px}}
  header h1{{font-family:'Acme',system-ui,sans-serif;font-weight:400;font-size:34px;margin:0 0 4px;letter-spacing:.2px}}
  .sub{{color:var(--soft);font-size:15px;margin-bottom:2px}}
  .gen{{color:#a99c89;font-size:13px;margin-bottom:20px}}
  .filters{{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 26px;position:sticky;top:0;background:var(--ivory);padding:10px 0;z-index:5;border-bottom:1px solid var(--bisque)}}
  button.f{{font:inherit;font-size:13px;font-weight:600;padding:7px 12px;border:1px solid var(--bisque);background:#fff;color:var(--soft);border-radius:999px;cursor:pointer}}
  button.f i{{font-style:normal;opacity:.6;font-weight:500}}
  button.f.active{{background:var(--esp);color:#fff;border-color:var(--esp)}}
  .day h2{{font-family:'Acme',sans-serif;font-weight:400;font-size:18px;color:var(--deep);margin:26px 0 12px;display:flex;align-items:center;gap:8px}}
  .day h2 .n{{font-family:'Hanken Grotesk';font-size:12px;font-weight:600;color:var(--soft);background:var(--bisque);border-radius:999px;padding:2px 9px}}
  .card{{display:grid;grid-template-columns:84px 1fr auto;gap:14px;align-items:start;background:#fff;border:1px solid var(--bisque);border-radius:14px;padding:14px 16px;margin-bottom:10px}}
  .card .time{{font-weight:700;color:var(--deep);font-size:14px;padding-top:2px}}
  .card h3{{margin:0 0 3px;font-size:16px;font-weight:600;line-height:1.25}}
  .card .host{{color:var(--soft);font-size:13px;margin-bottom:4px}}
  .card .host a.via{{color:var(--gold);text-decoration:none}}
  .card .meta{{color:#8a7e6d;font-size:12.5px;margin-bottom:8px}}
  .chips{{display:flex;flex-wrap:wrap;gap:6px}}
  .chip{{font-size:11px;font-weight:600;border:1px solid;border-radius:999px;padding:2px 9px;white-space:nowrap}}
  .action{{text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px}}
  a.reg{{display:inline-block;background:var(--gold);color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:8px 14px;border-radius:10px;white-space:nowrap}}
  a.reg:hover{{background:var(--deep)}}
  .sc{{font-size:11px;color:#b0a594}}
  .meta .warn{{color:{EXCL_COLOR};font-weight:700}}
  a.chip.srcx{{text-decoration:none}}
  .day.pinned{{background:#fdf4ee;border:1px solid #e7c3b3;border-radius:16px;padding:14px 16px 4px;margin-bottom:24px}}
  .day.pinned h2{{color:{EXCL_COLOR};margin-top:4px}}
  .pinnote{{color:#9a7d70;font-size:13px;margin:2px 0 12px}}
  button.f.excl{{border-color:{EXCL_COLOR};color:{EXCL_COLOR}}}
  button.f.excl.active{{background:{EXCL_COLOR};color:#fff;border-color:{EXCL_COLOR}}}
  footer{{margin-top:40px;color:#a99c89;font-size:12.5px;text-align:center}}
  @media(max-width:560px){{.card{{grid-template-columns:1fr;gap:6px}}.action{{align-items:flex-start;text-align:left}}}}
</style></head>
<body><div class="wrap">
  <header>
    <h1>{html.escape(label)}</h1>
    <div class="sub">{n} upcoming events, ranked by relevance. <b>{n_excl} invite-only / unlisted</b>, {n_x} surfaced from X. (Public listings; truly private events don&rsquo;t appear anywhere.)</div>
    <div class="sub">{src}</div>
    <div class="gen">Generated {html.escape(gen)}</div>
  </header>
  <div class="filters">{''.join(cat_buttons)}</div>
  {pinned}
  {''.join(sections)}
  <footer>Built by the Momentum Mill events agent · X + Luma · priority = relevance + exclusivity. Heuristic, so sanity-check before you go.</footer>
</div>
<script>
  const btns=[...document.querySelectorAll('button.f')], cards=[...document.querySelectorAll('.card')], days=[...document.querySelectorAll('.day')];
  btns.forEach(b=>b.onclick=()=>{{
    btns.forEach(x=>x.classList.remove('active')); b.classList.add('active');
    const f=b.dataset.f;
    cards.forEach(c=>{{
      const show = f==='all' || (f==='excl' ? c.dataset.excl==='1' : c.dataset.cat===f);
      c.style.display = show ? '' : 'none';
    }});
    days.forEach(d=>{{const vis=[...d.querySelectorAll('.card')].some(c=>c.style.display!=='none');d.style.display=vis?'':'none';}});
  }});
</script>
</body></html>""")


def _md_line(e):
    dt = local(parse_dt(e.get("start")), e.get("tz"))
    when = f"{_fmt_day(dt)}, {_fmt_time(dt)}" if dt else "date TBD"
    url = e.get("url") or e.get("discovered_via") or ""
    title = (e.get("title") or "Untitled").replace("[", "(").replace("]", ")")
    link = f"[{title}]({url})" if url else title
    notes = [e.get("exclusive_label") or e.get("category", "")]
    notes += _reg_status(e)
    xsrc = next((s for s in e.get("sources", []) if s.startswith("X @")), None)
    if xsrc and e.get("discovered_via"):
        notes.append(f"via [{xsrc}]({e['discovered_via']})")
    note = " · ".join(n for n in notes if n)
    return f"- **{when}** — {link}" + (f"  \n  {note}" if note else "")


def write_markdown(events, path, meta):
    """A plain list with a register link per event (easy to copy/paste/share)."""
    lines = [f"# {meta.get('label', 'Events')}", ""]
    lines.append(f"_{meta.get('sources_line','')} · generated {meta.get('generated','')}_")
    lines.append("")
    excl = [e for e in events if e.get("exclusive")]
    rest = [e for e in events if not e.get("exclusive")]
    if excl:
        lines.append("## ★ Invite-only / unlisted (most selective)")
        lines.append("_Host says invite-only, or unlisted on Luma. (Truly private events never appear in any public listing, so this is usually short.)_")
        lines.append("")
        lines += [_md_line(e) for e in excl]
        lines.append("")
    lines.append("## All upcoming events (public)")
    lines += [_md_line(e) for e in rest]
    lines.append("")
    return _write(path, "\n".join(lines))


def _write(path, content):
    with open(path, "w") as f:
        f.write(content)
    return path


def render_all(events, out_dir, meta):
    os.makedirs(out_dir, exist_ok=True)
    write_json(events, os.path.join(out_dir, "events.json"))
    write_csv(events, os.path.join(out_dir, "events.csv"))
    html_path = os.path.join(out_dir, "events.html")
    write_html(events, html_path, meta)
    write_markdown(events, os.path.join(out_dir, "events.md"), meta)
    # index.html mirrors the report so the out/ folder deploys as a static site.
    shutil.copyfile(html_path, os.path.join(out_dir, "index.html"))
    return {
        "json": os.path.join(out_dir, "events.json"),
        "csv": os.path.join(out_dir, "events.csv"),
        "html": html_path,
        "md": os.path.join(out_dir, "events.md"),
    }
