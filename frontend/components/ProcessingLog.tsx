import { ProcessingLogEntry } from "@/lib/api";

const LABELS: Record<string, string> = {
    ingest: "Lead Ingested",
    qualify: "AI Qualification",
    email_gen: "Email Generation",
    hubspot_sync: "CRM Sync",
    pipeline: "Pipeline",
};

const NOTES: Record<string, string> = {
    ingest: "Raw lead data received",
    qualify: "Score + category assigned",
    email_gen: "Outreach sequences drafted",
    hubspot_sync: "Contact synced to HubSpot",
    pipeline: "Pipeline stage updated",
};

export function ProcessingLog({ logs }: { logs: ProcessingLogEntry[] }) {
    const glassCard: React.CSSProperties = {
        background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.075)",
        boxShadow: "0 4px 22px rgba(0,0,0,0.45)",
        borderRadius: "14px",
        padding: "24px 28px",
    };

    if (logs.length === 0) {
        return (
            <div style={glassCard}>
                <h2 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#f4f1e8",
                    margin: "0 0 20px",
                }}>
                    Processing log
                </h2>
                <p style={{ fontSize: 15, color: "#79808f" }}>No processing logs yet.</p>
            </div>
        );
    }

    return (
        <div style={glassCard}>
            <h2 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 24,
                fontWeight: 700,
                color: "#f4f1e8",
                margin: "0 0 24px",
            }}>
                Processing log
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {logs.map((l, i) => {
                    const isSuccess = l.status === "completed";
                    const isPending = l.status === "pending" || l.status === "processing";
                    const dotColor = isSuccess ? "#22c55e" : isPending ? "#f59e0b" : "#ef4444";
                    const dotGlow = isSuccess
                        ? "0 0 8px rgba(34,197,94,0.6)"
                        : isPending
                        ? "0 0 8px rgba(245,158,11,0.6)"
                        : "0 0 8px rgba(239,68,68,0.6)";
                    const lineColor = isSuccess
                        ? "rgba(34,197,94,0.25)"
                        : isPending
                        ? "rgba(245,158,11,0.25)"
                        : "rgba(239,68,68,0.25)";

                    const durationStr = l.duration_ms !== null
                        ? l.duration_ms < 1000
                            ? `${l.duration_ms}ms`
                            : `${(l.duration_ms / 1000).toFixed(1)}s`
                        : null;

                    const note = NOTES[l.step] || "";

                    return (
                        <div key={l.id} style={{ display: "flex", gap: 16, position: "relative" }}>
                            {/* Timeline column */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
                                <div style={{
                                    width: 11,
                                    height: 11,
                                    borderRadius: "50%",
                                    background: dotColor,
                                    boxShadow: dotGlow,
                                    marginTop: 4,
                                    flexShrink: 0,
                                }} />
                                {i < logs.length - 1 && (
                                    <div style={{
                                        width: 1,
                                        flex: 1,
                                        minHeight: 28,
                                        background: lineColor,
                                        margin: "4px 0",
                                    }} />
                                )}
                            </div>

                            {/* Content */}
                            <div style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                paddingBottom: i < logs.length - 1 ? 16 : 0,
                                paddingTop: 0,
                            }}>
                                <div>
                                    <span style={{ fontSize: 15, fontWeight: 700, color: "#e8e6df" }}>
                                        {LABELS[l.step] || l.step}
                                    </span>
                                    {l.status === "skipped" && (
                                        <span style={{ fontSize: 14, color: "#79808f", marginLeft: 8 }}>(skipped)</span>
                                    )}
                                    {note && (
                                        <p style={{ fontSize: 14, color: "#79808f", margin: "2px 0 0" }}>{note}</p>
                                    )}
                                </div>
                                {durationStr && (
                                    <span style={{
                                        fontSize: 14,
                                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                        color: dotColor,
                                        flexShrink: 0,
                                        marginLeft: 16,
                                        marginTop: 3,
                                    }}>
                                        {durationStr}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
