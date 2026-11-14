
import { useEffect, useState } from "react";

const REGIONS = [
  "Spine",
  "Neck",
  "Trochanter",
  "Total",
  "Pelvis",
  "Arm",
  "Leg",
];

const COLORS = [
  "#38bdf8",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#fb7185",
  "#22d3ee",
  "#c084fc",
];

const STORAGE_KEY = "astra_bone_measurements";

const INITIAL_DATA = [
  [-0.89, -0.73, -1.03, -0.43, -1.68, -0.55, 0.18],
  [-1.59, -1.9, -2.15, -0.4, -1, -0.33, -0.04],
  [-0.56, -0.76, -0.9, -0.02, -1.48, 2.03, -0.39],
  [-1.01, -1.13, -1.36, -0.28, -1.39, 0.38, -0.08],
  [0.52, 0.67, 0.68, 0.23, 0.35, 1.43, 0.29],
  [-1.35, -1.71, -1.32, -0.13, -1.88, 1.37, 0.09],
  [-0.91, -0.67, -0.9, -1.01, -0.69, -0.18, -0.47],
  [-1.1, -1.17, -1.33, 0, -0.87, 1.59, -0.2],
  [-1.12, -1.18, -1.18, -0.38, -1.15, 0.93, -0.25],
  [0.22, 0.52, 0.25, 0.55, 0.64, 0.96, 0.2],
];

const styles = {
  section: {
    padding: "24px",
    color: "#e2e8f0",
  },
  heading: {
    fontSize: "25px",
    fontWeight: 700,
    margin: "0 0 8px",
  },
  description: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.6,
    margin: "0 0 22px",
  },
  card: {
    background: "#111827",
    border: "1px solid #273449",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
    minWidth: 0,
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: 700,
    margin: "0 0 8px",
  },
  muted: {
    color: "#94a3b8",
    fontSize: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "12px",
  },
  inputLabel: {
    display: "block",
    color: "#cbd5e1",
    fontSize: "12px",
    marginBottom: "7px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#0b1220",
    color: "#f8fafc",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "11px",
    outline: "none",
    fontSize: "14px",
  },
  button: {
    background: "#0ea5e9",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "11px 18px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "16px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  summaryCard: {
    background: "#111827",
    border: "1px solid #273449",
    borderRadius: "12px",
    padding: "17px",
  },
  summaryValue: {
    fontSize: "25px",
    fontWeight: 700,
    margin: "8px 0 4px",
  },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  tableWrap: {
    overflowX: "auto",
    width: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
    whiteSpace: "nowrap",
  },
  th: {
    color: "#94a3b8",
    padding: "12px 10px",
    textAlign: "center",
    borderBottom: "1px solid #334155",
  },
  td: {
    padding: "12px 10px",
    textAlign: "center",
    borderBottom: "1px solid #263244",
  },
};

function formatValue(value) {
  return value === null || value === undefined
    ? "—"
    : Number(value).toFixed(2);
}

function getInitialData() {
  if (typeof window === "undefined") return INITIAL_DATA;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (row) => Array.isArray(row) && row.length === REGIONS.length
        )
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Could not load saved bone measurements:", error);
  }

  return INITIAL_DATA;
}

