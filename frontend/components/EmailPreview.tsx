import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Email } from "@/lib/api";

export function EmailPreview({ email }: { email: Email }) {
    const label = email.sequence_number === 1 ? "Email 1 (Immediate)" : "Email 2 (Day 3 Follow-up)";
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-semibold mb-2">Subject: {email.subject}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{email.body}</p>
            </CardContent>
        </Card>
    );
}
