"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTopicPage() {
  const router = useRouter();
  const [rawInput, setRawInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawInput }),
    });
    const { id } = await res.json();
    router.push(`/chat/${id}`);
  }

  return (
    <main className="w-stage">
      <div className="w-card wide">
        <p className="w-eyebrow">A new lesson</p>
        <h1 className="w-h1">What shall we <em>learn</em> today?</h1>
        <p className="w-sub">Type or paste what it says on your homework sheet — Mathsie will turn it into a friendly lesson.</p>

        <form onSubmit={handleSubmit} className="w-form">
          <textarea
            className="w-input"
            style={{ minHeight: 180, resize: "vertical", lineHeight: 1.55 }}
            placeholder="e.g. Place value — include a hundreds, tens and ones chart and show how the same digit can have different values."
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="w-btn-green">
            {loading ? "Getting ideas…" : "Begin lesson"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </div>
    </main>
  );
}
