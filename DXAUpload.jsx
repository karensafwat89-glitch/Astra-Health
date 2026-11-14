
import { useState } from "react";
import { importDXAData } from "../services/api";

const REGIONS = [
  "Spine",
  "Neck",
  "Trochanter",
  "Total",
  "Pelvis",
  "Arm",
  "Leg"
];

const METRIC_TYPES = ["BMD", "T-score", "Z-score"];

function parseCSV(text) {
  const lines = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if (
      (char === "\n" || char === "\r") &&
      !insideQuotes
    ) {
      if (char === "\r" && next === "\n") i++;

      row.push(cell.trim());

      if (row.some(value => value !== "")) {
        lines.push(row);
      }

      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());

  if (row.some(value => value !== "")) {
    lines.push(row);
  }

  if (lines.length < 2) {
    throw new Error("The CSV file has no measurement rows.");
  }

  const headers = lines[0].map(header =>
    header.trim().toLowerCase().replace(/[\s_-]+/g, "")
  );

  return lines.slice(1).map((values, index) => {
    const result = {};

    headers.forEach((header, columnIndex) => {
      result[header] = values[columnIndex] ?? "";
    });

    return {
      ...result,
      _sourceRow: index + 2
    };
  });
}

function getValue(row, names) {
  for (const name of names) {
    const value = row[name.toLowerCase().replace(/[\s_-]+/g, "")];

    if (value !== undefined && value !== "") {
      return value;
    }
  }

  return "";
}

function normalizeDate(value) {
  if (!value) return "";

  const trimmed = String(value).trim();

  // ISO date: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Date: DD/MM/YYYY
  const dmy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    return `${dmy[3]}-${month}-${day}`;
  }

  // Date: MM/DD/YYYY is intentionally not guessed.
  return "";
}

