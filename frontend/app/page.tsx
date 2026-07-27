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

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3">
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "2px solid #d6a544",
                        borderTopColor: "transparent",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <p style={{ color: "#9aa1b0", fontSize: 16 }}>Loading dashboard...</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh" }} className="animate-rise">
            {/* Page header */}
            <div
                style={{
                    padding: "32px 36px 24px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 16,
                }}
            >
                <div>
                    <h1
                        style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 30,
                            fontWeight: 700,
                            color: "#f4f1e8",
                            margin: 0,
                            lineHeight: 1.2,
                        }}
                    >
                        Dashboard
                    </h1>
                    <p style={{ color: "#9aa1b0", fontSize: 15, marginTop: 6 }}>
                        AI-powered lead qualification &amp; outreach automation
                    </p>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    {newCount > 0 && (
                        <button
                            onClick={processAllNew}
                            disabled={processing}
                            style={{
                                background: processing ? "rgba(214,165,68,0.4)" : "linear-gradient(135deg, #d6a544, #f4b942)",
                                color: "#06080d",
                                border: "none",
                                borderRadius: 10,
                                padding: "9px 18px",
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: processing ? "not-allowed" : "pointer",
                                boxShadow: "0 2px 14px rgba(214,165,68,0.28)",
                                transition: "opacity 0.18s",
                            }}
                        >
                            {processing ? `Processing ${processedCount}/${newCount}...` : `Process All (${newCount} new)`}
                        </button>
                    )}
                    <Link href="/upload" style={{ textDecoration: "none" }}>
                        <button
                            style={{
                                background: "rgba(255,255,255,0.06)",
                                color: "#f4f1e8",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: 10,
                                padding: "9px 18px",
                                fontSize: 15,
                                fontWeight: 500,
                                cursor: "pointer",
                                backdropFilter: "blur(8px)",
                                transition: "background 0.18s, border-color 0.18s",
                            }}
                        >
                            Upload CSV
                        </button>
                    </Link>
                </div>
            </div>

            <div style={{ padding: "28px 36px", maxWidth: 1400, display: "flex", flexDirection: "column", gap: 24 }}>
                {stats && <StatsCards stats={stats} />}

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                        <PipelineFunnel data={stats?.pipeline_funnel} />
                    </div>
                    <div>
                        <ScoreDistribution data={stats?.score_distribution} />
                    </div>
                    <div>
                        <CategoryDonut byCategory={stats?.by_category as { hot?: number; warm?: number; cold?: number }} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {stats && (
                        <Card
                            className="lg:col-span-1"
                            style={{
                                background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255,255,255,0.075)",
                                borderRadius: 16,
                                boxShadow: "0 4px 22px rgba(0,0,0,0.45)",
                            }}
                        >
                            <CardHeader>
                                <CardTitle style={{ color: "#f4f1e8", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18 }}>
                                    Pipeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent><PipelineChart stats={stats} /></CardContent>
                        </Card>
                    )}
                    <Card
                        className="lg:col-span-2"
                        style={{
                            background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.075)",
                            borderRadius: 16,
                            boxShadow: "0 4px 22px rgba(0,0,0,0.45)",
                        }}
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <CardTitle style={{ color: "#f4f1e8", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18 }}>
                                    Leads
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search leads..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        style={{
                                            padding: "7px 12px",
                                            borderRadius: 8,
                                            background: "rgba(255,255,255,0.06)",
                                            border: "1px solid rgba(255,255,255,0.10)",
                                            color: "#f4f1e8",
                                            fontSize: 15,
                                            width: 180,
                                            outline: "none",
                                        }}
                                    />
                                    <div className="flex gap-1">
                                        {[null, "hot", "warm", "cold", "new"].map(f => (
                                            <button
                                                key={f || "all"}
                                                onClick={() => setFilter(f)}
                                                style={{
                                                    padding: "5px 10px",
                                                    borderRadius: 7,
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    border: "none",
                                                    cursor: "pointer",
                                                    transition: "background 0.15s, color 0.15s",
                                                    background: filter === f
                                                        ? "rgba(214,165,68,0.18)"
                                                        : "rgba(255,255,255,0.05)",
                                                    color: filter === f ? "#d6a544" : "#8b93a3",
                                                    outline: filter === f ? "1px solid rgba(214,165,68,0.35)" : "none",
                                                }}
                                            >
                                                {f ? f.toUpperCase() : "ALL"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent><LeadTable leads={filteredLeads} /></CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
