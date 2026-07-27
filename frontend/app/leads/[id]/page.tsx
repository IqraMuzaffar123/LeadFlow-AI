"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, Lead } from "@/lib/api";
import { EmailPreview } from "@/components/EmailPreview";
import { ProcessingLog } from "@/components/ProcessingLog";

/* ─── design tokens ─────────────────────────────────────── */
const glass: React.CSSProperties = {
    background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.075)",
    boxShadow: "0 4px 22px rgba(0,0,0,0.45)",
    borderRadius: 16,
};

const catMeta = {
    hot: {
        heroGradient: "linear-gradient(135deg, rgba(239,68,68,0.13) 0%, rgba(255,255,255,0.03) 46%)",
        orbColor: "rgba(239,68,68,0.22)",
        badgeBg: "rgba(239,68,68,0.12)",
        badgeBorder: "rgba(239,68,68,0.35)",
        badgeGlow: "0 0 14px rgba(239,68,68,0.35)",
        badgeColor: "#f87171",
        label: "HOT LEAD",
    },
    warm: {
        heroGradient: "linear-gradient(135deg, rgba(245,158,11,0.13) 0%, rgba(255,255,255,0.03) 46%)",
        orbColor: "rgba(245,158,11,0.22)",
        badgeBg: "rgba(245,158,11,0.12)",
        badgeBorder: "rgba(245,158,11,0.35)",
        badgeGlow: "0 0 14px rgba(245,158,11,0.35)",
        badgeColor: "#fbbf24",
        label: "WARM LEAD",
    },
    cold: {
        heroGradient: "linear-gradient(135deg, rgba(59,130,246,0.13) 0%, rgba(255,255,255,0.03) 46%)",
        orbColor: "rgba(59,130,246,0.22)",
        badgeBg: "rgba(59,130,246,0.12)",
        badgeBorder: "rgba(59,130,246,0.35)",
        badgeGlow: "0 0 14px rgba(59,130,246,0.35)",
        badgeColor: "#60a5fa",
        label: "COLD LEAD",
    },
} as const;

type CatKey = keyof typeof catMeta;

