const KIWI_BASE = 'http://127.0.0.1:8788/search';
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

window.clearKey = clearKey;

function kiwiDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function shiftDate(iso, days) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function buildQuery(params) {
  const flexDays = params.flex ? 3 : 0;
  const q = new URLSearchParams({
    fly_from: 'ARN',
    fly_to: 'TYO',
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

function renderKeyForm(root) {
  root.innerHTML = `
    <p>Paste your Kiwi Tequila API key. Get one free at
       <a href="https://tequila.kiwi.com" target="_blank">tequila.kiwi.com</a>.</p>
    <form id="keyForm">
      <input type="password" id="keyInput" placeholder="apikey..." size="48" required>
      <button type="submit">Save</button>
    </form>
  `;
  root.querySelector('#keyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    setKey(root.querySelector('#keyInput').value.trim());
    render();
  });
}

function renderSearchForm(root) {
  const today = new Date().toISOString().slice(0, 10);
  root.innerHTML = `
    <form id="searchForm">
      <p><label>Depart: <input type="date" id="depart" min="${today}" required></label></p>
      <p><label>Return: <input type="date" id="return" min="${today}" required></label></p>
      <p><label><input type="checkbox" id="flex" checked> Flexible &plusmn;3 days</label></p>
      <p><label><input type="checkbox" id="stopovers" checked> Allow EU-hub stopovers</label></p>
      <p><button type="submit">Search</button></p>
    </form>
    <div id="status" class="status"></div>
    <div id="results"></div>
  `;
  root.querySelector('#searchForm').addEventListener('submit', onSearch);
}

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
  status.textContent = 'Searching...';
  results.innerHTML = '';
  try {
    const routes = await searchKiwi(params);
    status.textContent = `Found ${routes.length} routes.`;
    renderResults(routes);
  } catch (err) {
    status.innerHTML = `<span class="error">${err.message}</span>`;
  }
}

function renderResults(routes) {
  const el = document.getElementById('results');
  if (!routes.length) {
    el.innerHTML = `<p>No routes found. Try a wider date range.</p>`;
    return;
  }
  const rows = routes.map(r => {
    const airlines = [...new Set(r.airlines)].join(', ');
    const hops = r.route ? r.route.length : '?';
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

function render() {
  const root = document.getElementById('app');
  if (!getKey()) renderKeyForm(root);
  else renderSearchForm(root);
}

window.addEventListener('DOMContentLoaded', render);
