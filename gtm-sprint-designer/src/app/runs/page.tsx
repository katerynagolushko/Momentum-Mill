import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Plan } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const runs = await prisma.run.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header title="My runs" subtitle="Every designed experiment, saved. Record the verdict at day 28." />
      <main className="container">
        <section className="card">
          {runs.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>
              No runs yet. <Link href="/designer">Design your first experiment</Link>.
            </p>
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Designed</th>
                    <th>Product</th>
                    <th>Channel</th>
                    <th>Hypothesis</th>
                    <th>Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => {
                    const plan = JSON.parse(run.outputJson) as Plan;
                    return (
                      <tr key={run.id}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <Link href={`/runs/${run.id}`}>{run.createdAt.toISOString().slice(0, 10)}</Link>
                        </td>
                        <td>{run.product}</td>
                        <td>{run.channel}</td>
                        <td>{plan.hypothesis}</td>
                        <td>
                          <span className={`verdict-pill ${run.verdict ?? "pending"}`}>
                            {run.verdict ?? "pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
