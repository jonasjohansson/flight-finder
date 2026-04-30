# Flight Finder

Tiny static site that searches Kiwi Tequila for cheap flights from
Stockholm (ARN) to Tokyo (any TYO airport), including multi-leg routes
via European hubs.

## Run

The site is served from the existing localhost setup at:
http://localhost/org/jonasjohansson/flight-finder/

It needs the proxy running alongside (Kiwi blocks browser CORS):

```bash
cd ~/Documents/GitHub/org/jonasjohansson/flight-finder
python3 proxy.py
```

The proxy listens on `http://127.0.0.1:8788`. Leave it running while
you use the site. Ctrl-C to stop.

## API key

Get a free key at https://tequila.kiwi.com and paste it on first load.
Stored in browser localStorage only — never in source.
Use the "Reset API key" link in the footer to swap keys.

## Files

- `index.html` — markup
- `style.css` — 90s-web style
- `app.js` — Kiwi calls + rendering
- `proxy.py` — stdlib-only CORS proxy (no pip deps)
- `docs/plans/` — design + implementation plan
