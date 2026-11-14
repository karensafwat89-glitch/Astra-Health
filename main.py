
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import os

from data_loader import load_csv
from data_cleaner import clean_records
from data_validator import validate_record
from nasa_data_validator import validate_nasa_dataset

from rule_engine import (
    calculate_fatigue_score,
    analyze_cardiovascular,
    analyze_radiation
)

from ai_assistant import ask_astra_ai
from analysis_engine import analyze_health_records
from bone_loss.router import router as bone_loss_router

app = FastAPI(
    title="ASTRA HEALTH",
    description="Astronaut Health Monitoring System",
    version="1.1.0"
)


FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:5173"
)
app.include_router(bone_loss_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_ORIGIN,
        "http://127.0.0.1:5173"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)


# Mission-approved thresholds must be configured later.

CARDIOVASCULAR_THRESHOLDS = {}
RADIATION_THRESHOLDS = {}


# Get Cloudflare Assets when running inside Workers.

def get_assets(request: Request):

    env = request.scope.get("env")

    if env is None:
        return None

    if isinstance(env, dict):
        return env.get("ASSETS")

    return getattr(env, "ASSETS", None)


# Get environment variables from Cloudflare or local environment.

def get_environment_value(request: Request, name: str):

    env = request.scope.get("env")

    if isinstance(env, dict):
        value = env.get(name)

    elif env is not None:
        value = getattr(env, name, None)

    else:
        value = None

    return value if value is not None else os.getenv(name)


# Load module data

async def load_module_data(filename, assets=None):

    result = await load_csv(filename, assets)

    if result["status"] == "error":
        raise HTTPException(
            status_code=404,
            detail=result["message"]
        )

    return result["records"]


# Load and clean module data

async def load_clean_module_data(filename, assets=None):

    raw_records = await load_module_data(
        filename,
        assets
    )

    cleaning_result = clean_records(raw_records)

    return {
        "raw_records": cleaning_result["raw_records"],
        "records": cleaning_result["records"],
        "cleaning_report": cleaning_result["report"]
    }


# Build validation summary

def build_validation_report(analyzed_records):

    report = {}

    for item in analyzed_records:

        status = item["validation"]["status"]

        report[status] = report.get(status, 0) + 1

    return {
        "total_records": len(analyzed_records),
        "status_counts": report
    }


# Home page

@app.get("/")
async def home(request: Request):

    assets = get_assets(request)

    if assets is None:
        return {
            "project": "ASTRA HEALTH"
        }

    response = await assets.fetch(
        "https://assets.local/index.html"
    )

    body = await response.bytes()

    return Response(
        content=body,
        status_code=response.status,
        headers=dict(response.headers)
    )


# System health

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "modules": [
            "Cardiovascular",
            "Sleep and Fatigue",
            "Radiation",
            "Data Cleaning",
            "ASTRA AI"
        ]
    }


# Cardiovascular module

@app.get("/cardiovascular")
async def get_cardiovascular_data(request: Request):

    assets = get_assets(request)

    dataset = await load_clean_module_data(
        "cardiovascular.csv",
        assets
    )

    raw_records = dataset["raw_records"]
    records = dataset["records"]

    analyzed_records = []

    for record in records:

        validation = validate_record(
            "cardiovascular",
            record
        )

        if validation["status"] == "VALID":

            analysis = analyze_cardiovascular(
                record["heart_rate_bpm"],
                record["hrv_ms"],
                record["spo2_percent"],
                CARDIOVASCULAR_THRESHOLDS
            )

        else:

            analysis = {
                "status": validation["status"],
                "alerts": {},
                "message": (
                    "Measurement not analyzed because "
                    "data validation did not pass."
                )
            }

        analyzed_records.append({
            "data": record,
            "validation": validation,
            "analysis": analysis,
            "alert_status": analysis["status"]
        })

    # Prepare validated records for advanced analysis.

    analysis_records = [
        {
            **item["data"],
            "validation_status": item["validation"]["status"]
        }
        for item in analyzed_records
    ]

    # Calculate baseline, trends, anomalies,
    # and personal baseline monitoring.

    advanced_analysis = analyze_health_records(
        analysis_records
    )

    return {
        "module": "cardiovascular",
        "total_records": len(analyzed_records),
        "raw_data": raw_records,
        "cleaning_report": dataset["cleaning_report"],
        "validation_report": build_validation_report(
            analyzed_records
        ),
        "records": analyzed_records,
        "advanced_analysis": advanced_analysis
    }


# Radiation module

@app.get("/radiation")
async def get_radiation_data(request: Request):

    assets = get_assets(request)

    dataset = await load_clean_module_data(
        "radiation.csv",
        assets
    )

    raw_records = dataset["raw_records"]
    records = dataset["records"]

    analyzed_records = []

    for record in records:

        validation = validate_record(
            "radiation",
            record
        )

        if validation["status"] == "VALID":

            analysis = analyze_radiation(
                record["dose_rate_uSv_h"],
                record["dose_increment_uSv"],
                RADIATION_THRESHOLDS
            )

        else:

            analysis = {
                "status": validation["status"],
                "alerts": {},
                "message": (
                    "Measurement not analyzed because "
                    "data validation did not pass."
                )
            }

        analyzed_records.append({
            "data": record,
            "validation": validation,
            "analysis": analysis,
            "alert_status": analysis["status"]
        })

    return {
        "module": "radiation",
        "total_records": len(analyzed_records),
        "raw_data": raw_records,
        "cleaning_report": dataset["cleaning_report"],
        "validation_report": build_validation_report(
            analyzed_records
        ),
        "records": analyzed_records
    }


