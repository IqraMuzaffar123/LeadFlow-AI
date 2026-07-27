"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    {
        href: "/",
        label: "Dashboard",
        icon: (
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
    },
    {
        href: "/upload",
        label: "Upload CSV",
        icon: (
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v13M7.5 8.5L12 3l4.5 5.5" />
            </svg>
        ),
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            style={{
                width: 220,
                minWidth: 220,
                maxWidth: 220,
                height: "100vh",
                position: "sticky",
                top: 0,
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.012) 40%, rgba(0,0,0,0.25) 100%)",
                backdropFilter: "blur(14px)",
                borderRight: "1px solid rgba(255,255,255,0.07)",
                zIndex: 40,
                flexShrink: 0,
            }}
        >
            {/* Logo */}
            <div style={{ padding: "28px 20px 20px" }}>
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Gold icon */}
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "linear-gradient(135deg, #d6a544 0%, #f4b942 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 2px 12px rgba(214,165,68,0.35)",
                        }}
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>

                    {/* LeadFlow text + AI badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                            style={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#f4f1e8",
                                letterSpacing: "-0.3px",
                                lineHeight: 1,
                            }}
                        >
                            LeadFlow
                        </span>
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#d6a544",
                                background: "rgba(214,165,68,0.14)",
                                border: "1px solid rgba(214,165,68,0.30)",
                                borderRadius: 99,
                                padding: "2px 7px",
                                lineHeight: 1.4,
                                letterSpacing: "0.3px",
                            }}
                        >
                            AI
                        </span>
                    </div>
                </Link>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 16px 12px" }} />

            {/* Nav label */}
            <p
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#6d7484",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "0 20px 8px",
                }}
            >
                Menu
            </p>

            {/* Nav items */}
            <nav style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
                {NAV_ITEMS.map(({ href, label, icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "9px 12px",
                                borderRadius: 10,
                                fontSize: 16,
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? "#d6a544" : "#8b93a3",
                                background: isActive ? "rgba(214,165,68,0.09)" : "transparent",
                                borderLeft: isActive ? "2.5px solid #d6a544" : "2.5px solid transparent",
                                textDecoration: "none",
                                transition: "color 0.18s, background 0.18s, border-color 0.18s",
                                position: "relative",
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLAnchorElement).style.color = "#c8a96e";
                                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLAnchorElement).style.color = "#8b93a3";
                                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                                }
                            }}
                        >
                            <span style={{ color: isActive ? "#d6a544" : "#6d7484", display: "flex", flexShrink: 0 }}>
                                {icon}
                            </span>
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Bottom: Powered by Claude AI */}
            <div
                style={{
                    padding: "16px 20px 24px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                }}
            >
                {/* Sparkle icon */}
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#6d7484" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4.5L12 9l-5.5 1.5L5 15l-1.5-4.5L-2 9l5.5-1.5L5 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
                </svg>
                <span
                    style={{
                        fontSize: 13,
                        color: "#6d7484",
                        fontWeight: 400,
                        letterSpacing: "0.01em",
                    }}
                >
                    Powered by Claude AI
                </span>
            </div>
        </aside>
    );
}
