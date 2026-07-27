"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, Lead, Stats } from "@/lib/api";
import { StatsCards } from "@/components/StatsCards";
import { LeadTable } from "@/components/LeadTable";
import { PipelineFunnel } from "@/components/PipelineFunnel";
import { ScoreDistribution } from "@/components/ScoreDistribution";
import { CategoryDonut } from "@/components/CategoryDonut";

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);
    const [filter, setFilter] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const fetchData = () => {
        Promise.all([
            apiFetch<Stats>("/leads/stats"),
            apiFetch<{ leads: Lead[]; total: number }>("/leads?limit=50"),
        ]).then(([s, l]) => { setStats(s); setLeads(l.leads); setLoading(false); })
          .catch(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const processAllNew = async () => {
        const newLeads = leads.filter(l => l.status === "new");
        if (newLeads.length === 0) return;
        setProcessing(true);
        setProcessedCount(0);
        for (const lead of newLeads) {
            try {
                await apiFetch(`/leads/process/${lead.id}`, { method: "POST" });
                setProcessedCount(c => c + 1);
            } catch { /* skip failed */ }
        }
        setProcessing(false);
        fetchData();
    };

    const filteredLeads = leads.filter(l => {
        if (filter && l.ai_category !== filter && filter !== "new") return false;
        if (filter === "new" && l.status !== "new") return false;
        if (search) {
            const q = search.toLowerCase();
            return `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
                   (l.company || "").toLowerCase().includes(q) ||
                   l.email.toLowerCase().includes(q);
        }
        return true;
    });

    const newCount = leads.filter(l => l.status === "new").length;

    /* ── Loading state ── */
    if (loading)
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0b1120",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            border: "2.5px solid #d6a544",
                            borderTopColor: "transparent",
                            animation: "spin 0.8s linear infinite",
                        }}
                    />
                    <p style={{ color: "#79808f", fontSize: 16, margin: 0 }}>Loading dashboard…</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );

    /* ── Main layout ── */
    return (
        <div style={{ minHeight: "100vh", background: "#0b1120" }}>

            {/* ── Header ── */}
            <div
                style={{
                    background: "linear-gradient(135deg, rgba(12,18,35,0.98) 0%, rgba(20,14,35,0.98) 100%)",
                    borderBottom: "1px solid rgba(214,165,68,0.12)",
                    padding: "26px 40px",
                }}
            >
                <div
                    style={{
                        maxWidth: 1400,
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 16,
                    }}
                >
                    {/* Left: label + title + subtitle */}
                    <div>
                        <p
                            style={{
                                margin: "0 0 6px 0",
                                fontSize: 12,
                                textTransform: "uppercase",
                                letterSpacing: "0.15em",
                                color: "rgba(214,165,68,0.7)",
                                fontWeight: 600,
                            }}
                        >
                            PIPELINE OVERVIEW
                        </p>
                        <h1
                            style={{
                                margin: "0 0 4px 0",
                                fontSize: 32,
                                fontWeight: 700,
                                color: "#f4f1e8",
                                fontFamily: "'Playfair Display', Georgia, serif",
                                lineHeight: 1.15,
                            }}
                        >
                            LeadFlow AI
                        </h1>
                        <p style={{ margin: 0, fontSize: 17, color: "#8b93a3" }}>
                            AI-powered lead qualification
                        </p>
                    </div>

                    {/* Right: buttons */}
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Link href="/upload" style={{ textDecoration: "none" }}>
                            <button
                                style={{
                                    padding: "9px 20px",
                                    borderRadius: 10,
                                    fontSize: 15,
                                    fontWeight: 500,
                                    background: "transparent",
                                    border: "1px solid rgba(214,165,68,0.45)",
                                    color: "#d6a544",
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(214,165,68,0.08)";
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#d6a544";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(214,165,68,0.45)";
                                }}
                            >
                                Upload CSV
                            </button>
                        </Link>
                        <button
                            onClick={processAllNew}
                            disabled={processing || newCount === 0}
                            style={{
                                padding: "9px 22px",
                                borderRadius: 10,
                                fontSize: 15,
                                fontWeight: 700,
                                background:
                                    processing || newCount === 0
                                        ? "rgba(255,255,255,0.06)"
                                        : "linear-gradient(135deg, #d6a544 0%, #22c55e 100%)",
                                border: "none",
                                color: processing || newCount === 0 ? "#4b5563" : "#0b1120",
                                cursor: processing || newCount === 0 ? "default" : "pointer",
                                transition: "opacity 0.15s",
                                opacity: processing ? 0.75 : 1,
                            }}
                        >
                            {processing
                                ? `Processing ${processedCount}/${newCount}…`
                                : newCount > 0
                                ? `Process All (${newCount} new)`
                                : "Process All"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div
                style={{
                    maxWidth: 1400,
                    margin: "0 auto",
                    padding: "32px 40px 48px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                }}
            >
                {/* Stats row */}
                {stats && <StatsCards stats={stats} />}

                {/* Charts row: 2fr 1fr 1fr */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr",
                        gap: 18,
                        alignItems: "stretch",
                    }}
                >
                    <PipelineFunnel data={stats?.pipeline_funnel} />
                    <ScoreDistribution data={stats?.score_distribution} />
                    <CategoryDonut
                        byCategory={
                            stats?.by_category as
                                | { hot?: number; warm?: number; cold?: number }
                                | undefined
                        }
                    />
                </div>

                {/* Lead table (full width, search + filter inside) */}
                <LeadTable
                    leads={filteredLeads}
                    search={search}
                    onSearchChange={setSearch}
                    filter={filter}
                    onFilterChange={setFilter}
                />
            </div>
        </div>
    );
}
