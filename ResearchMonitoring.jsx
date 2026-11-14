import { useMemo, useState } from "react";

function AlertCard({ level, title, value, explanation, action }) {
  const levelClass = level.toLowerCase().replaceAll(" ", "-");
  return (
    <article className={`research-alert research-alert-${levelClass}`}>
      <div className="research-alert-heading">
        <span className={`research-alert-pill ${levelClass}`}>{level}</span>
        <strong>{title}</strong>
        {value !== undefined && <span className="research-alert-value">{value}</span>}
      </div>
      <p>{explanation}</p>
      <p className="research-alert-action"><strong>Recommended action:</strong> {action}</p>
    </article>
  );
}

export default function ResearchMonitoring({ cardioRecords = [], sleepRecords = [] }) {
  const [ctx, setCtx] = useState("");
  const [tScore, setTScore] = useState("");
  const [bedford, setBedford] = useState("");
  const [taskType, setTaskType] = useState("nominal");
  const [landingAt, setLandingAt] = useState("");
  const [doseRate, setDoseRate] = useState("");
  const [doseWarning, setDoseWarning] = useState("");
  const [doseCritical, setDoseCritical] = useState("");

  const alerts = useMemo(() => {
    const items = [];
    const marker = ctx.trim() === "" ? null : Number(ctx);
    const score = tScore.trim() === "" ? null : Number(tScore);
    const workload = bedford.trim() === "" ? null : Number(bedford);

    // Existing validated dashboard records also feed the alert list.
    const cardioByAstronaut = {};
    cardioRecords.filter(record => record.validation?.status === "VALID").forEach(record => {
      const id = record.data?.astronaut_id;
      if (!id) return;
      cardioByAstronaut[id] ??= [];
      cardioByAstronaut[id].push(record);
    });
    Object.entries(cardioByAstronaut).forEach(([astronaut, records]) => {
      const latest = records[records.length - 1];
      ["heart_rate_bpm", "hrv_ms", "spo2_percent"].forEach(field => {
        const history = records.slice(0, -1).map(record => Number(record.data?.[field])).filter(Number.isFinite);
        const current = Number(latest.data?.[field]);
        if (history.length < 3 || !Number.isFinite(current)) return;
        const mean = history.reduce((sum, value) => sum + value, 0) / history.length;
        const variance = history.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / history.length;
        const sd = Math.sqrt(variance);
        const deviation = sd === 0 ? (current === mean ? 0 : Infinity) : Math.abs((current - mean) / sd);
        if (deviation >= 2.5) {
          items.push({
            level: "WARNING",
            title: `${astronaut}: ${field.replaceAll("_", " ")} differs from personal baseline`,
            value: Number.isFinite(deviation) ? `${deviation.toFixed(1)} SD` : "Baseline deviation",
            explanation: "A statistical screening signal was detected from at least three earlier valid measurements. This is not a clinical alert or diagnosis.",
            action: "Verify measurement quality and context, repeat under comparable conditions, and review with the mission medical team if the change persists."
          });
        }
      });
    });

    const latestSleepByAstronaut = {};
    sleepRecords.filter(record => record.validation?.status === "VALID" && record.fatigue_analysis?.status === "CALCULATED").forEach(record => {
      const id = record.data?.astronaut_id;
      if (id) latestSleepByAstronaut[id] = record;
    });
    Object.entries(latestSleepByAstronaut).forEach(([astronaut, record]) => {
      if (record.fatigue_analysis?.category === "HIGH") {
        items.push({
          level: "WARNING",
          title: `${astronaut}: elevated experimental fatigue score`,
          value: `${record.fatigue_analysis.score}/100`,
          explanation: "The prototype fatigue model classifies this score as HIGH using sleep duration, sleep quality and consecutive sleep-deficit days. The score is not clinically validated.",
          action: "Review the sleep schedule, protect adequate sleep opportunity, simplify tasks with checklists and consider redistributing workload with mission control."
        });
      }
    });

    if (marker !== null && Number.isFinite(marker) && marker >= 0) {
      if (marker > 0.63) {
        items.push({
          level: "WARNING", title: "Elevated CTX-1", value: `${marker} ng/mL`,
          explanation: "The research document lists 0.63 ng/mL as the maximum reference value. This result is above that value.",
          action: "Flag for review by the mission medical team and review the bone-health monitoring plan. Do not start or change medication from this alert."
        });
      } else {
        items.push({ level: "NORMAL", title: "CTX-1", value: `${marker} ng/mL`, explanation: "This value does not exceed the 0.63 ng/mL reference stated in the supplied research.", action: "Continue scheduled monitoring." });
      }
    }

    if (score !== null && Number.isFinite(score)) {
      if (score <= -2.5) {
        items.push({
          level: "CRITICAL", title: "DXA T-score in osteoporosis range", value: score.toFixed(1),
          explanation: "The research document classifies a T-score of −2.5 or lower in the osteoporosis range. This is a high-priority clinical review flag, not an emergency diagnosis.",
          action: "Request prompt assessment by the mission medical team and correlate with DXA history and other bone markers."
        });
      } else if (score < -1) {
        items.push({
          level: "WARNING", title: "DXA T-score in osteopenia range", value: score.toFixed(1),
          explanation: "The supplied research places T-scores between −1 and −2.5 in the osteopenia range.",
          action: "Review bone-health trends with the mission medical team and confirm the prescribed exercise and monitoring plan."
        });
      } else {
        items.push({ level: "NORMAL", title: "DXA T-score", value: score.toFixed(1), explanation: "This is within the healthy range described in the supplied research (−1 or higher).", action: "Continue scheduled monitoring." });
      }
    }

    if (workload !== null && Number.isFinite(workload) && workload >= 1 && workload <= 10) {
      const limit = taskType === "nominal" ? 3 : 6;
      if (workload > limit) {
        items.push({
          level: "CRITICAL", title: "Bedford workload limit exceeded", value: `${workload}/10`,
          explanation: `The research cites a Bedford limit of ${limit} or less for ${taskType} tasks.`,
          action: "Escalate to mission control; simplify the task into a checklist, sequence or combine subtasks, and redistribute work between crew, ground control and automation."
        });
      } else {
        items.push({ level: "NORMAL", title: "Bedford workload", value: `${workload}/10`, explanation: `The rating is within the supplied research limit of ${limit} or less for ${taskType} tasks.`, action: "Continue workload checks, especially when task demands change." });
      }
    }

    if (ctx.trim() !== "" && (!Number.isFinite(marker) || marker < 0)) {
      items.push({ level: "INVALID DATA", title: "Invalid CTX-1 input", explanation: "CTX-1 must be a non-negative numeric measurement.", action: "Check the laboratory result and unit before entering it again." });
    }
    if (tScore.trim() !== "" && !Number.isFinite(score)) {
      items.push({ level: "INVALID DATA", title: "Invalid DXA T-score input", explanation: "The T-score must be numeric.", action: "Check the DXA report before entering the result again." });
    }
    if (bedford.trim() !== "" && (!Number.isFinite(workload) || workload < 1 || workload > 10 || !Number.isInteger(workload))) {
      items.push({ level: "INVALID DATA", title: "Invalid Bedford rating", explanation: "Enter a whole-number Bedford rating from 1 to 10.", action: "Verify the questionnaire / assessment result." });
    }

    const rate = doseRate.trim() === "" ? null : Number(doseRate);
    const warn = doseWarning.trim() === "" ? null : Number(doseWarning);
    const critical = doseCritical.trim() === "" ? null : Number(doseCritical);
    if (rate !== null && Number.isFinite(rate) && rate >= 0) {
      if (warn !== null && critical !== null && Number.isFinite(warn) && Number.isFinite(critical) && critical > warn) {
        const level = rate >= critical ? "CRITICAL" : rate >= warn ? "WARNING" : "NORMAL";
        items.push({
          level, title: "Radiation dose-rate review", value: `${rate} µSv/h`,
          explanation: `Compared with mission-control configured limits (${warn} warning; ${critical} critical). These values must be approved for the mission.`,
          action: level === "CRITICAL"
            ? "Follow the mission radiation alarm procedure and move to the designated storm shelter if directed by mission protocol."
            : level === "WARNING"
              ? "Apply ALARA, verify the dosimeter reading and contact mission control for exposure guidance."
              : "Continue dosimeter trending and ALARA practices."
        });
      } else {
        items.push({
          level: "CONFIGURATION REQUIRED", title: "Radiation dose-rate threshold not configured", value: `${rate} µSv/h`,
          explanation: "The supplied research describes RAD dose-rate alarms but does not provide a numeric operational dose-rate limit. The 600 mSv figure is not used as a dose-rate or daily threshold.",
          action: "Mission radiation protection staff must enter approved warning and critical dose-rate limits before automatic classification."
        });
      }
    }

    if (landingAt) {
      const hoursLeft = (new Date(landingAt).getTime() - Date.now()) / 3600000;
      if (Number.isFinite(hoursLeft) && hoursLeft >= 0 && hoursLeft <= 48) {
        if (hoursLeft <= 2) {
          items.push({
            level: "WARNING", title: "Pre-re-entry countermeasure reminder", value: `${Math.max(0, Math.round(hoursLeft * 60))} min`,
            explanation: "The supplied research recommends additional oral salt and fluid loading 2 hours before re-entry, plus compression garments.",
            action: "Follow the flight surgeon's approved salt/fluid protocol and use prescribed compression garments. This is a reminder, not an individualized fluid prescription."
          });
        } else {
          items.push({
            level: "WARNING", title: "Landing preparation window", value: `${Math.round(hoursLeft)} h`,
            explanation: "The research recommends at least 2.7 L of fluids through normal meals and snacks on the day before landing.",
            action: "Display the hydration reminder and follow the mission medical team's fluid plan; prepare for the 2-hour pre-re-entry protocol."
          });
        }
      }
    }

    return items;
  }, [ctx, tScore, bedford, taskType, doseRate, doseWarning, doseCritical, landingAt]);

  const levelOrder = { CRITICAL: 0, WARNING: 1, "INVALID DATA": 2, "CONFIGURATION REQUIRED": 3, NORMAL: 4 };
  const sortedAlerts = [...alerts].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  return (
    <section className="detail-section" id="research-monitoring">
      <div className="section-heading">
        <div>
          <span className="eyebrow">RESEARCH-BASED CHECKS</span>
          <h2>Bone, Cognitive & Mission Readiness</h2>
        </div>
        <span className="demo-label">MANUAL MEASUREMENTS</span>
      </div>
      <p className="section-description">
        Enter a measured value to evaluate it against the reference points in your research document. These entries are held in this browser session only and are not saved to the backend.
      </p>

      <div className="research-input-grid">
        <div className="research-input-card">
          <h3>Bone Health</h3>
          <label htmlFor="ctx1-input">CTX-1 (ng/mL)</label>
          <input id="ctx1-input" type="number" min="0" step="0.01" value={ctx} onChange={e => setCtx(e.target.value)} placeholder="Enter CTX-1" />
          <label htmlFor="tscore-input">DXA T-score</label>
          <input id="tscore-input" type="number" step="0.1" value={tScore} onChange={e => setTScore(e.target.value)} placeholder="e.g. -1.2" />
          <p>References in supplied research: CTX-1 ≤ 0.63 ng/mL; T-score ≥ −1 healthy, between −1 and −2.5 osteopenia, ≤ −2.5 osteoporosis range.</p>
        </div>

        <div className="research-input-card">
          <h3>Cognitive Workload</h3>
          <label htmlFor="task-type">Task context</label>
          <select id="task-type" value={taskType} onChange={e => setTaskType(e.target.value)}>
            <option value="nominal">Nominal / frequent / critical</option>
            <option value="off-nominal">Off-nominal / infrequent / non-critical</option>
          </select>
          <label htmlFor="bedford-input">Bedford Workload Scale (1–10)</label>
          <input id="bedford-input" type="number" min="1" max="10" step="1" value={bedford} onChange={e => setBedford(e.target.value)} placeholder="Enter rating" />
          <p>Research limits: ≤ 3 for nominal tasks and ≤ 6 for off-nominal tasks. Ratings above the applicable limit trigger a high-priority review.</p>
        </div>

        <div className="research-input-card">
          <h3>Radiation Dose Rate</h3>
          <label htmlFor="dose-rate-input">Current dose rate (µSv/h)</label>
          <input id="dose-rate-input" type="number" min="0" step="0.1" value={doseRate} onChange={e => setDoseRate(e.target.value)} placeholder="Enter RAD / dosimeter reading" />
          <div className="research-two-inputs">
            <div>
              <label htmlFor="dose-warning-input">Approved warning limit</label>
              <input id="dose-warning-input" type="number" min="0" step="0.1" value={doseWarning} onChange={e => setDoseWarning(e.target.value)} placeholder="Mission setting" />
            </div>
            <div>
              <label htmlFor="dose-critical-input">Approved critical limit</label>
              <input id="dose-critical-input" type="number" min="0" step="0.1" value={doseCritical} onChange={e => setDoseCritical(e.target.value)} placeholder="Mission setting" />
            </div>
          </div>
          <p>Limits must be supplied by mission radiation protection staff. ALARA applies. The document's “&lt;600 mSv” is not treated as a daily or dose-rate threshold.</p>
        </div>

        <div className="research-input-card">
          <h3>Return-to-Earth Preparation</h3>
          <label htmlFor="landing-time">Planned landing / re-entry time</label>
          <input id="landing-time" type="datetime-local" value={landingAt} onChange={e => setLandingAt(e.target.value)} />
          <p>Reminders are shown within 48 hours: 2.7 L via meals/snacks on the day before landing, and the approved salt/fluid plus compression-garment protocol 2 hours before re-entry.</p>
        </div>
      </div>

      <div className="research-alert-list">
        <div className="subsection-title-row">
          <h3 className="subsection-title">Live Research-Based Alerts</h3>
          <span>{sortedAlerts.length} evaluated item(s)</span>
        </div>
        {sortedAlerts.length === 0 ? (
          <p className="section-description">Enter a measurement above to see its status and recommended next action. No unentered variable is assumed to be normal.</p>
        ) : sortedAlerts.map((item, index) => (
          <AlertCard key={`${item.title}-${index}`} {...item} />
        ))}
      </div>

      <p className="research-disclaimer">
        Research prototype only — not a medical diagnostic or treatment system. Clinical decisions, medication, fluid/salt loading, exercise prescriptions and radiation procedures must be approved by the mission medical / operations team.
      </p>
    </section>
  );
}
