#!/usr/bin/env python3
# scrape.py
# Find San Francisco events where you can meet investors, VCs, and angels.
# X is the primary discovery source; Luma's SF feed and (optionally) the open web
# add breadth. Private / invite-only events are pushed to the top.
#
#   python3 events-agent/scrape.py            # X + Luma  (X = a few paid calls)
#   python3 events-agent/scrape.py --no-x     # Luma only, free
#   python3 events-agent/scrape.py --web      # also search the open web (needs Brave key)
#   python3 events-agent/scrape.py --all      # keep every SF event, skip relevance filter
#   python3 events-agent/scrape.py --open     # open the HTML report when done

import argparse
import os
import re
import sys
from datetime import datetime, timezone, timedelta

# Pick the topic profile BEFORE importing config (config reads EVENTS_PROFILE at
# import time), so `--topic governance-london` takes effect.
if "--topic" in sys.argv:
    _i = sys.argv.index("--topic")
    if _i + 1 < len(sys.argv):
        os.environ["EVENTS_PROFILE"] = sys.argv[_i + 1]

import config
import luma
import x_source
import eventbrite
import web_discovery
from relevance import classify_event, exclusivity, priority
from render import render_all, parse_dt, local, _fmt_day, _fmt_time

CATEGORY_ORDER = config.CATEGORY_ORDER + ["Other"]
_EXCL_FIELDS = ("visibility", "require_approval", "spots_remaining", "is_sold_out", "is_near_capacity")


def _norm_title(t):
    return re.sub(r"[^a-z0-9]+", "", (t or "").lower())


def merge(events):
    """Combine the same event seen from multiple sources into one record."""
    out = {}
    for e in events:
        key = e.get("id") or e.get("slug") or e.get("url") or _norm_title(e.get("title"))
        if key not in out:
            out[key] = dict(e)
            continue
        cur = out[key]
        for s in e.get("sources", []):
            if s not in cur["sources"]:
                cur["sources"].append(s)
        # OR the boolean signals.
        for flag in ("from_x", "from_web", "invite_only_text"):
            if e.get(flag):
                cur[flag] = True
        # Fill any missing fields (so X's approval data lands on a feed record).
        for k, v in e.items():
            if cur.get(k) in (None, "", []) and v not in (None, "", []):
                cur[k] = v
    return list(out.values())


def is_upcoming(e, now, date_from=None, date_until=None):
    dt = parse_dt(e.get("start"))
    if dt is None:
        return True  # undated leads (from X) stay in, sorted to the end
    if date_from and dt < date_from:
        return False
    if date_until and dt > date_until:
        return False
    return dt >= now - timedelta(hours=6)


