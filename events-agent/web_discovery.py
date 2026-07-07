# web_discovery.py
# Open-web breadth, the way your friend's crawler works, but FREE and keyless by
# default. It searches the web (DuckDuckGo, no API key) for SF investor events,
# then pulls structured data:
#   - luma.com links  -> resolved as events, OR if it's a whole calendar, the
#                        calendar is followed and ALL its events pulled
#   - eventbrite / partiful event pages -> read via embedded JSON-LD Event data
#
# Backends, in order of preference if you set a key (more reliable than DDG):
#   SERPER_API_KEY  (free 2,500/mo, no card, serper.dev)
#   BRAVE_SEARCH_API_KEY  (paid since Feb 2026)
#   otherwise -> DuckDuckGo, no key needed.

import json
import os
import re
from urllib.parse import unquote, urlparse, parse_qs

import requests
from bs4 import BeautifulSoup

from config import (
    BRAVE_SEARCH_API_KEY, WEB_QUERIES,
    WEB_RESULTS_PER_QUERY, WEB_MAX_PAGES, HTTP_HEADERS,
)
import luma

SERPER_API_KEY = os.environ.get("SERPER_API_KEY", "")

_LUMA_RX = re.compile(r"https?://(?:lu\.ma|luma\.com)/([A-Za-z0-9\-]+)", re.I)
_LUMA_STOP = {"discover", "signin", "create", "home", "settings", "u", "user", "event", "sf"}
_EVENTPAGE_RX = re.compile(r"https?://(?:[\w.\-]*\.)?(eventbrite\.[\w.]+/e/|partiful\.com/e/)", re.I)
_JSONLD_RX = re.compile(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', re.S | re.I)
_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"


def _ddg(query, n):
    """Keyless DuckDuckGo search. Returns result URLs (best effort)."""
    try:
        r = requests.post("https://html.duckduckgo.com/html/", data={"q": query},
                          headers={"User-Agent": _UA}, timeout=20)
    except Exception:
        return []
    urls = []
    for a in BeautifulSoup(r.text, "html.parser").select("a.result__a"):
        href = a.get("href", "")
        if "uddg=" in href:
            href = unquote(parse_qs(urlparse(href).query).get("uddg", [""])[0])
        if href.startswith("http"):
            urls.append(href)
        if len(urls) >= n:
            break
    return urls


def _serper(query, key, n):
    try:
        r = requests.post("https://google.serper.dev/search",
                          headers={"X-API-KEY": key, "Content-Type": "application/json"},
                          json={"q": query, "num": n}, timeout=20)
        return [x.get("link") for x in (r.json().get("organic") or []) if x.get("link")]
    except Exception:
        return []


def _brave(query, key, n):
    try:
        r = requests.get("https://api.search.brave.com/res/v1/web/search",
                        params={"q": query, "count": n},
                        headers={"Accept": "application/json", "X-Subscription-Token": key}, timeout=15)
        return [x.get("url") for x in (r.json().get("web", {}).get("results") or []) if x.get("url")]
    except Exception:
        return []


def _search(query, n):
    if SERPER_API_KEY:
        return _serper(query, SERPER_API_KEY, n)
    if BRAVE_SEARCH_API_KEY:
        return _brave(query, BRAVE_SEARCH_API_KEY, n)
    return _ddg(query, n)


def _backend_name():
    return "Serper" if SERPER_API_KEY else ("Brave" if BRAVE_SEARCH_API_KEY else "DuckDuckGo (keyless)")


def _queries():
    # Topic-specific web queries come from the active profile (config.py). They aim
    # AWAY from Luma/Eventbrite (already scraped directly) and TOWARD organizer
    # sites, conferences, and Partiful, where the long-tail events live.
    return list(WEB_QUERIES)


# Domains that never hold a single extractable event (skip to save fetch budget).
_SKIP_DOMAINS = (
    "wikipedia.org", "pitchbook.com", "tracxn.com", "crunchbase.com", "linkedin.com",
    "reddit.com", "youtube.com", "twitter.com", "x.com", "facebook.com", "instagram.com",
)


def _from_jsonld(html_text, page_url):
    for block in _JSONLD_RX.findall(html_text or ""):
        try:
            data = json.loads(block.strip())
        except Exception:
            continue
        items = data if isinstance(data, list) else data.get("@graph", [data])
        for it in (items if isinstance(items, list) else [items]):
            if not isinstance(it, dict):
                continue
            t = it.get("@type", "")
            t = " ".join(t) if isinstance(t, list) else str(t)
            if "Event" not in t:
                continue
            loc = it.get("location") or {}
            addr = (loc.get("address") if isinstance(loc, dict) else {}) or {}
            addr = addr if isinstance(addr, dict) else {}
            city_state = " ".join(str(addr.get(k)) for k in ("addressLocality", "addressRegion") if addr.get(k))
            org = it.get("organizer") or {}
            return {
                "source": "web", "from_web": True, "id": None, "slug": None,
                "title": (it.get("name") or "").strip(),
                "start": it.get("startDate"), "end": it.get("endDate"), "tz": None,
                "city": city_state or None,
                "venue": loc.get("name") if isinstance(loc, dict) else None,
                "calendar": org.get("name") if isinstance(org, dict) else None,
                "host": org.get("name") if isinstance(org, dict) else None,
                "url": it.get("url") or page_url,
                "cover": it.get("image") if isinstance(it.get("image"), str) else None,
                "guests": None, "going": None, "online": False,
                "description": it.get("description"),
                "visibility": None, "require_approval": None,
                "spots_remaining": None, "is_sold_out": None, "is_near_capacity": None,
                "discovered_via": page_url,
                "_geo": {"city_state": city_state, "full_address": str(addr)}, "_coord": {},
            }
    return None


def fetch_events(log=print):
    """Search the open web (keyless) and return normalized SF events."""
    s = requests.Session(); s.headers.update(HTTP_HEADERS)
    log(f"  web backend: {_backend_name()}")

    # 1) Discover candidate URLs.
    urls = []
    for q in _queries():
        hits = _search(q, WEB_RESULTS_PER_QUERY)
        log(f"  web: '{q[:46]}...' -> {len(hits)}")
        urls += hits
    seen = set(); cand = []
    for u in urls:
        key = u.split("?")[0]
        if key not in seen:
            seen.add(key); cand.append(u)

    # 2) Extract events. Luma links are resolved as events; luma calendars are
    #    followed in full; eventbrite/partiful event pages via JSON-LD.
    out = {}
    seen_cals = set()
    pages = 0
    for u in cand:
        if pages >= WEB_MAX_PAGES:
            break
        m = _LUMA_RX.match(u)
        if m and m.group(1).lower() not in _LUMA_STOP:
            slug = m.group(1)
            ev = luma.resolve_slug(slug, s)
            if ev:
                _keep(ev, out)
            else:  # maybe it's a calendar page -> pull it whole
                cid = luma.calendar_id_for_slug(slug, s)
                if cid and cid not in seen_cals:
                    seen_cals.add(cid)
                    for cev in luma.fetch_calendar_events(cid, s):
                        cev["sources"] = ["Open web (Luma calendar)"]
                        _keep(cev, out)
            pages += 1
        elif not any(d in u for d in _SKIP_DOMAINS):
            # Any other page (organizer site, Partiful, conference) -> try JSON-LD.
            try:
                ev = _from_jsonld(s.get(u, timeout=15, headers={"User-Agent": _UA}).text, u)
            except Exception:
                ev = None
            if ev:
                _keep(ev, out)
            pages += 1

    log(f"  web discovery: {pages} pages, {len(seen_cals)} new calendars -> {len(out)} SF events")
    return list(out.values())


def _keep(ev, out):
    if not ev or not ev.get("title") or not ev.get("start"):
        return
    # Organizer/Partiful pages often skip a structured address, so also accept an
    # SF mention in the text.
    text = " ".join(str(ev.get(k) or "") for k in ("title", "description", "city", "venue")).lower()
    sf = (luma._is_sf(ev.get("_geo"), ev.get("_coord"))
          or "san francisco" in text or "sf tech week" in text or " sf " in text)
    if not sf:
        return
    ev["from_web"] = True
    ev.setdefault("sources", ["Open web"])
    out[ev.get("slug") or ev.get("url")] = ev
