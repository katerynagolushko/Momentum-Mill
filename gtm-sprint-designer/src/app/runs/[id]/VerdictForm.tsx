"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerdictForm({ runId }: { runId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    verdict: "" as "" | "scale" | "iterate" | "kill",
    actualVolume: "",
    actualReplies: "",
    actualMeetings: "",
    actualNotes: "",
  });
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.verdict) {
      setError("Pick a verdict: the numbers decide, you record.");
      return;
    }
    setError("");
    setStatus("saving");
    const res = await fetch(`/api/runs/${runId}/verdict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save the verdict. Try again.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={submit} className="form-grid" style={{ marginTop: 8 }}>
      <p className="subtitle">
        Read your kill criteria above, then record what actually happened. This becomes an
        unverified case draft in the corpus review queue.
      </p>
      <div className="form-row">
        <label className="field">
          Verdict
          <select
            value={form.verdict}
            onChange={(e) => setForm({ ...form, verdict: e.target.value as typeof form.verdict })}
            required
          >
            <option value="" disabled>
              choose…
            </option>
            <option value="scale">scale — beat the line</option>
            <option value="iterate">iterate — signal, not enough</option>
            <option value="kill">kill — below the line</option>
          </select>
        </label>
        <label className="field">
          Volume sent
          <input
            value={form.actualVolume}
            onChange={(e) => setForm({ ...form, actualVolume: e.target.value })}
            placeholder="e.g. 180 emails"
            required
          />
        </label>
        <label className="field">
          Replies
          <input
            value={form.actualReplies}
            onChange={(e) => setForm({ ...form, actualReplies: e.target.value })}
            placeholder="e.g. 11 (6.1%)"
            required
          />
        </label>
        <label className="field">
          Meetings
          <input
            value={form.actualMeetings}
            onChange={(e) => setForm({ ...form, actualMeetings: e.target.value })}
            placeholder="e.g. 3 booked"
            required
          />
        </label>
      </div>
      <label className="field">
        What did you learn? (optional)
        <textarea
          rows={3}
          value={form.actualNotes}
          onChange={(e) => setForm({ ...form, actualNotes: e.target.value })}
          placeholder="The lesson a future founder should take from this"
        />
      </label>
      {error && <p className="error-text">{error}</p>}
      <button className="btn" type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : "Record verdict"}
      </button>
    </form>
  );
}