def main(argv=None):
    ap = argparse.ArgumentParser(description="Scrape events by topic + city (see --topic).")
    ap.add_argument("--topic", default=None,
                    help="profile to use: " + " | ".join(config.PROFILES.keys()))
    ap.add_argument("--no-x", action="store_true", help="skip X search (Luma only, free)")
    ap.add_argument("--no-eventbrite", action="store_true", help="skip Eventbrite")
    ap.add_argument("--web", action="store_true", help="also search the open web (keyless DuckDuckGo, or a Serper/Brave key)")
    ap.add_argument("--all", action="store_true", help="keep every SF event, skip the relevance filter")
    ap.add_argument("--min-score", type=int, default=None, help=f"min relevance score (default {config.MIN_SCORE})")
    ap.add_argument("--limit", type=int, default=None, help="X tweets per query")
    ap.add_argument("--no-expand", action="store_true", help="don't follow calendars on Luma")
    ap.add_argument("--from", dest="date_from", default=None,
                    help="only events on/after this date (YYYY-MM-DD)")
    ap.add_argument("--until", dest="date_until", default=None,
                    help="only events on/before this date (YYYY-MM-DD)")
    ap.add_argument("--open", action="store_true", help="open the HTML report when done")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args(argv)

    log = (lambda *a: None) if args.quiet else (lambda *a: print(*a))
    now = datetime.now(timezone.utc)
    min_score = 0 if args.all else (args.min_score if args.min_score is not None else config.MIN_SCORE)
    log(f"Profile: {config.PROFILE_LABEL}  [{config.ACTIVE_PROFILE}]\n")

    sources_used = []
    events = []

    if not args.no_x:
        log("Searching X (primary)...")
        xs = x_source.fetch_events(max_results=args.limit, log=log)
        if xs:
            sources_used.append("X recent search")
        events += xs

    log("Scraping Luma...")
    events += luma.fetch_events(expand_calendars=not args.no_expand, log=log)
    sources_used.append("Luma SF discover")

    if not args.no_eventbrite:
        log("Scraping Eventbrite...")
        ebs = eventbrite.fetch_events(log=log)
        if ebs:
            sources_used.append("Eventbrite")
        events += ebs

    if args.web:
        log("Searching open web...")
        ws = web_discovery.fetch_events(log=log)
        if ws:
            sources_used.append("Open web")
        events += ws

    # Merge duplicates, classify relevance, filter.
    events = merge(events)
    for e in events:
        classify_event(e)
    date_from = date_until = None
    if args.date_from:
        date_from = datetime.strptime(args.date_from, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    if args.date_until:
        date_until = datetime.strptime(args.date_until, "%Y-%m-%d").replace(
            hour=23, minute=59, second=59, tzinfo=timezone.utc)
    kept = [e for e in events if is_upcoming(e, now, date_from, date_until)
            and e.get("score", 0) >= min_score]

    # Enrich kept Luma events that lack approval/visibility data (bounded count).
    session = luma._session()
    to_enrich = [e for e in kept if e.get("slug") and e.get("require_approval") is None]
    if to_enrich:
        log(f"Enriching {len(to_enrich)} events with private/approval status...")
        for e in to_enrich:
            luma.enrich_event(e, session)

    # Exclusivity + final priority.
    for e in kept:
        exclusivity(e)
        priority(e)

    # Rank by priority (relevance + exclusivity + X nudge), then by date.
    kept.sort(key=lambda e: (-e.get("priority", 0), parse_dt(e.get("start")) or datetime.max.replace(tzinfo=timezone.utc)))

    cat_counts = {}
    for e in kept:
        cat_counts[e["category"]] = cat_counts.get(e["category"], 0) + 1
    n_excl = sum(1 for e in kept if e.get("exclusive"))
    n_x = sum(1 for e in kept if e.get("from_x"))
    meta = {
        "label": config.PROFILE_LABEL,
        "category_order": config.CATEGORY_ORDER,
        "generated": local(now).strftime("%b %-d, %Y at %-I:%M %p %Z"),
        "sources_line": "Sources: " + ", ".join(sources_used),
        "cat_counts": cat_counts,
        "n_exclusive": n_excl,
        "n_x": n_x,
    }
    paths = render_all(kept, config.OUT_DIR, meta)

    # Console summary.
    log("")
    log(f"{len(kept)} relevant events (from {len(events)} scraped). "
        f"{n_excl} invite-only/unlisted, {n_x} found via X.")
    log("")
    for e in kept[:30]:
        dt = local(parse_dt(e.get("start")), e.get("tz"))
        when = f"{_fmt_day(dt)} {_fmt_time(dt)}" if dt else "date TBD"
        star = "★" if e.get("exclusive") else " "
        def _tag(s):
            if s.startswith("X"): return "X"
            if s.startswith("Eventbrite"): return "E"
            if "web" in s.lower(): return "W"
            return "L"
        srcs = "+".join(_tag(s) for s in e["sources"])
        tag = (e.get("exclusive_label") or e["category"])[:18]
        print(f"  {star}[{e.get('priority',0):>2}] {when:18} {e['title'][:42]:42} · {tag:18} ({srcs})")
    if len(kept) > 30:
        log(f"  ... and {len(kept)-30} more in the report.")
    log("")
    log(f"List:    {paths['md']}")
    log(f"Report:  {paths['html']}")
    log(f"Data:    {paths['csv']}  /  {paths['json']}")

    if args.open:
        import subprocess
        subprocess.run(["open", paths["html"]], check=False)
    return 0


if __name__ == "__main__":
    sys.exit(main())
