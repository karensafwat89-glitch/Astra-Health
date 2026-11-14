
import unittest

from rule_engine import analyze_cardiovascular


class TestCardiovascularEngine(unittest.TestCase):

    def setUp(self):
        # Artificial test thresholds.
        # These are NOT medical recommendations.
        self.thresholds = {
            "heart_rate_warning": 100,
            "heart_rate_critical": 120,
            "hrv_warning": 40,
            "hrv_critical": 25,
            "spo2_warning": 95,
            "spo2_critical": 90
        }

    def test_normal_measurements(self):
        result = analyze_cardiovascular(
            75, 55, 98, self.thresholds
        )

        self.assertEqual(result["status"], "NORMAL")

    def test_high_heart_rate_warning(self):
        result = analyze_cardiovascular(
            105, 55, 98, self.thresholds
        )

        self.assertEqual(
            result["alerts"]["heart_rate"],
            "WARNING"
        )

    def test_critical_heart_rate(self):
        result = analyze_cardiovascular(
            125, 55, 98, self.thresholds
        )

        self.assertEqual(
            result["alerts"]["heart_rate"],
            "CRITICAL"
        )

    def test_low_hrv_warning(self):
        result = analyze_cardiovascular(
            75, 35, 98, self.thresholds
        )

        self.assertEqual(
            result["alerts"]["hrv"],
            "WARNING"
        )

    def test_low_spo2_critical(self):
        result = analyze_cardiovascular(
            75, 55, 88, self.thresholds
        )

        self.assertEqual(
            result["alerts"]["spo2"],
            "CRITICAL"
        )

    def test_missing_heart_rate(self):
        result = analyze_cardiovascular(
            None, 55, 98, self.thresholds
        )

        self.assertEqual(
            result["alerts"]["heart_rate"],
            "DATA UNAVAILABLE"
        )

    def test_missing_threshold_configuration(self):
        result = analyze_cardiovascular(
            75, 55, 98, {}
        )

        self.assertEqual(
            result["status"],
            "CONFIGURATION REQUIRED"
        )


    def test_missing_measurement_with_missing_thresholds(self):
        result = analyze_cardiovascular(
            None,
            55,
            98,
            {}
        )

        self.assertEqual(
            result["alerts"]["heart_rate"],
            "DATA UNAVAILABLE"
        )

    def test_available_measurement_with_missing_thresholds(self):
        result = analyze_cardiovascular(
            75,
            55,
            98,
            {}
        )

        self.assertEqual(
            result["alerts"]["heart_rate"],
            "CONFIGURATION REQUIRED"
        )

if __name__ == "__main__":
    unittest.main()
