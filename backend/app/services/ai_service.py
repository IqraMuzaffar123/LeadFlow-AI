import json
import anthropic
from app.config import settings
from app.prompts.qualification import build_qualification_prompt
from app.prompts.email_generation import build_email_prompt

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

MODEL = "claude-haiku-4-5-20251001"


async def qualify_lead(lead: dict) -> dict:
    prompt = build_qualification_prompt(lead)
    response = await client.messages.create(
        model=MODEL,
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return json.loads(text)


async def generate_emails(lead: dict, qualification: dict) -> dict:
    prompt = build_email_prompt(lead, qualification)
    response = await client.messages.create(
        model=MODEL,
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return json.loads(text)
