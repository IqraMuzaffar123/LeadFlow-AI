"use client";
import Link from "next/link";
import { Lead } from "@/lib/api";

const GLASS_CARD: React.CSSProperties = {
    background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.075)",
    boxShadow: "0 4px 22px rgba(0,0,0,0.45)",
    borderRadius: 16,
    overflow: "hidden",
};

function categoryBadge(cat: string | null) {
    if (cat === "hot")
        return (
            <span
                style={{
                    display: "inline-block",
                    padding: "2px 11px",
                    borderRadius: 26,
                    fontSize: 13,
                    fontWeight: 700,
                    background: "rgba(239,68,68,0.15)",
                    color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.3)",
                    boxShadow: "0 0 8px rgba(239,68,68,0.2)",
                    letterSpacing: "0.04em",
                }}
            >
                HOT
            </span>
        );
    if (cat === "warm")
        return (
            <span
                style={{
                    display: "inline-block",
                    padding: "2px 11px",
                    borderRadius: 26,
                    fontSize: 13,
                    fontWeight: 700,
                    background: "rgba(245,158,11,0.15)",
                    color: "#fbbf24",
                    border: "1px solid rgba(245,158,11,0.3)",
                    boxShadow: "0 0 8px rgba(245,158,11,0.2)",
                    letterSpacing: "0.04em",
                }}
            >
                WARM
            </span>
        );
    if (cat === "cold")
        return (
            <span
                style={{
                    display: "inline-block",
                    padding: "2px 11px",
                    borderRadius: 26,
                    fontSize: 13,
                    fontWeight: 700,
                    background: "rgba(59,130,246,0.15)",
                    color: "#60a5fa",
                    border: "1px solid rgba(59,130,246,0.3)",
                    boxShadow: "0 0 8px rgba(59,130,246,0.2)",
                    letterSpacing: "0.04em",
                }}
            >
                COLD
            </span>
        );
    return (
        <span
            style={{
                display: "inline-block",
                padding: "2px 11px",
                borderRadius: 26,
                fontSize: 13,
                color: "#4b5563",
                border: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            --
        </span>
    );
}

function statusBadge(s: string) {
    if (s === "synced") {
        return (
            <span
                style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: 26,
                    fontSize: 13,
                    fontWeight: 600,
                    background: "rgba(16,185,129,0.15)",
                    color: "#34d399",
                    border: "1px solid rgba(16,185,129,0.3)",
                }}
            >
                Synced to CRM
            </span>
        );
    }
    const styles: Record<string, { bg: string; color: string; border: string }> = {
        new:         { bg: "rgba(100,116,139,0.12)", color: "#94a3b8", border: "rgba(100,116,139,0.25)" },
        qualifying:  { bg: "rgba(139,92,246,0.13)",  color: "#c084fc", border: "rgba(139,92,246,0.28)" },
        qualified:   { bg: "rgba(99,102,241,0.13)",  color: "#818cf8", border: "rgba(99,102,241,0.28)" },
        emails_ready:{ bg: "rgba(20,184,166,0.13)",  color: "#2dd4bf", border: "rgba(20,184,166,0.28)" },
        error:       { bg: "rgba(239,68,68,0.13)",   color: "#f87171", border: "rgba(239,68,68,0.28)" },
    };
    const st = styles[s] ?? styles.new;
    return (
        <span
            style={{
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: 26,
                fontSize: 13,
                fontWeight: 600,
                background: st.bg,
                color: st.color,
                border: `1px solid ${st.border}`,
            }}
        >
            {s.replace(/_/g, " ")}
        </span>
    );
}

function scoreBar(score: number | null) {
    if (score === null)
        return <span style={{ color: "#40475a", fontSize: 13 }}>--</span>;

    const gradFrom = score >= 75 ? "#15803d" : score >= 40 ? "#b45309" : "#1d4ed8";
    const gradTo   = score >= 75 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#3b82f6";

    return (
        <div style={{ position: "relative", width: 72, height: 24 }}>
            {/* Track */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    right: 0,
                    height: 6,
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 4,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${score}%`,
                        background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`,
                        borderRadius: 4,
                    }}
                />
            </div>
            {/* Number overlay */}
            <span
                style={{
                    position: "absolute",
                    right: -28,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 14,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "#f4f1e8",
                }}
            >
                {score}
            </span>
        </div>
    );
}

interface LeadTableProps {
    leads: Lead[];
    search: string;
    onSearchChange: (v: string) => void;
    filter: string | null;
    onFilterChange: (v: string | null) => void;
}

