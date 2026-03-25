"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import CharacterPanel from "@/components/CharacterPanel";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

type Message = { id: number; role: "user" | "assistant"; content: string };
type Topic = { id: number; title: string; rawInput: string };

export default function ChatPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<{
    characterImagePath: string | null;
    characterName: string;
    profileImagePath: string | null;
    settings: Record<string, string>;
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

  const charPosition = (user?.settings?.characterPosition as "left" | "right") ?? "left";
  const chatBg = user?.settings?.chatBackground;
  const panelBg = user?.settings?.characterPanelBackground ?? "#4f46e5";

  const chatBgStyle = chatBg
    ? { backgroundImage: `url(/backgrounds/${chatBg})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundColor: "#f1f5f9" };

  const reaction = loading ? "thinking" as const : messages.length > 0 ? "celebrating" as const : "waving" as const;

  const panel = (
    <CharacterPanel
      characterImagePath={user?.characterImagePath ?? null}
      characterName={user?.characterName ?? "Mathsie"}
      panelBackground={panelBg}
      reaction={reaction}
    />
  );

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="px-5 py-2.5 bg-white/90 backdrop-blur-sm border-b border-indigo-100 text-sm font-extrabold gradient-text">
        {topic?.title ?? "Loading..."}
      </div>
      <div className="flex flex-1 overflow-hidden">
        {charPosition === "left" && panel}
        <div className="flex-1 flex flex-col overflow-hidden" style={chatBgStyle}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                role={m.role}
                content={m.content}
                characterImagePath={user?.characterImagePath ?? null}
                userProfileImagePath={user?.profileImagePath ?? null}
                characterPosition={charPosition}
              />
            ))}
            {loading && (
              <div className="flex gap-2.5 items-start animate-message-in">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-300 to-purple-400 flex-shrink-0 animate-pulse shadow-sm" />
                <div className="bg-white/95 border border-indigo-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-600 font-medium shadow-md">
                  <span className="inline-flex gap-1">
                    Thinking
                    <span className="animate-bounce" style={{animationDelay: "0ms"}}>.</span>
                    <span className="animate-bounce" style={{animationDelay: "150ms"}}>.</span>
                    <span className="animate-bounce" style={{animationDelay: "300ms"}}>.</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <ChatInput onSend={sendMessage} disabled={loading} />
        </div>
        {charPosition === "right" && panel}
      </div>
    </div>
  );
}
