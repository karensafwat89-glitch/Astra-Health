
import math
from collections import defaultdict
from datetime import datetime


def to_number(value):
    try:
        number = float(value)
        return number if math.isfinite(number) else None
    except (ValueError, TypeError):
        return None


def parse_timestamp(value):
    if not value:
        return None

    try:
        return datetime.fromisoformat(
            str(value).replace("Z", "+00:00")
        )
    except (ValueError, TypeError):
        return None


def calculate_baseline(values):
    valid_values = [
        number for value in values
        if (number := to_number(value)) is not None
    ]

    if not valid_values:
        return {
            "sample_count": 0,
            "mean": None,
            "minimum": None,
            "maximum": None,
            "status": "INSUFFICIENT_DATA"
        }

    mean = sum(valid_values) / len(valid_values)

    return {
        "sample_count": len(valid_values),
        "mean": round(mean, 2),
        "minimum": min(valid_values),
        "maximum": max(valid_values),
        "status": (
            "AVAILABLE"
            if len(valid_values) >= 3
            else "LIMITED_DATA"
        )
    }


def analyze_trend(values):
    valid_values = [
        number for value in values
        if (number := to_number(value)) is not None
    ]

    if len(valid_values) < 2:
        return {
            "direction": "INSUFFICIENT_DATA",
            "change": None,
            "change_percent": None
        }

    first = valid_values[0]
    last = valid_values[-1]

    change = last - first

    change_percent = (
        (change / abs(first)) * 100
        if first != 0
        else None
    )

    if change > 0:
        direction = "INCREASING"
    elif change < 0:
        direction = "DECREASING"
    else:
        direction = "STABLE"

    return {
        "direction": direction,
        "first_value": first,
        "last_value": last,
        "change": round(change, 2),
        "change_percent": (
            round(change_percent, 2)
            if change_percent is not None
            else None
        )
    }


def detect_anomalies(
    values,
    minimum_samples=5,
    z_threshold=2.5
):
    valid_values = [
        to_number(value) for value in values
    ]

    valid_values = [
        value for value in valid_values
        if value is not None
    ]

    if len(valid_values) < minimum_samples:
        return {
            "status": "INSUFFICIENT_DATA",
            "anomaly_count": 0,
            "anomalies": []
        }

    mean = sum(valid_values) / len(valid_values)

    variance = sum(
        (value - mean) ** 2
        for value in valid_values
    ) / len(valid_values)

    standard_deviation = math.sqrt(variance)

    if standard_deviation == 0:
        return {
            "status": "NO_VARIATION",
            "anomaly_count": 0,
            "anomalies": []
        }

    anomalies = []

    for index, value in enumerate(valid_values):
        z_score = (
            value - mean
        ) / standard_deviation

        if abs(z_score) >= z_threshold:
            anomalies.append({
                "index": index,
                "value": value,
                "z_score": round(z_score, 2)
            })

    return {
        "status": "ANALYZED",
        "anomaly_count": len(anomalies),
        "anomalies": anomalies
    }


def monitor_personal_baseline(
    historical_values,
    latest_value,
    minimum_baseline_samples=3,
    z_threshold=2.5
):
    """
    Compare the latest measurement with the same
    astronaut's previous measurements.

    This is statistical monitoring, NOT a clinical
    reference range or medical diagnosis.
    """

    baseline_values = [
        number for value in historical_values
        if (number := to_number(value)) is not None
    ]

    latest = to_number(latest_value)

    if latest is None:
        return {
            "status": "INVALID OR MISSING LATEST VALUE",
            "baseline_sample_count": len(baseline_values),
            "baseline_mean": None,
            "latest_value": None,
            "deviation": None,
            "z_score": None,
            "interpretation": "Latest measurement cannot be evaluated."
        }

    if len(baseline_values) < minimum_baseline_samples:
        return {
            "status": "INSUFFICIENT_BASELINE_DATA",
            "baseline_sample_count": len(baseline_values),
            "baseline_mean": (
                round(
                    sum(baseline_values) / len(baseline_values),
                    2
                )
                if baseline_values
                else None
            ),
            "latest_value": latest,
            "deviation": None,
            "z_score": None,
            "interpretation": (
                "More valid historical measurements are required "
                "before personal baseline comparison."
            )
        }

    mean = sum(baseline_values) / len(baseline_values)

    deviation = latest - mean

    variance = sum(
        (value - mean) ** 2
        for value in baseline_values
    ) / len(baseline_values)

    standard_deviation = math.sqrt(variance)

    if standard_deviation == 0:

        if latest == mean:
            status = "WITHIN_PERSONAL_VARIATION"
            z_score = 0.0
        else:
            status = "BASELINE_DEVIATION_REVIEW"
            z_score = None

    else:

        z_score = deviation / standard_deviation

        status = (
            "BASELINE_DEVIATION_REVIEW"
            if abs(z_score) >= z_threshold
            else "WITHIN_PERSONAL_VARIATION"
        )

    return {
        "status": status,
        "baseline_sample_count": len(baseline_values),
        "baseline_mean": round(mean, 2),
        "baseline_standard_deviation": round(
            standard_deviation, 2
        ),
        "latest_value": latest,
        "deviation": round(deviation, 2),
        "z_score": (
            round(z_score, 2)
            if z_score is not None
            else None
        ),
        "statistical_threshold": z_threshold,
        "interpretation": (
            "Statistical deviation detected. Review the measurement "
            "and relevant health context."
            if status == "BASELINE_DEVIATION_REVIEW"
            else "No statistical deviation detected against the "
                 "available personal baseline."
        )
    }


def analyze_health_records(
    records,
    metric_fields=None
):
    """
    Analyze valid cardiovascular measurements
    grouped by astronaut.

    Personal baselines are descriptive and are
    not clinical reference ranges.
    """

    if metric_fields is None:
        metric_fields = [
            "heart_rate_bpm",
            "hrv_ms",
            "spo2_percent"
        ]

    grouped_records = defaultdict(list)

    for record in records:

        astronaut_id = record.get("astronaut_id")

        if not astronaut_id:
            continue

        if record.get("validation_status") not in (
            None, "VALID"
        ):
            continue

        timestamp = parse_timestamp(
            record.get("timestamp_utc")
        )

        grouped_records[astronaut_id].append({
            "record": record,
            "timestamp": timestamp
        })

    results = {}

    for astronaut_id, entries in grouped_records.items():

        entries.sort(
            key=lambda item: (
                item["timestamp"] is None,
                item["timestamp"].timestamp()
                if item["timestamp"] is not None
                else 0
            )
        )

        astronaut_result = {}

        for field in metric_fields:

            values = [
                item["record"].get(field)
                for item in entries
            ]

            baseline = calculate_baseline(values)
            trend = analyze_trend(values)
            anomalies = detect_anomalies(values)

            latest_value = (
                values[-1] if values else None
            )

            previous_values = values[:-1]

            personal_monitoring = monitor_personal_baseline(
                historical_values=previous_values,
                latest_value=latest_value
            )

            astronaut_result[field] = {
                "baseline": baseline,
                "trend": trend,
                "anomaly_detection": anomalies,
                "personal_baseline_monitoring": personal_monitoring
            }

        results[astronaut_id] = astronaut_result

    return {
        "module": "health_analysis",
        "astronaut_count": len(results),
        "results": results
    }
