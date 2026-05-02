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

const COUNTRY_ALIASES = {
  Sweden: ['sverige'],
  Norway: ['norge'],
  Denmark: ['danmark'],
  Finland: ['suomi'],
  Iceland: ['island'],
  Germany: ['tyskland', 'deutschland'],
  Spain: ['spanien', 'espana', 'españa'],
  France: ['frankrike'],
  Italy: ['italien', 'italia'],
  UK: ['united kingdom', 'storbritannien', 'england', 'great britain', 'britain', 'britian'],
  Ireland: ['irland', 'eire'],
  Netherlands: ['nederlanderna', 'nederländerna', 'holland', 'niederlande'],
  Belgium: ['belgien', 'belgique'],
  Switzerland: ['schweiz', 'suisse', 'svizzera'],
  Austria: ['osterrike', 'österrike', 'oesterreich'],
  Poland: ['polen', 'polska'],
  Czechia: ['tjeckien', 'czech republic', 'czechoslovakia'],
  Hungary: ['ungern', 'magyarorszag'],
  Slovakia: ['slovakien'],
  Romania: ['rumanien', 'rumänien'],
  Bulgaria: ['bulgarien'],
  Serbia: ['serbien'],
  Croatia: ['kroatien', 'hrvatska'],
  Slovenia: ['slovenien'],
  Latvia: ['lettland'],
  Estonia: ['estland'],
  Lithuania: ['litauen'],
  Greece: ['grekland', 'hellas'],
  Portugal: [],
  Turkey: ['turkiet', 'türkiye', 'turkiye'],
  Japan: ['nihon'],
  China: ['kina'],
  'Hong Kong': ['hongkong', 'hk'],
  Taiwan: [],
  'South Korea': ['sydkorea', 'korea'],
  Thailand: ['thailand'],
  Vietnam: [],
  Singapore: [],
  Malaysia: [],
  Indonesia: ['indonesien', 'bali'],
  Philippines: ['filippinerna'],
  Cambodia: ['kambodja'],
  Myanmar: ['burma'],
  Laos: [],
  India: ['indien'],
  'Sri Lanka': [],
  Nepal: [],
  Bangladesh: [],
  UAE: ['united arab emirates', 'forenade arabemiraten', 'förenade arabemiraten', 'emirates'],
  Qatar: [],
  Israel: [],
  Australia: ['australien'],
  'New Zealand': ['nya zeeland', 'nz', 'aotearoa'],
  Egypt: ['egypten'],
  Morocco: ['marocko'],
  'South Africa': ['sydafrika'],
  Kenya: [],
  USA: ['united states', 'forenta staterna', 'förenta staterna', 'amerika', 'america', 'us'],
  Canada: ['kanada'],
  Mexico: ['mexiko'],
  Cuba: ['kuba'],
  Brazil: ['brasilien'],
  Argentina: [],
  Chile: [],
  Luxembourg: ['luxemburg'],
  Malta: [],
};

