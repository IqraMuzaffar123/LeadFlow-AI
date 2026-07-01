import csv
import io
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from app.models import (
    LeadIngestRequest, LeadIngestResponse, LeadResponse,
    LeadDetailResponse, LeadListResponse, StatsResponse,
)
from app.services import lead_service

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.post("/ingest", response_model=LeadIngestResponse)
async def ingest_lead(request: LeadIngestRequest):
    result = await lead_service.create_lead(request.model_dump())
    return LeadIngestResponse(
        id=result["id"],
        status=result["status"],
        message="Lead ingested successfully",
    )


@router.get("", response_model=LeadListResponse)
async def list_leads(
    status: str | None = Query(None),
    category: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    leads, total = await lead_service.list_leads(status, category, limit, offset)
    return LeadListResponse(leads=leads, total=total)


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    return await lead_service.get_stats()


@router.get("/{lead_id}", response_model=LeadDetailResponse)
async def get_lead(lead_id: str):
    lead = await lead_service.get_lead_with_details(lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    results = []
    for row in reader:
        row["source"] = "csv"
        result = await lead_service.create_lead(row)
        results.append(result)

    return {"uploaded": len(results), "leads": results}
