
# ASTRA HEALTH - Cardiovascular Monitoring Rules

## 1. Purpose
Monitor cardiovascular indicators and detect unusual changes in astronaut health data.

This module is designed for monitoring and early warning, not medical diagnosis.

## 2. Monitored Indicators

### A. Heart Rate (HR)
- Unit: Beats per minute (bpm).
- Compare current readings with the astronaut's personal baseline.
- Detect sustained increases or decreases.
- Consider physical activity and measurement conditions.
- Generate an explainable alert when configured rules are met.

### B. Heart Rate Variability (HRV)
- Monitor HRV trends over time.
- Compare readings with the personal baseline.
- Detect sustained decreases.
- Consider measurement quality and recording conditions.

### C. Blood Oxygen Saturation (SpO2)
- Unit: Percentage (%).
- Validate measurement quality.
- Compare readings with mission-approved reference limits.
- Generate alerts when configured limits are crossed.

## 3. Alert Logic

### NORMAL
- Valid and recent measurements.
- No configured rule violation.

### WARNING
- Sustained unusual changes relative to personal baseline.
- Repeated HRV decreases.
- Trends requiring further monitoring.

### CRITICAL
- A mission-approved critical limit is crossed.
- Requires urgent review according to mission medical protocols.

### DATA UNAVAILABLE
- Missing measurements.
- Invalid readings.
- Outdated timestamps.
- Poor measurement quality.

## 4. Personal Baseline
- Establish a baseline for each astronaut using valid reference measurements.
- Store baseline values separately for HR and HRV.
- Update baselines only through an approved process.
- Do not compare astronauts using one universal baseline.

## 5. Data Validation
- Check units and valid measurement ranges.
- Check timestamps and data freshness.
- Reject invalid or poor-quality measurements.
- Do not classify missing data as NORMAL.

## 6. Explainable Alerts
Each alert should include:
- Astronaut identifier.
- Indicator name.
- Current measurement.
- Personal baseline or approved reference.
- Magnitude and duration of change.
- Alert level.
- Explanation.
- Recommended next action.

## 7. Scientific Limitations
- Thresholds must be configurable.
- Rules require medical review and validation.
- Physical activity and mission conditions may affect measurements.
- The module does not replace professional medical assessment.
- Simulated measurements must be labelled.

## 8. Future Improvements
- Trend visualization.
- Historical comparison.
- Detection of repeated abnormal patterns.
- Integration with real sensor datasets.
