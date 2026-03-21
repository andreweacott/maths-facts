"use client";
import { useEffect, useState } from "react";
import { parseMessageContent } from "@/lib/parseMessage";
import DiagramRenderer from "./DiagramRenderer";

type Props = {
  role: "user" | "assistant";
  content: string;
  characterImagePath: string | null;
  userProfileImagePath: string | null;
  characterPosition: "left" | "right";
};

export default function ChatMessage({
  role,
  content,
  characterImagePath,
  userProfileImagePath,
  characterPosition,
}: Props) {
  const parts = parseMessageContent(content);
  const isCharacter = role === "assistant";
  const isRight = (isCharacter && characterPosition === "right") || (!isCharacter && characterPosition === "left");

  return (
    <div className={`flex gap-2 items-start ${isRight ? "flex-row-reverse" : ""}`}>
      <div className="flex-shrink-0 w-8 h-8">
        {isCharacter && characterImagePath && (
          <img src={characterImagePath} className="w-8 h-8 rounded-full object-cover" alt="" />
        )}
        {!isCharacter && userProfileImagePath && (
          <img src={userProfileImagePath} className="w-8 h-8 rounded-full object-cover" alt="" />
        )}
      </div>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm space-y-2 ${
          isCharacter
            ? "bg-white/90 backdrop-blur rounded-tl-none"
            : "bg-indigo-600 text-white rounded-tr-none"
        } ${isRight ? "rounded-tr-none rounded-tl-2xl" : ""}`}
      >
        {parts.map((part, i) => {
          if (part.type === "text") return <p key={i}>{part.text}</p>;
          if (part.type === "diagram") return <DiagramRenderer key={i} diagram={part.diagram} />;
          if (part.type === "imageQuery") return <UnsplashImage key={i} query={part.query} />;
          return null;
        })}
      </div>
    </div>
  );
}

function UnsplashImage({ query }: { query: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/unsplash?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => setUrl(d.url));
  }, [query]);

  if (!url) return <div className="h-24 bg-gray-100 rounded animate-pulse" />;
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">Inspiration picture</p>
      <img src={url} alt={query} className="rounded-lg w-full max-h-40 object-cover" />
    </div>
  );
}
