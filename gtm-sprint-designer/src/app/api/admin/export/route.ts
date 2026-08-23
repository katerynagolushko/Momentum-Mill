import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const COLUMNS = [
  "case_id", "actor", "person", "stage", "icp", "channel", "approach", "volume",
  "timeframe", "open_rate", "reply_rate", "accept_or_positive", "meetings",
  "outcome", "verdict", "lesson", "url", "conf", "flag",
] as const;

function csvEscape(v: string): string {
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cases = await prisma.case.findMany({ orderBy: { id: "asc" } });
  const rows = cases.map((c) =>
    [
      c.id, c.actor, c.person, c.stage, c.icp, c.channel, c.approach, c.volume,
      c.timeframe, c.openRate, c.replyRate, c.acceptOrPositive, c.meetings,
      c.outcome, c.verdict, c.lesson, c.url, c.conf, c.flag,
    ].map(csvEscape).join(","),
  );
  const csv = [COLUMNS.join(","), ...rows].join("\n") + "\n";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cases_export_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
