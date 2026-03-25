"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

  // Character messages take full width, user messages are compact
  if (isCharacter) {
    return (
      <div className="animate-message-in w-full">
        <div
          className="bg-white border-2 border-purple-100 shadow-lg rounded-tl-none px-6 py-4 text-base text-gray-900 space-y-3 overflow-x-auto"
          style={{ borderRadius: `var(--bubble-radius, 1.25rem)` }}
        >
          {parts.map((part, i) => {
            if (part.type === "text") return (
              <div key={i} className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
              </div>
            );
            if (part.type === "diagram") return <DiagramRenderer key={i} diagram={part.diagram} />;
            if (part.type === "imageQuery") return <UnsplashImage key={i} query={part.query} />;
            return null;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 items-start animate-message-in ${isRight ? "flex-row-reverse" : ""}`}>
      <div className="flex-shrink-0 w-10 h-10">
        {userProfileImagePath && (
          <img src={userProfileImagePath} className="w-10 h-10 rounded-full object-cover border-2 border-pink-300 shadow-md" alt="" />
        )}
      </div>
      <div
        className="max-w-[80%] rounded-tr-none px-5 py-3.5 text-base text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, var(--bubble-from, #8b5cf6), var(--bubble-to, #6366f1))`,
          borderRadius: `var(--bubble-radius, 1.25rem)`,
        }}
      >
        {parts.map((part, i) => {
          if (part.type === "text") return <p key={i}>{part.text}</p>;
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

  if (!url) return <div className="h-32 bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 rounded-xl animate-pulse" />;
  return (
    <div className="my-2">
      <p className="text-xl font-extrabold mb-1" style={{ color: 'var(--heading-color)' }}>&#x1F3A8; Inspiration picture</p>
      <img src={url} alt={query} className="rounded-xl w-full max-h-[400px] object-contain shadow-md border-2 border-purple-100" />
    </div>
  );
}
