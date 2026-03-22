"use client";
import { useEffect, useState } from "react";
import BackgroundPicker from "@/components/BackgroundPicker";
import { useTheme } from "@/components/ThemeProvider";

const THEMES = [
  { id: "candy", name: "Candy", emoji: "🍬", preview: "linear-gradient(135deg, #a78bfa, #c084fc, #f0abfc)" },
  { id: "space", name: "Space", emoji: "🚀", preview: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" },
  { id: "ocean", name: "Ocean", emoji: "🌊", preview: "linear-gradient(135deg, #0077b6, #00b4d8, #90e0ef)" },
  { id: "sunset", name: "Sunset", emoji: "🌅", preview: "linear-gradient(135deg, #f97316, #ef4444, #ec4899)" },
  { id: "forest", name: "Forest", emoji: "🌲", preview: "linear-gradient(135deg, #065f46, #10b981, #6ee7b7)" },
  { id: "night", name: "Night", emoji: "🌙", preview: "linear-gradient(135deg, #0f172a, #1e293b, #334155)" },
  { id: "bubblegum", name: "Bubblegum", emoji: "🫧", preview: "linear-gradient(135deg, #f472b6, #fb7185, #fda4af)" },
  { id: "golden", name: "Golden", emoji: "✨", preview: "linear-gradient(135deg, #b45309, #d97706, #fbbf24)" },
];

const FONTS = [
  { id: "comic-sans", name: "Comic Sans", preview: "Comic Sans MS" },
  { id: "rounded", name: "Rounded", preview: "Nunito" },
  { id: "handwriting", name: "Handwriting", preview: "Caveat" },
  { id: "clean", name: "Clean", preview: "Inter" },
];

const FONT_SIZES = [
  { id: "small", name: "S", size: "14px" },
  { id: "medium", name: "M", size: "16px" },
  { id: "large", name: "L", size: "18px" },
  { id: "extra-large", name: "XL", size: "20px" },
];

const ACCENT_COLORS = [
  { id: "purple", color: "#8b5cf6" },
  { id: "pink", color: "#ec4899" },
  { id: "blue", color: "#3b82f6" },
  { id: "green", color: "#10b981" },
  { id: "orange", color: "#f97316" },
  { id: "red", color: "#ef4444" },
  { id: "yellow", color: "#eab308" },
  { id: "teal", color: "#14b8a6" },
  { id: "indigo", color: "#6366f1" },
  { id: "cyan", color: "#06b6d4" },
  { id: "lime", color: "#84cc16" },
  { id: "fuchsia", color: "#d946ef" },
  { id: "black", color: "#1e1b4b" },
];

const BUBBLE_COLORS = [
  { id: "purple", from: "#8b5cf6", to: "#6366f1" },
  { id: "pink", from: "#ec4899", to: "#db2777" },
  { id: "blue", from: "#3b82f6", to: "#2563eb" },
  { id: "green", from: "#10b981", to: "#059669" },
  { id: "orange", from: "#f97316", to: "#ea580c" },
  { id: "red", from: "#ef4444", to: "#dc2626" },
  { id: "yellow", from: "#eab308", to: "#ca8a04" },
  { id: "teal", from: "#14b8a6", to: "#0d9488" },
  { id: "indigo", from: "#6366f1", to: "#4f46e5" },
  { id: "cyan", from: "#06b6d4", to: "#0891b2" },
  { id: "fuchsia", from: "#d946ef", to: "#c026d3" },
  { id: "black", from: "#1e1b4b", to: "#0f172a" },
  { id: "rainbow", from: "#ec4899", to: "#6366f1" },
];

const BUBBLE_STYLES = [
  { id: "rounded", name: "Rounded", radius: "1.25rem" },
  { id: "square", name: "Square", radius: "0.5rem" },
  { id: "bubbly", name: "Bubbly", radius: "2rem" },
  { id: "sharp", name: "Sharp", radius: "0.25rem" },
  { id: "pill", name: "Pill", radius: "3rem" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const { setTheme, setCustom } = useTheme();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((u) => setSettings(u?.settings ?? {}));
  }, []);

  async function save(updates: Record<string, string>) {
    const next = { ...settings, ...updates };
    setSettings(next);
    for (const [key, value] of Object.entries(updates)) {
      if (key === "theme") setTheme(value as "candy" | "space" | "ocean");
      else setCustom(key, value);
    }
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const current = (key: string, fallback: string) => settings[key] || fallback;

  return (
    <main className="max-w-2xl mx-auto mt-10 p-2">
      <div className="card-fun animate-slide-up space-y-8">
        <div className="text-center">
          <p className="text-5xl mb-2">&#x2699;&#xFE0F;</p>
          <h1 className="text-4xl font-extrabold gradient-text">Settings</h1>
          <p className="text-[#fbda04] text-lg font-semibold mt-1">Make the app yours!</p>
        </div>

        {/* Theme */}
        <Section title="&#x1F3A8; App theme">
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((t) => (
              <PickerButton key={t.id} selected={current("theme", "candy") === t.id} onClick={() => save({ theme: t.id })}>
                <div className="w-full h-10 rounded-lg mb-1" style={{ background: t.preview }} />
                <p className="text-lg leading-none">{t.emoji}</p>
                <p className="font-extrabold text-xs">{t.name}</p>
              </PickerButton>
            ))}
          </div>
        </Section>

        {/* Font */}
        <Section title="&#x1F524; Font">
          <div className="grid grid-cols-2 gap-3">
            {FONTS.map((f) => (
              <PickerButton key={f.id} selected={current("font", "comic-sans") === f.id} onClick={() => save({ font: f.id })}>
                <p className="text-lg font-bold" style={{ fontFamily: f.preview }}>{f.name}</p>
                <p className="text-base text-[#0011ff]" style={{ fontFamily: f.preview }}>Abc 123</p>
              </PickerButton>
            ))}
          </div>
        </Section>

        {/* Font size */}
        <Section title="&#x1F4CF; Text size">
          <div className="grid grid-cols-4 gap-2">
            {FONT_SIZES.map((s) => (
              <PickerButton key={s.id} selected={current("fontSize", "medium") === s.id} onClick={() => save({ fontSize: s.id })}>
                <p className="font-extrabold" style={{ fontSize: s.size }}>Aa</p>
                <p className="text-base text-[#0011ff]">{s.name}</p>
              </PickerButton>
            ))}
          </div>
        </Section>

        {/* Accent color */}
        <Section title="&#x1F308; Accent colour">
          <div className="grid grid-cols-6 gap-2">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => save({ accentColor: c.id })}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  current("accentColor", "purple") === c.id ? "ring-4 ring-yellow-400 scale-110" : "hover:scale-105"
                }`}
              >
                <div className="w-10 h-10 rounded-full shadow-md" style={{ background: c.color }} />
              </button>
            ))}
          </div>
        </Section>

        {/* Message colour */}
        <Section title="&#x1F4AC; Your message colour">
          <div className="grid grid-cols-6 gap-2">
            {BUBBLE_COLORS.map((b) => (
              <button
                key={b.id}
                onClick={() => save({ myBubbleColor: b.id })}
                className={`rounded-xl p-2 transition-all ${
                  current("myBubbleColor", "purple") === b.id ? "ring-4 ring-yellow-400 scale-110" : "hover:scale-105"
                }`}
              >
                <div
                  className="w-full h-10 rounded-lg shadow-md"
                  style={{ background: `linear-gradient(135deg, ${b.from}, ${b.to})` }}
                />
              </button>
            ))}
          </div>
        </Section>

        {/* Bubble style */}
        <Section title="&#x1F4AD; Bubble shape">
          <div className="grid grid-cols-5 gap-2">
            {BUBBLE_STYLES.map((s) => (
              <PickerButton key={s.id} selected={current("bubbleStyle", "rounded") === s.id} onClick={() => save({ bubbleStyle: s.id })}>
                <div className="w-full h-8 bg-purple-300 mb-1" style={{ borderRadius: s.radius }} />
                <p className="text-xs font-bold">{s.name}</p>
              </PickerButton>
            ))}
          </div>
        </Section>

        {/* Character position */}
        <Section title="&#x1F9D9; Character position">
          <div className="flex gap-3">
            {(["left", "right"] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => save({ characterPosition: pos })}
                className={`flex-1 px-4 py-3 rounded-xl font-extrabold text-base transition-all ${
                  current("characterPosition", "left") === pos ? "btn-fun" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {pos === "left" ? "\u2190 Left" : "Right \u2192"}
              </button>
            ))}
          </div>
        </Section>

        <BackgroundPicker
          label="&#x1F304; Chat background"
          current={settings.chatBackground}
          onSelect={(bg) => save({ chatBackground: bg })}
        />

        <BackgroundPicker
          label="&#x1F3A8; Character panel background"
          current={settings.characterPanelBackground}
          onSelect={(bg) => save({ characterPanelBackground: `/backgrounds/${bg}` })}
        />

        {saved && (
          <p className="text-green-500 text-center font-extrabold text-lg animate-pop-in">&#x2705; Saved!</p>
        )}

        <a href="/" className="block text-center text-pink-500 font-extrabold hover:text-pink-700 transition-colors">&larr; Back to home</a>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="font-extrabold text-purple-700 text-base">{title}</p>
      {children}
    </div>
  );
}

function PickerButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl p-3 text-center transition-all ${
        selected ? "ring-4 ring-yellow-400 shadow-lg scale-105 bg-white" : "ring-2 ring-gray-200 hover:ring-purple-300 bg-white"
      }`}
    >
      {children}
    </button>
  );
}
