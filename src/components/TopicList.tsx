type Topic = { id: number; title: string; createdAt: Date };

const TOPIC_EMOJIS = ["🔢", "📐", "🧮", "📊", "✏️", "🎯", "⭐", "💡"];

export default function TopicList({ topics }: { topics: Topic[] }) {
  if (topics.length === 0) {
    return (
      <div className="card-fun text-center py-10">
        <p className="text-5xl mb-3 animate-float">📚</p>
        <p className="text-purple-500 font-bold text-lg">No topics yet — start your first one!</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3 stagger-children">
      {topics.map((t, i) => (
        <li key={t.id} className="animate-slide-up">
          <a
            href={`/chat/${t.id}`}
            className="flex items-center gap-3 px-5 py-4 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200 hover:border-yellow-400 hover:shadow-xl hover:shadow-purple-200/30 transition-all bounce-hover"
          >
            <span className="text-2xl">{TOPIC_EMOJIS[i % TOPIC_EMOJIS.length]}</span>
            <span className="font-bold text-indigo-700 text-base">{t.title}</span>
            <span className="text-xs text-purple-300 font-bold ml-auto">
              {new Date(t.createdAt).toLocaleDateString()}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