const AIRPORTS = {
  // Nordic
  ARN: { name: 'stockholm-sweden', city: 'Stockholm', country: 'Sweden', region: 'nordic', origin: true, destination: true },
  GOT: { name: 'gothenburg-sweden', city: 'Gothenburg', country: 'Sweden', region: 'nordic', origin: true, destination: true },
  MMX: { name: 'malmo-sweden', city: 'Malmö', country: 'Sweden', region: 'nordic', origin: true },
  CPH: { name: 'copenhagen-denmark', city: 'Copenhagen', country: 'Denmark', region: 'nordic', origin: true, destination: true },
  HEL: { name: 'helsinki-finland', city: 'Helsinki', country: 'Finland', region: 'nordic', origin: true, destination: true },
  OSL: { name: 'oslo-norway', city: 'Oslo', country: 'Norway', region: 'nordic', origin: true, destination: true },
  BGO: { name: 'bergen-norway', city: 'Bergen', country: 'Norway', region: 'nordic', origin: true, destination: true },
  KEF: { name: 'reykjavik-iceland', city: 'Reykjavík', country: 'Iceland', region: 'nordic', origin: true, destination: true },

  // UK / Ireland
  LON: { name: 'london-united-kingdom', city: 'London', country: 'UK', region: 'uk', origin: true, destination: true, label: 'London (any airport), UK' },
  LHR: { name: 'london-united-kingdom', city: 'London', country: 'UK', region: 'uk', origin: true, label: 'London Heathrow (LHR), UK' },
  LGW: { name: 'london-united-kingdom', city: 'London', country: 'UK', region: 'uk', origin: true, label: 'London Gatwick (LGW), UK' },
  STN: { name: 'london-united-kingdom', city: 'London', country: 'UK', region: 'uk', origin: true, label: 'London Stansted (STN), UK' },
  DUB: { name: 'dublin-ireland', city: 'Dublin', country: 'Ireland', region: 'uk', origin: true, destination: true },
  EDI: { name: 'edinburgh-united-kingdom', city: 'Edinburgh', country: 'UK', region: 'uk', origin: true, destination: true },
  GLA: { name: 'glasgow-united-kingdom', city: 'Glasgow', country: 'UK', region: 'uk', origin: true, destination: true },
  MAN: { name: 'manchester-united-kingdom', city: 'Manchester', country: 'UK', region: 'uk', origin: true, destination: true },
  BHX: { name: 'birmingham-united-kingdom', city: 'Birmingham', country: 'UK', region: 'uk', origin: true },
  BRS: { name: 'bristol-united-kingdom', city: 'Bristol', country: 'UK', region: 'uk', origin: true },

  // France
  CDG: { name: 'paris-france', city: 'Paris', country: 'France', region: 'eu', origin: true, destination: true, label: 'Paris (CDG), France' },
  ORY: { name: 'paris-france', city: 'Paris', country: 'France', region: 'eu', origin: true, label: 'Paris (ORY), France' },
  NCE: { name: 'nice-france', city: 'Nice', country: 'France', region: 'eu', origin: true, destination: true },
  LYS: { name: 'lyon-france', city: 'Lyon', country: 'France', region: 'eu', origin: true, destination: true },
  MRS: { name: 'marseille-france', city: 'Marseille', country: 'France', region: 'eu', origin: true, destination: true },
  TLS: { name: 'toulouse-france', city: 'Toulouse', country: 'France', region: 'eu', origin: true },

  // Benelux
  AMS: { name: 'amsterdam-netherlands', city: 'Amsterdam', country: 'Netherlands', region: 'eu', origin: true, destination: true },
  EIN: { name: 'eindhoven-netherlands', city: 'Eindhoven', country: 'Netherlands', region: 'eu', origin: true },
  RTM: { name: 'rotterdam-netherlands', city: 'Rotterdam', country: 'Netherlands', region: 'eu', origin: true },
  BRU: { name: 'brussels-belgium', city: 'Brussels', country: 'Belgium', region: 'eu', origin: true, destination: true },
  CRL: { name: 'brussels-belgium', city: 'Brussels', country: 'Belgium', region: 'eu', origin: true, label: 'Brussels Charleroi (CRL), Belgium' },
  LUX: { name: 'luxembourg-luxembourg', city: 'Luxembourg', country: 'Luxembourg', region: 'eu', origin: true, destination: true },

  // German-speaking
  FRA: { name: 'frankfurt-germany', city: 'Frankfurt', country: 'Germany', region: 'eu', origin: true, destination: true },
  MUC: { name: 'munich-germany', city: 'Munich', country: 'Germany', region: 'eu', origin: true, destination: true },
  BER: { name: 'berlin-germany', city: 'Berlin', country: 'Germany', region: 'eu', origin: true, destination: true },
  HAM: { name: 'hamburg-germany', city: 'Hamburg', country: 'Germany', region: 'eu', origin: true, destination: true },
  DUS: { name: 'dusseldorf-germany', city: 'Düsseldorf', country: 'Germany', region: 'eu', origin: true, destination: true },
  CGN: { name: 'cologne-germany', city: 'Cologne', country: 'Germany', region: 'eu', origin: true },
  STR: { name: 'stuttgart-germany', city: 'Stuttgart', country: 'Germany', region: 'eu', origin: true },
  ZRH: { name: 'zurich-switzerland', city: 'Zurich', country: 'Switzerland', region: 'eu', origin: true, destination: true },
  GVA: { name: 'geneva-switzerland', city: 'Geneva', country: 'Switzerland', region: 'eu', origin: true, destination: true },
  BSL: { name: 'basel-switzerland', city: 'Basel', country: 'Switzerland', region: 'eu', origin: true },
  VIE: { name: 'vienna-austria', city: 'Vienna', country: 'Austria', region: 'eu', origin: true, destination: true },

  // Iberia
  MAD: { name: 'madrid-spain', city: 'Madrid', country: 'Spain', region: 'eu', origin: true, destination: true },
  BCN: { name: 'barcelona-spain', city: 'Barcelona', country: 'Spain', region: 'eu', origin: true, destination: true },
  AGP: { name: 'malaga-spain', city: 'Málaga', country: 'Spain', region: 'eu', origin: true, destination: true },
  PMI: { name: 'palma-de-mallorca-spain', city: 'Palma de Mallorca', country: 'Spain', region: 'eu', origin: true, destination: true },
  VLC: { name: 'valencia-spain', city: 'Valencia', country: 'Spain', region: 'eu', origin: true, destination: true },
  SVQ: { name: 'seville-spain', city: 'Seville', country: 'Spain', region: 'eu', origin: true, destination: true },
  BIO: { name: 'bilbao-spain', city: 'Bilbao', country: 'Spain', region: 'eu', origin: true, destination: true },
  IBZ: { name: 'ibiza-spain', city: 'Ibiza', country: 'Spain', region: 'eu', origin: true, destination: true },
  TFS: { name: 'tenerife-spain', city: 'Tenerife (South)', country: 'Spain', region: 'eu', origin: true, destination: true },
  LPA: { name: 'gran-canaria-spain', city: 'Gran Canaria', country: 'Spain', region: 'eu', origin: true, destination: true },
  LIS: { name: 'lisbon-portugal', city: 'Lisbon', country: 'Portugal', region: 'eu', origin: true, destination: true },
  OPO: { name: 'porto-portugal', city: 'Porto', country: 'Portugal', region: 'eu', origin: true, destination: true },
  FAO: { name: 'faro-portugal', city: 'Faro', country: 'Portugal', region: 'eu', origin: true, destination: true },

  // Italy
  FCO: { name: 'rome-italy', city: 'Rome', country: 'Italy', region: 'eu', origin: true, destination: true, label: 'Rome (FCO), Italy' },
  MXP: { name: 'milan-italy', city: 'Milan', country: 'Italy', region: 'eu', origin: true, destination: true, label: 'Milan (MXP), Italy' },
  BGY: { name: 'milan-italy', city: 'Milan', country: 'Italy', region: 'eu', origin: true, label: 'Milan Bergamo (BGY), Italy' },
  VCE: { name: 'venice-italy', city: 'Venice', country: 'Italy', region: 'eu', origin: true, destination: true },
  NAP: { name: 'naples-italy', city: 'Naples', country: 'Italy', region: 'eu', origin: true, destination: true },
  BLQ: { name: 'bologna-italy', city: 'Bologna', country: 'Italy', region: 'eu', origin: true, destination: true },
  FLR: { name: 'florence-italy', city: 'Florence', country: 'Italy', region: 'eu', origin: true, destination: true },
  CTA: { name: 'catania-italy', city: 'Catania (Sicily)', country: 'Italy', region: 'eu', origin: true, destination: true },

  // Greece + Malta
  ATH: { name: 'athens-greece', city: 'Athens', country: 'Greece', region: 'eu', origin: true, destination: true },
  SKG: { name: 'thessaloniki-greece', city: 'Thessaloniki', country: 'Greece', region: 'eu', origin: true, destination: true },
  MLA: { name: 'malta-malta', city: 'Malta', country: 'Malta', region: 'eu', origin: true, destination: true },

  // Central / Eastern Europe
  WAW: { name: 'warsaw-poland', city: 'Warsaw', country: 'Poland', region: 'eu', origin: true, destination: true },
  KRK: { name: 'krakow-poland', city: 'Kraków', country: 'Poland', region: 'eu', origin: true, destination: true },
  GDN: { name: 'gdansk-poland', city: 'Gdańsk', country: 'Poland', region: 'eu', origin: true, destination: true },
  PRG: { name: 'prague-czechia', city: 'Prague', country: 'Czechia', region: 'eu', origin: true, destination: true },
  BUD: { name: 'budapest-hungary', city: 'Budapest', country: 'Hungary', region: 'eu', origin: true, destination: true },
  BTS: { name: 'bratislava-slovakia', city: 'Bratislava', country: 'Slovakia', region: 'eu', origin: true, destination: true },
  OTP: { name: 'bucharest-romania', city: 'Bucharest', country: 'Romania', region: 'eu', origin: true, destination: true },
  SOF: { name: 'sofia-bulgaria', city: 'Sofia', country: 'Bulgaria', region: 'eu', origin: true, destination: true },
  BEG: { name: 'belgrade-serbia', city: 'Belgrade', country: 'Serbia', region: 'eu', origin: true, destination: true },
  ZAG: { name: 'zagreb-croatia', city: 'Zagreb', country: 'Croatia', region: 'eu', origin: true, destination: true },
  SPU: { name: 'split-croatia', city: 'Split', country: 'Croatia', region: 'eu', origin: true, destination: true },
  DBV: { name: 'dubrovnik-croatia', city: 'Dubrovnik', country: 'Croatia', region: 'eu', origin: true, destination: true },
  LJU: { name: 'ljubljana-slovenia', city: 'Ljubljana', country: 'Slovenia', region: 'eu', origin: true, destination: true },

  // Baltics
  RIX: { name: 'riga-latvia', city: 'Riga', country: 'Latvia', region: 'eu', origin: true, destination: true },
  TLL: { name: 'tallinn-estonia', city: 'Tallinn', country: 'Estonia', region: 'eu', origin: true, destination: true },
  VNO: { name: 'vilnius-lithuania', city: 'Vilnius', country: 'Lithuania', region: 'eu', origin: true, destination: true },

  // Middle East gateways
  IST: { name: 'istanbul-turkey', city: 'Istanbul', country: 'Turkey', region: 'me', origin: true, destination: true },
  DXB: { name: 'dubai-united-arab-emirates', city: 'Dubai', country: 'UAE', region: 'me', origin: true, destination: true },
  DOH: { name: 'doha-qatar', city: 'Doha', country: 'Qatar', region: 'me', origin: true, destination: true },
  AUH: { name: 'abu-dhabi-united-arab-emirates', city: 'Abu Dhabi', country: 'UAE', region: 'me', origin: true, destination: true },
  TLV: { name: 'tel-aviv-israel', city: 'Tel Aviv', country: 'Israel', region: 'me', destination: true },

  // North America
  JFK: { name: 'new-york-united-states', city: 'New York', country: 'USA', region: 'na', origin: true, destination: true, label: 'New York (JFK), USA' },
  EWR: { name: 'newark-united-states', city: 'New York', country: 'USA', region: 'na', origin: true, label: 'New York (EWR/Newark), USA' },
  BOS: { name: 'boston-united-states', city: 'Boston', country: 'USA', region: 'na', origin: true, destination: true },
  IAD: { name: 'washington-united-states', city: 'Washington', country: 'USA', region: 'na', origin: true, destination: true, label: 'Washington (IAD), USA' },
  MIA: { name: 'miami-united-states', city: 'Miami', country: 'USA', region: 'na', origin: true, destination: true },
  ORD: { name: 'chicago-united-states', city: 'Chicago', country: 'USA', region: 'na', origin: true, destination: true },
  DFW: { name: 'dallas-united-states', city: 'Dallas', country: 'USA', region: 'na', origin: true, destination: true },
  ATL: { name: 'atlanta-united-states', city: 'Atlanta', country: 'USA', region: 'na', origin: true, destination: true },
  LAX: { name: 'los-angeles-united-states', city: 'Los Angeles', country: 'USA', region: 'na', origin: true, destination: true },
  SFO: { name: 'san-francisco-united-states', city: 'San Francisco', country: 'USA', region: 'na', origin: true, destination: true },
  SEA: { name: 'seattle-united-states', city: 'Seattle', country: 'USA', region: 'na', origin: true, destination: true },
  YYZ: { name: 'toronto-canada', city: 'Toronto', country: 'Canada', region: 'na', origin: true, destination: true },
  YUL: { name: 'montreal-canada', city: 'Montréal', country: 'Canada', region: 'na', origin: true, destination: true },
  YVR: { name: 'vancouver-canada', city: 'Vancouver', country: 'Canada', region: 'na', origin: true, destination: true },

  // Latin America
  MEX: { name: 'mexico-city-mexico', city: 'Mexico City', country: 'Mexico', region: 'latam', destination: true },
  HAV: { name: 'havana-cuba', city: 'Havana', country: 'Cuba', region: 'latam', destination: true },
  GRU: { name: 'sao-paulo-brazil', city: 'São Paulo', country: 'Brazil', region: 'latam', destination: true },
  GIG: { name: 'rio-de-janeiro-brazil', city: 'Rio de Janeiro', country: 'Brazil', region: 'latam', destination: true },
  EZE: { name: 'buenos-aires-argentina', city: 'Buenos Aires', country: 'Argentina', region: 'latam', destination: true },
  SCL: { name: 'santiago-chile', city: 'Santiago', country: 'Chile', region: 'latam', destination: true },

  // Asia — Japan / Korea
  TYO: { name: 'tokyo-japan', city: 'Tokyo', country: 'Japan', region: 'asia', destination: true, label: 'Tokyo (any airport), Japan' },
  KIX: { name: 'osaka-japan', city: 'Osaka', country: 'Japan', region: 'asia', destination: true },
  FUK: { name: 'fukuoka-japan', city: 'Fukuoka', country: 'Japan', region: 'asia', destination: true },
  OKA: { name: 'okinawa-japan', city: 'Okinawa', country: 'Japan', region: 'asia', destination: true },
  CTS: { name: 'sapporo-japan', city: 'Sapporo', country: 'Japan', region: 'asia', destination: true },
  ICN: { name: 'seoul-south-korea', city: 'Seoul', country: 'South Korea', region: 'asia', destination: true },
  PUS: { name: 'busan-south-korea', city: 'Busan', country: 'South Korea', region: 'asia', destination: true },

  // Greater China
  HKG: { name: 'hong-kong-hong-kong', city: 'Hong Kong', country: 'Hong Kong', region: 'asia', destination: true },
  TPE: { name: 'taipei-taiwan', city: 'Taipei', country: 'Taiwan', region: 'asia', destination: true },
  PEK: { name: 'beijing-china', city: 'Beijing', country: 'China', region: 'asia', destination: true },
  PVG: { name: 'shanghai-china', city: 'Shanghai', country: 'China', region: 'asia', destination: true },
  CAN: { name: 'guangzhou-china', city: 'Guangzhou', country: 'China', region: 'asia', destination: true },

  // Southeast Asia
  BKK: { name: 'bangkok-thailand', city: 'Bangkok', country: 'Thailand', region: 'asia', destination: true },
  CNX: { name: 'chiang-mai-thailand', city: 'Chiang Mai', country: 'Thailand', region: 'asia', destination: true },
  HKT: { name: 'phuket-thailand', city: 'Phuket', country: 'Thailand', region: 'asia', destination: true },
  SIN: { name: 'singapore-singapore', city: 'Singapore', country: 'Singapore', region: 'asia', destination: true },
  KUL: { name: 'kuala-lumpur-malaysia', city: 'Kuala Lumpur', country: 'Malaysia', region: 'asia', destination: true },
  DPS: { name: 'bali-indonesia', city: 'Bali', country: 'Indonesia', region: 'asia', destination: true },
  CGK: { name: 'jakarta-indonesia', city: 'Jakarta', country: 'Indonesia', region: 'asia', destination: true },
  HAN: { name: 'hanoi-vietnam', city: 'Hanoi', country: 'Vietnam', region: 'asia', destination: true },
  SGN: { name: 'ho-chi-minh-city-vietnam', city: 'Ho Chi Minh City', country: 'Vietnam', region: 'asia', destination: true },
  PNH: { name: 'phnom-penh-cambodia', city: 'Phnom Penh', country: 'Cambodia', region: 'asia', destination: true },
  REP: { name: 'siem-reap-cambodia', city: 'Siem Reap', country: 'Cambodia', region: 'asia', destination: true },
  RGN: { name: 'yangon-myanmar', city: 'Yangon', country: 'Myanmar', region: 'asia', destination: true },
  VTE: { name: 'vientiane-laos', city: 'Vientiane', country: 'Laos', region: 'asia', destination: true },
  MNL: { name: 'manila-philippines', city: 'Manila', country: 'Philippines', region: 'asia', destination: true },

  // South Asia
  DEL: { name: 'new-delhi-india', city: 'Delhi', country: 'India', region: 'asia', destination: true },
  BOM: { name: 'mumbai-india', city: 'Mumbai', country: 'India', region: 'asia', destination: true },
  BLR: { name: 'bangalore-india', city: 'Bangalore', country: 'India', region: 'asia', destination: true },
  CMB: { name: 'colombo-sri-lanka', city: 'Colombo', country: 'Sri Lanka', region: 'asia', destination: true },
  KTM: { name: 'kathmandu-nepal', city: 'Kathmandu', country: 'Nepal', region: 'asia', destination: true },
  DAC: { name: 'dhaka-bangladesh', city: 'Dhaka', country: 'Bangladesh', region: 'asia', destination: true },

  // Oceania
  SYD: { name: 'sydney-australia', city: 'Sydney', country: 'Australia', region: 'oceania', destination: true },
  MEL: { name: 'melbourne-australia', city: 'Melbourne', country: 'Australia', region: 'oceania', destination: true },
  AKL: { name: 'auckland-new-zealand', city: 'Auckland', country: 'New Zealand', region: 'oceania', destination: true },

  // Africa
  CAI: { name: 'cairo-egypt', city: 'Cairo', country: 'Egypt', region: 'africa', destination: true },
  CPT: { name: 'cape-town-south-africa', city: 'Cape Town', country: 'South Africa', region: 'africa', destination: true },
  RAK: { name: 'marrakech-morocco', city: 'Marrakech', country: 'Morocco', region: 'africa', destination: true },
  NBO: { name: 'nairobi-kenya', city: 'Nairobi', country: 'Kenya', region: 'africa', destination: true },
};

