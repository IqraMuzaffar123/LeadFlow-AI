"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CsvUpload } from "@/components/CsvUpload";

export default function UploadPage() {
    const [result, setResult] = useState<{ uploaded: number } | null>(null);
    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/"><Button variant="outline" size="sm">Back</Button></Link>
                <h1 className="text-2xl font-bold">Upload Leads (CSV)</h1>
            </div>
            <CsvUpload onUploadComplete={setResult} />
            {result && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">Successfully uploaded {result.uploaded} leads!</p>
                    <Link href="/" className="text-sm text-green-600 underline mt-1 block">View in dashboard</Link>
                </div>
            )}
        </div>
    );
}
