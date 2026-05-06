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

  if (isCharacter) {
    return (
      <div className="animate-message-in" style={{ alignSelf: "flex-start", maxWidth: "92%", width: "100%" }}>
        <div
          style={{
            background: "white",
            borderRadius: "14px",
            borderTopLeftRadius: "4px",
            padding: "14px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            color: "#2a2330",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: "15px",
            lineHeight: 1.55,
          }}
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
    <div className="animate-message-in" style={{ alignSelf: "flex-end", display: "flex", gap: 10, alignItems: "flex-start", flexDirection: isRight ? "row-reverse" : "row", maxWidth: "76%" }}>
      {userProfileImagePath && (
        <img
          src={userProfileImagePath}
          alt=""
          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
        />
      )}
      <div
        style={{
          background: "#dff7e1",
          borderRadius: "14px",
          borderTopRightRadius: "4px",
          padding: "10px 14px",
          color: "#2a2330",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontSize: "15px",
          lineHeight: 1.45,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        }}
      >
        {parts.map((part, i) => {
          if (part.type === "text") return <p key={i} style={{ margin: 0 }}>{part.text}</p>;
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
      <p className="text-xl font-extrabold mb-2">🎨 Inspiration picture</p>
      <img src={url} alt={query} className="rounded-xl w-full max-h-[400px] object-contain shadow-md border-2 border-purple-100" />
    </div>
  );
}
