// ─────────────────────────────────────────────
//  Indy Pass Northeast Ski Conditions Dashboard
// ─────────────────────────────────────────────

const RESORTS = [
  // Vermont
  { name: 'Bolton Valley',    state: 'VT', lat: 44.4186, lon: -72.8722, url: 'https://www.boltonvalley.com' },
  { name: 'Burke Mountain',   state: 'VT', lat: 44.5895, lon: -71.9007, url: 'https://www.skiburke.com' },
  { name: 'Jay Peak',         state: 'VT', lat: 44.9280, lon: -72.5235, url: 'https://jaypeakresort.com' },
  { name: 'Magic Mountain',   state: 'VT', lat: 43.3528, lon: -72.8331, url: 'https://www.skimagic.com' },
  { name: 'Saskadena Six',    state: 'VT', lat: 43.9159, lon: -72.5668, url: 'https://www.saskadena6.com' },

  // New Hampshire
  { name: 'Black Mountain',   state: 'NH', lat: 44.1520, lon: -71.1990, url: 'https://www.blackmt.com' },
  { name: 'Cannon Mountain',  state: 'NH', lat: 44.1541, lon: -71.6925, url: 'https://www.cannonmt.com' },
  { name: 'Dartmouth Skiway', state: 'NH', lat: 43.8167, lon: -72.0656, url: 'https://skiway.dartmouth.edu' },
  { name: 'Pats Peak',        state: 'NH', lat: 43.1568, lon: -71.7548, url: 'https://www.patspeak.com' },
  { name: 'Tenney Mountain',  state: 'NH', lat: 43.8100, lon: -71.8500, url: 'https://www.tenneymtn.com' },
  { name: 'Waterville Valley',state: 'NH', lat: 43.9700, lon: -71.5100, url: 'https://www.waterville.com' },

  // Maine
  { name: 'Big Moose Mountain', state: 'ME', lat: 45.5400, lon: -69.8700, url: 'https://bigmoosemtn.com' },
  { name: 'Big Rock',           state: 'ME', lat: 46.8900, lon: -68.1300, url: 'https://www.bigrockmaine.com' },
  { name: 'Camden Snow Bowl',   state: 'ME', lat: 44.2240, lon: -69.0880, url: 'https://camdensnowbowl.com' },
  { name: 'Mt. Abram',          state: 'ME', lat: 44.5900, lon: -70.6800, url: 'https://www.mtabram.com' },

  // Massachusetts
  { name: 'Berkshire East',   state: 'MA', lat: 42.5432, lon: -72.9151, url: 'https://www.berkshireeast.com' },
  { name: 'Bousquet Mountain',state: 'MA', lat: 42.4500, lon: -73.2800, url: 'https://www.bousquets.com' },
  { name: 'Catamount',        state: 'MA', lat: 42.1273, lon: -73.4440, url: 'https://www.catamountski.com' },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Open-Meteo fetch ──────────────────────────
async function fetchWeather(resort) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${resort.lat}&longitude=${resort.lon}` +
    `&current=snow_depth` +
    `&daily=snowfall_sum` +
    `&forecast_days=7` +
    `&precipitation_unit=inch` +
    `&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  // snow_depth is always in meters from Open-Meteo → convert to inches
  const rawDepth = data.current?.snow_depth ?? null;
  const baseInches = rawDepth !== null ? Math.round(rawDepth * 39.37) : null;

  // snowfall_sum is in inches (we requested precipitation_unit=inch)
  const forecast = (data.daily?.snowfall_sum ?? []).map(v =>
    v !== null ? Math.round(v * 10) / 10 : 0
  );
  const dates = data.daily?.time ?? [];

  return { baseInches, forecast, dates };
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
function populateCard(resort, weatherData) {
  const card = document.getElementById(`card-${resort.name.replace(/\s+/g, '-')}`);
  if (!card) return;

  const { baseInches, forecast, dates } = weatherData;

  card.className = `card ${cardStatus(baseInches)}`;

  const baseDisplay = baseInches !== null
    ? `<span class="stat-value">${baseInches}</span><span class="stat-unit">in</span>`
    : `<span class="stat-value na">No data</span>`;

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
        <div class="stat-label">Open Trails</div>
        <div class="stat-value na">See resort →</div>
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
  RESORTS.forEach(resort => {
    grid.appendChild(buildSkeletonCard(resort));
  });

  // Wire up filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.state));
  });

  // Fetch all resorts in parallel
  const results = await Promise.allSettled(
    RESORTS.map(resort => fetchWeather(resort))
  );

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      populateCard(RESORTS[i], result.value);
    } else {
      errorCard(RESORTS[i]);
    }
  });

  // Update timestamp
  updatedEl.textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });
}

init();
