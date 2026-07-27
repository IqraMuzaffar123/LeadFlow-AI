import { ProcessingLogEntry } from "@/lib/api";

const LABELS: Record<string, string> = {
    ingest: "Lead Ingested", qualify: "AI Qualification", email_gen: "Email Generation",
    hubspot_sync: "CRM Sync", pipeline: "Pipeline",
};

export function ProcessingLog({ logs }: { logs: ProcessingLogEntry[] }) {
    return (
        <div className="space-y-3">
            {logs.map((l, i) => (
                <div key={l.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                            l.status === "completed" ? "bg-green-500" :
                            l.status === "error" || l.status === "skipped" ? "bg-red-500" :
                            "bg-amber-500 animate-pulse"
                        }`} />
                        {i < logs.length - 1 && <div className="w-0.5 h-6 bg-slate-700 mt-1" />}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                        <div>
                            <span className="font-medium text-[15px] text-slate-200">{LABELS[l.step] || l.step}</span>
                            {l.status === "skipped" && <span className="text-[14px] text-slate-500 ml-2">(skipped)</span>}
                        </div>
                        {l.duration_ms !== null && (
                            <span className="text-[14px] font-mono text-slate-500">
                                {l.duration_ms < 1000 ? `${l.duration_ms}ms` : `${(l.duration_ms / 1000).toFixed(1)}s`}
                            </span>
                        )}
                    </div>
                </div>
            ))}
            {logs.length === 0 && <p className="text-[15px] text-slate-500">No processing logs yet.</p>}
        </div>
    );
}
