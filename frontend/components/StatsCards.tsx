"use client";
import { Stats } from "@/lib/api";

const GLASS_CARD: React.CSSProperties = {
    background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.075)",
    boxShadow: "0 4px 22px rgba(0,0,0,0.45)",
    borderRadius: 16,
    padding: "18px 16px 14px",
    position: "relative",
    overflow: "hidden",
    cursor: "default",
    transition: "transform 0.18s ease",
};

interface CardDef {
    title: string;
    value: number;
    sub: string;
    gradFrom: string;
    gradTo: string;
    glow: string;
    icon: string;
}

export function StatsCards({ stats }: { stats: Stats }) {
    const cards: CardDef[] = [
        {
            title: "Total Leads",
            value: stats.total,
            sub: "all time",
            gradFrom: "#64748b",
            gradTo: "#94a3b8",
            glow: "rgba(148,163,184,0.18)",
            icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
        },
        {
            title: "Hot Leads",
            value: stats.by_category?.hot ?? 0,
            sub: "high priority",
            gradFrom: "#ef4444",
            gradTo: "#f87171",
            glow: "rgba(239,68,68,0.30)",
            icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
        },
        {
            title: "Warm Leads",
            value: stats.by_category?.warm ?? 0,
            sub: "nurture queue",
            gradFrom: "#f59e0b",
            gradTo: "#fbbf24",
            glow: "rgba(245,158,11,0.28)",
            icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
        },
        {
            title: "Cold Leads",
            value: stats.by_category?.cold ?? 0,
            sub: "low engagement",
            gradFrom: "#3b82f6",
            gradTo: "#60a5fa",
            glow: "rgba(59,130,246,0.26)",
            icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
        },
        {
            title: "Today",
            value: stats.today,
            sub: "new today",
            gradFrom: "#10b981",
            gradTo: "#34d399",
            glow: "rgba(16,185,129,0.26)",
            icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
        },
        {
            title: "Enriched",
            value: stats.enriched ?? 0,
            sub: "data enriched",
            gradFrom: "#8b5cf6",
            gradTo: "#c084fc",
            glow: "rgba(139,92,246,0.26)",
            icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
        },
        {
            title: "HubSpot",
            value: stats.synced_to_hubspot ?? 0,
            sub: "CRM synced",
            gradFrom: "#d6a544",
            gradTo: "#f4b942",
            glow: "rgba(214,165,68,0.28)",
            icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
        },
    ];

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 14,
            }}
            className="grid-cols-4 lg:grid-cols-7"
        >
            {cards.map((c) => (
                <div
                    key={c.title}
                    style={GLASS_CARD}
                    onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(0)")}
                >
                    {/* Top gradient border */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            background: `linear-gradient(90deg, ${c.gradFrom}, ${c.gradTo})`,
                            borderRadius: "16px 16px 0 0",
                        }}
                    />
                    {/* Glow orb */}
                    <div
                        style={{
                            position: "absolute",
                            top: -20,
                            right: -20,
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            background: c.glow,
                            filter: "blur(32px)",
                            pointerEvents: "none",
                        }}
                    />
                    {/* Icon */}
                    <div style={{ position: "absolute", top: 14, right: 13, opacity: 0.55 }}>
                        <svg width={17} height={17} fill="none" viewBox="0 0 24 24" stroke={c.gradTo} strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
                        </svg>
                    </div>
                    {/* Label */}
                    <p
                        style={{
                            margin: "0 0 6px 0",
                            fontSize: 14,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "#7d8494",
                            fontWeight: 500,
                        }}
                    >
                        {c.title}
                    </p>
                    {/* Number */}
                    <p
                        style={{
                            margin: "0 0 4px 0",
                            fontSize: 40,
                            fontWeight: 700,
                            fontFamily: "monospace",
                            color: "#f4f1e8",
                            lineHeight: 1,
                        }}
                    >
                        {c.value}
                    </p>
                    {/* Sub-text */}
                    <p style={{ margin: 0, fontSize: 15, color: "#79808f" }}>{c.sub}</p>
                </div>
            ))}
        </div>
    );
}
