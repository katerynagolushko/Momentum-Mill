"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DraftActions({ draftId }: { draftId: string }) {
  const router = useRouter();
  const [conf, setConf] = useState<"A" | "B" | "C">("C");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function act(body: object) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/drafts/${draftId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed");
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 6, minWidth: 180 }}>
      <label style={{ fontSize: 11.5, color: "var(--muted)", display: "grid", gap: 3 }}>
        conf tier on approval
        <select value={conf} onChange={(e) => setConf(e.target.value as typeof conf)} disabled={busy}>
          <option value="C">C — unverified (quarantine)</option>
          <option value="B">B — verified</option>
          <option value="A">A — verified, first-party</option>
        </select>
      </label>
      <input
        placeholder="source URL (needed to cite)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={busy}
        style={{ fontSize: 12.5, padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 6 }}
      />
      <div style={{ display: "flex", gap: 6 }}>
        <button
          className="btn btn-small"
          disabled={busy}
          onClick={() => act({ action: "approve", conf, url })}
        >
          Approve
        </button>
        <button className="btn btn-small btn-ghost" disabled={busy} onClick={() => act({ action: "reject" })}>
          Reject
        </button>
      </div>
      {error && <span className="error-text" style={{ fontSize: 12 }}>{error}</span>}
    </div>
  );
}
