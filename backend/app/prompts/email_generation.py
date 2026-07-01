EMAIL_PROMPT = """You are a professional B2B sales copywriter.

Write a 2-email follow-up sequence for this qualified lead.

Lead Context:
- Name: {first_name} {last_name}
- Company: {company}
- Job Title: {job_title}
- Industry: {industry}
- Their Message: {message}
- AI Score: {ai_score}/100 ({ai_category})
- Key Buying Signals: {buying_signals}

Respond in this exact JSON format (no other text):
{{
    "email_1": {{
        "subject": "<subject line, max 60 chars>",
        "body": "<email body, 100-150 words, professional but warm>",
        "send_delay": "immediate"
    }},
    "email_2": {{
        "subject": "<follow-up subject, max 60 chars>",
        "body": "<follow-up body, 80-120 words, adds value>",
        "send_delay": "3_days"
    }}
}}

Rules:
- Reference their specific message/need
- Include a clear CTA (call, demo, meeting)
- Email 2 should add new value, not just "checking in"
- Tone: professional, not pushy
- No generic templates — personalize to their industry and role"""


def build_email_prompt(lead: dict, qualification: dict) -> str:
    return EMAIL_PROMPT.format(
        first_name=lead.get("first_name", ""),
        last_name=lead.get("last_name", ""),
        company=lead.get("company", ""),
        job_title=lead.get("job_title", ""),
        industry=lead.get("industry", ""),
        message=lead.get("message", ""),
        ai_score=qualification.get("score", 0),
        ai_category=qualification.get("category", "unknown"),
        buying_signals=", ".join(qualification.get("buying_signals", [])),
    )
