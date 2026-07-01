import httpx
from app.config import settings

HUBSPOT_BASE = "https://api.hubapi.com"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.hubspot_api_key}",
        "Content-Type": "application/json",
    }


async def find_contact_by_email(email: str) -> str | None:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{HUBSPOT_BASE}/crm/v3/objects/contacts/search",
            headers=_headers(),
            json={
                "filterGroups": [{
                    "filters": [{
                        "propertyName": "email",
                        "operator": "EQ",
                        "value": email,
                    }]
                }]
            },
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("total", 0) > 0:
            return data["results"][0]["id"]
        return None


async def create_contact(lead: dict, ai_score: int = 0,
                         ai_category: str = "") -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{HUBSPOT_BASE}/crm/v3/objects/contacts",
            headers=_headers(),
            json={
                "properties": {
                    "firstname": lead.get("first_name", ""),
                    "lastname": lead.get("last_name", ""),
                    "email": lead["email"],
                    "company": lead.get("company", ""),
                    "jobtitle": lead.get("job_title", ""),
                    "phone": lead.get("phone", ""),
                    "website": lead.get("website", ""),
                    "lifecyclestage": "lead",
                }
            },
        )
        resp.raise_for_status()
        return resp.json()["id"]


async def create_deal(contact_id: str, lead: dict,
                      ai_score: int = 0) -> str:
    company = lead.get("company", "Unknown")
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{HUBSPOT_BASE}/crm/v3/objects/deals",
            headers=_headers(),
            json={
                "properties": {
                    "dealname": f"{company} — AI Lead",
                    "pipeline": "default",
                    "dealstage": "qualifiedtobuy" if ai_score >= 75 else "appointmentscheduled",
                },
                "associations": [{
                    "to": {"id": contact_id},
                    "types": [{
                        "associationCategory": "HUBSPOT_DEFINED",
                        "associationTypeId": 3,
                    }]
                }]
            },
        )
        resp.raise_for_status()
        return resp.json()["id"]


async def create_note(contact_id: str, content: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{HUBSPOT_BASE}/crm/v3/objects/notes",
            headers=_headers(),
            json={
                "properties": {
                    "hs_note_body": content,
                },
                "associations": [{
                    "to": {"id": contact_id},
                    "types": [{
                        "associationCategory": "HUBSPOT_DEFINED",
                        "associationTypeId": 202,
                    }]
                }]
            },
        )
        resp.raise_for_status()
        return resp.json()["id"]


async def sync_lead_to_hubspot(lead: dict, qualification: dict) -> dict:
    email = lead["email"]

    contact_id = await find_contact_by_email(email)

    if contact_id is None:
        contact_id = await create_contact(
            lead,
            ai_score=qualification.get("score", 0),
            ai_category=qualification.get("category", ""),
        )

    deal_id = await create_deal(
        contact_id, lead, ai_score=qualification.get("score", 0)
    )

    note_content = (
        f"AI Qualification Summary\n"
        f"Score: {qualification.get('score', 0)}/100 "
        f"({qualification.get('category', 'unknown').upper()})\n"
        f"Reasoning: {qualification.get('reasoning', 'N/A')}\n"
        f"Buying Signals: {', '.join(qualification.get('buying_signals', []))}"
    )
    await create_note(contact_id, note_content)

    return {"contact_id": contact_id, "deal_id": deal_id}
