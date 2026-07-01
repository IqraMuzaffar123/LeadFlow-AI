import { ProcessingLogEntry } from "@/lib/api";

const LABELS: Record<string, string> = {
    ingest: "Ingested", qualify: "Qualified", email_gen: "Emails Generated",
    hubspot_sync: "HubSpot Synced", pipeline: "Pipeline",
};

export function ProcessingLog({ logs }: { logs: ProcessingLogEntry[] }) {
    return (
        <div className="space-y-2">
            {logs.map((l) => (
                <div key={l.id} className="flex items-center gap-2 text-sm">
                    <span>{l.status === "completed" ? "\u2705" : l.status === "error" ? "\u274c" : "\u23f3"}</span>
                    <span className="font-medium">{LABELS[l.step] || l.step}</span>
                    {l.duration_ms !== null && (
                        <span className="text-gray-500">
                            {l.duration_ms < 1000 ? `${l.duration_ms}ms` : `${(l.duration_ms / 1000).toFixed(1)}s`}
                        </span>
                    )}
                </div>
            ))}
            {logs.length === 0 && <p className="text-sm text-gray-500">No processing logs yet.</p>}
        </div>
    );
}
