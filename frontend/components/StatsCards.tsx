"use client";
import { Stats } from "@/lib/api";

export function StatsCards({ stats }: { stats: Stats }) {
    const cards = [
        { title: "Total Leads", value: stats.total, gradient: "from-slate-700 to-slate-800", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
        { title: "Hot Leads", value: stats.by_category?.hot ?? 0, gradient: "from-red-500 to-orange-600", icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" },
        { title: "Warm Leads", value: stats.by_category?.warm ?? 0, gradient: "from-amber-500 to-yellow-600", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" },
        { title: "Cold Leads", value: stats.by_category?.cold ?? 0, gradient: "from-blue-500 to-cyan-600", icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" },
        { title: "Today", value: stats.today, gradient: "from-emerald-500 to-teal-600", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
        { title: "Enriched", value: stats.enriched ?? 0, gradient: "from-purple-500 to-violet-600", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
        { title: "HubSpot Synced", value: stats.synced_to_hubspot ?? 0, gradient: "from-orange-500 to-red-600", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {cards.map((c) => (
                <div key={c.title} className={`bg-gradient-to-br ${c.gradient} rounded-xl p-4 shadow-lg hover:scale-[1.02] transition-transform cursor-default`}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[14px] font-medium uppercase tracking-wider text-white/80">{c.title}</p>
                        <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={c.icon}/></svg>
                    </div>
                    <p className="text-[40px] font-bold text-white font-mono">{c.value}</p>
                </div>
            ))}
        </div>
    );
}
