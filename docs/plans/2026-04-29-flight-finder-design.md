# Flight Finder — Design

Date: 2026-04-29
Status: approved

## Goal

A small static website for finding cheap flights from Stockholm (ARN) to Tokyo, including multi-leg routes that go through another European hub when that beats a direct ticket.

Reusable: any future trip can change the destination by editing one constant. Not a watcher (no cron, no notifications) — pull-based, run when curious.

## Non-goals

- No watcher / price-drop alerts
- No multi-user accounts
- No build step, no framework, no bundler
- No backend if avoidable (CORS willing)
- No wiki integration, no Airtable writes

## Architecture

```
flight-finder/
├── index.html        — form + results table
├── style.css         — 90s-web style (Times/Courier, plain table, light bg)
├── app.js            — fetch Kiwi Tequila, render results
├── proxy.py          — only created if Kiwi blocks browser CORS (fallback)
└── docs/plans/       — this design doc lives here
```

Served via the existing localhost setup at:
`http://localhost/org/jonasjohansson/flight-finder/`

## Data source

**Kiwi Tequila API** (https://tequila.kiwi.com)

- Endpoint 1: `/v2/search` — point-to-point with optional `max_stopovers`, returns ranked list of routes (Kiwi already includes virtual interlining = the "fly via another country" trick automatically)
- Endpoint 2: `/v2/search` with `fly_from=ARN,GOT,CPH` — multiple origins to compare departure cities
- Auth: header `apikey: <key>`
- Free tier covers personal use

API key handling:
- First page load: if `localStorage.kiwiKey` is empty, show a one-field form ("paste your Tequila API key") that saves to localStorage
- Never written to source files, never committed
- A "reset key" link in the footer for swapping keys

## Page

Single page, three sections stacked vertically:

1. **Search form**
   - Depart date (`<input type="date">`)
   - Return date (`<input type="date">`)
   - Checkbox: "Flexible ±3 days" (expands search window when checked)
   - Checkbox: "Allow EU-hub stopovers" (sets `max_stopovers=2`, default on)
   - Submit button

2. **Status line**
   - "Searching…" / "Found N routes" / error message

3. **Results table**
   - Columns: Price (SEK), Airlines, Total time, Hops, Depart, Return, Book
   - Sorted cheapest-first, top 10
   - "Book" links to Kiwi's `deep_link` for that route

## Data flow

```
User submits form
   → app.js builds query: fly_from=ARN, fly_to=TYO, dates, max_stopovers
   → fetch('https://api.tequila.kiwi.com/v2/search', { headers: { apikey } })
   → JSON response.data sorted by price
   → render top 10 rows into <table>
```

If Kiwi rejects the browser preflight (CORS), `app.js` falls back to `http://localhost:8788/search?...` and we run `proxy.py` (a 30-line Flask script that holds the key and forwards). Decision deferred until first test from the browser.

## Styling

Light 90s look:
- `font-family: Times, serif` for body, `Courier, monospace` for the table
- Plain `<table>` with 1px borders, no rounded corners
- `body { background: #fff; max-width: 720px; margin: 2em auto; }`
- No icons, no animations, no gradients

## Error handling

- Missing API key → show paste-your-key form
- Kiwi 401 (bad key) → "Key rejected. [Reset key]"
- Kiwi 422 (bad params) → show Kiwi's error message verbatim
- Network failure → "Couldn't reach Kiwi. Try again."
- Empty results → "No routes found for those dates. Try ±3 days."

## Testing

Manual, browser-based:
1. Empty key → paste form appears
2. Valid key + valid dates → table populates
3. Bad dates (return before depart) → blocked client-side via `min` attribute
4. Bad key → 401 surfaces correctly
5. CORS test on first run determines whether proxy.py is needed

No automated tests for v1 — small enough surface that manual verification is faster than setup overhead.

## Future (explicitly deferred)

- Save searches and re-run later
- Price history (would need a backend + storage)
- Watcher / Gmail alerts when prices drop
- Other destinations beyond Tokyo (would need a destination picker)
- Cross-check against Amadeus for sanity

## Open question

**CORS** — unverified at design time. First implementation step is a 5-minute check from the browser. If blocked, add `proxy.py` to scope.
