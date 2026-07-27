"use client";

interface ByCategory {
    hot?: number;
    warm?: number;
    cold?: number;
    [key: string]: number | undefined;
}

const GLASS_CARD: React.CSSProperties = {
    background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.075)",
    boxShadow: "0 4px 22px rgba(0,0,0,0.45)",
    borderRadius: 16,
    padding: "20px 22px",
    height: "100%",
};

const SEGMENTS = [
    { key: "hot",  label: "Hot",  color: "#ef4444", dotGlow: "rgba(239,68,68,0.6)" },
    { key: "warm", label: "Warm", color: "#f59e0b", dotGlow: "rgba(245,158,11,0.6)" },
    { key: "cold", label: "Cold", color: "#3b82f6", dotGlow: "rgba(59,130,246,0.6)" },
] as const;

export function CategoryDonut({ byCategory }: { byCategory?: ByCategory | null }) {
    const hot  = byCategory?.hot  ?? 0;
    const warm = byCategory?.warm ?? 0;
    const cold = byCategory?.cold ?? 0;
    const total = hot + warm + cold;

    // Build conic-gradient fractions
    let conicBg: string;
    if (total === 0) {
        conicBg = "#1e293b";
    } else {
        const hotFrac  = hot  / total;
        const warmFrac = hotFrac + warm / total;
        conicBg = `conic-gradient(#ef4444 0turn ${hotFrac.toFixed(4)}turn, #f59e0b ${hotFrac.toFixed(4)}turn ${warmFrac.toFixed(4)}turn, #3b82f6 ${warmFrac.toFixed(4)}turn 1turn)`;
    }

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
                Category mix
            </p>
            <p style={{ margin: "0 0 18px 0", fontSize: 14, color: "#79808f" }}>By AI classification</p>

            {/* Donut + Legend row */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {/* Donut */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                    {/* Outer ring */}
                    <div
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            background: conicBg,
                        }}
                    />
                    {/* Inner mask (creates donut hole) */}
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 72,
                            height: 72,
                            borderRadius: "50%",
                            background: "linear-gradient(160deg, rgba(18,24,38,0.97), rgba(12,18,30,0.99))",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <span
                            style={{
                                fontSize: 26,
                                fontWeight: 700,
                                fontFamily: "monospace",
                                color: "#f4f1e8",
                                lineHeight: 1,
                            }}
                        >
                            {total}
                        </span>
                        <span
                            style={{
                                fontSize: 11,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                color: "#79808f",
                                marginTop: 2,
                            }}
                        >
                            total
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                    {SEGMENTS.map(s => {
                        const count = byCategory?.[s.key] ?? 0;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                            <div
                                key={s.key}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 8,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span
                                        style={{
                                            width: 9,
                                            height: 9,
                                            borderRadius: "50%",
                                            background: s.color,
                                            boxShadow: `0 0 6px ${s.dotGlow}`,
                                            flexShrink: 0,
                                            display: "inline-block",
                                        }}
                                    />
                                    <span style={{ fontSize: 15, color: "#9aa1b0" }}>{s.label}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: 15, fontWeight: 600, color: "#f4f1e8" }}>{count}</span>
                                    <span style={{ fontSize: 13, color: "#79808f" }}>{pct}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
