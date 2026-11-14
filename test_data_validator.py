
import unittest
from data_validator import validate_record


class TestDataValidator(unittest.TestCase):

    # Cardiovascular Tests

    def test_valid_cardiovascular_record(self):
        record = {
            "astronaut_id": "ASTRONAUT_01",
            "heart_rate_bpm": "72",
            "hrv_ms": "55",
            "spo2_percent": "98",
            "measurement_quality": "GOOD"
        }

        result = validate_record("cardiovascular", record)
        self.assertEqual(result["status"], "VALID")

    def test_invalid_heart_rate(self):
        record = {
            "astronaut_id": "ASTRONAUT_01",
            "heart_rate_bpm": "-5",
            "hrv_ms": "55",
            "spo2_percent": "98",
            "measurement_quality": "GOOD"
        }

        result = validate_record("cardiovascular", record)
        self.assertEqual(result["status"], "INVALID")

    def test_invalid_spo2(self):
        record = {
            "astronaut_id": "ASTRONAUT_01",
            "heart_rate_bpm": "72",
            "hrv_ms": "55",
            "spo2_percent": "120",
            "measurement_quality": "GOOD"
        }

        result = validate_record("cardiovascular", record)
        self.assertEqual(result["status"], "INVALID")

    def test_missing_astronaut_id(self):
        record = {
            "heart_rate_bpm": "72",
            "hrv_ms": "55",
            "spo2_percent": "98",
            "measurement_quality": "GOOD"
        }

        result = validate_record("cardiovascular", record)
        self.assertEqual(result["status"], "INVALID")

    def test_poor_measurement_quality(self):
        record = {
            "astronaut_id": "ASTRONAUT_01",
            "heart_rate_bpm": "72",
            "hrv_ms": "55",
            "spo2_percent": "98",
            "measurement_quality": "POOR"
        }

        result = validate_record("cardiovascular", record)
        self.assertEqual(result["status"], "POOR_QUALITY")

    # Sleep and Fatigue Tests

    def test_valid_sleep_record(self):
        record = {
            "astronaut_id": "ASTRONAUT_01",
            "sleep_duration_hours": "8.5",
            "sleep_target_hours": "8.5",
            "sleep_quality": "5",
            "source_type": "SIMULATED"
        }

        result = validate_record("sleep_fatigue", record)
        self.assertEqual(result["status"], "VALID")

    def test_invalid_sleep_quality(self):
        record = {
            "astronaut_id": "ASTRONAUT_01",
            "sleep_duration_hours": "7",
            "sleep_target_hours": "8.5",
            "sleep_quality": "6",
            "source_type": "SIMULATED"
        }

        result = validate_record("sleep_fatigue", record)
        self.assertEqual(result["status"], "INVALID")

    def test_missing_sleep_duration(self):
        record = {
            "astronaut_id": "ASTRONAUT_01",
            "sleep_duration_hours": "",
            "sleep_target_hours": "8.5",
            "sleep_quality": "5",
            "source_type": "SIMULATED"
        }

        result = validate_record("sleep_fatigue", record)
        self.assertEqual(result["status"], "INVALID")

    # Radiation Tests

    def test_valid_radiation_record(self):
        record = {
            "astronaut_id": "ASTRONAUT_01",
            "interval_duration_hours": "1",
            "dose_rate_uSv_h": "10",
            "dose_increment_uSv": "10",
            "measurement_quality": "GOOD"
        }

        result = validate_record("radiation", record)
        self.assertEqual(result["status"], "VALID")

    def test_negative_radiation_dose(self):
        record = {
            "astronaut_id": "ASTRONAUT_01",
            "interval_duration_hours": "1",
            "dose_rate_uSv_h": "10",
            "dose_increment_uSv": "-5",
            "measurement_quality": "GOOD"
        }

        result = validate_record("radiation", record)
        self.assertEqual(result["status"], "INVALID")

    def test_poor_radiation_quality(self):
        record = {
            "astronaut_id": "ASTRONAUT_01",
            "interval_duration_hours": "1",
            "dose_rate_uSv_h": "10",
            "dose_increment_uSv": "10",
            "measurement_quality": "POOR"
        }

        result = validate_record("radiation", record)
        self.assertEqual(result["status"], "POOR_QUALITY")


if __name__ == "__main__":
    unittest.main()
