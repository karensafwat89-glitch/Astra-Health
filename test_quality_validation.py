
import math
from datetime import datetime


def is_finite_number(value):
    try:
        number = float(value)
        return math.isfinite(number)
    except (ValueError, TypeError):
        return False


def validate_timestamp(value):
    if not value:
        return True

    try:
        datetime.fromisoformat(
            str(value).replace("Z", "+00:00")
        )
        return True
    except (ValueError, TypeError):
        return False


def validate_record(module, record):
    errors = []

    if not record.get("astronaut_id"):
        errors.append("Missing astronaut ID")

    timestamp_field = (
        "sleep_date"
        if module == "sleep_fatigue"
        else "timestamp_utc"
    )

    timestamp = record.get(timestamp_field)

    if timestamp and not validate_timestamp(timestamp):
        errors.append(f"Invalid {timestamp_field}")

    numeric_rules = {
        "cardiovascular": {
            "heart_rate_bpm": ("positive", "Invalid heart rate"),
            "hrv_ms": ("non_negative", "Invalid HRV"),
            "spo2_percent": ("percentage", "Invalid SpO2")
        },
        "sleep_fatigue": {
            "sleep_duration_hours": (
                "non_negative", "Invalid sleep duration"
            ),
            "sleep_target_hours": (
                "positive", "Invalid sleep target"
            ),
            "sleep_quality": (
                "quality", "Invalid sleep quality"
            )
        },
        "radiation": {
            "interval_duration_hours": (
                "positive", "Invalid interval duration"
            ),
            "dose_rate_uSv_h": (
                "non_negative", "Invalid dose rate"
            ),
            "dose_increment_uSv": (
                "non_negative", "Invalid dose increment"
            )
        }
    }

    if module not in numeric_rules:
        errors.append("Unknown module")
    else:
        for field, (rule, error_message) in numeric_rules[module].items():
            value = record.get(field)

            if value is None or value == "":
                errors.append(f"Missing {field}")
                continue

            if not is_finite_number(value):
                errors.append(f"Non-numeric or non-finite {field}")
                continue

            number = float(value)

            if rule == "positive" and number <= 0:
                errors.append(error_message)

            elif rule == "non_negative" and number < 0:
                errors.append(error_message)

            elif rule == "percentage" and not 0 <= number <= 100:
                errors.append(error_message)

            elif rule == "quality" and number not in [1, 2, 3, 4, 5]:
                errors.append(error_message)

    if errors:
        return {
            "status": "INVALID",
            "errors": errors
        }

    if module in ["cardiovascular", "radiation"]:
        quality = str(
            record.get("measurement_quality") or ""
        ).strip().upper()

        if quality == "POOR":
            return {
                "status": "POOR_QUALITY",
                "errors": []
            }

        if quality == "UNKNOWN":
            return {
                "status": "UNKNOWN_QUALITY",
                "errors": []
            }

        if quality != "GOOD":
            return {
                "status": "UNKNOWN_QUALITY",
                "errors": ["Missing or invalid measurement quality"]
            }

    return {
        "status": "VALID",
        "errors": []
    }
