
import unittest

from rule_engine import analyze_radiation


class TestRadiationEngine(unittest.TestCase):

    def setUp(self):
        # Artificial test values only.
        # These are NOT approved radiation safety limits.
        self.thresholds = {
            "dose_rate_warning": 50,
            "dose_rate_critical": 100,
            "dose_increment_warning": 40,
            "dose_increment_critical": 80
        }

    def test_normal_radiation(self):
        result = analyze_radiation(
            20, 10, self.thresholds
        )

        self.assertEqual(result["status"], "NORMAL")

    def test_dose_rate_warning(self):
        result = analyze_radiation(
            60, 10, self.thresholds
        )

        self.assertEqual(
            result["alerts"]["dose_rate"],
            "WARNING"
        )

    def test_dose_rate_critical(self):
        result = analyze_radiation(
            110, 10, self.thresholds
        )

        self.assertEqual(
            result["alerts"]["dose_rate"],
            "CRITICAL"
        )

    def test_dose_increment_warning(self):
        result = analyze_radiation(
            20, 50, self.thresholds
        )

        self.assertEqual(
            result["alerts"]["dose_increment"],
            "WARNING"
        )

    def test_dose_increment_critical(self):
        result = analyze_radiation(
            20, 90, self.thresholds
        )

        self.assertEqual(
            result["alerts"]["dose_increment"],
            "CRITICAL"
        )

    def test_missing_dose_rate(self):
        result = analyze_radiation(
            None, 10, self.thresholds
        )

        self.assertEqual(
            result["alerts"]["dose_rate"],
            "DATA UNAVAILABLE"
        )

    def test_missing_thresholds(self):
        result = analyze_radiation(
            20, 10, {}
        )

        self.assertEqual(
            result["status"],
            "CONFIGURATION REQUIRED"
        )

    def test_missing_measurement_with_missing_thresholds(self):
        result = analyze_radiation(
            None,
            10,
            {}
        )

        self.assertEqual(
            result["alerts"]["dose_rate"],
            "DATA UNAVAILABLE"
        )

    def test_available_measurement_with_missing_thresholds(self):
        result = analyze_radiation(
            20,
            10,
            {}
        )

        self.assertEqual(
            result["alerts"]["dose_rate"],
            "CONFIGURATION REQUIRED"
        )


if __name__ == "__main__":
    unittest.main()
