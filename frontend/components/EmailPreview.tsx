"use client";
import { useState } from "react";
import { Email } from "@/lib/api";

export function EmailPreview({ email }: { email: Email }) {
    const [copied, setCopied] = useState(false);

    const isFirst = email.sequence_number === 1;
    const title = isFirst ? "Email 1" : "Email 2";
    const badge = isFirst ? "immediate" : "day 3";

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        const text = `Subject: ${email.subject}\n\n${email.body}`;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const glassCard: React.CSSProperties = {
        background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.075)",
        boxShadow: "0 4px 22px rgba(0,0,0,0.45)",
        borderRadius: "14px",
        overflow: "hidden",
    };

    return (
        <div style={glassCard}>
            {/* Header bar */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                {/* Email icon */}
                <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(214,165,68,0.15)",
                    border: "1px solid rgba(214,165,68,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#d6a544" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Title */}
                <span style={{ fontSize: 15, fontWeight: 700, color: "#e8e6df", flex: 1 }}>{title}</span>

                {/* Badge */}
                <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#9aa1b0",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 20,
                    padding: "2px 10px",
                }}>
                    {badge}
                </span>

                {/* Copy button */}
                <button
                    onClick={handleCopy}
                    style={{
                        fontSize: 13,
                        color: copied ? "#d6a544" : "#79808f",
                        background: "transparent",
                        border: copied ? "1px solid rgba(214,165,68,0.4)" : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        padding: "4px 12px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                    }}
                >
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>

            {/* Body */}
            <div style={{ padding: "18px 20px" }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#f2efe6", marginBottom: 12 }}>
                    {email.subject}
                </p>
                <p style={{
                    fontSize: 15,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    color: "#a9b0be",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.75,
                    margin: 0,
                }}>
                    {email.body}
                </p>
            </div>
        </div>
    );
}