for (const [iata, a] of Object.entries(AIRPORTS)) a.iata = iata;

function airportLabel(a) {
  if (a.label) return a.label;
  const place = a.city === a.country ? a.city : `${a.city}, ${a.country}`;
  return `${place} (${a.iata})`;
}

function originsList() {
  return Object.values(AIRPORTS).filter((a) => a.origin);
}
function destinationsList() {
  return Object.values(AIRPORTS).filter((a) => a.destination);
}

// --- Currency ---

const CURRENCIES = {
  SEK: { symbol: 'SEK', perSek: 1, step: 100, prefix: '', suffix: ' SEK' },
  EUR: { symbol: 'EUR', perSek: 1 / 11.5, step: 10, prefix: '€', suffix: '' },
  USD: { symbol: 'USD', perSek: 1 / 10.5, step: 10, prefix: '$', suffix: '' },
  GBP: { symbol: 'GBP', perSek: 1 / 13.5, step: 10, prefix: '£', suffix: '' },
};

function detectCurrency() {
  const lang = (navigator.language || 'sv-SE').toLowerCase();
  if (lang.startsWith('sv')) return 'SEK';
  if (lang.startsWith('en-gb') || lang.startsWith('cy') || lang.startsWith('gd')) return 'GBP';
  if (lang.startsWith('en-us') || lang.startsWith('en-ca')) return 'USD';
  if (/^(de|fr|es|it|pt|nl|fi|el|pl|cs|hu|sk|sl|hr|bg|ro|et|lv|lt|ga|mt)/.test(lang)) return 'EUR';
  return 'SEK';
}

