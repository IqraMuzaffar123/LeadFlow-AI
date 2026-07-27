"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, Lead } from "@/lib/api";
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

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!lead) return (
        <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
            <p className="text-slate-400 text-lg">Lead not found.</p>
            <Link href="/"><Button variant="outline" className="mt-4">Back to Dashboard</Button></Link>
        </div>
    );

    const catConfig: Record<string, { gradient: string; label: string }> = {
        hot: { gradient: "from-red-500 to-orange-600", label: "HOT LEAD" },
        warm: { gradient: "from-amber-500 to-yellow-600", label: "WARM LEAD" },
        cold: { gradient: "from-blue-500 to-cyan-600", label: "COLD LEAD" },
    };
    const cat = lead.ai_category ? catConfig[lead.ai_category] : null;

    return (
        <div className="min-h-screen">
            <div className={`bg-gradient-to-r ${cat ? cat.gradient : "from-slate-700 to-slate-800"} px-8 py-8`}>
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="text-white/70 hover:text-white text-sm mb-4 inline-block">&larr; Back to Dashboard</Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-[32px] font-bold text-white">{lead.first_name} {lead.last_name}</h1>
                            <p className="text-white/80 mt-1 text-[17px]">{lead.job_title}{lead.company ? ` at ${lead.company}` : ""}</p>
                            <p className="text-white/60 text-[15px] mt-1">{lead.email}</p>
                        </div>
                        <div className="text-right">
                            {lead.ai_score !== null && (
                                <div className="text-[40px] font-bold text-white font-mono">{lead.ai_score}<span className="text-[17px] text-white/60">/100</span></div>
                            )}
                            {cat && <p className="text-white/80 text-[15px] font-bold mt-1">{cat.label}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 py-6 max-w-4xl mx-auto space-y-6 -mt-4">
                {lead.ai_reasoning && (
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="text-slate-200">AI Analysis</CardTitle></CardHeader>
                        <CardContent><p className="text-slate-300 leading-relaxed text-[16px]">{lead.ai_reasoning}</p></CardContent>
                    </Card>
                )}

                {lead.enriched_at && (
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-slate-200 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                Apollo Enrichment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {lead.company_size && (
                                    <div>
                                        <p className="text-[13px] text-slate-500 uppercase tracking-wider">Company Size</p>
                                        <p className="text-slate-300 font-medium text-[16px]">{lead.company_size} employees</p>
                                    </div>
                                )}
                                {lead.company_revenue && (
                                    <div>
                                        <p className="text-[13px] text-slate-500 uppercase tracking-wider">Revenue</p>
                                        <p className="text-slate-300 font-medium text-[16px]">{lead.company_revenue}</p>
                                    </div>
                                )}
                                {lead.company_industry && (
                                    <div>
                                        <p className="text-[13px] text-slate-500 uppercase tracking-wider">Industry</p>
                                        <p className="text-slate-300 font-medium text-[16px]">{lead.company_industry}</p>
                                    </div>
                                )}
                                {lead.person_title && (
                                    <div>
                                        <p className="text-[13px] text-slate-500 uppercase tracking-wider">Verified Title</p>
                                        <p className="text-slate-300 font-medium text-[16px]">{lead.person_title}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 mt-4">
                                {lead.person_linkedin && (
                                    <a href={lead.person_linkedin} target="_blank" rel="noopener noreferrer" className="text-[15px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                        Person LinkedIn
                                    </a>
                                )}
                                {lead.company_linkedin && (
                                    <a href={lead.company_linkedin} target="_blank" rel="noopener noreferrer" className="text-[15px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                        Company LinkedIn
                                    </a>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {lead.airtable_record_id && (
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <span className="text-slate-300 text-[15px]">Synced to Airtable</span>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">{lead.airtable_record_id}</span>
                        </CardContent>
                    </Card>
                )}

                {lead.message && (
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="text-slate-200">Original Message</CardTitle></CardHeader>
                        <CardContent><p className="text-slate-400 italic">"{lead.message}"</p></CardContent>
                    </Card>
                )}

                {lead.emails && lead.emails.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-[24px] font-semibold text-slate-200">Generated Emails</h2>
                        {lead.emails.map((e) => <EmailPreview key={e.id} email={e} />)}
                    </div>
                )}

                {lead.processing_log && lead.processing_log.length > 0 && (
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="text-slate-200">Processing Timeline</CardTitle></CardHeader>
                        <CardContent><ProcessingLog logs={lead.processing_log} /></CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
