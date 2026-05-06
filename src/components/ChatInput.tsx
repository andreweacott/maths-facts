"use client";
import { useState } from "react";

type Props = { onSend: (message: string) => void; disabled: boolean };

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="hs-compose">
      <span className="ic">😊</span>
      <input
        placeholder="Type a message…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="send"
        aria-label="Send"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="m3 11 18-8-8 18-2-7-8-3z" />
        </svg>
      </button>
    </form>
  );
}
