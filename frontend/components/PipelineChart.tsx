"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Stats } from "@/lib/api";

const COLORS: Record<string, string> = { hot: "#dc2626", warm: "#d97706", cold: "#2563eb" };

export function PipelineChart({ stats }: { stats: Stats }) {
    const data = Object.entries(stats.by_category).map(([name, value]) => ({
        name: name.toUpperCase(), value, color: COLORS[name] || "#6b7280",
    }));
    if (data.length === 0) return <p className="text-gray-500 text-center py-8">No qualified leads yet.</p>;
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={60} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {data.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
