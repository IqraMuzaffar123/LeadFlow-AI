const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });
    if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
    }
    return res.json();
}

export interface Lead {
    id: string;
    source: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    company: string | null;
    job_title: string | null;
    ai_score: number | null;
    ai_category: string | null;
    ai_reasoning: string | null;
    hubspot_contact_id: string | null;
    hubspot_deal_id: string | null;
    status: string;
    created_at: string;
    emails?: Email[];
    processing_log?: ProcessingLogEntry[];
}

export interface Email {
    id: string;
    sequence_number: number;
    subject: string;
    body: string;
    tone: string;
    status: string;
    created_at: string;
}

export interface ProcessingLogEntry {
    id: string;
    step: string;
    status: string;
    duration_ms: number | null;
    details: Record<string, unknown> | null;
    created_at: string;
}

export interface Stats {
    total: number;
    by_status: Record<string, number>;
    by_category: Record<string, number>;
    today: number;
    synced_to_hubspot: number;
}
