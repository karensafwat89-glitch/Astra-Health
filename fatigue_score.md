
# ASTRA HEALTH - Fatigue Risk Score

## 1. Purpose
Estimate fatigue risk using sleep duration, sleep quality, and repeated sleep deficits.

This is an experimental prototype score, not a clinical diagnostic tool.

## 2. Input Variables

- Sleep Target: Configurable mission-specific sleep target.
- Actual Sleep Duration: Hours slept.
- Sleep Quality: Scale from 1 to 5.
- Consecutive Sleep Deficit Days: Number of consecutive days below the sleep target.

The initial demo may use 8.5 hours as a configurable sleep target.

## 3. Score Components

### Sleep Duration Deficit (D)
D = min(100, max(0, (T - H) / T * 100))

### Sleep Quality Deficit (Q)
Q = ((5 - S) / 4) * 100

### Consecutive Sleep Deficit (C)
C = min(100, N / 3 * 100)

## 4. Final Score

Fatigue Score = (0.50 * D) + (0.30 * Q) + (0.20 * C)

Score range: 0 to 100.

## 5. Prototype Categories

- 0-29: Low
- 30-59: Moderate
- 60-100: High

These categories are experimental display categories and require validation.

## 6. Data Validation

- Sleep duration must be valid and non-negative.
- Sleep quality must be between 1 and 5.
- Sleep target must be greater than zero.
- Consecutive deficit days must be non-negative.
- Missing required inputs must produce DATA UNAVAILABLE.
- Invalid inputs must not produce a fatigue score.

## 7. Explainability

The dashboard should display:
- Final fatigue score.
- Score category.
- Sleep duration deficit.
- Sleep quality contribution.
- Consecutive sleep deficit days.
- Explanation of the main contributing factors.

## 8. Limitations

- This score is a prototype heuristic.
- Weights and categories are not clinically validated.
- The score must not be interpreted as a medical diagnosis.
- Mission-specific sleep targets and validation are required.
