
import json


def clean_records(records):
    """
    Normalize CSV records while preserving original data.
    Duplicate records are detected, not deleted.
    """

    raw_records = []
    cleaned_records = []
    seen_records = {}
    duplicate_rows = []
    invalid_rows = []
    blank_values_normalized = 0

    for row_number, raw_record in enumerate(records, start=1):

        if not isinstance(raw_record, dict):
            invalid_rows.append(row_number)
            continue

        # Preserve the original record
        raw_copy = dict(raw_record)
        raw_records.append(raw_copy)

        cleaned_record = {}

        for field, value in raw_record.items():

            if isinstance(value, str):
                value = value.strip()

                if value == "":
                    value = None
                    blank_values_normalized += 1

            cleaned_record[field] = value

        signature = json.dumps(
            cleaned_record,
            sort_keys=True,
            ensure_ascii=False,
            default=str
        )

        if signature in seen_records:
            duplicate_rows.append({
                "row": row_number,
                "duplicate_of": seen_records[signature]
            })
        else:
            seen_records[signature] = row_number

        cleaned_records.append(cleaned_record)

    return {
        "raw_records": raw_records,
        "records": cleaned_records,
        "report": {
            "total_input_records": len(records),
            "total_output_records": len(cleaned_records),
            "blank_values_normalized": blank_values_normalized,
            "duplicate_records_detected": len(duplicate_rows),
            "duplicate_rows": duplicate_rows,
            "invalid_rows": invalid_rows
        }
    }
