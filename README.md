# Earth Analog Explorer

NASA Space Apps-inspired educational mission-control dashboard for exploring terrestrial Moon/Mars analog candidates. **Not affiliated with or endorsed by NASA.** The initial five sites are curated candidate regions, not validated planetary equivalents.

## Quick start (Mac / Windows / Linux)

Requires Node.js 20+ (Node 22 recommended). No Python or rasterio is needed for the main application.

```bash
npm install
npm run dev
```

Open http://localhost:5173. Run `npm test`, `npm run build`, and `npm run lint` for quality checks.

## Optional FIRMS proxy

FIRMS requires a free MAP_KEY from https://firms.modaps.eosdis.nasa.gov/api/. The key **must not** be placed in browser code.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r server/requirements.txt
export FIRMS_MAP_KEY='YOUR_PRIVATE_MAP_KEY'
uvicorn server.main:app --port 8000
```

Keep the backend running in another terminal alongside Vite. `.env.example` documents the variable name; do not commit secrets.

## Features

- Responsive dark mission-control dashboard with functional routes (Home, Explore, Compare, NASA Data, Learn)
- Leaflet interactive map with five approximate regional coordinates and marker selection
- Moon/Mars profiles, six weighted criteria, sortable ranked cards and comparison table
- Real NASA POWER daily air temperature (°C), solar irradiation (kWh/m²/day), precipitation (mm/day) via on-demand API
- NASA GIBS MODIS Terra browse imagery as optional real map tiles; NASA Worldview links
- NASA Earthdata CMR live collection metadata search with pagination
- NASA Open Data catalog discovery link, not a fabricated numeric API
- Optional server-side NASA FIRMS active-fire CSV proxy (VIIRS SNPP NRT)
- Explicit qualitative evidence and coverage; unavailable measurements remain unavailable

## Data sources

| Source | Data type | App use | Access | Authentication | Limitations |
|---|---|---|---|---|---|
| [NASA POWER](https://power.larc.nasa.gov/docs/services/api/) | Daily climate/solar | On-demand chart | Public point API | None | Gridded data; not field measurements; some polar coordinates/dates may be unavailable |
| [NASA GIBS](https://www.earthdata.nasa.gov/data/tools/gibs) | Browse imagery | Optional Leaflet tile layer | Public WMTS | None | Layer/date coverage varies; imagery is not quantitative |
| [NASA Earthdata CMR](https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html) | Collection metadata | Live discovery search | Public collections JSON | None for search; downloads may require login | Metadata is not measured values; browser CORS may depend on service policy |
| [NASA Open Data](https://data.nasa.gov/) | Dataset catalog | Official keyword discovery link | External portal | Usually none for browsing | Dataset APIs differ by dataset |
| [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/api/) | Satellite thermal anomalies | Optional proxy | Area CSV VIIRS SNPP NRT | MAP_KEY server-side | Detections not confirmed fires; not planetary radiation; recent product availability varies |

## Scientific interpretation

`score = 100 × Σ(weight × suitability) / Σ(weights for criteria with evidence)`.

Weights can be edited per criterion and are effectively normalized by the denominator. Coverage is the sum of weights with evidence divided by total enabled nonzero weights. All current suitability inputs are **explicitly curated qualitative educational judgments** (not measured NASA Earth-to-Mars physical similarity). No direct physical temperature or solar similarity is scored because target-world reference values, comparable measurement definitions, and validated mappings are not included. NASA POWER measurements are shown separately. Scores must not be used for actual landing-site selection.

The Moon has no Earth-like atmosphere, and Mars has different gravity, pressure, radiation, temperature and insolation. Terrestrial basalt is not lunar regolith. Water-related field research is not evidence of extractable lunar or Martian water. FIRMS is contextual and not automatically included in a planetary environmental hazard metric.

## Site selection and attribution

Candidate regions: McMurdo Dry Valleys, Atacama, Mauna Loa, Icelandic Highlands and Mojave Desert. Representative regional coordinates are approximate; verify a particular field station before travel or science work. Source links are included per site. OpenStreetMap tiles require attribution and network connectivity. NASA imagery/data use remains subject to applicable NASA and third-party data policies. No copyrighted location photographs are bundled; the site hero is a decorative gradient.

## Demo workflow

1. Open Home, choose Mars and Cold arid terrain.
2. Toggle criteria and edit weights, then select Find Analog Locations.
3. Select a map marker, review qualitative evidence and missing criteria.
4. Open Explore Map, choose a January 2025 period, click Fetch NASA data.
5. Enable NASA GIBS imagery and choose an observation date.
6. Compare two or three regions; open NASA Data Explorer and search CMR metadata.
7. Optionally start the FIRMS proxy with a private key and check detections.

## Known limitations / future extensions

- The uploaded prompt included no original repository or reference screenshot; this is a standalone implementation guided by its written design specifications.
- Live APIs and imagery require internet connectivity and may fail due to CORS, outages, polar coverage, or rate limits. The UI reports failures rather than fabricating results.
- FIRMS needs the optional backend and user-supplied key; no key is shipped.
- Site imagery uses a generic decorative panel, not verified site photography.
- Comparisons do not yet synchronize and graph multiple POWER time series; retrieve measurements individually on Explore.
- NASA Open Data is a verified catalog link, not an in-app dataset metadata ingestion adapter.
- Qualitative suitability ratings are illustrative judgments and not independently peer-reviewed scientific scores.
- Add new candidates in `src/data/sites.ts`, with source links and explicitly supported qualitative evidence. Extend `src/services/` for additional verified measurement APIs.
