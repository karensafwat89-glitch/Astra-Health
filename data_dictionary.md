
# ASTRA HEALTH - Dataset Data Dictionary

## 1. Purpose
Define the structure, fields, units, and data sources used by ASTRA HEALTH.

The prototype monitors three astronauts across three health modules.

## 2. Data Source Classification

Every dataset must identify its source:

- REAL: Published or collected real measurements.
- SIMULATED: Artificial data generated for software testing.
- DERIVED: Values calculated by ASTRA HEALTH.

Simulated data must never be presented as real astronaut measurements.

## 3. Astronaut Identification

| Field | Type | Description |
|---|---|---|
| astronaut_id | String | Unique astronaut identifier |
| timestamp_utc | DateTime | Measurement date and time in UTC |
| source_type | String | REAL, SIMULATED, or DERIVED |

## 4. Cardiovascular Dataset

One row represents one measurement record.

| Field | Unit | Description |
|---|---|---|
| astronaut_id | ID | Astronaut identifier |
| timestamp_utc | ISO 8601 | Measurement timestamp |
| heart_rate_bpm | bpm | Heart rate |
| hrv_ms | ms | Heart rate variability |
| spo2_percent | % | Blood oxygen saturation |
| measurement_quality | String | GOOD, POOR, or UNKNOWN |
| source_type | String | Data source classification |

## 5. Sleep and Fatigue Dataset

One row represents one sleep period.

| Field | Unit | Description |
|---|---|---|
| astronaut_id | ID | Astronaut identifier |
| sleep_date | Date | Sleep period date |
| sleep_duration_hours | Hours | Actual sleep duration |
| sleep_target_hours | Hours | Mission-specific sleep target |
| sleep_quality | 1-5 | Sleep quality rating |
| source_type | String | Data source classification |

Derived fields:
- sleep_duration_deficit
- consecutive_sleep_deficit_days
- fatigue_score
- fatigue_category

Derived values must be calculated by the system.

## 6. Radiation Dataset

One row represents one radiation measurement interval.

| Field | Unit | Description |
|---|---|---|
| astronaut_id | ID | Astronaut identifier |
| timestamp_utc | ISO 8601 | Measurement timestamp |
| interval_duration_hours | Hours | Duration of the measurement interval |
| dose_rate_uSv_h | µSv/h | Radiation dose rate |
| dose_increment_uSv       | µSv      | Dose accumulated during the interval |
| measurement_quality | String | GOOD, POOR, or UNKNOWN |
| source_type | String | Data source classification |

Derived fields:
- daily_dose_uSv
- cumulative_dose_uSv

Daily and cumulative doses must be calculated from valid dose increments without double counting.

## 7. Data Validation Rules

- Every record must have an astronaut identifier.
- Timestamps must use UTC.
- Units must be consistent.
- Missing values must remain identifiable.
- Invalid measurements must be rejected or flagged.
- Duplicate records must be detected.
- Poor-quality measurements must not be treated as reliable.
- Missing or outdated data must not be classified as NORMAL.

## 8. Data Storage Structure

The initial project will use three CSV files:

1. cardiovascular.csv
2. sleep_fatigue.csv
3. radiation.csv

## 9. Scientific Integrity

- NASA and scientific sources must be documented.
- Simulated records must be clearly labelled.
- Real data must retain its original source information.
- Derived measurements must document their calculation method.
- Experimental thresholds must not be presented as clinically validated limits.
