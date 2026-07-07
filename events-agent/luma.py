# luma.py
# Luma source. No login required.
#
# Strategy (all three endpoints verified to work anonymously and to honor SF,
# unlike the public /discover feed which is geolocked to the caller's IP):
#   1. Read luma.com/sf -> the page server-renders ~20 real SF events in its
#      embedded __NEXT_DATA__ JSON. This is the spine.
#   2. Harvest the calendars behind those events and pull each calendar's
#      upcoming items (calendar/get-items honors the calendar id, not your IP),
#      which surfaces more events from the same investor/founder communities.
#   3. resolve_slug() turns any luma URL (e.g. one found on X) into the same
#      structured shape.

import json
import re
import sys
import requests

from config import (
    LUMA_SF_PAGE, SF_CITY_MATCHES, SF_BBOX, HTTP_HEADERS, MAX_CALENDARS_TO_EXPAND,
    SEED_CALENDARS,
)

API = "https://api.lu.ma"


def _session():
    s = requests.Session()
    s.headers.update(HTTP_HEADERS)
    return s


def _is_sf(geo, coordinate):
    """True if the event looks like it's in/around San Francisco."""
    city = ((geo or {}).get("city_state") or "").lower()
    full = ((geo or {}).get("full_address") or "").lower()
    hay = city + " " + full
    if any(m in hay for m in SF_CITY_MATCHES):
        return True
    # Coordinate fallback (some events hide the address).
    c = coordinate or {}
    lat, lng = c.get("latitude"), c.get("longitude")
    if isinstance(lat, (int, float)) and isinstance(lng, (int, float)):
        b = SF_BBOX
        if b["lat_min"] <= lat <= b["lat_max"] and b["lng_min"] <= lng <= b["lng_max"]:
            return True
    return False


def _event_core(entry):
    """Pull the event object out of either a discover entry or a url-detail blob."""
    if not isinstance(entry, dict):
        return None
    ev = entry.get("event") if isinstance(entry.get("event"), dict) else entry
    if not isinstance(ev, dict) or not ev.get("name") or not ev.get("start_at"):
        return None
    return ev


def _hosts_label(entry, calendar):
    names = []
    cal_name = (calendar or {}).get("name")
    if cal_name:
        names.append(cal_name)
    for h in (entry.get("hosts") or []):
        n = (h or {}).get("name")
        if n and n not in names:
            names.append(n)
    return ", ".join(names)


def _normalize(entry, source_label):
    """Turn a Luma entry/detail into the shared event dict, or None if not usable."""
    ev = _event_core(entry)
    if not ev:
        return None
    calendar = entry.get("calendar") if isinstance(entry.get("calendar"), dict) else {}
    ti = entry.get("ticket_info") if isinstance(entry.get("ticket_info"), dict) else {}
    geo = ev.get("geo_address_info") or {}
    coord = ev.get("coordinate") or {}
    slug = ev.get("url") or ""
    return {
        "source": "luma",
        "sources": [source_label],
        "id": ev.get("api_id"),
        "slug": slug,
        "title": (ev.get("name") or "").strip(),
        "start": ev.get("start_at"),
        "end": ev.get("end_at"),
        "tz": ev.get("timezone"),
        "city": geo.get("city_state"),
        "venue": geo.get("address") or geo.get("full_address") or geo.get("place_name"),
        "calendar": calendar.get("name"),
        "host": _hosts_label(entry, calendar),
        "url": f"https://luma.com/{slug}" if slug else None,
        "cover": ev.get("cover_url") or ev.get("social_image_url"),
        "guests": entry.get("guest_count") if entry.get("guest_count") is not None else ev.get("guest_count"),
        "going": entry.get("registration_availability") or ev.get("registration_availability"),
        "online": ev.get("location_type") == "online",
        "description": None,
        # Exclusivity signals. visibility is on the event; approval/capacity live
        # in ticket_info (present on resolved detail; sometimes absent on the feed,
        # in which case enrich_event() fills them in).
        "visibility": ev.get("visibility"),
        "require_approval": ti.get("require_approval"),
        "spots_remaining": ti.get("spots_remaining"),
        "is_sold_out": ti.get("is_sold_out") if ti.get("is_sold_out") is not None else entry.get("sold_out"),
        "is_near_capacity": ti.get("is_near_capacity"),
        "event_invite": entry.get("event_invite"),
        "_geo": geo,
        "_coord": coord,
        "_calendar_id": calendar.get("api_id"),
    }


def _walk_entries(node, out):
    """Recursively collect anything that looks like an event entry."""
    if isinstance(node, dict):
        if isinstance(node.get("event"), dict) and node["event"].get("start_at"):
            out.append(node)
        for v in node.values():
            _walk_entries(v, out)
    elif isinstance(node, list):
        for v in node:
            _walk_entries(v, out)


def fetch_sf_page_events(session=None):
    """Scrape the server-rendered SF events from luma.com/sf."""
    s = session or _session()
    html = s.get(LUMA_SF_PAGE, timeout=25).text
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
    if not m:
        return []
    data = json.loads(m.group(1))
    raw = []
    _walk_entries(data, raw)
    events = []
    for entry in raw:
        norm = _normalize(entry, "Luma SF feed")
        if norm:
            events.append(norm)
    return events


