"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "candy" | "space" | "ocean";

type CustomSettings = {
  theme: Theme;
  font: string;
  fontSize: string;
  accentColor: string;
  bubbleStyle: string;
  myBubbleColor: string;
};

const DEFAULTS: CustomSettings = {
  theme: "candy",
  font: "comic-sans",
  fontSize: "medium",
  accentColor: "purple",
  bubbleStyle: "rounded",
  myBubbleColor: "purple",
};

const FONT_MAP: Record<string, string> = {
  "comic-sans": '"Comic Sans MS", "Comic Sans", cursive',
  "rounded": '"Nunito", "Varela Round", sans-serif',
  "handwriting": '"Caveat", "Patrick Hand", cursive',
  "clean": '"Inter", "Segoe UI", sans-serif',
};

const ACCENT_MAP: Record<string, { primary: string; light: string; dark: string }> = {
  purple: { primary: "#8b5cf6", light: "#ede9fe", dark: "#5b21b6" },
  pink: { primary: "#ec4899", light: "#fce7f3", dark: "#9d174d" },
  blue: { primary: "#3b82f6", light: "#dbeafe", dark: "#1e40af" },
  green: { primary: "#10b981", light: "#d1fae5", dark: "#065f46" },
  orange: { primary: "#f97316", light: "#ffedd5", dark: "#9a3412" },
  red: { primary: "#ef4444", light: "#fee2e2", dark: "#991b1b" },
  yellow: { primary: "#eab308", light: "#fef9c3", dark: "#854d0e" },
  teal: { primary: "#14b8a6", light: "#ccfbf1", dark: "#115e59" },
  indigo: { primary: "#6366f1", light: "#e0e7ff", dark: "#3730a3" },
  cyan: { primary: "#06b6d4", light: "#cffafe", dark: "#155e75" },
  lime: { primary: "#84cc16", light: "#ecfccb", dark: "#3f6212" },
  fuchsia: { primary: "#d946ef", light: "#fae8ff", dark: "#86198f" },
  black: { primary: "#1e1b4b", light: "#e0e7ff", dark: "#0f0a2a" },
};

const BUBBLE_MAP: Record<string, { from: string; to: string }> = {
  purple: { from: "#8b5cf6", to: "#6366f1" },
  pink: { from: "#ec4899", to: "#db2777" },
  blue: { from: "#3b82f6", to: "#2563eb" },
  green: { from: "#10b981", to: "#059669" },
  orange: { from: "#f97316", to: "#ea580c" },
  red: { from: "#ef4444", to: "#dc2626" },
  yellow: { from: "#eab308", to: "#ca8a04" },
  teal: { from: "#14b8a6", to: "#0d9488" },
  indigo: { from: "#6366f1", to: "#4f46e5" },
  cyan: { from: "#06b6d4", to: "#0891b2" },
  fuchsia: { from: "#d946ef", to: "#c026d3" },
  black: { from: "#1e1b4b", to: "#0f172a" },
  rainbow: { from: "#ec4899", to: "#6366f1" },
};

const FONT_SIZE_MAP: Record<string, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
  "extra-large": "20px",
};

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  custom: CustomSettings;
  setCustom: (key: string, value: string) => void;
}>({
  theme: "candy",
  setTheme: () => {},
  custom: DEFAULTS,
  setCustom: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyCustomVars(s: CustomSettings) {
  const root = document.documentElement;
  root.setAttribute("data-theme", s.theme);

  const font = FONT_MAP[s.font] || FONT_MAP["comic-sans"];
  root.style.setProperty("--app-font", font);

  const size = FONT_SIZE_MAP[s.fontSize] || FONT_SIZE_MAP["medium"];
  root.style.setProperty("--app-font-size", size);

  const accent = ACCENT_MAP[s.accentColor] || ACCENT_MAP["purple"];
  root.style.setProperty("--accent", accent.primary);
  root.style.setProperty("--accent-light", accent.light);
  root.style.setProperty("--accent-dark", accent.dark);

  const bubble = BUBBLE_MAP[s.myBubbleColor] || BUBBLE_MAP["purple"];
  root.style.setProperty("--bubble-from", bubble.from);
  root.style.setProperty("--bubble-to", bubble.to);

  const radiusMap: Record<string, string> = {
    rounded: "1.25rem", square: "0.5rem", bubbly: "2rem", sharp: "0.25rem", pill: "3rem",
  };
  root.style.setProperty("--bubble-radius", radiusMap[s.bubbleStyle] || "1.25rem");
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [custom, setCustomState] = useState<CustomSettings>(DEFAULTS);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((u) => {
        if (u?.settings) {
          const merged = { ...DEFAULTS, ...u.settings } as CustomSettings;
          setCustomState(merged);
          applyCustomVars(merged);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    applyCustomVars(custom);
  }, [custom]);

  function setTheme(t: Theme) {
    setCustomState((prev) => ({ ...prev, theme: t }));
  }

  function setCustom(key: string, value: string) {
    setCustomState((prev) => {
      const next = { ...prev, [key]: value };
      applyCustomVars(next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme: custom.theme, setTheme, custom, setCustom }}>
      {children}
    </ThemeContext.Provider>
  );
}
