"use client";
import { Stats } from "@/lib/api";

type ScoreData = NonNullable<Stats["score_distribution"]>;

const GLASS_CARD: React.CSSProperties = {
    background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.075)",
    boxShadow: "0 4px 22px rgba(0,0,0,0.45)",
    borderRadius: 16,
    padding: "20px 22px",
    height: "100%",
};

const BUCKET_STYLES: Record<string, { gradFrom: string; gradTo: string; shadow: string }> = {
    "0-20":   { gradFrom: "#1d4ed8", gradTo: "#3b82f6", shadow: "rgba(59,130,246,0.35)" },
    "20-40":  { gradFrom: "#2563eb", gradTo: "#60a5fa", shadow: "rgba(96,165,250,0.3)" },
    "40-60":  { gradFrom: "#b45309", gradTo: "#f59e0b", shadow: "rgba(245,158,11,0.35)" },
    "60-80":  { gradFrom: "#d97706", gradTo: "#fbbf24", shadow: "rgba(251,191,36,0.3)" },
    "80-100": { gradFrom: "#b91c1c", gradTo: "#ef4444", shadow: "rgba(239,68,68,0.35)" },
};

const DEFAULT_BUCKETS: ScoreData = [
    { range: "0-20", count: 0 },
    { range: "20-40", count: 0 },
    { range: "40-60", count: 0 },
    { range: "60-80", count: 0 },
    { range: "80-100", count: 0 },
];

export function ScoreDistribution({ data }: { data?: ScoreData | null }) {
    const chartData = data && data.length > 0 ? data : DEFAULT_BUCKETS;
    const maxCount = Math.max(...chartData.map(d => d.count), 1);
    const BAR_MAX_HEIGHT = 140; // px

    return (
        <div style={GLASS_CARD}>
            <p
                style={{
                    margin: "0 0 20px 0",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#f4f1e8",
                    fontFamily: "'Playfair Display', Georgia, serif",
                }}
            >
                Score distribution
            </p>

            {/* Bars container */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    height: BAR_MAX_HEIGHT + 36,
                    gap: 8,
                }}
            >
                {chartData.map((bucket) => {
                    const style = BUCKET_STYLES[bucket.range] ?? BUCKET_STYLES["0-20"];
                    const barH = maxCount > 0 ? Math.max((bucket.count / maxCount) * BAR_MAX_HEIGHT, bucket.count > 0 ? 6 : 0) : 0;
                    return (
                        <div
                            key={bucket.range}
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            {/* Count label above bar */}
                            <span
                                style={{
                                    fontSize: 14,
                                    fontFamily: "monospace",
                                    color: bucket.count > 0 ? "#f4f1e8" : "#40475a",
                                    marginBottom: 2,
                                }}
                            >
                                {bucket.count}
                            </span>
                            {/* Bar */}
                            <div
                                style={{
                                    width: "100%",
                                    height: barH,
                                    background: `linear-gradient(180deg, ${style.gradFrom}, ${style.gradTo})`,
                                    borderRadius: "5px 5px 0 0",
                                    boxShadow: bucket.count > 0 ? `0 0 12px ${style.shadow}` : "none",
                                    transition: "height 0.5s ease",
                                    minHeight: 2,
                                }}
                            />
                            {/* Range label below */}
                            <span
                                style={{
                                    fontSize: 12,
                                    fontFamily: "monospace",
                                    color: "#79808f",
                                    whiteSpace: "nowrap",
                                    marginTop: 4,
                                }}
                            >
                                {bucket.range}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