def fetch_calendar_events(cal_id, session=None, max_events=300):
    """All upcoming items for one calendar, PAGINATED (honors the calendar id,
    not your IP). A big aggregator like 'Deep Tech Week' has far more than one
    page, so we follow next_cursor until it runs out."""
    s = session or _session()
    out = []
    cursor = None
    pages = 0
    while len(out) < max_events and pages < 15:
        params = {"calendar_api_id": cal_id, "period": "future", "pagination_limit": 50}
        if cursor:
            params["pagination_cursor"] = cursor
        try:
            j = s.get(f"{API}/calendar/get-items", params=params, timeout=25).json() or {}
        except Exception:
            break
        for entry in (j.get("entries") or []):
            norm = _normalize(entry, "Luma calendar")
            if norm:
                out.append(norm)
        pages += 1
        if j.get("has_more") and j.get("next_cursor"):
            cursor = j["next_cursor"]
        else:
            break
    return out


def resolve_slug(slug, session=None):
    """Turn a luma slug (e.g. from an X link) into a normalized event, or None."""
    s = session or _session()
    slug = slug.strip().strip("/")
    try:
        r = s.get(f"{API}/url", params={"url": slug}, timeout=20)
        blob = r.json()
    except Exception:
        return None
    if not isinstance(blob, dict) or blob.get("kind") != "event":
        return None
    return _normalize(blob.get("data") or {}, "Luma (via X link)")


def calendar_id_for_slug(slug, session=None):
    """Resolve a luma.com/<slug> calendar page to its calendar api_id (so a
    calendar discovered on the open web can be pulled in full)."""
    from collections import Counter
    s = session or _session()
    try:
        html = s.get(f"https://luma.com/{slug.strip('/')}", timeout=20).text
        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
        data = json.loads(m.group(1))
    except Exception:
        return None
    ids = Counter()
    def walk(o):
        if isinstance(o, dict):
            if o.get("event") and isinstance(o.get("event"), dict):
                c = o.get("calendar") or {}
                if c.get("api_id"):
                    ids[c["api_id"]] += 1
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(data)
    return ids.most_common(1)[0][0] if ids else None


def enrich_event(ev, session=None):
    """Fill exclusivity / registration fields from the event detail endpoint.

    The SF feed doesn't include require_approval / spots_remaining, so we fetch
    the event detail for events we actually care about (after relevance filtering)
    to know whether they're invite-only, approval-gated, or filling up.
    """
    slug = ev.get("slug")
    if not slug:
        return ev
    s = session or _session()
    try:
        d = (s.get(f"{API}/url", params={"url": slug}, timeout=15).json() or {}).get("data", {})
    except Exception:
        return ev
    detail = d.get("event") or {}
    ti = d.get("ticket_info") or {}
    if not detail and not ti:
        return ev
    if detail.get("visibility") is not None:
        ev["visibility"] = detail["visibility"]
    for key in ("require_approval", "spots_remaining", "is_near_capacity"):
        if ti.get(key) is not None:
            ev[key] = ti[key]
    so = ti.get("is_sold_out")
    so = d.get("sold_out") if so is None else so
    if so is not None:
        ev["is_sold_out"] = so
    ra = d.get("registration_availability")
    if ra:
        ev["going"] = ra
    if ev.get("guests") is None and d.get("guest_count") is not None:
        ev["guests"] = d.get("guest_count")
    if not ev.get("event_invite") and d.get("event_invite") is not None:
        ev["event_invite"] = d.get("event_invite")
    return ev


def fetch_events(expand_calendars=True, log=print):
    """Full Luma pass: SF page + calendar expansion, deduped and SF-filtered."""
    s = _session()
    by_id = {}

    def add(ev):
        if not ev:
            return
        if not _is_sf(ev.get("_geo"), ev.get("_coord")):
            return
        key = ev.get("id") or ev.get("slug")
        if not key:
            return
        if key in by_id:
            # Merge source labels if we've seen it from two paths.
            for lbl in ev.get("sources", []):
                if lbl not in by_id[key]["sources"]:
                    by_id[key]["sources"].append(lbl)
        else:
            by_id[key] = ev

    page = fetch_sf_page_events(s)
    log(f"  Luma feed page: {len(page)} events")
    for ev in page:
        add(ev)

    if expand_calendars:
        # Start with the curated big SF calendars, then add ones from the feed.
        cal_ids = [cid for _, cid in SEED_CALENDARS]
        for ev in page:
            cid = ev.get("_calendar_id")
            if cid and cid not in cal_ids:
                cal_ids.append(cid)
        cal_ids = cal_ids[:MAX_CALENDARS_TO_EXPAND]
        before = len(by_id)
        for cid in cal_ids:
            for ev in fetch_calendar_events(cid, s):
                add(ev)
        added = len(by_id) - before
        log(f"  Luma calendars: followed {len(cal_ids)} ({len(SEED_CALENDARS)} seeded), +{added} new events")

    return list(by_id.values())


if __name__ == "__main__":
    # Quick manual check: python3 events-agent/luma.py
    evs = fetch_events()
    print(f"\n{len(evs)} SF events on Luma:\n")
    for e in sorted(evs, key=lambda x: x.get("start") or ""):
        print(f"  {e['start']}  {e['title'][:55]:55}  [{e.get('host') or ''}]")