function calculateAverage(data, regionIndex) {
  const values = data
    .map((row) => row[regionIndex])
    .filter((value) => value !== null && Number.isFinite(value));

  if (values.length === 0) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function TrendChart({ data }) {
  const width = 760;
  const height = 310;
  const left = 48;
  const right = 20;
  const top = 25;
  const bottom = 42;

  const allValues = data
    .flat()
    .filter((value) => value !== null && Number.isFinite(value));

  const rawMin = Math.min(...allValues, -1);
  const rawMax = Math.max(...allValues, 1);
  const padding = Math.max((rawMax - rawMin) * 0.12, 0.2);

  const min = rawMin - padding;
  const max = rawMax + padding;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const x = (index) =>
    left +
    (data.length <= 1
      ? plotWidth / 2
      : (index / (data.length - 1)) * plotWidth);

  const y = (value) =>
    top + ((max - value) / (max - min)) * plotHeight;

  const ticks = Array.from({ length: 5 }, (_, i) =>
    min + ((max - min) * i) / 4
  );

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", minWidth: "420px", display: "block" }}
        role="img"
        aria-label="Bone measurement trends across samples"
      >
        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={left}
              x2={width - right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="#334155"
              strokeDasharray="4 5"
            />
            <text
              x={left - 9}
              y={y(tick) + 4}
              textAnchor="end"
              fill="#94a3b8"
              fontSize="10"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}

        {Array.from({ length: data.length }, (_, i) => (
          <g key={i}>
            <line
              x1={x(i)}
              x2={x(i)}
              y1={top}
              y2={height - bottom}
              stroke="#1e293b"
            />
            <text
              x={x(i)}
              y={height - 15}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
            >
              {i + 1}
            </text>
          </g>
        ))}

        {data.map((row, regionIndex) => {
          const segments = [];
          let currentSegment = [];

          row.forEach((value, sampleIndex) => {
            if (value === null || !Number.isFinite(value)) {
              if (currentSegment.length) {
                segments.push(currentSegment);
                currentSegment = [];
              }
            } else {
              currentSegment.push(
                `${x(sampleIndex)},${y(value)}`
              );
            }
          });

          if (currentSegment.length) segments.push(currentSegment);

          return (
            <g key={REGIONS[regionIndex]}>
              {segments.map((segment, segmentIndex) =>
                segment.length > 1 ? (
                  <polyline
                    key={segmentIndex}
                    points={segment.join(" ")}
                    fill="none"
                    stroke={COLORS[regionIndex]}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null
              )}

              {row.map((value, sampleIndex) =>
                value === null || !Number.isFinite(value) ? null : (
                  <circle
                    key={sampleIndex}
                    cx={x(sampleIndex)}
                    cy={y(value)}
                    r="3.5"
                    fill={COLORS[regionIndex]}
                    stroke="#111827"
                    strokeWidth="1"
                  >
                    <title>
                      {REGIONS[regionIndex]} — Sample {sampleIndex + 1}:{" "}
                      {value}
                    </title>
                  </circle>
                )
              )}
            </g>
          );
        })}

        <text
          x={width / 2}
          y={height - 1}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="10"
        >
          Sample
        </text>
      </svg>
    </div>
  );
}

function AverageChart({ data }) {
  const averages = REGIONS.map((region, index) => ({
    region,
    value: calculateAverage(data, index),
    color: COLORS[index],
  }));

  const values = averages
    .map((item) => item.value)
    .filter((value) => value !== null);

  const maxAbs = Math.max(1, ...values.map(Math.abs));

  return (
    <div style={{ display: "grid", gap: "17px", marginTop: "20px" }}>
      {averages.map((item) => (
        <div key={item.region}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "7px",
              fontSize: "12px",
            }}
          >
            <span>{item.region}</span>
            <strong>
              {item.value === null ? "—" : item.value.toFixed(2)}
            </strong>
          </div>

          <div
            style={{
              height: "9px",
              background: "#263244",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width:
                  item.value === null
                    ? "0%"
                    : `${(Math.abs(item.value) / maxAbs) * 100}%`,
                height: "100%",
                background: item.color,
                borderRadius: "10px",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BoneHealthDashboard() {
  const [boneData, setBoneData] = useState(getInitialData);

  const [newValues, setNewValues] = useState({
    Spine: "",
    Neck: "",
    Trochanter: "",
    Total: "",
    Pelvis: "",
    Arm: "",
    Leg: "",
  });
  const averageMonthlyChange =
  allValues.length > 0
    ? allValues.reduce((sum, value) => sum + value, 0) /
      allValues.length
    : null;
  
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boneData));
    } catch (error) {
      console.error("Could not save bone measurements:", error);
    }
  }, [boneData]);

  const handleValueChange = (region, value) => {
    setNewValues((previous) => ({
      ...previous,
      [region]: value,
    }));

    setFormError("");
    setSuccessMessage("");
  };

  const handleAddMeasurement = (event) => {
    event.preventDefault();

    const hasValue = Object.values(newValues).some(
      (value) => value.trim() !== ""
    );

    if (!hasValue) {
      setFormError("Please enter at least one measurement.");
      return;
    }

    const hasInvalidValue = Object.values(newValues).some(
      (value) =>
        value.trim() !== "" && !Number.isFinite(Number(value))
    );

    if (hasInvalidValue) {
      setFormError("Please enter valid numerical values.");
      return;
    }

    const newRecord = REGIONS.map((region) => {
      const value = newValues[region].trim();

      return value === "" ? null : Number(value);
    });

    setBoneData((previous) => [...previous, newRecord]);

    setNewValues({
      Spine: "",
      Neck: "",
      Trochanter: "",
      Total: "",
      Pelvis: "",
      Arm: "",
      Leg: "",
    });

    setFormError("");
    setSuccessMessage("New measurement added successfully.");
  };

  const allValues = boneData
    .flat()
    .filter((value) => value !== null && Number.isFinite(value));

  const minValue = allValues.length ? Math.min(...allValues) : null;
  const maxValue = allValues.length ? Math.max(...allValues) : null;

  return (
    <section id="bone-loss" style={styles.section}>
      <div style={{ marginBottom: "22px" }}>
        <div
          style={{
            color: "#38bdf8",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "2px",
            marginBottom: "8px",
          }}
        >
          ASTRA HEALTH / BONE HEALTH
        </div>

        <h2 style={styles.heading}>Bone Health Monitoring</h2>

        <p style={styles.description}>
          Monitor regional bone measurement values and track changes
          across astronaut samples.
        </p>
      </div>

      {/* ADD NEW MEASUREMENT */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>+ Add New Measurement</h3>

        <p style={styles.description}>
          Enter the latest values. You can fill in one region or all
          seven regions. Empty fields will remain unrecorded.
        </p>

        <form onSubmit={handleAddMeasurement}>
          <div style={styles.grid}>
            {REGIONS.map((region, index) => (
              <div key={region}>
                <label
                  htmlFor={`bone-${region}`}
                  style={styles.inputLabel}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: COLORS[index],
                      marginRight: "7px",
                    }}
                  />
                  {region}
                </label>

                <input
                  id={`bone-${region}`}
                  type="number"
                  step="any"
                  value={newValues[region]}
                  onChange={(event) =>
                    handleValueChange(region, event.target.value)
                  }
                  placeholder="Enter value"
                  style={styles.input}
                />
              </div>
            ))}
          </div>

          {formError && (
            <p style={{ color: "#f87171", fontSize: "13px" }}>
              {formError}
            </p>
          )}

          {successMessage && (
            <p style={{ color: "#34d399", fontSize: "13px" }}>
              {successMessage}
            </p>
          )}

          <button type="submit" style={styles.button}>
            + Add Measurement
          </button>
        </form>
      </div>

      {/* SUMMARY */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.muted}>Total Samples</div>
          <div style={styles.summaryValue}>{boneData.length}</div>
          <div style={styles.muted}>Recorded measurements</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.muted}>Regions</div>
          <div style={styles.summaryValue}>7</div>
          <div style={styles.muted}>Bone measurement regions</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.muted}>Minimum Value</div>
          <div style={styles.summaryValue}>
            {minValue === null ? "—" : minValue.toFixed(2)}
          </div>
          <div style={styles.muted}>Across recorded values</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.muted}>Maximum Value</div>
          <div style={styles.summaryValue}>
            {maxValue === null ? "—" : maxValue.toFixed(2)}
          </div>
          <div style={styles.muted}>Across recorded values</div>
        </div>
      </div>
     <div style={styles.summaryCard}>
  <div style={styles.muted}>
    Average Monthly BMD Change
  </div>

  <div
    style={{
      ...styles.summaryValue,
      color:
        averageMonthlyChange < 0
          ? "#f87171"
          : averageMonthlyChange > 0
          ? "#34d399"
          : "#e2e8f0",
    }}
  >
    {averageMonthlyChange === null
      ? "—"
      : `${averageMonthlyChange > 0 ? "+" : ""}${averageMonthlyChange.toFixed(2)}%`}
  </div>

  <div style={styles.muted}>
    Percentage change per month
  </div>