export function LeadTable({ leads, search, onSearchChange, filter, onFilterChange }: LeadTableProps) {
    const FILTER_PILLS: { label: string; value: string | null }[] = [
        { label: "ALL", value: null },
        { label: "HOT", value: "hot" },
        { label: "WARM", value: "warm" },
        { label: "COLD", value: "cold" },
        { label: "NEW", value: "new" },
    ];

    const pillColor = (v: string | null) => {
        if (v === "hot")  return { bg: "rgba(239,68,68,0.18)",   color: "#f87171", border: "rgba(239,68,68,0.4)" };
        if (v === "warm") return { bg: "rgba(245,158,11,0.18)",  color: "#fbbf24", border: "rgba(245,158,11,0.4)" };
        if (v === "cold") return { bg: "rgba(59,130,246,0.18)",  color: "#60a5fa", border: "rgba(59,130,246,0.4)" };
        if (v === "new")  return { bg: "rgba(100,116,139,0.18)", color: "#94a3b8", border: "rgba(100,116,139,0.4)" };
        return { bg: "rgba(214,165,68,0.18)", color: "#d6a544", border: "rgba(214,165,68,0.4)" };
    };

    return (
        <div style={GLASS_CARD}>
            {/* Table header controls */}
            <div
                style={{
                    padding: "18px 20px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                {/* Search */}
                <div style={{ position: "relative" }}>
                    <span
                        style={{
                            position: "absolute",
                            left: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#6d7484",
                            pointerEvents: "none",
                        }}
                    >
                        <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search leads..."
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        style={{
                            paddingLeft: 32,
                            paddingRight: 12,
                            paddingTop: 7,
                            paddingBottom: 7,
                            borderRadius: 10,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#f4f1e8",
                            fontSize: 15,
                            outline: "none",
                            width: 200,
                            transition: "border-color 0.15s",
                        }}
                        onFocus={e => (e.target.style.borderColor = "#d6a544")}
                        onBlur={e =>  (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                    />
                </div>

                {/* Filter pills */}
                <div style={{ display: "flex", gap: 6 }}>
                    {FILTER_PILLS.map(p => {
                        const active = filter === p.value;
                        const col = pillColor(p.value);
                        return (
                            <button
                                key={p.label}
                                onClick={() => onFilterChange(p.value)}
                                style={{
                                    padding: "4px 14px",
                                    borderRadius: 26,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                    background: active ? col.bg : "rgba(255,255,255,0.03)",
                                    color: active ? col.color : "#6d7484",
                                    border: active ? `1px solid ${col.border}` : "1px solid rgba(255,255,255,0.07)",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {p.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.055)" }}>
                            {["Name", "Company", "Score", "Category", "Status", "Date"].map(h => (
                                <th
                                    key={h}
                                    style={{
                                        padding: "12px 16px",
                                        textAlign: "left",
                                        fontSize: 12,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.12em",
                                        color: "#6d7484",
                                        fontWeight: 600,
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(l => (
                            <tr
                                key={l.id}
                                style={{ borderBottom: "1px solid rgba(255,255,255,0.038)", transition: "background 0.12s, box-shadow 0.12s" }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)";
                                    (e.currentTarget as HTMLTableRowElement).style.boxShadow = "inset 3px 0 0 #d6a544";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                                    (e.currentTarget as HTMLTableRowElement).style.boxShadow = "none";
                                }}
                            >
                                {/* Name */}
                                <td style={{ padding: "12px 16px" }}>
                                    <Link href={`/leads/${l.id}`} style={{ textDecoration: "none" }}>
                                        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#d6a544" }}>
                                            {l.first_name} {l.last_name}
                                        </p>
                                        {l.job_title && (
                                            <p style={{ margin: 0, fontSize: 13, color: "#6d7484" }}>{l.job_title}</p>
                                        )}
                                    </Link>
                                </td>
                                {/* Company */}
                                <td style={{ padding: "12px 16px", fontSize: 16, color: "#9aa1b0" }}>
                                    {l.company || "\u2014"}
                                </td>
                                {/* Score */}
                                <td style={{ padding: "12px 16px" }}>
                                    <div style={{ paddingRight: 28 }}>{scoreBar(l.ai_score)}</div>
                                </td>
                                {/* Category */}
                                <td style={{ padding: "12px 16px" }}>{categoryBadge(l.ai_category)}</td>
                                {/* Status */}
                                <td style={{ padding: "12px 16px" }}>{statusBadge(l.status)}</td>
                                {/* Date */}
                                <td style={{ padding: "12px 16px", fontSize: 14, fontFamily: "monospace", color: "#6d7484" }}>
                                    {new Date(l.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {leads.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: "60px 16px", textAlign: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                                        <svg width={36} height={36} fill="none" viewBox="0 0 24 24" stroke="#d6a544" strokeWidth={1.5} style={{ opacity: 0.6 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: 18,
                                                fontWeight: 700,
                                                color: "#9aa1b0",
                                                fontFamily: "'Playfair Display', Georgia, serif",
                                            }}
                                        >
                                            No leads found
                                        </p>
                                        <p style={{ margin: 0, fontSize: 16, color: "#6d7484" }}>
                                            Try adjusting your search or filter to find what you&apos;re looking for.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
