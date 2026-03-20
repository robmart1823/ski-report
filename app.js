// ─────────────────────────────────────────────
//  Indy Pass Northeast Ski Conditions Dashboard
// ─────────────────────────────────────────────

// RapidAPI key for ski conditions data
const RAPIDAPI_KEY = '71842f5d36msh09044293d4984efp14ea41jsn5b6307aa7ccb';

const RESORTS = [
  // Vermont
  { name: 'Bolton Valley',    state: 'VT', lat: 44.4186, lon: -72.8722,
    slug: 'bolton-valley',    liftie: 'bolton-valley',  snoId: '802002',
    url: 'https://www.boltonvalley.com',
    conditionsUrl: 'https://www.boltonvalley.com/mountain-info/snow-conditions/',
    totalTrails: 71 },
  { name: 'Burke Mountain',   state: 'VT', lat: 44.5895, lon: -71.9007,
    slug: 'burke-mountain',   liftie: 'burke',
    url: 'https://www.skiburke.com',
    conditionsUrl: 'https://www.skiburke.com/mountain-info/conditions/',
    totalTrails: 50 },
  { name: 'Jay Peak',         state: 'VT', lat: 44.9280, lon: -72.5235,
    slug: 'jay-peak',         liftie: 'jay-peak',       snoId: '802006',
    url: 'https://jaypeakresort.com',
    conditionsUrl: 'https://jaypeakresort.com/mountain/conditions/',
    totalTrails: 78 },
  { name: 'Magic Mountain',   state: 'VT', lat: 43.3528, lon: -72.8331,
    slug: 'magic-mountain',
    url: 'https://www.skimagic.com',
    conditionsUrl: 'https://www.skimagic.com/conditions/',
    totalTrails: 40 },
  { name: 'Saskadena Six',    state: 'VT', lat: 43.9159, lon: -72.5668,
    slug: 'saskadena-six',
    url: 'https://www.saskadena6.com',
    conditionsUrl: 'https://www.saskadena6.com/',
    totalTrails: 19 },

  // New Hampshire
  { name: 'Black Mountain',   state: 'NH', lat: 44.1520, lon: -71.1990,
    slug: 'black-mountain-nh',
    url: 'https://www.blackmt.com',
    conditionsUrl: 'https://www.blackmt.com/skiing/conditions/',
    totalTrails: 45 },
  { name: 'Cannon Mountain',  state: 'NH', lat: 44.1541, lon: -71.6925,
    slug: 'cannon-mountain',  liftie: 'cannon',
    url: 'https://www.cannonmt.com',
    conditionsUrl: 'https://www.cannonmt.com/mountain/snow-conditions/',
    totalTrails: 72 },
  { name: 'Dartmouth Skiway', state: 'NH', lat: 43.8167, lon: -72.0656,
    slug: 'dartmouth-skiway',
    url: 'https://skiway.dartmouth.edu',
    conditionsUrl: 'https://skiway.dartmouth.edu/conditions/',
    totalTrails: 23 },
  { name: 'Pats Peak',        state: 'NH', lat: 43.1568, lon: -71.7548,
    slug: 'pats-peak',        liftie: 'pats-peak',
    url: 'https://www.patspeak.com',
    conditionsUrl: 'https://www.patspeak.com/mountain/conditions/',
    totalTrails: 28 },
  { name: 'Tenney Mountain',  state: 'NH', lat: 43.8100, lon: -71.8500,
    slug: 'tenney-mountain',
    url: 'https://www.tenneymtn.com',
    conditionsUrl: 'https://www.tenneymtn.com/mountain/conditions/',
    totalTrails: 50 },
  { name: 'Waterville Valley',state: 'NH', lat: 43.9700, lon: -71.5100,
    slug: 'waterville-valley', liftie: 'waterville',
    url: 'https://www.waterville.com',
    conditionsUrl: 'https://www.waterville.com/mountain-info/trail-conditions/',
    totalTrails: 52 },

  // Maine
  { name: 'Big Moose Mountain', state: 'ME', lat: 45.5400, lon: -69.8700,
    slug: 'big-moose-mountain',
    url: 'https://bigmoosemtn.com',
    conditionsUrl: 'https://bigmoosemtn.com/conditions/',
    totalTrails: 49 },
  { name: 'Big Rock',           state: 'ME', lat: 46.8900, lon: -68.1300,
    slug: 'big-rock',
    url: 'https://www.bigrockmaine.com',
    conditionsUrl: 'https://www.bigrockmaine.com/conditions/',
    totalTrails: 30 },
  { name: 'Camden Snow Bowl',   state: 'ME', lat: 44.2240, lon: -69.0880,
    slug: 'camden-snow-bowl',
    url: 'https://camdensnowbowl.com',
    conditionsUrl: 'https://camdensnowbowl.com/ski-conditions/',
    totalTrails: 28 },
  { name: 'Mt. Abram',          state: 'ME', lat: 44.5900, lon: -70.6800,
    slug: 'mt-abram',           liftie: 'mt-abram',
    url: 'https://www.mtabram.com',
    conditionsUrl: 'https://www.mtabram.com/conditions/',
    totalTrails: 44 },

  // Massachusetts
  { name: 'Berkshire East',   state: 'MA', lat: 42.5432, lon: -72.9151,
    slug: 'berkshire-east',   liftie: 'berkshire-east',
    url: 'https://www.berkshireeast.com',
    conditionsUrl: 'https://www.berkshireeast.com/ski-conditions/',
    totalTrails: 45 },
  { name: 'Bousquet Mountain',state: 'MA', lat: 42.4500, lon: -73.2800,
    slug: 'bousquet-mountain',
    url: 'https://www.bousquets.com',
    conditionsUrl: 'https://www.bousquets.com/conditions/',
    totalTrails: 23 },
  { name: 'Catamount',        state: 'MA', lat: 42.1273, lon: -73.4440,
    slug: 'catamount',        liftie: 'catamount',
    url: 'https://www.catamountski.com',
    conditionsUrl: 'https://www.catamountski.com/conditions/',
    totalTrails: 36 },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Open-Meteo fetch ──────────────────────────
async function fetchWeather(resort) {
  // Request both current and hourly snow_depth (past 24h + 7 days ahead).
  // Hourly gives us a reliable series to pick the most recent non-null value from.
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${resort.lat}&longitude=${resort.lon}` +
    `&current=snow_depth` +
    `&hourly=snow_depth` +
    `&daily=snowfall_sum` +
    `&forecast_days=7` +
    `&past_hours=24` +
    `&precipitation_unit=inch` +
    `&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  // snow_depth is always in meters from Open-Meteo → convert to inches
  // Prefer current value; fall back to most recent hourly value that isn't null
  let rawDepth = data.current?.snow_depth ?? null;
  if (rawDepth === null) {
    const hourlyDepths = data.hourly?.snow_depth ?? [];
    // Walk backwards to find the most recent non-null reading
    for (let i = hourlyDepths.length - 1; i >= 0; i--) {
      if (hourlyDepths[i] !== null) { rawDepth = hourlyDepths[i]; break; }
    }
  }
  const baseInches = rawDepth !== null ? Math.round(rawDepth * 39.37) : null;

  // snowfall_sum is in inches (we requested precipitation_unit=inch)
  const forecast = (data.daily?.snowfall_sum ?? []).map(v =>
    v !== null ? Math.round(v * 10) / 10 : 0
  );
  const dates = data.daily?.time ?? [];

  return { baseInches, forecast, dates };
}

// ── RapidAPI ski conditions fetch ─────────────
async function fetchRapidAPI(resort) {
  const headers = {
    'x-rapidapi-key': RAPIDAPI_KEY,
  };

  // Try "Ski Resorts and Conditions" API (random-shapes on RapidAPI)
  try {
    const host = 'ski-resorts-and-conditions.p.rapidapi.com';
    const res = await fetch(
      `https://${host}/v1/resort?slug=${encodeURIComponent(resort.slug)}`,
      { headers: { ...headers, 'x-rapidapi-host': host } }
    );
    if (res.ok) {
      const json = await res.json();
      console.log(`[RapidAPI/ski-resorts-and-conditions] ${resort.name}:`, json);
      const d = json?.data ?? json;
      const cond = d?.conditions ?? d?.condition ?? d;
      const openTrails = cond?.openRuns ?? cond?.openTrails ?? cond?.open_trails ?? null;
      const snowBaseIn = cond?.base ?? cond?.baseDepth ?? cond?.snow_base ?? cond?.snowBase ?? null;
      if (openTrails !== null || snowBaseIn !== null) {
        return { openTrails: openTrails ? parseInt(openTrails) : null,
                 snowBaseIn: snowBaseIn ? parseInt(snowBaseIn) : null };
      }
    }
  } catch (e) {
    console.warn(`[RapidAPI/ski-resorts-and-conditions] ${resort.name} failed:`, e);
  }

  // Try "Ski Resort Forecast" API (joeykyber on RapidAPI)
  try {
    const host = 'ski-resort-forecast.p.rapidapi.com';
    const res = await fetch(
      `https://${host}/${encodeURIComponent(resort.name)}`,
      { headers: { ...headers, 'x-rapidapi-host': host } }
    );
    if (res.ok) {
      const json = await res.json();
      console.log(`[RapidAPI/ski-resort-forecast] ${resort.name}:`, json);
      const cond = Array.isArray(json) ? json[0] : json;
      const openTrails = cond?.openRuns ?? cond?.openTrails ?? cond?.open_runs ?? null;
      const snowBaseIn = cond?.baseDepth ?? cond?.base ?? cond?.snowBase ?? null;
      if (openTrails !== null || snowBaseIn !== null) {
        return { openTrails: openTrails ? parseInt(openTrails) : null,
                 snowBaseIn: snowBaseIn ? parseInt(snowBaseIn) : null };
      }
    }
  } catch (e) {
    console.warn(`[RapidAPI/ski-resort-forecast] ${resort.name} failed:`, e);
  }

  // Try "Ski Resort API" (robwilhelmsson on RapidAPI)
  try {
    const host = 'ski-resort-api.p.rapidapi.com';
    const res = await fetch(
      `https://${host}/resorts?search=${encodeURIComponent(resort.name)}`,
      { headers: { ...headers, 'x-rapidapi-host': host } }
    );
    if (res.ok) {
      const json = await res.json();
      console.log(`[RapidAPI/ski-resort-api] ${resort.name}:`, json);
      const item = Array.isArray(json) ? json[0] : (json?.data?.[0] ?? json);
      const openTrails = item?.openRuns ?? item?.openTrails ?? item?.terrain?.runsTotal ?? null;
      const snowBaseIn = item?.depth?.base ?? item?.baseDepth ?? item?.snowBase ?? null;
      if (openTrails !== null || snowBaseIn !== null) {
        return { openTrails: openTrails ? parseInt(openTrails) : null,
                 snowBaseIn: snowBaseIn ? parseInt(snowBaseIn) : null };
      }
    }
  } catch (e) {
    console.warn(`[RapidAPI/ski-resort-api] ${resort.name} failed:`, e);
  }

  return null; // null = RapidAPI had no data, fall through to CORS proxy
}

// ── CORS proxy list (tried in order) ──────────
const PROXIES = [
  url => ({ url: `https://corsproxy.io/?${encodeURIComponent(url)}`, extract: r => r.text() }),
  url => ({ url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, extract: async r => { const j = await r.json(); if (j.status?.http_code !== 200) throw new Error('bad'); return j.contents ?? ''; } }),
  url => ({ url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, extract: r => r.text() }),
];

// ── SnoCountry feed API (free, state-level queries) ───────────────
// All proxies are raced in parallel per-state; fast success wins.
// &output=json required — without it the API returns XML.
let _snoCache = null; // { normalizedName: { openTrails, snowBaseIn } } | null while loading

const SNO_PROXIES = [
  url => ({ url: url.replace('http://', 'https://'), extract: r => r.text() }), // HTTPS direct (no CORS)
  ...PROXIES,
];

function _snoNormalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

async function _snoFetchItems(apiUrl) {
  // Race all proxies simultaneously — first valid JSON with items wins
  const attempts = SNO_PROXIES.map(async makeProxy => {
    const { url: proxyUrl, extract } = makeProxy(apiUrl);
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(tid);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await extract(res);
    const json = JSON.parse(text); // throws if not JSON
    const items = json?.items ?? (Array.isArray(json) ? json : null);
    if (!items || items.length === 0) throw new Error('empty');
    return items;
  });
  return Promise.any(attempts); // resolves with first success, rejects if all fail
}

function _snoMerge(items) {
  for (const item of items) {
    const name = _snoNormalize(item.resortName ?? '');
    if (!name) continue;
    const baseMax = item.avgBaseDepthMax ? parseInt(item.avgBaseDepthMax) : null;
    const baseMin = item.avgBaseDepthMin ? parseInt(item.avgBaseDepthMin) : null;
    _snoCache[name] = {
      openTrails: item.openDownHillTrails ? parseInt(item.openDownHillTrails) : null,
      snowBaseIn: baseMax ?? baseMin,
    };
  }
}

function loadSnoCountry() {
  if (_snoCache !== null) return Promise.resolve(_snoCache);
  _snoCache = {}; // mark loading started (empty ≠ null)

  const stateQueries = ['vt', 'nh', 'me', 'ma'].map(state => {
    const url = `http://feeds.snocountry.net/getSnowReport.php?apiKey=SnoCountry.example&states=${state}&output=json`;
    return _snoFetchItems(url)
      .then(items => { console.log(`[SnoCountry/${state}] ${items.length} resorts`); _snoMerge(items); })
      .catch(() => console.warn(`[SnoCountry/${state}] all attempts failed`));
  });

  // Also try known individual IDs (demo key: 3 per call)
  const knownIds = RESORTS.filter(r => r.snoId);
  const idQueries = [];
  for (let i = 0; i < knownIds.length; i += 3) {
    const ids = knownIds.slice(i, i + 3).map(r => r.snoId).join(',');
    const url = `http://feeds.snocountry.net/getSnowReport.php?apiKey=SnoCountry.example&ids=${ids}&output=json`;
    idQueries.push(
      _snoFetchItems(url)
        .then(items => { console.log(`[SnoCountry/ids=${ids}] ${items.length} resorts`); _snoMerge(items); })
        .catch(() => {})
    );
  }

  return Promise.allSettled([...stateQueries, ...idQueries])
    .then(() => { console.log('[SnoCountry] done, keys:', Object.keys(_snoCache)); return _snoCache; });
}

// ── Liftie.info API (open-source, free, direct HTTPS) ─────────────
// Returns lift open/closed counts. Used when SnoCountry has no trail data.
async function fetchLiftie(resort) {
  if (!resort.liftie) return null;
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(`https://liftie.info/api/resort/${resort.liftie}`, { signal: controller.signal });
    clearTimeout(tid);
    if (!res.ok) { console.warn(`[Liftie] ${resort.name}: HTTP ${res.status} for slug "${resort.liftie}"`); return null; }
    const json = await res.json();
    console.log(`[Liftie] ${resort.name}:`, json?.lifts?.status);
    const status = json?.lifts?.status ?? {};
    // open + hold counts as "operating"
    const openLifts = (status.open ?? 0) + (status.hold ?? 0);
    const totalLifts = Object.values(status).reduce((a, b) => a + (b || 0), 0);
    if (totalLifts === 0) return null;
    // SnoCountry-compatible shape; mark as lifts so UI can label correctly
    return { openTrails: null, snowBaseIn: null, openLifts, totalLifts };
  } catch { return null; }
}