</div>
      {/* TREND CHART */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Bone Measurement Trends</h3>

        <p style={styles.muted}>
          Regional values across all samples. Missing values are not
          plotted.
        </p>

        <TrendChart
  data={REGIONS.map((region, regionIndex) =>
    boneData.map((sample) => sample[regionIndex])
  )}
/>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "13px",
            marginTop: "15px",
          }}
        >
          {REGIONS.map((region, index) => (
            <div
              key={region}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                color: "#cbd5e1",
              }}
            >
              <span
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: COLORS[index],
                }}
              />
              {region}
            </div>
          ))}
        </div>
      </div>

      {/* AVERAGE CHART */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Average Value by Region</h3>

        <p style={styles.muted}>
          Calculated from all available measurements in each region.
        </p>

        <AverageChart data={boneData} />
      </div>

      {/* DATA TABLE */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Measurement Records</h3>

        <p style={styles.muted}>
          All original and newly added samples.
        </p>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sample</th>
                {REGIONS.map((region) => (
                  <th key={region} style={styles.th}>
                    {region}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {boneData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td
                    style={{
                      ...styles.td,
                      fontWeight: 700,
                      color: "#38bdf8",
                    }}
                  >
                    {rowIndex + 1}
                  </td>

                  {row.map((value, columnIndex) => (
                    <td
                      key={columnIndex}
                      style={styles.td}
                    >
                      {formatValue(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p
        style={{
          ...styles.muted,
          lineHeight: 1.7,
          padding: "5px 2px",
        }}
      >
        Note: The original measurement values are displayed without
        changing their meaning. Metric type and measurement units
        have not yet been specified. This dashboard is for monitoring
        recorded values, not for clinical diagnosis.
      </p>
    </section>
  );
}
