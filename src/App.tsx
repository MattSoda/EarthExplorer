import { useMemo, useRef, useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  GitCompareArrows,
  Database,
  BookOpen,
  Orbit,
  ExternalLink,
} from "lucide-react";
import { sites } from "./data/sites";
import { criteria, profiles, rankSites } from "./utils/scoring";
import type { Criterion, Site, World } from "./types";
import { AnalogMap } from "./components/AnalogMap";
import { ClimatePanel } from "./components/ClimatePanel";
import { FirmsPanel } from "./components/FirmsPanel";
import { DataPage } from "./pages/DataPage";
import { LearnPage } from "./pages/LearnPage";
import { worldviewUrl } from "./services/nasaGibsService";
import { SitePhoto } from "./components/SitePhoto";
const links = [
  ["/", "Home", LayoutDashboard],
  ["/explore", "Explore Map", Map],
  ["/compare", "Compare Locations", GitCompareArrows],
  ["/data", "NASA Data Explorer", Database],
  ["/learn", "Learn", BookOpen],
] as const;
function Dashboard({ view }: { view: "home" | "explore" | "compare" }) {
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLElement>(null);
  const [world, setWorld] = useState<World>("Mars"),
    [focus, setFocus] = useState("General Martian environment"),
    [enabled, setEnabled] = useState<Criterion[]>([
      "terrain",
      "water",
      "geology",
      "hazards",
    ]),
    [weights, setWeights] = useState<Record<Criterion, number>>(
      profiles.Mars["General Martian environment"],
    ),
    [selected, setSelected] = useState<Site>(sites[1]),
    [compare, setCompare] = useState<string[]>(["atacama", "dry-valleys"]),
    [sort, setSort] = useState("score"),
    [mode, setMode] = useState<"demo" | "real">("demo"),
    [imagery, setImagery] = useState(false),
    [date, setDate] = useState("2025-01-15");
  const ranked = useMemo(
    () => rankSites(sites, world, weights, enabled),
    [world, weights, enabled],
  );
  const sorted = [...ranked].sort((a, b) =>
    sort === "name"
      ? a.site.name.localeCompare(b.site.name)
      : sort === "coverage"
        ? b.result.coverage - a.result.coverage
        : sort === "terrain"
          ? (b.result.parts.terrain?.value ?? -1) -
            (a.result.parts.terrain?.value ?? -1)
          : sort === "temperature"
            ? (b.result.parts.temperature?.value ?? -1) -
              (a.result.parts.temperature?.value ?? -1)
            : (b.result.score ?? -1) - (a.result.score ?? -1),
  );
  const current = ranked.find((x) => x.site.id === selected.id)!.result;
  function switchWorld(w: World) {
    setWorld(w);
    const f = Object.keys(profiles[w])[0];
    setFocus(f);
    setWeights({ ...profiles[w][f] });
  }
  function switchFocus(f: string) {
    setFocus(f);
    setWeights({ ...profiles[world][f] });
  }
  function toggle(c: Criterion) {
    setEnabled((a) => (a.includes(c) ? a.filter((x) => x !== c) : [...a, c]));
  }
  function toggleCompare(id: string) {
    setCompare((a) =>
      a.includes(id)
        ? a.filter((x) => x !== id)
        : a.length < 3
          ? [...a, id]
          : [...a.slice(1), id],
    );
  }
  function findMatches() {
    if (!enabled.some((criterion) => weights[criterion] > 0)) return;
    const scrollToResults = () => {
      if (resultsRef.current) {
        const topOffset = window.matchMedia("(max-width: 700px)").matches
          ? 154
          : 92;
        const targetTop =
          window.scrollY +
          resultsRef.current.getBoundingClientRect().top -
          topOffset;
        window.scrollTo({ top: targetTop, behavior: "smooth" });
      }
    };
    if (sorted[0]) {
      setSelected(sorted[0].site);
      requestAnimationFrame(() => requestAnimationFrame(scrollToResults));
    } else {
      scrollToResults();
    }
  }
  return (
    <>
      <div className="page-head">
        <div>
          <h2>
            {view === "compare"
              ? "Compare analog locations"
              : view === "explore"
                ? "Explore Earth analog sites"
                : "Mission overview"}
          </h2>
          <p>
            Explore candidate Earth environments for Moon and Mars mission
            preparation.
          </p>
        </div>
        <div className="mode">
          <button
            className={mode === "demo" ? "active" : ""}
            onClick={() => setMode("demo")}
          >
            Demo
          </button>
          <button
            className={mode === "real" ? "active" : ""}
            onClick={() => setMode("real")}
          >
            Real data
          </button>
        </div>
      </div>
      <section className="panel filter-panel">
        <div className="filter-row">
          <div>
            <label className="eyebrow">TARGET WORLD</label>
            <div className="segmented">
              <button
                className={world === "Moon" ? "active" : ""}
                onClick={() => switchWorld("Moon")}
              >
                ☾ Moon
              </button>
              <button
                className={world === "Mars" ? "active" : ""}
                onClick={() => switchWorld("Mars")}
              >
                ◉ Mars
              </button>
            </div>
          </div>
          <div className="grow">
            <label className="eyebrow" htmlFor="focus">
              MISSION FOCUS
            </label>
            <select
              id="focus"
              value={focus}
              onChange={(e) => switchFocus(e.target.value)}
            >
              {Object.keys(profiles[world]).map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <button
            className="primary"
            onClick={findMatches}
            disabled={!enabled.some((criterion) => weights[criterion] > 0)}
          >
            ⌕ Show Best Matches
          </button>
        </div>
        <div className="criterion-row">
          <span className="eyebrow">KEY CRITERIA</span>
          {criteria.map((c) => (
            <label key={c} className="check">
              <input
                type="checkbox"
                checked={enabled.includes(c)}
                onChange={() => toggle(c)}
              />
              {c[0].toUpperCase() + c.slice(1)}{" "}
            </label>
          ))}
        </div>
        <details className="advanced-weights">
          <summary>Adjust scoring weights</summary>
          <div className="weight-grid">
            {criteria.map((criterion) => (
              <label key={criterion}>
                {criterion[0].toUpperCase() + criterion.slice(1)}
                <input
                  aria-label={`${criterion} weight`}
                  type="number"
                  min="0"
                  max="10"
                  value={weights[criterion]}
                  onChange={(event) =>
                    setWeights((currentWeights) => ({
                      ...currentWeights,
                      [criterion]: Math.min(
                        10,
                        Math.max(0, Number(event.target.value)),
                      ),
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </details>
      </section>
      {view !== "compare" && (
        <div className="hero-grid">
          <section className="panel map-panel">
            <div className="section-title">
              <h3>Global analog map</h3>
              <span className="chip">{sites.length} curated candidates</span>
            </div>
            <div className="controls compact">
              <label>
                <input
                  type="checkbox"
                  checked={imagery}
                  onChange={(e) => setImagery(e.target.checked)}
                />{" "}
                NASA GIBS imagery
              </label>
              {imagery && (
                <label>
                  Observation date{" "}
                  <input
                    type="date"
                    value={date}
                    max="2026-10-01"
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
              )}
            </div>
            <AnalogMap
              sites={sites}
              selected={selected}
              onSelect={setSelected}
              imagery={imagery}
              date={date}
            />
          </section>
          <section className="panel details">
            <div className="section-title">
              <h3>Selected analog site</h3>
              <span className="chip">Candidate • curated</span>
            </div>
            <SitePhoto site={selected} variant="feature" />
            <h2>{selected.name}</h2>
            <p className="muted">
              {selected.region}, {selected.country} • {selected.lat.toFixed(3)}
              °, {selected.lon.toFixed(3)}°
            </p>
            <p>{selected.description}</p>
            <div className="metrics">
              <div>
                <b>{current.score === null ? "N/A" : `${current.score}%`}</b>
                <small>Field suitability index</small>
              </div>
              <div>
                <b>{current.coverage}%</b>
                <small>Evidence coverage</small>
              </div>
              <div>
                <b>{selected.worlds.join(" / ")}</b>
                <small>Relevant worlds</small>
              </div>
            </div>
            <h4>Why this candidate?</h4>
            {Object.entries(current.parts).map(([k, v]) => (
              <p className="evidence" key={k}>
                <b>{k}</b> — {v.explanation}
              </p>
            ))}
            {current.missing.length > 0 && (
              <p className="muted small">
                Not evaluated: {current.missing.join(", ")}.
              </p>
            )}
            <h4>Known limitations</h4>
            <p className="muted small">{selected.limitations.join(" • ")}</p>
            <div className="controls">
              <button onClick={() => navigate("/explore")}>
                View full details
              </button>
              <a
                href={worldviewUrl(selected.lat, selected.lon)}
                target="_blank"
                rel="noreferrer"
              >
                NASA Worldview <ExternalLink size={13} />
              </a>
            </div>
          </section>
        </div>
      )}
      {view !== "compare" && (
        <section className="panel ranked-panel" ref={resultsRef}>
          <div className="section-title">
            <h3>Best matching locations</h3>
            <label>
              Sort{" "}
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="score">Suitability score</option>
                <option value="terrain">Terrain</option>
                <option value="temperature">Temperature</option>
                <option value="coverage">Evidence coverage</option>
                <option value="name">Site name</option>
              </select>
            </label>
          </div>
          <p className="muted small">
            Scores are educational, qualitative operational suitability
            estimates — not validated Moon/Mars physical similarity. Missing
            criteria are excluded.
          </p>
          <div className="cards">
            {sorted.map(({ site, result }, i) => (
              <article
                key={site.id}
                className={
                  "analog-card " + (selected.id === site.id ? "chosen" : "")
                }
              >
                <span className="eyebrow">
                  #{i + 1} • {site.country}
                </span>
                <h3>{site.name}</h3>
                <SitePhoto site={site} variant="thumbnail" />
                <div className="score-line">
                  <strong>
                    {result.score === null
                      ? "Insufficient data"
                      : `${result.score}%`}
                  </strong>
                  <small>{result.coverage}% evidence</small>
                </div>
                <div className="bar">
                  <div style={{ width: `${result.score ?? 0}%` }} />
                </div>
                <button onClick={() => setSelected(site)}>
                  View details →
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="panel">
        <div className="section-title">
          <h3>Location comparison</h3>
          <span className="chip">Choose 2–3 locations</span>
        </div>
        <div className="controls">
          {sites.map((s) => (
            <label className="check" key={s.id}>
              <input
                type="checkbox"
                checked={compare.includes(s.id)}
                onChange={() => toggleCompare(s.id)}
              />
              {s.name}
            </label>
          ))}
        </div>
        {compare.length < 2 ? (
          <p className="warning">Select at least two locations to compare.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Characteristic</th>
                  {compare.map((id) => (
                    <th key={id}>{sites.find((s) => s.id === id)?.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Region", (s: Site) => `${s.region}, ${s.country}`],
                  ["Coordinates", (s: Site) => `${s.lat}, ${s.lon}`],
                  ["Terrain", (s: Site) => s.terrain],
                  ["Field research", (s: Site) => s.experiments.join("; ")],
                  ["Known limitations", (s: Site) => s.limitations.join("; ")],
                  [
                    "Suitability index",
                    (s: Site) => {
                      const r = ranked.find((r) => r.site.id === s.id)!.result;
                      return r.score === null
                        ? "Insufficient data"
                        : `${r.score}% (coverage ${r.coverage}%)`;
                    },
                  ],
                  [
                    "Temperature",
                    (s: Site) =>
                      `${s.name}: Unavailable until NASA POWER retrieval`,
                  ],
                  [
                    "Solar energy",
                    () => "Unavailable until NASA POWER retrieval",
                  ],
                ].map(([label, fn]) => (
                  <tr key={label as string}>
                    <th>{label as string}</th>
                    {compare.map((id) => (
                      <td key={id}>
                        {(fn as (s: Site) => string)(
                          sites.find((s) => s.id === id)!,
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="muted small">
          <b>Why these locations?</b> Each supports different terrain, geology
          or operations tests. Qualitative evidence and missing quantitative
          observations limit direct comparisons. Climate periods must be aligned
          before quantitative comparisons.
        </p>
      </section>
      {view === "explore" && (
        <>
          <ClimatePanel site={selected} mode={mode} />
          <FirmsPanel site={selected} />
          <section className="panel">
            <h3>Sources for {selected.name}</h3>
            {selected.sources.map((u) => (
              <p key={u}>
                <a href={u} target="_blank" rel="noreferrer">
                  {u} ↗
                </a>
              </p>
            ))}
          </section>
        </>
      )}
    </>
  );
}
export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="brand-icon">
          <Orbit size={28} />
        </div>
        <div>
          <h1>Earth Analog Explorer</h1>
          <p>Find real places on Earth that resemble the Moon and Mars</p>
        </div>
        <div className="tagline">
          Real environments. Real data. A closer look at other worlds.{" "}
          <span>☾ &nbsp; 🔴</span>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <div className="nav-title">MISSION CONTROL</div>
          <nav>
            {links.map(([to, name, Icon]) => (
              <NavLink key={to} to={to} end={to === "/"}>
                <Icon size={18} />
                {name}
              </NavLink>
            ))}
          </nav>
          <div className="side-bottom">
            <span className="dot" /> Scientific exploration tool{" "}
            <p>Not an official NASA site-selection system.</p>
          </div>
        </aside>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard view="home" />} />
            <Route path="/explore" element={<Dashboard view="explore" />} />
            <Route path="/compare" element={<Dashboard view="compare" />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="*" element={<Dashboard view="home" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
