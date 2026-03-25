"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "candy" | "ocean" | "sunset" | "forest" | "bubblegum" | "golden" | "arctic" | "rainbow";

type CustomSettings = {
  theme: Theme;
  font: string;
  fontSize: string;
  bubbleStyle: string;
};

const DEFAULTS: CustomSettings = {
  theme: "candy",
  font: "comic-sans",
  fontSize: "medium",
  bubbleStyle: "rounded",
};

const FONT_MAP: Record<string, string> = {
  "comic-sans": '"Comic Sans MS", "Comic Sans", cursive',
  "rounded": '"Nunito", "Varela Round", sans-serif',
  "handwriting": '"Caveat", "Patrick Hand", cursive',
  "clean": '"Inter", "Segoe UI", sans-serif',
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
