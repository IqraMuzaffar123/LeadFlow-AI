import json
from datetime import datetime, timezone
from app.database import get_db, new_id


async def create_lead(data: dict) -> dict:
    db = await get_db()
    lead_id = new_id()
    await db.execute(
        """
        INSERT INTO leads (
            id, source, raw_payload, first_name, last_name, email,
            company, job_title, phone, website, industry, message, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
        """,
        (
            lead_id,
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
        ),
    )
    await db.commit()
    return {"id": lead_id, "status": "new"}


async def get_lead(lead_id: str) -> dict | None:
    db = await get_db()
    cursor = await db.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    row = await cursor.fetchone()
    if row is None:
        return None
    return _row_to_dict(row)


async def list_leads(status: str | None = None, category: str | None = None,
                     limit: int = 50, offset: int = 0) -> tuple[list[dict], int]:
    db = await get_db()
    conditions = []
    params = []

    if status:
        conditions.append("status = ?")
        params.append(status)
    if category:
        conditions.append("ai_category = ?")
        params.append(category)

    where = "WHERE " + " AND ".join(conditions) if conditions else ""

    cursor = await db.execute(f"SELECT COUNT(*) as cnt FROM leads {where}", params)
    count_row = await cursor.fetchone()
    total = count_row[0]

    cursor = await db.execute(
        f"SELECT * FROM leads {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params + [limit, offset],
    )
    rows = await cursor.fetchall()
    leads = [_row_to_dict(r) for r in rows]
    return leads, total


async def get_lead_with_details(lead_id: str) -> dict | None:
    lead = await get_lead(lead_id)
    if lead is None:
        return None

    db = await get_db()
    cursor = await db.execute(
        "SELECT * FROM emails WHERE lead_id = ? ORDER BY sequence_number",
        (lead_id,),
    )
    email_rows = await cursor.fetchall()

    cursor = await db.execute(
        "SELECT * FROM processing_log WHERE lead_id = ? ORDER BY created_at",
        (lead_id,),
    )
    log_rows = await cursor.fetchall()

    lead["emails"] = [_row_to_dict(r) for r in email_rows]
    lead["processing_log"] = [_row_to_dict(r) for r in log_rows]
    return lead


async def update_lead(lead_id: str, updates: dict) -> None:
    db = await get_db()
    set_clauses = []
    params = []

    for key, value in updates.items():
        set_clauses.append(f"{key} = ?")
        if isinstance(value, datetime):
            params.append(value.isoformat())
        else:
            params.append(value)

    set_clauses.append("updated_at = datetime('now')")
    params.append(lead_id)

    await db.execute(
        f"UPDATE leads SET {', '.join(set_clauses)} WHERE id = ?",
        params,
    )
    await db.commit()


async def get_stats() -> dict:
    db = await get_db()

    cursor = await db.execute("SELECT COUNT(*) as cnt FROM leads")
    total = (await cursor.fetchone())[0]

    cursor = await db.execute(
        "SELECT status, COUNT(*) as cnt FROM leads GROUP BY status"
    )
    status_rows = await cursor.fetchall()
    by_status = {r[0]: r[1] for r in status_rows}

    cursor = await db.execute(
        "SELECT ai_category, COUNT(*) as cnt FROM leads WHERE ai_category IS NOT NULL GROUP BY ai_category"
    )
    cat_rows = await cursor.fetchall()
    by_category = {r[0]: r[1] for r in cat_rows}

    cursor = await db.execute(
        "SELECT COUNT(*) as cnt FROM leads WHERE date(created_at) = date('now')"
    )
    today = (await cursor.fetchone())[0]

    cursor = await db.execute(
        "SELECT COUNT(*) as cnt FROM leads WHERE hubspot_contact_id IS NOT NULL"
    )
    synced = (await cursor.fetchone())[0]

    cursor = await db.execute(
        "SELECT COUNT(*) as cnt FROM leads WHERE enriched_at IS NOT NULL"
    )
    enriched = (await cursor.fetchone())[0]

    # Pipeline funnel
    cursor = await db.execute(
        "SELECT COUNT(*) as cnt FROM leads WHERE ai_score IS NOT NULL"
    )
    qualified_count = (await cursor.fetchone())[0]

    cursor = await db.execute(
        "SELECT COUNT(*) as cnt FROM leads WHERE ai_category = 'hot'"
    )
    hot_count = (await cursor.fetchone())[0]

    cursor = await db.execute(
        "SELECT COUNT(DISTINCT lead_id) as cnt FROM emails"
    )
    emails_count = (await cursor.fetchone())[0]

    pipeline_funnel = {
        "ingested": total,
        "enriched": enriched,
        "qualified": qualified_count,
        "hot": hot_count,
        "emails_generated": emails_count,
        "crm_synced": synced,
    }

    # Score distribution
    score_ranges = ["0-20", "20-40", "40-60", "60-80", "80-100"]
    cursor = await db.execute(
        """
        SELECT
          CASE
            WHEN ai_score < 20 THEN '0-20'
            WHEN ai_score < 40 THEN '20-40'
            WHEN ai_score < 60 THEN '40-60'
            WHEN ai_score < 80 THEN '60-80'
            ELSE '80-100'
          END as range,
          COUNT(*) as count
        FROM leads
        WHERE ai_score IS NOT NULL
        GROUP BY 1
        ORDER BY 1
        """
    )
    dist_rows = await cursor.fetchall()
    dist_map = {r[0]: r[1] for r in dist_rows}
    score_distribution = [
        {"range": r, "count": dist_map.get(r, 0)} for r in score_ranges
    ]

    return {
        "total": total,
        "by_status": by_status,
        "by_category": by_category,
        "today": today,
        "synced_to_hubspot": synced,
        "enriched": enriched,
        "pipeline_funnel": pipeline_funnel,
        "score_distribution": score_distribution,
    }


async def log_processing_step(lead_id: str, step: str, status: str,
                               duration_ms: int | None = None,
                               details: dict | None = None) -> None:
    db = await get_db()
    await db.execute(
        """
        INSERT INTO processing_log (id, lead_id, step, status, duration_ms, details)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (new_id(), lead_id, step, status, duration_ms,
         json.dumps(details) if details else None),
    )
    await db.commit()


async def save_emails(lead_id: str, email_1: dict, email_2: dict) -> None:
    db = await get_db()
    for seq, email in [(1, email_1), (2, email_2)]:
        await db.execute(
            """
            INSERT INTO emails (id, lead_id, sequence_number, subject, body)
            VALUES (?, ?, ?, ?, ?)
            """,
            (new_id(), lead_id, seq, email["subject"], email["body"]),
        )
    await db.commit()


def _row_to_dict(row) -> dict:
    keys = row.keys()
    d = {k: row[k] for k in keys}
    if "details" in d and isinstance(d["details"], str):
        d["details"] = json.loads(d["details"])
    if "raw_payload" in d and isinstance(d["raw_payload"], str):
        d["raw_payload"] = json.loads(d["raw_payload"])
    return d
