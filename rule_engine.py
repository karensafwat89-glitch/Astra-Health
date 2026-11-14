
import math


def is_missing(value):
    return value is None or (
        isinstance(value, str) and value.strip() == ""
    )


def finite_number(value):
    try:
        number = float(value)
        return number if math.isfinite(number) else None
    except (ValueError, TypeError):
        return None


def calculate_fatigue_score(
    sleep_target_hours,
    sleep_duration_hours,
    sleep_quality,
    consecutive_deficit_days
):
    """
    Experimental fatigue score.
    Not clinically validated.
    """

    values = [
        sleep_target_hours,
        sleep_duration_hours,
        sleep_quality,
        consecutive_deficit_days
    ]

    if any(is_missing(value) for value in values):
        return {
            "status": "DATA UNAVAILABLE",
            "score": None,
            "category": None
        }

    target = finite_number(sleep_target_hours)
    actual = finite_number(sleep_duration_hours)
    quality = finite_number(sleep_quality)
    deficit_days = finite_number(consecutive_deficit_days)

    if any(
        value is None
        for value in [target, actual, quality, deficit_days]
    ):
        return {
            "status": "INVALID DATA",
            "score": None,
            "category": None
        }

    if (
        target <= 0
        or actual < 0
        or quality not in [1, 2, 3, 4, 5]
        or deficit_days < 0
        or not deficit_days.is_integer()
    ):
        return {
            "status": "INVALID DATA",
            "score": None,
            "category": None
        }

    duration_deficit = min(
        100,
        max(0, (target - actual) / target * 100)
    )

    quality_score = ((5 - quality) / 4) * 100

    consecutive_score = min(
        100,
        deficit_days / 3 * 100
    )

    fatigue_score = (
        0.5 * duration_deficit
        + 0.3 * quality_score
        + 0.2 * consecutive_score
    )

    fatigue_score = round(fatigue_score, 1)

    if fatigue_score < 30:
        category = "LOW"
    elif fatigue_score < 60:
        category = "MODERATE"
    else:
        category = "HIGH"

    return {
        "status": "CALCULATED",
        "score": fatigue_score,
        "category": category
    }


def classify_alert(
    value,
    warning_threshold=None,
    critical_threshold=None,
    direction="HIGH"
):
    # Missing measurement takes priority over missing thresholds.
    if is_missing(value):
        return "DATA UNAVAILABLE"

    value = finite_number(value)

    if value is None:
        return "INVALID DATA"

    if warning_threshold is None or critical_threshold is None:
        return "CONFIGURATION REQUIRED"

    warning = finite_number(warning_threshold)
    critical = finite_number(critical_threshold)

    if warning is None or critical is None:
        return "INVALID CONFIGURATION"

    direction = str(direction).upper()

    if direction == "HIGH":

        if critical <= warning:
            return "INVALID CONFIGURATION"

        if value >= critical:
            return "CRITICAL"

        if value >= warning:
            return "WARNING"

        return "NORMAL"

    if direction == "LOW":

        if critical >= warning:
            return "INVALID CONFIGURATION"

        if value <= critical:
            return "CRITICAL"

        if value <= warning:
            return "WARNING"

        return "NORMAL"

    return "INVALID CONFIGURATION"


def get_overall_status(alerts):
    priority = [
        "CRITICAL",
        "INVALID CONFIGURATION",
        "INVALID DATA",
        "DATA UNAVAILABLE",
        "CONFIGURATION REQUIRED",
        "WARNING",
        "NORMAL"
    ]

    return next(
        (
            status
            for status in priority
            if status in alerts.values()
        ),
        "DATA UNAVAILABLE"
    )


def analyze_cardiovascular(
    heart_rate_bpm,
    hrv_ms,
    spo2_percent,
    thresholds
):
    if not isinstance(thresholds, dict):
        thresholds = {}

    alerts = {
        "heart_rate": classify_alert(
            heart_rate_bpm,
            thresholds.get("heart_rate_warning"),
            thresholds.get("heart_rate_critical"),
            "HIGH"
        ),
        "hrv": classify_alert(
            hrv_ms,
            thresholds.get("hrv_warning"),
            thresholds.get("hrv_critical"),
            "LOW"
        ),
        "spo2": classify_alert(
            spo2_percent,
            thresholds.get("spo2_warning"),
            thresholds.get("spo2_critical"),
            "LOW"
        )
    }

    return {
        "status": get_overall_status(alerts),
        "alerts": alerts
    }


def analyze_radiation(
    dose_rate_uSv_h,
    dose_increment_uSv,
    thresholds
):
    if not isinstance(thresholds, dict):
        thresholds = {}

    alerts = {
        "dose_rate": classify_alert(
            dose_rate_uSv_h,
            thresholds.get("dose_rate_warning"),
            thresholds.get("dose_rate_critical"),
            "HIGH"
        ),
        "dose_increment": classify_alert(
            dose_increment_uSv,
            thresholds.get("dose_increment_warning"),
            thresholds.get("dose_increment_critical"),
            "HIGH"
        )
    }

    return {
        "status": get_overall_status(alerts),
        "alerts": alerts
    }
