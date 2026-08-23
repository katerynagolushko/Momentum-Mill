"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface CaseFormValues {
  id: string;
  actor: string;
  person: string;
  stage: string;
  icp: string;
  channel: string;
  approach: string;
  volume: string;
  timeframe: string;
  openRate: string;
  replyRate: string;
  acceptOrPositive: string;
  meetings: string;
  outcome: string;
  verdict: string;
  lesson: string;
  url: string;
  conf: string;
  flag: string;
}

const EMPTY: CaseFormValues = {
  id: "", actor: "", person: "", stage: "", icp: "", channel: "", approach: "",
  volume: "", timeframe: "", openRate: "", replyRate: "", acceptOrPositive: "",
  meetings: "", outcome: "", verdict: "", lesson: "", url: "", conf: "B", flag: "yes",
};

const TEXT_FIELDS: { key: keyof CaseFormValues; label: string; wide?: boolean }[] = [
  { key: "actor", label: "actor" },
  { key: "person", label: "person" },
  { key: "stage", label: "stage" },
  { key: "icp", label: "icp" },
  { key: "channel", label: "channel" },
  { key: "approach", label: "approach", wide: true },
  { key: "volume", label: "volume" },
  { key: "timeframe", label: "timeframe" },
  { key: "openRate", label: "open_rate" },
  { key: "replyRate", label: "reply_rate" },
  { key: "acceptOrPositive", label: "accept_or_positive" },
  { key: "meetings", label: "meetings" },
  { key: "outcome", label: "outcome", wide: true },
  { key: "verdict", label: "verdict" },
  { key: "lesson", label: "lesson", wide: true },
  { key: "url", label: "url", wide: true },
];

export default function CaseForm({ initial, mode }: { initial?: CaseFormValues; mode: "new" | "edit" }) {
  const router = useRouter();
  const [form, setForm] = useState<CaseFormValues>(initial ?? EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof CaseFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { id, ...fields } = form;
    const res =
      mode === "new"
        ? await fetch("/api/admin/cases", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch(`/api/admin/cases/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fields),
          });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Save failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="form-row">
        <label className="field">
          case_id
          <input value={form.id} onChange={set("id")} disabled={mode === "edit"} required placeholder="e.g. PUB-131" />
        </label>
        <label className="field">
          conf
          <select value={form.conf} onChange={set("conf")}>
            <option value="A">A — verified, first-party numbers</option>
            <option value="B">B — verified secondary</option>
            <option value="C">C — quarantine (never cited)</option>
          </select>
        </label>
        <label className="field">
          flag (yes / no / mixed + note)
          <input value={form.flag} onChange={set("flag")} required placeholder='e.g. "mixed - names failed channels"' />
        </label>
      </div>
      <div className="form-row">
        {TEXT_FIELDS.map((f) => (
          <label key={f.key} className="field" style={f.wide ? { gridColumn: "1 / -1" } : undefined}>
            {f.label}
            <input value={form[f.key]} onChange={set(f.key)} />
          </label>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--muted)" }}>
        Blank means the source didn&apos;t state it — leave blanks blank, never estimate. A case
        with no URL cannot be cited regardless of tier.
      </p>
      {error && <p className="error-text">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Saving…" : mode === "new" ? "Add case" : "Save changes"}
      </button>
    </form>
  );
}
