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
    <form onSubmit={handleSubmit} className="flex gap-3 p-4 bg-white/90 backdrop-blur-md border-t-2 border-purple-100">
      <input
        className="flex-1 rounded-full border-3 border-purple-200 px-5 py-3 text-base bg-white text-gray-900 focus:outline-none focus:border-pink-400 focus:shadow-[0_0_0_4px_rgba(236,72,153,0.2)] transition-all"
        placeholder="Ask a question... &#x1F4AC;"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white text-lg flex items-center justify-center disabled:opacity-30 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all"
      >
        &#x27A4;
      </button>
    </form>
  );
}
