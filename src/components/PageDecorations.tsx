"use client";

type Variant = "home" | "chat" | "settings" | "topic";

const ITEMS: Record<Variant, { emoji: string; count: number }> = {
  home: { emoji: "⭐", count: 12 },
  chat: { emoji: "☁️", count: 8 },
  settings: { emoji: "⚙️", count: 10 },
  topic: { emoji: "✏️", count: 10 },
};

export default function PageDecorations({ variant }: { variant: Variant }) {
  const { emoji, count } = ITEMS[variant];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = 12 + Math.random() * 18;
        const size = 16 + Math.random() * 20;
        const startY = -10 - Math.random() * 20;

        return (
          <span
            key={i}
            className="absolute animate-decoration opacity-20"
            style={{
              left: `${left}%`,
              top: `${startY}%`,
              fontSize: `${size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
}
