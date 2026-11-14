
import { useEffect, useState } from "react";
import ResearchMonitoring from "./components/ResearchMonitoring";
import {
  getSystemHealth,
  getCardiovascularData,
  getSleepFatigueData,
  getRadiationData
} from "./services/api";

import HumanBody3D from "./components/HumanBody3D";
import BoneHealthDashboard from "./components/BoneHealthDashboard";
import DXAUpload from "./components/DXAUpload";

function MetricCard({ title, value, unit, description, status }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span>{title}</span>
        <span className="metric-dot"></span>
      </div>
      <div className="metric-value">
        {value}<small>{unit}</small>
      </div>
      <p>{description}</p>
      <span className="status-label">{status}</span>
    </div>
  );
}


function DataTable({ headers, children }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}


const DEMO_ACCOUNTS = [
  {
    username: "astro01",
    password: "Astra01Demo",
    name: "ASTRONAUT_01",
    role: "astronaut"
  },
  {
    username: "astro02",
    password: "Astra02Demo",
    name: "ASTRONAUT_02",
    role: "astronaut"
  },
  {
    username: "astro03",
    password: "Astra03Demo",
    name: "ASTRONAUT_03",
    role: "astronaut"
  },
  {
    username: "mission",
    password: "MissionDemo",
    name: "MISSION CONTROL",
    role: "admin"
  }
];

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    const account = DEMO_ACCOUNTS.find(
      user =>
        user.username === username.trim().toLowerCase() &&
        user.password === password
    );

    if (!account) {
      setLoginError("Invalid username or password.");
      return;
    }

    setLoginError("");
    onLogin(account);
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-logo">✦</div>

        <span className="eyebrow">ASTRONAUT HEALTH MONITORING</span>

        <h1>ASTRA HEALTH</h1>

        <p className="login-description">
          Secure Mission Access
        </p>

        <label htmlFor="username">Username</label>

        <input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>

        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {loginError && (
          <p className="login-error">{loginError}</p>
        )}

        <button type="submit">
          ACCESS DASHBOARD →
        </button>

        <p className="login-footer">
          MISSION CONTROL SYSTEM · DEMO VERSION
        </p>
      </form>
    </div>
  );
}

