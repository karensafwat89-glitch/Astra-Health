
# ASTRA HEALTH - Radiation Monitoring Rules

## 1. Purpose
Monitor astronaut radiation exposure and detect unusual changes during space missions.

This module supports monitoring and early warning. It is not a medical diagnostic system.

## 2. Monitored Indicators

### A. Radiation Dose Rate
- Represents radiation exposure rate over time.
- Store the measurement with its unit and timestamp.
- Detect unusual increases.
- Compare readings with mission-approved operational limits.

### B. Daily Radiation Dose
- Represents the accumulated radiation dose during one day.
- Calculate daily exposure from valid measurements.
- Compare the result with the mission-specific daily dose budget.

### C. Cumulative Radiation Dose
- Represents total accumulated exposure during the mission.
- Update the cumulative value using valid dose measurements.
- Compare it with the approved mission dose budget.

## 3. Alert Logic

### NORMAL
- Valid measurements.
- Exposure remains within configured mission limits.

### WARNING
- Unusual increase in dose rate.
- Daily dose approaches a configured operational threshold.
- Cumulative exposure approaches the mission budget.

### CRITICAL
- A mission-approved critical exposure limit is exceeded.
- Requires immediate review according to mission radiation protection procedures.

### DATA UNAVAILABLE
- Missing measurements.
- Invalid units or values.
- Outdated timestamps.
- Missing dosimeter data.

## 4. Dose Calculation

Daily Dose:
Sum of valid dose increments recorded during the day.

Cumulative Dose:
Previous cumulative dose + new valid dose increments.

Dose rate and accumulated dose must be stored separately.

## 5. Data Validation
- Verify measurement units.
- Verify timestamps.
- Reject invalid or duplicate records.
- Check for missing measurement intervals.
- Never classify unavailable data as NORMAL.

## 6. Explainable Alerts
Every alert should include:
- Astronaut identifier.
- Current dose rate.
- Daily accumulated dose.
- Cumulative mission dose.
- Applicable mission threshold.
- Alert level.
- Explanation.
- Recommended protective action.

## 7. Scientific Limitations
- Thresholds must be mission-specific and configurable.
- Radiation measurements require validated dosimetry data.
- Do not use career exposure limits as daily thresholds.
- Radiation type and biological effectiveness must be considered.
- Simulated data must be clearly labelled.
- All operational limits require expert review.

## 8. Future Improvements
- Radiation exposure trend charts.
- Mission dose budget visualization.
- Historical exposure analysis.
- Integration with real radiation datasets.
