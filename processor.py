
from collections import defaultdict

REGIONS = [
    "Spine", "Neck", "Trochanter", "Total",
    "Pelvis", "Arm", "Leg"
]

def build_bone_trends(records):
    groups = defaultdict(list)

    for record in records:
        for region in REGIONS:
            value = record.get(region)

            if value is not None:
                key = (
                    record["astronaut_id"],
                    record["metric_type"],
                    region
                )

                groups[key].append({
                    "date": record["measurement_date"],
                    "value": float(value),
                    "source_row": record.get("source_row")
                })

    results = {}

    for (astronaut_id, metric, region), points in groups.items():
        points.sort(key=lambda x: x["date"])

        dates = [p["date"] for p in points]

        if len(dates) != len(set(dates)):
            raise ValueError(
                f"Duplicate date for {astronaut_id}, "
                f"{metric}, {region}. Resolve duplicate measurements."
            )

        baseline = points[0]
        baseline_value = baseline["value"]

        processed = []

        for point in points:
            delta = point["value"] - baseline_value

            item = {
                **point,
                "change_from_baseline": round(delta, 6)
            }

            if metric == "BMD":
                item["percent_change_from_baseline"] = (
                    round(delta / baseline_value * 100, 4)
                    if baseline_value != 0 else None
                )

            processed.append(item)

        results.setdefault(
            astronaut_id, {}
        ).setdefault(
            metric, {}
        )[region] = {
            "baseline": baseline_value,
            "latest": points[-1]["value"],
            "points": processed
        }

    return results
