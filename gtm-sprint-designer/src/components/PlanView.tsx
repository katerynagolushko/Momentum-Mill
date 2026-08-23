import type { Plan } from "@/lib/schema";
import type { EvidenceCard } from "@/lib/cases";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="plan-row">
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

// The full experiment output: plan card, dark verdict slip, evidence cards.
// Evidence cards come from DB rows only, so quarantined cases can never render.
export default function PlanView({ plan, evidence }: { plan: Plan; evidence: EvidenceCard[] }) {
  const whyById = new Map(plan.cited_cases.map((c) => [c.id, c.why]));
  return (
    <>
      <section className="card card-lg">
        <div className="kicker">The experiment</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "8px 0 16px" }}>{plan.hypothesis}</h2>
        <dl>
          <Row k="ICP, narrowed" v={plan.icp_narrowed} />
          <Row k="Channel" v={plan.channel} />
          <Row k="List source" v={plan.list_source} />
          <Row k="Message angle" v={plan.message_angle} />
          <Row k="Volume" v={plan.volume} />
          <Row k="Success metric" v={plan.success_metric} />
          <Row k="Benchmarks" v={plan.benchmark_context} />
        </dl>
        <div style={{ marginTop: 16 }}>
          {plan.weekly_plan.map((w, i) => (
            <div key={i} className="week-row">
              <div className="week-label">WK {i + 1}</div>
              <div className="week-body">{w}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="verdict-slip">
        <div className="stamp">PRE-REGISTERED</div>
        <div className="kicker">The verdict slip</div>
        <h3>Kill criteria — set now, read at day 28</h3>
        <p className="slip-note">
          If the numbers land below these lines, the experiment dies. No moving goalposts in week 4.
        </p>
        {plan.kill_criteria.map((k, i) => (
          <div key={i} className="kill-criterion">
            {k}
          </div>
        ))}
        {plan.warning_from_failures && (
          <div className="failure-warning">
            <strong>From the failure data: </strong>
            {plan.warning_from_failures}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <div className="section-label">Evidence cards</div>
        <div className="evidence-grid">
          {evidence.map((c) => {
            const failed = c.flagNorm !== "yes";
            return (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className={`evidence-card${failed ? " failure" : ""}`}
              >
                <div className="evidence-head">
                  <span className="evidence-id">{c.id}</span>
                  <span className={`tag${failed ? " failure" : ""}`}>
                    {failed ? "FAILURE" : `TIER ${c.conf}`}
                  </span>
                </div>
                <div className="evidence-actor">{c.actor}</div>
                <div className="evidence-meta">
                  {c.channel}
                  {c.replyRate ? ` · ${c.replyRate} reply` : ""}
                  {c.outcome ? ` · ${c.outcome}` : ""}
                </div>
                <div className="evidence-why">{whyById.get(c.id) ?? c.lesson}</div>
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
