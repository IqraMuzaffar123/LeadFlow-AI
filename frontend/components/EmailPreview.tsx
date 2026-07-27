import { Card, CardContent } from "@/components/ui/card";
import { Email } from "@/lib/api";

export function EmailPreview({ email }: { email: Email }) {
    const label = email.sequence_number === 1 ? "Email 1 \u2014 Immediate" : "Email 2 \u2014 Day 3 Follow-up";
    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <span className="text-[14px] text-slate-400 font-medium uppercase tracking-wider">{label}</span>
                </div>
                <p className="font-semibold text-slate-200 mb-3 text-[16px]">Subject: {email.subject}</p>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <p className="text-[15px] text-slate-300 whitespace-pre-wrap leading-relaxed">{email.body}</p>
                </div>
            </CardContent>
        </Card>
    );
}
