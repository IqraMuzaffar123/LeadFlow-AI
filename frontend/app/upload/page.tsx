"use client";
import { useState } from "react";
import Link from "next/link";
import { CsvUpload } from "@/components/CsvUpload";

export default function UploadPage() {
    const [result, setResult] = useState<{ uploaded: number } | null>(null);
    return (
        <div style={{ minHeight: "100vh" }} className="animate-rise">
            {/* Page header */}
            <div
                style={{
                    padding: "32px 36px 24px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                }}
            >
                <Link
                    href="/"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#9aa1b0",
                        fontSize: 14,
                        fontWeight: 500,
                        textDecoration: "none",
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.04)",
                        transition: "color 0.15s, background 0.15s",
                    }}
                >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
                <div>
                    <h1
                        style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 30,
                            fontWeight: 700,
                            color: "#f4f1e8",
                            margin: 0,
                            lineHeight: 1.2,
                        }}
                    >
                        Upload Leads
                    </h1>
                    <p style={{ color: "#9aa1b0", fontSize: 15, marginTop: 4 }}>
                        Import a CSV file to start qualifying leads with AI
                    </p>
                </div>
            </div>

            <div style={{ padding: "28px 36px", maxWidth: 720 }}>
                <CsvUpload onUploadComplete={setResult} />
                {result && (
                    <div
                        style={{
                            marginTop: 20,
                            padding: "16px 20px",
                            background: "rgba(214,165,68,0.08)",
                            border: "1px solid rgba(214,165,68,0.25)",
                            borderRadius: 12,
                        }}
                    >
                        <p style={{ color: "#d6a544", fontWeight: 600, fontSize: 16, margin: 0 }}>
                            Successfully uploaded {result.uploaded} leads!
                        </p>
                        <Link
                            href="/"
                            style={{
                                display: "inline-block",
                                marginTop: 8,
                                fontSize: 15,
                                color: "#eccb86",
                                textDecoration: "underline",
                            }}
                        >
                            View in dashboard
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
