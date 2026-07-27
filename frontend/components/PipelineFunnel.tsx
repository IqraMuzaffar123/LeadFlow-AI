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

type PipelineFunnelData = NonNullable<Stats["pipeline_funnel"]>;

const BAR_COLORS = ["#64748b", "#4e8ca6", "#38a89d", "#22c49b", "#10c98a", "#10b981"];

const CARD_STYLE: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: "16px 20px",
};

interface TooltipProps {
    active?: boolean;
    payload?: { value: number; name: string }[];
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
            <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
            <p style={{ margin: 0, color: "#94a3b8" }}>{payload[0].value} leads</p>
        </div>
    );
}

function buildChartData(data: PipelineFunnelData) {
    return [
        { name: "Ingested", value: data.ingested },
        { name: "Enriched", value: data.enriched },
        { name: "Qualified", value: data.qualified },
        { name: "Hot", value: data.hot },
        { name: "Emails", value: data.emails_generated },
        { name: "CRM Synced", value: data.crm_synced },
    ];
}

export function PipelineFunnel({ data }: { data?: PipelineFunnelData | null }) {
    return (
        <div style={CARD_STYLE}>
            <p style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>
                Pipeline Funnel
            </p>
            {!data ? (
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
                    No funnel data available
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                        layout="vertical"
                        data={buildChartData(data)}
                        margin={{ top: 0, right: 16, bottom: 0, left: 4 }}
                    >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            type="number"
                            tick={{ fill: "#94a3b8", fontSize: 14 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={80}
                            tick={{ fill: "#94a3b8", fontSize: 14 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {buildChartData(data).map((_, index) => (
                                <Cell key={index} fill={BAR_COLORS[index]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