function formatPrice(sek, currencyKey) {
  const c = CURRENCIES[currencyKey] || CURRENCIES.SEK;
  const value = Math.round((sek * c.perSek) / c.step) * c.step;
  return `${c.prefix}${value}${c.suffix}`;
}

// --- State ---

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

function patchState(patch) {
  saveState({ ...loadState(), ...patch });
}

// --- Search / matching ---

function searchAirports(query, pool) {
  const list = pool;
  const q = (query || '').trim().toLowerCase();
  if (!q) return list.slice(0, 14);
  const matches = [];
  for (const a of list) {
    const aliases = COUNTRY_ALIASES[a.country] || [];
    const hay = [a.iata, a.city, a.country, a.label || '', ...aliases]
      .join('|')
      .toLowerCase()
      .replace(/[åä]/g, 'a')
      .replace(/[ö]/g, 'o')
      .replace(/[é]/g, 'e');
    const qNorm = q.replace(/[åä]/g, 'a').replace(/[ö]/g, 'o').replace(/[é]/g, 'e');
    if (!hay.includes(qNorm)) continue;
    let score = 9;
    if (a.iata.toLowerCase() === q) score = 0;
    else if (a.city.toLowerCase() === q) score = 1;
    else if (a.city.toLowerCase().startsWith(q)) score = 2;
    else if (a.country.toLowerCase() === q) score = 3;
    else if (aliases.some((x) => x.toLowerCase() === q)) score = 3;
    else if (a.country.toLowerCase().startsWith(q)) score = 4;
    else if (aliases.some((x) => x.toLowerCase().startsWith(q))) score = 4;
    matches.push({ score, a });
  }
  matches.sort((x, y) => x.score - y.score || x.a.iata.localeCompare(y.a.iata));
  return matches.slice(0, 14).map((m) => m.a);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function highlight(text, query) {
  const q = (query || '').trim();
  if (!q) return escapeHtml(text);
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return escapeHtml(text);
  return `${escapeHtml(text.slice(0, i))}<mark>${escapeHtml(text.slice(i, i + q.length))}</mark>${escapeHtml(text.slice(i + q.length))}`;
}

// --- Combobox ---

function attachCombobox(container, getPool, onSelect) {
  const input = container.querySelector('input');
  const list = container.querySelector('.combobox-list');
  let active = 0;
  let matches = [];

  function render() {
    matches = searchAirports(input.value, getPool());
    if (matches.length === 0) {
      list.innerHTML = `<li class="combobox-empty">No matches</li>`;
      list.hidden = false;
      return;
    }
    if (active >= matches.length) active = matches.length - 1;
    if (active < 0) active = 0;
    list.innerHTML = matches
      .map((a, i) => {
        const cls = i === active ? 'active' : '';
        const label = highlight(airportLabel(a), input.value);
        return `<li role="option" data-iata="${a.iata}" class="${cls}">${label}</li>`;
      })
      .join('');
    list.hidden = false;
    const activeEl = list.querySelector('li.active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }

  function commit(iata) {
    const a = AIRPORTS[iata];
    if (!a) return;
    input.value = airportLabel(a);
    container.dataset.selected = iata;
    list.hidden = true;
    onSelect(iata);
  }

  input.addEventListener('input', () => {
    container.dataset.selected = '';
    active = 0;
    render();
  });
  input.addEventListener('focus', () => {
    active = 0;
    render();
    input.select();
  });
  input.addEventListener('keydown', (e) => {
    if (list.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      render();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      active = Math.min(active + 1, matches.length - 1);
      render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      active = Math.max(active - 1, 0);
      render();
    } else if (e.key === 'Enter') {
      if (matches[active]) {
        e.preventDefault();
        commit(matches[active].iata);
      }
    } else if (e.key === 'Escape') {
      list.hidden = true;
    } else if (e.key === 'Tab') {
      if (matches[active] && !container.dataset.selected) commit(matches[active].iata);
    }
  });
  list.addEventListener('mousedown', (e) => {
    const li = e.target.closest('li[data-iata]');
    if (!li) return;
    e.preventDefault();
    commit(li.dataset.iata);
  });
  document.addEventListener('mousedown', (e) => {
    if (!container.contains(e.target)) list.hidden = true;
  });

  return {
    commit,
    getSelected: () => container.dataset.selected || resolveTyped(input.value, getPool()),
    setSelected: (iata) => {
      const a = AIRPORTS[iata];
      if (!a) return;
      input.value = airportLabel(a);
      container.dataset.selected = iata;
    },
  };
}

function resolveTyped(value, pool) {
  if (!value) return null;
  const v = value.trim();
  for (const a of pool) {
    if (airportLabel(a).toLowerCase() === v.toLowerCase()) return a.iata;
  }
  const m = v.match(/\b([A-Z]{3})\b/i);
  if (m) {
    const iata = m[1].toUpperCase();
    if (pool.some((a) => a.iata === iata)) return iata;
  }
  const found = searchAirports(v, pool);
  return found[0] ? found[0].iata : null;
}

// --- URL building ---

function buildLinks(originIata, destinationIata, params) {
  const o = AIRPORTS[originIata];
  const d = AIRPORTS[destinationIata];
  return SITES.map((site) => ({
    site: site.name,
    note: site.note,
    href: site.url({
      fromName: o.name,
      toName: d.name,
      fromIATA: o.iata,
      toIATA: d.iata,
      depart: params.depart,
      ret: params.ret,
    }),
  }));
}

// --- Form ---

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function plusDaysISO(iso, days) {
  const t = new Date(iso);
  t.setDate(t.getDate() + days);
  return t.toISOString().slice(0, 10);
}

function renderForm(root) {
  const state = loadState();
  const today = todayISO();
  const initialDepart = state.depart && state.depart >= today ? state.depart : today;
  const initialReturn = state.ret && state.ret >= initialDepart ? state.ret : plusDaysISO(initialDepart, 7);
  const initialOrigin = state.origin && AIRPORTS[state.origin]?.origin ? state.origin : 'ARN';
  const initialDest = state.destination && AIRPORTS[state.destination]?.destination ? state.destination : 'TYO';
  const currency = state.currency || detectCurrency();

  root.innerHTML = `
    <form id="searchForm" autocomplete="off">
      <div class="airports">
        <div class="combobox-field">
          <label for="origin">From</label>
          <div class="combobox" id="origin-cb">
            <input type="text" id="origin" autocomplete="off" placeholder="City, country, or IATA" required>
            <ul class="combobox-list" role="listbox" hidden></ul>
          </div>
        </div>
        <button type="button" id="swapBtn" title="Swap From / To" aria-label="Swap From and To">⇄</button>
        <div class="combobox-field">
          <label for="destination">To</label>
          <div class="combobox" id="dest-cb">
            <input type="text" id="destination" autocomplete="off" placeholder="City, country, or IATA" required>
            <ul class="combobox-list" role="listbox" hidden></ul>
          </div>
        </div>
      </div>

      <div class="dates">
        <p><label>Depart <input type="date" id="depart" min="${today}" value="${initialDepart}" required></label></p>
        <p><label>Return <input type="date" id="return" min="${initialDepart}" value="${initialReturn}" required></label></p>
      </div>
      <p class="hint dates-hint">Flexible? Pick any date — once a search opens, click <em>Date grid</em> on Google Flights or <em>Whole month</em> on Skyscanner to see ±3 days / full month at a glance.</p>

      <div id="altOrigins"></div>

      <div class="actions">
        <button type="submit" id="findBtn">Find flights</button>
        <button type="button" id="openAllBtn" title="Open all 4 sites in new tabs">Open all 4 sites</button>
      </div>

      <div class="currency-toggle">
        Show prices in:
        ${Object.keys(CURRENCIES)
          .map((c) => `<label><input type="radio" name="currency" value="${c}" ${c === currency ? 'checked' : ''}> ${c}</label>`)
          .join('')}
      </div>
    </form>
    <div id="results"></div>
    <div id="tips"></div>
  `;

  const originCb = attachCombobox(root.querySelector('#origin-cb'), originsList, (iata) => {
    patchState({ origin: iata });
    renderAltOrigins(iata, loadState());
  });
  const destCb = attachCombobox(root.querySelector('#dest-cb'), destinationsList, (iata) => {
    patchState({ destination: iata });
    renderTips(iata, getCurrency());
  });
  originCb.setSelected(initialOrigin);
  destCb.setSelected(initialDest);

  renderAltOrigins(initialOrigin, state);
  renderTips(initialDest, currency);

  root.querySelector('#searchForm').addEventListener('submit', (e) => onSearch(e, originCb, destCb));
  root.querySelector('#openAllBtn').addEventListener('click', () => onOpenAll(originCb, destCb));
  root.querySelector('#swapBtn').addEventListener('click', () => {
    const o = originCb.getSelected();
    const d = destCb.getSelected();
    if (!o || !d) return;
    const oCanBeDest = AIRPORTS[o]?.destination;
    const dCanBeOrigin = AIRPORTS[d]?.origin;
    if (!oCanBeDest || !dCanBeOrigin) {
      const reason = !oCanBeDest
        ? `${airportLabel(AIRPORTS[o])} isn't in the destinations list`
        : `${airportLabel(AIRPORTS[d])} isn't in the origins list`;
      document.getElementById('results').innerHTML = `<p class="hint">Can't swap &mdash; ${reason}.</p>`;
      return;
    }
    originCb.setSelected(d);
    destCb.setSelected(o);
    patchState({ origin: d, destination: o });
    renderAltOrigins(d, loadState());
    renderTips(o, getCurrency());
  });

  const departInput = root.querySelector('#depart');
  const returnInput = root.querySelector('#return');
  departInput.addEventListener('change', () => {
    const dep = departInput.value;
    if (dep) {
      returnInput.min = dep;
      if (returnInput.value < dep) {
        returnInput.value = plusDaysISO(dep, 7);
      }
    }
  });

  root.querySelectorAll('input[name="currency"]').forEach((el) => {
    el.addEventListener('change', (e) => {
      patchState({ currency: e.target.value });
      const destKey = destCb.getSelected();
      if (destKey) renderTips(destKey, e.target.value);
    });
  });
}

function getCurrency() {
  return loadState().currency || detectCurrency();
}

// --- Alt origins ---

const ALT_ORIGIN_BLURBS = {
  CPH: 'Copenhagen (CPH) — often the cheapest Nordic origin (more carriers compete)',
  HEL: 'Helsinki (HEL) — Finnair flies <em>direct</em> to Tokyo / Seoul / Bangkok, often cheapest one-stop from Europe',
  OSL: 'Oslo (OSL) — less common but occasionally wins',
  LON: 'London (any airport) — biggest Europe&ndash;Asia / transatlantic market in the world',
  AMS: 'Amsterdam (AMS) — KLM long-haul, often beats other EU hubs to Asia and Africa',
  FRA: 'Frankfurt (FRA) — Lufthansa hub, dense long-haul network',
  MUC: 'Munich (MUC) — Lufthansa secondary hub, sometimes cheaper than FRA',
  CDG: 'Paris (CDG) — Air France hub, especially strong to Africa and Indian Ocean',
  IST: 'Istanbul (IST) — Turkish Airlines, biggest single-airline network worldwide',
  DXB: 'Dubai (DXB) — Emirates hub',
  DOH: 'Doha (DOH) — Qatar hub',
  MAN: 'Manchester (MAN) — secondary UK hub, sometimes cheaper than London',
  EDI: 'Edinburgh (EDI) — useful from Scotland',
  DUB: 'Dublin (DUB) — Aer Lingus has competitive transatlantic fares',
  BCN: 'Barcelona (BCN) — Vueling/Iberia base, often competitive in Southern Europe',
  MAD: 'Madrid (MAD) — Iberia hub, gateway to Latin America',
  WAW: 'Warsaw (WAW) — LOT hub, often cheapest CEE origin',
  VIE: 'Vienna (VIE) — Austrian hub, dense Central/Eastern Europe network',
  JFK: 'New York (JFK) — biggest US transatlantic gateway',
  ORD: 'Chicago (ORD) — UA/AA hub, dense long-haul',
  LAX: 'Los Angeles (LAX) — biggest US Pacific gateway',
  YYZ: 'Toronto (YYZ) — Air Canada hub, often cheaper to Europe than US gateways',
};

function getAltOriginConfig(primaryKey) {
  const primary = AIRPORTS[primaryKey];
  if (!primary) return { suggestions: [], callout: null };

  const isLondon = ['LON', 'LHR', 'LGW', 'STN'].includes(primaryKey);

  if (primary.region === 'nordic') {
    const sug = ['CPH', 'HEL', 'OSL', 'LON'].filter((k) => k !== primaryKey);
    const callout = (primaryKey === 'ARN' || primaryKey === 'GOT')
      ? `<div class="callout">
          <strong>Also search Copenhagen.</strong> CPH&ndash;Asia is regularly
          1000&ndash;2500 SEK cheaper than ARN&ndash;Asia because more carriers
          compete (SAS, Finnair, Qatar, ANA via partners). The X2000 train
          Stockholm&ndash;Copenhagen is 4h 30m, ~400&ndash;600 SEK if you book ahead.
        </div>`
      : null;
    return { suggestions: sug, callout };
  }
  if (primary.region === 'uk') {
    const sug = isLondon ? ['MAN', 'EDI', 'AMS', 'DUB'] : ['LON', 'AMS', 'DUB'];
    return { suggestions: sug.filter((k) => k !== primaryKey), callout: null };
  }
  if (primary.region === 'eu') {
    const sug = ['LON', 'FRA', 'AMS', 'MUC'].filter((k) => k !== primaryKey);
    return { suggestions: sug, callout: null };
  }
  if (primary.region === 'me') {
    const sug = ['IST', 'DXB', 'DOH'].filter((k) => k !== primaryKey);
    return { suggestions: sug, callout: null };
  }
  if (primary.region === 'na') {
    const sug = ['JFK', 'ORD', 'LAX', 'YYZ'].filter((k) => k !== primaryKey);
    return { suggestions: sug, callout: null };
  }
  return { suggestions: [], callout: null };
}

function renderAltOrigins(primaryKey, state) {
  const el = document.getElementById('altOrigins');
  if (!el) return;
  const { suggestions, callout } = getAltOriginConfig(primaryKey);
  if (suggestions.length === 0) {
    el.innerHTML = `<p class="hint">From this origin we don't suggest extra alt-origins. Run the search across all four sites below.</p>`;
    return;
  }
  const checks = suggestions
    .map((k) => {
      const blurb = ALT_ORIGIN_BLURBS[k] || `${airportLabel(AIRPORTS[k])} — alt origin`;
      const checked = state[`alt_${k}`] ? 'checked' : '';
      return `<p><label><input type="checkbox" id="alt_${k}" ${checked}> ${blurb}</label></p>`;
    })
    .join('');
  el.innerHTML = `${callout || ''}<div class="alt-origins-checks"><p class="alt-origins-title">Also search from:</p>${checks}</div>`;

  el.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const patch = {};
      patch[cb.id] = cb.checked;
      patchState(patch);
    });
  });
}

