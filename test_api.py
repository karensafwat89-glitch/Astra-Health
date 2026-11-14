
import unittest

from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


class TestAPI(unittest.TestCase):

    def test_home_endpoint(self):
        response = client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json()["project"],
            "ASTRA HEALTH"
        )

    def test_health_endpoint(self):
        response = client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json()["status"],
            "healthy"
        )

    def test_cardiovascular_endpoint(self):
        response = client.get("/cardiovascular")

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertEqual(
            data["module"],
            "cardiovascular"
        )

        self.assertGreater(data["total_records"], 0)

        for record in data["records"]:
            self.assertIn("validation", record)
            self.assertIn("analysis", record)
            self.assertIn("alert_status", record)

    def test_cardiovascular_threshold_configuration(self):
        response = client.get("/cardiovascular")

        records = response.json()["records"]

        good_records = [
            record for record in records
            if record["validation"]["status"] == "VALID"
        ]

        self.assertGreater(len(good_records), 0)

        for record in good_records:
            self.assertEqual(
                record["analysis"]["status"],
                "CONFIGURATION REQUIRED"
            )
    def test_poor_quality_cardiovascular_is_not_analyzed(self):
        response = client.get("/cardiovascular")
        records = response.json()["records"]

        poor_records = [
            record for record in records
            if record["validation"]["status"] == "POOR_QUALITY"
        ]

        self.assertGreater(len(poor_records), 0)

        for record in poor_records:
            self.assertEqual(
                record["analysis"]["status"],
                "POOR_QUALITY"
            )

            self.assertNotEqual(
                record["alert_status"],
                "NORMAL"
            )

    def test_poor_quality_radiation_is_not_analyzed(self):
        response = client.get("/radiation")
        records = response.json()["records"]

        poor_records = [
            record for record in records
            if record["validation"]["status"] == "POOR_QUALITY"
        ]

        self.assertGreater(len(poor_records), 0)

        for record in poor_records:
            self.assertEqual(
                record["analysis"]["status"],
                "POOR_QUALITY"
            )

            self.assertNotEqual(
                record["alert_status"],
                "NORMAL"
            )
    def test_radiation_endpoint(self):
        response = client.get("/radiation")

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertEqual(
            data["module"],
            "radiation"
        )

        self.assertGreater(data["total_records"], 0)

        for record in data["records"]:
            self.assertIn("validation", record)
            self.assertIn("analysis", record)
            self.assertIn("alert_status", record)

    def test_radiation_threshold_configuration(self):
        response = client.get("/radiation")

        records = response.json()["records"]

        good_records = [
            record for record in records
            if record["validation"]["status"] == "VALID"
        ]

        self.assertGreater(len(good_records), 0)

        for record in good_records:
            self.assertEqual(
                record["analysis"]["status"],
                "CONFIGURATION REQUIRED"
            )

    def test_sleep_fatigue_endpoint(self):
        response = client.get("/sleep-fatigue")

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertEqual(
            data["module"],
            "sleep_fatigue"
        )

        self.assertEqual(data["total_records"], 9)

    def test_fatigue_analysis_exists(self):
        response = client.get("/sleep-fatigue")

        records = response.json()["records"]

        for record in records:
            self.assertIn("fatigue_analysis", record)

            self.assertIn(
                "status",
                record["fatigue_analysis"]
            )

    def test_poor_cardiovascular_data_is_not_analyzed(self):
        response = client.get("/cardiovascular")
        records = response.json()["records"]

        poor_records = [
            record for record in records
            if record["validation"]["status"] == "POOR_QUALITY"
        ]

        self.assertGreater(len(poor_records), 0)

        for record in poor_records:
            self.assertEqual(
                record["analysis"]["status"],
                "POOR_QUALITY"
            )

            self.assertEqual(
                record["analysis"]["alerts"],
                {}
            )

    def test_poor_radiation_data_is_not_analyzed(self):
        response = client.get("/radiation")
        records = response.json()["records"]

        poor_records = [
            record for record in records
            if record["validation"]["status"] == "POOR_QUALITY"
        ]

        self.assertGreater(len(poor_records), 0)

        for record in poor_records:
            self.assertEqual(
                record["analysis"]["status"],
                "POOR_QUALITY"
            )

            self.assertEqual(
                record["analysis"]["alerts"],
                {}
            )

    def test_cors_allows_frontend_origin(self):
        response = client.get(
            "/health",
            headers={
                "Origin": "http://localhost:5173"
            }
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.headers.get(
                "access-control-allow-origin"
            ),
            "http://localhost:5173"
        )


if __name__ == "__main__":
    unittest.main()
