import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
    title: "LeadFlow AI",
    description: "AI-Powered Lead Qualification & Outreach Automation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <body style={{ margin: 0, padding: 0, minHeight: "100vh", display: "flex" }}>
                <Sidebar />
                <main style={{ flex: 1, minHeight: "100vh", overflowX: "hidden" }}>
                    {children}
                </main>
            </body>
        </html>
    );
}
