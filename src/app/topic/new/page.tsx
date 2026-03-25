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
    <main className="max-w-2xl mx-auto mt-10 p-2">
      <div className="card-fun animate-slide-up space-y-5">
        <div className="text-center">
          <p className="text-5xl mb-2 animate-pop-in">&#x1F4DD;</p>
          <h1 className="text-4xl font-extrabold gradient-text">This week&apos;s topic</h1>
          <p className="font-bold mt-1 text-gray-700">
            Type or paste what it says on your homework sheet
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="input-fun h-48 resize-none"
            placeholder="e.g. Place value — include a hundreds, tens and ones chart and show how the same digit can have different values."
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-fun text-2xl py-5"
          >
            {loading ? "&#x2728; Getting ideas... &#x2728;" : "&#x1F680; Go! &#x1F680;"}
          </button>
        </form>
      </div>
    </main>
  );
}
