const STORAGE = 'flightFinderState';

const SITES = [
  {
    name: 'Google Flights',
    note: 'best inventory, price calendar',
    url: ({ fromIATA, toIATA, depart, ret }) =>
      `https://www.google.com/travel/flights?q=Flights+from+${fromIATA}+to+${toIATA}+on+${depart}+returning+${ret}`,
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
  LON: { iata: 'LON', name: 'london-united-kingdom', label: 'London (any airport)' },
};

const DESTINATIONS = {
  // Asia — Japan / Korea
  TYO: { iata: 'TYO', name: 'tokyo-japan', label: 'Tokyo, Japan' },
  KIX: { iata: 'KIX', name: 'osaka-japan', label: 'Osaka, Japan' },
  FUK: { iata: 'FUK', name: 'fukuoka-japan', label: 'Fukuoka, Japan' },
  OKA: { iata: 'OKA', name: 'okinawa-japan', label: 'Okinawa, Japan' },
  CTS: { iata: 'CTS', name: 'sapporo-japan', label: 'Sapporo, Japan' },
  ICN: { iata: 'ICN', name: 'seoul-south-korea', label: 'Seoul, South Korea' },
  PUS: { iata: 'PUS', name: 'busan-south-korea', label: 'Busan, South Korea' },
  // Greater China
  HKG: { iata: 'HKG', name: 'hong-kong-hong-kong', label: 'Hong Kong' },
  TPE: { iata: 'TPE', name: 'taipei-taiwan', label: 'Taipei, Taiwan' },
  PEK: { iata: 'PEK', name: 'beijing-china', label: 'Beijing, China' },
  PVG: { iata: 'PVG', name: 'shanghai-china', label: 'Shanghai, China' },
  CAN: { iata: 'CAN', name: 'guangzhou-china', label: 'Guangzhou, China' },
  // Southeast Asia
  BKK: { iata: 'BKK', name: 'bangkok-thailand', label: 'Bangkok, Thailand' },
  CNX: { iata: 'CNX', name: 'chiang-mai-thailand', label: 'Chiang Mai, Thailand' },
  HKT: { iata: 'HKT', name: 'phuket-thailand', label: 'Phuket, Thailand' },
  SIN: { iata: 'SIN', name: 'singapore-singapore', label: 'Singapore' },
  KUL: { iata: 'KUL', name: 'kuala-lumpur-malaysia', label: 'Kuala Lumpur, Malaysia' },
  DPS: { iata: 'DPS', name: 'bali-indonesia', label: 'Bali, Indonesia' },
  CGK: { iata: 'CGK', name: 'jakarta-indonesia', label: 'Jakarta, Indonesia' },
  HAN: { iata: 'HAN', name: 'hanoi-vietnam', label: 'Hanoi, Vietnam' },
  SGN: { iata: 'SGN', name: 'ho-chi-minh-city-vietnam', label: 'Ho Chi Minh City, Vietnam' },
  PNH: { iata: 'PNH', name: 'phnom-penh-cambodia', label: 'Phnom Penh, Cambodia' },
  REP: { iata: 'REP', name: 'siem-reap-cambodia', label: 'Siem Reap, Cambodia' },
  RGN: { iata: 'RGN', name: 'yangon-myanmar', label: 'Yangon, Myanmar' },
  VTE: { iata: 'VTE', name: 'vientiane-laos', label: 'Vientiane, Laos' },
  MNL: { iata: 'MNL', name: 'manila-philippines', label: 'Manila, Philippines' },
  // South Asia
  DEL: { iata: 'DEL', name: 'new-delhi-india', label: 'Delhi, India' },
  BOM: { iata: 'BOM', name: 'mumbai-india', label: 'Mumbai, India' },
  BLR: { iata: 'BLR', name: 'bangalore-india', label: 'Bangalore, India' },
  CMB: { iata: 'CMB', name: 'colombo-sri-lanka', label: 'Colombo, Sri Lanka' },
  KTM: { iata: 'KTM', name: 'kathmandu-nepal', label: 'Kathmandu, Nepal' },
  DAC: { iata: 'DAC', name: 'dhaka-bangladesh', label: 'Dhaka, Bangladesh' },
  // Middle East
  DXB: { iata: 'DXB', name: 'dubai-united-arab-emirates', label: 'Dubai, UAE' },
  DOH: { iata: 'DOH', name: 'doha-qatar', label: 'Doha, Qatar' },
  IST: { iata: 'IST', name: 'istanbul-turkey', label: 'Istanbul, Turkey' },
  TLV: { iata: 'TLV', name: 'tel-aviv-israel', label: 'Tel Aviv, Israel' },
  // Oceania
  SYD: { iata: 'SYD', name: 'sydney-australia', label: 'Sydney, Australia' },
  MEL: { iata: 'MEL', name: 'melbourne-australia', label: 'Melbourne, Australia' },
  AKL: { iata: 'AKL', name: 'auckland-new-zealand', label: 'Auckland, New Zealand' },
  // Africa
  CAI: { iata: 'CAI', name: 'cairo-egypt', label: 'Cairo, Egypt' },
  CPT: { iata: 'CPT', name: 'cape-town-south-africa', label: 'Cape Town, South Africa' },
  RAK: { iata: 'RAK', name: 'marrakech-morocco', label: 'Marrakech, Morocco' },
  NBO: { iata: 'NBO', name: 'nairobi-kenya', label: 'Nairobi, Kenya' },
  // Americas
  JFK: { iata: 'JFK', name: 'new-york-united-states', label: 'New York (JFK), USA' },
  LAX: { iata: 'LAX', name: 'los-angeles-united-states', label: 'Los Angeles, USA' },
  SFO: { iata: 'SFO', name: 'san-francisco-united-states', label: 'San Francisco, USA' },
  ORD: { iata: 'ORD', name: 'chicago-united-states', label: 'Chicago, USA' },
  YYZ: { iata: 'YYZ', name: 'toronto-canada', label: 'Toronto, Canada' },
  YVR: { iata: 'YVR', name: 'vancouver-canada', label: 'Vancouver, Canada' },
  MEX: { iata: 'MEX', name: 'mexico-city-mexico', label: 'Mexico City, Mexico' },
  HAV: { iata: 'HAV', name: 'havana-cuba', label: 'Havana, Cuba' },
  GRU: { iata: 'GRU', name: 'sao-paulo-brazil', label: 'São Paulo, Brazil' },
  GIG: { iata: 'GIG', name: 'rio-de-janeiro-brazil', label: 'Rio de Janeiro, Brazil' },
  EZE: { iata: 'EZE', name: 'buenos-aires-argentina', label: 'Buenos Aires, Argentina' },
  SCL: { iata: 'SCL', name: 'santiago-chile', label: 'Santiago, Chile' },
  // Europe (less common from Sweden but searchable)
  LIS: { iata: 'LIS', name: 'lisbon-portugal', label: 'Lisbon, Portugal' },
  KEF: { iata: 'KEF', name: 'reykjavik-iceland', label: 'Reykjavík, Iceland' },
  ATH: { iata: 'ATH', name: 'athens-greece', label: 'Athens, Greece' },
};

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

function buildLinks(origin, destination, params) {
  return SITES.map((site) => ({
    site: site.name,
    note: site.note,
    href: site.url({
      fromName: origin.name,
      toName: destination.name,
      fromIATA: origin.iata,
      toIATA: destination.iata,
      depart: params.depart,
      ret: params.ret,
    }),
  }));
}

function destinationDisplayValue(key) {
  const d = DESTINATIONS[key];
  return d ? `${d.label} (${d.iata})` : '';
}

function findDestinationKey(value) {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  // Match by displayed value (case-insensitive)
  for (const [key, d] of Object.entries(DESTINATIONS)) {
    if (`${d.label} (${d.iata})`.toLowerCase() === v) return key;
  }
  // Match by raw IATA in parens — e.g. "(TYO)" or just "TYO"
  const iataMatch = value.match(/\b([A-Z]{3})\b/i);
  if (iataMatch) {
    const iata = iataMatch[1].toUpperCase();
    for (const [key, d] of Object.entries(DESTINATIONS)) {
      if (d.iata === iata) return key;
    }
  }
  // Match by any label substring
  for (const [key, d] of Object.entries(DESTINATIONS)) {
    if (d.label.toLowerCase().includes(v) && v.length >= 3) return key;
  }
  return null;
}

function renderForm(root) {
  const state = loadState();
  const today = new Date().toISOString().slice(0, 10);
  const inAWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const datalistOptions = Object.entries(DESTINATIONS)
    .map(([k, v]) => `<option value="${v.label} (${v.iata})">`)
    .join('');
  const initialDestKey = state.destination && DESTINATIONS[state.destination] ? state.destination : 'TYO';
  const initialDestValue = destinationDisplayValue(initialDestKey);

  root.innerHTML = `
    <form id="searchForm">
      <p>
        <label>To:
          <input type="text" id="destination" list="destinations"
                 value="${initialDestValue}" placeholder="Type city, country, or IATA code" required>
        </label>
        <datalist id="destinations">${datalistOptions}</datalist>
      </p>
      <p><label>Depart: <input type="date" id="depart" min="${today}" value="${state.depart || today}" required></label></p>
      <p><label>Return: <input type="date" id="return" min="${today}" value="${state.ret || inAWeek}" required></label></p>

      <div class="callout">
        <strong>Also search Copenhagen.</strong> CPH&ndash;Asia is regularly
        1000&ndash;2500 SEK cheaper than ARN&ndash;Asia because more
        carriers compete (SAS, Finnair, Qatar, ANA via partners).
        The X2000 train Stockholm&ndash;Copenhagen is 4h 30m,
        ~400&ndash;600 SEK if you book ahead.
        <br><br>
        <label><input type="checkbox" id="cph" ${state.cph ? 'checked' : ''}> Include Copenhagen (CPH)</label>
      </div>

      <p><label><input type="checkbox" id="hel" ${state.hel ? 'checked' : ''}> Also try Helsinki (HEL) &mdash; Finnair flies <em>direct</em> to Tokyo / Seoul / Bangkok, often the cheapest one-stop from Europe</label></p>
      <p><label><input type="checkbox" id="osl" ${state.osl ? 'checked' : ''}> Also try Oslo (OSL) &mdash; less common but occasionally beats Stockholm</label></p>
      <p><label><input type="checkbox" id="lon" ${state.lon ? 'checked' : ''}> Also try London (LHR/LGW/etc.) &mdash; biggest Europe&ndash;Asia market, BA/JAL/ANA/Virgin/Cathay all compete, often the absolute cheapest fares if you can get to London cheaply</label></p>

      <p><button type="submit">Find flights</button></p>
    </form>
    <div id="results"></div>
    <div id="tips"></div>
  `;
  root.querySelector('#searchForm').addEventListener('submit', onSearch);
  root.querySelector('#destination').addEventListener('change', (e) => {
    const key = findDestinationKey(e.target.value);
    if (key) renderTips(key);
  });
  renderTips(initialDestKey);
}

function renderTips(destKey) {
  const tipsEl = document.getElementById('tips');
  const dest = DESTINATIONS[destKey] || DESTINATIONS.TYO;
  tipsEl.innerHTML = `
    <h2>How to actually find the cheap one</h2>
    <p>This page just opens 4 searches at once. The strategy below is
    how you turn those tabs into a good price.</p>

    <h3>Where to fly from</h3>
    <ul>
      <li><strong>Copenhagen wins more than Stockholm does.</strong> Tick the box above.</li>
      <li><strong>Helsinki is the dark horse.</strong> Finnair has direct flights from HEL to most major Asian cities. When their fares dip, nobody competes.</li>
      <li><strong>London for absolute floor prices.</strong> Heathrow is the biggest Europe&ndash;Asia market in the world. If you can get a cheap ARN&rarr;LHR (Norwegian, Ryanair, BA), the LHR&rarr;Asia leg is often half the price of a direct ARN&rarr;Asia ticket.</li>
      <li><strong>The train + flight combo.</strong> ARN&rarr;CPH&rarr;Asia via X2000 + flight is often 1500 SEK cheaper than direct, even after the train ticket.</li>
      <li><strong>Skip Bromma (BMA).</strong> Domestic only.</li>
    </ul>

    <h3>When to fly</h3>
    <ul>
      ${tipsForDestination(dest)}
      <li><strong>Day of week:</strong> Depart Tue/Wed/Sat, return Tue/Wed. Avoid Fri/Sun departures and Sun returns.</li>
      <li><strong>How far ahead:</strong> Asia long-haul sweet spot is 8&ndash;14 weeks. Less than 6 weeks gets expensive fast; more than 5 months and prices haven't dropped yet.</li>
    </ul>

    <h3>Routing tricks</h3>
    <ul>
      <li><strong>Free stopovers as a feature.</strong> Finnair lets you stop in Helsinki up to 5 days for free. Turkish gives you Istanbul + a free hotel for 24h+ layovers. Qatar offers Doha stopover. Two trips for the price of one.</li>
      <li><strong>Open-jaw saves nothing but adds a lot.</strong> Fly into one city, out of another (e.g. into Tokyo, out of Osaka; or into Bangkok, out of Singapore). Same price as a return, no backtrack.</li>
      <li><strong>Virtual interlining.</strong> Kiwi.com (the website) will combine two airlines that don't officially partner, e.g. Norwegian to London + JAL to Tokyo. Cheapest deals on the longest itineraries usually live there. <em>Risk:</em> if leg 1 is delayed, leg 2 is on you. Buy travel insurance with missed-connection coverage.</li>
      <li><strong>Position-flight separately.</strong> If the cheap intercontinental leg starts in London/Frankfurt/Amsterdam, book that leg first, then a cheap Norwegian/Ryanair/SAS Go ticket from Stockholm to the hub. Sometimes saves 2000+ SEK.</li>
    </ul>

    <h3>VPN and currency tricks</h3>
    <ul>
      <li><strong>VPN to Asia for intra-Asia flights.</strong> Local budget carriers (Cebu Pacific, VietJet, Lion Air, AirAsia) sometimes show 10&ndash;25% cheaper fares from a .ph / .vn / .id / .my IP, billed in local currency. Useful for once-you're-there hops, less so for the long-haul leg from Sweden.</li>
      <li><strong>Currency arbitrage is real.</strong> Same flight priced in PHP / VND / IDR / INR can be cheaper than its EUR/SEK equivalent. Pay with a no-FX-fee card (Revolut, Wise) to avoid bank markup eating the savings.</li>
      <li><strong>Mostly myth, ignore:</strong> "browser cookies drive prices up." Google Flights and Skyscanner show the same prices regardless of cookies or IP &mdash; they pull from the same fare distribution APIs. Incognito mode does nothing for them.</li>
      <li><strong>For ARN&rarr;Asia long-haul, VPN doesn't help.</strong> Major carriers (SAS, Finnair, Qatar, Turkish, BA) price globally. Your fare is anchored to ARN as origin regardless of where your IP says you are.</li>
      <li><strong>Where it does help on long-haul:</strong> some airlines have country-specific promos invisible to outside IPs &mdash; e.g. JAL's domestic Japan deals only show from a .jp IP. Worth a 10-second check on the airline's local site if you're already comparing.</li>
    </ul>

    <h3>Sites and tools</h3>
    <ul>
      <li><strong>Google Flights "Date grid"</strong> &mdash; shows price for &plusmn;3 days around your dates in one view. Click "Date grid" or "Price graph" once a search loads.</li>
      <li><strong>Skyscanner "Whole month" + "Everywhere"</strong> &mdash; the only way to answer "what's the cheapest week in October" without 30 manual searches.</li>
      <li><strong>Mistake-fare alerts:</strong> <a href="https://www.secretflying.com/" target="_blank">Secret Flying</a>, <a href="https://www.jacksflightclub.com/" target="_blank">Jack's Flight Club</a>, <a href="https://thriftytraveler.com/" target="_blank">Thrifty Traveler</a>. Free tiers all post Europe&rarr;Asia mistakes when they happen.</li>
      <li><strong>Track prices:</strong> Google Flights "Track prices" toggle on a saved search. Emails you when fare moves &gt;10%.</li>
    </ul>

    <h3>Rules of thumb (Sweden &rarr; ${dest.label.split(' ')[0]}, economy roundtrip)</h3>
    ${rulesForDestination(dest)}

    <h3>Don't</h3>
    <ul>
      <li><strong>Don't book on the airline's site if a metasearch is cheaper.</strong> But <em>do</em> check the airline's site before booking on Kiwi/Trip.com &mdash; if it's the same price, the airline gives you better refund/change rights.</li>
      <li><strong>Don't pay for seat selection on long-haul</strong> unless you're tall. Random assignment 24h before is usually fine.</li>
      <li><strong>Don't trust hidden-city tickets</strong> (skiplagged etc.) for a return trip. Carriers cancel your return leg if you no-show segment 1.</li>
    </ul>
  `;
}

function tipsForDestination(dest) {
  const seasonalRules = {
    TYO: `
      <li><strong>Avoid:</strong> Cherry blossom (late Mar&ndash;early Apr), Golden Week (29 Apr&ndash;5 May), Obon (mid-Aug), New Year (29 Dec&ndash;5 Jan). Prices spike 50&ndash;100%.</li>
      <li><strong>Sweet spots:</strong> Mid-Sep to mid-Nov (autumn, mild, fewer tourists), late Jan to mid-Mar (cold but cheapest of the year).</li>
      <li><strong>Tokyo airports:</strong> HND closer to city (~30 min, 500 yen monorail). NRT often 500 SEK cheaper to fly into but 90 min + 3000 yen via N'EX. Often cancels out.</li>
    `,
    ICN: `
      <li><strong>Avoid:</strong> Chuseok (Korean Thanksgiving, Sep/Oct varies), Lunar New Year (late Jan&ndash;mid Feb), summer school holidays (late Jul&ndash;mid Aug).</li>
      <li><strong>Sweet spots:</strong> Apr&ndash;May (cherry blossoms in Korea but cheaper than Japan equivalents), late Sep&ndash;Oct (autumn colors), Mar.</li>
    `,
    KIX: `
      <li><strong>Same as Tokyo:</strong> Avoid cherry blossom (late Mar&ndash;early Apr), Golden Week (29 Apr&ndash;5 May), Obon (mid-Aug), New Year.</li>
      <li><strong>Cheaper than Tokyo</strong> as a destination because fewer direct routes &mdash; but easier open-jaw with Tokyo (fly into one, out the other).</li>
    `,
    HKG: `
      <li><strong>Avoid:</strong> Lunar New Year (late Jan&ndash;mid Feb), Easter, summer (very humid + typhoon season Jul&ndash;Sep).</li>
      <li><strong>Sweet spots:</strong> Oct&ndash;Dec (best weather), late Feb&ndash;Apr.</li>
      <li><strong>Tip:</strong> Cathay Pacific from London is often the cheapest one-stop from Northern Europe.</li>
    `,
    TPE: `
      <li><strong>Avoid:</strong> Lunar New Year (late Jan&ndash;mid Feb), summer typhoon season (Jul&ndash;Sep).</li>
      <li><strong>Sweet spots:</strong> Oct&ndash;Dec, Mar&ndash;May.</li>
      <li><strong>Tip:</strong> EVA Air via Bangkok or Vienna is often cheapest from Europe.</li>
    `,
    BKK: `
      <li><strong>Avoid:</strong> Songkran (Thai New Year, mid-Apr) for hotel costs but flights are normal. Christmas/New Year for European-tourist spike.</li>
      <li><strong>Sweet spots:</strong> May&ndash;Sep is rainy but cheap (afternoon storms only). Nov&ndash;Feb is dry season but most expensive.</li>
      <li><strong>Tip:</strong> Bangkok is the cheapest Asia destination from Europe, period. Use it as a stopover or jump-off to other Asian cities.</li>
    `,
    SIN: `
      <li><strong>Year-round equatorial</strong> &mdash; no real seasons, prices flat except Chinese New Year and Christmas spike.</li>
      <li><strong>Sweet spots:</strong> Feb&ndash;Apr (right after CNY), Sep&ndash;Oct.</li>
      <li><strong>Tip:</strong> Singapore Airlines from Frankfurt or London is often a sweet spot if you can position there.</li>
    `,
    PEK: `
      <li><strong>Avoid:</strong> Chinese New Year (late Jan&ndash;mid Feb), Golden Week (1&ndash;7 Oct), summer humidity.</li>
      <li><strong>Sweet spots:</strong> Apr&ndash;May, Sep, late Oct.</li>
      <li><strong>Visa:</strong> 144h transit visa-free for most EU passports if you have an onward ticket to a third country.</li>
    `,
    PVG: `
      <li><strong>Avoid:</strong> Chinese New Year (late Jan&ndash;mid Feb), Golden Week (1&ndash;7 Oct), summer typhoon season.</li>
      <li><strong>Sweet spots:</strong> Apr&ndash;May, Sep&ndash;Oct.</li>
      <li><strong>Visa:</strong> 144h transit visa-free for most EU passports.</li>
    `,
    DEL: `
      <li><strong>Avoid:</strong> Summer (Apr&ndash;Jun, brutally hot, 45&deg;C), monsoon (Jul&ndash;Sep), Diwali (Oct/Nov varies).</li>
      <li><strong>Sweet spots:</strong> Nov&ndash;Mar (cool, dry, peak tourist but flight prices reasonable). Best weather + best prices Dec&ndash;Jan.</li>
    `,
    BOM: `
      <li><strong>Avoid:</strong> Monsoon (Jun&ndash;Sep, very heavy), Diwali (Oct/Nov), summer pre-monsoon (Apr&ndash;May).</li>
      <li><strong>Sweet spots:</strong> Nov&ndash;Feb.</li>
    `,
    DPS: `
      <li><strong>Avoid:</strong> Aussie school holidays (mid-Dec&ndash;late Jan, Jul), peak European summer.</li>
      <li><strong>Sweet spots:</strong> Apr&ndash;Jun, Sep&ndash;early Dec (shoulder season, less rain than Jan&ndash;Feb).</li>
    `,
    KUL: `
      <li><strong>Year-round tropical</strong> &mdash; minor seasons. Prices spike for Chinese New Year, Hari Raya, Christmas/New Year.</li>
      <li><strong>Sweet spots:</strong> Mar, Sep&ndash;Oct.</li>
      <li><strong>Tip:</strong> AirAsia X from KUL is the cheapest backbone of Asian budget travel &mdash; reach KUL cheap, then island-hop.</li>
    `,
    HAN: `
      <li><strong>Avoid:</strong> Tet (Vietnamese New Year, late Jan&ndash;mid Feb).</li>
      <li><strong>Sweet spots:</strong> Mar&ndash;May (spring, dry), Sep&ndash;Nov (autumn, dry).</li>
    `,
    SGN: `
      <li><strong>Avoid:</strong> Tet (late Jan&ndash;mid Feb), peak rainy season (Jun&ndash;Sep).</li>
      <li><strong>Sweet spots:</strong> Dec&ndash;Mar (dry season).</li>
    `,
  };
  return seasonalRules[dest.iata] || `<li>Check the destination's local holidays and weather seasons before locking in dates.</li>`;
}

function rulesForDestination(dest) {
  const rules = {
    TYO: '<ul><li><strong>Under 4500 SEK</strong> &mdash; book immediately.</li><li><strong>4500&ndash;5500 SEK</strong> &mdash; fair shoulder-season price, book.</li><li><strong>5500&ndash;6500 SEK</strong> &mdash; OK in peak, otherwise wait.</li><li><strong>Over 6500 SEK</strong> &mdash; wrong dates. Move 2&ndash;3 days and re-search.</li></ul>',
    KIX: '<ul><li><strong>Under 5000 SEK</strong> &mdash; book.</li><li><strong>5000&ndash;6500 SEK</strong> &mdash; fair.</li><li><strong>Over 6500 SEK</strong> &mdash; consider Tokyo + train (Shinkansen 14000 yen) instead.</li></ul>',
    ICN: '<ul><li><strong>Under 5000 SEK</strong> &mdash; book.</li><li><strong>5000&ndash;6500 SEK</strong> &mdash; fair.</li><li><strong>Over 6500 SEK</strong> &mdash; wait or move dates.</li></ul>',
    HKG: '<ul><li><strong>Under 5000 SEK</strong> &mdash; book.</li><li><strong>5000&ndash;6500 SEK</strong> &mdash; fair.</li><li><strong>Over 7000 SEK</strong> &mdash; wait, especially via London with Cathay.</li></ul>',
    TPE: '<ul><li><strong>Under 5500 SEK</strong> &mdash; book.</li><li><strong>5500&ndash;7000 SEK</strong> &mdash; fair.</li><li><strong>Over 7500 SEK</strong> &mdash; wait or rethink.</li></ul>',
    BKK: '<ul><li><strong>Under 4500 SEK</strong> &mdash; book immediately, BKK should be the cheapest Asian city.</li><li><strong>4500&ndash;5500 SEK</strong> &mdash; fair.</li><li><strong>Over 6500 SEK</strong> &mdash; wrong dates.</li></ul>',
    SIN: '<ul><li><strong>Under 5500 SEK</strong> &mdash; book.</li><li><strong>5500&ndash;7000 SEK</strong> &mdash; fair.</li><li><strong>Over 8000 SEK</strong> &mdash; wait.</li></ul>',
    PEK: '<ul><li><strong>Under 5000 SEK</strong> &mdash; book.</li><li><strong>5000&ndash;6500 SEK</strong> &mdash; fair.</li><li><strong>Over 7500 SEK</strong> &mdash; wait.</li></ul>',
    PVG: '<ul><li><strong>Under 5000 SEK</strong> &mdash; book.</li><li><strong>5000&ndash;6500 SEK</strong> &mdash; fair.</li><li><strong>Over 7500 SEK</strong> &mdash; wait.</li></ul>',
    DEL: '<ul><li><strong>Under 5000 SEK</strong> &mdash; book.</li><li><strong>5000&ndash;6500 SEK</strong> &mdash; fair.</li><li><strong>Over 7500 SEK</strong> &mdash; wait or fly via Doha/Istanbul.</li></ul>',
    BOM: '<ul><li><strong>Under 5500 SEK</strong> &mdash; book.</li><li><strong>5500&ndash;7000 SEK</strong> &mdash; fair.</li><li><strong>Over 8000 SEK</strong> &mdash; wait.</li></ul>',
    DPS: '<ul><li><strong>Under 7000 SEK</strong> &mdash; book.</li><li><strong>7000&ndash;9000 SEK</strong> &mdash; fair (long-haul + extra leg).</li><li><strong>Over 10000 SEK</strong> &mdash; wait.</li></ul>',
    KUL: '<ul><li><strong>Under 5500 SEK</strong> &mdash; book.</li><li><strong>5500&ndash;7000 SEK</strong> &mdash; fair.</li><li><strong>Over 8000 SEK</strong> &mdash; wait.</li></ul>',
    HAN: '<ul><li><strong>Under 5500 SEK</strong> &mdash; book.</li><li><strong>5500&ndash;7000 SEK</strong> &mdash; fair.</li><li><strong>Over 8000 SEK</strong> &mdash; wait or fly into BKK and continue overland.</li></ul>',
    SGN: '<ul><li><strong>Under 5500 SEK</strong> &mdash; book.</li><li><strong>5500&ndash;7000 SEK</strong> &mdash; fair.</li><li><strong>Over 8000 SEK</strong> &mdash; wait.</li></ul>',
  };
  return rules[dest.iata] || '<p>No rule of thumb for this destination yet. Use the others on the page as a calibration.</p>';
}

function onSearch(e) {
  e.preventDefault();
  const f = e.target;
  const depart = f.querySelector('#depart').value;
  const ret = f.querySelector('#return').value;
  const cph = f.querySelector('#cph').checked;
  const hel = f.querySelector('#hel').checked;
  const osl = f.querySelector('#osl').checked;
  const lon = f.querySelector('#lon').checked;
  const destinationInput = f.querySelector('#destination').value;
  const destination = findDestinationKey(destinationInput);

  if (!destination) {
    document.getElementById('results').innerHTML =
      `<p class="error">Couldn't match "${destinationInput}" to an airport. Pick from the suggestions or type a 3-letter IATA code.</p>`;
    return;
  }

  const dest = DESTINATIONS[destination];

  if (new Date(ret) < new Date(depart)) {
    document.getElementById('results').innerHTML =
      `<p class="error">Return date must be on or after depart.</p>`;
    return;
  }

  saveState({ depart, ret, cph, hel, osl, lon, destination });

  const origins = [ORIGINS.ARN];
  if (cph) origins.push(ORIGINS.CPH);
  if (hel) origins.push(ORIGINS.HEL);
  if (osl) origins.push(ORIGINS.OSL);
  if (lon) origins.push(ORIGINS.LON);

  const sections = origins.map((origin) => {
    const links = buildLinks(origin, dest, { depart, ret });
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
      <h2>${origin.label} &rarr; ${dest.label}</h2>
      <table>
        <thead><tr><th>Site</th><th>Why</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  });

  document.getElementById('results').innerHTML =
    sections.join('') +
    `<p class="hint">Click each link to compare. The cheapest is rarely the same site twice in a row.</p>`;

  renderTips(destination);
}

window.addEventListener('DOMContentLoaded', () => {
  renderForm(document.getElementById('app'));
});
