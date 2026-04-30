# Flight Finder

A small static page that searches Stockholm (and optionally Copenhagen)
to Tokyo across four flight sites at once. No API, no proxy, no key.

The "ultimate" angle isn't smarter routing — it's that the cheapest
deal lives in different places on different days. This launcher saves
you from filling the same form four times.

## Sites it searches

- **Google Flights** — best inventory and price calendar
- **Kiwi.com** — virtual interlining (combines airlines that don't normally partner)
- **Skyscanner** — budget carriers and whole-month flexibility
- **Momondo** — metasearch outliers others miss

## Run

http://localhost/org/jonasjohansson/flight-finder/

Pick depart + return dates, optionally check "Also try Copenhagen",
click Find flights. A table of links per origin appears — click each
to see results on that site.

Last-used dates are remembered in browser localStorage.

## Files

- `index.html` — markup
- `style.css` — 90s-web style
- `app.js` — URL builders + form
- `docs/plans/` — design + plan history (note: the original Kiwi-API
  plan was abandoned because Tequila moved to affiliate-only signup)
