"use client";
import { Stats } from "@/lib/api";

type PipelineFunnelData = NonNullable<Stats["pipeline_funnel"]>;

const GLASS_CARD: React.CSSProperties = {
    background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.075)",
    boxShadow: "0 4px 22px rgba(0,0,0,0.45)",
    borderRadius: 16,
    padding: "20px 22px",
    height: "100%",
};

interface BarRow {
    label: string;
    value: number;
    max: number;
    gradFrom: string;
    gradTo: string;
}

const BAR_CONFIGS: { label: string; key: keyof PipelineFunnelData; gradFrom: string; gradTo: string }[] = [
    { label: "Ingested",  key: "ingested",         gradFrom: "#64748b", gradTo: "#94a3b8" },
    { label: "Enriched",  key: "enriched",          gradFrom: "#8b5cf6", gradTo: "#c084fc" },
    { label: "Qualified", key: "qualified",         gradFrom: "#3b82f6", gradTo: "#60a5fa" },
    { label: "Hot",       key: "hot",               gradFrom: "#ef4444", gradTo: "#f87171" },
    { label: "Emails",    key: "emails_generated",  gradFrom: "#f59e0b", gradTo: "#fbbf24" },
    { label: "CRM",       key: "crm_synced",        gradFrom: "#d6a544", gradTo: "#f4b942" },
];

export function PipelineFunnel({ data }: { data?: PipelineFunnelData | null }) {
    const max = data
        ? Math.max(...BAR_CONFIGS.map(c => data[c.key] ?? 0), 1)
        : 1;

    const rows: BarRow[] = BAR_CONFIGS.map(c => ({
        label: c.label,
        value: data?.[c.key] ?? 0,
        max,
        gradFrom: c.gradFrom,
        gradTo: c.gradTo,
    }));

    const ingested = data?.ingested ?? 0;

    return (
        <div style={GLASS_CARD}>
            {/* Header */}
            <p
                style={{
                    margin: "0 0 2px 0",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#f4f1e8",
                    fontFamily: "'Playfair Display', Georgia, serif",
                }}
            >
                Pipeline funnel
            </p>
            <p style={{ margin: "0 0 20px 0", fontSize: 14, color: "#79808f" }}>Last 30 days</p>

            {!data ? (
                <div
                    style={{
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#475569",
                        fontSize: 14,
                    }}
                >
                    No funnel data available
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {rows.map((row, i) => {
                        const pct = max > 0 ? (row.value / max) * 100 : 0;
                        const convPct =
                            i === 0
                                ? 100
                                : ingested > 0
                                ? Math.round((row.value / ingested) * 100)
                                : 0;
                        return (
                            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {/* Label */}
                                <div
                                    style={{
                                        width: 68,
                                        flexShrink: 0,
                                        fontSize: 15,
                                        color: "#9aa1b0",
                                        textAlign: "right",
                                    }}
                                >
                                    {row.label}
                                </div>
                                {/* Bar track */}
                                <div
                                    style={{
                                        flex: 1,
                                        height: 26,
                                        background: "rgba(255,255,255,0.04)",
                                        borderRadius: 8,
                                        overflow: "hidden",
                                        position: "relative",
                                    }}
                                >
                                    {/* Animated fill */}
                                    <div
                                        style={{
                                            height: "100%",
                                            width: `${pct}%`,
                                            background: `linear-gradient(90deg, ${row.gradFrom}, ${row.gradTo})`,
                                            borderRadius: 8,
                                            animation: "lfGrowX 0.6s ease forwards",
                                            display: "flex",
                                            alignItems: "center",
                                            paddingLeft: 10,
                                        }}
                                    >
                                        {row.value > 0 && (
                                            <span
                                                style={{
                                                    fontSize: 14,
                                                    fontFamily: "monospace",
                                                    fontWeight: 700,
                                                    color: "rgba(255,255,255,0.9)",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {row.value}
                                            </span>
                                        )}
                                    </div>
                                    {row.value === 0 && (
                                        <span
                                            style={{
                                                position: "absolute",
                                                left: 10,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                fontSize: 14,
                                                fontFamily: "monospace",
                                                fontWeight: 700,
                                                color: "rgba(255,255,255,0.3)",
                                            }}
                                        >
                                            0
                                        </span>
                                    )}
                                </div>
                                {/* Conversion % */}
                                <div
                                    style={{
                                        width: 42,
                                        flexShrink: 0,
                                        fontSize: 14,
                                        fontFamily: "monospace",
                                        color: "#79808f",
                                        textAlign: "right",
                                    }}
                                >
                                    {convPct}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes lfGrowX {
                    from { width: 0%; }
                }
            `}</style>
        </div>
    );
}
