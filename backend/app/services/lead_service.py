import json
import time
from uuid import UUID
from app.database import get_pool


async def create_lead(data: dict) -> dict:
    pool = await get_pool()
    row = await pool.fetchrow(
        """
        INSERT INTO leads (
            source, raw_payload, first_name, last_name, email,
            company, job_title, phone, website, industry, message, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'new')
        RETURNING id, status
        """,
        data.get("source", "webhook"),
        json.dumps(data),
        data.get("first_name", ""),
        data.get("last_name", ""),
        data["email"],
        data.get("company", ""),
        data.get("job_title", ""),
        data.get("phone", ""),
        data.get("website", ""),
        data.get("industry", ""),
        data.get("message", ""),
    )
    return {"id": str(row["id"]), "status": row["status"]}


async def get_lead(lead_id: str) -> dict | None:
    pool = await get_pool()
    row = await pool.fetchrow("SELECT * FROM leads WHERE id = $1", UUID(lead_id))
    if row is None:
        return None
    return _row_to_dict(row)


async def list_leads(status: str | None = None, category: str | None = None,
                     limit: int = 50, offset: int = 0) -> tuple[list[dict], int]:
    pool = await get_pool()
    conditions = []
    params = []
    param_idx = 1

    if status:
        conditions.append(f"status = ${param_idx}")
        params.append(status)
        param_idx += 1
    if category:
        conditions.append(f"ai_category = ${param_idx}")
        params.append(category)
        param_idx += 1

    where = "WHERE " + " AND ".join(conditions) if conditions else ""

    count_row = await pool.fetchrow(f"SELECT COUNT(*) as cnt FROM leads {where}", *params)
    total = count_row["cnt"]

    rows = await pool.fetch(
        f"SELECT * FROM leads {where} ORDER BY created_at DESC LIMIT ${param_idx} OFFSET ${param_idx + 1}",
        *params, limit, offset,
    )
    leads = [_row_to_dict(r) for r in rows]
    return leads, total


async def get_lead_with_details(lead_id: str) -> dict | None:
    lead = await get_lead(lead_id)
    if lead is None:
        return None

    pool = await get_pool()
    email_rows = await pool.fetch(
        "SELECT * FROM emails WHERE lead_id = $1 ORDER BY sequence_number",
        UUID(lead_id),
    )
    log_rows = await pool.fetch(
        "SELECT * FROM processing_log WHERE lead_id = $1 ORDER BY created_at",
        UUID(lead_id),
    )

    lead["emails"] = [_row_to_dict(r) for r in email_rows]
    lead["processing_log"] = [_row_to_dict(r) for r in log_rows]
    return lead


async def update_lead(lead_id: str, updates: dict) -> None:
    pool = await get_pool()
    set_clauses = []
    params = []
    param_idx = 1

    for key, value in updates.items():
        set_clauses.append(f"{key} = ${param_idx}")
        params.append(value)
        param_idx += 1

    set_clauses.append(f"updated_at = NOW()")
    params.append(UUID(lead_id))

    await pool.execute(
        f"UPDATE leads SET {', '.join(set_clauses)} WHERE id = ${param_idx}",
        *params,
    )


async def get_stats() -> dict:
    pool = await get_pool()

    total = (await pool.fetchrow("SELECT COUNT(*) as cnt FROM leads"))["cnt"]

    status_rows = await pool.fetch(
        "SELECT status, COUNT(*) as cnt FROM leads GROUP BY status"
    )
    by_status = {r["status"]: r["cnt"] for r in status_rows}

    cat_rows = await pool.fetch(
        "SELECT ai_category, COUNT(*) as cnt FROM leads WHERE ai_category IS NOT NULL GROUP BY ai_category"
    )
    by_category = {r["ai_category"]: r["cnt"] for r in cat_rows}

    today = (await pool.fetchrow(
        "SELECT COUNT(*) as cnt FROM leads WHERE created_at::date = CURRENT_DATE"
    ))["cnt"]

    synced = (await pool.fetchrow(
        "SELECT COUNT(*) as cnt FROM leads WHERE hubspot_contact_id IS NOT NULL"
    ))["cnt"]

    return {
        "total": total,
        "by_status": by_status,
        "by_category": by_category,
        "today": today,
        "synced_to_hubspot": synced,
    }


async def log_processing_step(lead_id: str, step: str, status: str,
                               duration_ms: int | None = None,
                               details: dict | None = None) -> None:
    pool = await get_pool()
    await pool.execute(
        """
        INSERT INTO processing_log (lead_id, step, status, duration_ms, details)
        VALUES ($1, $2, $3, $4, $5)
        """,
        UUID(lead_id), step, status, duration_ms,
        json.dumps(details) if details else None,
    )


async def save_emails(lead_id: str, email_1: dict, email_2: dict) -> None:
    pool = await get_pool()
    for seq, email in [(1, email_1), (2, email_2)]:
        await pool.execute(
            """
            INSERT INTO emails (lead_id, sequence_number, subject, body)
            VALUES ($1, $2, $3, $4)
            """,
            UUID(lead_id), seq, email["subject"], email["body"],
        )


def _row_to_dict(row) -> dict:
    d = dict(row)
    for key, value in d.items():
        if isinstance(value, UUID):
            d[key] = str(value)
        elif hasattr(value, "isoformat"):
            d[key] = value.isoformat()
    if "details" in d and isinstance(d["details"], str):
        d["details"] = json.loads(d["details"])
    if "raw_payload" in d and isinstance(d["raw_payload"], str):
        d["raw_payload"] = json.loads(d["raw_payload"])
    return d
