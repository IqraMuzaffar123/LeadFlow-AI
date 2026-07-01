"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, Lead, Stats } from "@/lib/api";
import { StatsCards } from "@/components/StatsCards";
import { LeadTable } from "@/components/LeadTable";
import { PipelineChart } from "@/components/PipelineChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiFetch<Stats>("/leads/stats"),
            apiFetch<{ leads: Lead[]; total: number }>("/leads?limit=20"),
        ]).then(([s, l]) => { setStats(s); setLeads(l.leads); setLoading(false); })
          .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><p className="text-gray-500 text-lg">Loading dashboard...</p></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">LeadFlow AI</h1>
                    <p className="text-gray-500 mt-1">AI-Powered Lead Qualification Dashboard</p>
                </div>
                <Link href="/upload"><Button size="lg">Upload CSV</Button></Link>
            </div>
            {stats && <StatsCards stats={stats} />}
            {stats && (
                <Card>
                    <CardHeader><CardTitle>Pipeline Distribution</CardTitle></CardHeader>
                    <CardContent><PipelineChart stats={stats} /></CardContent>
                </Card>
            )}
            <Card>
                <CardHeader><CardTitle>Recent Leads</CardTitle></CardHeader>
                <CardContent><LeadTable leads={leads} /></CardContent>
            </Card>
        </div>
    );
}
