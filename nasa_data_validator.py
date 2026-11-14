
import math
import re


BIOMARKER_FIELDS = [
    "a2_macroglobulin_concentration_nanogram_per_milliliter",
    "a2_macroglobulin_percent",
    "agp_concentration_nanogram_per_milliliter",
    "agp_percent",
    "crp_concentration_picogram_per_milliliter",
    "crp_percent",
    "fetuin_a36_concentration_nanogram_per_milliliter",
    "fetuin_a36_percent",
    "fibrinogen_concentration_nanogram_per_milliliter",
    "fibrinogen_percent",
    "haptoglobin_concentration_nanogram_per_milliliter",
    "haptoglobin_percent",
    "l_selectin_concentration_picogram_per_milliliter",
    "l_selectin_percent",
    "pf4_concentration_nanogram_per_milliliter",
    "pf4_percent",
    "sap_concentration_picogram_per_milliliter",
    "sap_percent"
]

EXPECTED_PARTICIPANTS = ["C001", "C002", "C003", "C004"]

EXPECTED_TIMEPOINTS = [
    "L-3",
    "L-44",
    "L-92",
    "R+1",
    "R+45",
    "R+82",
    "R+194"
]

SAMPLE_PATTERN = re.compile(
    r"^(C00[1-4])_serum_(L-3|L-44|L-92|R\+1|R\+45|R\+82|R\+194)$"
)


def validate_nasa_record(record):
    errors = []

    sample_name = str(record.get("sample_name", "")).strip()

    if not sample_name:
        errors.append("Missing sample_name")
    elif not SAMPLE_PATTERN.fullmatch(sample_name):
        errors.append(f"Invalid sample_name format: {sample_name}")

    for field in BIOMARKER_FIELDS:
        value = record.get(field)

        if value is None or str(value).strip() == "":
            errors.append(f"Missing {field}")
            continue

        try:
            number = float(value)
        except (ValueError, TypeError):
            errors.append(f"Non-numeric value in {field}")
            continue

        if not math.isfinite(number):
            errors.append(f"Non-finite value in {field}")
        elif number < 0:
            errors.append(f"Negative value in {field}")

    return {
        "status": "VALID" if not errors else "INVALID",
        "errors": errors
    }


def validate_nasa_dataset(records):
    errors = []

    if not isinstance(records, list):
        return {
            "status": "INVALID",
            "total_records": 0,
            "valid_records": 0,
            "errors": ["Dataset must be a list of records"]
        }

    if len(records) != 28:
        errors.append(
            f"Expected 28 samples, found {len(records)}"
        )

    seen_samples = set()
    found_samples = set()
    valid_records = 0

    for index, record in enumerate(records, start=1):
        validation = validate_nasa_record(record)

        if validation["status"] == "VALID":
            valid_records += 1

        for error in validation["errors"]:
            errors.append(f"Row {index}: {error}")

        sample_name = str(
            record.get("sample_name", "")
        ).strip()

        if sample_name:
            if sample_name in seen_samples:
                errors.append(
                    f"Duplicate sample_name: {sample_name}"
                )

            seen_samples.add(sample_name)
            found_samples.add(sample_name)

    expected_samples = {
        f"{participant}_serum_{timepoint}"
        for participant in EXPECTED_PARTICIPANTS
        for timepoint in EXPECTED_TIMEPOINTS
    }

    missing_samples = expected_samples - found_samples

    for sample in sorted(missing_samples):
        errors.append(f"Missing expected sample: {sample}")

    return {
        "status": "VALID" if not errors else "INVALID",
        "total_records": len(records),
        "valid_records": valid_records,
        "expected_records": 28,
        "errors": errors
    }
