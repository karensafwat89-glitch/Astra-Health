
import csv
import unittest
from pathlib import Path

from nasa_data_validator import (
    validate_nasa_dataset,
    BIOMARKER_FIELDS
)


class TestNASADataValidator(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        dataset_path = (
            Path(__file__).resolve().parent.parent
            / "datasets"
            / "nasa_osd575_cardiovascular.csv"
        )

        with dataset_path.open(
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as file:
            reader = csv.DictReader(file)
            cls.fieldnames = reader.fieldnames
            cls.records = list(reader)

    def test_dataset_has_28_samples(self):
        self.assertEqual(len(self.records), 28)

    def test_dataset_has_19_columns(self):
        self.assertEqual(len(self.fieldnames), 19)

    def test_all_biomarker_columns_exist(self):
        for field in BIOMARKER_FIELDS:
            self.assertIn(field, self.fieldnames)

    def test_dataset_validation(self):
        result = validate_nasa_dataset(self.records)

        self.assertEqual(
            result["status"],
            "VALID",
            msg="\n".join(result["errors"])
        )

        self.assertEqual(result["total_records"], 28)
        self.assertEqual(result["valid_records"], 28)

    def test_no_duplicate_samples(self):
        sample_names = [
            record["sample_name"]
            for record in self.records
        ]

        self.assertEqual(
            len(sample_names),
            len(set(sample_names))
        )

    def test_invalid_sample_name_is_rejected(self):
        from nasa_data_validator import validate_nasa_record

        record = self.records[0].copy()
        record["sample_name"] = "INVALID_SAMPLE"

        result = validate_nasa_record(record)

        self.assertEqual(result["status"], "INVALID")

    def test_negative_biomarker_is_rejected(self):
        from nasa_data_validator import validate_nasa_record

        record = self.records[0].copy()
        record["crp_percent"] = "-10"

        result = validate_nasa_record(record)

        self.assertEqual(result["status"], "INVALID")


if __name__ == "__main__":
    unittest.main()