// --- Tips ---

const SEASONAL = {
  TYO: `
    <li><strong>Avoid:</strong> Cherry blossom (late Mar&ndash;early Apr), Golden Week (29 Apr&ndash;5 May), Obon (mid-Aug), New Year (29 Dec&ndash;5 Jan). Prices spike 50&ndash;100% in these windows.</li>
    <li><strong>Sweet spots:</strong> Mid-Sep to mid-Nov (autumn, mild, fewer tourists), late Jan to mid-Mar (cold but cheapest of the year).</li>
    <li><strong>Tokyo airports:</strong> HND closer to city (~30 min, 500 yen monorail). NRT often a bit cheaper to fly into but 90 min + 3000 yen via N'EX. Often cancels out.</li>
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
  BCN: `
    <li><strong>Avoid:</strong> Mobile World Congress (late Feb/early Mar, hotels triple), Sant Joan (late Jun), Aug school holidays.</li>
    <li><strong>Sweet spots:</strong> Apr&ndash;May, late Sep&ndash;Oct.</li>
  `,
  MAD: `
    <li><strong>Avoid:</strong> Easter (Semana Santa) — flights and hotels both spike. Aug is hot and many shops close.</li>
    <li><strong>Sweet spots:</strong> Mar, late Sep&ndash;Nov.</li>
  `,
  LIS: `
    <li><strong>Avoid:</strong> Web Summit (early Nov, hotels insane), Jul&ndash;Aug (peak heat + tourists).</li>
    <li><strong>Sweet spots:</strong> Apr&ndash;May, Sep&ndash;mid Oct.</li>
  `,
};

const PRICE_RULES_SEK = {
  TYO: [
    [6500, 'book immediately, this is rare'],
    [8500, 'very good shoulder-season price, book'],
    [11000, 'fair, normal range'],
    [13000, 'high but typical of peak (cherry blossom, Golden Week, summer). Wait if you can.'],
    [Infinity, 'wrong dates. Move by 1&ndash;2 weeks and re-search.'],
  ],
  KIX: [
    [7000, 'book'],
    [9000, 'fair'],
    [12000, 'high but normal in peak'],
    [Infinity, 'consider Tokyo + Shinkansen (14000 yen) instead'],
  ],
  FUK: [
    [7500, 'book'],
    [10000, 'fair'],
    [Infinity, 'fly into TYO/KIX and connect on a 5000-yen domestic'],
  ],
  OKA: [
    [9000, 'book'],
    [12000, 'fair (always requires a Japan connection)'],
    [Infinity, 'book TYO + cheap Peach/JAL domestic separately'],
  ],
  CTS: [
    [8000, 'book'],
    [11000, 'fair (usually via TYO)'],
    [Infinity, 'book TYO + domestic separately'],
  ],
  ICN: [
    [6500, 'book'],
    [8500, 'fair'],
    [11000, 'high, peak season'],
    [Infinity, 'move dates'],
  ],
  PUS: [
    [7500, 'book'],
    [10000, 'fair (usually via ICN)'],
    [Infinity, 'ICN + KTX train (3h, 60000 KRW)'],
  ],
  HKG: [
    [6500, 'book'],
    [8500, 'fair'],
    [11000, 'high but normal. Try via London with Cathay.'],
    [Infinity, 'wait'],
  ],
  TPE: [
    [7000, 'book'],
    [9000, 'fair'],
    [12000, 'high. EVA via BKK or Vienna often cheapest.'],
    [Infinity, 'rethink'],
  ],
  BKK: [
    [5500, 'book immediately, BKK is the cheapest Asia destination from Europe'],
    [7000, 'very good'],
    [9000, 'fair, normal'],
    [Infinity, 'wait or move dates'],
  ],
  CNX: [
    [6500, 'book'],
    [9000, 'fair (usually via BKK)'],
    [Infinity, 'book BKK + 400 SEK AirAsia/Nok hop'],
  ],
  HKT: [
    [7000, 'book'],
    [9500, 'fair'],
    [Infinity, 'BKK + cheap domestic'],
  ],
  SIN: [
    [7000, 'book'],
    [9000, 'fair'],
    [11000, 'high. SQ from Frankfurt or LHR often beats SE direct.'],
    [Infinity, 'wait'],
  ],
  PEK: [
    [6500, 'book'],
    [8500, 'fair'],
    [Infinity, 'wait'],
  ],
  PVG: [
    [6500, 'book'],
    [8500, 'fair'],
    [Infinity, 'wait'],
  ],
  CAN: [
    [6500, 'book'],
    [9000, 'fair'],
    [Infinity, 'via PEK or HKG instead'],
  ],
  DEL: [
    [6000, 'book'],
    [8000, 'fair'],
    [Infinity, 'wait or fly via Doha/Istanbul'],
  ],
  BOM: [
    [6500, 'book'],
    [8500, 'fair'],
    [Infinity, 'wait'],
  ],
  BLR: [
    [6500, 'book'],
    [9000, 'fair'],
    [Infinity, 'via BOM/DEL with cheap domestic'],
  ],
  DPS: [
    [9000, 'book'],
    [12000, 'fair (long-haul + extra leg)'],
    [Infinity, 'SIN + AirAsia hop separately'],
  ],
  CGK: [
    [7500, 'book'],
    [10000, 'fair'],
    [Infinity, 'via SIN/KUL'],
  ],
  KUL: [
    [7000, 'book'],
    [9000, 'fair'],
    [Infinity, 'wait'],
  ],
  HAN: [
    [6500, 'book'],
    [8500, 'fair'],
    [Infinity, 'BKK + overland or cheap VietJet'],
  ],
  SGN: [
    [6500, 'book'],
    [8500, 'fair'],
    [Infinity, 'BKK + cheap domestic'],
  ],
  MNL: [
    [7500, 'book'],
    [10000, 'fair'],
    [Infinity, 'via HKG/BKK'],
  ],
  DXB: [
    [4500, 'book'],
    [6500, 'fair (Emirates and Qatar compete hard)'],
    [Infinity, 'wrong dates'],
  ],
  DOH: [
    [4500, 'book'],
    [6500, 'fair'],
    [Infinity, 'wait'],
  ],
  IST: [
    [3500, 'book'],
    [5500, 'fair'],
    [Infinity, 'wrong dates'],
  ],
  SYD: [
    [11000, 'book'],
    [14000, "fair (it's the long one)"],
    [Infinity, 'wait or rethink'],
  ],
  MEL: [
    [11000, 'book'],
    [14000, 'fair'],
    [Infinity, 'wait'],
  ],
  AKL: [
    [12000, 'book'],
    [15000, 'fair'],
    [Infinity, 'wait'],
  ],
  BCN: [
    [800, 'book — rare, usually only on Vueling/Norwegian budget runs'],
    [1500, 'fair, normal Nordic&ndash;Spain range'],
    [2500, 'high, peak season'],
    [Infinity, 'wrong dates'],
  ],
  MAD: [
    [800, 'book'],
    [1500, 'fair'],
    [2500, 'high'],
    [Infinity, 'wrong dates'],
  ],
  LIS: [
    [1000, 'book'],
    [1800, 'fair'],
    [2800, 'high'],
    [Infinity, 'wrong dates'],
  ],
};

function rulesForDestination(dest, currency) {
  const note = `<p class="hint">Calibrated to current (post-2022) prices. Europe&ndash;Asia long-haul is structurally 40&ndash;60% more expensive than it was pre-pandemic &mdash; jet fuel, fewer carriers, less Russian airspace. Prices below shown in <strong>${currency}</strong> &mdash; toggle above to switch.</p>`;
  const bands = PRICE_RULES_SEK[dest.iata];
  if (!bands) return note + `<p>No specific rule of thumb for this destination yet. Use the calibration note above plus the others on the page.</p>`;
  const items = bands
    .map((band, i) => {
      const upper = band[0];
      const advice = band[1];
      const prev = i === 0 ? 0 : bands[i - 1][0];
      let prefix;
      if (i === 0) prefix = `Under ${formatPrice(upper, currency)}`;
      else if (upper === Infinity) prefix = `Over ${formatPrice(prev, currency)}`;
      else prefix = `${formatPrice(prev, currency)}&ndash;${formatPrice(upper, currency)}`;
      return `<li><strong>${prefix}</strong> &mdash; ${advice}</li>`;
    })
    .join('');
  return note + `<ul>${items}</ul>`;
}

function tipsForDestination(dest) {
  return SEASONAL[dest.iata] || `<li>Check the destination's local holidays and weather seasons before locking in dates.</li>`;
}

