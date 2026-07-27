"use client";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Stats } from "@/lib/api";

type ScoreData = NonNullable<Stats["score_distribution"]>;

const CARD_STYLE: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: "16px 20px",
};

const BUCKET_COLORS: Record<string, string> = {
    "0-20": "#60a5fa",
    "20-40": "#60a5fa",
    "40-60": "#f59e0b",
    "60-80": "#f59e0b",
    "80-100": "#ef4444",
};

interface TooltipProps {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload || payload.length === 0) return null;
    return (
        <div
            style={{
                background: "#0d1320",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 14,
                color: "#e2e8f0",
            }}
        >
            <p style={{ margin: 0, fontWeight: 600 }}>Score {label}</p>
            <p style={{ margin: 0, color: "#94a3b8" }}>{payload[0].value} leads</p>
        </div>
    );
}

const DEFAULT_BUCKETS: ScoreData = [
    { range: "0-20", count: 0 },
    { range: "20-40", count: 0 },
    { range: "40-60", count: 0 },
    { range: "60-80", count: 0 },
    { range: "80-100", count: 0 },
];

export function ScoreDistribution({ data }: { data?: ScoreData | null }) {
    const chartData = data && data.length > 0 ? data : DEFAULT_BUCKETS;
    const isEmpty = !data || data.length === 0 || data.every(d => d.count === 0);

    return (
        <div style={CARD_STYLE}>
            <p style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>
                Score Distribution
            </p>
            {isEmpty && !data ? (
                <div
                    style={{
                        height: 220,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#475569",
                        fontSize: 14,
                    }}
                >
                    No score data available
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 0, right: 8, bottom: 0, left: -16 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="range"
                            tick={{ fill: "#94a3b8", fontSize: 14 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: "#94a3b8", fontSize: 14 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={index} fill={BUCKET_COLORS[entry.range] ?? "#60a5fa"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
