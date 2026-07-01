CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(20) NOT NULL CHECK (source IN ('webhook', 'csv')),
    raw_payload JSONB,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    job_title VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    industry VARCHAR(100),
    message TEXT,
    ai_score INTEGER CHECK (ai_score BETWEEN 0 AND 100),
    ai_category VARCHAR(10) CHECK (ai_category IN ('hot', 'warm', 'cold')),
    ai_reasoning TEXT,
    ai_qualified_at TIMESTAMP,
    hubspot_contact_id VARCHAR(50),
    hubspot_deal_id VARCHAR(50),
    hubspot_synced_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN (
        'new', 'qualifying', 'qualified', 'generating_emails',
        'emails_ready', 'syncing', 'synced', 'error'
    )),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL CHECK (sequence_number IN (1, 2)),
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    tone VARCHAR(20) DEFAULT 'professional',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'sent')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE processing_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    step VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    duration_ms INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_ai_category ON leads(ai_category);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_emails_lead_id ON emails(lead_id);
CREATE INDEX idx_processing_log_lead_id ON processing_log(lead_id);
