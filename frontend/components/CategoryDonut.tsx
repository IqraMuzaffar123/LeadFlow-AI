"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ByCategory {
    hot?: number;
    warm?: number;
    cold?: number;
    [key: string]: number | undefined;
}

const SEGMENTS = [
    { key: "hot", label: "Hot", color: "#ef4444" },
    { key: "warm", label: "Warm", color: "#f59e0b" },
    { key: "cold", label: "Cold", color: "#60a5fa" },
] as const;

const CARD_STYLE: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: "16px 20px",
};

export function CategoryDonut({ byCategory }: { byCategory?: ByCategory | null }) {
    const values = SEGMENTS.map(s => ({
        ...s,
        value: byCategory?.[s.key] ?? 0,
    }));

    const total = values.reduce((sum, s) => sum + s.value, 0);
    const hasData = total > 0;

    const chartData = hasData
        ? values.filter(v => v.value > 0)
        : [{ key: "empty", label: "No data", color: "#1e293b", value: 1 }];

    return (
        <div style={CARD_STYLE}>
            <p style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>
                Lead Categories
            </p>

            {/* Chart + center overlay */}
            <div style={{ position: "relative" }}>
                <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Center text rendered as a CSS overlay — more reliable than recharts label prop */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                    }}
                >
                    {hasData ? (
                        <>
                            <span
                                style={{
                                    fontSize: 24,
                                    fontWeight: 700,
                                    fontFamily: "monospace",
                                    color: "#e2e8f0",
                                    lineHeight: 1,
                                }}
                            >
                                {total}
                            </span>
                            <span style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>leads</span>
                        </>
                    ) : (
                        <span style={{ fontSize: 13, color: "#475569" }}>No data</span>
                    )}
                </div>
            </div>

            {/* Custom legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {SEGMENTS.map(s => {
                    const count = byCategory?.[s.key] ?? 0;
                    return (
                        <div
                            key={s.key}
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        background: s.color,
                                        display: "inline-block",
                                        flexShrink: 0,
                                    }}
                                />
                                <span style={{ fontSize: 13, color: "#94a3b8" }}>{s.label}</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
