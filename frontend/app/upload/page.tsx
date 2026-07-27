"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CsvUpload } from "@/components/CsvUpload";

export default function UploadPage() {
    const [result, setResult] = useState<{ uploaded: number } | null>(null);
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-8 py-6">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <Link href="/"><Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-[15px]">Back</Button></Link>
                    <h1 className="text-[32px] font-bold text-white">Upload Leads (CSV)</h1>
                </div>
            </div>
            <div className="p-8 max-w-3xl mx-auto space-y-6">
                <CsvUpload onUploadComplete={setResult} />
                {result && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-400 font-medium text-[16px]">Successfully uploaded {result.uploaded} leads!</p>
                        <Link href="/" className="text-[15px] text-green-500 underline mt-1 block">View in dashboard</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
