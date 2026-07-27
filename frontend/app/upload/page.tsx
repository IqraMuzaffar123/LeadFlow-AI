"use client";
import { useState } from "react";
import Link from "next/link";
import { CsvUpload } from "@/components/CsvUpload";

const glass: React.CSSProperties = {
    background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.075)",
    boxShadow: "0 4px 22px rgba(0,0,0,0.45)",
    borderRadius: 16,
};

export default function UploadPage() {
    const [result, setResult] = useState<{ uploaded: number } | null>(null);

    return (
        <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#f4f1e8" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
                @keyframes breathe-green {
                    0%, 100% { opacity: 0.45; transform: scale(1); }
                    50%       { opacity: 0.75; transform: scale(1.12); }
                }
                .back-link { color: #79808f; text-decoration: none; font-size: 15px; transition: color 0.2s; }
                .back-link:hover { color: #d6a544; }
                .dash-btn { transition: opacity 0.2s, transform 0.1s; }
                .dash-btn:hover { opacity: 0.88; }
                .dash-btn:active { transform: scale(0.98); }
            `}</style>

            <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 28px 60px" }}>

                {/* ── Back ── */}
                <div style={{ paddingTop: 28, paddingBottom: 28 }}>
                    <Link href="/" className="back-link">← Back to dashboard</Link>
                </div>

                {/* ── Header ── */}
                <div style={{ marginBottom: 36 }}>
                    <p style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "#d6a544",
                        fontWeight: 600,
                        margin: "0 0 10px",
                    }}>
                        Bulk Import
                    </p>
                    <h1 style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 32,
                        fontWeight: 700,
                        color: "#fbf9f4",
                        margin: "0 0 10px",
                    }}>
                        Upload leads
                    </h1>
                    <p style={{ fontSize: 17, color: "#8b93a3", margin: 0 }}>
                        Import a CSV file to bulk-process leads through the AI pipeline.
                    </p>
                </div>

                {/* ── Upload zone / file selected (from CsvUpload) ── */}
                {!result && <CsvUpload onUploadComplete={setResult} />}

                {/* ── Success state ── */}
                {result && (
                    <div style={{
                        ...glass,
                        position: "relative",
                        overflow: "hidden",
                        padding: "56px 44px",
                        textAlign: "center",
                    }}>
                        {/* green gradient overlay */}
                        <div style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(255,255,255,0.02) 50%)",
                            pointerEvents: "none",
                        }} />

                        {/* breathing glow orb */}
                        <div style={{
                            position: "absolute",
                            top: -80,
                            right: -60,
                            width: 280,
                            height: 280,
                            borderRadius: "50%",
                            background: "rgba(34,197,94,0.2)",
                            filter: "blur(80px)",
                            animation: "breathe-green 4s ease-in-out infinite",
                            pointerEvents: "none",
                        }} />

                        <div style={{ position: "relative" }}>
                            {/* checkmark circle */}
                            <div style={{
                                width: 72,
                                height: 72,
                                borderRadius: "50%",
                                background: "rgba(34,197,94,0.12)",
                                border: "2px solid rgba(34,197,94,0.35)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 24px",
                                boxShadow: "0 0 24px rgba(34,197,94,0.3)",
                            }}>
                                <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2.2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>

                            <h2 style={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontSize: 24,
                                fontWeight: 700,
                                color: "#f4f1e8",
                                margin: "0 0 10px",
                            }}>
                                {result.uploaded} leads uploaded successfully
                            </h2>
                            <p style={{ fontSize: 16, color: "#8b93a3", margin: "0 0 28px" }}>
                                Your leads are now being processed through the AI pipeline.
                            </p>

                            <Link href="/">
                                <button
                                    className="dash-btn"
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: "#0d0f14",
                                        background: "linear-gradient(135deg, #d6a544 0%, #10b981 100%)",
                                        border: "none",
                                        borderRadius: 12,
                                        padding: "14px 32px",
                                        cursor: "pointer",
                                        boxShadow: "0 4px 18px rgba(214,165,68,0.3)",
                                    }}
                                >
                                    Go to dashboard
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
