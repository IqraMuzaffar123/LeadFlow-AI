# LeadFlow AI — UI Polish + Analytics Charts Design Spec

## Overview

Bump all font sizes for high-DPI readability and add 3 analytics charts to the dashboard: Pipeline Funnel, Score Distribution, and Category Donut. Enhance the stats API to provide the data these charts need.

---

## Font Size Changes

All components get bumped to match the AskDocs standard:

| Element | Current | New |
|---------|---------|-----|
| Page titles | ~24px | 32px |
| Subtitles | ~13px | 17px |
| Stat card numbers | ~28px | 40px mono |
| Stat card labels | ~10px | 14px uppercase |
| Table headers | ~10px | 14px uppercase |
| Table body text | ~13px | 16px |
| Table name links | ~13px | 16px |
| Score bars | ~11px | 14px |
| Badges (category/status) | ~10px | 13px |
| Buttons | ~12px | 15px |
| Search input | ~13px | 16px |
| Filter buttons | ~11px | 14px |
| Email preview text | ~13px | 15px |
| Processing log text | ~12px | 15px |
| Lead detail headers | ~18px | 24px |
| AI reasoning text | ~13px | 16px |
| Minimum anywhere | various | 13px floor |

### Files to Modify

- `frontend/app/page.tsx` — dashboard title, subtitle, button text
- `frontend/app/leads/[id]/page.tsx` — detail page headers, text
- `frontend/app/upload/page.tsx` — upload page text
- `frontend/components/StatsCards.tsx` — card labels, numbers
- `frontend/components/LeadTable.tsx` — headers, body, badges, score bars
- `frontend/components/EmailPreview.tsx` — subject, body text
- `frontend/components/ProcessingLog.tsx` — step labels, durations

---

## Backend Stats Enhancement

### Modified Endpoint: `GET /api/leads/stats`

Add two new fields to the existing response:

```json
{
  "total": 26,
  "by_status": {"new": 2, "qualifying": 0, "qualified": 20, "synced": 3, "error": 1},
  "by_category": {"hot": 5, "warm": 11, "cold": 8},
  "today": 4,
  "synced_to_hubspot": 3,
  "enriched": 8,

  "pipeline_funnel": {
    "ingested": 26,
    "enriched": 8,
    "qualified": 24,
    "hot": 5,
    "emails_generated": 16,
    "crm_synced": 3
  },
  "score_distribution": [
    {"range": "0-20", "count": 3},
    {"range": "20-40", "count": 5},
    {"range": "40-60", "count": 6},
    {"range": "60-80", "count": 7},
    {"range": "80-100", "count": 5}
  ]
}
```

### SQL Queries for New Fields

```sql
-- pipeline_funnel.ingested
SELECT COUNT(*) FROM leads;

-- pipeline_funnel.enriched
SELECT COUNT(*) FROM leads WHERE enriched_at IS NOT NULL;

-- pipeline_funnel.qualified
SELECT COUNT(*) FROM leads WHERE ai_score IS NOT NULL;

-- pipeline_funnel.hot
SELECT COUNT(*) FROM leads WHERE ai_category = 'hot';

-- pipeline_funnel.emails_generated
SELECT COUNT(DISTINCT lead_id) FROM emails;

-- pipeline_funnel.crm_synced
SELECT COUNT(*) FROM leads WHERE hubspot_contact_id IS NOT NULL;

-- score_distribution (5 buckets)
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
GROUP BY range
ORDER BY range;
```

### File Modified

- `backend/app/services/lead_service.py` — add pipeline_funnel and score_distribution to get_stats()

---

## Frontend Charts

### New Dependencies

```bash
cd frontend && npm install recharts
```

Note: Check if recharts is already installed. If not, add it.

### Chart 1: Pipeline Funnel (`PipelineFunnel.tsx`)

Horizontal bar chart showing conversion through the pipeline.

- 6 bars: Ingested → Enriched → Qualified → Hot → Emails → CRM Synced
- Each bar proportional to its count
- Conversion rate label between bars (e.g., "31% →")
- Colors: gradient from slate to emerald (gets greener as lead progresses)
- Uses recharts `BarChart` with `layout="vertical"`
- Wrapped in gradient-card style container
- Title: "Pipeline Funnel" at 18px

### Chart 2: Score Distribution (`ScoreDistribution.tsx`)

Vertical bar chart showing where leads cluster by AI score.

- 5 bars: 0-20, 20-40, 40-60, 60-80, 80-100
- Colors: #60a5fa (cold: 0-40), #f59e0b (warm: 40-80), #ef4444 (hot: 80-100)
- Y-axis: count, X-axis: score range
- Uses recharts `BarChart`
- Wrapped in gradient-card style container
- Title: "Score Distribution" at 18px

### Chart 3: Category Donut (`CategoryDonut.tsx`)

Donut/pie chart showing hot/warm/cold breakdown.

- 3 segments: Hot (red #ef4444), Warm (amber #f59e0b), Cold (blue #60a5fa)
- Center: total leads count (big mono number) + "leads" label
- Legend below with counts and percentages
- Uses recharts `PieChart` with `innerRadius`
- Wrapped in gradient-card style container
- Title: "Lead Categories" at 18px

### Dashboard Layout Change

Current layout:
```
Stats Cards (7 cards)
Lead Table
```

New layout:
```
Stats Cards (7 cards)
[Pipeline Funnel (50%) | Score Distribution (25%) | Category Donut (25%)]
Lead Table
```

Three charts in a row using CSS grid: `grid-template-columns: 2fr 1fr 1fr`

Below 1024px: stack vertically (1 column).

### Files Created

- `frontend/components/PipelineFunnel.tsx`
- `frontend/components/ScoreDistribution.tsx`
- `frontend/components/CategoryDonut.tsx`

### Files Modified

- `frontend/app/page.tsx` — add chart row between stats and table
- `frontend/lib/api.ts` — update Stats interface with new fields

---

## What NOT to Build

- No WebSocket/real-time updates (Phase 2)
- No email sending (Phase 3)
- No webhook endpoint (Phase 4)
- No new backend endpoints (just enhance existing stats)
- No new pages (just improve existing ones)
