import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import PlanView from "@/components/PlanView";
import VerdictForm from "./VerdictForm";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { caseForCard } from "@/lib/cases";
import type { Plan } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const run = await prisma.run.findUnique({ where: { id } });
  if (!run || run.userId !== user.id) notFound();

  const plan = JSON.parse(run.outputJson) as Plan;
  const citedIds = JSON.parse(run.citedCaseIds) as string[];
  const cases = await prisma.case.findMany({
    where: { id: { in: citedIds }, conf: { in: ["A", "B"] } },
  });
  const evidence = cases.map(caseForCard);

  return (
    <>
      <Header
        title="Saved run"
        subtitle={`Designed ${run.createdAt.toISOString().slice(0, 10)} · ${run.product} · ${run.stage} · ${run.hoursPerWeek}h/week`}
      />
      <main className="container">
        <PlanView plan={plan} evidence={evidence} />

        <section className="card card-lg">
          <div className="kicker">Day 28</div>
          {run.verdict ? (
            <div style={{ marginTop: 8 }}>
              <p style={{ marginBottom: 10 }}>
                Verdict recorded {run.verdictAt?.toISOString().slice(0, 10)}:{" "}
                <span className={`verdict-pill ${run.verdict}`}>{run.verdict}</span>
              </p>
              <dl>
                <div className="plan-row">
                  <dt>Volume sent</dt>
                  <dd>{run.actualVolume || "—"}</dd>
                </div>
                <div className="plan-row">
                  <dt>Replies</dt>
                  <dd>{run.actualReplies || "—"}</dd>
                </div>
                <div className="plan-row">
                  <dt>Meetings</dt>
                  <dd>{run.actualMeetings || "—"}</dd>
                </div>
                {run.actualNotes && (
                  <div className="plan-row">
                    <dt>Notes</dt>
                    <dd>{run.actualNotes}</dd>
                  </div>
                )}
              </dl>
              <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 10 }}>
                This result is in the corpus review queue as an unverified case draft.
              </p>
            </div>
          ) : (
            <VerdictForm runId={run.id} />
          )}
        </section>
      </main>
    </>
  );
}
