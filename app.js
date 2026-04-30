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
  HEL: { iata: 'HEL', name: 'helsinki-finland', label: 'Helsinki (HEL)' },
  OSL: { iata: 'OSL', name: 'oslo-norway', label: 'Oslo (OSL)' },
};

const DESTINATION = { iata: 'TYO', name: 'tokyo-japan', label: 'Tokyo (any airport)' };

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

      <div class="callout">
        <strong>Also search Copenhagen.</strong> CPH&ndash;TYO is regularly
        1000&ndash;2500 SEK cheaper than ARN&ndash;TYO because more
        carriers compete (SAS, Finnair, Qatar, ANA via partners).
        The X2000 train Stockholm&ndash;Copenhagen is 4h 30m,
        ~400&ndash;600 SEK if you book ahead.
        <br><br>
        <label><input type="checkbox" id="cph" ${state.cph ? 'checked' : ''}> Include Copenhagen (CPH)</label>
      </div>

      <p><label><input type="checkbox" id="hel" ${state.hel ? 'checked' : ''}> Also try Helsinki (HEL) &mdash; Finnair flies <em>direct</em> to Tokyo, often the cheapest one-stop from Europe</label></p>
      <p><label><input type="checkbox" id="osl" ${state.osl ? 'checked' : ''}> Also try Oslo (OSL) &mdash; less common but occasionally beats Stockholm</label></p>

      <p><button type="submit">Find flights</button></p>
    </form>
    <div id="results"></div>
    ${renderTips()}
  `;
  root.querySelector('#searchForm').addEventListener('submit', onSearch);
}

function renderTips() {
  return `
    <h2>How to actually find the cheap one</h2>
    <p>This page just opens 4 searches at once. The strategy below is
    how you turn those tabs into a good price.</p>

    <h3>Where to fly from</h3>
    <ul>
      <li><strong>Copenhagen wins more than Stockholm does.</strong> Tick the box above.</li>
      <li><strong>Helsinki is the dark horse.</strong> Finnair has the only direct ARN-area flight to Tokyo. When their fares dip, nobody competes.</li>
      <li><strong>The train + flight combo.</strong> ARN&rarr;CPH&rarr;TYO via X2000 + flight is often 1500 SEK cheaper than ARN&rarr;TYO direct, even after the train ticket. Worth it for any saving above ~600 SEK.</li>
      <li><strong>Skip Bromma (BMA).</strong> Domestic only, no intl connection benefit.</li>
    </ul>

    <h3>When to fly</h3>
    <ul>
      <li><strong>Avoid:</strong> Cherry blossom season (late Mar&ndash;early Apr), Golden Week (29 Apr&ndash;5 May), New Year (29 Dec&ndash;5 Jan), Obon (mid-Aug). Prices spike 50&ndash;100%.</li>
      <li><strong>Sweet spots:</strong> Mid-Sep to mid-Nov (autumn, mild weather, fewer tourists), late Jan to mid-Mar (cold but cheapest of the year).</li>
      <li><strong>Day of week:</strong> Depart Tue/Wed/Sat, return Tue/Wed. Avoid Fri/Sun departures and Sun returns.</li>
      <li><strong>How far ahead:</strong> Asia long-haul sweet spot is 8&ndash;14 weeks. Less than 6 weeks gets expensive fast; more than 5 months and prices haven't dropped yet.</li>
    </ul>

    <h3>Routing tricks</h3>
    <ul>
      <li><strong>Free stopovers as a feature.</strong> Finnair lets you stop in Helsinki up to 5 days for free. Turkish gives you Istanbul + a free hotel for 24h+ layovers. Qatar offers Doha stopover. Two trips for the price of one.</li>
      <li><strong>Open-jaw saves nothing but adds a lot.</strong> Fly into Tokyo (HND or NRT), out of Osaka (KIX) or Fukuoka (FUK). Same price, no Tokyo&rarr;Osaka backtrack.</li>
      <li><strong>HND vs NRT.</strong> Haneda is ~30 min from Shibuya by monorail (~500 yen). Narita is 90 min + 3000 yen. Sometimes NRT fares are 500 SEK cheaper, but the airport transfer eats half of that.</li>
      <li><strong>Virtual interlining.</strong> Kiwi.com (the website) will combine two airlines that don't officially partner, e.g. Norwegian to London + JAL to Tokyo. Cheapest deals on the longest itineraries usually live there. <em>Risk:</em> if leg 1 is delayed, leg 2 is on you. Buy travel insurance with missed-connection coverage.</li>
    </ul>

    <h3>Sites and tools</h3>
    <ul>
      <li><strong>Google Flights "Date grid"</strong> &mdash; shows price for ±3 days around your dates in one view. Click "Date grid" or "Price graph" once a search loads.</li>
      <li><strong>Skyscanner "Whole month" + "Everywhere"</strong> &mdash; the only way to answer "what's the cheapest week in October" without 30 manual searches.</li>
      <li><strong>Mistake-fare alerts:</strong> <a href="https://www.secretflying.com/" target="_blank">Secret Flying</a>, <a href="https://www.jacksflightclub.com/" target="_blank">Jack's Flight Club</a>, <a href="https://thriftytraveler.com/" target="_blank">Thrifty Traveler</a>. Free tiers all post Europe&rarr;Asia mistakes when they happen.</li>
      <li><strong>Track prices:</strong> Google Flights "Track prices" toggle on a saved search. Emails you when fare moves &gt;10%.</li>
    </ul>

    <h3>Rules of thumb (ARN/CPH &rarr; Tokyo, economy)</h3>
    <ul>
      <li><strong>Under 4500 SEK</strong> &mdash; book immediately, don't think.</li>
      <li><strong>4500&ndash;5500 SEK</strong> &mdash; fair shoulder-season price, book.</li>
      <li><strong>5500&ndash;6500 SEK</strong> &mdash; OK in peak season, otherwise wait.</li>
      <li><strong>Over 6500 SEK</strong> &mdash; wrong dates or wrong week. Move things by 2&ndash;3 days and re-search.</li>
    </ul>

    <h3>Don't</h3>
    <ul>
      <li><strong>Don't book on the airline's site if a metasearch is cheaper.</strong> But <em>do</em> check the airline's site before booking on Kiwi/Trip.com &mdash; if it's the same price, the airline gives you better refund/change rights.</li>
      <li><strong>Don't pay for seat selection on long-haul</strong> unless you're tall. Random assignment 24h before is usually fine.</li>
      <li><strong>Don't trust hidden-city tickets</strong> (skiplagged etc.) for a return trip. Carriers cancel your return leg if you no-show segment 1.</li>
    </ul>
  `;
}

function onSearch(e) {
  e.preventDefault();
  const f = e.target;
  const depart = f.querySelector('#depart').value;
  const ret = f.querySelector('#return').value;
  const cph = f.querySelector('#cph').checked;
  const hel = f.querySelector('#hel').checked;
  const osl = f.querySelector('#osl').checked;

  if (new Date(ret) < new Date(depart)) {
    document.getElementById('results').innerHTML =
      `<p class="error">Return date must be on or after depart.</p>`;
    return;
  }

  saveState({ depart, ret, cph, hel, osl });

  const origins = [ORIGINS.ARN];
  if (cph) origins.push(ORIGINS.CPH);
  if (hel) origins.push(ORIGINS.HEL);
  if (osl) origins.push(ORIGINS.OSL);

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