function LineChart({ title, points, unit }) {
  const colors = ["#4ee0ce", "#65a7ff", "#c18aff"];

  const groups = {};

  points.forEach(point => {
    const value = Number(point.value);

    if (!Number.isFinite(value)) return;

    if (!groups[point.astronaut]) {
      groups[point.astronaut] = [];
    }

    groups[point.astronaut].push({
      ...point,
      value
    });
  });

  const series = Object.entries(groups).map(([name, items]) => ({
    name,
    items: items.sort(
      (a, b) => new Date(a.time) - new Date(b.time)
    )
  }));

  const values = series.flatMap(s =>
    s.items.map(item => item.value)
  );

  if (values.length === 0) {
    return (
      <div className="chart-card">
        <h3>{title}</h3>
        <p>No data available for this chart.</p>
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 700;
  const height = 230;
  const left = 48;
  const right = 20;
  const top = 20;
  const bottom = 35;

  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  return (
    <div className="chart-card">
      <h3>{title}</h3>

      <div className="chart-unit">{unit}</div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="line-chart"
        role="img"
        aria-label={title}
      >
        {[0, 1, 2, 3, 4].map(index => {
          const y = top + (chartHeight / 4) * index;
          const label = max - (range / 4) * index;

          return (
            <g key={index}>
              <line
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
                stroke="#294357"
                strokeDasharray="4 5"
              />
              <text
                x={left - 8}
                y={y + 4}
                textAnchor="end"
                fill="#91aabd"
                fontSize="11"
              >
                {label.toFixed(1)}
              </text>
            </g>
          );
        })}

        {series.map((s, index) => {
          const color = colors[index % colors.length];

          const coordinates = s.items.map((item, pointIndex) => {
            const x =
              left +
              (s.items.length === 1
                ? chartWidth / 2
                : (pointIndex / (s.items.length - 1)) * chartWidth);

            const y =
              top +
              ((max - item.value) / range) * chartHeight;

            return { x, y, value: item.value };
          });

          return (
            <g key={s.name}>
              {coordinates.length > 1 && (
                <polyline
                  points={coordinates
                    .map(point => `${point.x},${point.y}`)
                    .join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {coordinates.map((point, pointIndex) => (
                <circle
                  key={pointIndex}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={color}
                />
              ))}
            </g>
          );
        })}
      </svg>

      <div className="chart-legend">
        {series.map((s, index) => (
          <span key={s.name}>
            <i
              style={{
                background: colors[index % colors.length]
              }}
            />
            {s.name}
          </span>
        ))}
      </div>

      <div className="chart-axis-label">
        Earlier measurements → Latest measurements
      </div>
    </div>
  );
}

function App() {
  const [systemStatus, setSystemStatus] = useState("CONNECTING");
  const [cardio, setCardio] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [radiation, setRadiation] = useState(null);
  const [error, setError] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const results = await Promise.all([
          getSystemHealth(),
          getCardiovascularData(),
          getSleepFatigueData(),
          getRadiationData()
        ]);

        setSystemStatus(results[0].status);
        setCardio(results[1]);
        setSleep(results[2]);
        setRadiation(results[3]);
      } catch (err) {
        console.error(err);
        setError(true);
        setSystemStatus("CONNECTION ERROR");
      }
    }

    loadDashboard();
  }, []);


const allCardioRecords = cardio?.records ?? [];
const allSleepRecords = sleep?.records ?? [];
const allRadiationRecords = radiation?.records ?? [];

const selectedAstronaut =
  currentUser?.role === "admin" ? "ALL" : currentUser?.name;

const filterByAstronaut = (records) => {
  if (!currentUser) return [];

  if (selectedAstronaut === "ALL") return records;

  return records.filter(
    record => record.data?.astronaut_id === selectedAstronaut
  );
};

const sortByTime = (records, field) => {
  return [...records].sort((a, b) => {
    const timeA = Date.parse(a.data?.[field] ?? "");
    const timeB = Date.parse(b.data?.[field] ?? "");

    return (
      (Number.isFinite(timeA) ? timeA : 0) -
      (Number.isFinite(timeB) ? timeB : 0)
    );
  });
};

const cardioRecords = sortByTime(
  filterByAstronaut(allCardioRecords),
  "timestamp_utc"
);

const sleepRecords = sortByTime(
  filterByAstronaut(allSleepRecords),
  "sleep_date"
);

const radiationRecords = sortByTime(
  filterByAstronaut(allRadiationRecords),
  "timestamp_utc"
);

// Keep every record in the tables, but only use validated
// measurements for charts and metric calculations.

const validCardioRecords = cardioRecords.filter(
  record => record.validation?.status === "VALID"
);

const validSleepRecords = sleepRecords.filter(
  record =>
    record.validation?.status === "VALID" &&
    record.fatigue_analysis?.status === "CALCULATED"
);

const validRadiationRecords = radiationRecords.filter(
  record => record.validation?.status === "VALID"
);

// Latest validated measurements

const latestCardio = validCardioRecords.at(-1);
const latestSleep = validSleepRecords.at(-1);

const heartRate = latestCardio?.data?.heart_rate_bpm ?? "--";
const hrv = latestCardio?.data?.hrv_ms ?? "--";
const spo2 = latestCardio?.data?.spo2_percent ?? "--";
const fatigue = latestSleep?.fatigue_analysis?.score ?? "--";


  const poorQualityRecords = [
    ...cardioRecords
      .filter(r => r.validation?.status === "POOR_QUALITY")
      .map(r => ({
        module: "Cardiovascular",
        astronaut: r.data?.astronaut_id,
        time: r.data?.timestamp_utc,
        status: "POOR_QUALITY"
      })),
    ...radiationRecords
      .filter(r => r.validation?.status === "POOR_QUALITY")
      .map(r => ({
        module: "Radiation",
        astronaut: r.data?.astronaut_id,
        time: r.data?.timestamp_utc,
        status: "POOR_QUALITY"
      }))
  ];

  const configurationRequired = [
    ...cardioRecords.filter(
      r => r.analysis?.status === "CONFIGURATION REQUIRED"
    ).map(r => ({
      module: "Cardiovascular",
      astronaut: r.data?.astronaut_id,
      status: r.analysis?.status
    })),
    ...radiationRecords.filter(
      r => r.analysis?.status === "CONFIGURATION REQUIRED"
    ).map(r => ({
      module: "Radiation",
      astronaut: r.data?.astronaut_id,
      status: r.analysis?.status
    }))
  ];

  if (!currentUser) {
  return <LoginScreen onLogin={setCurrentUser} />;
}

return (
    <div className="app-container">

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <div>
            <h2>ASTRA</h2>
            <span>HEALTH SYSTEM</span>
          </div>
        </div>

        <nav>
          <a href="#overview">Overview</a>
          <a href="#human-body">3D Human Model</a>
          <a href="#cardiovascular">Cardiovascular</a>
          <a href="#sleep">Sleep & Fatigue</a>
          <a href="#radiation">Radiation</a>
          <a href="#bone-health">Bone Health</a>
          <a href="#alerts">Alerts</a>
        </nav>

        <div className="sidebar-footer">
          MISSION HEALTH MONITORING
          <br />
          SOFTWARE PROTOTYPE
        </div>
      </aside>


      <main className="main-content">

        <header className="topbar">
          <div>
            <span className="eyebrow">MISSION CONTROL / HEALTH</span>
            <h1>Mission Dashboard</h1>
          </div>

          <div className="topbar-actions">
  <div className="system-status">
    <span className="status-indicator"></span>
    {systemStatus.toUpperCase()}
  </div>

  <span className="user-name">{currentUser.name}</span>

  <button
    className="logout-button"
    onClick={() => setCurrentUser(null)}
  >
    LOG OUT
  </button>
</div>
        </header>


        {/* OVERVIEW */}

        <section className="welcome-section" id="overview">
          <div>
            <span className="eyebrow">
              ASTRONAUT HEALTH MONITORING
            </span>
            <h2>Welcome to ASTRA HEALTH</h2>
            <p>
              Monitoring astronaut health through cardiovascular,
              sleep, fatigue and radiation analysis.
            </p>
          </div>
          <div className="mission-symbol">✦</div>
        </section>

        {error && (
          <p className="error-message">
            Backend connection unavailable.
          </p>
        )}

        <section className="section-heading">
          <div>
            <span className="eyebrow">HEALTH MODULES</span>
            <h2>Health Overview</h2>
          </div>
          <span className="demo-label">SIMULATED DATA</span>
        </section>

        <section className="metrics-grid">
          <MetricCard
            title="Heart Rate"
            value={heartRate}
            unit="bpm"
            description="Latest cardiovascular measurement"
            status={latestCardio?.validation?.status ?? "LOADING"}
          />

          <MetricCard
            title="HRV"
            value={hrv}
            unit="ms"
            description="Heart rate variability"
            status={latestCardio?.validation?.status ?? "LOADING"}
          />

          <MetricCard
            title="SpO₂"
            value={spo2}
            unit="%"
            description="Blood oxygen saturation"
            status={latestCardio?.validation?.status ?? "LOADING"}
          />

          <MetricCard
            title="Fatigue Score"
            value={fatigue}
            unit="/100"
            description="Experimental fatigue assessment"
            status={latestSleep?.fatigue_analysis?.category ?? "LOADING"}
          />
        </section>

        {/* 3D HUMAN BODY */}
        <section className="detail-section" id="human-body">
          <div className="section-heading">
            <div>
              <span className="eyebrow">INTERACTIVE HEALTH MODEL</span>
              <h2>Human Body Monitoring</h2>
            </div>
            <span className="demo-label">3D INTERACTIVE</span>
          </div>

          <p className="section-description">
            Explore astronaut body systems and their health indicators.
          </p>

          <HumanBody3D />
        </section>

{/* CARDIOVASCULAR */}

<section className="detail-section" id="cardiovascular">
  <div className="section-heading">
    <div>
      <span className="eyebrow">HEALTH MODULE 01</span>
      <h2>Cardiovascular Monitoring</h2>
    </div>
    <span className="demo-label">SIMULATED DATA</span>
  </div>

  <p className="section-description">
    Heart rate, heart rate variability and oxygen saturation
    measurements.
  </p>

  <div className="charts-grid">
    <LineChart
      title="Heart Rate Trend"
      unit="BPM"
      points={validCardioRecords.map(record => ({
        astronaut: record.data.astronaut_id,
        time: record.data.timestamp_utc,
        value: record.data.heart_rate_bpm
      }))}
    />

    <LineChart
      title="Heart Rate Variability"
      unit="ms"
      points={validCardioRecords.map(record => ({
        astronaut: record.data.astronaut_id,
        time: record.data.timestamp_utc,
        value: record.data.hrv_ms
      }))}
    />

    <LineChart
      title="Blood Oxygen Saturation"
      unit="%"
      points={validCardioRecords.map(record => ({
        astronaut: record.data.astronaut_id,
        time: record.data.timestamp_utc,
        value: record.data.spo2_percent
      }))}
    />
  </div>

  <DataTable
    headers={[
      "Astronaut",
      "Timestamp",
      "Heart Rate",
      "HRV",
      "SpO₂",
      "Quality",
      "Analysis"
    ]}
  >
    {cardioRecords.map((record, index) => (
      <tr key={`${record.data.astronaut_id}-${record.data.timestamp_utc}-${index}`}>
        <td>{record.data.astronaut_id}</td>
        <td>{record.data.timestamp_utc}</td>
        <td>{record.data.heart_rate_bpm} bpm</td>
        <td>{record.data.hrv_ms} ms</td>
        <td>{record.data.spo2_percent}%</td>
        <td>{record.validation?.status}</td>
        <td>{record.analysis?.status}</td>
      </tr>
    ))}
  </DataTable>

  <p className="section-description">
    Total records: {cardioRecords.length}
  </p>
</section>


{/* SLEEP AND FATIGUE */}

<section className="detail-section" id="sleep">
  <div className="section-heading">
    <div>
      <span className="eyebrow">HEALTH MODULE 02</span>
      <h2>Sleep & Fatigue Monitoring</h2>
    </div>
    <span className="demo-label">SIMULATED DATA</span>
  </div>

  <p className="section-description">
    Sleep duration, sleep quality, consecutive sleep deficit
    and experimental fatigue assessment.
  </p>

  <div className="charts-grid">
    <LineChart
      title="Sleep Duration Trend"
      unit="Hours"
      points={validSleepRecords.map(record => ({
        astronaut: record.data.astronaut_id,
        time: record.data.sleep_date,
        value: record.data.sleep_duration_hours
      }))}
    />

    <LineChart
      title="Sleep Quality Trend"
      unit="Score / 5"
      points={validSleepRecords.map(record => ({
        astronaut: record.data.astronaut_id,
        time: record.data.sleep_date,
        value: record.data.sleep_quality
      }))}
    />

    <LineChart
      title="Fatigue Score Trend"
      unit="Score / 100"
      points={validSleepRecords.map(record => ({
        astronaut: record.data.astronaut_id,
        time: record.data.sleep_date,
        value: record.fatigue_analysis?.score
      }))}
    />
  </div>

  <DataTable
    headers={[
      "Astronaut",
      "Date",
      "Sleep Duration",
      "Target",
      "Quality",
      "Deficit Days",
      "Fatigue Score",
      "Category"
    ]}
  >
    {sleepRecords.map((record, index) => (
      <tr key={`${record.data.astronaut_id}-${record.data.sleep_date}-${index}`}>
        <td>{record.data.astronaut_id}</td>
        <td>{record.data.sleep_date}</td>
        <td>{record.data.sleep_duration_hours} h</td>
        <td>{record.data.sleep_target_hours} h</td>
        <td>{record.data.sleep_quality}/5</td>
        <td>{record.consecutive_deficit_days}</td>
        <td>{record.fatigue_analysis?.score ?? "--"}</td>
        <td>{record.fatigue_analysis?.category ?? "--"}</td>
      </tr>
    ))}
  </DataTable>

  <p className="section-description">
    Total records: {sleepRecords.length}
  </p>
</section>

{/* RADIATION */}

<section className="detail-section" id="radiation">
  <div className="section-heading">
    <div>
      <span className="eyebrow">HEALTH MODULE 03</span>
      <h2>Radiation Monitoring</h2>
    </div>
    <span className="demo-label">SIMULATED DATA</span>
  </div>

  <p className="section-description">
    Radiation dose rate and dose increment measurements.
  </p>

  <div className="charts-grid">
    <LineChart
      title="Radiation Dose Rate Trend"
      unit="µSv/h"
      points={validRadiationRecords.map(record => ({
        astronaut: record.data.astronaut_id,
        time: record.data.timestamp_utc,
        value: record.data.dose_rate_uSv_h
      }))}
    />

    <LineChart
      title="Radiation Dose Increment"
      unit="µSv"
      points={validRadiationRecords.map(record => ({
        astronaut: record.data.astronaut_id,
        time: record.data.timestamp_utc,
        value: record.data.dose_increment_uSv
      }))}
    />
  </div>

  <DataTable
    headers={[
      "Astronaut",
      "Timestamp",
      "Interval",
      "Dose Rate",
      "Dose Increment",
      "Quality",
      "Analysis"
    ]}
  >
    {radiationRecords.map((record, index) => (
      <tr key={`${record.data.astronaut_id}-${record.data.timestamp_utc}-${index}`}>
        <td>{record.data.astronaut_id}</td>
        <td>{record.data.timestamp_utc}</td>
        <td>{record.data.interval_duration_hours} h</td>
        <td>{record.data.dose_rate_uSv_h} µSv/h</td>
        <td>{record.data.dose_increment_uSv} µSv</td>
        <td>{record.validation?.status}</td>
        <td>{record.analysis?.status}</td>
      </tr>
    ))}
  </DataTable>

  <p className="section-description">
    Total records: {radiationRecords.length}
  </p>
</section>
        
        <ResearchMonitoring
          cardioRecords={cardioRecords}
          sleepRecords={sleepRecords}
        />
{/* BONE LOSS MONITORING */}
<BoneHealthDashboard />

{/* ALERT CENTER */}

        <section className="detail-section" id="alerts">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MISSION MONITORING</span>
              <h2>Alert Center</h2>
            </div>
            <span className="demo-label">MONITORING STATUS</span>
          </div>

          <div className="module-grid">
            <div className="module-card">
              <span className="module-icon">!</span>
              <h3>Data Quality Issues</h3>
              <p>
                {poorQualityRecords.length} measurements failed
                quality validation.
              </p>
            </div>

            <div className="module-card">
              <span className="module-icon">⚙</span>
              <h3>Configuration Required</h3>
              <p>
                {configurationRequired.length} records require
                approved analysis thresholds.
              </p>
            </div>

            <div className="module-card">
              <span className="module-icon">◷</span>
              <h3>Monitoring Summary</h3>
              <p>
                Cardiovascular: {cardio?.total_records ?? 0} records.
                <br />
                Sleep: {sleep?.total_records ?? 0} records.
                <br />
                Radiation: {radiation?.total_records ?? 0} records.
              </p>
            </div>
          </div>

          <h3 className="subsection-title">Data Quality Events</h3>

          {poorQualityRecords.length === 0 ? (
            <p className="section-description">
              No poor-quality measurements detected.
            </p>
          ) : (
            <DataTable
              headers={["Module", "Astronaut", "Timestamp", "Status"]}
            >
              {poorQualityRecords.map((item, index) => (
                <tr key={index}>
                  <td>{item.module}</td>
                  <td>{item.astronaut}</td>
                  <td>{item.time}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </DataTable>
          )}

          <h3 className="subsection-title">
            Analysis Configuration Events
          </h3>

          {configurationRequired.length === 0 ? (
            <p className="section-description">
              No pending configuration events.
            </p>
          ) : (
            <DataTable
              headers={["Module", "Astronaut", "Status"]}
            >
              {configurationRequired.map((item, index) => (
                <tr key={index}>
                  <td>{item.module}</td>
                  <td>{item.astronaut}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </section>


        <footer>
          ASTRA HEALTH · ASTRONAUT HEALTH MONITORING SYSTEM
          <br />
          Prototype version 1.0 · Simulated data · Not for clinical use
        </footer>

      </main>
    </div>
  );
}

export default App;
