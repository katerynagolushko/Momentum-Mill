# SF Investor Events Agent

Finds San Francisco events where you can be in a room with investors, VCs, and
angels. It pulls from **X**, **Luma** (the SF feed plus the big SF tech/VC
calendars: SF Tech Week, Deep Tech Week, AI Events SF, Bay Area Founders Club),
and **Eventbrite** (its SF investor categories), ranks everything by how
investor-relevant it is, and **pins invite-only / unlisted events to the top**.
Results come out as a plain list, a clean web page, and a spreadsheet.

All of this is **keyless and free**. No paid API, no signup.

## Run it

From the project folder, in Terminal:

```bash
python3 events-agent/scrape.py            # X + Luma  (recommended)
python3 events-agent/scrape.py --open     # ...and open the report when done
python3 events-agent/scrape.py --no-x     # Luma only, completely free
```

That's it. When it finishes it prints a ranked list and writes three files into
`events-agent/out/`:

- **events.html** -> the report to actually look at (open it in Chrome)
- **events.csv** -> the same data as a spreadsheet
- **events.json** -> the raw data, if you ever want to feed it somewhere else

To open the report later without re-running, paste this into Chrome's address bar:

```
file:///Users/katerynagolushko/momentum-mill/events-agent/out/events.html
```

## What the report shows

- A pinned **"Private & invite-only"** section at the very top. An event lands
  here when it's truly unlisted, the title/tweet says invite-only / private /
  apply, or it was found on X but is not on Luma's public feed.
- Then everything else grouped by day, most investor-relevant first.
- Each card shows where it was found (an **X @handle** chip links straight to the
  tweet), whether it needs approval, and how many spots are left.
- Filter buttons at the top (All, Private/invite-only, Pitch/Demo, etc.).

## About the X part (cost)

X search runs on **your own X developer credentials** (already saved in the
x-twitter skill). Each run makes a couple of paid API calls, usually pennies. Use
`--no-x` to skip it and run free on Luma only. If your X plan doesn't include
search, the tool just says so and falls back to Luma.

## Optional: search the whole open web too (`--web`)

This adds breadth like your friend's crawler, with no AI bill. By default it uses
**DuckDuckGo, no key needed** — but DuckDuckGo rate-limits, so it's flaky and
best-effort:

```bash
python3 events-agent/scrape.py --web
```

For reliable open-web search, use a **free Serper key** (2,500 searches/month, no
credit card, serper.dev). Brave's free tier ended in Feb 2026, so it's no longer
the option.

```bash
SERPER_API_KEY=your_key python3 events-agent/scrape.py --web
```

## Tuning

Everything adjustable lives in **`config.py`**, with comments:

- `SF_CITY_MATCHES` -> which cities count (SF only, or wider Bay Area)
- `RELEVANCE_RULES` / `NEGATIVE_RULES` -> the keywords that decide investor-relevance
- `MIN_SCORE` -> how strict to be (lower = wider net; or run with `--all`)
- `X_QUERIES` -> what to search X for
- The `EXCL_*` weights -> how strongly private / invite-only events are prioritized

## Files

| File | What it does |
| --- | --- |
| `scrape.py` | Main command: runs the sources, ranks, writes the report |
| `x_source.py` | Searches X via the x-twitter skill |
| `luma.py` | Luma SF feed + big SF calendars + event resolver + approval detection |
| `eventbrite.py` | Pulls SF investor categories from Eventbrite (keyless) |
| `web_discovery.py` | Optional open-web search (keyless DuckDuckGo, or a Serper key) |
| `relevance.py` | Investor-relevance scoring + exclusivity ranking |
| `render.py` | Writes the list / HTML / CSV / JSON outputs |
| `config.py` | All the knobs |
