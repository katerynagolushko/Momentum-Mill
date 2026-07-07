# config.py
# The scraper is topic- and city-agnostic. Everything topic-specific lives in a
# PROFILE below. Pick one with the EVENTS_PROFILE env var, or `scrape.py --topic`.
#   investors-sf       -> SF investor / VC / angel events  (default)
#   governance-london  -> London corporate governance events
# Add a new profile by copying a block and changing the keywords, queries,
# location, and Eventbrite locale.

import os

# --- Where things live -------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "out")


def _load_dotenv():
    """Load events-agent/.env (gitignored) so saved API keys are picked up."""
    try:
        with open(os.path.join(HERE, ".env")) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    except FileNotFoundError:
        pass


_load_dotenv()

# === Shared knobs (same for every topic) =====================================
X_SKILL_DIR = os.environ.get("X_SKILL_DIR", os.path.expanduser("~/.claude/skills/x-twitter"))
HTTP_HEADERS = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}
MAX_CALENDARS_TO_EXPAND = 60
X_MAX_RESULTS = 40
WEB_RESULTS_PER_QUERY = 10
WEB_MAX_PAGES = 20
BRAVE_SEARCH_API_KEY = os.environ.get("BRAVE_SEARCH_API_KEY", "")

# Party / music / social noise that can match a topic word by accident.
NEGATIVE_RULES_COMMON = [
    (r"\balgo\s*rave\b", -6), (r"\brave\b", -4), (r"\bdj\s*set\b", -3),
    (r"\blive\s*music\b", -2), (r"\bconcert\b", -3), (r"\bnightclub\b", -3),
    (r"\bkink\b", -5), (r"\bworkout\b", -3), (r"\bpickleball\b", -2), (r"\bart\s*show\b", -2),
]

# Wording that marks a genuinely invite-only event (topic-agnostic).
INVITE_ONLY_PATTERNS = [
    r"invite[\s-]?only", r"\binvite[\s-]?list\b", r"\bby application\b",
    r"\bapply (to attend|to join|here|now|below)\b", r"\brequest to join\b",
    r"\bmembers[\s-]?only\b", r"\bclosed[\s-]?door\b", r"\brsvp to be considered\b",
]

# Exclusivity / ranking weights (topic-agnostic).
EXCL_VISIBILITY_PRIVATE = 12
EXCL_TEXT_INVITE        = 6
EXCL_OFF_FEED_X         = 3
EXCL_APPROVAL           = 1
EXCL_INTIMATE           = 2
INTIMATE_SPOTS          = 20
X_SOURCE_BOOST          = 3

