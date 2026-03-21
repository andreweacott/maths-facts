"use client";
import { useEffect, useState } from "react";
import BackgroundPicker from "@/components/BackgroundPicker";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((u) => setSettings(u?.settings ?? {}));
  }, []);

  async function save(updates: Record<string, string>) {
    const next = { ...settings, ...updates };
    setSettings(next);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="space-y-2">
        <p className="font-medium text-sm">Character position</p>
        <div className="flex gap-2">
          {(["left", "right"] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => save({ characterPosition: pos })}
              className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${
                settings.characterPosition === pos
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {pos === "left" ? "\u2190 Left" : "Right \u2192"}
            </button>
          ))}
        </div>
      </div>

      <BackgroundPicker
        label="Chat background"
        current={settings.chatBackground}
        onSelect={(bg) => save({ chatBackground: bg })}
      />

      <BackgroundPicker
        label="Character panel background"
        current={settings.characterPanelBackground}
        onSelect={(bg) => save({ characterPanelBackground: `/backgrounds/${bg}` })}
      />

      {saved && <p className="text-green-600 text-sm font-medium">Saved!</p>}

      <a href="/" className="block text-center text-indigo-600 text-sm">&larr; Back to home</a>
    </main>
  );
}
