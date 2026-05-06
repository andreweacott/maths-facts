"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

type Message = { id: number; role: "user" | "assistant"; content: string };
type Topic = { id: number; title: string; rawInput: string };

export default function ChatPage() {
  const router = useRouter();
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<{
    characterImagePath: string | null;
    characterName: string;
    profileImagePath: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialFetchDone = useRef(false);

  useEffect(() => {
    fetch(`/api/chat/${topicId}`)
      .then((r) => r.json())
      .then(({ topic: t, messages: msgs }) => {
        setTopic(t);
        setMessages(msgs);
        if (msgs.length === 0 && !initialFetchDone.current) {
          initialFetchDone.current = true;
          sendInitialMessage();
        }
      });
    fetch("/api/auth/me").then((r) => r.json()).then(setUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendInitialMessage() {
    setLoading(true);
    const res = await fetch(`/api/chat/${topicId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: null }),
    });
    const { content } = await res.json();
    setMessages((prev) => [...prev, { id: Date.now(), role: "assistant", content }]);
    setLoading(false);
  }

  async function sendMessage(text: string) {
    setLoading(true);
    setMessages((prev) => [...prev, { id: Date.now() - 1, role: "user", content: text }]);
    const res = await fetch(`/api/chat/${topicId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: text }),
    });
    const { content } = await res.json();
    setMessages((prev) => [...prev, { id: Date.now(), role: "assistant", content }]);
    setLoading(false);
  }

  const characterName = user?.characterName ?? "Mathsie";

  return (
    <div className="hs-thread" style={{ height: "calc(100vh - 64px)" }}>
      <header className="hs-threadhead">
        <div className="who">
          {user?.characterImagePath ? (
            <img src={user.characterImagePath} alt={characterName} />
          ) : (
            <div className="hs-av hs-av-mathsie" style={{ width: 42, height: 42, fontSize: 16 }}>
              {(characterName || "M").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2>{topic?.title ?? characterName}</h2>
            <div className="status">{characterName} · {loading ? "thinking…" : "online"}</div>
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          style={{
            background: "none",
            border: "1px solid var(--w-rule)",
            color: "var(--w-plum)",
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.04em",
          }}
        >
          ← All lessons
        </button>
      </header>

      <div className="hs-messages">
        <div className="hs-day">{topic ? new Date().toLocaleDateString([], { weekday: "long" }).toUpperCase() : "LOADING"}</div>
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            role={m.role}
            content={m.content}
            characterImagePath={user?.characterImagePath ?? null}
            userProfileImagePath={user?.profileImagePath ?? null}
            characterPosition="left"
          />
        ))}
        {loading && (
          <div className="hs-msg them" style={{ opacity: 0.85 }}>
            <span style={{ display: "inline-flex", gap: 4 }}>
              {characterName} is thinking
              <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}
