
# ASTRA HEALTH - Cardiovascular Test Cases

## 1. Test Purpose
Validate cardiovascular monitoring rules using simulated astronaut data.

All values in this document are illustrative software test inputs, not clinical thresholds.

## 2. Test Case A - Normal Readings
- HR: 70 bpm
- HRV: 55 ms
- SpO2: 98%
- Expected Result: NORMAL
- Condition: All readings are valid and within configured reference limits.

## 3. Test Case B - Elevated Heart Rate
- HR: 105 bpm
- HRV: 55 ms
- SpO2: 98%
- Expected Result: WARNING
- Condition: Sustained HR increase relative to personal baseline.
- Note: Consider physical activity and measurement context.

## 4. Test Case C - Reduced HRV
- HR: 70 bpm
- HRV: 25 ms
- SpO2: 98%
- Expected Result: WARNING
- Condition: Sustained HRV decrease relative to personal baseline.

## 5. Test Case D - Low Oxygen Saturation
- HR: 70 bpm
- HRV: 55 ms
- SpO2: 88%
- Expected Result: CRITICAL
- Condition: Illustrative test of a mission-approved critical SpO2 rule.
- Note: Requires immediate review under the mission medical protocol.

## 6. Test Case E - Missing Heart Rate
- HR: Missing
- HRV: 55 ms
- SpO2: 98%
- Expected Result: DATA UNAVAILABLE
- Condition: Required measurement is missing.

## 7. Test Case F - Invalid HRV
- HR: 70 bpm
- HRV: -5 ms
- SpO2: 98%
- Expected Result: INVALID DATA
- Condition: Negative HRV is rejected.

## 8. Additional Validation
- Check timestamps and data freshness.
- Check measurement quality.
- Confirm units.
- Do not classify missing or invalid readings as NORMAL.
- Test sustained changes separately from single unusual readings.

## 9. Limitations
- All test inputs are simulated.
- Alert thresholds are configurable.
- Test outcomes do not establish clinical validity.
- Medical thresholds require expert review.
