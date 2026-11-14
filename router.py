
from datetime import date
from typing import Optional, Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, ConfigDict

from .processor import build_bone_trends

router = APIRouter(
    prefix="/bone-loss",
    tags=["Bone Loss"]
)

REGIONS = [
    "Spine", "Neck", "Trochanter", "Total",
    "Pelvis", "Arm", "Leg"
]

class DXARecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    astronaut_id: str = Field(min_length=1, max_length=100)
    measurement_date: date
    metric_type: Literal["BMD", "T-score", "Z-score"]

    mission_phase: Optional[str] = None
    flight_id: Optional[str] = None
    source_row: Optional[int] = None

    Spine: Optional[float] = None
    Neck: Optional[float] = None
    Trochanter: Optional[float] = None
    Total: Optional[float] = None
    Pelvis: Optional[float] = None
    Arm: Optional[float] = None
    Leg: Optional[float] = None

class DXAImportRequest(BaseModel):
    records: list[DXARecord] = Field(min_length=1)

@router.post("/import")
async def import_dxa_data(payload: DXAImportRequest):

    records = [
        item.model_dump(mode="json")
        for item in payload.records
    ]

    for record in records:
        if not any(
            record[region] is not None
            for region in REGIONS
        ):
            raise HTTPException(
                status_code=422,
                detail=f"Row {record['source_row']} has no regional measurements."
            )

    try:
        trends = build_bone_trends(records)

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    return {
        "status": "success",
        "imported_count": len(records),
        "astronaut_count": len({
            r["astronaut_id"] for r in records
        }),
        "records": records,
        "trends": trends,
        "storage": "temporary"
    }

@router.get("/astronaut/{astronaut_id}")
async def get_astronaut_bone_data(astronaut_id: str):
    raise HTTPException(
        status_code=404,
        detail="No persistent DXA records are configured yet."
    )