# === PROFILES ================================================================
PROFILES = {
    # -------------------------------------------------------------------------
    "investors-sf": {
        "label": "SF investor / VC / angel events",
        "luma_page": "https://luma.com/sf",
        "luma_place_id": "discplace-BDj7GNbGlsF7Cka",
        "city_matches": [
            "san francisco", "sf,", "soma", "oakland", "berkeley",
            "south san francisco", "brisbane", "daly city",
            "south bay", "palo alto", "menlo park", "mountain view",
            "redwood city", "san mateo",
        ],
        "bbox": {"lat_min": 37.20, "lat_max": 37.95, "lng_min": -122.65, "lng_max": -121.80},
        "seed_calendars": [
            ("SF Tech Week",           "cal-qounT8iH8rZ7uJG"),
            ("Deep Tech Week",         "cal-3n76GGYjpWhohHU"),
            ("AI Events SF",           "cal-SbCHaOYXyeQHVgB"),
            ("Bay Area Founders Club", "cal-FY3B7z10sFQaLa9"),
        ],
        "category_order": ["Pitch / Demo", "Investor mixer", "Fundraising", "Founder community"],
        "min_score": 4,
        "relevance_rules": [
            (r"\bpitch\s*(night|day|competition|comp|off|slam|fest)\b", 6, "Pitch / Demo"),
            (r"\bdemo\s*day\b", 6, "Pitch / Demo"),
            (r"\bshark\s*tank\b", 5, "Pitch / Demo"),
            (r"\bpitch\b", 3, "Pitch / Demo"),
            (r"\binvestor[s]?\b", 5, "Investor mixer"),
            (r"\bangel[s]?\b", 4, "Investor mixer"),
            (r"\bangel\s*investor[s]?\b", 6, "Investor mixer"),
            (r"\bventure\s*capital\b", 5, "Investor mixer"),
            (r"\bventure\b", 3, "Investor mixer"),
            (r"\bvc[s]?\b", 4, "Investor mixer"),
            (r"\blimited\s*partner[s]?\b", 4, "Investor mixer"),
            (r"\bgeneral\s*partner[s]?\b", 4, "Investor mixer"),
            (r"\blp[s]?\b", 3, "Investor mixer"),
            (r"\bgp[s]?\b", 3, "Investor mixer"),
            (r"\bdeal\s*flow\b", 4, "Investor mixer"),
            (r"\bsyndicate\b", 3, "Investor mixer"),
            (r"\bcheck\s*writer[s]?\b", 4, "Investor mixer"),
            (r"\bportfolio\b", 2, "Investor mixer"),
            (r"\bmatch\s*making\b", 2, "Investor mixer"),
            (r"\bfounders?\s*(and|&|x)\s*funders?\b", 6, "Investor mixer"),
            (r"\bmeet\s*(the\s*)?investor", 6, "Investor mixer"),
            (r"\bfundrais", 5, "Fundraising"),
            (r"\braising\s*(a|your|the)?\s*round\b", 5, "Fundraising"),
            (r"\bpre[\-\s]?seed\b", 4, "Fundraising"),
            (r"\bseed\s*round\b", 4, "Fundraising"),
            (r"\bseries\s*[a-c]\b", 3, "Fundraising"),
            (r"\bterm\s*sheet\b", 4, "Fundraising"),
            (r"\bcap\s*table\b", 3, "Fundraising"),
            (r"\bcapital\b", 2, "Fundraising"),
            (r"\bfunding\b", 3, "Fundraising"),
            (r"\b(venture|seed|growth|angel|rolling)\s*fund\b", 4, "Fundraising"),
            (r"\braise\b", 3, "Fundraising"),
            (r"\bfund\b", 1, "Fundraising"),
            (r"\baccelerator\b", 3, "Founder community"),
            (r"\bincubator\b", 3, "Founder community"),
            (r"\by\s*combinator\b|\byc\b", 3, "Founder community"),
            (r"\boffice\s*hours\b", 2, "Founder community"),
            (r"\bearly[\-\s]?stage\b", 2, "Founder community"),
            (r"\bfounder[s]?\b", 2, "Founder community"),
            (r"\bstartup[s]?\b", 1, "Founder community"),
            (r"\bmixer\b", 1, "Founder community"),
            (r"\bnetworking\b", 1, "Founder community"),
            (r"\bhappy\s*hour\b", 1, "Founder community"),
            (r"\bfireside\b", 1, "Founder community"),
            (r"\bdinner\b", 1, "Founder community"),
        ],
        "x_queries": [
            '("pitch night" OR investor OR "demo day" OR "angel investor" OR fundraising OR founders) '
            '("San Francisco" OR SF OR "Bay Area") (lu.ma OR luma.com OR partiful OR rsvp OR invite) '
            '-is:retweet -is:reply lang:en',
            '(founders OR startup OR "vc" OR "venture") ("San Francisco" OR "SF") '
            '(dinner OR mixer OR "happy hour" OR demo OR "office hours" OR "invite only" OR apply) '
            '(lu.ma OR luma.com OR partiful.com) -is:retweet -is:reply lang:en',
        ],
        "eb_domain": "www.eventbrite.com",
        "eb_locale": "ca--san-francisco",
        "eb_categories": ["venture-capital", "startup-pitch", "investor", "startup", "business--networking"],
        "web_location": "San Francisco",
        "web_interests": "startup investor pitch nights, VC and angel mixers, founder fundraising dinners",
        "web_queries": [
            "San Francisco venture capital summit conference 2026 register -site:eventbrite.com -site:lu.ma",
            "San Francisco startup demo day 2026 tickets -site:eventbrite.com -site:lu.ma",
            "San Francisco founders investors happy hour partiful.com",
            "San Francisco angel investor pitch night 2026 rsvp -site:eventbrite.com -site:lu.ma",
            "San Francisco accelerator founder dinner event 2026 -site:eventbrite.com -site:lu.ma",
        ],
    },
    # -------------------------------------------------------------------------
    "founders-london": {
        "label": "London seed+ founder events (and SF-bound)",
        "luma_page": "https://luma.com/london",
        "luma_place_id": None,
        "city_matches": [
            "london", "city of london", "canary wharf", "westminster",
            "shoreditch", "holborn", "mayfair", "kings cross", "king's cross",
            "southwark", "soho", "old street", "farringdon", "hackney",
        ],
        "bbox": {"lat_min": 51.25, "lat_max": 51.72, "lng_min": -0.55, "lng_max": 0.35},
        "seed_calendars": [
            ("The Loop: London Startup Events", "cal-edASf5SWbLeji10"),
            ("UK Startup Hub",                  "cal-ivbmigJ7M4CxbXx"),
            ("Founders City Link",              "cal-CvIpKRM5YbmuITz"),
            ("VC+Founders Tech Poker",          "cal-tcBV7zXlgqIT8P9"),
            ("UCL VC & PE Club",                "cal-zL2vmhLtfjWuWNu"),
            ("Friday Founder's Gatherings",     "cal-ZeIv5ZeNJkNbxob"),
            ("Founders Dinner",                 "cal-bkO33DlatoB8YHE"),
            ("B2B SaaS Founder Dinners",        "cal-NfzrRkEGocQZqt0"),
            ("Seed & Series A Dinners",         "cal-HbZDFttahVxljbc"),
        ],
        "category_order": ["SF-bound / US expansion", "Seed+ / Series A", "Investor & VC", "Founder community"],
        "min_score": 4,
        "relevance_rules": [
            # --- London events for founders heading to SF / the US ---
            (r"\bsf\s*tech\s*week\b", 8, "SF-bound / US expansion"),
            (r"\bsan\s*francisco\b", 6, "SF-bound / US expansion"),
            (r"\bsilicon\s*valley\b", 5, "SF-bound / US expansion"),
            (r"\bbay\s*area\b", 4, "SF-bound / US expansion"),
            (r"\bus\s*expansion\b|\bexpand(ing)?\s*to\s*the\s*us\b", 6, "SF-bound / US expansion"),
            (r"\brelocat\w*\s*to\s*(the\s*us|sf|america)\b", 6, "SF-bound / US expansion"),
            (r"\bo-?1\s*visa\b|\be-?2\s*visa\b|\bus\s*visa\b", 5, "SF-bound / US expansion"),
            (r"\by\s*combinator\b|\byc\b", 4, "SF-bound / US expansion"),
            (r"\blondon\s*to\s*sf\b|\bsf\s*bound\b", 8, "SF-bound / US expansion"),
            # --- seed and later stage signals ---
            (r"\bseries\s*[a-d]\b", 6, "Seed+ / Series A"),
            (r"\bseed\s*(stage|round|to\s*series)\b", 5, "Seed+ / Series A"),
            (r"\bpost[\-\s]?seed\b", 5, "Seed+ / Series A"),
            (r"\bseed\b", 3, "Seed+ / Series A"),
            (r"\bventure[\-\s]?backed\b", 5, "Seed+ / Series A"),
            (r"\bfunded\s*founders?\b", 6, "Seed+ / Series A"),
            (r"\bscale[\-\s]?up[s]?\b", 4, "Seed+ / Series A"),
            (r"\bgrowth[\-\s]?stage\b", 4, "Seed+ / Series A"),
            (r"\bgtm\b|\bgo[\-\s]?to[\-\s]?market\b", 3, "Seed+ / Series A"),
            (r"\brevenue\b", 2, "Seed+ / Series A"),
            # --- investors in the room ---
            (r"\binvestor[s]?\b", 4, "Investor & VC"),
            (r"\bventure\s*capital\b", 4, "Investor & VC"),
            (r"\bvc[s]?\b", 4, "Investor & VC"),
            (r"\bangel[s]?\b", 3, "Investor & VC"),
            (r"\bdemo\s*day\b", 4, "Investor & VC"),
            (r"\bpitch\b", 2, "Investor & VC"),
            (r"\bfundrais", 4, "Investor & VC"),
            (r"\bfounders?\s*(and|&|x)\s*funders?\b", 6, "Investor & VC"),
            (r"\bterm\s*sheet\b", 4, "Investor & VC"),
            # --- founder community ---
            (r"\bfounder[s]?\b", 2, "Founder community"),
            (r"\bstartup[s]?\b", 1, "Founder community"),
            (r"\bctos?\b|\bcpos?\b|\bceos?\b", 1, "Founder community"),
            (r"\bdinner\b", 1, "Founder community"),
            (r"\bmixer\b", 1, "Founder community"),
            (r"\bnetworking\b", 1, "Founder community"),
            (r"\bbreakfast\b", 1, "Founder community"),
            (r"\broundtable\b", 1, "Founder community"),
            (r"\bfireside\b", 1, "Founder community"),
            # --- push pre-seed / idea-stage / student events DOWN ---
            (r"\bpre[\-\s]?seed\b", -4, "Founder community"),
            (r"\bidea\s*stage\b|\bidea\s*to\b", -4, "Founder community"),
            (r"\baspiring\s*(founder|entrepreneur)", -5, "Founder community"),
            (r"\bwantrepreneur", -5, "Founder community"),
            (r"\bstudent[s]?\b", -3, "Founder community"),
            (r"\bhow\s*to\s*start\s*a\s*startup\b", -4, "Founder community"),
            (r"\bhackathon\b", -2, "Founder community"),
            (r"\bno\s*idea\s*(yet|needed)\b", -4, "Founder community"),
        ],
        "x_queries": [
            '(founders OR startup OR seed OR "series a" OR investors OR VC) London '
            '(lu.ma OR luma.com OR eventbrite OR rsvp OR "invite only" OR apply) '
            '-is:retweet -is:reply lang:en',
            '("SF Tech Week" OR "San Francisco" OR "Y Combinator" OR "Silicon Valley" OR "US expansion") '
            'London (event OR dinner OR meetup OR mixer OR breakfast OR lu.ma) '
            '-is:retweet -is:reply lang:en',
        ],
        "eb_domain": "www.eventbrite.co.uk",
        "eb_locale": "united-kingdom--london",
        "eb_categories": ["startup", "venture-capital", "founders", "seed-funding", "business--networking"],
        "web_location": "London",
        "web_interests": "seed and Series A founder events, VC mixers, founder dinners, SF Tech Week and US expansion events in London",
        "web_queries": [
            "London founders \"series A\" OR seed event July August 2026 register -site:eventbrite.com",
            "London \"SF Tech Week\" OR \"San Francisco\" founders event 2026 lu.ma",
            "site:linkedin.com/posts London founders event lu.ma July 2026",
            "site:linkedin.com/posts London seed \"series A\" founders dinner 2026",
            "London VC founder dinner invite lu.ma August 2026",
            "London \"US expansion\" OR \"Y Combinator\" founders event 2026 rsvp",
        ],
    },
    # -------------------------------------------------------------------------
    "governance-london": {
        "label": "London corporate governance events",
        "luma_page": "https://luma.com/london",
        "luma_place_id": None,
        "city_matches": [
            "london", "city of london", "canary wharf", "westminster",
            "shoreditch", "holborn", "mayfair", "kings cross", "southwark",
        ],
        "bbox": {"lat_min": 51.25, "lat_max": 51.72, "lng_min": -0.55, "lng_max": 0.35},
        "seed_calendars": [],  # no obvious governance aggregator calendars on Luma
        "category_order": ["Board & directors", "Governance & compliance", "ESG & sustainability", "Audit & risk"],
        "min_score": 4,
        "relevance_rules": [
            (r"\bcorporate governance\b", 6, "Governance & compliance"),
            (r"\bgovernance\b", 4, "Governance & compliance"),
            (r"\bboard of directors\b", 5, "Board & directors"),
            (r"\bboardroom\b", 4, "Board & directors"),
            (r"\bnon[\-\s]?executive director", 5, "Board & directors"),
            (r"\bned[s]?\b", 2, "Board & directors"),
            (r"\bdirectors?\b", 2, "Board & directors"),
            (r"\bdirectors?\s*duties\b", 4, "Board & directors"),
            (r"\bcompany secretar", 4, "Governance & compliance"),
            (r"\bcorporate secretary\b", 4, "Governance & compliance"),
            (r"\bfiduciary\b", 4, "Board & directors"),
            (r"\bcompliance\b", 4, "Governance & compliance"),
            (r"\bregulator(y|s)?\b|\bregulation\b", 3, "Governance & compliance"),
            (r"\bcompany law\b", 3, "Governance & compliance"),
            (r"\blisting rules\b", 3, "Governance & compliance"),
            (r"\besg\b", 5, "ESG & sustainability"),
            (r"\bsustainability\b", 3, "ESG & sustainability"),
            (r"\bstewardship\b", 4, "ESG & sustainability"),
            (r"\baudit\s*committee\b", 5, "Audit & risk"),
            (r"\baudit\b", 2, "Audit & risk"),
            (r"\brisk\s*(management|committee|governance)\b", 3, "Audit & risk"),
            (r"\bshareholder", 4, "Governance & compliance"),
            (r"\bproxy\s*(voting|season|advisor|statement)", 4, "Governance & compliance"),
            (r"\bagm\b|\bannual general meeting\b", 4, "Governance & compliance"),
            (r"\bremuneration\b", 3, "Board & directors"),
            (r"\bdisclosure\b", 2, "Governance & compliance"),
            (r"\bethics\b", 2, "Governance & compliance"),
            (r"\broundtable\b", 2, "Governance & compliance"),
            (r"\bsummit\b", 1, "Governance & compliance"),
            (r"\bforum\b", 1, "Governance & compliance"),
            (r"\bconference\b", 1, "Governance & compliance"),
        ],
        "x_queries": [
            '("corporate governance" OR "board of directors" OR ESG OR compliance OR '
            '"non-executive director" OR boardroom OR stewardship) (London OR UK) '
            '(event OR summit OR conference OR forum OR webinar OR breakfast OR roundtable) '
            '-is:retweet -is:reply lang:en',
            '(governance OR "audit committee" OR "company secretary" OR shareholder) London '
            '(register OR rsvp OR tickets OR lu.ma OR eventbrite) -is:retweet -is:reply lang:en',
        ],
        "eb_domain": "www.eventbrite.co.uk",
        "eb_locale": "united-kingdom--london",
        "eb_categories": ["corporate-governance", "compliance", "esg", "governance", "board-of-directors", "risk-management"],
        "web_location": "London",
        "web_interests": "corporate governance, board of directors, ESG, compliance, audit, shareholder, stewardship",
        "web_queries": [
            "London corporate governance conference 2026 register -site:eventbrite.com -site:lu.ma",
            "London ESG board directors summit 2026 tickets -site:eventbrite.com -site:lu.ma",
            "London compliance regulatory forum event 2026 -site:eventbrite.com -site:lu.ma",
            "London corporate governance institute event 2026",
            "London non-executive director event 2026 rsvp -site:eventbrite.com -site:lu.ma",
        ],
    },
}

# === Activate a profile ======================================================
ACTIVE_PROFILE = os.environ.get("EVENTS_PROFILE", "investors-sf")
if ACTIVE_PROFILE not in PROFILES:
    ACTIVE_PROFILE = "investors-sf"
_p = PROFILES[ACTIVE_PROFILE]

PROFILE_LABEL   = _p["label"]
LUMA_SF_PAGE    = _p["luma_page"]
LUMA_SF_PLACE_ID = _p["luma_place_id"]
SF_CITY_MATCHES = _p["city_matches"]
SF_BBOX         = _p["bbox"]
SEED_CALENDARS  = _p["seed_calendars"]
RELEVANCE_RULES = _p["relevance_rules"]
NEGATIVE_RULES  = NEGATIVE_RULES_COMMON
CATEGORY_ORDER  = _p["category_order"]
MIN_SCORE       = _p["min_score"]
X_QUERIES       = _p["x_queries"]
EB_DOMAIN       = _p["eb_domain"]
EB_LOCALE       = _p["eb_locale"]
EB_CATEGORIES   = _p["eb_categories"]
WEB_LOCATION    = _p["web_location"]
WEB_INTERESTS   = _p["web_interests"]
WEB_QUERIES     = _p["web_queries"]
