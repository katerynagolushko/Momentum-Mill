# eventbrite.py
# Eventbrite source. Keyless and reliable: Eventbrite's San Francisco category
# pages embed all their events as JSON-LD, so we just fetch the investor-relevant
# categories and read them straight out. No API key, no search engine.

import json
import re
import requests

import luma  # reuse _is_sf
from config import EB_DOMAIN, EB_LOCALE, EB_CATEGORIES

_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
_JSONLD_RX = re.compile(r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>', re.S)

# Categories + locale come from the active profile (config.py).
PAGES_PER_CATEGORY = 2


def _normalize(node, page_url):
    loc = node.get("location") if isinstance(node.get("location"), dict) else {}
    addr = loc.get("address") if isinstance(loc.get("address"), dict) else {}
    city_state = " ".join(str(addr.get(k)) for k in ("addressLocality", "addressRegion") if addr.get(k))
    org = node.get("organizer") or {}
    org_name = org.get("name") if isinstance(org, dict) else (org if isinstance(org, str) else None)
    img = node.get("image")
    return {
        "source": "eventbrite", "from_web": True, "id": None, "slug": None,
        "title": (node.get("name") or "").strip(),
        "start": node.get("startDate"), "end": node.get("endDate"), "tz": None,
        "city": city_state or None,
        "venue": loc.get("name"),
        "calendar": org_name, "host": org_name,
        "url": (node.get("url") or "").split("?")[0] or page_url,
        "cover": img if isinstance(img, str) else None,
        "guests": None, "going": None, "online": loc.get("name") == "Online events",
        "description": node.get("description"),
        "visibility": None, "require_approval": None,
        "spots_remaining": None, "is_sold_out": None, "is_near_capacity": None,
        "discovered_via": page_url,
        "_geo": {"city_state": city_state, "full_address": str(addr)}, "_coord": {},
    }


def _events_from_html(html, page_url):
    out = []
    for block in _JSONLD_RX.findall(html or ""):
        try:
            d = json.loads(block)
        except Exception:
            continue
        items = d if isinstance(d, list) else (d.get("itemListElement") or [d])
        for it in (items if isinstance(items, list) else [items]):
            node = it.get("item") if isinstance(it, dict) and "item" in it else it
            if isinstance(node, dict) and "Event" in str(node.get("@type", "")):
                out.append(_normalize(node, page_url))
    return out


def fetch_events(log=print):
    """Pull SF investor/founder events from Eventbrite's category pages."""
    s = requests.Session(); s.headers.update({"User-Agent": _UA})
    out = {}
    for cat in EB_CATEGORIES:
        n_before = len(out)
        for page in range(1, PAGES_PER_CATEGORY + 1):
            url = f"https://{EB_DOMAIN}/d/{EB_LOCALE}/{cat}/?page={page}"
            try:
                evs = _events_from_html(s.get(url, timeout=25).text, url)
            except Exception:
                evs = []
            for ev in evs:
                if not ev.get("title") or not ev.get("start"):
                    continue
                if not luma._is_sf(ev.get("_geo"), ev.get("_coord")):
                    continue
                ev["sources"] = ["Eventbrite"]
                out[ev["url"]] = ev
        log(f"  eventbrite/{cat}: +{len(out) - n_before}")
    log(f"  Eventbrite total: {len(out)} SF events")
    return list(out.values())
