# relevance.py
# Decide whether an event is about meeting investors / VCs / angels, how strongly,
# and which bucket it falls into. Pure functions, no network.

import re
from config import (
    RELEVANCE_RULES, NEGATIVE_RULES, CATEGORY_ORDER, INVITE_ONLY_PATTERNS,
    EXCL_VISIBILITY_PRIVATE, EXCL_TEXT_INVITE, EXCL_APPROVAL,
    EXCL_INTIMATE, INTIMATE_SPOTS, X_SOURCE_BOOST,
)

_INVITE = [re.compile(p, re.I) for p in INVITE_ONLY_PATTERNS]

# Pre-compile the rules once.
_RULES = [(re.compile(pat, re.I), weight, cat) for pat, weight, cat in RELEVANCE_RULES]
_NEG = [(re.compile(pat, re.I), weight) for pat, weight in NEGATIVE_RULES]
_CAT_PRIORITY = {cat: i for i, cat in enumerate(CATEGORY_ORDER)}


def score_text(text):
    """Score a blob of event text. Returns (score, category, matched_terms)."""
    if not text:
        return 0, None, []
    score = 0
    matched = []
    cats = set()
    for rx, weight, cat in _RULES:
        m = rx.search(text)
        if m:
            score += weight
            matched.append(m.group(0).strip().lower())
            cats.add(cat)
    # Subtract for party/music/social signals.
    for rx, weight in _NEG:
        if rx.search(text):
            score += weight
    category = None
    if cats:
        # Pick the highest-priority category that matched.
        category = sorted(cats, key=lambda c: _CAT_PRIORITY.get(c, 99))[0]
    # De-dupe matched terms, preserve order.
    seen = set()
    terms = [t for t in matched if not (t in seen or seen.add(t))]
    return score, category, terms


def classify_event(ev):
    """Attach relevance fields to a normalized event dict (in place) and return it.

    Looks at title + host + calendar + description so an event called just
    'June Mixer' still scores if it's hosted by 'SF Angel Collective'.
    """
    blob = " ".join(
        str(ev.get(k) or "")
        for k in ("title", "host", "calendar", "description", "source_text")
    )
    score, category, terms = score_text(blob)
    ev["score"] = score
    ev["category"] = category or "Other"
    ev["matched"] = terms
    return ev


def exclusivity(ev):
    """Decide whether an event is genuinely selective, and label it honestly.

    Only two things count as actually exclusive:
      - "Unlisted on Luma": the event's visibility is not public (truly private).
        These almost never show up, because unlisted events aren't in any public
        listing, which is the whole point of them.
      - "Invite-only": the host's own wording (title or their tweet) says so.
    Everything else is a PUBLIC event. Approval-required and a small headcount are
    common and only nudge the ranking; they do NOT make an event "private".
    """
    boost = 0
    labels = []

    vis = ev.get("visibility")
    vis_private = bool(vis and vis != "public")

    text = " ".join(str(ev.get(k) or "") for k in ("title", "host", "source_text"))
    text_invite = bool(ev.get("invite_only_text")) or any(rx.search(text) for rx in _INVITE)

    sr = ev.get("spots_remaining")
    intimate = isinstance(sr, int) and 0 < sr <= INTIMATE_SPOTS

    if vis_private:
        boost += EXCL_VISIBILITY_PRIVATE
        labels.append("Unlisted on Luma")
    if text_invite:
        boost += EXCL_TEXT_INVITE
        labels.append("Invite-only (host's wording)")
    if ev.get("require_approval"):
        boost += EXCL_APPROVAL
    if intimate:
        boost += EXCL_INTIMATE

    ev["exclusivity"] = boost
    ev["exclusive"] = vis_private or text_invite
    ev["exclusive_labels"] = labels
    ev["exclusive_label"] = labels[0] if labels else None
    return ev


def priority(ev):
    """Final ranking number: relevance + exclusivity + an X-source nudge."""
    p = ev.get("score", 0) + ev.get("exclusivity", 0)
    if ev.get("from_x"):
        p += X_SOURCE_BOOST
    ev["priority"] = p
    return p
