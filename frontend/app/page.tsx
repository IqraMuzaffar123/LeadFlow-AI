"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, Lead, Stats } from "@/lib/api";
import { StatsCards } from "@/components/StatsCards";
import { LeadTable } from "@/components/LeadTable";
import { PipelineChart } from "@/components/PipelineChart";
import { PipelineFunnel } from "@/components/PipelineFunnel";
import { ScoreDistribution } from "@/components/ScoreDistribution";
import { CategoryDonut } from "@/components/CategoryDonut";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400">Loading dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-8 py-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            </div>
                            <h1 className="text-[32px] font-bold text-white">LeadFlow AI</h1>
                        </div>
                        <p className="text-blue-100 mt-2 text-[17px]">AI-Powered Lead Qualification & Outreach Automation</p>
                    </div>
                    <div className="flex gap-3">
                        {newCount > 0 && (
                            <Button onClick={processAllNew} disabled={processing}
                                className="bg-white text-purple-700 hover:bg-blue-50 font-semibold shadow-lg text-[15px]">
                                {processing ? `Processing ${processedCount}/${newCount}...` : `Process All (${newCount} new)`}
                            </Button>
                        )}
                        <Link href="/upload">
                            <Button className="bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur text-[15px]">
                                Upload CSV
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="px-8 py-6 max-w-7xl mx-auto space-y-6 -mt-4">
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
                        <Card className="bg-slate-900 border-slate-800 lg:col-span-1">
                            <CardHeader><CardTitle className="text-slate-200">Pipeline</CardTitle></CardHeader>
                            <CardContent><PipelineChart stats={stats} /></CardContent>
                        </Card>
                    )}
                    <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <CardTitle className="text-slate-200">Leads</CardTitle>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search leads..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[16px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-48"
                                    />
                                    <div className="flex gap-1">
                                        {[null, "hot", "warm", "cold", "new"].map(f => (
                                            <button key={f || "all"} onClick={() => setFilter(f)}
                                                className={`px-2.5 py-1 rounded-md text-[14px] font-medium transition-colors ${
                                                    filter === f
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                                }`}>
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
