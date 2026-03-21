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
    <main className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-2">This week's topic</h1>
      <p className="text-gray-500 mb-6">
        Type or paste what it says on your homework sheet.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border rounded-xl px-4 py-3 h-48 text-base resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="e.g. Place value — include a hundreds, tens and ones chart and show how the same digit can have different values."
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? "Getting ideas..." : "Go! →"}
        </button>
      </form>
    </main>
  );
}
