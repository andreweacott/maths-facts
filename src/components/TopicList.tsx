"use client";
import { useState } from "react";

type Topic = { id: number; title: string; createdAt: Date };

const TOPIC_EMOJIS = ["🔢", "📐", "🧮", "📊", "✏️", "🎯", "⭐", "💡"];

export default function TopicList({ topics: initial }: { topics: Topic[] }) {
  const [topics, setTopics] = useState(initial);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setDeleting(id);
    const res = await fetch(`/api/topics/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTopics((prev) => prev.filter((t) => t.id !== id));
    }
    setDeleting(null);
    setConfirm(null);
  }

  if (topics.length === 0) {
    return (
      <div className="card-fun text-center py-10">
        <p className="text-5xl mb-3 animate-float">📚</p>
        <p className="font-bold text-lg text-black">No topics yet — start your first one!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3 stagger-children">
      {topics.map((t, i) => (
        <li key={t.id} className="animate-slide-up">
          <div className="flex items-center gap-3 px-5 py-4 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200 hover:shadow-xl hover:shadow-purple-200/30 transition-all">
            <a
              href={`/chat/${t.id}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <span className="text-2xl">{TOPIC_EMOJIS[i % TOPIC_EMOJIS.length]}</span>
              <span className="font-bold text-black text-base truncate">{t.title}</span>
              <span className="text-xs text-gray-500 font-bold ml-auto whitespace-nowrap">
                {new Date(t.createdAt).toLocaleDateString()}
              </span>
            </a>
            {confirm === t.id ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deleting === t.id}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  {deleting === t.id ? "..." : "Delete"}
                </button>
                <button
                  onClick={() => setConfirm(null)}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirm(t.id)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete topic"
              >
                🗑️
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
