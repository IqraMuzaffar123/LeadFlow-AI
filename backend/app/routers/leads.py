import csv
import io
import time
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from app.models import (
    LeadIngestRequest, LeadIngestResponse, LeadResponse,
    LeadDetailResponse, LeadListResponse, StatsResponse, ProcessResponse,
)
from app.services import lead_service
from app.services import ai_service
from app.services import hubspot_service

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


@router.post("/qualify/{lead_id}")
async def qualify_lead(lead_id: str):
    lead = await lead_service.get_lead(lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")

    start = time.time()
    await lead_service.update_lead(lead_id, {"status": "qualifying"})
    await lead_service.log_processing_step(lead_id, "qualify", "started")

    result = await ai_service.qualify_lead(lead)
    duration_ms = int((time.time() - start) * 1000)

    await lead_service.update_lead(lead_id, {
        "ai_score": result["score"],
        "ai_category": result["category"],
        "ai_reasoning": result["reasoning"],
        "status": "qualified",
        "ai_qualified_at": datetime.now(timezone.utc),
    })
    await lead_service.log_processing_step(
        lead_id, "qualify", "completed", duration_ms, result
    )

    return {"lead_id": lead_id, "qualification": result}


@router.post("/generate-emails/{lead_id}")
async def generate_emails(lead_id: str):
    lead = await lead_service.get_lead(lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")

    start = time.time()
    await lead_service.update_lead(lead_id, {"status": "generating_emails"})
    await lead_service.log_processing_step(lead_id, "email_gen", "started")

    qualification = {
        "score": lead.get("ai_score", 0),
        "category": lead.get("ai_category", "unknown"),
        "buying_signals": [],
    }
    result = await ai_service.generate_emails(lead, qualification)
    duration_ms = int((time.time() - start) * 1000)

    await lead_service.save_emails(lead_id, result["email_1"], result["email_2"])
    await lead_service.update_lead(lead_id, {"status": "emails_ready"})
    await lead_service.log_processing_step(
        lead_id, "email_gen", "completed", duration_ms
    )

    return {"lead_id": lead_id, "emails": result}


@router.post("/process/{lead_id}", response_model=ProcessResponse)
async def process_lead(lead_id: str):
    lead = await lead_service.get_lead(lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")

    try:
        # Step 1: Qualify
        start = time.time()
        await lead_service.update_lead(lead_id, {"status": "qualifying"})
        await lead_service.log_processing_step(lead_id, "qualify", "started")

        qualification = await ai_service.qualify_lead(lead)
        duration_ms = int((time.time() - start) * 1000)

        await lead_service.update_lead(lead_id, {
            "ai_score": qualification["score"],
            "ai_category": qualification["category"],
            "ai_reasoning": qualification["reasoning"],
            "status": "qualified",
            "ai_qualified_at": datetime.now(timezone.utc),
        })
        await lead_service.log_processing_step(
            lead_id, "qualify", "completed", duration_ms, qualification
        )

        # Step 2: Generate emails (only for hot/warm)
        emails_generated = 0
        if qualification["category"] in ("hot", "warm"):
            start = time.time()
            await lead_service.update_lead(lead_id, {"status": "generating_emails"})
            await lead_service.log_processing_step(lead_id, "email_gen", "started")

            emails = await ai_service.generate_emails(lead, qualification)
            duration_ms = int((time.time() - start) * 1000)

            await lead_service.save_emails(lead_id, emails["email_1"], emails["email_2"])
            await lead_service.update_lead(lead_id, {"status": "emails_ready"})
            await lead_service.log_processing_step(
                lead_id, "email_gen", "completed", duration_ms
            )
            emails_generated = 2

        # Step 3: Sync to HubSpot
        hubspot_synced = False
        start = time.time()
        await lead_service.update_lead(lead_id, {"status": "syncing"})
        await lead_service.log_processing_step(lead_id, "hubspot_sync", "started")

        hubspot_ids = await hubspot_service.sync_lead_to_hubspot(
            lead, qualification
        )
        duration_ms = int((time.time() - start) * 1000)

        await lead_service.update_lead(lead_id, {
            "hubspot_contact_id": hubspot_ids["contact_id"],
            "hubspot_deal_id": hubspot_ids["deal_id"],
            "status": "synced",
        })
        await lead_service.log_processing_step(
            lead_id, "hubspot_sync", "completed", duration_ms
        )
        hubspot_synced = True

        return ProcessResponse(
            lead_id=lead_id,
            status="synced",
            ai_score=qualification["score"],
            ai_category=qualification["category"],
            emails_generated=emails_generated,
            hubspot_synced=hubspot_synced,
        )

    except Exception as e:
        await lead_service.update_lead(lead_id, {
            "status": "error",
            "error_message": str(e),
        })
        await lead_service.log_processing_step(
            lead_id, "pipeline", "error", details={"error": str(e)}
        )
        return ProcessResponse(
            lead_id=lead_id,
            status="error",
            error=str(e),
        )


@router.post("/sync-hubspot/{lead_id}")
async def sync_hubspot(lead_id: str):
    lead = await lead_service.get_lead(lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")

    start = time.time()
    await lead_service.update_lead(lead_id, {"status": "syncing"})
    await lead_service.log_processing_step(lead_id, "hubspot_sync", "started")

    qualification = {
        "score": lead.get("ai_score", 0),
        "category": lead.get("ai_category", "unknown"),
        "reasoning": lead.get("ai_reasoning", ""),
        "buying_signals": [],
    }

    hubspot_ids = await hubspot_service.sync_lead_to_hubspot(lead, qualification)
    duration_ms = int((time.time() - start) * 1000)

    await lead_service.update_lead(lead_id, {
        "hubspot_contact_id": hubspot_ids["contact_id"],
        "hubspot_deal_id": hubspot_ids["deal_id"],
        "status": "synced",
    })
    await lead_service.log_processing_step(
        lead_id, "hubspot_sync", "completed", duration_ms
    )

    return {"lead_id": lead_id, "hubspot": hubspot_ids}


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
