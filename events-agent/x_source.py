# x_source.py
# X (Twitter) source: the PRIMARY discovery layer. Uses the installed x-twitter
# skill's `search` command (X API v2 recent search, last 7 days) on YOUR own
# developer credentials. Each query is a paid API call.
#
# X finds event announcements (usually with a luma/partiful link) that never hit
# Luma's public SF feed: invite-only dinners, "apply to attend" nights, etc.
# Every luma link is resolved back to full structured data, and the tweet's own
# wording ("invite only", "apply") is captured as an exclusivity signal.
#
# Credential note: the skill reads its .env from its OWN directory, so we run it
# with cwd=<skill dir>. That's the whole trick to making it authenticate.

import json
import os
import re
import subprocess

from config import (
    X_SKILL_DIR, X_QUERIES, X_MAX_RESULTS, INVITE_ONLY_PATTERNS,
)
import luma

_LUMA_RX = re.compile(r"https?://(?:lu\.ma|luma\.com)/([A-Za-z0-9\-]+)", re.I)
_OTHER_EVENT_RX = re.compile(
    r"https?://(?:[\w.\-]*\.)?(partiful\.com|eventbrite\.[\w.]+)/[^\s]+", re.I
)
_INVITE_RX = [re.compile(p, re.I) for p in INVITE_ONLY_PATTERNS]
# luma slugs are paths but not these reserved/section words.
_LUMA_STOP = {"discover", "signin", "create", "home", "settings", "u", "user", "event"}


class XUnavailable(Exception):
    """Raised when X search can't run (bad creds, wrong API tier, etc.)."""


def _run_search(query, max_results):
    """Call the skill once, from its own dir so it finds .env. Returns parsed JSON."""
    entry = os.path.join(X_SKILL_DIR, "x.js")
    if not os.path.exists(entry):
        raise XUnavailable(f"x-twitter skill not found at {entry}")
    cmd = [
        "node", "x.js", "search", query,
        "--max-results", str(max_results),
        "--sort", "recency",
        "--fields", "text,created_at,public_metrics,author_id,entities",
        "--raw",
    ]
    try:
        proc = subprocess.run(
            cmd, capture_output=True, text=True, timeout=120, cwd=X_SKILL_DIR
        )
    except FileNotFoundError:
        raise XUnavailable("node is not installed or not on PATH")
    except subprocess.TimeoutExpired:
        raise XUnavailable("X search timed out")
    out = (proc.stdout or "").strip()
    if not out:
        msg = (proc.stderr or "").strip() or f"exit {proc.returncode} with no output"
        raise XUnavailable(msg.splitlines()[0][:200] if msg else "no output")
    try:
        return json.loads(out)
    except json.JSONDecodeError:
        i = min([x for x in (out.find("{"), out.find("[")) if x != -1], default=-1)
        if i != -1:
            try:
                return json.loads(out[i:])
            except json.JSONDecodeError:
                pass
        raise XUnavailable("could not parse X response")


def _looks_invite_only(text):
    return any(rx.search(text or "") for rx in _INVITE_RX)


def _event_urls(tweet):
    """Real destination URLs from a tweet (expandedUrl is the un-shortened link)."""
    urls = []
    for u in (tweet.get("entities") or {}).get("urls", []):
        dest = u.get("expandedUrl") or u.get("expanded_url") or u.get("url")
        if dest:
            urls.append(dest)
    seen = set()
    return [u for u in urls if not (u in seen or seen.add(u))]


def _clean_title(text):
    line = next((ln.strip() for ln in (text or "").splitlines() if ln.strip()), "")
    line = re.sub(r"https?://\S+", "", line).strip()
    return (line[:120] or "Event on X").strip()


def fetch_events(queries=None, max_results=None, log=print):
    """Run the X queries and return normalized events. Empty list if unavailable."""
    queries = queries or X_QUERIES
    max_results = max_results or X_MAX_RESULTS
    session = luma._session()
    by_key = {}

    def add(ev, label):
        key = ev.get("slug") or ev.get("url")
        if not key:
            return
        if key in by_key:
            if label not in by_key[key]["sources"]:
                by_key[key]["sources"].append(label)
        else:
            ev["sources"] = [label]
            by_key[key] = ev

    total = 0
    for i, q in enumerate(queries, 1):
        try:
            resp = _run_search(q, max_results)
        except XUnavailable as e:
            log(f"  X search unavailable: {e}")
            return []  # a creds/tier problem affects every query
        tweets = resp.get("data") or []
        users = {u["id"]: u for u in (resp.get("includes") or {}).get("users", [])}
        total += len(tweets)
        log(f"  X query {i}: {len(tweets)} tweets")
        for tw in tweets:
            author = users.get(tw.get("authorId") or tw.get("author_id"), {})
            handle = author.get("username")
            label = f"X @{handle}" if handle else "X"
            permalink = (
                f"https://x.com/{handle}/status/{tw.get('id')}"
                if handle and tw.get("id") else None
            )
            invite = _looks_invite_only(tw.get("text"))
            for url in _event_urls(tw):
                m = _LUMA_RX.match(url)
                if m and m.group(1).lower() not in _LUMA_STOP:
                    ev = luma.resolve_slug(m.group(1), session)
                    if ev and luma._is_sf(ev.get("_geo"), ev.get("_coord")):
                        ev["from_x"] = True
                        ev["invite_only_text"] = invite
                        ev["source_text"] = tw.get("text")
                        ev["discovered_via"] = permalink
                        add(ev, label)
                elif _OTHER_EVENT_RX.match(url):
                    add({
                        "source": "x", "from_x": True, "invite_only_text": invite,
                        "id": None, "slug": None,
                        "title": _clean_title(tw.get("text")),
                        "start": None, "end": None, "tz": None,
                        "city": None, "venue": None, "calendar": None,
                        "host": f"@{handle}" if handle else None,
                        "url": url.split("?")[0],
                        "cover": None, "guests": None, "going": None, "online": False,
                        "description": tw.get("text"),
                        "visibility": None, "require_approval": None,
                        "spots_remaining": None, "is_sold_out": None, "is_near_capacity": None,
                        "source_text": tw.get("text"), "discovered_via": permalink,
                        "_geo": {}, "_coord": {},
                    }, label)
    log(f"  X total: {total} tweets -> {len(by_key)} event links")
    return list(by_key.values())