function renderTips(destKey, currency) {
  const tipsEl = document.getElementById('tips');
  if (!tipsEl) return;
  const dest = AIRPORTS[destKey] || AIRPORTS.TYO;
  const cur = currency || getCurrency();
  tipsEl.innerHTML = `
    <h2>How to actually find the cheap one</h2>
    <p>This page just opens 4 searches at once. The strategy below is how you turn those tabs into a good price.</p>

    <details open>
      <summary><strong>Where to fly from</strong></summary>
      <ul>
        <li><strong>Copenhagen wins more than Stockholm does.</strong> Tick the box above.</li>
        <li><strong>Helsinki is the dark horse.</strong> Finnair has direct flights from HEL to most major Asian cities. When their fares dip, nobody competes.</li>
        <li><strong>London for absolute floor prices.</strong> Heathrow is the biggest Europe&ndash;Asia market in the world. If you can get a cheap ARN&rarr;LHR (Norwegian, Ryanair, BA), the LHR&rarr;Asia leg is often half the price of a direct ARN&rarr;Asia ticket.</li>
        <li><strong>The train + flight combo.</strong> ARN&rarr;CPH&rarr;Asia via X2000 + flight is often 1500 SEK cheaper than direct, even after the train ticket.</li>
        <li><strong>Skip Bromma (BMA).</strong> Domestic only.</li>
      </ul>
    </details>

    <details open>
      <summary><strong>When to fly</strong></summary>
      <ul>
        ${tipsForDestination(dest)}
        <li><strong>Day of week to <em>fly</em>:</strong> Depart Tue/Wed/Sat, return Tue/Wed. Avoid Fri/Sun departures and Sun returns. This is real and documented.</li>
        <li><strong>How far ahead:</strong> Asia long-haul sweet spot is 8&ndash;14 weeks. Less than 6 weeks gets expensive fast; more than 5 months and prices haven't dropped yet.</li>
        <li><strong>What does <em>not</em> matter:</strong> day-of-week you book, time-of-day you book, whether you use incognito mode. See "Myths to ignore" below.</li>
      </ul>
    </details>

    <details>
      <summary><strong>Routing tricks</strong></summary>
      <ul>
        <li><strong>Free stopovers as a feature.</strong> Finnair lets you stop in Helsinki up to 5 days for free. Turkish gives you Istanbul + a free hotel for 24h+ layovers. Qatar offers Doha stopover. Two trips for the price of one.</li>
        <li><strong>Open-jaw saves nothing but adds a lot.</strong> Fly into one city, out of another (e.g. into Tokyo, out of Osaka; or into Bangkok, out of Singapore). Same price as a return, no backtrack.</li>
        <li><strong>Virtual interlining.</strong> Kiwi.com (the website) will combine two airlines that don't officially partner, e.g. Norwegian to London + JAL to Tokyo. Cheapest deals on the longest itineraries usually live there. <em>Risk:</em> if leg 1 is delayed, leg 2 is on you. Buy travel insurance with missed-connection coverage.</li>
        <li><strong>Position-flight separately.</strong> If the cheap intercontinental leg starts in London/Frankfurt/Amsterdam, book that leg first, then a cheap Norwegian/Ryanair/SAS Go ticket from Stockholm to the hub. Sometimes saves 2000+ SEK.</li>
      </ul>
    </details>

    <details>
      <summary><strong>VPN and currency &mdash; what actually works</strong></summary>
      <ul>
        <li><strong>VPN to Asia for intra-Asia flights.</strong> Local budget carriers (Cebu Pacific, VietJet, Lion Air, AirAsia) sometimes show 10&ndash;25% cheaper fares from a .ph / .vn / .id / .my IP, billed in local currency. Useful for once-you're-there hops, not for the long-haul leg from Sweden.</li>
        <li><strong>Currency arbitrage is real.</strong> Same flight priced in PHP / VND / IDR / INR can be cheaper than its EUR/SEK equivalent. Pay with a no-FX-fee card (Revolut, Wise) so bank markup doesn't eat the savings.</li>
        <li><strong>Some airlines run country-locked promos.</strong> JAL's Japan-domestic deals only show from a .jp IP. Worth a 10-second check on the airline's local site if you're already comparing.</li>
      </ul>
    </details>

    <details>
      <summary><strong>Myths to ignore</strong> &mdash; 18 popular "tips" that cost you time or money</summary>
      <p>Everyone "knows" these. None of them are true. Each costs you time or money if you act on them.</p>
      <ul>
        <li><strong>"Book on Tuesday."</strong> Folklore from a 2010s AA/Delta Tuesday-afternoon fare-war pattern that hasn't been true for 10+ years. Day-of-search effect is under 1% in studies by Expedia/ARC, Skyscanner, and Hopper &mdash; statistical noise. The day you click doesn't matter.</li>
        <li><strong>"Search incognito or clear cookies &mdash; sites raise prices when they see you've searched before."</strong> Debunked many times (ITA, Skyscanner, FairFly). Prices change with demand and inventory, not your cookie history. Incognito mode does nothing for fare prices.</li>
        <li><strong>"Use a VPN to a poor country to get cheaper international flights."</strong> Mostly false for major Western metasearch (Google Flights, Skyscanner, Momondo all return the same fares regardless of IP, because they pull the same fare APIs). Real only for local Asian budget carriers in local currency &mdash; see the section above.</li>
        <li><strong>"Wait for last-minute deals."</strong> Works for cruises and hotel rooms with empty inventory. Does not work for international flights. Long-haul sub-2-week prices almost always spike, often 50&ndash;100%. The deals are 8&ndash;14 weeks out, not the night before.</li>
        <li><strong>"Book exactly N days out."</strong> 21, 47, 54, 67 &mdash; pick a number, someone has written a Medium post about it. None are magic. Sweet spot is a window of weeks, not a single date. Use Skyscanner's whole-month view to see the actual price curve for your dates.</li>
        <li><strong>"Round-trip is always cheaper than two one-ways."</strong> Increasingly false. Modern airlines often price one-ways at exactly half the round-trip, and budget carriers always do. Always check both before booking.</li>
        <li><strong>"Booking each leg separately saves money."</strong> Sometimes true (especially when one leg is on a budget carrier the metasearch missed). Often false, and you lose protection: if leg 1 is delayed, leg 2 is on you. Calculate explicitly and budget for missed-connection insurance if you go this route.</li>
        <li><strong>"Calling the airline gets you a better fare."</strong> You'll pay a phone-booking surcharge (typically 25&ndash;100 SEK) instead of saving money. Rare exception: complex multi-city with mileage where the website is broken.</li>
        <li><strong>"Mileage redemption is free."</strong> Plus fuel surcharges (often 2000&ndash;5000 SEK on long-haul), plus taxes, plus a redemption value of 25&ndash;60% below cash on most economy routes. Always compare to the cash price first &mdash; mileage is a deal mainly for premium cabins.</li>
        <li><strong>"Mistake fares are always honored."</strong> US DOT mandates honoring them, but the EU and most non-US carriers can void within 24h with a refund. Don't book non-refundable hotels until your ticket clears the 72h "this fare is real" mark.</li>
        <li><strong>"Budget airlines are always cheapest."</strong> Often false after bags (~25 EUR), seat selection (~15), priority boarding (~10), and food. Total cost frequently matches mainstream carriers without the schedule reliability, free rebooking, or alliance miles.</li>
        <li><strong>"Black Friday / Cyber Monday flight deals."</strong> Theatrical. Real fare drops happen when an airline has too much capacity on a specific route and competitors react &mdash; not on a marketing day. Track prices on Google Flights instead of waiting for Black Friday.</li>
        <li><strong>"The airline's own website is always cheapest."</strong> Often false &mdash; metasearch and consolidators can be 10&ndash;30% cheaper. <em>But</em>: if the airline matches the price, book directly with them. You get better refund, rebooking, and irregular-operations rights than any consolidator gives you.</li>
        <li><strong>"Saturday night stay required for cheap fares."</strong> True before ~2010, mostly gone now. Some legacy carriers still have it on specific routes, but it's no longer a general rule.</li>
        <li><strong>"Avoid red-eye flights."</strong> Red-eyes are often the cheapest flights of the day on long-haul routes &mdash; that's why they exist. If sleep on the plane works for you, they're a feature.</li>
        <li><strong>"Hidden city ticketing always works."</strong> It works for one-way tickets where you're OK losing any return leg. On a roundtrip, no-showing segment 1 cancels every later segment in the booking automatically. Some airlines (Lufthansa, AA) ban repeat offenders or sue them. The savings are rarely worth the risk for a normal trip.</li>
        <li><strong>"Multi-city is always cheaper than two round-trips."</strong> Sometimes true, often false, depends on routing. Try both.</li>
        <li><strong>"You should book at midnight."</strong> No airline updates fares at any specific clock time globally. Fares update on inventory changes, which happen continuously.</li>
      </ul>
    </details>

    <details>
      <summary><strong>Sites and tools</strong></summary>
      <ul>
        <li><strong>Google Flights "Date grid"</strong> &mdash; shows price for &plusmn;3 days around your dates in one view. Click "Date grid" or "Price graph" once a search loads.</li>
        <li><strong>Skyscanner "Whole month" + "Everywhere"</strong> &mdash; the only way to answer "what's the cheapest week in October" without 30 manual searches.</li>
        <li><strong>Mistake-fare alerts:</strong> <a href="https://www.secretflying.com/" target="_blank" rel="noopener">Secret Flying</a>, <a href="https://www.jacksflightclub.com/" target="_blank" rel="noopener">Jack's Flight Club</a>, <a href="https://thriftytraveler.com/" target="_blank" rel="noopener">Thrifty Traveler</a>. Free tiers all post Europe&rarr;Asia mistakes when they happen.</li>
        <li><strong>Track prices:</strong> Google Flights "Track prices" toggle on a saved search. Emails you when fare moves &gt;10%.</li>
      </ul>
    </details>

    <h3>Rules of thumb (Sweden &rarr; ${dest.city}, economy roundtrip)</h3>
    ${rulesForDestination(dest, cur)}

    <details>
      <summary><strong>Don't</strong></summary>
      <ul>
        <li><strong>Don't book on the airline's site if a metasearch is cheaper.</strong> But <em>do</em> check the airline's site before booking on Kiwi/Trip.com &mdash; if it's the same price, the airline gives you better refund/change rights.</li>
        <li><strong>Don't pay for seat selection on long-haul</strong> unless you're tall. Random assignment 24h before is usually fine.</li>
        <li><strong>Don't trust hidden-city tickets</strong> (skiplagged etc.) for a return trip. Carriers cancel your return leg if you no-show segment 1.</li>
      </ul>
    </details>
  `;
}

