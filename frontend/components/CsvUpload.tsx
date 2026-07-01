"use client";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CsvUpload({ onUploadComplete }: { onUploadComplete: (r: { uploaded: number }) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f?.name.endsWith(".csv")) setFile(f);
    }, []);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/leads/upload-csv`,
                { method: "POST", body: fd }
            );
            if (!res.ok) throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
            const data = await res.json();
            setFile(null);
            onUploadComplete(data);
        } catch (err) {
            console.error("CSV upload error:", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                    onClick={() => document.getElementById("csv-input")?.click()}
                >
                    <input id="csv-input" type="file" accept=".csv" className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    {file ? <p className="text-lg font-medium">{file.name}</p> : (
                        <div>
                            <p className="text-lg font-medium text-gray-600">Drop a CSV file here, or click to browse</p>
                            <p className="text-sm text-gray-400 mt-2">Columns: first_name, last_name, email, company, job_title, industry, message</p>
                        </div>
                    )}
                </div>
                {file && (
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleUpload} disabled={uploading}>
                            {uploading ? "Uploading..." : `Upload ${file.name}`}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
