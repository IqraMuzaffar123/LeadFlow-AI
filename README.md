# LeadFlow AI

AI-Powered Lead Qualification & Outreach Automation Engine

## What It Does

1. **Ingests leads** via webhook (form submissions) or CSV bulk upload
2. **AI qualifies** each lead using Claude API — scores them hot/warm/cold with detailed reasoning
3. **Generates personalized emails** — 2-email follow-up sequence per qualified lead
4. **Syncs to HubSpot CRM** — creates contacts, deals, and notes automatically
5. **Dashboard** — visualizes the pipeline with scores, emails, and processing logs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI (Python 3.11) |
| **AI** | Claude API (Anthropic Haiku) |
| **CRM** | HubSpot Free CRM |
| **Orchestration** | n8n (self-hosted, Docker) |
| **Database** | PostgreSQL 15 |
| **Frontend** | Next.js 14, Tailwind CSS, shadcn/ui |
| **Infrastructure** | Docker Compose |

## Architecture

```
Form/CSV → n8n (webhook) → FastAPI → Claude AI (qualify + emails) → HubSpot CRM
                                    → PostgreSQL (leads, emails, logs)
                                    → Next.js Dashboard (visualize)
```

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+
- Python 3.11+
- [Anthropic API Key](https://console.anthropic.com) (free $5 credit)
- [HubSpot Account](https://app.hubspot.com) (free)

### Setup

```bash
# 1. Clone and configure
git clone <repo-url>
cd leadflow-ai
cp .env.example .env
# Edit .env with your API keys

# 2. Start PostgreSQL + n8n
docker-compose up -d

# 3. Start backend
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 4. Start frontend
cd ../frontend
npm install
npm run dev
```

### Access
- **Dashboard:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs
- **n8n Workflows:** http://localhost:5678

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/leads/ingest` | Receive a new lead |
| GET | `/api/leads` | List leads (filterable) |
| GET | `/api/leads/stats` | Pipeline statistics |
| GET | `/api/leads/{id}` | Lead detail with emails & logs |
| POST | `/api/leads/process/{id}` | Full pipeline: qualify + emails + HubSpot |
| POST | `/api/leads/upload-csv` | Bulk upload via CSV |
| POST | `/api/leads/qualify/{id}` | AI qualification only |
| POST | `/api/leads/generate-emails/{id}` | Email generation only |
| POST | `/api/leads/sync-hubspot/{id}` | HubSpot sync only |

## Demo

Upload the included `backend/db/seed-leads.csv` (20 diverse leads) via the dashboard's CSV upload page, then process them to see the full pipeline in action.

## Cost

| Item | Cost |
|------|------|
| Everything except AI | **$0** (free tiers + Docker) |
| Claude API (~100 leads) | **~$0.50** |
| **Total** | **~$0.50** |

## License

MIT
