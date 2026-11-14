
# ASTRA HEALTH - Radiation Test Cases

## 1. Test Purpose
Validate radiation monitoring rules and dose calculations using simulated astronaut data.

All values are illustrative software test inputs, not approved radiation safety limits.

## 2. Test Case A - Normal Exposure
- Dose Rate: 10 µSv/h
- Daily Dose: 100 µSv
- Cumulative Dose: 500 µSv
- Expected Result: NORMAL
- Condition: Measurements are valid and within configured mission limits.

## 3. Test Case B - Increased Dose Rate
- Dose Rate: 50 µSv/h
- Daily Dose: 100 µSv
- Cumulative Dose: 500 µSv
- Expected Result: WARNING
- Condition: Dose rate exceeds the illustrative configured warning threshold.

## 4. Test Case C - Elevated Daily Dose
- Dose Rate: 10 µSv/h
- Daily Dose: 900 µSv
- Cumulative Dose: 1500 µSv
- Expected Result: WARNING
- Condition: Daily dose approaches the illustrative mission threshold.

## 5. Test Case D - Daily Dose Threshold Exceeded
- Dose Rate: 10 µSv/h
- Daily Dose: 1200 µSv
- Cumulative Dose: 2000 µSv
- Expected Result: CRITICAL
- Condition: Illustrative mission-approved critical threshold is exceeded.

## 6. Test Case E - Missing Dose Rate
- Dose Rate: Missing
- Daily Dose: 100 µSv
- Expected Result: DATA UNAVAILABLE
- Condition: Required measurement is missing.

## 7. Test Case F - Invalid Dose Rate
- Dose Rate: -5 µSv/h
- Daily Dose: 100 µSv
- Expected Result: INVALID DATA
- Condition: Negative dose rate is rejected.

## 8. Dose Calculation Tests

### Daily Dose
Daily Dose = Sum of valid dose increments recorded during the day.

### Cumulative Dose
Cumulative Dose = Previous Cumulative Dose + New Valid Dose Increments.

Test:
- Previous Cumulative Dose: 500 µSv
- New Dose Increment: 100 µSv
- Expected Cumulative Dose: 600 µSv

## 9. Data Validation
- Verify measurement units.
- Validate timestamps.
- Reject negative values.
- Detect duplicate records.
- Identify missing measurement intervals.
- Never classify missing data as NORMAL.

## 10. Scientific Limitations
- All inputs are simulated.
- Mission-specific thresholds require expert approval.
- Dose rate and accumulated dose must remain separate.
- Radiation type and biological effectiveness must be considered.
- These tests validate software logic, not radiation safety.