function lookupSnoCountry(resort) {
  if (!_snoCache) return null;
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const name = normalize(resort.name);
  if (_snoCache[name]) return _snoCache[name];
  // Partial word match
  const words = name.split(' ');
  for (const [key, val] of Object.entries(_snoCache)) {
    if (words.every(w => key.includes(w)) || key.split(' ').every(w => name.includes(w))) {
      return val;
    }
  }
  return null;
}

// ── Resort conditions fetch (SnoCountry → Liftie → RapidAPI → CORS scrape) ──
async function fetchResortConditions(resort, snoReady) {
  // 1. SnoCountry — wait for cache, but cap at 6s so Liftie can still run
  const timeout = new Promise(r => setTimeout(r, 6000));
  await Promise.race([snoReady, timeout]);
  const sno = lookupSnoCountry(resort);
  if (sno && (sno.openTrails !== null || sno.snowBaseIn !== null)) return sno;

  // 2. Liftie (direct HTTPS, no proxy, covers many Indy Pass resorts)
  const liftie = await fetchLiftie(resort);
  if (liftie !== null) return liftie;

  // 3. RapidAPI fallback
  const rapidResult = await fetchRapidAPI(resort);
  if (rapidResult !== null) return rapidResult;

  // 4. CORS proxy HTML scraping
  if (!resort.conditionsUrl) return { openTrails: null, snowBaseIn: null, openLifts: null, totalLifts: null };
  for (const makeProxy of PROXIES) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      const { url: proxyUrl, extract } = makeProxy(resort.conditionsUrl);
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(tid);
      if (!res.ok) continue;
      const html = await extract(res);
      const result = parseConditions(html);
      if (result.openTrails !== null || result.snowBaseIn !== null) return result;
    } catch { continue; }
  }
  return { openTrails: null, snowBaseIn: null, openLifts: null, totalLifts: null };
}