# Sleep and fatigue module

@app.get("/sleep-fatigue")
async def get_sleep_fatigue_data(request: Request):

    assets = get_assets(request)

    dataset = await load_clean_module_data(
        "sleep_fatigue.csv",
        assets
    )

    raw_records = dataset["raw_records"]
    records = dataset["records"]

    astronaut_records = {}

    for record in records:

        astronaut_id = record.get("astronaut_id")

        if astronaut_id:
            astronaut_records.setdefault(
                astronaut_id, []
            ).append(record)

    analyzed_records = []

    for astronaut_id, sleep_records in astronaut_records.items():

        sleep_records.sort(
            key=lambda item: item.get("sleep_date") or ""
        )

        consecutive_deficit_days = 0

        for record in sleep_records:

            validation = validate_record(
                "sleep_fatigue",
                record
            )

            if validation["status"] != "VALID":

                consecutive_deficit_days = 0

                fatigue_result = {
                    "status": "DATA UNAVAILABLE",
                    "score": None,
                    "category": None
                }

            else:

                actual_sleep = float(
                    record["sleep_duration_hours"]
                )

                target_sleep = float(
                    record["sleep_target_hours"]
                )

                if actual_sleep < target_sleep:
                    consecutive_deficit_days += 1
                else:
                    consecutive_deficit_days = 0

                fatigue_result = calculate_fatigue_score(
                    target_sleep,
                    actual_sleep,
                    record["sleep_quality"],
                    consecutive_deficit_days
                )

            analyzed_records.append({
                "data": record,
                "validation": validation,
                "consecutive_deficit_days": consecutive_deficit_days,
                "fatigue_analysis": fatigue_result
            })

    return {
        "module": "sleep_fatigue",
        "total_records": len(analyzed_records),
        "raw_data": raw_records,
        "cleaning_report": dataset["cleaning_report"],
        "validation_report": build_validation_report(
            analyzed_records
        ),
        "records": analyzed_records
    }


# NASA OSDR Cardiovascular Biomarkers
# Kept as a legacy data endpoint only.
# Excluded from the ASTRA AI health interpretation workflow.

@app.get("/nasa/osd-575")
async def get_nasa_osd575_data(request: Request):

    assets = get_assets(request)

    records = await load_module_data(
        "nasa_osd575_cardiovascular.csv",
        assets
    )

    validation = validate_nasa_dataset(records)

    return {
        "module": "nasa_osd575_cardiovascular",
        "study_id": "OSD-575",
        "source": "NASA Open Science Data Repository",
        "data_type": "Serum cardiovascular biomarkers",
        "total_records": len(records),
        "validation": validation,
        "records": records
    }


# ASTRA AI Chat

class ChatRequest(BaseModel):
    question: str


@app.post("/chat")
async def chat_with_astra(
    chat_request: ChatRequest,
    request: Request
):

    question = chat_request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    if len(question) > 1000:
        raise HTTPException(
            status_code=400,
            detail="Question is too long."
        )

    try:

        # Load current health data and analysis.

        cardiovascular = await get_cardiovascular_data(
            request
        )

        radiation = await get_radiation_data(
            request
        )

        sleep = await get_sleep_fatigue_data(
            request
        )

        # Build complete health context for ASTRA AI.
        # Cardiovascular includes:
        # - Individual baselines
        # - Trend analysis
        # - Anomaly detection
        # - Personal baseline monitoring

        health_context = {
            "system": "ASTRA HEALTH",
            "cardiovascular": cardiovascular,
            "radiation": radiation,
            "sleep_fatigue": sleep
        }

        # Read OpenAI credentials from Cloudflare environment.

        api_key = get_environment_value(
            request,
            "OPENAI_API_KEY"
        )

        model = get_environment_value(
            request,
            "OPENAI_MODEL"
        )

        # Generate AI interpretation.

        answer = await ask_astra_ai(
            question=question,
            context=health_context,
            api_key=api_key,
            model=model
        )

        return {
            "status": "success",
            "answer": answer
        }

    except HTTPException:
        raise

    except Exception as error:

        print("ASTRA AI Error:", str(error))

        raise HTTPException(
            status_code=503,
            detail="ASTRA AI is currently unavailable."
        )


# Serve frontend assets through Cloudflare Static Assets

@app.get("/{path:path}")
async def serve_frontend(
    path: str,
    request: Request
):

    assets = get_assets(request)

    if assets is None:
        raise HTTPException(
            status_code=404,
            detail="Frontend assets are not available in local test mode."
        )

    asset_url = f"https://assets.local/{path}"

    response = await assets.fetch(asset_url)

    body = await response.bytes()

    return Response(
        content=body,
        status_code=response.status,
        headers=dict(response.headers)
    )
