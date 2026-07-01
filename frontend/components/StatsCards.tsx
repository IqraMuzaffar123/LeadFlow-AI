"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stats } from "@/lib/api";

export function StatsCards({ stats }: { stats: Stats }) {
    const cards = [
        { title: "Total Leads", value: stats.total, color: "text-gray-900" },
        { title: "Hot", value: stats.by_category?.hot ?? 0, color: "text-red-600" },
        { title: "Warm", value: stats.by_category?.warm ?? 0, color: "text-yellow-600" },
        { title: "Cold", value: stats.by_category?.cold ?? 0, color: "text-blue-600" },
        { title: "Synced", value: stats.synced_to_hubspot, color: "text-green-600" },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {cards.map((c) => (
                <Card key={c.title}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">{c.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${c.color}`}>{c.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
