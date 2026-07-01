"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, Lead } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailPreview } from "@/components/EmailPreview";
import { ProcessingLog } from "@/components/ProcessingLog";

export default function LeadDetailPage() {
    const params = useParams();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            apiFetch<Lead>(`/leads/${params.id}`).then(setLead).finally(() => setLoading(false));
        }
    }, [params.id]);

    if (loading) return <div className="p-8"><p className="text-gray-500">Loading...</p></div>;
    if (!lead) return <div className="p-8 text-center"><p>Lead not found.</p><Link href="/"><Button variant="outline" className="mt-4">Back</Button></Link></div>;

    const catColors: Record<string, string> = { hot: "bg-red-100 text-red-800", warm: "bg-yellow-100 text-yellow-800", cold: "bg-blue-100 text-blue-800" };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/"><Button variant="outline" size="sm">Back</Button></Link>
                <h1 className="text-2xl font-bold">{lead.first_name} {lead.last_name}{lead.company ? ` \u2014 ${lead.company}` : ""}</h1>
            </div>
            <Card>
                <CardHeader><CardTitle>Lead Overview</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-500">Score</p><p className="text-3xl font-bold">{lead.ai_score !== null ? `${lead.ai_score}/100` : "\u2014"}</p></div>
                    <div><p className="text-sm text-gray-500">Category</p><div className="mt-1">{lead.ai_category ? <Badge className={`text-lg px-3 py-1 ${catColors[lead.ai_category] || ""}`}>{lead.ai_category.toUpperCase()}</Badge> : "\u2014"}</div></div>
                    <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{lead.email}</p></div>
                    <div><p className="text-sm text-gray-500">Status</p><Badge variant="outline" className="mt-1">{lead.status}</Badge></div>
                    {lead.hubspot_contact_id && <div className="col-span-2"><p className="text-sm text-gray-500">HubSpot</p><p className="text-sm mt-1">Contact: {lead.hubspot_contact_id} | Deal: {lead.hubspot_deal_id}</p></div>}
                </CardContent>
            </Card>
            {lead.ai_reasoning && <Card><CardHeader><CardTitle>AI Reasoning</CardTitle></CardHeader><CardContent><p className="text-gray-700 leading-relaxed">{lead.ai_reasoning}</p></CardContent></Card>}
            {lead.emails && lead.emails.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Generated Emails</h2>
                    {lead.emails.map((e) => <EmailPreview key={e.id} email={e} />)}
                </div>
            )}
            {lead.processing_log && <Card><CardHeader><CardTitle>Processing Log</CardTitle></CardHeader><CardContent><ProcessingLog logs={lead.processing_log} /></CardContent></Card>}
        </div>
    );
}
