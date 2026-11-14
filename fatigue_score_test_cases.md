
# ASTRA HEALTH - Fatigue Score Test Cases

## Test Configuration
Sleep Target = 8.5 hours

Formula:
Fatigue Score = (0.50 * D) + (0.30 * Q) + (0.20 * C)

## Test Case A - Normal Sleep
- Actual Sleep: 8.5 hours
- Sleep Quality: 5
- Consecutive Deficit Days: 0
- Expected Score: 0
- Expected Category: LOW

## Test Case B - Moderate Sleep Deficit
- Actual Sleep: 5.5 hours
- Sleep Quality: 2
- Consecutive Deficit Days: 2
- Expected Score: 53.5
- Expected Category: MODERATE

## Test Case C - High Fatigue Risk
- Actual Sleep: 4 hours
- Sleep Quality: 1
- Consecutive Deficit Days: 3
- Expected Score: 76.5
- Expected Category: HIGH

## Test Case D - Reduced Sleep Quality
- Actual Sleep: 8.5 hours
- Sleep Quality: 4
- Consecutive Deficit Days: 0
- Expected Score: 7.5
- Expected Category: LOW

## Test Case E - Missing Data
- Actual Sleep: 5.5 hours
- Sleep Quality: Missing
- Consecutive Deficit Days: 2
- Expected Result: DATA UNAVAILABLE
- No score should be calculated.

## Test Case F - Invalid Data
- Actual Sleep: 5.5 hours
- Sleep Quality: 6
- Consecutive Deficit Days: 2
- Expected Result: INVALID DATA
- No score should be calculated.

## Validation Notes
- Scores are rounded to one decimal place.
- Missing or invalid inputs must not generate a valid score.
- These tests validate software logic, not clinical accuracy.
- All thresholds and weights are experimental.
