type Topic = { id: number; title: string; createdAt: Date };

export default function TopicList({ topics }: { topics: Topic[] }) {
  if (topics.length === 0) {
    return (
      <p className="text-gray-400 text-sm">
        No topics yet — start your first one!
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {topics.map((t) => (
        <li key={t.id}>
          <a
            href={`/chat/${t.id}`}
            className="block px-4 py-3 bg-white rounded-lg border hover:border-indigo-400 transition"
          >
            <span className="font-medium">{t.title}</span>
            <span className="text-xs text-gray-400 ml-2">
              {new Date(t.createdAt).toLocaleDateString()}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
