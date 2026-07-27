"use client";
import { useState, useCallback } from "react";

const glass: React.CSSProperties = {
    background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.075)",
    boxShadow: "0 4px 22px rgba(0,0,0,0.45)",
    borderRadius: 20,
};

export function CsvUpload({ onUploadComplete }: { onUploadComplete: (r: { uploaded: number }) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        setError(null);
        const f = e.dataTransfer.files[0];
        if (f?.name.endsWith(".csv")) {
            setFile(f);
        } else {
            setError("Only CSV files are accepted.");
        }
    }, []);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/leads/upload-csv`,
                { method: "POST", body: fd }
            );
            if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
            const data = await res.json();
            setFile(null);
            onUploadComplete(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const sizeLabel = file
        ? file.size >= 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${(file.size / 1024).toFixed(1)} KB`
        : "";

    return (
        <div>
            <style>{`
                @keyframes breathe-green {
                    0%, 100% { opacity: 0.45; transform: scale(1); }
                    50%       { opacity: 0.75; transform: scale(1.1); }
                }
                .upload-zone { transition: border-color 0.2s, box-shadow 0.2s; }
                .upload-zone:hover { border-color: rgba(214,165,68,0.5) !important; box-shadow: 0 0 28px rgba(214,165,68,0.12) !important; }
                .upload-btn { transition: opacity 0.2s, transform 0.1s; }
                .upload-btn:hover { opacity: 0.88; }
                .upload-btn:active { transform: scale(0.98); }
            `}</style>

            {/* ── Drop zone (no file) ── */}
            {!file && (
                <div
                    className="upload-zone"
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("csv-input")?.click()}
                    style={{
                        ...glass,
                        borderRadius: 20,
                        border: dragOver
                            ? "2px dashed rgba(214,165,68,0.6)"
                            : "2px dashed rgba(255,255,255,0.1)",
                        boxShadow: dragOver
                            ? "0 0 32px rgba(214,165,68,0.15), 0 4px 22px rgba(0,0,0,0.45)"
                            : "0 4px 22px rgba(0,0,0,0.45)",
                        padding: "64px 40px",
                        textAlign: "center",
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                >
                    <input
                        id="csv-input"
                        type="file"
                        accept=".csv"
                        style={{ display: "none" }}
                        onChange={(e) => { setFile(e.target.files?.[0] || null); setError(null); }}
                    />
                    {/* icon box */}
                    <div style={{
                        width: 66,
                        height: 66,
                        borderRadius: 20,
                        background: dragOver ? "rgba(214,165,68,0.12)" : "rgba(255,255,255,0.05)",
                        border: dragOver ? "1px solid rgba(214,165,68,0.3)" : "1px solid rgba(255,255,255,0.09)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        transition: "background 0.2s, border-color 0.2s",
                    }}>
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke={dragOver ? "#d6a544" : "#79808f"} strokeWidth={1.6}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#e8e6df", margin: "0 0 8px" }}>
                        Drag &amp; drop or click to browse
                    </p>
                    <p style={{ fontSize: 14, color: "#6d7484", margin: 0 }}>
                        CSV files only · up to 10,000 rows
                    </p>
                </div>
            )}

            {/* ── File selected state ── */}
            {file && (
                <div style={{
                    ...glass,
                    padding: "22px 28px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                }}>
                    {/* file icon */}
                    <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: "rgba(34,197,94,0.12)",
                        border: "1px solid rgba(34,197,94,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={1.7}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>

                    {/* filename + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "#e8e6df", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {file.name}
                        </p>
                        <p style={{
                            fontSize: 14,
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                            color: "#79808f",
                            margin: "3px 0 0",
                        }}>
                            {sizeLabel}
                        </p>
                    </div>

                    {/* Remove button */}
                    <button
                        onClick={() => setFile(null)}
                        style={{
                            fontSize: 13,
                            color: "#79808f",
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 8,
                            padding: "6px 14px",
                            cursor: "pointer",
                        }}
                    >
                        Remove
                    </button>

                    {/* Upload button */}
                    <button
                        className="upload-btn"
                        onClick={handleUpload}
                        disabled={uploading}
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#0d0f14",
                            background: uploading
                                ? "rgba(214,165,68,0.5)"
                                : "linear-gradient(135deg, #d6a544 0%, #10b981 100%)",
                            border: "none",
                            borderRadius: 12,
                            padding: "12px 28px",
                            cursor: uploading ? "not-allowed" : "pointer",
                            boxShadow: uploading ? "none" : "0 4px 18px rgba(214,165,68,0.3)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {uploading ? "Uploading..." : "Upload CSV"}
                    </button>
                </div>
            )}

            {/* ── Error ── */}
            {error && (
                <p style={{
                    marginTop: 12,
                    fontSize: 14,
                    color: "#f87171",
                    padding: "10px 16px",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 10,
                }}>
                    {error}
                </p>
            )}
        </div>
    );
}