export default function DXAUpload({ onImported }) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [automaticMode, setAutomaticMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState(null);

  async function handleFile(event) {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");
    setResult(null);
    setRows([]);
    setFileName("");

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a CSV file.");
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseCSV(text);

      const hasMetadata = parsed.every(row =>
        getValue(row, ["astronaut_id"]) &&
        getValue(row, ["measurement_date"]) &&
        getValue(row, ["metric_type"])
      );

      const prepared = parsed.map(row => {
        const mapped = {};

        REGIONS.forEach(region => {
          mapped[region] = getValue(row, [region]);
        });

        return {
          source_row: row._sourceRow,
          astronaut_id: getValue(row, ["astronaut_id"]),
          measurement_date: normalizeDate(
            getValue(row, ["measurement_date"])
          ),
          metric_type: getValue(row, ["metric_type"]),
          mission_phase: getValue(row, ["mission_phase"]),
          flight_id: getValue(row, ["flight_id"]),
          ...mapped
        };
      });

      setRows(prepared);
      setAutomaticMode(hasMetadata);
      setFileName(file.name);
    } catch (err) {
      setError(err.message || "Could not read this CSV file.");
    }
  }

  function updateRow(index, field, value) {
    setRows(previous =>
      previous.map((row, rowIndex) =>
        rowIndex === index
          ? { ...row, [field]: value }
          : row
      )
    );
  }

  async function handleImport() {
    setError("");
    setSuccess("");
    setResult(null);

    const records = [];

    for (const row of rows) {
      if (!row.astronaut_id?.trim()) {
        setError(`Row ${row.source_row}: Astronaut ID is required.`);
        return;
      }

      if (!row.measurement_date) {
        setError(
          `Row ${row.source_row}: Enter a valid measurement date in YYYY-MM-DD format.`
        );
        return;
      }

      if (!METRIC_TYPES.includes(row.metric_type)) {
        setError(`Row ${row.source_row}: Select a valid metric type.`);
        return;
      }

      const record = {
        astronaut_id: row.astronaut_id.trim(),
        measurement_date: row.measurement_date,
        metric_type: row.metric_type,
        source_row: row.source_row
      };

      if (row.mission_phase) {
        record.mission_phase = row.mission_phase;
      }

      if (row.flight_id) {
        record.flight_id = row.flight_id;
      }

      let hasMeasurement = false;

      for (const region of REGIONS) {
        const rawValue = row[region];

        if (rawValue === "" || rawValue === null || rawValue === undefined) {
          record[region] = null;
          continue;
        }

        const value = Number(rawValue);

        if (!Number.isFinite(value)) {
          setError(
            `Row ${row.source_row}: ${region} must be a valid number.`
          );
          return;
        }

        record[region] = value;
        hasMeasurement = true;
      }

      if (!hasMeasurement) {
        setError(
          `Row ${row.source_row}: At least one regional measurement is required.`
        );
        return;
      }

      records.push(record);
    }

    try {
      setLoading(true);

      const response = await importDXAData(records);

      setResult(response);
      setSuccess(
        `Successfully imported ${response.imported_count} measurements for ${response.astronaut_count} astronaut(s).`
      );

      onImported?.(response);
    } catch (err) {
      setError(err.message || "DXA import failed.");
    } finally {
      setLoading(false);
    }
  }

  const astronautIds = result?.astronaut_count ?? 0;

  return (
    <div className="dxa-module">
      <div className="dxa-upload-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">HEALTH MODULE 04</span>
            <h2>Bone Health Monitoring</h2>
          </div>
          <span className="demo-label">DXA ANALYSIS</span>
        </div>

        <p className="section-description">
          Import bone density measurements and monitor regional
          changes for each astronaut independently.
        </p>

        <div className="dxa-file-input">
          <label htmlFor="dxa-csv">
            Select DXA CSV File
          </label>

          <input
            id="dxa-csv"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
          />

          {fileName && (
            <p className="section-description">
              Selected file: {fileName}
            </p>
          )}
        </div>

        {rows.length > 0 && (
          <>
            <div className="dxa-mode">
              <strong>Import mode:</strong>{" "}
              {automaticMode
                ? "Automatic metadata detection"
                : "Manual row mapping"}
            </div>

            {!automaticMode && (
              <p className="section-description">
                Metadata columns were not found for every row.
                Assign an astronaut, date and metric type to each row.
              </p>
            )}

            <div className="dxa-rows">
              {rows.map((row, index) => (
                <div className="dxa-row-card" key={row.source_row}>
                  <h3>CSV Row {row.source_row}</h3>

                  <div className="dxa-metadata-grid">
                    <label>
                      Astronaut ID
                      <input
                        type="text"
                        value={row.astronaut_id}
                        readOnly={automaticMode}
                        placeholder="e.g. ASTRONAUT_01"
                        onChange={event =>
                          updateRow(index, "astronaut_id", event.target.value)
                        }
                      />
                    </label>

                    <label>
                      Measurement Date
                      <input
                        type="date"
                        value={row.measurement_date}
                        readOnly={automaticMode}
                        onChange={event =>
                          updateRow(index, "measurement_date", event.target.value)
                        }
                      />
                    </label>

                    <label>
                      Metric Type
                      <select
                        value={row.metric_type}
                        disabled={automaticMode}
                        onChange={event =>
                          updateRow(index, "metric_type", event.target.value)
                        }
                      >
                        <option value="">Select metric</option>
                        {METRIC_TYPES.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="dxa-region-grid">
                    {REGIONS.map(region => (
                      <label key={region}>
                        {region}
                        <input
                          type="number"
                          step="any"
                          value={row[region] ?? ""}
                          readOnly={automaticMode}
                          placeholder="—"
                          onChange={event =>
                            updateRow(index, region, event.target.value)
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="dxa-import-button"
              type="button"
              onClick={handleImport}
              disabled={loading}
            >
              {loading ? "IMPORTING..." : "IMPORT DXA DATA"}
            </button>
          </>
        )}

        {error && (
          <p className="dxa-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="dxa-success" role="status">
            {success}
          </p>
        )}
      </div>

      {result?.trends && (
        <div className="dxa-results-card">
          <h3>Bone Health Import Results</h3>

          <p>
            Imported records: <strong>{result.imported_count}</strong>
          </p>

          <p>
            Astronauts included: <strong>{astronautIds}</strong>
          </p>

          {Object.entries(result.trends).map(([astronautId, metrics]) => (
            <div className="dxa-astronaut-results" key={astronautId}>
              <h3>{astronautId}</h3>

              {Object.entries(metrics).map(([metricType, regions]) => (
                <div key={metricType}>
                  <h4>{metricType}</h4>

                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Region</th>
                          <th>Baseline</th>
                          <th>Latest</th>
                          <th>Change</th>
                        </tr>
                      </thead>

                      <tbody>
                        {Object.entries(regions).map(([region, data]) => (
                          <tr key={region}>
                            <td>{region}</td>
                            <td>{data.baseline}</td>
                            <td>{data.latest}</td>
                            <td>
                              {(data.latest - data.baseline).toFixed(4)}
                              {metricType === "BMD" &&
                                data.baseline !== 0 &&
                                ` (${(
                                  ((data.latest - data.baseline) /
                                    data.baseline) *
                                  100
                                ).toFixed(2)}%)`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <p className="section-description">
            These results are calculated from the imported records
            in this session. They are not permanently stored yet.
          </p>
        </div>
      )}
    </div>
  );
}