export default function LeadDetailPage() {
    const params = useParams();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            apiFetch<Lead>(`/leads/${params.id}`).then(setLead).finally(() => setLoading(false));
        }
    }, [params.id]);

    /* ── loading ── */
    if (loading) return (
        <div style={{
            minHeight: "100vh",
            background: "#0d0f14",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}>
            <div style={{
                width: 36,
                height: 36,
                border: "2px solid rgba(214,165,68,0.3)",
                borderTopColor: "#d6a544",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    /* ── not found ── */
    if (!lead) return (
        <div style={{
            minHeight: "100vh",
            background: "#0d0f14",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
        }}>
            <p style={{ color: "#9aa1b0", fontSize: 18 }}>Lead not found.</p>
            <Link href="/" style={{
                color: "#d6a544",
                fontSize: 15,
                textDecoration: "none",
                border: "1px solid rgba(214,165,68,0.35)",
                borderRadius: 8,
                padding: "8px 18px",
            }}>
                ← Back to dashboard
            </Link>
        </div>
    );

    const cat = lead.ai_category && lead.ai_category in catMeta
        ? catMeta[lead.ai_category as CatKey]
        : catMeta.cold;

    const score = lead.ai_score ?? 0;
    const scoreAngle = Math.round((score / 100) * 360);

    /* extract signals from reasoning (split on ". " or "; ") */
    const signals: string[] = lead.ai_reasoning
        ? lead.ai_reasoning
              .split(/\.\s+|;\s+/)
              .filter((s) => s.trim().length > 10 && s.trim().length < 80)
              .slice(0, 4)
        : [];

    return (
        <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#f4f1e8" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
                @keyframes spin { to { transform: rotate(360deg) } }
                @keyframes breathe {
                    0%, 100% { opacity: 0.55; transform: scale(1); }
                    50%       { opacity: 0.85; transform: scale(1.12); }
                }
                .back-link { color: #79808f; text-decoration: none; font-size: 15px; transition: color 0.2s; }
                .back-link:hover { color: #d6a544; }
                .copy-btn:hover { border-color: rgba(214,165,68,0.5) !important; color: #d6a544 !important; }
                .ext-link { display:inline-flex; align-items:center; gap:6px; font-size:14px; text-decoration:none; transition:opacity 0.2s; }
                .ext-link:hover { opacity: 0.75; }
            `}</style>

            {/* ── PAGE WRAPPER ── */}
            <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 28px 60px" }}>

                {/* ── BACK BUTTON ── */}
                <div style={{ paddingTop: 28, paddingBottom: 20 }}>
                    <Link href="/" className="back-link">← Back to dashboard</Link>
                </div>

                {/* ══ HERO CARD ══ */}
                <div style={{
                    ...glass,
                    position: "relative",
                    overflow: "hidden",
                    padding: "40px 44px",
                    marginBottom: 24,
                }}>
                    {/* category gradient overlay */}
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        background: cat.heroGradient,
                        pointerEvents: "none",
                    }} />

                    {/* breathing glow orb */}
                    <div style={{
                        position: "absolute",
                        top: -100,
                        right: -80,
                        width: 360,
                        height: 360,
                        borderRadius: "50%",
                        background: cat.orbColor,
                        filter: "blur(90px)",
                        animation: "breathe 4s ease-in-out infinite",
                        pointerEvents: "none",
                    }} />

                    <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32 }}>
                        {/* Left: identity */}
                        <div>
                            <p style={{
                                fontSize: 12,
                                textTransform: "uppercase",
                                letterSpacing: "0.15em",
                                color: "#d6a544",
                                marginBottom: 10,
                                fontWeight: 600,
                            }}>
                                Lead Profile
                            </p>
                            <h1 style={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontSize: 32,
                                fontWeight: 700,
                                color: "#fbf9f4",
                                margin: "0 0 8px",
                                lineHeight: 1.2,
                            }}>
                                {lead.first_name} {lead.last_name}
                            </h1>
                            {(lead.job_title || lead.company) && (
                                <p style={{ fontSize: 17, color: "#c3c8d2", margin: "0 0 6px" }}>
                                    {lead.job_title}{lead.company ? ` at ${lead.company}` : ""}
                                </p>
                            )}
                            <p style={{
                                fontSize: 15,
                                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                color: "#868d9c",
                                margin: 0,
                            }}>
                                {lead.email}
                            </p>
                        </div>

                        {/* Right: score circle + badge */}
                        {lead.ai_score !== null && (
                            <div style={{ textAlign: "center", flexShrink: 0 }}>
                                {/* conic-gradient ring */}
                                <div style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: "50%",
                                    background: `conic-gradient(${cat.badgeColor} 0deg ${scoreAngle}deg, rgba(255,255,255,0.08) ${scoreAngle}deg 360deg)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                }}>
                                    {/* inner circle */}
                                    <div style={{
                                        width: 90,
                                        height: 90,
                                        borderRadius: "50%",
                                        background: "#131620",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        <span style={{
                                            fontSize: 30,
                                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                            fontWeight: 700,
                                            color: "#fbf9f4",
                                            lineHeight: 1,
                                        }}>
                                            {lead.ai_score}
                                        </span>
                                    </div>
                                </div>
                                <p style={{ fontSize: 12, color: "#868d9c", margin: "6px 0 10px" }}>/100</p>
                                {/* category badge */}
                                <span style={{
                                    display: "inline-block",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: cat.badgeColor,
                                    background: cat.badgeBg,
                                    border: `1px solid ${cat.badgeBorder}`,
                                    boxShadow: cat.badgeGlow,
                                    borderRadius: 20,
                                    padding: "4px 14px",
                                    letterSpacing: "0.05em",
                                }}>
                                    {cat.label}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ══ ANALYSIS + COMPANY INTELLIGENCE ══ */}
                {(lead.ai_reasoning || lead.enriched_at) && (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: lead.ai_reasoning && lead.enriched_at ? "1.35fr 1fr" : "1fr",
                        gap: 20,
                        marginBottom: 24,
                    }}>
                        {/* AI Analysis */}
                        {lead.ai_reasoning && (
                            <div style={{ ...glass, padding: "28px 30px" }}>
                                {/* icon */}
                                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                                    <div style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 10,
                                        background: "rgba(214,165,68,0.15)",
                                        border: "1px solid rgba(214,165,68,0.3)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}>
                                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#d6a544" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                        </svg>
                                    </div>
                                    <h2 style={{
                                        fontFamily: "'Playfair Display', Georgia, serif",
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: "#f4f1e8",
                                        margin: 0,
                                    }}>
                                        AI analysis
                                    </h2>
                                </div>
                                <p style={{ fontSize: 16, lineHeight: 1.7, color: "#b3bac7", margin: "0 0 18px" }}>
                                    {lead.ai_reasoning}
                                </p>
                                {signals.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {signals.map((sig, i) => (
                                            <span key={i} style={{
                                                fontSize: 14,
                                                color: "#9aa1b0",
                                                background: "rgba(255,255,255,0.04)",
                                                border: "1px solid rgba(255,255,255,0.09)",
                                                borderRadius: 20,
                                                padding: "4px 12px",
                                            }}>
                                                {sig.trim().replace(/\.$/, "")}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Company Intelligence */}
                        {lead.enriched_at && (
                            <div style={{ ...glass, padding: "28px 30px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                                    <div style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 10,
                                        background: "rgba(59,130,246,0.12)",
                                        border: "1px solid rgba(59,130,246,0.25)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}>
                                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                        </svg>
                                    </div>
                                    <h2 style={{
                                        fontFamily: "'Playfair Display', Georgia, serif",
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: "#f4f1e8",
                                        margin: 0,
                                    }}>
                                        Company intelligence
                                    </h2>
                                </div>

                                {/* Key-value rows */}
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {[
                                        { label: "Company Size", value: lead.company_size ? `${lead.company_size} employees` : null },
                                        { label: "Revenue", value: lead.company_revenue },
                                        { label: "Industry", value: lead.company_industry },
                                        { label: "Verified Title", value: lead.person_title },
                                    ].filter((r) => r.value).map((row, i, arr) => (
                                        <div key={row.label}>
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "baseline",
                                                padding: "10px 0",
                                                gap: 12,
                                            }}>
                                                <span style={{ fontSize: 14, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#6d7484", fontWeight: 600 }}>
                                                    {row.label}
                                                </span>
                                                <span style={{ fontSize: 16, color: "#e8e6df", textAlign: "right" as const }}>
                                                    {row.value}
                                                </span>
                                            </div>
                                            {i < arr.length - 1 && (
                                                <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Links */}
                                {(lead.person_linkedin || lead.company_linkedin) && (
                                    <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                                        {lead.person_linkedin && (
                                            <a
                                                href={lead.person_linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ext-link"
                                                style={{
                                                    color: "#60a5fa",
                                                    background: "rgba(59,130,246,0.1)",
                                                    border: "1px solid rgba(59,130,246,0.25)",
                                                    borderRadius: 20,
                                                    padding: "5px 14px",
                                                }}
                                            >
                                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                                LinkedIn
                                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                            </a>
                                        )}
                                        {lead.company_linkedin && (
                                            <a
                                                href={lead.company_linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ext-link"
                                                style={{
                                                    color: "#60a5fa",
                                                    background: "rgba(59,130,246,0.1)",
                                                    border: "1px solid rgba(59,130,246,0.25)",
                                                    borderRadius: 20,
                                                    padding: "5px 14px",
                                                }}
                                            >
                                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                                Company
                                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ══ AIRTABLE SYNC ══ */}
                {lead.airtable_record_id && (
                    <div style={{
                        ...glass,
                        padding: "16px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 24,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span style={{ fontSize: 15, color: "#c3c8d2" }}>Synced to Airtable</span>
                        </div>
                        <span style={{
                            fontSize: 12,
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                            color: "#6d7484",
                        }}>
                            {lead.airtable_record_id}
                        </span>
                    </div>
                )}

                {/* ══ ORIGINAL MESSAGE ══ */}
                {lead.message && (
                    <div style={{ ...glass, padding: "24px 28px", marginBottom: 24 }}>
                        <h2 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#f4f1e8",
                            margin: "0 0 12px",
                        }}>
                            Original message
                        </h2>
                        <p style={{ fontSize: 15, color: "#868d9c", fontStyle: "italic", margin: 0, lineHeight: 1.65 }}>
                            "{lead.message}"
                        </p>
                    </div>
                )}

                {/* ══ GENERATED EMAILS ══ */}
                {lead.emails && lead.emails.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#f4f1e8",
                            margin: "0 0 16px",
                        }}>
                            Generated emails
                        </h2>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: lead.emails.length >= 2 ? "1fr 1fr" : "1fr",
                            gap: 20,
                        }}>
                            {lead.emails.map((e) => <EmailPreview key={e.id} email={e} />)}
                        </div>
                    </div>
                )}

                {/* ══ PROCESSING LOG ══ */}
                {lead.processing_log && lead.processing_log.length > 0 && (
                    <ProcessingLog logs={lead.processing_log} />
                )}
            </div>
        </div>
    );
}
