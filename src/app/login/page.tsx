"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/");
        return;
      }
      setError("Invalid username or password");
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="w-stage">
      <div className="w-card">
        <p className="w-eyebrow">Welcome back</p>
        <h1 className="w-h1">Hello <em>again.</em></h1>
        <p className="w-sub">Log in to keep learning with Mathsie.</p>

        <form onSubmit={handleSubmit} className="w-form">
          <div>
            <label className="w-label">Username</label>
            <input
              className="w-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="w-label">Password</label>
            <input
              type="password"
              className="w-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="w-error">{error}</p>}
          <button type="submit" disabled={submitting} className="w-btn-primary">
            {submitting ? "Logging in…" : "Log in"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>

        <p className="w-foot-link">
          New here? <a href="/signup">Sign up</a>
        </p>
      </div>
    </main>
  );
}
