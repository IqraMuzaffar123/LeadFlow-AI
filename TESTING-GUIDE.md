# LeadFlow AI — Comprehensive Testing Guide

**What this project does:** A lead comes in → Apollo enriches company data → Claude AI scores it hot/warm/cold → AI writes personalized follow-up emails → syncs to Airtable as system of record → Slack notification sent to team → HubSpot CRM creates contact + deal → everything appears in a real-time dashboard.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Starting the Services](#3-starting-the-services)
4. [Test 1: Health Check](#test-1-health-check)
5. [Test 2: Ingest a HOT Lead](#test-2-ingest-a-hot-lead)
6. [Test 3: Process the Lead — Full Pipeline](#test-3-process-the-lead--full-pipeline)
7. [Test 4: View Lead Detail](#test-4-view-lead-detail)
8. [Test 5: Ingest a COLD Lead](#test-5-ingest-a-cold-lead)
9. [Test 6: Ingest a WARM Lead](#test-6-ingest-a-warm-lead)
10. [Test 7: Bulk CSV Upload](#test-7-bulk-csv-upload)
11. [Test 8: Process All New Leads](#test-8-process-all-new-leads)
12. [Test 9: View Stats](#test-9-view-stats)
13. [Test 10: Dashboard Testing](#test-10-dashboard-testing)
14. [Test 11: Optional Integrations](#test-11-optional-integrations)
15. [Quick Pre-Demo Checklist](#quick-pre-demo-checklist)
16. [Common Errors and Fixes](#common-errors-and-fixes)

---

## 1. Prerequisites

### What You MUST Install

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.11+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |

> **Note:** Docker Desktop is optional. The backend uses SQLite by default — it creates `backend/leadflow.db` automatically on first startup with zero configuration. Docker is only needed if you want PostgreSQL or the n8n workflow UI.

### API Keys — What Is Required vs Optional

| Key | Required? | Where to Get It |
|-----|-----------|----------------|
| `ANTHROPIC_API_KEY` | **REQUIRED** | https://console.anthropic.com — Sign up, go to API Keys, create key (starts with `sk-ant-`) |
| `HUBSPOT_API_KEY` | Optional | https://app.hubspot.com — Settings → Integrations → Private Apps |
| `APOLLO_API_KEY` | Optional | https://app.apollo.io — Settings → Integrations → API Keys |
| `AIRTABLE_API_KEY` | Optional | https://airtable.com/create/tokens |
| `AIRTABLE_BASE_ID` | Optional (with Airtable) | From your Airtable base URL: `airtable.com/BASE_ID/...` |
| `SLACK_WEBHOOK_URL` | Optional | https://api.slack.com/messaging/webhooks |

> **IMPORTANT: You can run 100% of the core AI features with only `ANTHROPIC_API_KEY`.** All other integrations (HubSpot, Apollo, Airtable, Slack) are gracefully skipped if their keys are missing. The pipeline logs each skipped step but continues without error.

---

## 2. Environment Setup

### 2.1 Create Your .env File

```bash
cd "C:/Users/Iqra Muzaffar/Desktop/MS-Thesis/Primepal/Resume/Hasnain/upwork/leadflow-ai"
cp .env.example .env
```

Open `.env` in any text editor and fill in your values. Minimum viable config (only what is truly required):

```env
# REQUIRED — AI engine for scoring and email generation
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Leave the rest blank to skip those integrations
HUBSPOT_API_KEY=
APOLLO_API_KEY=
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
AIRTABLE_TABLE_NAME=Leads
SLACK_WEBHOOK_URL=

# SQLite is used by default — no DATABASE_URL needed unless you want PostgreSQL
DATABASE_URL=postgresql://leadflow:leadflow_dev@localhost:5432/leadflow
```

> **Note:** The `DATABASE_URL` line is only used if you start Docker. If Docker is not running, the backend automatically falls back to SQLite at `backend/leadflow.db`.

---

## 3. Starting the Services

### 3.1 Backend (FastAPI + SQLite)

Open a terminal and run:

```bash
cd "C:/Users/Iqra Muzaffar/Desktop/MS-Thesis/Primepal/Resume/Hasnain/upwork/leadflow-ai/backend"

# Create virtual environment (first time only)
python -m venv venv

# Activate (Windows Git Bash / WSL)
source venv/Scripts/activate

# Activate (Mac / Linux)
# source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --port 8000
```

**You should see this output:**

```
INFO:     SQLite database ready at .../backend/leadflow.db
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

**Keep this terminal open.** The server must stay running for all tests below.

Verify it is working: open http://localhost:8000/api/health in your browser.

### 3.2 Frontend (Next.js Dashboard)

Open a **second terminal** (keep backend running in the first):

```bash
cd "C:/Users/Iqra Muzaffar/Desktop/MS-Thesis/Primepal/Resume/Hasnain/upwork/leadflow-ai/frontend"

npm install    # first time only — installs Next.js, Tailwind, shadcn/ui, Recharts

npm run dev
```

**You should see:**

```
  ▲ Next.js 14.x
  - Local: http://localhost:3000
  - Ready in Xs
```

Open http://localhost:3000 — the dashboard loads (empty at first, that is normal).

### 3.3 Docker (Optional — PostgreSQL + n8n)

Only needed if you want PostgreSQL instead of SQLite, or want to use the n8n workflow UI:

```bash
cd "C:/Users/Iqra Muzaffar/Desktop/MS-Thesis/Primepal/Resume/Hasnain/upwork/leadflow-ai"
docker-compose up -d
```

This starts:
- **PostgreSQL 15** on port `5432` — database with tables pre-created from `backend/db/init.sql`
- **n8n** on port `5678` — visual workflow editor at http://localhost:5678

Verify Docker containers are running:

```bash
docker ps
```

You should see two rows: one for `postgres:15` and one for `n8nio/n8n`.

> **Skipping Docker:** If you do not start Docker, the backend uses SQLite automatically. All API tests below work identically with SQLite.

---

## Test 1: Health Check

Open a **third terminal** (the API test terminal — keep backend and frontend terminals open).

```bash
curl http://localhost:8000/api/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "service": "leadflow-ai"
}
```

If you see `Connection refused`, the backend is not running. Go back to section 3.1.

You can also open http://localhost:8000/docs in your browser for the interactive Swagger UI, which lets you test every endpoint with a "Try it out" button.

---

## Test 2: Ingest a HOT Lead

A HOT lead has: C-suite or VP title, specific pain point, approved budget, and a business email.

```bash
curl -X POST http://localhost:8000/api/leads/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah@techcorp.io",
    "company": "TechCorp",
    "job_title": "VP of Marketing",
    "industry": "SaaS",
    "message": "We need AI automation for our 50-person sales team. Budget approved for Q3. Can we schedule a demo this week?",
    "source": "webhook"
  }'
```

**Expected Response:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "new",
  "message": "Lead ingested successfully"
}
```

> **IMPORTANT: Copy the `id` value from the response.** You will use it as `LEAD_ID` in the next tests. It is a UUID string like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`.

**What just happened:** The lead was saved to the SQLite database (or PostgreSQL if Docker is running) with status `new`. No AI has run yet.

---

## Test 3: Process the Lead — Full Pipeline

Replace `LEAD_ID` below with the actual id you copied from Test 2:

```bash
curl -X POST http://localhost:8000/api/leads/process/LEAD_ID
```

**Example with a real-looking UUID:**

```bash
curl -X POST http://localhost:8000/api/leads/process/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

This call runs the complete 7-step pipeline:

| Step | What Happens |
|------|-------------|
| 1. Enrich | Apollo looks up company size, revenue, LinkedIn (skipped if no `APOLLO_API_KEY`) |
| 2. Qualify | Claude AI scores the lead 0–100 and assigns hot/warm/cold |
| 3. Emails | Claude generates a 2-email follow-up sequence (only for hot/warm leads) |
| 4. Airtable | Lead + score + emails synced to Airtable base (skipped if no key) |
| 5. Slack | Rich notification sent to your Slack channel (skipped if no webhook; cold leads always skipped) |
| 6. HubSpot | Contact + Deal created in HubSpot CRM (skipped if no `HUBSPOT_API_KEY`) |

**Expected Response (with only Anthropic key configured):**

```json
{
  "lead_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "emails_ready",
  "ai_score": 87,
  "ai_category": "hot",
  "emails_generated": 2,
  "hubspot_synced": false,
  "apollo_enriched": false
}
```

**Expected Response (with all integrations configured):**

```json
{
  "lead_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "synced",
  "ai_score": 87,
  "ai_category": "hot",
  "emails_generated": 2,
  "hubspot_synced": true,
  "apollo_enriched": true
}
```

### Understanding the Response Fields

| Field | Meaning |
|-------|---------|
| `lead_id` | The UUID of the lead just processed |
| `status` | Final pipeline status: `synced` (HubSpot done), `emails_ready` (HubSpot skipped), or `qualified` (cold lead — no emails) |
| `ai_score` | Integer 0–100 assigned by Claude AI. Sarah should score 80–95 given her VP title, specific need, and approved budget |
| `ai_category` | `hot` (75–100), `warm` (40–74), or `cold` (0–39) |
| `emails_generated` | Number of follow-up emails written. Hot and warm leads get 2; cold leads get 0 |
| `hubspot_synced` | `true` only if `HUBSPOT_API_KEY` is set and the API call succeeded |
| `apollo_enriched` | `true` only if `APOLLO_API_KEY` is set and Apollo found company data |

> **This call takes 5–15 seconds.** Claude AI is making real API calls to score the lead and write personalized emails. This is normal.

---

## Test 4: View Lead Detail

```bash
curl http://localhost:8000/api/leads/LEAD_ID
```

**Expected Response (abbreviated):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "first_name": "Sarah",
  "last_name": "Johnson",
  "email": "sarah@techcorp.io",
  "company": "TechCorp",
  "job_title": "VP of Marketing",
  "industry": "SaaS",
  "ai_score": 87,
  "ai_category": "hot",
  "ai_reasoning": "Sarah is a VP-level decision maker at a SaaS company with an explicit budget approval and urgency (demo this week). The 50-person sales team size indicates mid-market revenue. High purchase intent.",
  "status": "emails_ready",
  "company_size": "51-200",
  "company_revenue": "$10M-$50M",
  "company_linkedin": "https://linkedin.com/company/techcorp",
  "person_linkedin": "https://linkedin.com/in/sarah-johnson",
  "emails": [
    {
      "id": "email-uuid-1",
      "sequence_number": 1,
      "subject": "AI automation for TechCorp's 50-person sales team",
      "body": "Hi Sarah,\n\nI saw your inquiry about AI automation...",
      "tone": "professional",
      "status": "draft",
      "created_at": "2025-01-15T10:23:45"
    },
    {
      "id": "email-uuid-2",
      "sequence_number": 2,
      "subject": "Following up — quick question about your Q3 timeline",
      "body": "Hi Sarah,\n\nJust following up on my previous email...",
      "tone": "professional",
      "status": "draft",
      "created_at": "2025-01-15T10:23:46"
    }
  ],
  "processing_log": [
    {"step": "enrich",        "status": "skipped",   "duration_ms": 12,   "details": {"reason": "Apollo not configured or no data found"}},
    {"step": "qualify",       "status": "started",   "duration_ms": null, "details": null},
    {"step": "qualify",       "status": "completed", "duration_ms": 3420, "details": {"score": 87, "category": "hot"}},
    {"step": "email_gen",     "status": "started",   "duration_ms": null, "details": null},
    {"step": "email_gen",     "status": "completed", "duration_ms": 6801, "details": null},
    {"step": "airtable_sync", "status": "skipped",   "duration_ms": 8,    "details": {"reason": "Airtable not configured or sync failed"}},
    {"step": "slack_notify",  "status": "skipped",   "duration_ms": 5,    "details": {"reason": "Slack not configured or lead is cold"}},
    {"step": "hubspot_sync",  "status": "skipped",   "duration_ms": 9,    "details": {"reason": "HubSpot unavailable or not configured"}}
  ]
}
```

### What to Look For

- `ai_reasoning` — Claude's explanation of why it assigned this score. Should mention the budget, seniority, and urgency.
- `emails` array — Two full email objects with subject lines and body text personalized to Sarah and TechCorp.
- `processing_log` — Shows every step, its status (completed/skipped), and how many milliseconds it took. `skipped` is correct for integrations without API keys.
- `company_size`, `company_revenue`, `company_linkedin` — Populated only if Apollo enrichment ran.

---

## Test 5: Ingest a COLD Lead

A COLD lead has: no company, free email (gmail), vague inquiry, no decision-making authority.

### Step 5a — Ingest

```bash
curl -X POST http://localhost:8000/api/leads/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Tom",
    "last_name": "Baker",
    "email": "tombaker99@gmail.com",
    "company": "",
    "job_title": "",
    "industry": "",
    "message": "what is AI?",
    "source": "webhook"
  }'
```

**Expected Response:**

```json
{
  "id": "cold-lead-uuid-here",
  "status": "new",
  "message": "Lead ingested successfully"
}
```

Copy the `id`.

### Step 5b — Process

```bash
curl -X POST http://localhost:8000/api/leads/process/COLD_LEAD_ID
```

**Expected Response:**

```json
{
  "lead_id": "cold-lead-uuid-here",
  "status": "qualified",
  "ai_score": 5,
  "ai_category": "cold",
  "emails_generated": 0,
  "hubspot_synced": false,
  "apollo_enriched": false
}
```

### What to Verify for Cold Leads

- `ai_score` is 0–39
- `ai_category` is `"cold"`
- `emails_generated` is `0` — cold leads never get emails (intentional design)
- `status` is `"qualified"` not `"emails_ready"` (no emails were generated)
- Slack notifications are always skipped for cold leads, even if `SLACK_WEBHOOK_URL` is configured

---

## Test 6: Ingest a WARM Lead

A WARM lead has: mid-level manager title, expressed interest, some specifics — but no confirmed budget or C-suite sign-off.

### Step 6a — Ingest

```bash
curl -X POST http://localhost:8000/api/leads/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ryan",
    "last_name": "Garcia",
    "email": "ryan@foodchain.com",
    "company": "FoodChain",
    "job_title": "Supply Chain Manager",
    "industry": "Food and Beverage",
    "message": "Exploring AI demand forecasting for perishable inventory management. Still in research phase, no budget confirmed yet.",
    "source": "webhook"
  }'
```

Copy the `id` from the response.

### Step 6b — Process

```bash
curl -X POST http://localhost:8000/api/leads/process/WARM_LEAD_ID
```

**Expected Response:**

```json
{
  "lead_id": "warm-lead-uuid-here",
  "status": "emails_ready",
  "ai_score": 55,
  "ai_category": "warm",
  "emails_generated": 2,
  "hubspot_synced": false,
  "apollo_enriched": false
}
```

### What to Verify for Warm Leads

- `ai_score` is 40–74
- `ai_category` is `"warm"`
- `emails_generated` is `2` — warm leads DO get emails (same as hot)
- `status` is `"emails_ready"` (emails were generated and saved)
- Slack notification is sent if `SLACK_WEBHOOK_URL` is configured (warm leads get notified too)

---

## Test 7: Bulk CSV Upload

The project ships with a pre-built seed file containing 20 diverse leads.

### Option A — Upload via curl

```bash
cd "C:/Users/Iqra Muzaffar/Desktop/MS-Thesis/Primepal/Resume/Hasnain/upwork/leadflow-ai"

curl -X POST http://localhost:8000/api/leads/upload-csv \
  -F "file=@backend/db/seed-leads.csv"
```

**Expected Response:**

```json
{
  "uploaded": 20,
  "leads": [
    {"id": "uuid-1", "status": "new", ...},
    {"id": "uuid-2", "status": "new", ...},
    ...
  ],
  "errors": []
}
```

- `uploaded` — number of rows successfully saved
- `leads` — array of lead objects with their new IDs
- `errors` — array of rows that failed (empty array means all 20 succeeded)

### Option B — Upload via Dashboard

1. Open http://localhost:3000/upload
2. Click the upload area or drag-and-drop `backend/db/seed-leads.csv`
3. The page shows a success message with count of leads uploaded

### CSV Format

If you want to upload your own data, the CSV must have these columns (all optional except `email`):

```csv
first_name,last_name,email,company,job_title,industry,message
John,Doe,john@example.com,Acme Corp,CTO,Technology,"Need AI for code review automation"
```

> **Note:** The `source` field is automatically set to `"csv"` for all CSV uploads.

---

## Test 8: Process All New Leads

After uploading the CSV, all 20 leads have status `new`. Process every one of them in a single call:

```bash
curl -X POST http://localhost:8000/api/leads/process-all
```

> **IMPORTANT: This call runs the full AI pipeline on every unprocessed lead. With 20 leads, it will take 2–5 minutes and use approximately $0.10–$0.50 in Claude API credits. Each lead makes 1–2 API calls to Claude.**

**Expected Response:**

```json
{
  "processed": 20,
  "results": [
    {"id": "uuid-1", "score": 87, "category": "hot",  "emails": 2},
    {"id": "uuid-2", "score": 72, "category": "warm", "emails": 2},
    {"id": "uuid-3", "score": 12, "category": "cold", "emails": 0},
    ...
  ]
}
```

- `processed` — how many leads were processed (all `new` status leads)
- `results` — one entry per lead with its score, category, and email count
- Any lead with an error will have an `"error"` key instead of `score`/`category`

After this call, refresh the dashboard at http://localhost:3000 to see all leads with their scores.

---

## Test 9: View Stats

```bash
curl http://localhost:8000/api/leads/stats
```

**Expected Response (after processing all seed leads):**

```json
{
  "total": 21,
  "by_status": {
    "new": 0,
    "qualifying": 0,
    "qualified": 5,
    "emails_ready": 16,
    "synced": 0,
    "error": 0
  },
  "by_category": {
    "hot": 8,
    "warm": 8,
    "cold": 5
  },
  "today": 21,
  "synced_to_hubspot": 0,
  "enriched": 0,
  "pipeline_funnel": {
    "ingested": 21,
    "enriched": 0,
    "qualified": 21,
    "hot": 8,
    "emails_generated": 16,
    "crm_synced": 0
  },
  "score_distribution": [
    {"range": "0-20",   "count": 3},
    {"range": "21-40",  "count": 2},
    {"range": "41-60",  "count": 4},
    {"range": "61-80",  "count": 6},
    {"range": "81-100", "count": 6}
  ]
}
```

### Understanding Each Stats Field

| Field | Meaning |
|-------|---------|
| `total` | All leads in the database |
| `by_status` | Count of leads at each pipeline stage |
| `by_category` | Count of hot/warm/cold leads |
| `today` | Leads ingested since midnight UTC |
| `synced_to_hubspot` | Leads successfully pushed to HubSpot CRM |
| `enriched` | Leads that got Apollo company data |
| `pipeline_funnel` | Sequential counts showing where leads drop off |
| `pipeline_funnel.emails_generated` | Leads that got AI emails written (hot + warm) |
| `score_distribution` | How many leads fall into each 20-point score bucket |

---

## Test 10: Dashboard Testing

### Open the Dashboard

Go to http://localhost:3000

### What You Should See on the Main Page

**7 Stat Cards at the Top:**
- Total Leads
- Hot Leads
- Warm Leads
- Cold Leads
- Emails Generated
- CRM Synced (HubSpot)
- Added Today

**3 Charts:**
- **Pipeline Funnel** (bar chart) — shows ingested → enriched → qualified → hot → emails → synced
- **Score Distribution** (bar chart) — shows how many leads fall in each 0–20, 21–40, 41–60, 61–80, 81–100 range
- **Category Breakdown** (donut chart) — hot/warm/cold proportions

**Lead Table:**
- All leads sorted by newest first
- Columns: Name, Company, Score (colored badge), Category, Status, Created date
- Color coding: Red badge = hot, Yellow = warm, Gray = cold

### Click a Lead

Click any row in the table to go to the lead detail page (e.g., http://localhost:3000/leads/LEAD_ID).

You should see:
- Lead contact info (name, email, company, title)
- AI score displayed prominently with category badge
- AI reasoning paragraph (what Claude said about this lead)
- Apollo enrichment card (company size, revenue, LinkedIn links) — populated only if Apollo ran
- 2 email panels showing Email 1 and Email 2 with full subject + body
- Processing timeline log showing each step with duration in ms

### Filter by Category

On the main dashboard, use the filter buttons (if present) or add a query parameter:

```bash
# API: filter by category
curl "http://localhost:8000/api/leads?category=hot"
curl "http://localhost:8000/api/leads?category=warm"
curl "http://localhost:8000/api/leads?category=cold"

# API: filter by status
curl "http://localhost:8000/api/leads?status=emails_ready"

# API: pagination
curl "http://localhost:8000/api/leads?limit=10&offset=0"
curl "http://localhost:8000/api/leads?limit=10&offset=10"
```

### Upload CSV via Dashboard

Go to http://localhost:3000/upload — you should see a file upload interface. Drag and drop any CSV file with the correct column headers.

---

## Test 11: Optional Integrations

All integrations are opt-in. Add the relevant keys to `.env`, restart the backend (`CTRL+C` then `uvicorn app.main:app --reload --port 8000`), and re-run any `process` test.

### HubSpot CRM Integration

**Setup:**
1. Go to https://app.hubspot.com/signup and create a free account
2. Go to Settings → Integrations → Private Apps → Create a Private App
3. Name it "LeadFlow AI"
4. Under Scopes, enable: `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.deals.read`, `crm.objects.deals.write`
5. Click Create App → copy the token (starts with `pat-na1-`)
6. Add to `.env`: `HUBSPOT_API_KEY=pat-na1-your-token-here`

**What to expect when processing a lead:**
- `hubspot_synced: true` in the process response
- `status: "synced"` (instead of `emails_ready`)
- A new Contact appears at https://app.hubspot.com/contacts with the lead's name and email
- A new Deal appears at https://app.hubspot.com/deals associated with that contact
- The deal value and pipeline stage are set based on the AI category

**Test command:**
```bash
curl -X POST http://localhost:8000/api/leads/sync-hubspot/LEAD_ID
```

This runs only the HubSpot sync step (skips AI re-scoring).

### Apollo.io Enrichment

**Setup:**
1. Go to https://app.apollo.io and sign up (free — 10,000 credits/month)
2. Go to Settings → Integrations → API → Create API Key
3. Add to `.env`: `APOLLO_API_KEY=your-api-key-here`

**What to expect when processing a lead:**
- `apollo_enriched: true` in the process response
- Lead detail shows `company_size`, `company_revenue`, `company_industry`, `company_linkedin`, `person_linkedin`, `person_title`
- The AI scoring step gets the enrichment data as additional context, improving scoring accuracy

**How enrichment improves scoring:** Without Apollo, Claude only sees the form fields the lead filled in. With Apollo, Claude also sees verified company size, funding, and LinkedIn data — leading to more accurate hot/warm/cold classification.

### Airtable as System of Record

**Setup:**
1. Go to https://airtable.com and create a free account
2. Create a new Base (e.g., "LeadFlow CRM")
3. Create a Table called `Leads` inside that base
4. Go to https://airtable.com/create/tokens → create a Personal Access Token
   - Scopes needed: `data.records:read`, `data.records:write`, `schema.bases:read`
   - Access: select your LeadFlow base
5. Get your Base ID from the URL: `https://airtable.com/appXXXXXXXX/...` — `appXXXXXXXX` is the Base ID
6. Add to `.env`:
   ```
   AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
   AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
   AIRTABLE_TABLE_NAME=Leads
   ```

**What to expect when processing a lead:**
- `airtable_sync: completed` in the processing log
- `airtable_record_id` populated on the lead detail
- A new record appears in your Airtable base with all lead fields + AI score + category

### Slack Notifications

**Setup:**
1. Go to https://api.slack.com/messaging/webhooks
2. Click "Create your Slack app" → choose a workspace
3. Enable Incoming Webhooks → Add New Webhook to Workspace → pick a channel
4. Copy the webhook URL (starts with `https://hooks.slack.com/services/`)
5. Add to `.env`: `SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxx`

**What to expect when processing a hot or warm lead:**
- `slack_notify: completed` in the processing log
- A rich message appears in your Slack channel with: lead name, company, score, category badge, and a link to view emails

**What to expect for cold leads:** Slack is never notified for cold leads, even if the webhook is configured. This is by design — cold leads are not worth a team interrupt.

---

## Quick Pre-Demo Checklist

Use this list to verify everything is working before showing the project to anyone.

- [ ] `curl http://localhost:8000/api/health` returns `{"status":"ok","service":"leadflow-ai"}`
- [ ] http://localhost:3000 loads the dashboard without errors
- [ ] Ingest Sarah (hot lead) returns a UUID
- [ ] Process Sarah: `ai_score` is 75–100, `ai_category` is `"hot"`, `emails_generated` is `2`
- [ ] Lead detail for Sarah shows `ai_reasoning` paragraph (not null or empty)
- [ ] Lead detail for Sarah shows 2 emails with non-empty `subject` and `body`
- [ ] Lead detail `processing_log` shows `qualify: completed` and `email_gen: completed`
- [ ] Ingest Tom (cold lead) returns a UUID
- [ ] Process Tom: `ai_score` is 0–39, `ai_category` is `"cold"`, `emails_generated` is `0`
- [ ] Ingest Ryan (warm lead) returns a UUID
- [ ] Process Ryan: `ai_score` is 40–74, `ai_category` is `"warm"`, `emails_generated` is `2`
- [ ] Upload `backend/db/seed-leads.csv` — response shows `"uploaded": 20, "errors": []`
- [ ] Process all: `curl -X POST http://localhost:8000/api/leads/process-all` — response shows `"processed": 20`
- [ ] Stats endpoint shows non-zero `total`, `by_category.hot`, and `pipeline_funnel.emails_generated`
- [ ] Dashboard main page shows stat cards with real numbers
- [ ] Dashboard shows all 3 charts (funnel, score distribution, donut)
- [ ] Clicking a lead in the table navigates to the detail page
- [ ] Detail page shows AI reasoning, emails, and processing log
- [ ] (If HubSpot configured) Contacts exist in HubSpot after processing
- [ ] (If Airtable configured) Records exist in Airtable base after processing
- [ ] (If Slack configured) Slack channel received a message for a hot/warm lead

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection refused` on port 8000 | Backend not started | Run `uvicorn app.main:app --reload --port 8000` from `backend/` |
| `anthropic.AuthenticationError` | Invalid or missing API key | Check `.env` — key must start with `sk-ant-` and match your Console |
| `ModuleNotFoundError` | Dependencies not installed | Run `pip install -r requirements.txt` inside activated venv |
| `422 Unprocessable Entity` | Missing required field in request body | Check that JSON includes at minimum `first_name` and `email` |
| `404 Lead not found` | UUID does not exist in DB | Re-ingest the lead first, then use the new UUID |
| Frontend blank page | Backend not running or CORS mismatch | Start backend on port 8000 before starting frontend |
| `ECONNREFUSED` on frontend | Backend on wrong port | Frontend is hardcoded to connect to port 8000 |
| `asyncpg` or `psycopg2` error | Docker not running but `DATABASE_URL` is set | Either start Docker or remove `DATABASE_URL` from `.env` to fall back to SQLite |
| `docker-compose` port conflict on 5432 | Another PostgreSQL is running | Stop the other service or change port in `docker-compose.yml` |
| Processing takes 30+ seconds | Normal for first call — Claude API cold start | Wait; subsequent calls are faster |
| `emails_generated: 0` for warm lead | Score came out below 40 | Normal — Claude may classify differently; re-process or check `ai_category` in response |

---

## Quick Reference — All API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/leads/ingest` | Ingest one lead (JSON body) |
| GET | `/api/leads` | List leads (supports `?status=`, `?category=`, `?limit=`, `?offset=`) |
| GET | `/api/leads/stats` | Pipeline statistics and funnel |
| GET | `/api/leads/{id}` | Lead detail with emails and processing log |
| POST | `/api/leads/process/{id}` | Full pipeline: enrich + qualify + emails + Airtable + Slack + HubSpot |
| POST | `/api/leads/process-all` | Process all leads with status `new` |
| POST | `/api/leads/upload-csv` | Bulk ingest from CSV file |
| POST | `/api/leads/qualify/{id}` | AI qualification only (no emails, no CRM) |
| POST | `/api/leads/generate-emails/{id}` | Email generation only (requires prior qualification) |
| POST | `/api/leads/sync-hubspot/{id}` | HubSpot sync only |

Full interactive docs: http://localhost:8000/docs
