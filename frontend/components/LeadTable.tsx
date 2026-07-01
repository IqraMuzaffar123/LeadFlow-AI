"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/lib/api";

function categoryBadge(cat: string | null) {
    if (cat === "hot") return <Badge className="bg-red-100 text-red-800">HOT</Badge>;
    if (cat === "warm") return <Badge className="bg-yellow-100 text-yellow-800">WARM</Badge>;
    if (cat === "cold") return <Badge className="bg-blue-100 text-blue-800">COLD</Badge>;
    return <Badge variant="outline">--</Badge>;
}

function statusBadge(s: string) {
    const c: Record<string, string> = {
        new: "bg-gray-100 text-gray-800", qualified: "bg-indigo-100 text-indigo-800",
        emails_ready: "bg-teal-100 text-teal-800", synced: "bg-green-100 text-green-800",
        error: "bg-red-100 text-red-800",
    };
    return <Badge className={c[s] || "bg-gray-100 text-gray-800"}>{s.replace(/_/g, " ")}</Badge>;
}

export function LeadTable({ leads }: { leads: Lead[] }) {
    return (
        <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left font-medium">Name</th>
                        <th className="px-4 py-3 text-left font-medium">Company</th>
                        <th className="px-4 py-3 text-left font-medium">Score</th>
                        <th className="px-4 py-3 text-left font-medium">Category</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((l) => (
                        <tr key={l.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <Link href={`/leads/${l.id}`} className="text-blue-600 hover:underline font-medium">
                                    {l.first_name} {l.last_name}
                                </Link>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{l.company || "\u2014"}</td>
                            <td className="px-4 py-3 font-mono">{l.ai_score !== null ? `${l.ai_score}/100` : "\u2014"}</td>
                            <td className="px-4 py-3">{categoryBadge(l.ai_category)}</td>
                            <td className="px-4 py-3">{statusBadge(l.status)}</td>
                            <td className="px-4 py-3 text-gray-500">{new Date(l.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {leads.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No leads yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
