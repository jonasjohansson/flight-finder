# Flight Finder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a small static website that searches Kiwi Tequila for cheap Stockholm→Tokyo flights, including multi-leg routes via European hubs.

**Architecture:** Vanilla HTML/CSS/JS, no build step, no framework. Browser calls Kiwi Tequila directly via `fetch()`. API key lives in `localStorage`. If CORS blocks the browser call, fall back to a tiny Flask proxy.

**Tech Stack:** HTML, CSS, ES6 JS, Kiwi Tequila API, localhost-served. Optional: Python 3 + Flask for proxy.

**Repo:** `/Users/jonas/Documents/GitHub/org/jonasjohansson/flight-finder/`

**Preview URL:** `http://localhost/org/jonasjohansson/flight-finder/`

**Verification approach:** Manual browser testing. The site is small enough that automated tests would cost more setup than they save (per design doc). Each task ends with a specific browser-verification step.

**Reference:** [`docs/plans/2026-04-29-flight-finder-design.md`](2026-04-29-flight-finder-design.md)

---

## Task 1: Scaffold the three files and verify they load

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `app.js`

**Step 1: Create `index.html` with minimal structure**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Flight Finder</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Flight Finder</h1>
  <p>Stockholm → Tokyo</p>
  <main id="app">Loading…</main>
  <script src="app.js"></script>
