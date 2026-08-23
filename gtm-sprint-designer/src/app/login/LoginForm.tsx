"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("sending");
    const res = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setStatus("sent");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <p className="ok-text">
        Check your inbox — we sent a sign-in link to <strong>{email}</strong>. It expires in 15
        minutes.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <label className="field">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoFocus
        />
      </label>
      {error && <p className="error-text">{error}</p>}
      <button className="btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
