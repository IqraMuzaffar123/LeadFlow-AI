"use client";
import Link from "next/link";
import { Lead } from "@/lib/api";

function categoryBadge(cat: string | null) {
    if (cat === "hot") return <span className="px-2.5 py-0.5 rounded-full text-[13px] font-bold bg-red-500/20 text-red-400 ring-1 ring-red-500/30">HOT</span>;
        if (cat === "warm") return <span className="px-2.5 py-0.5 rounded-full text-[13px] font-bold bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">WARM</span>;
    if (cat === "cold") return <span className="px-2.5 py-0.5 rounded-full text-[13px] font-bold bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30">COLD</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-[13px] text-slate-500 ring-1 ring-slate-700">--</span>;
}

function statusBadge(s: string) {
    const styles: Record<string, string> = {
        new: "bg-slate-700 text-slate-300",
        qualifying: "bg-purple-500/20 text-purple-400",
        qualified: "bg-indigo-500/20 text-indigo-400",
        emails_ready: "bg-teal-500/20 text-teal-400",
        synced: "bg-green-500/20 text-green-400",
        error: "bg-red-500/20 text-red-400",
    };
    return <span className={`px-2 py-0.5 rounded-md text-[13px] font-medium ${styles[s] || "bg-slate-700 text-slate-400"}`}>{s.replace(/_/g, " ")}</span>;
}

function scoreBar(score: number | null) {
    if (score === null) return <span className="text-slate-600">--</span>;
    const color = score >= 75 ? "bg-red-500" : score >= 40 ? "bg-amber-500" : "bg-blue-500";
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
            </div>
            <span className="text-[14px] font-mono text-slate-400">{score}</span>
        </div>
    );
}

export function LeadTable({ leads }: { leads: Lead[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-[16px]">
                <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                        <th className="px-4 py-3 text-left font-medium text-[14px] uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left font-medium text-[14px] uppercase tracking-wider">Company</th>
                        <th className="px-4 py-3 text-left font-medium text-[14px] uppercase tracking-wider">Score</th>
                        <th className="px-4 py-3 text-left font-medium text-[14px] uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left font-medium text-[14px] uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-[14px] uppercase tracking-wider">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((l) => (
                        <tr key={l.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3">
                                <Link href={`/leads/${l.id}`} className="text-blue-400 hover:text-blue-300 font-medium transition-colors text-[16px]">
                                    {l.first_name} {l.last_name}
                                </Link>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{l.company || "\u2014"}</td>
                            <td className="px-4 py-3">{scoreBar(l.ai_score)}</td>
                            <td className="px-4 py-3">{categoryBadge(l.ai_category)}</td>
                            <td className="px-4 py-3">{statusBadge(l.status)}</td>
                            <td className="px-4 py-3 text-slate-500 text-[13px]">{new Date(l.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {leads.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500 text-[16px]">No leads match your filter.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
