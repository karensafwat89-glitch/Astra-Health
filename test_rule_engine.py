
import unittest

from rule_engine import (
    calculate_fatigue_score,
    classify_alert
)


class TestFatigueScore(unittest.TestCase):

    def test_low_fatigue_score(self):
        result = calculate_fatigue_score(
            8.5, 8.5, 5, 0
        )

        self.assertEqual(result["status"], "CALCULATED")
        self.assertEqual(result["score"], 0)
        self.assertEqual(result["category"], "LOW")

    def test_moderate_fatigue_score(self):
        result = calculate_fatigue_score(
            8.5, 5.5, 2, 2
        )

        self.assertEqual(result["score"], 53.5)
        self.assertEqual(result["category"], "MODERATE")

    def test_high_fatigue_score(self):
        result = calculate_fatigue_score(
            8.5, 4, 1, 3
        )

        self.assertEqual(result["score"], 76.5)
        self.assertEqual(result["category"], "HIGH")

    def test_missing_sleep_data(self):
        result = calculate_fatigue_score(
            8.5, None, 3, 1
        )

        self.assertEqual(result["status"], "DATA UNAVAILABLE")

    def test_invalid_sleep_quality(self):
        result = calculate_fatigue_score(
            8.5, 7, 6, 1
        )

        self.assertEqual(result["status"], "INVALID DATA")


class TestAlertClassification(unittest.TestCase):

    def test_normal_alert(self):
        result = classify_alert(
            50, 70, 90, "HIGH"
        )

        self.assertEqual(result, "NORMAL")

    def test_warning_alert(self):
        result = classify_alert(
            75, 70, 90, "HIGH"
        )

        self.assertEqual(result, "WARNING")

    def test_critical_alert(self):
        result = classify_alert(
            95, 70, 90, "HIGH"
        )

        self.assertEqual(result, "CRITICAL")

    def test_low_direction_warning(self):
        result = classify_alert(
            35, 40, 30, "LOW"
        )

        self.assertEqual(result, "WARNING")

    def test_missing_measurement(self):
        result = classify_alert(
            None, 70, 90, "HIGH"
        )

        self.assertEqual(result, "DATA UNAVAILABLE")

    def test_missing_thresholds(self):
        result = classify_alert(
            50, None, None, "HIGH"
        )

        self.assertEqual(result, "CONFIGURATION REQUIRED")


if __name__ == "__main__":
    unittest.main()
