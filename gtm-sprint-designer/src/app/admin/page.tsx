import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import DraftActions from "./DraftActions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const [drafts, cases, citableCount] = await Promise.all([
    prisma.caseDraft.findMany({
      where: { status: "unverified" },
      include: { run: true, user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.case.findMany({ orderBy: { id: "asc" } }),
    prisma.case.count({ where: { conf: { in: ["A", "B"] } } }),
  ]);

  return (
    <>
      <Header
        title="Corpus admin"
        subtitle={`${cases.length} cases · ${citableCount} citable (A/B) · ${cases.length - citableCount} quarantine (C)`}
      />
      <main className="container">
        <section className="card card-lg">
          <div className="kicker">Review queue — founder verdicts</div>
          {drafts.length === 0 ? (
            <p style={{ color: "var(--muted)", marginTop: 8 }}>No unverified drafts waiting.</p>
          ) : (
            <div className="table-wrap" style={{ marginTop: 10 }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Submitted</th>
                    <th>Founder</th>
                    <th>Channel / ICP</th>
                    <th>Verdict</th>
                    <th>Actuals</th>
                    <th>Lesson</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((d) => (
                    <tr key={d.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{d.createdAt.toISOString().slice(0, 10)}</td>
                      <td>{d.user.email}</td>
                      <td>
                        {d.channel}
                        <div style={{ color: "var(--muted)" }}>{d.icp}</div>
                      </td>
                      <td>
                        <span className={`verdict-pill ${d.verdict}`}>{d.verdict}</span>
                      </td>
                      <td>{d.outcome}</td>
                      <td>{d.lesson || "—"}</td>
                      <td>
                        <DraftActions draftId={d.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card card-lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
            <div className="kicker">Corpus</div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/admin/cases/new">
                <button className="btn btn-small btn-ghost" type="button">Add case</button>
              </Link>
              <a href="/api/admin/export">
                <button className="btn btn-small" type="button">Export CSV</button>
              </a>
            </div>
          </div>
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table className="data">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Actor</th>
                  <th>Channel</th>
                  <th>Outcome</th>
                  <th>Conf</th>
                  <th>Flag</th>
                  <th>Origin</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <Link href={`/admin/cases/${c.id}`}>{c.id}</Link>
                    </td>
                    <td>{c.actor}</td>
                    <td>{c.channel}</td>
                    <td>{c.outcome}</td>
                    <td>{c.conf}</td>
                    <td>{c.flagNorm}</td>
                    <td>{c.origin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
