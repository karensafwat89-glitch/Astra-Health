
import csv
import io
from pathlib import Path


async def load_csv(filename, assets=None):
    try:
        # Cloudflare Workers: load from Static Assets
        if assets is not None:
            response = await assets.fetch(
                f"https://assets.local/datasets/{filename}"
            )

            if response.status != 200:
                return {
                    "status": "error",
                    "message": f"Dataset not found: {filename}",
                    "records": []
                }

            file_content = await response.bytes()
            text = file_content.decode("utf-8-sig")

        # Local testing: load from the repository datasets folder
        else:
            dataset_path = (
                Path(__file__).resolve().parent.parent
                / "datasets"
                / filename
            )

            if not dataset_path.exists():
                return {
                    "status": "error",
                    "message": f"Dataset not found: {dataset_path}",
                    "records": []
                }

            text = dataset_path.read_text(encoding="utf-8-sig")

        reader = csv.DictReader(io.StringIO(text))
        records = list(reader)

        return {
            "status": "success",
            "filename": filename,
            "total_records": len(records),
            "records": records
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error),
            "records": []
        }