// ── Parse snow base & open trails from HTML ───
function parseConditions(html) {
  // Strip tags and normalize whitespace for text matching
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8220;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');

  let openTrails = null;
  let snowBaseIn = null;

  // Open trails patterns
  const trailPatterns = [
    /(\d+)\s*(?:of\s*\d+\s*)?trails?\s*open/i,
    /open\s*(?:trails?|runs?)[:\s]+(\d+)/i,
    /trails?\s*open[:\s]+(\d+)/i,
    /(\d+)\s*runs?\s*open/i,
    /(\d+)\s*open\s*trails?/i,
    /trails?\s*:\s*(\d+)/i,
    /"openTrails"\s*:\s*(\d+)/i,
    /"trails_open"\s*:\s*(\d+)/i,
    /"open"\s*:\s*(\d+)/i,
    /(\d+)\s*(?:trails?|runs?)\s*(?:are\s*)?(?:currently\s*)?open/i,
  ];
  for (const pat of trailPatterns) {
    const m = text.match(pat);
    if (m) { openTrails = parseInt(m[1]); break; }
  }

  // Snow base patterns (inches)
  const basePatterns = [
    /base\s*(?:depth)?[^a-z]{0,5}(\d+)\s*(?:"|inches?|in\b)/i,
    /(\d+)\s*["""]\s*(?:base|snow\s*base)/i,
    /base[:\s–\-]+(\d+)["""]/i,
    /snow\s*(?:base|depth)[:\s–\-]+(\d+)/i,
    /base\s*depth[:\s–\-]+(\d+)/i,
    /"snowBase"\s*:\s*"?(\d+)/i,
    /"base_depth"\s*:\s*"?(\d+)/i,
    /"baseDepth"\s*:\s*"?(\d+)/i,
    /base\s*(?:condition)?[:\s]+(\d+)['""]?\s*(?:in|inches|")/i,
  ];
  for (const pat of basePatterns) {
    const m = text.match(pat);
    if (m) {
      const val = parseInt(m[1]);
      if (val > 0 && val <= 250) { snowBaseIn = val; break; }
    }
  }

  return { openTrails, snowBaseIn };
}

// ── Card status helper ────────────────────────
function cardStatus(baseInches) {
  if (baseInches === null) return 'status-low';
  if (baseInches >= 24) return 'status-good';
  if (baseInches >= 6)  return 'status-fair';
  return 'status-low';
}

// ── Build skeleton card while loading ─────────
function buildSkeletonCard(resort) {
  const card = document.createElement('div');
  card.className = 'card loading';
  card.dataset.state = resort.state;
  card.id = `card-${resort.name.replace(/\s+/g, '-')}`;
  card.innerHTML = `
    <div class="card-header">
      <span class="resort-name">${resort.name}</span>
      <span class="state-badge">${resort.state}</span>
    </div>
    <div class="stats">
      <div class="stat">
        <div class="stat-label">Snow Base</div>
        <div class="skeleton" style="height:28px;width:80px;margin-top:4px;"></div>
      </div>
      <div class="stat">
        <div class="stat-label">Open Trails</div>
        <div class="skeleton" style="height:28px;width:80px;margin-top:4px;"></div>
      </div>
    </div>
    <div class="forecast">
      <div class="forecast-title">7-Day Snowfall Forecast</div>
      <div class="skeleton" style="height:60px;"></div>
    </div>
    <div class="card-footer">
      <a class="resort-link" href="${resort.url}" target="_blank" rel="noopener">View Resort →</a>
    </div>
  `;
  return card;
}

// ── Build forecast bar chart ──────────────────
function buildForecast(forecast, dates) {
  const maxVal = Math.max(...forecast, 1); // avoid division by zero

  const days = forecast.map((inches, i) => {
    const date = dates[i] ? new Date(dates[i] + 'T12:00:00') : null;
    const label = date ? DAY_LABELS[date.getDay()] : '—';
    const heightPct = Math.round((inches / maxVal) * 100);
    const isSignificant = inches >= 3;
    return `
      <div class="day">
        <div class="day-label">${label}</div>
        <div class="bar-wrap">
          <div class="bar ${isSignificant ? 'significant' : ''}" style="height:${Math.max(heightPct, 8)}%"></div>
        </div>
        <div class="day-inches">${inches > 0 ? inches + '"' : '—'}</div>
      </div>
    `;
  });

  return days.join('');
}

// ── Populate card with real data ──────────────
function populateCard(resort, weatherData, conditionsData) {
  const card = document.getElementById(`card-${resort.name.replace(/\s+/g, '-')}`);
  if (!card) return;

  const { baseInches, forecast, dates } = weatherData;
  const { openTrails = null, snowBaseIn = null, openLifts = null, totalLifts = null } = conditionsData || {};

  // Use resort-reported base if available, fall back to Open-Meteo snow_depth estimate.
  const liveBase = snowBaseIn;
  const estBase  = baseInches;
  const displayBase = liveBase ?? estBase;
  card.className = `card ${cardStatus(displayBase)}`;

  let baseDisplay;
  if (liveBase !== null) {
    baseDisplay = `<span class="stat-value">${liveBase}</span><span class="stat-unit">in</span>`;
  } else if (estBase !== null) {
    baseDisplay = `<span class="stat-value">${estBase}</span><span class="stat-unit">in <span class="est-label">est.</span></span>`;
  } else {
    baseDisplay = `<span class="stat-value na">No data</span>`;
  }

  // Show trails if available, lifts if not, otherwise "?"
  let trailsDisplay;
  if (openTrails !== null) {
    trailsDisplay = `<span class="stat-value">${openTrails}</span><span class="stat-unit">/${resort.totalTrails} trails</span>`;
  } else if (openLifts !== null) {
    trailsDisplay = `<span class="stat-value">${openLifts}</span><span class="stat-unit">/${totalLifts} lifts</span>`;
  } else {
    trailsDisplay = `<span class="stat-value na">?</span><span class="stat-unit">/${resort.totalTrails} trails</span>`;
  }

  card.innerHTML = `
    <div class="card-header">
      <span class="resort-name">${resort.name}</span>
      <span class="state-badge">${resort.state}</span>
    </div>
    <div class="stats">
      <div class="stat">
        <div class="stat-label">Snow Base</div>
        <div>${baseDisplay}</div>
      </div>
      <div class="stat">
        <div class="stat-label">${openTrails !== null ? 'Open Trails' : openLifts !== null ? 'Open Lifts' : 'Open Trails'}</div>
        <div>${trailsDisplay}</div>
      </div>
    </div>
    <div class="forecast">
      <div class="forecast-title">7-Day Snowfall Forecast</div>
      <div class="forecast-days">
        ${buildForecast(forecast, dates)}
      </div>
    </div>
    <div class="card-footer">
      <a class="resort-link" href="${resort.url}" target="_blank" rel="noopener">View Resort →</a>
    </div>
  `;
}

// ── Mark card as error ────────────────────────
function errorCard(resort) {
  const card = document.getElementById(`card-${resort.name.replace(/\s+/g, '-')}`);
  if (!card) return;
  card.className = 'card status-low';
  card.innerHTML = `
    <div class="card-header">
      <span class="resort-name">${resort.name}</span>
      <span class="state-badge">${resort.state}</span>
    </div>
    <p style="font-size:0.8rem;color:var(--text-muted);padding:0.5rem 0">
      Could not load conditions. Try refreshing.
    </p>
    <div class="card-footer">
      <a class="resort-link" href="${resort.url}" target="_blank" rel="noopener">View Resort →</a>
    </div>
  `;
}

// ── State filter tabs ─────────────────────────
function applyFilter(state) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.state === state);
  });
  document.querySelectorAll('.card').forEach(card => {
    const match = state === 'all' || card.dataset.state === state;
    card.style.display = match ? '' : 'none';
  });
}

// ── Main ──────────────────────────────────────
async function init() {
  const grid = document.getElementById('resort-grid');
  const updatedEl = document.getElementById('last-updated');

  // Render skeleton cards immediately
  RESORTS.forEach(resort => grid.appendChild(buildSkeletonCard(resort)));

  // Wire up filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.state));
  });

  // Start SnoCountry loading in background — don't block card rendering
  const snoReady = loadSnoCountry();

  // Fetch + render each card as soon as its data arrives (progressive)
  await Promise.all(
    RESORTS.map(async resort => {
      const [weatherResult, conditionsResult] = await Promise.allSettled([
        fetchWeather(resort),
        fetchResortConditions(resort, snoReady),
      ]);

      const conditionsData = conditionsResult.status === 'fulfilled'
        ? conditionsResult.value
        : { openTrails: null, snowBaseIn: null, openLifts: null, totalLifts: null };

      if (weatherResult.status === 'fulfilled') {
        populateCard(resort, weatherResult.value, conditionsData);
      } else {
        errorCard(resort);
      }
    })
  );

  // Update timestamp after all cards rendered
  updatedEl.textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });
}

init();
