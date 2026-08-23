"use client";

import { useState } from "react";
import Link from "next/link";
import PlanView from "@/components/PlanView";
import { STAGES, CHANNELS, ACVS } from "@/lib/constants";
import type { Plan } from "@/lib/schema";
import type { EvidenceCard } from "@/lib/cases";

interface Result {
  runId: string;
  plan: Plan;
  evidence: EvidenceCard[];
}

export default function Designer() {
  const [form, setForm] = useState({
    product: "",
    icp: "",
    stage: STAGES[0] as string,
    acv: ACVS[1] as string,
    channel: CHANNELS[0] as string,
    hours: "5",
  });
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function design() {
    if (!form.product.trim() || !form.icp.trim()) {
      setError("Product and ICP are required — the experiment is designed from them.");
      return;
    }
    setError("");
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: form.product,
          icp: form.icp,
          stage: form.stage,
          acv: form.acv,
          channel: form.channel,
          hoursPerWeek: Number(form.hours),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Design failed — run it again.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Design failed — run it again.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <>
      <section className="card">
        <div className="form-grid">
          <label className="field">
            What do you sell? (one line)
            <input
              value={form.product}
              onChange={set("product")}
              placeholder="e.g. quoting SaaS for US metal fabrication shops"
            />
          </label>
          <label className="field">
            Who do you think buys it?
            <input
              value={form.icp}
              onChange={set("icp")}
              placeholder="e.g. ops managers at 10–50 person job shops"
            />
          </label>
          <div className="form-row">
            <label className="field">
              Stage
              <select value={form.stage} onChange={set("stage")}>
                {STAGES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              ACV
              <select value={form.acv} onChange={set("acv")}>
                {ACVS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Channel
              <select value={form.channel} onChange={set("channel")}>
                {CHANNELS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Hours/week
              <input type="number" min={1} max={40} value={form.hours} onChange={set("hours")} />
            </label>
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn" onClick={design} disabled={status === "loading"}>
            {status === "loading" ? "Designing from the corpus…" : "Design my experiment"}
          </button>
        </div>
      </section>

      {result && (
        <>
          <PlanView plan={result.plan} evidence={result.evidence} />
          <section className="card" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, color: "var(--muted)" }}>
              Saved to your workspace. Come back at day 28 to record the verdict.
            </span>
            <Link href={`/runs/${result.runId}`}>
              <button className="btn btn-small btn-ghost">View saved run</button>
            </Link>
          </section>
        </>
      )}
    </>
  );
}
