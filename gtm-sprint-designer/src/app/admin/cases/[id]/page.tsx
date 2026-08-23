import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import CaseForm from "../../CaseForm";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) redirect("/login");

  const { id } = await params;
  const c = await prisma.case.findUnique({ where: { id } });
  if (!c) notFound();

  return (
    <>
      <Header title={`Edit ${c.id}`} subtitle={`${c.origin} case · conf ${c.conf}`} />
      <main className="container">
        <section className="card card-lg">
          <CaseForm
            mode="edit"
            initial={{
              id: c.id,
              actor: c.actor,
              person: c.person,
              stage: c.stage,
              icp: c.icp,
              channel: c.channel,
              approach: c.approach,
              volume: c.volume,
              timeframe: c.timeframe,
              openRate: c.openRate,
              replyRate: c.replyRate,
              acceptOrPositive: c.acceptOrPositive,
              meetings: c.meetings,
              outcome: c.outcome,
              verdict: c.verdict,
              lesson: c.lesson,
              url: c.url,
              conf: c.conf,
              flag: c.flag,
            }}
          />
        </section>
      </main>
    </>
  );
}