</body>
</html>
```

**Step 2: Create `style.css` with 90s-web base**

```css
body {
  font-family: Times, "Times New Roman", serif;
  max-width: 720px;
  margin: 2em auto;
  padding: 0 1em;
  background: #fff;
  color: #000;
}
h1 { font-size: 1.6em; margin-bottom: 0.2em; }
table { font-family: Courier, monospace; border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #000; padding: 4px 8px; text-align: left; }
input, button { font-family: inherit; font-size: 1em; }
button { padding: 4px 12px; }
.error { color: #a00; }
.status { font-style: italic; margin: 1em 0; }
```

**Step 3: Create `app.js` with a hello marker**

```js
document.getElementById('app').textContent = 'Hello from app.js';
```

**Step 4: Verify in browser**

Open `http://localhost/org/jonasjohansson/flight-finder/`.
Expected: page shows "Flight Finder", subtitle "Stockholm → Tokyo", and the body text replaced by "Hello from app.js" in serif font.

**Step 5: Commit**

```bash
git add index.html style.css app.js
git commit -m "feat: scaffold static site with hello marker"
```

---

## Task 2: CORS preflight check (decides whether proxy is needed)

**Files:**
- Modify: `app.js`

**Step 1: Replace `app.js` body with a one-shot Kiwi probe**

```js
const PROBE_URL = 'https://api.tequila.kiwi.com/v2/search?fly_from=ARN&fly_to=NRT&date_from=01/06/2026&date_to=07/06/2026&limit=1';
const status = document.getElementById('app');
status.textContent = 'Probing Kiwi CORS…';

fetch(PROBE_URL, { headers: { apikey: 'invalid-key-for-probe' } })
  .then(r => {
    status.textContent = `CORS OK. Status: ${r.status} (401 expected for bad key — that means the request reached Kiwi).`;
  })
  .catch(err => {
    status.textContent = `CORS BLOCKED: ${err.message}. Will need proxy.`;
  });
```

**Step 2: Verify in browser, with DevTools Network tab open**

Reload `http://localhost/org/jonasjohansson/flight-finder/`.

Two possible outcomes:
- **CORS OK** → page shows "CORS OK. Status: 401…". Network tab shows the request completed. **Proxy is NOT needed.** Continue to Task 3.
- **CORS BLOCKED** → page shows "CORS BLOCKED: …". Network tab shows the request blocked by CORS policy. **Proxy IS needed.** Skip to Task 7 first, then come back.

**Step 3: Record the result in this file**

Append a single line under this task:
```
CORS result on 2026-04-29: OK / BLOCKED
```

**Step 4: Commit**

```bash
git add app.js docs/plans/2026-04-29-flight-finder.md
git commit -m "chore: probe Kiwi CORS, record result"
```

---

## Task 3: API key entry + localStorage persistence

**Files:**
- Modify: `app.js`
- Modify: `index.html` (footer link)

**Step 1: Replace `app.js` with the key-handling shell**

```js
const KEY_STORAGE = 'kiwiKey';

function getKey() {
  return localStorage.getItem(KEY_STORAGE) || '';
}

function setKey(k) {
  localStorage.setItem(KEY_STORAGE, k);
}

function clearKey() {
  localStorage.removeItem(KEY_STORAGE);
  render();
}

function renderKeyForm(root) {
  root.innerHTML = `
    <p>Paste your Kiwi Tequila API key. Get one free at
       <a href="https://tequila.kiwi.com" target="_blank">tequila.kiwi.com</a>.</p>
    <form id="keyForm">
      <input type="password" id="keyInput" placeholder="apikey…" size="48" required>
      <button type="submit">Save</button>
    </form>
  `;
  root.querySelector('#keyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    setKey(root.querySelector('#keyInput').value.trim());
    render();
  });
}

function renderSearch(root) {
  root.innerHTML = `<p>Key saved. Search form coming in Task 4.</p>`;
}

function render() {
  const root = document.getElementById('app');
  if (!getKey()) renderKeyForm(root);
  else renderSearch(root);
}

window.addEventListener('DOMContentLoaded', render);
window.clearKey = clearKey; // exposed for footer link
```

**Step 2: Add footer "reset key" link to `index.html`**

Insert before `</body>`:

```html
<footer><small><a href="#" onclick="clearKey(); return false;">Reset API key</a></small></footer>
```

**Step 3: Verify in browser**

1. Reload page in a fresh tab (or `localStorage.clear()` in console first).
2. Expected: paste form appears.
3. Type any string, click Save.
4. Expected: page swaps to "Key saved. Search form coming in Task 4."
5. Click "Reset API key".
6. Expected: paste form returns.

**Step 4: Commit**

```bash
git add app.js index.html
git commit -m "feat: api key entry and localStorage persistence"
```

---

## Task 4: Search form

**Files:**
- Modify: `app.js`

**Step 1: Replace `renderSearch()` body with the actual form**

```js
function renderSearch(root) {
  const today = new Date().toISOString().slice(0, 10);
  root.innerHTML = `
    <form id="searchForm">
      <p>
        <label>Depart: <input type="date" id="depart" min="${today}" required></label>
      </p>
      <p>
        <label>Return: <input type="date" id="return" min="${today}" required></label>
      </p>
      <p>
        <label><input type="checkbox" id="flex" checked> Flexible ±3 days</label>
      </p>
      <p>
        <label><input type="checkbox" id="stopovers" checked> Allow EU-hub stopovers</label>
      </p>
      <p><button type="submit">Search</button></p>
    </form>
    <div id="status" class="status"></div>
    <div id="results"></div>
  `;
  root.querySelector('#searchForm').addEventListener('submit', onSearch);
}

function onSearch(e) {
  e.preventDefault();
  const f = e.target;
  const params = {
    depart: f.querySelector('#depart').value,
    ret: f.querySelector('#return').value,
    flex: f.querySelector('#flex').checked,
    stopovers: f.querySelector('#stopovers').checked,
  };
  document.getElementById('status').textContent =
    `Would search ${params.depart} → ${params.ret}, flex=${params.flex}, stopovers=${params.stopovers}`;
}
```

**Step 2: Verify in browser**

1. Reload, ensure key is saved.
2. Pick depart=2026-06-15, return=2026-06-29, leave both boxes checked.
3. Click Search.
4. Expected: status shows "Would search 2026-06-15 → 2026-06-29, flex=true, stopovers=true".
5. `min` attribute should prevent picking a past date.

**Step 3: Commit**

```bash
git add app.js
git commit -m "feat: search form skeleton"
```

---

## Task 5: Kiwi search call + results table

**Files:**
- Modify: `app.js`

**Step 1: Add date helpers and the Kiwi call**

Add these near the top of `app.js`:

```js
const KIWI_BASE = 'https://api.tequila.kiwi.com/v2/search';

// Kiwi expects DD/MM/YYYY
function kiwiDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function shiftDate(iso, days) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildQuery(params) {
  const flexDays = params.flex ? 3 : 0;
  const q = new URLSearchParams({
    fly_from: 'ARN',
    fly_to: 'TYO', // metro code: covers HND + NRT
    date_from: kiwiDate(shiftDate(params.depart, -flexDays)),
    date_to: kiwiDate(shiftDate(params.depart, flexDays)),
    return_from: kiwiDate(shiftDate(params.ret, -flexDays)),
    return_to: kiwiDate(shiftDate(params.ret, flexDays)),
    max_stopovers: params.stopovers ? 2 : 0,
    curr: 'SEK',
    sort: 'price',
    limit: 10,
  });
  return `${KIWI_BASE}?${q}`;
}

async function searchKiwi(params) {
  const res = await fetch(buildQuery(params), {
    headers: { apikey: getKey() },
  });
  if (res.status === 401) throw new Error('API key rejected. Reset and try again.');
  if (!res.ok) throw new Error(`Kiwi error: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.data || [];
}
```

**Step 2: Add the renderer**

```js
function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function renderResults(routes) {
  const el = document.getElementById('results');
  if (!routes.length) {
    el.innerHTML = `<p>No routes found. Try ±3 days or different dates.</p>`;
    return;
  }
  const rows = routes.map(r => {
    const airlines = [...new Set(r.airlines)].join(', ');
    const hops = r.route.length;
    return `
      <tr>
        <td>${r.price} SEK</td>
        <td>${airlines}</td>
        <td>${fmtDuration(r.duration.total)}</td>
        <td>${hops}</td>
        <td>${r.local_departure.slice(0, 10)}</td>
        <td><a href="${r.deep_link}" target="_blank">Book</a></td>
      </tr>
    `;
  }).join('');
  el.innerHTML = `
    <table>
      <thead>
        <tr><th>Price</th><th>Airlines</th><th>Total time</th><th>Hops</th><th>Depart</th><th>Book</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
```

**Step 3: Wire `onSearch` to actually call Kiwi**

Replace `onSearch` body:

```js
async function onSearch(e) {
  e.preventDefault();
  const f = e.target;
  const params = {
    depart: f.querySelector('#depart').value,
    ret: f.querySelector('#return').value,
    flex: f.querySelector('#flex').checked,
    stopovers: f.querySelector('#stopovers').checked,
  };
  const status = document.getElementById('status');
  const results = document.getElementById('results');
  status.textContent = 'Searching…';
  results.innerHTML = '';
  try {
    const routes = await searchKiwi(params);
    status.textContent = `Found ${routes.length} routes.`;
    renderResults(routes);
  } catch (err) {
    status.innerHTML = `<span class="error">${err.message}</span>`;
  }
}
```

**Step 4: Verify in browser with a real key**

1. Reload, paste a real Kiwi Tequila API key.
2. Pick depart and return dates ~2 months out.
3. Click Search.
4. Expected: status shows "Searching…" then "Found N routes.". Table populates with up to 10 rows, cheapest first. Book links open Kiwi in a new tab.
5. Click a Book link — should land on a Kiwi booking page for that exact itinerary.

Edge cases to check:
- Bad key (e.g. tweak it in DevTools localStorage) → red error "API key rejected…"
- Return before depart → blocked by `<input min>` and required attributes
- Very narrow date range with no flights → "No routes found…"

**Step 5: Commit**

```bash
git add app.js
git commit -m "feat: kiwi search and results table"
```

---

## Task 6: Polish — README + tiny refinements

**Files:**
- Create: `README.md`

**Step 1: Write a short README**

```markdown
# Flight Finder

Tiny static site that searches Kiwi Tequila for cheap flights from
Stockholm (ARN) to Tokyo (any TYO airport), including multi-leg routes
via European hubs.

## Run

Served from the existing localhost setup:
http://localhost/org/jonasjohansson/flight-finder/

## API key

Get a free key at https://tequila.kiwi.com and paste it on first load.
Stored in browser localStorage only — never in source.
Use the "Reset API key" link in the footer to swap keys.

## Files

- `index.html` — markup
- `style.css` — 90s-web style
- `app.js` — Kiwi calls + rendering
- `proxy.py` — only present if CORS forced a fallback (see Task 7 in plan)
- `docs/plans/` — design + implementation plan
```

**Step 2: Verify**

Open the README on GitHub-flavored markdown preview (or just read it). Make sure links work.

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## Task 7: CORS proxy fallback (CONDITIONAL — only if Task 2 said BLOCKED)

**Files:**
- Create: `proxy.py`
- Create: `requirements.txt`
- Modify: `app.js` (KIWI_BASE constant)

**Step 1: Create `proxy.py`**

```python
import os
import sys
from urllib.parse import urlencode

import requests
from flask import Flask, Response, request
from flask_cors import CORS

KIWI_BASE = "https://api.tequila.kiwi.com/v2/search"

app = Flask(__name__)
CORS(app, origins=["http://localhost"])

@app.get("/search")
def search():
    api_key = request.headers.get("apikey")
    if not api_key:
        return Response("Missing apikey header", status=400)
    url = f"{KIWI_BASE}?{urlencode(request.args)}"
    upstream = requests.get(url, headers={"apikey": api_key}, timeout=20)
    return Response(upstream.content, status=upstream.status_code,
                    content_type=upstream.headers.get("content-type", "application/json"))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8788))
    app.run(host="127.0.0.1", port=port, debug=False)
```

**Step 2: Create `requirements.txt`**

```
flask>=3.0
flask-cors>=4.0
requests>=2.31
```

**Step 3: Install + run the proxy**

```bash
cd /Users/jonas/Documents/GitHub/org/jonasjohansson/flight-finder
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python proxy.py
```

Expected: server listens on `http://127.0.0.1:8788`. Leave running.

**Step 4: Point `app.js` at the proxy**

Change the constant:

```js
const KIWI_BASE = 'http://127.0.0.1:8788/search';
```

**Step 5: Verify in browser**

1. With proxy running, reload the page.
2. Run a search.
3. Expected: same behavior as Task 5, but now the request goes to localhost:8788 (visible in Network tab).

**Step 6: Add a launch note to README**

Append to `README.md`:

```markdown
## Proxy (only if CORS forced)

If the browser blocked direct Kiwi calls, run the proxy:

```bash
source .venv/bin/activate
python proxy.py
```

The site won't work until the proxy is up.
```

**Step 7: Commit**

```bash
git add proxy.py requirements.txt app.js README.md
git commit -m "feat: add CORS proxy fallback"
```

Add `.venv/` and `__pycache__/` to `.gitignore`:

```bash
printf ".venv/\n__pycache__/\n" > .gitignore
git add .gitignore
git commit -m "chore: gitignore venv"
```

---

## Done criteria

- Page loads at `http://localhost/org/jonasjohansson/flight-finder/`
- Pasting a valid key, picking dates, and clicking Search produces a table of 10 cheapest routes
- "Book" links open Kiwi's deep_link in a new tab
- Bad key shows a clear red error
- Reset-key link in footer works
- README explains how to run + reset the key
