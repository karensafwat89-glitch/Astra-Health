
# ASTRA HEALTH - Rule Engine Specifications

## 1. Purpose
The Rule Engine analyzes astronaut health data and generates explainable alerts to support health monitoring during space missions.

This prototype is not a diagnostic medical device.

## 2. Alert Levels
- NORMAL: Valid data with no rule violation.
- WARNING: A change requiring attention or continued monitoring.
- CRITICAL: A condition requiring urgent review according to mission protocols.
- DATA UNAVAILABLE: Missing, invalid, or outdated data.

## 3. Cardiovascular Module

### Heart Rate (HR)
- Compare current readings with the astronaut's personal baseline.
- Detect sustained unusual increases or decreases.
- Generate an explainable alert when a configured rule is met.

### Heart Rate Variability (HRV)
- Monitor trends relative to the personal baseline.
- Flag sustained decreases for further review.

### Blood Oxygen Saturation (SpO2)
- Check readings against mission-approved limits.
- Consider personal baseline and measurement quality.

## 4. Sleep and Fatigue Module

### Sleep Duration
- Compare actual sleep duration with the mission sleep target.
- Flag insufficient sleep.
- Consider repeated sleep deficits.

### Sleep Quality
- Monitor changes in sleep quality over time.

### Fatigue Score
- Calculate a prototype score using sleep duration, sleep quality, and recent trends.
- Clearly document the scoring method and its limitations.

## 5. Radiation Module

### Dose Rate
- Monitor the current radiation dose rate.
- Detect unusual increases.

### Daily Dose
- Calculate and track daily radiation exposure.
- Compare with the mission-specific dose budget.

### Cumulative Dose
- Calculate cumulative exposure during the mission.
- Compare against the approved mission budget.

NASA's career effective dose limit must not be treated as a daily threshold.

## 6. Data Validation
- Check missing values.
- Check timestamps and data freshness.
- Reject invalid measurements.
- Never classify missing or stale data as NORMAL.

## 7. Explainable Alerts
Every alert should include:
- Module name
- Indicator name
- Current value
- Personal baseline or applicable reference
- Alert level
- Reason for the alert
- Recommended next action

## 8. Scientific Limitations
- Thresholds must be configurable.
- Medical and mission-specific limits require validation.
- Prototype rules are research-informed, not clinically validated.
- Simulated data must be clearly labelled.

## 9. References
- NASA-STD-3001: Human Spaceflight Standards
- NASA Medical Operations
- NASA Fatigue Countermeasures Laboratory
- NASA Risk from Inadequate Sleep and Irregular Schedules
