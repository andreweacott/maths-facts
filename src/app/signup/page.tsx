"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [characterName, setCharacterName] = useState("Mathsie");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, characterName, inviteCode }),
      });
      if (res.ok) {
        router.push("/setup");
        return;
      }
      let message = `Signup failed (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) message = data.error;
      } catch {}
      setError(message);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="w-stage">
      <div className="w-card">
        <p className="w-eyebrow">Welcome aboard</p>
        <h1 className="w-h1">Let&apos;s get you <em>set up.</em></h1>
        <p className="w-sub">Create an account and pick a name for your maths character.</p>

        <form onSubmit={handleSubmit} className="w-form">
          <div>
            <label className="w-label">Username</label>
            <input
              className="w-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
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

          <div>
            <label className="w-label">Name your maths character</label>
            <input
              className="w-input"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
            <p className="w-help">Pick something cheerful — it&apos;ll be your study partner.</p>
          </div>

          <div>
            <label className="w-label">Invite code</label>
            <div style={{ position: "relative" }}>
              <input
                type={showInviteCode ? "text" : "password"}
                className="w-input"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                style={{ paddingRight: 60 }}
              />
              <button
                type="button"
                onClick={() => setShowInviteCode((v) => !v)}
                aria-label={showInviteCode ? "Hide invite code" : "Show invite code"}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--w-muted)",
                }}
              >
                {showInviteCode ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="w-error">{error}</p>}

          <button type="submit" disabled={submitting} className="w-btn-primary">
            {submitting ? "Creating account…" : "Create account"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>

        <p className="w-foot-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </main>
  );
}
