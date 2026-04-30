const STORAGE = 'flightFinderState';

const SITES = [
  {
    name: 'Google Flights',
    note: 'best inventory, price calendar',
    url: ({ from, to, depart, ret }) =>
      `https://www.google.com/travel/flights?q=Flights+to+${to}+from+${from}+on+${depart}+returning+${ret}`,
  },
  {
    name: 'Kiwi.com',
    note: 'virtual interlining (mix airlines)',
    url: ({ fromName, toName, depart, ret }) =>
      `https://www.kiwi.com/en/search/results/${fromName}/${toName}/${depart}/${ret}`,
  },
  {
    name: 'Skyscanner',
    note: 'budget carriers, whole-month search',
    url: ({ fromIATA, toIATA, depart, ret }) => {
      const yymmdd = (iso) => iso.slice(2).replace(/-/g, '');
      return `https://www.skyscanner.com/transport/flights/${fromIATA.toLowerCase()}/${toIATA.toLowerCase()}/${yymmdd(depart)}/${yymmdd(ret)}/`;
    },
  },
  {
    name: 'Momondo',
    note: 'metasearch outliers',
    url: ({ fromIATA, toIATA, depart, ret }) =>
      `https://www.momondo.com/flight-search/${fromIATA}-${toIATA}/${depart}/${ret}`,
  },
];

const ORIGINS = {
  ARN: { iata: 'ARN', name: 'stockholm-sweden', label: 'Stockholm (ARN)' },
  CPH: { iata: 'CPH', name: 'copenhagen-denmark', label: 'Copenhagen (CPH)' },
};

const DESTINATION = { iata: 'TYO', name: 'tokyo-japan', label: 'Tokyo' };

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE)) || {};
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE, JSON.stringify(state));
}

function buildLinks(origin, params) {
  return SITES.map((site) => ({
    site: site.name,
    note: site.note,
    href: site.url({
      from: origin.name.split('-')[0],
      to: DESTINATION.name.split('-')[0],
      fromName: origin.name,
      toName: DESTINATION.name,
      fromIATA: origin.iata,
      toIATA: DESTINATION.iata,
      depart: params.depart,
      ret: params.ret,
    }),
  }));
}

function renderForm(root) {
  const state = loadState();
  const today = new Date().toISOString().slice(0, 10);
  const inAWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  root.innerHTML = `
    <form id="searchForm">
      <p><label>Depart: <input type="date" id="depart" min="${today}" value="${state.depart || today}" required></label></p>
      <p><label>Return: <input type="date" id="return" min="${today}" value="${state.ret || inAWeek}" required></label></p>
      <p><label><input type="checkbox" id="cph" ${state.cph ? 'checked' : ''}> Also try Copenhagen (CPH) &mdash; often 1000&ndash;2000 SEK cheaper</label></p>
      <p><button type="submit">Find flights</button></p>
    </form>
    <div id="results"></div>
  `;
  root.querySelector('#searchForm').addEventListener('submit', onSearch);
}

function onSearch(e) {
  e.preventDefault();
  const f = e.target;
  const depart = f.querySelector('#depart').value;
  const ret = f.querySelector('#return').value;
  const cph = f.querySelector('#cph').checked;

  if (new Date(ret) < new Date(depart)) {
    document.getElementById('results').innerHTML =
      `<p class="error">Return date must be on or after depart.</p>`;
    return;
  }

  saveState({ depart, ret, cph });

  const origins = cph ? [ORIGINS.ARN, ORIGINS.CPH] : [ORIGINS.ARN];
  const sections = origins.map((origin) => {
    const links = buildLinks(origin, { depart, ret });
    const rows = links
      .map(
        (l) => `
      <tr>
        <td><a href="${l.href}" target="_blank" rel="noopener">${l.site}</a></td>
        <td>${l.note}</td>
      </tr>
    `,
      )
      .join('');
    return `
      <h2>${origin.label} &rarr; ${DESTINATION.label}</h2>
      <table>
        <thead><tr><th>Site</th><th>Why</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  });

  document.getElementById('results').innerHTML =
    sections.join('') +
    `<p class="hint">Click each link to compare. The cheapest is rarely the same site twice in a row.</p>`;
}

window.addEventListener('DOMContentLoaded', () => {
  renderForm(document.getElementById('app'));
});