// --- Search submit ---

function collectAltOriginIatas() {
  const state = loadState();
  const all = Object.keys(state).filter((k) => k.startsWith('alt_') && state[k]).map((k) => k.slice(4));
  return all.filter((iata) => AIRPORTS[iata]);
}

function onSearch(e, originCb, destCb) {
  e.preventDefault();
  const originKey = originCb.getSelected();
  const destKey = destCb.getSelected();
  const depart = document.getElementById('depart').value;
  const ret = document.getElementById('return').value;

  if (!originKey) {
    document.getElementById('results').innerHTML = `<p class="error">Pick an origin from the dropdown.</p>`;
    return;
  }
  if (!destKey) {
    document.getElementById('results').innerHTML = `<p class="error">Pick a destination from the dropdown.</p>`;
    return;
  }
  if (new Date(ret) < new Date(depart)) {
    document.getElementById('results').innerHTML = `<p class="error">Return date must be on or after depart.</p>`;
    return;
  }

  patchState({ origin: originKey, destination: destKey, depart, ret });

  const altKeys = collectAltOriginIatas().filter((k) => k !== originKey);
  const allOrigins = [originKey, ...altKeys];

  const sections = allOrigins
    .map((oKey) => {
      const o = AIRPORTS[oKey];
      const d = AIRPORTS[destKey];
      const links = buildLinks(oKey, destKey, { depart, ret });
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
        <h2>${airportLabel(o)} &rarr; ${airportLabel(d)}</h2>
        <table>
          <thead><tr><th>Site</th><th>Why</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    })
    .join('');

  document.getElementById('results').innerHTML =
    sections + `<p class="hint">Click each link to compare. The cheapest is rarely the same site twice in a row. Or use <strong>Open all 4 sites</strong> above to launch them in tabs.</p>`;

  renderTips(destKey, getCurrency());
}

