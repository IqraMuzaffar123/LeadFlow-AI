from __future__ import annotations
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class LeadIngestRequest(BaseModel):
    first_name: str
    last_name: str = ""
    email: str
    company: str = ""
    job_title: str = ""
    phone: str = ""
    website: str = ""
    industry: str = ""
    message: str = ""
    source: str = "webhook"


class LeadIngestResponse(BaseModel):
    id: str
    status: str
    message: str


class EmailResponse(BaseModel):
    id: str
    sequence_number: int
    subject: str
    body: str
    tone: str
    status: str
    created_at: datetime


class ProcessingLogEntry(BaseModel):
    id: str
    step: str
    status: str
    duration_ms: int | None
    details: dict | None
    created_at: datetime


class LeadResponse(BaseModel):
    id: str
    source: str
    first_name: str | None
    last_name: str | None
    email: str
    company: str | None
    job_title: str | None
    phone: str | None
    website: str | None
    industry: str | None
    message: str | None
    ai_score: int | None
    ai_category: str | None
    ai_reasoning: str | None
    ai_qualified_at: datetime | None
    hubspot_contact_id: str | None
    hubspot_deal_id: str | None
    hubspot_synced_at: datetime | None
    airtable_record_id: str | None = None
    company_size: str | None = None
    company_revenue: str | None = None
    company_industry: str | None = None
    company_linkedin: str | None = None
    person_linkedin: str | None = None
    person_title: str | None = None
    enriched_at: datetime | None = None
    status: str
    error_message: str | None
    created_at: datetime
    updated_at: datetime


class LeadDetailResponse(LeadResponse):
    emails: list[EmailResponse] = []
    processing_log: list[ProcessingLogEntry] = []


class LeadListResponse(BaseModel):
    leads: list[LeadResponse]
    total: int


class PipelineFunnel(BaseModel):
    ingested: int
    enriched: int
    qualified: int
    hot: int
    emails_generated: int
    crm_synced: int


class ScoreDistributionBucket(BaseModel):
    range: str
    count: int


class StatsResponse(BaseModel):
    total: int
    by_status: dict[str, int]
    by_category: dict[str, int]
    today: int
    synced_to_hubspot: int
    enriched: int = 0
    pipeline_funnel: PipelineFunnel = Field(default_factory=lambda: PipelineFunnel(
        ingested=0, enriched=0, qualified=0, hot=0, emails_generated=0, crm_synced=0
    ))
    score_distribution: list[ScoreDistributionBucket] = Field(default_factory=list)


class ProcessResponse(BaseModel):
    lead_id: str
    status: str
    ai_score: int | None = None
    ai_category: str | None = None
    emails_generated: int = 0
    hubspot_synced: bool = False
    apollo_enriched: bool = False
    error: str | None = None


class QualificationResult(BaseModel):
    score: int = Field(ge=0, le=100)
    category: str = Field(pattern="^(hot|warm|cold)$")
    reasoning: str
    buying_signals: list[str] = []
    concerns: list[str] = []


class GeneratedEmail(BaseModel):
    subject: str
    body: str
    send_delay: str


class EmailGenerationResult(BaseModel):
    email_1: GeneratedEmail
    email_2: GeneratedEmail