function onOpenAll(originCb, destCb) {
  const originKey = originCb.getSelected();
  const destKey = destCb.getSelected();
  const depart = document.getElementById('depart').value;
  const ret = document.getElementById('return').value;
  if (!originKey || !destKey) {
    document.getElementById('results').innerHTML = `<p class="error">Pick both an origin and a destination first.</p>`;
    return;
  }
  if (new Date(ret) < new Date(depart)) {
    document.getElementById('results').innerHTML = `<p class="error">Return date must be on or after depart.</p>`;
    return;
  }
  patchState({ origin: originKey, destination: destKey, depart, ret });

  const links = buildLinks(originKey, destKey, { depart, ret });
  const opened = [];
  for (const l of links) {
    const a = document.createElement('a');
    a.href = l.href;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    opened.push(l.site);
  }
  const o = AIRPORTS[originKey];
  const d = AIRPORTS[destKey];
  const status = `<p class="status">Triggered ${opened.length} tabs: ${opened.join(', ')}. If fewer opened, your browser blocked the popups &mdash; allow popups for this site, or use the links below.</p>`;

  const linkRows = links
    .map(
      (l) => `
        <tr>
          <td><a href="${l.href}" target="_blank" rel="noopener">${l.site}</a></td>
          <td>${l.note}</td>
        </tr>
      `,
    )
    .join('');
  document.getElementById('results').innerHTML = `
    <h2>${airportLabel(o)} &rarr; ${airportLabel(d)}</h2>
    ${status}
    <table>
      <thead><tr><th>Site</th><th>Why</th></tr></thead>
      <tbody>${linkRows}</tbody>
    </table>
  `;

  renderTips(destKey, getCurrency());
}

window.addEventListener('DOMContentLoaded', () => {
  renderForm(document.getElementById('app'));
});
